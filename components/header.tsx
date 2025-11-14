import Link from 'next/link';
import { Database } from 'lucide-react';

export function Header() {
  return (
    <div className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <Link href="/" className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-slate-900 text-xl font-semibold">Elasticsearch Management</h1>
            <p className="text-slate-600 text-sm">Manage your search infrastructure</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
