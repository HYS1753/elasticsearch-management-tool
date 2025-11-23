'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IndexListItem } from '@/types/indices-list';

interface ListViewProps {
  data: IndexListItem[];
}

const getHealthColor = (health: string) => {
  switch (health) {
    case 'green': return 'bg-green-100 text-green-800 border-green-300';
    case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'red': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-slate-100 text-slate-800 border-slate-300';
  }
};

export function ListView({ data }: ListViewProps) {
  return (
    <Card className="border-slate-200/60 shadow-sm">
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input type="checkbox" className="rounded" disabled />
              </TableHead>
              <TableHead className="cursor-pointer">Name</TableHead>
              <TableHead className="cursor-pointer text-center">Health</TableHead>
              <TableHead className="cursor-pointer text-center">Status</TableHead>
              <TableHead className="cursor-pointer text-right">Primaries</TableHead>
              <TableHead className="cursor-pointer text-right">Replicas</TableHead>
              <TableHead className="cursor-pointer text-right">Documents count</TableHead>
              <TableHead className="cursor-pointer text-right">Storage size</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                  No indices found
                </TableCell>
              </TableRow>
            ) : (
              data.map((index) => (
                <TableRow key={index.uuid} className="hover:bg-slate-50">
                  <TableCell>
                    <input type="checkbox" className="rounded" />
                  </TableCell>
                  <TableCell>
                    <button className="text-blue-600 hover:underline font-medium text-left">
                      {index.index}
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center justify-center w-16 px-2 py-1 text-xs font-medium rounded border ${getHealthColor(index.health)}`}>
                        {index.health}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={index.status === 'open' ? 'default' : 'secondary'}>
                      {index.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {index.pri || '-'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {index.rep || '-'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {index.docs_count && index.docs_count !== 'null' && index.docs_count !== '' 
                      ? Number(index.docs_count).toLocaleString() 
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {index.store_size && index.store_size !== 'null' && index.store_size !== '' 
                      ? index.store_size 
                      : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
