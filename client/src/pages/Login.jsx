import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      setError('Enter a valid 10-digit mobile number starting with 6-9');
      return;
    }

    setLoading(true);
    try {
      await login(phoneNumber);
      navigate('/verify-otp', { state: { phoneNumber } });
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="card">
          <h1 className="text-2xl font-bold text-center mb-2">Login</h1>
          <p className="text-gray-600 text-center mb-6 text-sm">
            Enter your mobile number to receive an OTP
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="input-field rounded-l-none"
                  placeholder="9876543210"
                  maxLength={10}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            In development mode, check the server console for the OTP.
          </p>
        </div>
      </div>
    </div>
  );
}
