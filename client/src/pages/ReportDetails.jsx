import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import { TYPE_LABELS } from '../components/ReportCard';
import { reportAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reportAPI
      .getById(id)
      .then(({ data }) => setReport(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this report?')) return;
    try {
      await reportAPI.delete(id);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Loading fullScreen message="Loading report..." />;

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-red-600">{error || 'Report not found'}</p>
          <Link to="/dashboard" className="btn-primary mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === report.userId;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 text-sm mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold">
              {TYPE_LABELS[report.type] || report.type}
            </h1>
            <StatusBadge status={report.status} />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1">{report.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Dog Count</h3>
                <p className="mt-1">{report.dogCount}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="mt-1">{new Date(report.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Location</h3>
              <p className="mt-1">{report.address || 'No address provided'}</p>
              <p className="text-sm text-gray-400 mt-1">
                {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          {(isOwner || isAdmin) && (
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Link to={`/reports/${id}/edit`} className="btn-secondary">
                Edit
              </Link>
              <button onClick={handleDelete} className="btn-danger">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
