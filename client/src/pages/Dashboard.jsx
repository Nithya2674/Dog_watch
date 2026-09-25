import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ReportCard from '../components/ReportCard';
import Loading from '../components/Loading';
import { reportAPI } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, resolved: 0 });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [statsRes, reportsRes] = await Promise.all([
        reportAPI.getStats(),
        reportAPI.getMy(),
      ]);
      setStats(statsRes.data);
      setReports(reportsRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await reportAPI.delete(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Loading fullScreen message="Loading dashboard..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <Link to="/reports/new" className="btn-primary">
            + New Report
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Reports', value: stats.total, color: 'bg-primary-100 text-primary-800' },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-100 text-yellow-800' },
            { label: 'Verified', value: stats.verified, color: 'bg-blue-100 text-blue-800' },
            { label: 'Resolved', value: stats.resolved, color: 'bg-green-100 text-green-800' },
          ].map((stat) => (
            <div key={stat.label} className={`card ${stat.color}`}>
              <p className="text-sm font-medium opacity-80">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold mb-4">My Reports</h2>
        {reports.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">You haven&apos;t submitted any reports yet.</p>
            <Link to="/reports/new" className="btn-primary">
              Create Your First Report
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
