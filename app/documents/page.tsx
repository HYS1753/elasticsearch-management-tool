'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Textarea } from '@/components/textarea';
import { Label } from '@/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/dialog';
import { Search, Plus, Eye, Trash2, Edit, RefreshCw, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { IndexInfo, SearchResponse } from '@/types';

export default function DocumentsPage() {
  const [indices, setIndices] = useState<IndexInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [newDocumentJson, setNewDocumentJson] = useState('{\n  \n}');

  const fetchIndices = async () => {
    try {
      const response = await fetch('/api/indices');
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setIndices(data.data);
        if (!selectedIndex) {
          setSelectedIndex(data.data[0].index);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch indices');
    }
  };

  const fetchDocuments = async () => {
    if (!selectedIndex) return;

    setLoading(true);
    try {
      const response = await fetch('/api/documents/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          index: selectedIndex,
          query: searchQuery
            ? {
                query_string: {
                  query: `*${searchQuery}*`,
                },
              }
            : { match_all: {} },
          size: 20,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDocuments(data.data.hits.hits);
      } else {
        toast.error(data.error?.message || 'Failed to search documents');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to search documents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const parsedData = JSON.parse(newDocumentJson);
      
      const response = await fetch('/api/documents/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          index: selectedIndex,
          document: parsedData,
          refresh: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Document created successfully');
        setNewDocumentJson('{\n  \n}');
        setIsCreateDialogOpen(false);
        fetchDocuments();
      } else {
        toast.error(data.error?.message || 'Failed to create document');
      }
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        toast.error('Invalid JSON format');
      } else {
        toast.error(error.message || 'Failed to create document');
      }
    }
  };

  const handleDeleteDocument = async (docIndex: string, docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/documents/${encodeURIComponent(docIndex)}/${encodeURIComponent(docId)}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Document deleted successfully');
        fetchDocuments();
      } else {
        toast.error(data.error?.message || 'Failed to delete document');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const handleViewDocument = (doc: any) => {
    setSelectedDocument(doc);
    setIsViewDialogOpen(true);
  };

  useEffect(() => {
    fetchIndices();
  }, []);

  useEffect(() => {
    if (selectedIndex) {
      fetchDocuments();
    }
  }, [selectedIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Documents Management</h1>
              <p className="text-slate-600 text-sm">Query and manage documents in your indices</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" disabled={!selectedIndex}>
                  <Plus className="h-4 w-4" />
                  Add Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Document</DialogTitle>
                  <DialogDescription>
                    Add a new document to the selected index
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="doc-index">Index</Label>
                    <Select value={selectedIndex} onValueChange={setSelectedIndex}>
                      <SelectTrigger id="doc-index">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {indices.map((index) => (
                          <SelectItem key={index.uuid} value={index.index}>
                            {index.index}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-json">Document JSON</Label>
                    <Textarea
                      id="doc-json"
                      value={newDocumentJson}
                      onChange={(e) => setNewDocumentJson(e.target.value)}
                      className="font-mono text-sm h-64"
                      placeholder='{\n  "field": "value"\n}'
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDocument}>Create Document</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Search Documents</CardTitle>
            <CardDescription>Search and manage documents in your indices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Select value={selectedIndex} onValueChange={setSelectedIndex}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select index" />
                  </SelectTrigger>
                  <SelectContent>
                    {indices.map((index) => (
                      <SelectItem key={index.uuid} value={index.index}>
                        {index.index}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fetchDocuments();
                      }
                    }}
                    className="pl-9"
                  />
                </div>
                <Button onClick={fetchDocuments} variant="outline" className="gap-2">
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Search
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                  <p className="text-slate-600">Searching documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-600">
                    {selectedIndex ? 'No documents found' : 'Select an index to view documents'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="border rounded-lg p-4 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-slate-600">ID:</span>
                            <code className="text-sm bg-slate-100 px-2 py-0.5 rounded">
                              {doc._id}
                            </code>
                            <span className="text-sm text-slate-600 ml-2">Score:</span>
                            <code className="text-sm bg-slate-100 px-2 py-0.5 rounded">
                              {doc._score?.toFixed(2) || 'N/A'}
                            </code>
                          </div>
                          <div className="bg-slate-50 rounded p-3 border">
                            <pre className="text-sm text-slate-900 overflow-x-auto">
                              {JSON.stringify(doc._source, null, 2)}
                            </pre>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocument(doc)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-red-50"
                            onClick={() => handleDeleteDocument(doc._index, doc._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>View complete document information</DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-slate-600">Document ID:</span>
                  <code className="ml-2 text-sm bg-slate-100 px-2 py-0.5 rounded">
                    {selectedDocument._id}
                  </code>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Index:</span>
                  <code className="ml-2 text-sm bg-slate-100 px-2 py-0.5 rounded">
                    {selectedDocument._index}
                  </code>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Score:</span>
                  <code className="ml-2 text-sm bg-slate-100 px-2 py-0.5 rounded">
                    {selectedDocument._score?.toFixed(2) || 'N/A'}
                  </code>
                </div>
              </div>
              <div className="bg-slate-50 rounded p-4 border">
                <pre className="text-sm text-slate-900 overflow-x-auto">
                  {JSON.stringify(selectedDocument._source, null, 2)}
                </pre>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
