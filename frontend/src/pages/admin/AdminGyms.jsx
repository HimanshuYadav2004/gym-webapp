import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search, ChevronRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const statusBadge = (status, expiresAt) => {
  const expired = expiresAt && new Date(expiresAt) < new Date();
  if (status === 'pending') return 'badge-warning';
  if (status === 'rejected' || status === 'suspended') return 'badge-danger';
  if (expired) return 'badge-danger';
  if (status === 'trial') return 'badge-info';
  return 'badge-success';
};

const statusLabel = (status, expiresAt) => {
  const expired = expiresAt && new Date(expiresAt) < new Date();
  if (status === 'pending') return 'Pending';
  if (status === 'rejected') return 'Rejected';
  if (status === 'suspended') return 'Suspended';
  if (expired) return 'Expired';
  if (status === 'trial') return 'Trial';
  return 'Active';
};

const AdminGyms = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios
      .get('/api/super-admin/gyms')
      .then((res) => setGyms(res.data.gyms))
      .catch(() => toast.error('Failed to load gyms'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = gyms.filter((g) =>
    g.gymName.toLowerCase().includes(search.toLowerCase()) ||
    g.fullName.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">All Gyms</h1>
        <p className="page-subtitle">Every gym running on the platform</p>
      </div>

      <div className="card !p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" size={18} />
          <input
            type="text"
            placeholder="Search by gym, owner, or email..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="table-head">Gym</th>
                  <th className="table-head">Owner</th>
                  <th className="table-head">Members</th>
                  <th className="table-head">Plan</th>
                  <th className="table-head">Status</th>
                  <th className="table-head">Expires</th>
                  <th className="table-head"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((g) => (
                  <tr key={g.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-medium text-white">{g.gymName}</div>
                      <div className="text-xs text-ink-500">{g.gymAddress || '—'}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="text-sm text-ink-300">{g.fullName}</div>
                      <div className="text-xs text-ink-500">{g.email}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-white font-medium">
                      {g._count.members}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-ink-300">
                      {g.licensePlan}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={statusBadge(g.licenseStatus, g.licenseExpiresAt)}>
                        {statusLabel(g.licenseStatus, g.licenseExpiresAt)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-ink-400">
                      {g.licenseExpiresAt ? format(new Date(g.licenseExpiresAt), 'MMM dd, yyyy') : '—'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Link to={`/admin/gyms/${g.id}`} className="btn-ghost text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 text-sm !py-1.5">
                        View
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-ink-500" size={26} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No Gyms Found</h3>
          <p className="text-ink-400">Try adjusting your search.</p>
        </div>
      )}
    </div>
  );
};

export default AdminGyms;
