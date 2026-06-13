import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, DollarSign, Calendar, AlertCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
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
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  const statCards = [
    {
      title: 'Total Members',
      value: stats?.stats?.totalMembers || 0,
      icon: Users,
      color: 'bg-blue-500',
      link: '/members'
    },
    {
      title: 'Active Members',
      value: stats?.stats?.activeMembers || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      link: '/members?status=active'
    },
    {
      title: "Today's Attendance",
      value: stats?.stats?.todayAttendance || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      link: '/attendance'
    },
    {
      title: 'Month Revenue',
      value: `$${parseFloat(stats?.stats?.monthRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      link: '/payments'
    },
    {
      title: 'Due Members',
      value: stats?.stats?.dueMembersCount || 0,
      icon: AlertCircle,
      color: 'bg-red-500',
      link: '/due-members'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your gym overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <Link 
            key={index} 
            to={stat.link}
            className="card hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Due Members */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Dues</h2>
            <Link to="/due-members" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {stats?.dueMembers?.length > 0 ? (
              stats.dueMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {member.fullName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{member.fullName}</p>
                      <p className="text-sm text-gray-500">{member.membershipId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${member.isExpired ? 'text-red-600' : 'text-yellow-600'}`}>
                      {member.isExpired ? 'Expired' : `${member.daysUntilExpiry} days`}
                    </p>
                    <p className="text-xs text-gray-500">${parseFloat(member.planAmount).toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming dues</p>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Payments</h2>
            <Link to="/payments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {stats?.recentPayments?.length > 0 ? (
              stats.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{payment.member.fullName}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ${parseFloat(payment.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{payment.paymentMethod}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No recent payments</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
