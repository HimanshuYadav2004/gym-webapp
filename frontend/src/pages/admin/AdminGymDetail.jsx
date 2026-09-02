import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, MapPin, Calendar, ShieldCheck, ShieldOff, ShieldPlus, Users, Receipt, Check, X, ChevronRight, Pencil
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { formatINR } from '../../utils/currency';

const AdminGymDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const fetchGym = () => {
    axios
      .get(`/api/super-admin/gyms/${id}`)
      .then((res) => setGym(res.data.gym))
      .catch(() => {
        toast.error('Failed to load gym');
        navigate('/admin/gyms');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGym();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAction = async (action, days) => {
    setActionLoading(true);
    try {
      await axios.patch(`/api/super-admin/gyms/${id}/license`, { action, days });
      toast.success('License updated');
      fetchGym();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update license');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="spinner w-12 h-12" />
    </div>;
  }

  const isExpired = gym.licenseExpiresAt && new Date(gym.licenseExpiresAt) < new Date();
  const isSuspended = gym.licenseStatus === 'suspended';
  const isPending = gym.licenseStatus === 'pending';
  const isRejected = gym.licenseStatus === 'rejected';

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin/gyms')} className="btn-ghost -ml-3">
        <ArrowLeft size={17} />
        Back to All Gyms
      </button>

      {/* Gym Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{gym.gymName}</h1>
              <span className={
                isPending ? 'badge-warning'
                : (isRejected || isSuspended || isExpired) ? 'badge-danger'
                : gym.licenseStatus === 'trial' ? 'badge-info'
                : 'badge-success'
              }>
                {isPending ? 'Pending' : isRejected ? 'Rejected' : isSuspended ? 'Suspended' : isExpired ? 'Expired' : gym.licenseStatus === 'trial' ? 'Trial' : 'Active'}
              </span>
            </div>
            <p className="text-ink-400 mt-1">Owned by {gym.fullName}</p>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center text-sm text-ink-300">
                <Mail size={16} className="mr-2.5 text-ink-500" />
                {gym.email}
              </div>
              <div className="flex items-center text-sm text-ink-300">
                <Phone size={16} className="mr-2.5 text-ink-500" />
                {gym.phoneNumber}
              </div>
              {gym.gymAddress && (
                <div className="flex items-center text-sm text-ink-300">
                  <MapPin size={16} className="mr-2.5 text-ink-500" />
                  {gym.gymAddress}
                </div>
              )}
              <div className="flex items-center text-sm text-ink-300">
                <Calendar size={16} className="mr-2.5 text-ink-500" />
                Joined {format(new Date(gym.createdAt), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* License Management */}
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-5">License</h2>
        <div className="p-5 bg-black/30 border border-white/10 rounded-2xl mb-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Plan</p>
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="text-ink-500 hover:text-white transition-colors"
                  title="Edit pricing"
                >
                  <Pencil size={12} />
                </button>
              </div>
              <p className="font-bold text-white mt-1.5">{gym.licensePlan} — {formatINR(gym.licenseAmount)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Expires</p>
              <p className="font-bold text-white mt-1.5">
                {gym.licenseExpiresAt ? format(new Date(gym.licenseExpiresAt), 'MMM dd, yyyy') : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Lifetime Paid</p>
              <p className="font-bold text-primary-400 mt-1.5">
                {formatINR(gym.licensePayments.reduce((s, p) => s + parseFloat(p.amount), 0))}
              </p>
            </div>
          </div>
        </div>

        {isPending ? (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleAction('approve')} disabled={actionLoading} className="btn-primary text-sm">
              <Check size={16} />
              Approve Gym
            </button>
            <button onClick={() => handleAction('reject')} disabled={actionLoading} className="btn-danger text-sm">
              <X size={16} />
              Reject
            </button>
          </div>
        ) : isRejected ? (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleAction('approve')} disabled={actionLoading} className="btn-primary text-sm">
              <Check size={16} />
              Approve Anyway
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleAction('extend', 30)} disabled={actionLoading} className="btn-primary text-sm">
              <ShieldPlus size={16} />
              Extend 30 Days
            </button>
            {!isSuspended ? (
              <button onClick={() => handleAction('suspend')} disabled={actionLoading} className="btn-danger text-sm">
                <ShieldOff size={16} />
                Suspend Access
              </button>
            ) : (
              <button onClick={() => handleAction('activate')} disabled={actionLoading} className="btn-secondary text-sm">
                <ShieldCheck size={16} />
                Reactivate
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Members</h2>
            <span className="badge-neutral">{gym.members.length}</span>
          </div>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {gym.members.length > 0 ? (
              gym.members.map((m) => (
                <Link
                  key={m.id}
                  to={`/admin/members/${m.id}`}
                  className="flex items-center gap-3 p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  {m.photoUrl ? (
                    <img src={m.photoUrl} alt={m.fullName} className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="avatar-fallback w-9 h-9 text-xs">{m.fullName.charAt(0)}</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white text-sm truncate">{m.fullName}</p>
                    <p className="text-xs text-ink-500">{m.membershipId}</p>
                  </div>
                  <span className={m.isActive ? 'badge-success' : 'badge-neutral'}>
                    {m.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <ChevronRight size={15} className="text-ink-600 shrink-0" />
                </Link>
              ))
            ) : (
              <div className="text-center py-10">
                <Users className="mx-auto text-ink-600 mb-2" size={24} />
                <p className="text-ink-400 text-sm">No members yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-5">License Payment History</h2>
          <div className="space-y-1">
            {gym.licensePayments.length > 0 ? (
              gym.licensePayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
                      <Receipt size={15} />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{formatINR(p.amount)}</p>
                      <p className="text-xs text-ink-500">{format(new Date(p.paidAt), 'MMM dd, yyyy hh:mm a')}</p>
                    </div>
                  </div>
                  <span className="text-xs text-ink-400">{p.periodDays} days</span>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <Receipt className="mx-auto text-ink-600 mb-2" size={24} />
                <p className="text-ink-400 text-sm">No payments recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPricingModal && (
        <PricingModal
          gym={gym}
          onClose={() => setShowPricingModal(false)}
          onSuccess={fetchGym}
        />
      )}
    </div>
  );
};

// Pricing Modal — lets a super admin set a custom monthly licence price
// per gym (e.g. a premium/negotiated rate) instead of the platform default.
const PricingModal = ({ gym, onClose, onSuccess }) => {
  const [licensePlan, setLicensePlan] = useState(gym.licensePlan);
  const [licenseAmount, setLicenseAmount] = useState(String(gym.licenseAmount));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.patch(`/api/super-admin/gyms/${gym.id}/pricing`, { licensePlan, licenseAmount });
      toast.success('Pricing updated');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update pricing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Edit Pricing</h3>
          <button onClick={onClose} className="text-ink-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Plan Name</label>
            <input
              type="text"
              className="input"
              value={licensePlan}
              onChange={(e) => setLicensePlan(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Amount (₹ / period)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              value={licenseAmount}
              onChange={(e) => setLicenseAmount(e.target.value)}
              required
            />
            <p className="text-xs text-ink-500 mt-1.5">
              Applies from this gym's next renewal — it does not change their current expiry date.
            </p>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Saving...' : 'Save Pricing'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary px-4">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminGymDetail;
