import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, Phone, Mail, MapPin, Activity, Download } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { downloadCSV } from '../utils/csv';
import { digitsOnly, formatPhoneDisplay } from '../utils/phone';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMembers();
  }, [statusFilter]);

  const fetchMembers = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await axios.get('/api/members', { params });
      setMembers(response.data.members);
    } catch (error) {
      toast.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const searchDigits = digitsOnly(searchTerm);
  const filteredMembers = members.filter(member => {
    const term = searchTerm.toLowerCase().trim();
    return (
      member.fullName.toLowerCase().includes(term) ||
      member.membershipId.toLowerCase().includes(term) ||
      (member.address || '').toLowerCase().includes(term) ||
      (searchDigits.length > 0 && digitsOnly(member.phoneNumber).includes(searchDigits))
    );
  });

  const handleExport = () => {
    downloadCSV(
      `members-${format(new Date(), 'yyyy-MM-dd')}.csv`,
      ['Name', 'Membership ID', 'Phone', 'Email', 'Status', 'Plan', 'Expires', 'Total Visits'],
      filteredMembers.map((m) => [
        m.fullName,
        m.membershipId,
        m.phoneNumber,
        m.email || '',
        m.isActive ? 'Active' : 'Inactive',
        m.memberships[0]?.planName || '',
        m.memberships[0] ? format(new Date(m.memberships[0].endDate), 'yyyy-MM-dd') : '',
        m._count?.attendance || 0
      ])
    );
    toast.success('Members exported');
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
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">Manage your gym members</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={handleExport} className="btn-secondary" disabled={filteredMembers.length === 0}>
            <Download size={18} />
            <span>Export CSV</span>
          </button>
          <Link to="/members/add" className="btn-primary">
            <Plus size={18} />
            <span>Add Member</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card !p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" size={18} />
            <input
              type="text"
              placeholder="Search by name, ID, phone, or address..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input md:w-48"
          >
            <option value="all">All Members</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Members Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((member, index) => {
            const latestMembership = member.memberships[0];
            const isExpiringSoon = latestMembership &&
              new Date(latestMembership.endDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            return (
              <Link
                key={member.id}
                to={`/members/${member.id}`}
                className="card card-hover animate-fade-up"
                style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
              >
                <div className="flex items-start gap-4">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.fullName}
                      className="w-14 h-14 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="avatar-fallback w-14 h-14 text-lg shrink-0">
                      {member.fullName.charAt(0)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-white truncate">{member.fullName}</h3>
                        <p className="text-sm text-ink-400">{member.membershipId}</p>
                      </div>
                      <span className={member.isActive ? 'badge-success shrink-0' : 'badge-neutral shrink-0'}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {member.address && (
                      <div className="mt-2 flex items-start gap-2 text-sm text-ink-200">
                        <MapPin size={13} className="mt-0.5 text-ink-500 shrink-0" />
                        <span className="break-words">{member.address}</span>
                      </div>
                    )}

                    <div className="mt-3 space-y-1.5">
                      {member.phoneNumber && (
                        <div className="flex items-center text-sm text-ink-400">
                          <Phone size={13} className="mr-2 text-ink-500" />
                          {formatPhoneDisplay(member.phoneNumber)}
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center text-sm text-ink-400 truncate">
                          <Mail size={13} className="mr-2 text-ink-500 shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}
                    </div>

                    {latestMembership && (
                      <div className={`mt-3 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                        isExpiringSoon
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-white/5 text-ink-300'
                      }`}>
                        {latestMembership.planName} · Expires {format(new Date(latestMembership.endDate), 'MMM dd, yyyy')}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-sm pt-3 border-t border-white/10">
                      <span className="text-ink-400 flex items-center gap-1.5">
                        <Activity size={13} />
                        Attendance
                      </span>
                      <span className="font-semibold text-white">{member._count?.attendance || 0} visits</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Users className="text-ink-500" size={26} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No Members Found</h3>
          <p className="text-ink-400 mb-5">
            {searchTerm
              ? 'Try adjusting your search criteria'
              : 'Get started by adding your first member'}
          </p>
          {!searchTerm && (
            <Link to="/members/add" className="btn-primary inline-flex">
              <Plus size={18} />
              <span>Add First Member</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Members;
