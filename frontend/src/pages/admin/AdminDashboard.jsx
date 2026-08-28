import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, IndianRupee, ShieldCheck, ArrowRight, AlertTriangle, ShieldPlus, ShieldOff, History, UserCheck, Check, X, Mail, Phone } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/currency';
import CountUp from '../../components/CountUp';
import SpotlightCard from '../../components/SpotlightCard';

const POLL_INTERVAL = 7000;
const countFormat = (n) => Math.round(n).toLocaleString('en-IN');

const actionMeta = {
  'license.extend': { label: 'Extended license', icon: ShieldPlus, chip: 'bg-emerald-500/15 text-emerald-400' },
  'license.suspend': { label: 'Suspended access', icon: ShieldOff, chip: 'bg-rose-500/15 text-rose-400' },
  'license.activate': { label: 'Reactivated', icon: ShieldCheck, chip: 'bg-sky-500/15 text-sky-400' },
  'license.approve': { label: 'Approved gym', icon: UserCheck, chip: 'bg-emerald-500/15 text-emerald-400' },
  'license.reject': { label: 'Rejected gym', icon: X, chip: 'bg-rose-500/15 text-rose-400' },
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [pendingGyms, setPendingGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const prevPendingRef = useRef(0);
  const firstLoad = useRef(true);

  const fetchPending = async () => {
    try {
      const res = await axios.get('/api/super-admin/gyms');
      const pending = res.data.gyms.filter((g) => g.licenseStatus === 'pending');

      if (!firstLoad.current && pending.length > prevPendingRef.current) {
        const newest = pending[0];
        toast.success(`New gym registration: ${newest.gymName}`, { icon: '🔔' });
      }
      firstLoad.current = false;
      prevPendingRef.current = pending.length;
      setPendingGyms(pending);
    } catch {
      // silent — this polls in the background
    }
  };

  useEffect(() => {
    Promise.all([
      axios.get('/api/super-admin/stats'),
      axios.get('/api/super-admin/audit-log')
    ])
      .then(([statsRes, logsRes]) => {
        setData(statsRes.data);
        setLogs(logsRes.data.logs);
      })
      .catch(() => toast.error('Failed to load platform stats'))
      .finally(() => setLoading(false));

    fetchPending();
    const interval = setInterval(fetchPending, POLL_INTERVAL);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApproval = async (id, action) => {
    setActioningId(id);
    try {
      await axios.patch(`/api/super-admin/gyms/${id}/license`, { action });
      toast.success(action === 'approve' ? 'Gym approved' : 'Gym rejected');
      fetchPending();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update');
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  const { stats, expiringGyms } = data;

  const cards = [
    { title: 'Total Gyms', value: stats.totalGyms, icon: Building2, chip: 'bg-primary-500/15 text-primary-400', spot: 'rgb(239 68 68 / 0.18)' },
    { title: 'Total Members', value: stats.totalMembers, icon: Users, chip: 'bg-sky-500/15 text-sky-400', spot: 'rgb(2 132 199 / 0.18)' },
    { title: 'Revenue Collected', value: stats.totalRevenue, format: formatINR, icon: IndianRupee, chip: 'bg-emerald-500/15 text-emerald-400', spot: 'rgb(16 185 129 / 0.18)' },
    { title: 'Active Licenses', value: stats.byStatus.active, icon: ShieldCheck, chip: 'bg-violet-500/15 text-violet-400', spot: 'rgb(124 58 237 / 0.18)' },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl overflow-hidden bg-ink-900 border border-white/10 animate-fade-up">
        <div className="hazard-stripe" />
        <div className="p-6 sm:p-8 md:p-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-px bg-primary-500" />
            <p className="text-xs font-semibold text-primary-400 uppercase tracking-[0.2em]">
              Welcome, {user?.fullName?.split(' ')[0]}
            </p>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-wide leading-[0.95]">
            Platform Overview
          </h1>
          <p className="text-ink-400 mt-3">Every gym running on GymFlow, in one place.</p>
        </div>
      </div>

      {/* Pending Approvals — live */}
      {pendingGyms.length > 0 && (
        <div className="card !border-amber-500/30 animate-fade-up">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <UserCheck size={18} className="text-amber-400" />
              <h2 className="text-lg font-bold text-white">Pending Approvals</h2>
              <span className="badge-warning">{pendingGyms.length}</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-ink-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>

          <div className="space-y-3">
            {pendingGyms.map((g) => (
              <div key={g.id} className="p-4 rounded-xl bg-black/30 border border-white/10 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{g.gymName}</p>
                  <p className="text-sm text-ink-400">{g.fullName}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-ink-500">
                    <span className="flex items-center gap-1.5"><Mail size={12} />{g.email}</span>
                    <span className="flex items-center gap-1.5"><Phone size={12} />{g.phoneNumber}</span>
                    <span>Applied {formatDistanceToNow(new Date(g.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleApproval(g.id, 'approve')}
                    disabled={actioningId === g.id}
                    className="btn-primary !py-2 !px-3.5 text-sm"
                  >
                    <Check size={15} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(g.id, 'reject')}
                    disabled={actioningId === g.id}
                    className="btn-danger !py-2 !px-3.5 text-sm"
                  >
                    <X size={15} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((c, i) => (
          <SpotlightCard
            key={c.title}
            spotlightColor={c.spot}
            className="card card-hover animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${c.chip}`}>
              <c.icon size={20} strokeWidth={2.2} />
            </div>
            <p className="font-display text-3xl text-white mt-4 tracking-wide">
              <CountUp value={c.value} format={c.format || countFormat} />
            </p>
            <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mt-2">{c.title}</p>
          </SpotlightCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* License status breakdown */}
        <div className="card animate-fade-up" style={{ animationDelay: '260ms' }}>
          <h2 className="text-lg font-bold text-white mb-5">License Status</h2>
          <div className="space-y-3">
            {[
              { label: 'Active', value: stats.byStatus.active, color: 'bg-emerald-500' },
              { label: 'Trial', value: stats.byStatus.trial, color: 'bg-sky-500' },
              { label: 'Pending', value: stats.byStatus.pending, color: 'bg-amber-500' },
              { label: 'Expired', value: stats.byStatus.expired, color: 'bg-rose-500' },
              { label: 'Suspended', value: stats.byStatus.suspended, color: 'bg-ink-500' },
            ].map((s) => {
              const pct = stats.totalGyms > 0 ? Math.round((s.value / stats.totalGyms) * 100) : 0;
              return (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-ink-300">{s.label}</span>
                    <span className="text-white font-medium">{s.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expiring soon */}
        <div className="card animate-fade-up" style={{ animationDelay: '320ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Expiring Soon</h2>
            <Link to="/admin/gyms" className="btn-ghost text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 text-sm">
              All Gyms
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-1">
            {expiringGyms.length > 0 ? (
              expiringGyms.map((g) => {
                const isExpired = new Date(g.licenseExpiresAt) < new Date();
                return (
                  <Link
                    key={g.id}
                    to={`/admin/gyms/${g.id}`}
                    className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${isExpired ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'}`}>
                        <AlertTriangle size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{g.gymName}</p>
                        <p className="text-sm text-ink-400 truncate">{g.fullName}</p>
                      </div>
                    </div>
                    <span className={isExpired ? 'badge-danger shrink-0' : 'badge-warning shrink-0'}>
                      {isExpired ? 'Expired' : formatDistanceToNow(new Date(g.licenseExpiresAt), { addSuffix: true })}
                    </span>
                  </Link>
                );
              })
            ) : (
              <p className="text-ink-400 text-center py-10 text-sm">No gyms expiring soon.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card animate-fade-up" style={{ animationDelay: '380ms' }}>
        <div className="flex items-center gap-2 mb-5">
          <History size={18} className="text-ink-400" />
          <h2 className="text-lg font-bold text-white">Recent Activity</h2>
        </div>

        <div className="space-y-1">
          {logs.length > 0 ? (
            logs.map((log) => {
              const meta = actionMeta[log.action] || { label: log.action, icon: History, chip: 'bg-white/10 text-ink-300' };
              return (
                <div key={log.id} className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${meta.chip}`}>
                      <meta.icon size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white">
                        <span className="font-medium">{meta.label}</span>
                        {log.targetGymName && <span className="text-ink-400"> — {log.targetGymName}</span>}
                        {log.details && <span className="text-ink-500"> ({log.details})</span>}
                      </p>
                      <p className="text-xs text-ink-500">by {log.actorEmail}</p>
                    </div>
                  </div>
                  <span className="text-xs text-ink-500 shrink-0">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-ink-400 text-center py-10 text-sm">No admin activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
