import { Database, Activity, FileText, BookOpen, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-8">
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
      </div>
    </div>
  );
}

