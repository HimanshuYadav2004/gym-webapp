import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState('');
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  useEffect(() => {
    fetchTodayAttendance();
    fetchMembers();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get('/api/attendance/today');
      setAttendance(response.data.attendance);
    } catch (error) {
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get('/api/members?status=active');
      setMembers(response.data.members);
    } catch (error) {
      toast.error('Failed to fetch members');
    }
  };

  const handleCheckIn = async (memberId) => {
    try {
      await axios.post('/api/attendance/checkin', { memberId });
      toast.success('Check-in recorded successfully!');
      fetchTodayAttendance();
      setShowCheckInModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to record check-in');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-2">Today's check-ins and member attendance</p>
        </div>
        
        <button 
          onClick={() => setShowCheckInModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <CheckCircle size={20} />
          <span>Check-in Member</span>
        </button>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100">Today's Check-ins</p>
              <p className="text-4xl font-bold mt-2">{attendance.length}</p>
            </div>
            <Calendar size={48} className="text-primary-200 opacity-50" />
          </div>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm">Current Time</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {format(new Date(), 'hh:mm a')}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {format(new Date(), 'EEEE, MMM dd, yyyy')}
          </p>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm">Active Members</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {members.length}
          </p>
          <p className="text-gray-500 text-sm mt-1">Total active members</p>
        </div>
      </div>

      {/* Attendance List */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Attendance</h2>
        
        {attendance.length > 0 ? (
          <div className="space-y-3">
            {attendance.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  {record.member.photoUrl ? (
                    <img
                      src={record.member.photoUrl}
                      alt={record.member.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 font-bold">
                        {record.member.fullName.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium text-gray-900">{record.member.fullName}</h3>
                    <p className="text-sm text-gray-500">{record.member.membershipId}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center text-green-600">
                    <CheckCircle size={16} className="mr-2" />
                    <span className="font-medium">Checked In</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(record.checkInTime), 'hh:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Check-ins Yet</h3>
            <p className="text-gray-600 mb-4">Start recording attendance for today</p>
            <button 
              onClick={() => setShowCheckInModal(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <CheckCircle size={20} />
              <span>Check-in First Member</span>
            </button>
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Check-in Member</h3>
            
            <div className="mb-4">
              <label className="label">Select Member</label>
              <select
                className="input"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
              >
                <option value="">Choose a member...</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.fullName} - {member.membershipId}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleCheckIn(selectedMember)}
                disabled={!selectedMember}
                className="flex-1 btn-primary"
              >
                Check-in
              </button>
              <button
                onClick={() => {
                  setShowCheckInModal(false);
                  setSelectedMember('');
                }}
                className="btn-secondary px-4"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
