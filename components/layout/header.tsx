import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <div className="border-b border-slate-200/60 bg-white/95 backdrop-blur-lg shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <Link href="/" className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg">
            <Image 
              src="/es_logo.png" 
              alt="Elasticsearch Logo" 
              width={32} 
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-slate-900 text-lg font-semibold tracking-tight">Elasticsearch Management</h1>
            <p className="text-slate-500 text-xs">Manage your search infrastructure</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
