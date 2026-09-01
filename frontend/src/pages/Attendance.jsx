import { useState, useEffect, useRef } from 'react';
import { Calendar, CheckCircle2, Clock, Users, X, QrCode, Copy, LogOut, Download, Filter, MapPin, ShieldCheck, ShieldOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import QRCode from '../components/QRCode';
import { downloadCSV } from '../utils/csv';

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

  const [reportRange, setReportRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [reportRows, setReportRows] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const [locationStatus, setLocationStatus] = useState(null);
  const [locationSaving, setLocationSaving] = useState(false);

  const checkInUrl = `${window.location.origin}/checkin/${user?.id}`;

  useEffect(() => {
    axios.get('/api/attendance/location').then((res) => setLocationStatus(res.data)).catch(() => {});
  }, []);

  const enableLocationLock = () => {
    if (!navigator.geolocation) {
      toast.error('Your browser doesn\'t support location access');
      return;
    }
    setLocationSaving(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await axios.put('/api/attendance/location', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          toast.success('Gym location saved — check-in now requires being on-site');
          setLocationStatus((s) => ({ ...s, isSet: true }));
        } catch {
          toast.error('Failed to save gym location');
        } finally {
          setLocationSaving(false);
        }
      },
      () => {
        toast.error('Location permission denied — allow it in your browser to set this up');
        setLocationSaving(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const disableLocationLock = async () => {
    try {
      await axios.delete('/api/attendance/location');
      setLocationStatus((s) => ({ ...s, isSet: false }));
      toast.success('Location requirement removed — check-in works from anywhere again');
    } catch {
      toast.error('Failed to update setting');
    }
  };

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

  const fetchReport = async () => {
    setReportLoading(true);
    try {
      const res = await axios.get('/api/attendance/report', {
        params: { startDate: reportRange.startDate, endDate: `${reportRange.endDate}T23:59:59` }
      });
      setReportRows(res.data.attendance);
    } catch {
      toast.error('Failed to fetch attendance report');
    } finally {
      setReportLoading(false);
    }
  };

  const exportReport = () => {
    downloadCSV(
      `attendance-${reportRange.startDate}-to-${reportRange.endDate}.csv`,
      ['Date', 'Member', 'Membership ID', 'Check-In', 'Check-Out'],
      reportRows.map((r) => [
        format(new Date(r.checkInTime), 'yyyy-MM-dd'),
        r.member.fullName,
        r.member.membershipId,
        format(new Date(r.checkInTime), 'hh:mm a'),
        r.checkOutTime ? format(new Date(r.checkOutTime), 'hh:mm a') : ''
      ])
    );
    toast.success('Attendance exported');
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

      {/* Location-locked check-in */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${
              locationStatus?.isSet ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-ink-400'
            }`}>
              <MapPin size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white">On-Site Check-In</h2>
              <p className="text-sm text-ink-400 mt-0.5">
                {locationStatus?.isSet
                  ? `Members must be within ${locationStatus.radiusMeters}m of the gym to check in.`
                  : "Members can currently check in from anywhere. Lock it to this gym's location to stop that."}
              </p>
            </div>
          </div>

          {locationStatus?.isSet ? (
            <button onClick={disableLocationLock} className="btn-secondary shrink-0 text-sm">
              <ShieldOff size={15} />
              <span>Turn Off</span>
            </button>
          ) : (
            <button onClick={enableLocationLock} disabled={locationSaving} className="btn-primary shrink-0 text-sm">
              <ShieldCheck size={15} />
              <span>{locationSaving ? 'Getting location...' : 'Lock to This Location'}</span>
            </button>
          )}
        </div>
        {!locationStatus?.isSet && (
          <p className="text-xs text-ink-500 mt-4 pt-4 border-t border-white/10">
            Tap "Lock to This Location" while you're physically at the gym — it uses your current device location as the gym's spot.
          </p>
        )}
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

      {/* Attendance Report / Export */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Attendance Report</h2>
            <p className="text-sm text-ink-400">Look up and export check-ins for any date range</p>
          </div>
          {reportRows && (
            <button onClick={exportReport} className="btn-secondary self-start sm:self-auto" disabled={reportRows.length === 0}>
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end mb-2">
          <div className="flex-1 w-full">
            <label className="text-xs text-ink-400 mb-1.5 block">Start Date</label>
            <input
              type="date"
              className="input"
              value={reportRange.startDate}
              onChange={(e) => setReportRange({ ...reportRange, startDate: e.target.value })}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="text-xs text-ink-400 mb-1.5 block">End Date</label>
            <input
              type="date"
              className="input"
              value={reportRange.endDate}
              onChange={(e) => setReportRange({ ...reportRange, endDate: e.target.value })}
            />
          </div>
          <button onClick={fetchReport} disabled={reportLoading} className="btn-primary w-full md:w-auto">
            <Filter size={16} />
            <span>{reportLoading ? 'Loading...' : 'Run Report'}</span>
          </button>
        </div>

        {reportRows && (
          <>
            <p className="text-sm text-ink-400 mt-4 mb-3">
              <span className="font-bold text-white">{reportRows.length}</span> check-in{reportRows.length === 1 ? '' : 's'} between{' '}
              {format(new Date(reportRange.startDate), 'MMM dd, yyyy')} and {format(new Date(reportRange.endDate), 'MMM dd, yyyy')}
            </p>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="table-head">Member</th>
                    <th className="table-head">Date</th>
                    <th className="table-head">Check-In</th>
                    <th className="table-head">Check-Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reportRows.length > 0 ? (
                    reportRows.map((r) => (
                      <tr key={r.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{r.member.fullName}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-ink-300">{format(new Date(r.checkInTime), 'MMM dd, yyyy')}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-ink-300">{format(new Date(r.checkInTime), 'hh:mm a')}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-ink-300">
                          {r.checkOutTime ? format(new Date(r.checkOutTime), 'hh:mm a') : '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-12 text-center text-ink-400 text-sm">No check-ins in that range</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
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
