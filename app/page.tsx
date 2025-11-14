import Link from 'next/link';
import { Database, Activity, FileText, BookOpen, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-slate-900 text-xl font-semibold">Elasticsearch Management</h1>
              <p className="text-slate-600 text-sm">Manage your search infrastructure</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="cluster" className="space-y-6">
          <TabsList className="inline-flex h-auto gap-1 bg-white p-1 shadow-sm">
            <TabsTrigger value="cluster" asChild>
              <Link href="/cluster" className="gap-2">
                <Activity className="h-4 w-4" />
                Cluster Info
              </Link>
            </TabsTrigger>
            <TabsTrigger value="indices" asChild>
              <Link href="/indices" className="gap-2">
                <Database className="h-4 w-4" />
                Indices
              </Link>
            </TabsTrigger>
            <TabsTrigger value="documents" asChild>
              <Link href="/documents" className="gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </Link>
            </TabsTrigger>
            <TabsTrigger value="dictionary" asChild>
              <Link href="/dictionary" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Dictionary
              </Link>
            </TabsTrigger>
            <TabsTrigger value="boosting" asChild>
              <Link href="/boosting" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Category Boosting
              </Link>
            </TabsTrigger>
          </TabsList>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="text-center">
              <Database className="mx-auto h-16 w-16 text-slate-300 mb-4" />
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                Welcome to Elasticsearch Management Tool
              </h2>
              <p className="text-slate-600 mb-6">
                Select a tab above to manage your Elasticsearch cluster
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-left">
                <div className="border rounded-lg p-4">
                  <Activity className="h-6 w-6 text-blue-600 mb-2" />
                  <h3 className="font-semibold text-slate-900 mb-1">Cluster Info</h3>
                  <p className="text-sm text-slate-600">
                    Monitor cluster health and node statistics
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <Database className="h-6 w-6 text-blue-600 mb-2" />
                  <h3 className="font-semibold text-slate-900 mb-1">Indices</h3>
                  <p className="text-sm text-slate-600">
                    Create, view, and manage indices
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <FileText className="h-6 w-6 text-blue-600 mb-2" />
                  <h3 className="font-semibold text-slate-900 mb-1">Documents</h3>
                  <p className="text-sm text-slate-600">
                    Search, add, and edit documents
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <BookOpen className="h-6 w-6 text-blue-600 mb-2" />
                  <h3 className="font-semibold text-slate-900 mb-1">Dictionary</h3>
                  <p className="text-sm text-slate-600">
                    Manage search dictionaries
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
