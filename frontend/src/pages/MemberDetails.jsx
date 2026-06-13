import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Phone, Mail, MapPin, Calendar, DollarSign, 
  CreditCard, Plus, CheckCircle 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  const latestMembership = member?.memberships?.[0];
  const latestPayment = member?.payments?.[0];

  return (
    <div className="space-y-6">
      <div>
        <button 
          onClick={() => navigate('/members')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Members
        </button>
      </div>

      {/* Member Header */}
      <div className="card">
        <div className="flex items-start space-x-6">
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={member.fullName}
              className="w-32 h-32 rounded-lg object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-lg bg-gray-300 flex items-center justify-center">
              <span className="text-4xl text-gray-600 font-bold">
                {member.fullName.charAt(0)}
              </span>
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{member.fullName}</h1>
                <p className="text-gray-500 mt-1">{member.membershipId}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                member.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {member.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {member.phoneNumber && (
                <div className="flex items-center text-gray-600">
                  <Phone size={18} className="mr-3" />
                  {member.phoneNumber}
                </div>
              )}
              {member.email && (
                <div className="flex items-center text-gray-600">
                  <Mail size={18} className="mr-3" />
                  {member.email}
                </div>
              )}
              {member.address && (
                <div className="flex items-center text-gray-600">
                  <MapPin size={18} className="mr-3" />
                  {member.address}
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <Calendar size={18} className="mr-3" />
                Joined {format(new Date(member.joiningDate), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Membership */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Current Membership</h2>
          <button 
            onClick={() => setShowMembershipModal(true)}
            className="btn-primary flex items-center space-x-2 text-sm"
          >
            <Plus size={16} />
            <span>Add/Renew</span>
          </button>
        </div>

        {latestMembership ? (
          <div className="p-4 bg-primary-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-bold text-gray-900">{latestMembership.planName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-bold text-gray-900">{latestMembership.planDuration} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-bold text-gray-900">
                  {format(new Date(latestMembership.endDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-bold text-primary-600">
                  ${parseFloat(latestMembership.planAmount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No active membership</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment History */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="btn-primary flex items-center space-x-2 text-sm"
            >
              <Plus size={16} />
              <span>Add Payment</span>
            </button>
          </div>

          <div className="space-y-3">
            {member.payments?.length > 0 ? (
              member.payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      ${parseFloat(payment.amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm capitalize text-gray-700">{payment.paymentMethod}</p>
                    {payment.remarks && (
                      <p className="text-xs text-gray-500">{payment.remarks}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No payment history</p>
            )}
          </div>
        </div>

        {/* Attendance */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Attendance</h2>
          
          <div className="space-y-3">
            {member.attendance?.length > 0 ? (
              member.attendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-green-600" size={20} />
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(new Date(record.checkInTime), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(record.checkInTime), 'hh:mm a')}
                        {record.checkOutTime && ` - ${format(new Date(record.checkOutTime), 'hh:mm a')}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No attendance records</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Visits:</span>
              <span className="font-bold text-primary-600 text-xl">
                {member.attendance?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals would go here - simplified for now */}
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
    planAmount: '50',
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add Membership</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Plan Name</label>
            <select
              className="input"
              value={formData.planName}
              onChange={(e) => {
                const plan = e.target.value;
                let duration = '30';
                let amount = '50';
                if (plan === 'Quarterly') { duration = '90'; amount = '135'; }
                if (plan === 'Half-Yearly') { duration = '180'; amount = '250'; }
                if (plan === 'Yearly') { duration = '365'; amount = '480'; }
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
            <label className="label">Amount ($)</label>
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
          <div className="flex space-x-2">
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Record Payment</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Amount ($)</label>
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
          <div className="flex space-x-2">
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
