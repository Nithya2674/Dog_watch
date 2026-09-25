import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Map from '../components/Map';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import ProtectedRoute from '../components/ProtectedRoute';
import { TYPE_LABELS } from '../components/ReportCard';
import { REPORT_TYPES } from '../components/ReportForm';
import { reportAPI } from '../services/api';

const STATUS_OPTIONS = ['PENDING', 'VERIFIED', 'RESOLVED', 'REJECTED'];

function AdminDashboardContent() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showMap, setShowMap] = useState(false);

  const fetchReports = async () => {
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      const { data } = await reportAPI.getAll(params);
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchReports();
  }, [filterType, filterStatus]);

  const handleStatusChange = async (id, status) => {
    try {
      await reportAPI.update(id, { status });
      fetchReports();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      await reportAPI.delete(id);
      fetchReports();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button onClick={() => setShowMap(!showMap)} className="btn-secondary">
            {showMap ? 'Hide Map' : 'View on Map'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All Types</option>
            {REPORT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {showMap && !loading && (
          <div className="mb-6">
            <Map reports={reports} height="400px" />
          </div>
        )}

        {loading ? (
          <Loading message="Loading reports..." />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 pr-4">Dogs</th>
                  <th className="pb-3 pr-4">Location</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium whitespace-nowrap">
                      {TYPE_LABELS[report.type]}
                    </td>
                    <td className="py-3 pr-4 max-w-xs truncate">{report.description}</td>
                    <td className="py-3 pr-4">{report.dogCount}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      {report.address || `${report.latitude.toFixed(2)}, ${report.longitude.toFixed(2)}`}
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusChange(report.id, e.target.value)}
                        className="text-xs border rounded px-2 py-1"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Link
                          to={`/reports/${report.id}`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reports.length === 0 && (
              <p className="text-center text-gray-500 py-8">No reports found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute adminOnly>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
