'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { Lock, User, ArrowRight, Shield } from 'lucide-react';
import { EnvironmentBadge } from '@/components/layout/environment-badge';

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) {
      toast.error('Please enter both User ID and Password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Welcome back, ${data.user?.name || userId}!`);
        router.push('/');
        router.refresh();
      } else {
        toast.error(data.error || 'Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      toast.error('Connection error. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-950">
        {/* Branding Background Image */}
        <Image
          src="/login_bg.png"
          alt="Branding Background"
          fill
          priority
          className="object-cover"
        />
        
        {/* Sleek Dark Contrast Blur Overlay */}
        <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1.5px]" />
        
        {/* Subtle Vertical Depth Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-slate-950/10 backdrop-blur-sm border border-white/10">
              <Image
                src="/es_logo.png"
                alt="Elasticsearch Logo"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <span className="text-white/90 text-lg font-semibold tracking-tight">Elasticsearch Management</span>
            <EnvironmentBadge />
          </div>

          {/* Center Text */}
          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Manage your search
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">
                infrastructure
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-400 leading-relaxed">
              Monitor clusters, manage indices, configure dictionaries, and explore documents — all in one place.
            </p>
            
            {/* Feature Pills */}
            <div className="mt-8 flex flex-wrap gap-3">
              {['Cluster Monitoring', 'Index Management', 'Dictionary Config', 'Document Explorer'].map((feature) => (
                <span
                  key={feature}
                  className="px-4 py-2 rounded-full text-sm font-medium text-white/70 bg-white/10 dark:bg-slate-950/20 border border-white/10 backdrop-blur-sm"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Elasticsearch Management Tool
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-950 shadow-lg">
              <Image
                src="/es_logo.png"
                alt="Elasticsearch Logo"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <span className="text-slate-900 dark:text-slate-50 text-lg font-semibold">Elasticsearch Management</span>
            <EnvironmentBadge />
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-4">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Admin Console</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Sign in to your account to continue</p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-slate-200/60 bg-white dark:bg-slate-950 shadow-sm shadow-slate-200/50 p-7">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="userId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  User ID
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="userId"
                    type="text"
                    placeholder="Enter your user ID"
                    className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pl-11 pr-4 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 outline-none transition-all focus:border-blue-400 focus:bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-100"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pl-11 pr-4 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 outline-none transition-all focus:border-blue-400 focus:bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-100"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Contact your administrator if you need access
          </p>
        </div>
      </div>
    </div>
  );
}
