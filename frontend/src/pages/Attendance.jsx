import { useState, useEffect, useRef } from 'react';
import { Calendar, CheckCircle2, Clock, Users, X, QrCode, Copy, LogOut } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import QRCode from '../components/QRCode';

const POLL_INTERVAL = 8000;

const Attendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState('');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const prevCountRef = useRef(0);

  const checkInUrl = `${window.location.origin}/checkin/${user?.id}`;

  useEffect(() => {
    fetchTodayAttendance();
    fetchMembers();

    const interval = setInterval(() => fetchTodayAttendance(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const fetchTodayAttendance = async (silent = false) => {
    try {
      const response = await axios.get('/api/attendance/today');
      const next = response.data.attendance;

      if (silent && prevCountRef.current && next.length > prevCountRef.current) {
        const newest = next[0];
        toast.success(`${newest.member.fullName} just checked in`, { icon: '👋' });
      }
      prevCountRef.current = next.length;
      setAttendance(next);
    } catch (error) {
      if (!silent) toast.error('Failed to fetch attendance');
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
      setSelectedMember('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to record check-in');
    }
  };

  const handleCheckOut = async (attendanceId) => {
    try {
      await axios.post('/api/attendance/checkout', { attendanceId });
      toast.success('Checked out');
      fetchTodayAttendance();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to check out');
    }
  };

  const copyCheckInLink = () => {
    navigator.clipboard.writeText(checkInUrl);
    toast.success('Link copied');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="spinner w-12 h-12"></div>
    </div>;
  }

  const stillIn = attendance.filter((a) => !a.checkOutTime).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Today's check-ins and member attendance</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="btn-secondary"
          >
            <QrCode size={18} />
            <span>Check-in QR</span>
          </button>
          <button
            onClick={() => setShowCheckInModal(true)}
            className="btn-primary"
          >
            <CheckCircle2 size={18} />
            <span>Check-in Member</span>
          </button>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card bg-gradient-to-br from-ink-950 to-ink-900 border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ink-400 text-sm">Today's Check-ins</p>
              <p className="text-3xl font-bold text-white mt-2 tracking-tight">{attendance.length}</p>
              <p className="text-primary-400 text-xs mt-2 font-medium">{stillIn} currently in gym</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-500/15 ring-1 ring-primary-400/25">
              <Calendar size={22} className="text-primary-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ink-400 text-sm">Current Time</p>
              <p className="text-2xl font-bold text-white mt-2">
                {format(new Date(), 'hh:mm a')}
              </p>
              <p className="text-ink-500 text-sm mt-1">
                {format(new Date(), 'EEEE, MMM dd')}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/15 text-sky-400">
              <Clock size={22} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ink-400 text-sm">Active Members</p>
              <p className="text-2xl font-bold text-white mt-2">{members.length}</p>
              <p className="text-ink-500 text-sm mt-1">Total active members</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Users size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Today's Attendance</h2>
          <span className="flex items-center gap-1.5 text-xs text-ink-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>

        {attendance.length > 0 ? (
          <div className="space-y-1">
            {attendance.map((record) => (
              <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  {record.member.photoUrl ? (
                    <img
                      src={record.member.photoUrl}
                      alt={record.member.fullName}
                      className="w-11 h-11 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="avatar-fallback w-11 h-11 shrink-0">
                      {record.member.fullName.charAt(0)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="font-medium text-white truncate">{record.member.fullName}</h3>
                    <p className="text-sm text-ink-400">{record.member.membershipId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-auto">
                  <div className="text-right">
                    {record.checkOutTime ? (
                      <span className="badge-neutral">Checked Out</span>
                    ) : (
                      <span className="badge-success">In Gym</span>
                    )}
                    <p className="text-sm text-ink-500 mt-1.5">
                      {format(new Date(record.checkInTime), 'hh:mm a')}
                      {record.checkOutTime && ` – ${format(new Date(record.checkOutTime), 'hh:mm a')}`}
                    </p>
                  </div>
                  {!record.checkOutTime && (
                    <button
                      onClick={() => handleCheckOut(record.id)}
                      className="btn-secondary !py-1.5 !px-3 text-xs"
                      title="Check out"
                    >
                      <LogOut size={13} />
                      <span className="hidden sm:inline">Check Out</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-ink-500" size={26} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No Check-ins Yet</h3>
            <p className="text-ink-400 mb-5">Start recording attendance for today</p>
            <button
              onClick={() => setShowCheckInModal(true)}
              className="btn-primary inline-flex"
            >
              <CheckCircle2 size={18} />
              <span>Check-in First Member</span>
            </button>
          </div>
        )}
      </div>

      {/* Check-in QR Modal */}
      {showQrModal && (
        <div className="modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div className="modal-panel text-center" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Member Self Check-in</h3>
              <button onClick={() => setShowQrModal(false)} className="text-ink-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-ink-400 mb-5">
              Print this and put it up at the entrance. Members scan it with their phone camera to check themselves in.
            </p>
            <div className="bg-white p-4 rounded-2xl inline-block">
              <QRCode value={checkInUrl} size={220} />
            </div>
            <button
              onClick={copyCheckInLink}
              className="btn-secondary w-full mt-5 text-sm"
            >
              <Copy size={15} />
              Copy Link
            </button>
          </div>
        </div>
      )}

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div className="modal-backdrop" onClick={() => setShowCheckInModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Check-in Member</h3>
              <button onClick={() => setShowCheckInModal(false)} className="text-ink-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="mb-5">
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

            <div className="flex gap-2">
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
