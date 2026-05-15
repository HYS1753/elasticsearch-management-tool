'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User as UserIcon, Settings, Shield, Pencil, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const ROLE_CONFIG: Record<string, { icon: any; color: string }> = {
  ADMIN: { icon: Shield, color: 'border-red-200 bg-red-50 text-red-700' },
  WRITER: { icon: Pencil, color: 'border-blue-200 bg-blue-50 text-blue-700' },
  VIEWER: { icon: Eye, color: 'border-slate-200 bg-slate-100 text-slate-600' },
};

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<{ user_id: string; name: string; role: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userInfoCookie = document.cookie.split('; ').find(row => row.startsWith('user_info='));
    if (userInfoCookie) {
      try {
        const decoded = decodeURIComponent(userInfoCookie.split('=')[1]);
        setUser(JSON.parse(decoded));
      } catch (e) {
        console.error('Failed to parse user info', e);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  if (!mounted || !user) return null;

  const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG.VIEWER;
  const RoleIcon = roleConf.icon;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
        <div className="bg-blue-100 text-blue-700 p-1 rounded-full">
          <UserIcon className="h-4 w-4" />
        </div>
        <span className="font-medium text-slate-900">{user.name}</span>
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${roleConf.color}`}>
          <RoleIcon className="h-3 w-3 mr-0.5" />
          {user.role}
        </Badge>
      </div>
      {user.role === 'ADMIN' && (
        <Link href="/users">
          <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-blue-600">
            <Settings className="h-4 w-4" />
            Users
          </Button>
        </Link>
      )}
      <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
