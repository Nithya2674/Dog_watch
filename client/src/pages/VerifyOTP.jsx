import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyOTP, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber;

  if (!phoneNumber) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(otp)) {
      setError('Enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyOTP(phoneNumber, otp);
      if (data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    try {
      await login(phoneNumber);
      setError('');
      alert('OTP resent! Check server console in development mode.');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="card">
          <h1 className="text-2xl font-bold text-center mb-2">Verify OTP</h1>
          <p className="text-gray-600 text-center mb-6 text-sm">
            Enter the 6-digit OTP sent to +91 {phoneNumber}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full text-center text-primary-600 hover:text-primary-700 text-sm mt-4"
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
}
