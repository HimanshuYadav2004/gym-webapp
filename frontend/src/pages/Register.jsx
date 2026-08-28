import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    gymName: '',
    gymAddress: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/register', formData);
      login(response.data.token, response.data.gymOwner);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout wide>
      <h1 className="font-display text-3xl uppercase text-white tracking-wide">Register your gym</h1>
      <p className="text-ink-400 mt-1.5 mb-8">Start managing your gym members efficiently</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="label">Full Name *</label>
            <input
              type="text"
              className="input"
              placeholder="Karanveer Sidhu"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Email Address *</label>
            <input
              type="email"
              className="input"
              placeholder="owner@ironparadise.in"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Phone Number *</label>
            <input
              type="tel"
              className="input"
              placeholder="+91 98765 43210"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Password *</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="label">Gym Name *</label>
            <input
              type="text"
              className="input"
              placeholder="Iron Paradise Gym"
              value={formData.gymName}
              onChange={(e) => setFormData({ ...formData, gymName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Gym Address</label>
            <input
              type="text"
              className="input"
              placeholder="SCO 45, Sector 34-A, Chandigarh"
              value={formData.gymAddress}
              onChange={(e) => setFormData({ ...formData, gymAddress: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary py-3">
          {loading ? 'Creating Account...' : 'Create Account'}
          {!loading && <ArrowRight size={17} />}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-400">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
