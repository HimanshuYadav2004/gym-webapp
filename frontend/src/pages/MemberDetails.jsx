import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, MapPin, Calendar, CreditCard, Plus, CheckCircle2, X
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { formatINR } from '../utils/currency';

const MemberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchMemberDetails();
  }, [id]);

  const fetchMemberDetails = async () => {
    try {
      const response = await axios.get(`/api/members/${id}`);
      setMember(response.data.member);
    } catch (error) {
      toast.error('Failed to fetch member details');
      navigate('/members');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="spinner w-12 h-12"></div>
    </div>;
  }

  const latestMembership = member?.memberships?.[0];

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/members')}
        className="btn-ghost -ml-3"
      >
        <ArrowLeft size={17} />
        Back to Members
      </button>

      {/* Member Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={member.fullName}
              className="w-28 h-28 rounded-2xl object-cover shrink-0"
            />
          ) : (
            <div className="avatar-fallback w-28 h-28 text-4xl rounded-2xl shrink-0">
              {member.fullName.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{member.fullName}</h1>
                <p className="text-ink-400 mt-1">{member.membershipId}</p>
              </div>
              <span className={member.isActive ? 'badge-success' : 'badge-neutral'}>
                {member.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              {member.phoneNumber && (
                <div className="flex items-center text-sm text-ink-300">
                  <Phone size={16} className="mr-2.5 text-ink-500" />
                  {member.phoneNumber}
                </div>
              )}
              {member.email && (
                <div className="flex items-center text-sm text-ink-300">
                  <Mail size={16} className="mr-2.5 text-ink-500" />
                  {member.email}
                </div>
              )}
              {member.address && (
                <div className="flex items-center text-sm text-ink-300">
                  <MapPin size={16} className="mr-2.5 text-ink-500" />
                  {member.address}
                </div>
              )}
              <div className="flex items-center text-sm text-ink-300">
                <Calendar size={16} className="mr-2.5 text-ink-500" />
                Joined {format(new Date(member.joiningDate), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Membership */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Current Membership</h2>
          <button
            onClick={() => setShowMembershipModal(true)}
            className="btn-secondary text-sm !py-2"
          >
            <Plus size={15} />
            <span>Add / Renew</span>
          </button>
        </div>

        {latestMembership ? (
          <div className="p-5 bg-black/30 border border-white/10 rounded-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div>
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Plan</p>
                <p className="font-bold text-white mt-1.5">{latestMembership.planName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Duration</p>
                <p className="font-bold text-white mt-1.5">{latestMembership.planDuration} days</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">End Date</p>
                <p className="font-bold text-white mt-1.5">
                  {format(new Date(latestMembership.endDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Amount</p>
                <p className="font-bold text-primary-400 mt-1.5">
                  {formatINR(latestMembership.planAmount)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-ink-400 text-center py-10 text-sm">No active membership</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment History */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Payment History</h2>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="btn-secondary text-sm !py-2"
            >
              <Plus size={15} />
              <span>Add Payment</span>
            </button>
          </div>

          <div className="space-y-1">
            {member.payments?.length > 0 ? (
              member.payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
                      <CreditCard size={15} />
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {formatINR(payment.amount)}
                      </p>
                      <p className="text-sm text-ink-400">
                        {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm capitalize text-ink-300 font-medium">{payment.paymentMethod}</p>
                    {payment.remarks && (
                      <p className="text-xs text-ink-500 max-w-[10rem] truncate">{payment.remarks}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-ink-400 text-center py-10 text-sm">No payment history</p>
            )}
          </div>
        </div>

        {/* Attendance */}
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-5">Recent Attendance</h2>

          <div className="space-y-1">
            {member.attendance?.length > 0 ? (
              member.attendance.map((record) => (
                <div key={record.id} className="flex items-center gap-3 p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-sky-500/15 text-sky-400 shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {format(new Date(record.checkInTime), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-ink-400">
                      {format(new Date(record.checkInTime), 'hh:mm a')}
                      {record.checkOutTime && ` – ${format(new Date(record.checkOutTime), 'hh:mm a')}`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-ink-400 text-center py-10 text-sm">No attendance records</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-sm text-ink-400">Total Visits</span>
            <span className="font-bold text-white text-xl">
              {member.attendance?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {showMembershipModal && (
        <MembershipModal
          memberId={id}
          onClose={() => setShowMembershipModal(false)}
          onSuccess={fetchMemberDetails}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          memberId={id}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={fetchMemberDetails}
        />
      )}
    </div>
  );
};

// Membership Modal Component
const MembershipModal = ({ memberId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    planName: 'Monthly',
    planDuration: '30',
    planAmount: '1800',
    startDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/memberships', { ...formData, memberId });
      toast.success('Membership added successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add membership');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Add Membership</h3>
          <button onClick={onClose} className="text-ink-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Plan Name</label>
            <select
              className="input"
              value={formData.planName}
              onChange={(e) => {
                const plan = e.target.value;
                let duration = '30';
                let amount = '1800';
                if (plan === 'Quarterly') { duration = '90'; amount = '4800'; }
                if (plan === 'Half-Yearly') { duration = '180'; amount = '8500'; }
                if (plan === 'Yearly') { duration = '365'; amount = '15000'; }
                setFormData({ ...formData, planName: plan, planDuration: duration, planAmount: amount });
              }}
            >
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Half-Yearly</option>
              <option>Yearly</option>
            </select>
          </div>
          <div>
            <label className="label">Duration (days)</label>
            <input
              type="number"
              className="input"
              value={formData.planDuration}
              onChange={(e) => setFormData({ ...formData, planDuration: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={formData.planAmount}
              onChange={(e) => setFormData({ ...formData, planAmount: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              className="input"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Adding...' : 'Add Membership'}
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

// Payment Modal Component
const PaymentModal = ({ memberId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'cash',
    remarks: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/payments', { ...formData, memberId });
      toast.success('Payment recorded successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Record Payment</h3>
          <button onClick={onClose} className="text-ink-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Payment Method</label>
            <select
              className="input"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="online">Online Transfer</option>
            </select>
          </div>
          <div>
            <label className="label">Payment Date</label>
            <input
              type="date"
              className="input"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Remarks</label>
            <textarea
              className="input"
              rows="2"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Recording...' : 'Record Payment'}
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

export default MemberDetails;
