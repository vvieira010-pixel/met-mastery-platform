import { useState, useEffect } from 'react';
import { Button } from '../ui/Button.jsx';
import { Icon } from '../shared.jsx';
import { getSupabaseConfig, buildSupabaseHeaders } from '../../lib/supabase-storage.js';

export default function MockTestTeacherDashboard({ onBack }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchResults() {
      const cfg = getSupabaseConfig();
      try {
        // In a real app, we'd filter by the logged-in teacher's ID
        const headers = buildSupabaseHeaders(cfg.anonKey);
        const res = await fetch(`${cfg.url}/rest/v1/mock_test_results?order=created_at.desc`, {
          method: 'GET',
          headers
        });

        if (!res.ok) throw new Error(`Failed to fetch results: ${res.status}`);
        
        const data = await res.json();
        setResults(data);
      } catch (e) {
        console.error('Error fetching mock test results', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading results...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mock Test Results</h1>
          <p className="text-slate-500">Overview of all student mock exam attempts.</p>
        </div>
        <Button variant="ghost" onClick={onBack}>
          <Icon.arrowLeft size={16} /> Back to Dashboard
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 font-semibold text-slate-700">Student ID</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                  No mock test results found.
                </td>
              </tr>
            ) : (
              results.map((result) => (
                <tr key={result.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{result.student_id}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(result.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm" onClick={() => window.alert(JSON.stringify(result.content, null, 2))}>
                      View Details
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
