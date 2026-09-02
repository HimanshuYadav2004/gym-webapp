import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, MapPin, Calendar, CreditCard, Plus, CheckCircle2, Building2,
  Pencil, Trash2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { formatINR } from '../../utils/currency';
import { formatPhoneDisplay } from '../../utils/phone';
import { EditMemberModal, MembershipModal, PaymentModal, AttendanceModal } from '../../components/MemberModals';

const AdminMemberDetail = () => {
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

  const fetchMember = () => {
    axios
      .get(`/api/super-admin/members/${id}`)
      .then((res) => setMember(res.data.member))
      .catch(() => {
        toast.error('Failed to load member');
        navigate('/admin/gyms');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMember();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDeleteMember = async () => {
    if (!window.confirm(`Delete ${member.fullName}? This permanently removes their profile, memberships, payments, and attendance history.`)) {
      return;
    }
    try {
      await axios.delete(`/api/members/${id}`);
      toast.success('Member deleted');
      navigate(`/admin/gyms/${member.gymOwner.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete member');
    }
  };

  const handleDeleteMembership = async (membershipId) => {
    if (!window.confirm('Delete this membership record?')) return;
    try {
      await axios.delete(`/api/memberships/${membershipId}`);
      toast.success('Membership deleted');
      fetchMember();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete membership');
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Delete this payment record?')) return;
    try {
      await axios.delete(`/api/payments/${paymentId}`);
      toast.success('Payment deleted');
      fetchMember();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete payment');
    }
  };

  const handleDeleteAttendance = async (attendanceId) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await axios.delete(`/api/attendance/${attendanceId}`);
      toast.success('Attendance record deleted');
      fetchMember();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete attendance record');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  const latestMembership = member.memberships?.[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate(`/admin/gyms/${member.gymOwner.id}`)} className="btn-ghost -ml-3">
          <ArrowLeft size={17} />
          Back to {member.gymOwner.gymName}
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
            <img src={member.photoUrl} alt={member.fullName} className="w-28 h-28 rounded-2xl object-cover shrink-0" />
          ) : (
            <div className="avatar-fallback w-28 h-28 text-4xl rounded-2xl shrink-0">{member.fullName.charAt(0)}</div>
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

            <Link
              to={`/admin/gyms/${member.gymOwner.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-primary-400 hover:text-primary-300 mt-2"
            >
              <Building2 size={14} />
              {member.gymOwner.gymName}
            </Link>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              {member.phoneNumber && (
                <div className="flex items-center text-sm text-ink-300">
                  <Phone size={16} className="mr-2.5 text-ink-500" />
                  {formatPhoneDisplay(member.phoneNumber)}
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
                <p className="font-bold text-white mt-1.5">{format(new Date(latestMembership.endDate), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Amount</p>
                <p className="font-bold text-primary-400 mt-1.5">{formatINR(latestMembership.planAmount)}</p>
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
              member.payments.slice(0, 10).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
                      <CreditCard size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white">{formatINR(payment.amount)}</p>
                      <p className="text-sm text-ink-400">{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-sm capitalize text-ink-300 font-medium">{payment.paymentMethod}</p>
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
          <h2 className="text-lg font-bold text-white mb-5">Recent Attendance</h2>
          <div className="space-y-1">
            {member.attendance?.length > 0 ? (
              member.attendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between gap-3 p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-sky-500/15 text-sky-400 shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white">{format(new Date(record.checkInTime), 'MMM dd, yyyy')}</p>
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
              <p className="text-ink-400 text-center py-10 text-sm">No attendance records</p>
            )}
          </div>
        </div>
      </div>

      {showEditMemberModal && (
        <EditMemberModal
          member={member}
          onClose={() => setShowEditMemberModal(false)}
          onSuccess={fetchMember}
        />
      )}

      {showMembershipModal && (
        <MembershipModal
          memberId={id}
          onClose={() => setShowMembershipModal(false)}
          onSuccess={fetchMember}
        />
      )}

      {editingMembership && (
        <MembershipModal
          memberId={id}
          membership={editingMembership}
          onClose={() => setEditingMembership(null)}
          onSuccess={fetchMember}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          memberId={id}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={fetchMember}
        />
      )}

      {editingPayment && (
        <PaymentModal
          memberId={id}
          payment={editingPayment}
          onClose={() => setEditingPayment(null)}
          onSuccess={fetchMember}
        />
      )}

      {editingAttendance && (
        <AttendanceModal
          record={editingAttendance}
          onClose={() => setEditingAttendance(null)}
          onSuccess={fetchMember}
        />
      )}
    </div>
  );
};

export default AdminMemberDetail;
