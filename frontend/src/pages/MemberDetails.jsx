import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, MapPin, Calendar, CreditCard, Plus, CheckCircle2, X, Filter, RotateCcw,
  Pencil, Trash2, Camera, User
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
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [editingMembership, setEditingMembership] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editingAttendance, setEditingAttendance] = useState(null);

  const [totalVisits, setTotalVisits] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [rangeResult, setRangeResult] = useState(null);
  const [rangeLoading, setRangeLoading] = useState(false);

  useEffect(() => {
    fetchMemberDetails();
    fetchAllAttendance();
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

  // member.attendance from the detail response is capped at 10 — fetch the
  // real unbounded total separately rather than showing a truncated count.
  const fetchAllAttendance = async () => {
    try {
      const res = await axios.get(`/api/attendance/${id}`);
      setTotalVisits(res.data.attendance.length);
    } catch {
      // non-critical — the recent-attendance list still works without this
    }
  };

  const applyDateRange = async (e) => {
    e.preventDefault();
    if (!dateFrom || !dateTo) return;
    setRangeLoading(true);
    try {
      const res = await axios.get(`/api/attendance/${id}`, {
        params: { startDate: dateFrom, endDate: `${dateTo}T23:59:59` }
      });
      setRangeResult(res.data.attendance);
    } catch {
      toast.error('Failed to fetch attendance for that range');
    } finally {
      setRangeLoading(false);
    }
  };

  const clearDateRange = () => {
    setDateFrom('');
    setDateTo('');
    setRangeResult(null);
  };

  const handleDeleteMember = async () => {
    if (!window.confirm(`Delete ${member.fullName}? This permanently removes their profile, memberships, payments, and attendance history.`)) {
      return;
    }
    try {
      await axios.delete(`/api/members/${id}`);
      toast.success('Member deleted');
      navigate('/members');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete member');
    }
  };

  const handleDeleteMembership = async (membershipId) => {
    if (!window.confirm('Delete this membership record?')) return;
    try {
      await axios.delete(`/api/memberships/${membershipId}`);
      toast.success('Membership deleted');
      fetchMemberDetails();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete membership');
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Delete this payment record?')) return;
    try {
      await axios.delete(`/api/payments/${paymentId}`);
      toast.success('Payment deleted');
      fetchMemberDetails();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete payment');
    }
  };

  const handleDeleteAttendance = async (attendanceId) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await axios.delete(`/api/attendance/${attendanceId}`);
      toast.success('Attendance record deleted');
      fetchMemberDetails();
      fetchAllAttendance();
      if (rangeResult) {
        setRangeResult(rangeResult.filter((r) => r.id !== attendanceId));
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete attendance record');
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate('/members')}
          className="btn-ghost -ml-3"
        >
          <ArrowLeft size={17} />
          Back to Members
        </button>
        <button
          onClick={handleDeleteMember}
          className="btn-secondary text-sm !py-2 !text-red-400 hover:!bg-red-500/10 border-red-500/20"
        >
          <Trash2 size={15} />
          <span>Delete Member</span>
        </button>
      </div>

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
              <div className="flex items-center gap-2">
                <span className={member.isActive ? 'badge-success' : 'badge-neutral'}>
                  {member.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => setShowEditMemberModal(true)}
                  className="btn-secondary text-sm !py-2"
                >
                  <Pencil size={14} />
                  <span>Edit</span>
                </button>
              </div>
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
                <div className="flex items-start text-sm text-ink-300">
                  <MapPin size={16} className="mr-2.5 text-ink-500 mt-0.5 shrink-0" />
                  <span className="break-words">{member.address}</span>
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
          <div className="flex items-center gap-2">
            {latestMembership && (
              <>
                <button
                  onClick={() => setEditingMembership(latestMembership)}
                  className="btn-secondary text-sm !py-2 !px-2.5"
                  title="Edit membership"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDeleteMembership(latestMembership.id)}
                  className="btn-secondary text-sm !py-2 !px-2.5 !text-red-400 hover:!bg-red-500/10 border-red-500/20"
                  title="Delete membership"
                >
                  <Trash2 size={15} />
                </button>
              </>
            )}
            <button
              onClick={() => setShowMembershipModal(true)}
              className="btn-secondary text-sm !py-2"
            >
              <Plus size={15} />
              <span>Add / Renew</span>
            </button>
          </div>
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
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
                      <CreditCard size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white">
                        {formatINR(payment.amount)}
                      </p>
                      <p className="text-sm text-ink-400">
                        {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm capitalize text-ink-300 font-medium">{payment.paymentMethod}</p>
                      {payment.remarks && (
                        <p className="text-xs text-ink-500 max-w-[8rem] truncate">{payment.remarks}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingPayment(payment)}
                        className="p-1.5 rounded-lg text-ink-500 hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit payment"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="p-1.5 rounded-lg text-ink-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete payment"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">
              {rangeResult ? 'Visits in Range' : 'Recent Attendance'}
            </h2>
            {rangeResult && (
              <button onClick={clearDateRange} className="btn-ghost text-ink-400 hover:text-white text-xs !py-1.5">
                <RotateCcw size={13} />
                Clear
              </button>
            )}
          </div>

          <form onSubmit={applyDateRange} className="flex flex-wrap items-end gap-2 mb-5 p-3.5 bg-black/30 border border-white/10 rounded-xl">
            <div className="flex-1 min-w-[8rem]">
              <label className="text-xs text-ink-500 uppercase tracking-wide font-semibold">From</label>
              <input
                type="date"
                className="input mt-1 !py-2 text-sm"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                required
              />
            </div>
            <div className="flex-1 min-w-[8rem]">
              <label className="text-xs text-ink-500 uppercase tracking-wide font-semibold">To</label>
              <input
                type="date"
                className="input mt-1 !py-2 text-sm"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={rangeLoading} className="btn-secondary !py-2 text-sm">
              <Filter size={14} />
              {rangeLoading ? 'Checking...' : 'Check'}
            </button>
          </form>

          {rangeResult && (
            <p className="text-sm text-ink-400 -mt-2 mb-3">
              <span className="font-bold text-white">{rangeResult.length}</span> visit{rangeResult.length === 1 ? '' : 's'} between{' '}
              {format(new Date(dateFrom), 'MMM dd, yyyy')} and {format(new Date(dateTo), 'MMM dd, yyyy')}
            </p>
          )}

          <div className="space-y-1">
            {(rangeResult ?? member.attendance)?.length > 0 ? (
              (rangeResult ?? member.attendance).map((record) => (
                <div key={record.id} className="flex items-center justify-between gap-3 p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-sky-500/15 text-sky-400 shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white">
                        {format(new Date(record.checkInTime), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-sm text-ink-400">
                        {format(new Date(record.checkInTime), 'hh:mm a')}
                        {record.checkOutTime && ` – ${format(new Date(record.checkOutTime), 'hh:mm a')}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingAttendance(record)}
                      className="p-1.5 rounded-lg text-ink-500 hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit attendance"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteAttendance(record.id)}
                      className="p-1.5 rounded-lg text-ink-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete attendance"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-ink-400 text-center py-10 text-sm">
                {rangeResult ? 'No visits in that range' : 'No attendance records'}
              </p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-sm text-ink-400">Total Visits (all time)</span>
            <span className="font-bold text-white text-xl">
              {totalVisits ?? member.attendance?.length ?? 0}
            </span>
          </div>
        </div>
      </div>

      {showEditMemberModal && (
        <EditMemberModal
          member={member}
          onClose={() => setShowEditMemberModal(false)}
          onSuccess={fetchMemberDetails}
        />
      )}

      {showMembershipModal && (
        <MembershipModal
          memberId={id}
          onClose={() => setShowMembershipModal(false)}
          onSuccess={fetchMemberDetails}
        />
      )}

      {editingMembership && (
        <MembershipModal
          memberId={id}
          membership={editingMembership}
          onClose={() => setEditingMembership(null)}
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

      {editingPayment && (
        <PaymentModal
          memberId={id}
          payment={editingPayment}
          onClose={() => setEditingPayment(null)}
          onSuccess={fetchMemberDetails}
        />
      )}

      {editingAttendance && (
        <AttendanceModal
          record={editingAttendance}
          onClose={() => setEditingAttendance(null)}
          onSuccess={() => { fetchMemberDetails(); fetchAllAttendance(); }}
        />
      )}
    </div>
  );
};

// Edit Member Modal Component
const EditMemberModal = ({ member, onClose, onSuccess }) => {
  const [photoPreview, setPhotoPreview] = useState(member.photoUrl || null);
  const [formData, setFormData] = useState({
    fullName: member.fullName || '',
    email: member.email || '',
    phoneNumber: member.phoneNumber || '',
    dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
    gender: member.gender || '',
    address: member.address || '',
    emergencyContact: member.emergencyContact || '',
    joiningDate: member.joiningDate ? member.joiningDate.split('T')[0] : '',
    isActive: member.isActive,
    photo: null
  });
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('phoneNumber', formData.phoneNumber);
      data.append('dateOfBirth', formData.dateOfBirth);
      data.append('gender', formData.gender);
      data.append('address', formData.address);
      data.append('emergencyContact', formData.emergencyContact);
      data.append('joiningDate', formData.joiningDate);
      data.append('isActive', formData.isActive);
      if (formData.photo) data.append('photo', formData.photo);

      await axios.put(`/api/members/${member.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Member updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel max-w-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Edit Member</h3>
          <button onClick={onClose} className="text-ink-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="flex justify-center">
            <div className="relative">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-white/5"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center ring-4 ring-white/5">
                  <User className="text-ink-500" size={30} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="edit-photo-upload"
              />
              <label
                htmlFor="edit-photo-upload"
                className="absolute -bottom-1 -right-1 bg-primary-600 text-white rounded-full p-2 cursor-pointer hover:bg-primary-700 shadow-soft transition-colors"
              >
                <Camera size={13} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                type="text"
                className="input"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Phone Number *</label>
              <input
                type="tel"
                className="input"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input
                type="date"
                className="input"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Gender</label>
              <select
                className="input"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Emergency Contact</label>
              <input
                type="tel"
                className="input"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Joining Date</label>
              <input
                type="date"
                className="input"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Address</label>
            <textarea
              className="input"
              rows="3"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
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

// Membership Modal Component — handles both "Add / Renew" (no `membership`
// prop) and editing an existing record (`membership` prop supplied).
const MembershipModal = ({ memberId, membership, onClose, onSuccess }) => {
  const isEdit = Boolean(membership);
  const [formData, setFormData] = useState({
    planName: membership?.planName || 'Monthly',
    planDuration: String(membership?.planDuration ?? '30'),
    planAmount: String(membership?.planAmount ?? '1800'),
    startDate: membership?.startDate ? membership.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: membership?.endDate ? membership.endDate.split('T')[0] : '',
    status: membership?.status || 'active'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await axios.put(`/api/memberships/${membership.id}`, formData);
        toast.success('Membership updated successfully!');
      } else {
        await axios.post('/api/memberships', { ...formData, memberId });
        toast.success('Membership added successfully!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'add'} membership`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">{isEdit ? 'Edit Membership' : 'Add Membership'}</h3>
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
                if (isEdit) {
                  setFormData({ ...formData, planName: plan });
                  return;
                }
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
              {!['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'].includes(formData.planName) && (
                <option>{formData.planName}</option>
              )}
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
          {isEdit && (
            <>
              <div>
                <label className="label">End Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </>
          )}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Membership'}
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

// Payment Modal Component — handles both "Add Payment" (no `payment` prop)
// and editing an existing record (`payment` prop supplied).
const PaymentModal = ({ memberId, payment, onClose, onSuccess }) => {
  const isEdit = Boolean(payment);
  const [formData, setFormData] = useState({
    amount: payment ? String(payment.amount) : '',
    paymentMethod: payment?.paymentMethod || 'cash',
    remarks: payment?.remarks || '',
    paymentDate: payment?.paymentDate ? payment.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await axios.put(`/api/payments/${payment.id}`, formData);
        toast.success('Payment updated successfully!');
      } else {
        await axios.post('/api/payments', { ...formData, memberId });
        toast.success('Payment recorded successfully!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'record'} payment`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">{isEdit ? 'Edit Payment' : 'Record Payment'}</h3>
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
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Record Payment'}
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

// Attendance Modal Component — edits check-in / check-out time on an
// existing record (e.g. to fix a missed checkout or a mistaken check-in).
const AttendanceModal = ({ record, onClose, onSuccess }) => {
  const toLocalInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [formData, setFormData] = useState({
    checkInTime: toLocalInput(record.checkInTime),
    checkOutTime: toLocalInput(record.checkOutTime)
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`/api/attendance/${record.id}`, {
        checkInTime: formData.checkInTime ? new Date(formData.checkInTime).toISOString() : undefined,
        checkOutTime: formData.checkOutTime ? new Date(formData.checkOutTime).toISOString() : ''
      });
      toast.success('Attendance updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Edit Attendance</h3>
          <button onClick={onClose} className="text-ink-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Check-in Time</label>
            <input
              type="datetime-local"
              className="input"
              value={formData.checkInTime}
              onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Check-out Time</label>
            <input
              type="datetime-local"
              className="input"
              value={formData.checkOutTime}
              onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
            />
            <p className="text-xs text-ink-500 mt-1.5">Leave blank if the member hasn't checked out.</p>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
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
