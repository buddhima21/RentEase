import React from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Search } from 'lucide-react';
export default function NotFound() {
    return (<div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mb-6">
        <Search className="w-10 h-10"/>
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-2">Page Not Found</h1>
      <p className="text-slate-500 max-w-md mx-auto mb-8">
        The page you are looking for might have been moved, deleted, or does not exist.
      </p>
      <Link to="/">
        <Button className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-blue-200">
          Back to Dashboard
        </Button>
      </Link>
    </div>);
}

