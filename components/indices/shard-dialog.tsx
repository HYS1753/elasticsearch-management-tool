'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/dialog';
import { Box } from 'lucide-react';

interface ShardDialogProps {
  shard: any;
  onClose: () => void;
}

export function ShardDialog({ shard, onClose }: ShardDialogProps) {
  if (!shard) return null;

  return (
    <Dialog open={!!shard} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Box className="h-5 w-5 text-blue-600" />
            Shard Information
          </DialogTitle>
          <DialogDescription>
            Detailed information about the selected shard
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-slate-600">Index</div>
                <div className="text-sm font-semibold text-slate-900">{shard.index}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-600">Shard Number</div>
                <div className="text-sm font-semibold text-slate-900">{shard.shard}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-600">Type</div>
                <div>
                  <Badge variant={shard.prirep === 'p' ? 'default' : 'secondary'}>
                    {shard.prirep === 'p' ? 'Primary' : 'Replica'}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-600">State</div>
                <div>
                  <Badge variant={shard.state === 'STARTED' ? 'default' : 'secondary'}>
                    {shard.state}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-600">Node</div>
                <div className="text-sm font-semibold text-slate-900">{shard.node}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-600">Documents</div>
                <div className="text-sm font-semibold text-slate-900">{shard.docs || 'N/A'}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Storage Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-slate-600">Store Size</div>
                <div className="text-sm font-semibold text-slate-900">{shard.store || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-600">IP Address</div>
                <div className="text-sm font-semibold text-slate-900">{shard.ip || 'N/A'}</div>
              </div>
            </CardContent>
          </Card>

          {(shard.unassigned_reason || shard.unassigned_details) && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="text-base text-amber-900">Unassigned Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {shard.unassigned_reason && (
                  <div>
                    <div className="text-sm font-medium text-amber-700">Reason</div>
                    <div className="text-sm text-amber-900">{shard.unassigned_reason}</div>
                  </div>
                )}
                {shard.unassigned_details && (
                  <div>
                    <div className="text-sm font-medium text-amber-700">Details</div>
                    <div className="text-sm text-amber-900">{shard.unassigned_details}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
