'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Badge } from '@/components/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/dialog';
import { Label } from '@/components/label';
import { Plus, Trash2, RefreshCw, Search, Database } from 'lucide-react';
import { toast } from 'sonner';
import { formatNumber, getHealthColor } from '@/lib/utils';
import type { IndexInfo } from '@/types';

export default function IndicesPage() {
  const [indices, setIndices] = useState<IndexInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newIndexName, setNewIndexName] = useState('');
  const [newIndexShards, setNewIndexShards] = useState('3');
  const [newIndexReplicas, setNewIndexReplicas] = useState('1');

  const fetchIndices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/indices');
      const data = await response.json();

      if (data.success) {
        setIndices(data.data);
      } else {
        toast.error(data.error?.message || 'Failed to fetch indices');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch indices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIndex = async () => {
    if (!newIndexName.trim()) {
      toast.error('Index name is required');
      return;
    }

    try {
      const response = await fetch('/api/indices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newIndexName,
          settings: {
            number_of_shards: parseInt(newIndexShards),
            number_of_replicas: parseInt(newIndexReplicas),
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Index "${newIndexName}" created successfully`);
        setNewIndexName('');
        setNewIndexShards('3');
        setNewIndexReplicas('1');
        setIsDialogOpen(false);
        fetchIndices();
      } else {
        toast.error(data.error?.message || 'Failed to create index');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create index');
    }
  };

  const handleDeleteIndex = async (indexName: string) => {
    if (!confirm(`Are you sure you want to delete index "${indexName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/indices/${encodeURIComponent(indexName)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Index "${indexName}" deleted successfully`);
        fetchIndices();
      } else {
        toast.error(data.error?.message || 'Failed to delete index');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete index');
    }
  };

  useEffect(() => {
    fetchIndices();
  }, []);

  const filteredIndices = indices.filter((index) =>
    index.index.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Indices Management</h1>
            <p className="text-slate-600 text-sm">Manage your Elasticsearch indices</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Index
              </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Index</DialogTitle>
                  <DialogDescription>
                    Configure your new Elasticsearch index
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="index-name">Index Name</Label>
                    <Input
                      id="index-name"
                      placeholder="e.g., my-index"
                      value={newIndexName}
                      onChange={(e) => setNewIndexName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-shards">Primary Shards</Label>
                      <Input
                        id="primary-shards"
                        type="number"
                        min="1"
                        value={newIndexShards}
                        onChange={(e) => setNewIndexShards(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="replica-shards">Replica Shards</Label>
                      <Input
                        id="replica-shards"
                        type="number"
                        min="0"
                        value={newIndexReplicas}
                        onChange={(e) => setNewIndexReplicas(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateIndex}>Create Index</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

        <Card>
          <CardHeader>
            <CardTitle>All Indices</CardTitle>
            <CardDescription>View and manage all indices in your cluster</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search indices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button onClick={fetchIndices} variant="outline" className="gap-2">
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                  <p className="text-slate-600">Loading indices...</p>
                </div>
              ) : filteredIndices.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-600">
                    {searchTerm ? 'No indices found matching your search' : 'No indices found'}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Index Name</TableHead>
                        <TableHead>Health</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Documents</TableHead>
                        <TableHead className="text-right">Store Size</TableHead>
                        <TableHead>Shards (P/R)</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIndices.map((index) => (
                        <TableRow key={index.uuid}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Database className="h-4 w-4 text-slate-400" />
                              <span className="font-medium">{index.index}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${getHealthColor(
                                  index.health
                                )}`}
                              />
                              <span className="capitalize">{index.health}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {index.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(parseInt(index['docs.count'] || '0'))}
                          </TableCell>
                          <TableCell className="text-right">{index['store.size']}</TableCell>
                          <TableCell>
                            {index.pri} / {index.rep}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 hover:bg-red-50"
                              onClick={() => handleDeleteIndex(index.index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
