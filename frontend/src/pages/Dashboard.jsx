import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, IndianRupee, CalendarCheck, AlertCircle, TrendingUp, ArrowUpRight, ArrowRight, UserPlus, Receipt, QrCode } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';
import CountUp from '../components/CountUp';
import SpotlightCard from '../components/SpotlightCard';
import RevenueTrendChart from '../components/RevenueTrendChart';

const countFormat = (n) => Math.round(n).toLocaleString('en-IN');

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    axios
      .get('/api/dashboard/revenue-trend?days=30')
      .then((res) => setRevenueTrend(res.data.trend))
      .catch(() => {});
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  const totalMembers = stats?.stats?.totalMembers || 0;
  const activeMembers = stats?.stats?.activeMembers || 0;
  const activeRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

  const statCards = [
    {
      title: 'Total Members',
      value: totalMembers,
      format: countFormat,
      meta: 'Across your gym',
      icon: Users,
      chip: 'bg-primary-500/15 text-primary-400',
      spot: 'rgb(239 68 68 / 0.18)',
      link: '/members'
    },
    {
      title: 'Active Members',
      value: activeMembers,
      format: countFormat,
      meta: `${activeRate}% of total`,
      icon: TrendingUp,
      chip: 'bg-emerald-500/15 text-emerald-400',
      spot: 'rgb(16 185 129 / 0.18)',
      link: '/members?status=active'
    },
    {
      title: "Today's Attendance",
      value: stats?.stats?.todayAttendance || 0,
      format: countFormat,
      meta: 'Checked in today',
      icon: CalendarCheck,
      chip: 'bg-sky-500/15 text-sky-400',
      spot: 'rgb(2 132 199 / 0.18)',
      link: '/attendance'
    },
    {
      title: 'Month Revenue',
      value: parseFloat(stats?.stats?.monthRevenue || 0),
      format: formatINR,
      meta: format(new Date(), 'MMMM yyyy'),
      icon: IndianRupee,
      chip: 'bg-violet-500/15 text-violet-400',
      spot: 'rgb(124 58 237 / 0.18)',
      link: '/payments'
    },
    {
      title: 'Due Members',
      value: stats?.stats?.dueMembersCount || 0,
      format: countFormat,
      meta: 'Need renewal soon',
      icon: AlertCircle,
      chip: 'bg-rose-500/15 text-rose-400',
      spot: 'rgb(225 29 72 / 0.18)',
      link: '/due-members'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <div className="rounded-2xl overflow-hidden bg-ink-900 border border-white/10 animate-fade-up">
        <div className="hazard-stripe" />
        <div className="p-5 sm:p-8 md:p-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-px bg-primary-500 shrink-0" />
              <p className="text-xs font-semibold text-primary-400 uppercase tracking-[0.2em] truncate">
                {greeting()}, {user?.fullName?.split(' ')[0]}
              </p>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-wide leading-[0.95] break-words">
              {user?.gymName || 'Your Gym'}
            </h1>
            <p className="text-ink-400 mt-3 text-sm sm:text-base">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <Link to="/members/add" className="btn-primary self-start md:self-auto shrink-0">
            <Users size={18} />
            Add New Member
          </Link>
        </div>
      </div>

      {/* First-time onboarding checklist */}
      {totalMembers === 0 && (
        <div className="card animate-fade-up">
          <h2 className="text-lg font-bold text-white">Get {user?.gymName || 'your gym'} set up</h2>
          <p className="text-sm text-ink-400 mt-1 mb-6">Three quick steps to get GymFlow running for real.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: UserPlus, title: 'Add your first member', desc: 'Photo, contact details, and their membership plan.', to: '/members/add', chip: 'bg-primary-500/15 text-primary-400' },
              { icon: Receipt, title: 'Record a payment', desc: 'Log their joining fee so revenue starts tracking.', to: '/members', chip: 'bg-emerald-500/15 text-emerald-400' },
              { icon: QrCode, title: 'Set up check-in QR', desc: 'Print it at the entrance for self check-ins.', to: '/attendance', chip: 'bg-sky-500/15 text-sky-400' },
            ].map((step) => (
              <Link
                key={step.title}
                to={step.to}
                className="p-4 rounded-xl bg-black/30 border border-white/10 hover:border-primary-500/30 transition-colors"
              >
                <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${step.chip}`}>
                  <step.icon size={16} />
                </div>
                <p className="font-medium text-white text-sm mt-3">{step.title}</p>
                <p className="text-xs text-ink-400 mt-1">{step.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
        {statCards.map((stat, index) => (
          <SpotlightCard
            key={index}
            as={Link}
            to={stat.link}
            spotlightColor={stat.spot}
            className="card card-hover animate-fade-up"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${stat.chip}`}>
              <stat.icon size={20} strokeWidth={2.2} />
            </div>
            <p className="font-display text-4xl text-white mt-4 tracking-wide">
              <CountUp value={stat.value} format={stat.format} />
            </p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">{stat.title}</p>
              <ArrowUpRight size={15} className="text-ink-600 group-hover:text-primary-400 transition-colors -translate-y-0.5 group-hover:translate-x-0.5 duration-150" />
            </div>
            <p className="text-xs text-ink-500 mt-2.5 pt-2.5 border-t border-white/10">{stat.meta}</p>
          </SpotlightCard>
        ))}
      </div>

      {/* Revenue Trend */}
      <div className="card animate-fade-up" style={{ animationDelay: '200ms' }}>
        <div className="mb-2">
          <h2 className="text-lg font-bold text-white">Revenue — Last 30 Days</h2>
          <p className="text-sm text-ink-400">Daily payments received across your gym</p>
        </div>
        {revenueTrend ? (
          <RevenueTrendChart data={revenueTrend} />
        ) : (
          <div className="flex justify-center py-16">
            <div className="spinner w-8 h-8" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Due Members */}
        <div className="card animate-fade-up" style={{ animationDelay: '260ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white">Upcoming Dues</h2>
              <p className="text-sm text-ink-400">Renewals due within 7 days</p>
            </div>
            <Link to="/due-members" className="btn-ghost text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 text-sm">
              View All
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-1">
            {stats?.dueMembers?.length > 0 ? (
              stats.dueMembers.slice(0, 5).map((member) => (
                <Link
                  key={member.id}
                  to={`/members/${member.id}`}
                  className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.fullName}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="avatar-fallback w-10 h-10 text-sm">
                        {member.fullName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate">{member.fullName}</p>
                      <p className="text-sm text-ink-400 truncate">{member.membershipId}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className={member.isExpired ? 'badge-danger' : 'badge-warning'}>
                      {member.isExpired ? 'Expired' : `${member.daysUntilExpiry}d left`}
                    </span>
                    <p className="text-xs text-ink-500 mt-1.5">{formatINR(member.planAmount)}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-ink-400 text-center py-10 text-sm">Nothing due — you're all caught up.</p>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="card animate-fade-up" style={{ animationDelay: '320ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Payments</h2>
              <p className="text-sm text-ink-400">Latest transactions received</p>
            </div>
            <Link to="/payments" className="btn-ghost text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 text-sm">
              View All
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-1">
            {stats?.recentPayments?.length > 0 ? (
              stats.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
                      <IndianRupee size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate">{payment.member.fullName}</p>
                      <p className="text-sm text-ink-400">
                        {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-bold text-white">
                      {formatINR(payment.amount)}
                    </p>
                    <p className="text-xs text-ink-500 capitalize mt-0.5">{payment.paymentMethod}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-ink-400 text-center py-10 text-sm">No payments recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
