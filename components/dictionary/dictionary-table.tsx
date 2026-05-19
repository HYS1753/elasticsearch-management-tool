'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Trash2, Edit, CheckCircle, XCircle, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { DictionaryDialog } from './dictionary-dialog';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { searchDictionary, deleteDictionaryEntry, updateDictionaryEntry } from '@/lib/client-api/dictionary';
import { getUserInfoFromCookie } from '@/lib/client-api/auth';
import type { DictionaryType, DictionaryEntity } from '@/types/dictionary';

interface DictionaryTableProps {
  type: DictionaryType;
  isAdmin?: boolean;
}

export function DictionaryTable({ type, isAdmin }: DictionaryTableProps) {
  const [data, setData] = useState<DictionaryEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('VIEWER');

  // Search & Pagination states
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>('updated_at');
  const [sortOrder, setSortOrder] = useState<number>(-1);
  const [jumpPageInput, setJumpPageInput] = useState<string>('1');

  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.floor(skip / limit) + 1;

  useEffect(() => {
    setJumpPageInput(currentPage.toString());
  }, [currentPage]);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DictionaryEntity | null>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  useEffect(() => {
    const info = getUserInfoFromCookie();
    if (info) setUserRole(info.role);
  }, []);

  const canWrite = userRole === 'ADMIN' || userRole === 'WRITER';
  const canApprove = userRole === 'ADMIN';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchDictionary(type, { keyword, skip, limit, sort_by: sortBy, sort_order: sortOrder });
      setData(res.items);
      setTotal(res.total_count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [type, keyword, skip, limit, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === -1 ? 1 : -1));
    } else {
      setSortBy(field);
      setSortOrder(-1);
    }
    setSkip(0);
  };

  const renderSortableHeader = (label: string, field: string, className = '') => {
    const isSorted = sortBy === field;
    return (
      <TableHead 
        className={`px-4 py-3 font-medium text-slate-600 cursor-pointer select-none hover:text-slate-900 transition-colors ${className}`}
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-1">
          {label}
          {isSorted ? (
            sortOrder === 1 ? (
              <ArrowUp className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            )
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-300 hover:text-slate-400 shrink-0" />
          )}
        </div>
      </TableHead>
    );
  };

  const renderSortableHeaderWithCenter = (label: string, field: string, className = '') => {
    const isSorted = sortBy === field;
    return (
      <TableHead 
        className={`px-4 py-3 font-medium text-slate-600 cursor-pointer select-none hover:text-slate-900 transition-colors ${className}`}
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center justify-center gap-1">
          {label}
          {isSorted ? (
            sortOrder === 1 ? (
              <ArrowUp className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            )
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-300 hover:text-slate-400 shrink-0" />
          )}
        </div>
      </TableHead>
    );
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput);
    setSkip(0);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: DictionaryEntity) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    let key = '';
    if (type === 'user' || type === 'stopword') key = deleteItem.word;
    else if (type === 'decompound') key = deleteItem.compound_word;
    else if (type === 'synonym') key = deleteItem.synonyms[0];
    else if (type === 'correction') key = deleteItem.incorrect;

    try {
      await deleteDictionaryEntry(type, key);
      toast.success('Successfully deleted the entry');
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete: ' + err.message);
    } finally {
      setDeleteItem(null);
    }
  };

  const handleStatusChange = async (item: any, newStatus: 'APPROVED' | 'REJECTED') => {
    let key = '';
    if (type === 'user' || type === 'stopword') key = item.word;
    else if (type === 'decompound') key = item.compound_word;
    else if (type === 'synonym') key = item.synonyms[0];
    else if (type === 'correction') key = item.incorrect;

    try {
      await updateDictionaryEntry(type, key, { status: newStatus });
      toast.success(`Entry ${newStatus.toLowerCase()} successfully`);
      fetchData();
    } catch (err: any) {
      toast.error(`Failed to update status: ${err.message}`);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'border-green-200 bg-green-50 text-green-700';
      case 'APPLIED': return 'border-sky-200 bg-sky-50 text-sky-700';
      case 'REJECTED': return 'border-red-200 bg-red-50 text-red-700';
      case 'DRAFT': return 'border-amber-200 bg-amber-50 text-amber-700';
      default: return 'border-slate-200 bg-slate-100 text-slate-600';
    }
  };

  const renderCells = (item: any) => {
    switch (type) {
      case 'user':
      case 'stopword':
        return <TableCell className="px-4 py-3 font-medium text-slate-900">{item.word}</TableCell>;
      case 'decompound':
        return (
          <>
            <TableCell className="px-4 py-3 font-medium text-slate-900">{item.compound_word}</TableCell>
            <TableCell className="px-4 py-3">
              <div className="flex gap-1 flex-wrap">
                {item.components?.map((c: string, i: number) => <Badge key={i} variant="outline" className="bg-slate-50 text-slate-700">{c}</Badge>)}
              </div>
            </TableCell>
          </>
        );
      case 'synonym':
        return (
          <TableCell className="px-4 py-3">
            <div className="flex gap-1 flex-wrap">
              {item.synonyms?.map((s: string, i: number) => <Badge key={i} variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700">{s}</Badge>)}
            </div>
          </TableCell>
        );
      case 'correction':
        return (
          <>
            <TableCell className="px-4 py-3 text-red-500 line-through decoration-red-300">{item.incorrect}</TableCell>
            <TableCell className="px-4 py-3">
              <div className="flex gap-1 flex-wrap">
                {item.corrected?.map((c: string, i: number) => <Badge key={i} variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">{c}</Badge>)}
              </div>
            </TableCell>
          </>
        );
      default:
        return null;
    }
  };

  const renderHeaders = () => {
    switch (type) {
      case 'user':
      case 'stopword':
        return renderSortableHeader('Word', 'word');
      case 'decompound':
        return (
          <>
            {renderSortableHeader('Compound Word', 'compound_word')}
            <TableHead className="px-4 py-3 font-medium text-slate-600">Components</TableHead>
          </>
        );
      case 'synonym':
        return renderSortableHeader('Synonyms', 'synonyms');
      case 'correction':
        return (
          <>
            {renderSortableHeader('Incorrect', 'incorrect')}
            <TableHead className="px-4 py-3 font-medium text-slate-600">Corrected</TableHead>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex-1 min-w-[260px] max-w-sm">
              <form onSubmit={handleSearch} className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Search keyword..."
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <Button type="submit" variant="secondary" className="absolute right-1.5 h-8">
                  Search
                </Button>
              </form>
            </div>
            
            {canWrite && (
              <div className="flex items-center gap-3">
                <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-xl font-semibold cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" /> Add Entry
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="max-h-[720px] overflow-auto">
              <Table className="min-w-full text-sm">
                <TableHeader className="sticky top-0 z-10 bg-slate-50">
                  <TableRow className="border-b border-slate-200">
                    <TableHead className="w-[60px] px-4 py-3 font-medium text-slate-600 text-center">No</TableHead>
              {renderHeaders()}
              {renderSortableHeaderWithCenter('Status', 'status', 'w-[120px]')}
              {renderSortableHeader('Author', 'author', 'w-[120px]')}
              {renderSortableHeader('Created At', 'created_at', 'w-[180px]')}
              {renderSortableHeader('Updated At', 'updated_at', 'w-[180px]')}
              <TableHead className="w-[140px] px-4 py-3 font-medium text-slate-600 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-500">Loading...</TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-500">No entries found.</TableCell>
              </TableRow>
            ) : (
              data.map((item: any, i: number) => (
                <TableRow key={item.index} className="border-b border-slate-100 transition hover:bg-slate-50/80">
                  <TableCell className="px-4 py-3 text-center text-slate-500">{skip + i + 1}</TableCell>
                  {renderCells(item)}
                  <TableCell className="px-4 py-3 text-center">
                    <Badge variant="outline" className={getStatusBadgeClass(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-slate-600 text-sm">{item.author || '-'}</TableCell>
                  <TableCell className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{item.created_at_kst}</TableCell>
                  <TableCell className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{item.updated_at_kst}</TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {/* ADMIN: Approve/Reject buttons for DRAFT items */}
                      {canApprove && item.status === 'DRAFT' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStatusChange(item, 'APPROVED')}
                            className="h-8 w-8 text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStatusChange(item, 'REJECTED')}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {canWrite && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)} className="h-8 w-8 text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteItem(item)} className="h-8 w-8 text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="mt-6 flex flex-col gap-4 items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex w-full flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <p>
                Showing <span className="font-semibold text-slate-700">{total > 0 ? skip + 1 : 0}</span> to <span className="font-semibold text-slate-700">{Math.min(skip + limit, total)}</span> of <span className="font-semibold text-slate-700">{total}</span> entries
              </p>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Page Size:</span>
                <select
                  className="h-8 w-18 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 cursor-pointer"
                  value={limit}
                  onChange={(e) => {
                    const newLimit = Number(e.target.value);
                    setLimit(newLimit);
                    setSkip(0);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <div className="flex items-center gap-1.5 justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-slate-200 cursor-pointer"
                  disabled={currentPage === 1 || loading}
                  onClick={() => setSkip(0)}
                  title="First Page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-slate-200 cursor-pointer"
                  disabled={currentPage === 1 || loading}
                  onClick={() => setSkip(Math.max(0, (currentPage - 2) * limit))}
                  title="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {(() => {
                  const pageNumbers = [];
                  const maxVisiblePages = 5;
                  let startPage = Math.max(1, currentPage - 2);
                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pageNumbers.push(i);
                  }
                  return pageNumbers.map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className={`h-8 min-w-8 px-2 rounded-lg font-semibold cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      disabled={loading}
                      onClick={() => setSkip((pageNum - 1) * limit)}
                    >
                      {pageNum}
                    </Button>
                  ));
                })()}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-slate-200 cursor-pointer"
                  disabled={currentPage === totalPages || loading}
                  onClick={() => setSkip(currentPage * limit)}
                  title="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-slate-200 cursor-pointer"
                  disabled={currentPage === totalPages || loading}
                  onClick={() => setSkip((totalPages - 1) * limit)}
                  title="Last Page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Go to page:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const page = parseInt(jumpPageInput, 10);
                      if (page >= 1 && page <= totalPages) {
                        setSkip((page - 1) * limit);
                      } else {
                        toast.error(`Invalid page number. Please enter a page between 1 and ${totalPages}`);
                      }
                    }
                  }}
                  placeholder={`${currentPage}`}
                  className="h-8 w-14 rounded-lg border border-slate-200 bg-white text-center text-xs font-semibold text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
                <span className="text-xs text-slate-400 font-medium">/ {totalPages}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 px-2.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer"
                  onClick={() => {
                    const page = parseInt(jumpPageInput, 10);
                    if (page >= 1 && page <= totalPages) {
                      setSkip((page - 1) * limit);
                    } else {
                      toast.error(`Invalid page number. Please enter a page between 1 and ${totalPages}`);
                    }
                  }}
                >
                  Go
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <DictionaryDialog
        type={type}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => {
          fetchData();
          toast.success("Entry saved successfully");
        }}
        initialData={editingItem}
      />

      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will soft-delete the dictionary entry. It will no longer be applied to the search engine.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
