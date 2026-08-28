import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Phone, Mail, MapPin } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { formatINR } from '../utils/currency';

const DueMembers = () => {
  const [dueMembers, setDueMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState(7);

  useEffect(() => {
    fetchDueMembers();
  }, [daysFilter]);

  const fetchDueMembers = async () => {
    try {
      const response = await axios.get(`/api/dashboard/due-members?days=${daysFilter}`);
      setDueMembers(response.data.dueMembers);
    } catch (error) {
      toast.error('Failed to fetch due members');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="spinner w-12 h-12"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Due Members</h1>
          <p className="page-subtitle">Members with expiring or expired memberships</p>
        </div>

        <select
          value={daysFilter}
          onChange={(e) => setDaysFilter(Number(e.target.value))}
          className="input w-full sm:w-48"
        >
          <option value={3}>Next 3 days</option>
          <option value={7}>Next 7 days</option>
          <option value={15}>Next 15 days</option>
          <option value={30}>Next 30 days</option>
        </select>
      </div>

      {dueMembers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {dueMembers.map((member) => (
            <div key={member.id} className="card relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${member.isExpired ? 'bg-rose-500' : 'bg-amber-500'}`} />
              <div className="flex items-start gap-4 pl-2">
                <div className="shrink-0">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.fullName}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="avatar-fallback w-20 h-20 text-2xl rounded-xl">
                      {member.fullName.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">{member.fullName}</h3>
                      <p className="text-sm text-ink-400">{member.membershipId}</p>
                    </div>

                    <span className={member.isExpired ? 'badge-danger shrink-0' : 'badge-warning shrink-0'}>
                      {member.isExpired ? 'Expired' : `${member.daysUntilExpiry}d left`}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {member.phoneNumber && (
                      <div className="flex items-center text-sm text-ink-400">
                        <Phone size={14} className="mr-2 text-ink-500" />
                        {member.phoneNumber}
                      </div>
                    )}
                    {member.email && (
                      <div className="flex items-center text-sm text-ink-400 truncate">
                        <Mail size={14} className="mr-2 text-ink-500 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    {member.address && (
                      <div className="flex items-center text-sm text-ink-400 truncate">
                        <MapPin size={14} className="mr-2 text-ink-500 shrink-0" />
                        <span className="truncate">{member.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3.5 p-3.5 bg-black/30 border border-white/10 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-ink-400">Current Plan</span>
                      <span className="font-medium text-white text-sm">{member.planName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-ink-400">End Date</span>
                      <span className="font-medium text-white text-sm">
                        {format(new Date(member.membershipEndDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-sm text-ink-400">Next Fee</span>
                      <span className="font-bold text-white text-lg">
                        {formatINR(member.nextFeeAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3.5 flex gap-2">
                    <Link
                      to={`/members/${member.id}`}
                      className="flex-1 btn-primary text-center text-sm !py-2"
                    >
                      View Details
                    </Link>
                    <a
                      href={`tel:${member.phoneNumber}`}
                      className="btn-secondary text-sm !py-2 px-3.5"
                    >
                      <Phone size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-emerald-400" size={26} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No Due Members</h3>
          <p className="text-ink-400">
            All memberships are up to date for the selected period.
          </p>
        </div>
      )}
    </div>
  );
};

export default DueMembers;
