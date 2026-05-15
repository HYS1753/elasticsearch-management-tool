'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Users, Edit, Trash2, Shield, Pencil, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin', icon: Shield, color: 'border-red-200 bg-red-50 text-red-700' },
  { value: 'WRITER', label: 'Writer', icon: Pencil, color: 'border-blue-200 bg-blue-50 text-blue-700' },
  { value: 'VIEWER', label: 'Viewer', icon: Eye, color: 'border-slate-200 bg-slate-100 text-slate-600' },
];

function getRoleBadge(role: string) {
  const opt = ROLE_OPTIONS.find(r => r.value === role);
  return opt ? opt.color : 'border-slate-200 bg-slate-100 text-slate-600';
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Create dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('VIEWER');

  // Edit dialog
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('');

  // Delete dialog
  const [deleteUser, setDeleteUser] = useState<any>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.data.items);
        setTotal(data.data.total_count);
      } else {
        toast.error(data.error?.message || 'Failed to fetch users');
      }
    } catch (err) {
      toast.error('An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId || !newPassword || !newName) {
      toast.error('All fields are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: newUserId, password: newPassword, name: newName, role: newRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`User '${newUserId}' created successfully`);
        setIsCreateOpen(false);
        setNewUserId(''); setNewPassword(''); setNewName(''); setNewRole('VIEWER');
        fetchUsers();
      } else {
        toast.error(data.error?.message || 'Failed to create user');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (u: any) => {
    setEditUser(u);
    setEditName(u.name);
    setEditPassword('');
    setEditRole(u.role);
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setIsSubmitting(true);
    try {
      const payload: any = {};
      if (editName && editName !== editUser.name) payload.name = editName;
      if (editPassword) payload.password = editPassword;
      if (editRole && editRole !== editUser.role) payload.role = editRole;

      if (Object.keys(payload).length === 0) {
        toast.info('No changes detected');
        setIsEditOpen(false);
        setIsSubmitting(false);
        return;
      }

      const res = await fetch(`/api/users/${encodeURIComponent(editUser.user_id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`User '${editUser.user_id}' updated successfully`);
        setIsEditOpen(false);
        fetchUsers();
      } else {
        toast.error(data.error?.message || 'Failed to update user');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(deleteUser.user_id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`User '${deleteUser.user_id}' deleted successfully`);
        fetchUsers();
      } else {
        toast.error(data.error?.message || 'Failed to delete user');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setDeleteUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <PageHeader
          title="User Management"
          description="Manage admin users and their roles"
        />

        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Admin Users ({total})</span>
              </div>
              <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 h-10 px-4 rounded-xl">
                <Plus className="h-4 w-4 mr-2" /> Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <Table className="min-w-full text-sm">
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[60px] px-4 py-3 text-slate-600 text-center">No</TableHead>
                    <TableHead className="px-4 py-3 text-slate-600">User ID</TableHead>
                    <TableHead className="px-4 py-3 text-slate-600">Name</TableHead>
                    <TableHead className="px-4 py-3 text-slate-600 text-center">Role</TableHead>
                    <TableHead className="px-4 py-3 text-slate-600">Created At</TableHead>
                    <TableHead className="px-4 py-3 text-slate-600">Updated At</TableHead>
                    <TableHead className="w-[100px] px-4 py-3 text-slate-600 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-slate-500">Loading...</TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-slate-500">No users found.</TableCell>
                    </TableRow>
                  ) : (
                    users.map((u, i) => (
                      <TableRow key={u.user_id} className="hover:bg-slate-50/50">
                        <TableCell className="px-4 py-3 text-center text-slate-500">{i + 1}</TableCell>
                        <TableCell className="px-4 py-3 font-medium text-slate-900">{u.user_id}</TableCell>
                        <TableCell className="px-4 py-3 text-slate-700">{u.name}</TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          <Badge variant="outline" className={getRoleBadge(u.role)}>{u.role}</Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-slate-500 text-xs">{u.created_at_kst}</TableCell>
                        <TableCell className="px-4 py-3 text-slate-500 text-xs">{u.updated_at_kst}</TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(u)} className="h-8 w-8 text-slate-500 hover:text-sky-700 hover:bg-sky-50">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteUser(u)} className="h-8 w-8 text-slate-500 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user with a specific role.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-userId">User ID</Label>
                <Input id="create-userId" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} placeholder="e.g. admin_kim" disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-name">Name</Label>
                <Input id="create-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Minsoo Kim" disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password">Password</Label>
                <Input id="create-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex gap-2">
                  {ROLE_OPTIONS.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setNewRole(r.value)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        newRole === r.value
                          ? 'border-blue-400 bg-blue-50 text-blue-700 ring-2 ring-blue-100'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <r.icon className="h-3.5 w-3.5" />
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User: {editUser?.user_id}</DialogTitle>
              <DialogDescription>Update user information. Leave password empty to keep current.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label>New Password (optional)</Label>
                <Input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Leave empty to keep current" disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex gap-2">
                  {ROLE_OPTIONS.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setEditRole(r.value)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        editRole === r.value
                          ? 'border-blue-400 bg-blue-50 text-blue-700 ring-2 ring-blue-100'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <r.icon className="h-3.5 w-3.5" />
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{deleteUser?.user_id}</strong> ({deleteUser?.name})? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
