import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ReportForm from '../components/ReportForm';
import ProtectedRoute from '../components/ProtectedRoute';
import { reportAPI } from '../services/api';

function CreateReportContent() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState({});
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEdit) {
      reportAPI
        .getById(id)
        .then(({ data }) => setInitialData(data))
        .catch((err) => setError(err.message))
        .finally(() => setFetchLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (isEdit) {
        await reportAPI.update(id, formData);
        setSuccess('Report updated successfully!');
      } else {
        await reportAPI.create(formData);
        setSuccess('Report submitted successfully!');
      }
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {isEdit ? 'Edit Report' : 'Report a Dog Problem'}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <div className="card">
          <ReportForm initialData={initialData} onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default function CreateReport() {
  return (
    <ProtectedRoute>
      <CreateReportContent />
    </ProtectedRoute>
  );
}
