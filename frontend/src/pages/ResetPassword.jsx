import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import AuthLayout from '../components/AuthLayout';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { token, newPassword: password });
      toast.success('Password reset — please log in');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center py-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-400 mx-auto mb-5">
            <ShieldAlert size={26} />
          </div>
          <h1 className="font-display text-2xl uppercase text-white tracking-wide">Invalid Link</h1>
          <p className="text-ink-400 mt-3 text-sm">This reset link is missing or malformed.</p>
          <Link to="/forgot-password" className="btn-primary w-full mt-6">
            Request a New Link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="font-display text-3xl uppercase text-white tracking-wide">Reset Password</h1>
      <p className="text-ink-400 mt-1.5 mb-8">Choose a new password for your account</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">New Password</label>
          <div className="relative">
            <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              type="password"
              className="input pl-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              autoFocus
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Confirm Password</label>
          <div className="relative">
            <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              type="password"
              className="input pl-10"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary py-3">
          {loading ? 'Resetting...' : 'Reset Password'}
          {!loading && <ArrowRight size={17} />}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
