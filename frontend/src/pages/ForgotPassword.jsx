import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import AuthLayout from '../components/AuthLayout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout>
        <div className="text-center py-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 mx-auto mb-5">
            <MailCheck size={26} />
          </div>
          <h1 className="font-display text-2xl uppercase text-white tracking-wide">Check Your Email</h1>
          <p className="text-ink-400 mt-3 text-sm leading-relaxed">
            If <span className="text-white">{email}</span> is registered, a reset link is on its way.
          </p>
          <p className="text-ink-500 mt-4 text-xs">
            No email service is connected in this demo yet — the reset link is printed to the backend server console instead.
          </p>
          <Link to="/login" className="btn-secondary w-full mt-6">
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="font-display text-3xl uppercase text-white tracking-wide">Forgot Password</h1>
      <p className="text-ink-400 mt-1.5 mb-8">Enter your email and we'll send you a reset link</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Email Address</label>
          <div className="relative">
            <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              type="email"
              className="input pl-10"
              placeholder="owner@ironparadise.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary py-3">
          {loading ? 'Sending...' : 'Send Reset Link'}
          {!loading && <ArrowRight size={17} />}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-400">
        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">
          Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPassword;
