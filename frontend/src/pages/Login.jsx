import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', formData);
      login(response.data.token, response.data.gymOwner);
      toast.success('Login successful!');
      navigate(response.data.gymOwner.isSuperAdmin ? '/admin/dashboard' : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="font-display text-3xl uppercase text-white tracking-wide">Welcome back</h1>
      <p className="text-ink-400 mt-1.5 mb-8">Sign in to your gym management dashboard</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Email Address</label>
          <div className="relative">
            <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              type="email"
              className="input pl-10"
              placeholder="owner@ironparadise.in"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label !mb-0">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary-400 hover:text-primary-300">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              type="password"
              className="input pl-10"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary py-3">
          {loading ? 'Signing in...' : 'Sign In'}
          {!loading && <ArrowRight size={17} />}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold">
          Register your gym
        </Link>
      </p>

      <div className="mt-6 pt-6 border-t border-white/10 text-center">
        <p className="text-xs text-ink-500">
          Demo login: <span className="font-medium text-ink-400">karanveer@ironparadise.in</span> / <span className="font-medium text-ink-400">password123</span>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
