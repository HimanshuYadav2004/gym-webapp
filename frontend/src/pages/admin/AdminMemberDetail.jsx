import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, CreditCard, CheckCircle2, Building2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { formatINR } from '../../utils/currency';

const AdminMemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/super-admin/members/${id}`)
      .then((res) => setMember(res.data.member))
      .catch(() => {
        toast.error('Failed to load member');
        navigate('/admin/gyms');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

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
      <button onClick={() => navigate(`/admin/gyms/${member.gymOwner.id}`)} className="btn-ghost -ml-3">
        <ArrowLeft size={17} />
        Back to {member.gymOwner.gymName}
      </button>

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
              <span className={member.isActive ? 'badge-success' : 'badge-neutral'}>
                {member.isActive ? 'Active' : 'Inactive'}
              </span>
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
        <h2 className="text-lg font-bold text-white mb-5">Current Membership</h2>
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
          <h2 className="text-lg font-bold text-white mb-5">Payment History</h2>
          <div className="space-y-1">
            {member.payments?.length > 0 ? (
              member.payments.slice(0, 10).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
                      <CreditCard size={15} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{formatINR(payment.amount)}</p>
                      <p className="text-sm text-ink-400">{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <p className="text-sm capitalize text-ink-300 font-medium">{payment.paymentMethod}</p>
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
                    <p className="font-medium text-white">{format(new Date(record.checkInTime), 'MMM dd, yyyy')}</p>
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
        </div>
      </div>
    </div>
  );
};

export default AdminMemberDetail;
