import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Map from '../components/Map';
import Loading from '../components/Loading';
import { reportAPI } from '../services/api';
import { REPORT_TYPES } from '../components/ReportForm';

const FILTER_OPTIONS = [{ value: 'ALL', label: 'All' }, ...REPORT_TYPES];

export default function MapPage() {
  const [reports, setReports] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const params = filterType !== 'ALL' ? { type: filterType } : {};
        const { data } = await reportAPI.getAll(params);
        setReports(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchReports();
  }, [filterType]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-4">City Map</h1>
        <p className="text-gray-600 mb-6">
          View all reported dog problems across Bangalore. Click markers for details.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterType(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterType === opt.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <Loading message="Loading map..." />
        ) : (
          <Map reports={reports} filterType={filterType} height="600px" />
        )}

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
          {REPORT_TYPES.map((t) => (
            <span key={t.value} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-gray-400" />
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
