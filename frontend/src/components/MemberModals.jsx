import { useState } from 'react';
import { X, Camera, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { digitsOnly, localDigitsFromStored, toStoredPhone } from '../utils/phone';

// Shared between the gym owner's own Member Details page and the super
// admin's member page — same edit/delete capability, just pointed at the
// same underlying /api/members, /api/memberships, /api/payments,
// /api/attendance endpoints (which allow a super admin to act on any gym).

// Edit Member Modal Component
export const EditMemberModal = ({ member, onClose, onSuccess }) => {
  const [photoPreview, setPhotoPreview] = useState(member.photoUrl || null);
  const [formData, setFormData] = useState({
    fullName: member.fullName || '',
    email: member.email || '',
    phoneNumber: localDigitsFromStored(member.phoneNumber),
    dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
    gender: member.gender || '',
    address: member.address || '',
    emergencyContact: member.emergencyContact || '',
    joiningDate: member.joiningDate ? member.joiningDate.split('T')[0] : '',
    isActive: member.isActive,
    photo: null
  });
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.phoneNumber.length !== 10) {
      toast.error('Enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('phoneNumber', toStoredPhone(formData.phoneNumber));
      data.append('dateOfBirth', formData.dateOfBirth);
      data.append('gender', formData.gender);
      data.append('address', formData.address);
      data.append('emergencyContact', formData.emergencyContact);
      data.append('joiningDate', formData.joiningDate);
      data.append('isActive', formData.isActive);
      if (formData.photo) data.append('photo', formData.photo);

      await axios.put(`/api/members/${member.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Member updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel max-w-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Edit Member</h3>
          <button onClick={onClose} className="text-ink-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="flex justify-center">
            <div className="relative">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-white/5"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center ring-4 ring-white/5">
                  <User className="text-ink-500" size={30} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="edit-photo-upload"
              />
              <label
                htmlFor="edit-photo-upload"
                className="absolute -bottom-1 -right-1 bg-primary-600 text-white rounded-full p-2 cursor-pointer hover:bg-primary-700 shadow-soft transition-colors"
              >
                <Camera size={13} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                type="text"
                className="input"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Phone Number *</label>
              <div className="flex">
                <span className="input rounded-r-none border-r-0 !w-16 shrink-0 flex items-center justify-center text-ink-400">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  className="input rounded-l-none"
                  placeholder="9876543210"
                  maxLength={10}
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: digitsOnly(e.target.value).slice(0, 10) })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input
                type="date"
                className="input"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Gender</label>
              <select
                className="input"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Emergency Contact</label>
              <input
                type="tel"
                className="input"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Joining Date</label>
              <input
                type="date"
                className="input"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Address</label>
            <textarea
              className="input"
              rows="3"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
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

// Membership Modal Component — handles both "Add / Renew" (no `membership`
// prop) and editing an existing record (`membership` prop supplied).
export const MembershipModal = ({ memberId, membership, onClose, onSuccess }) => {
  const isEdit = Boolean(membership);
  const [formData, setFormData] = useState({
    planName: membership?.planName || 'Monthly',
    planDuration: String(membership?.planDuration ?? '30'),
    planAmount: String(membership?.planAmount ?? '1800'),
    startDate: membership?.startDate ? membership.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: membership?.endDate ? membership.endDate.split('T')[0] : '',
    status: membership?.status || 'active'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await axios.put(`/api/memberships/${membership.id}`, formData);
        toast.success('Membership updated successfully!');
      } else {
        await axios.post('/api/memberships', { ...formData, memberId });
        toast.success('Membership added successfully!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'add'} membership`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">{isEdit ? 'Edit Membership' : 'Add Membership'}</h3>
          <button onClick={onClose} className="text-ink-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Plan Name</label>
            <select
              className="input"
              value={formData.planName}
              onChange={(e) => {
                const plan = e.target.value;
                if (isEdit) {
                  setFormData({ ...formData, planName: plan });
                  return;
                }
                let duration = '30';
                let amount = '1800';
                if (plan === 'Quarterly') { duration = '90'; amount = '4800'; }
                if (plan === 'Half-Yearly') { duration = '180'; amount = '8500'; }
                if (plan === 'Yearly') { duration = '365'; amount = '15000'; }
                setFormData({ ...formData, planName: plan, planDuration: duration, planAmount: amount });
              }}
            >
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Half-Yearly</option>
              <option>Yearly</option>
              {!['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'].includes(formData.planName) && (
                <option>{formData.planName}</option>
              )}
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
            <label className="label">Amount (₹)</label>
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
          {isEdit && (
            <>
              <div>
                <label className="label">End Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </>
          )}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Membership'}
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

// Payment Modal Component — handles both "Add Payment" (no `payment` prop)
// and editing an existing record (`payment` prop supplied).
export const PaymentModal = ({ memberId, payment, onClose, onSuccess }) => {
  const isEdit = Boolean(payment);
  const [formData, setFormData] = useState({
    amount: payment ? String(payment.amount) : '',
    paymentMethod: payment?.paymentMethod || 'cash',
    remarks: payment?.remarks || '',
    paymentDate: payment?.paymentDate ? payment.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await axios.put(`/api/payments/${payment.id}`, formData);
        toast.success('Payment updated successfully!');
      } else {
        await axios.post('/api/payments', { ...formData, memberId });
        toast.success('Payment recorded successfully!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'record'} payment`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">{isEdit ? 'Edit Payment' : 'Record Payment'}</h3>
          <button onClick={onClose} className="text-ink-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Amount (₹)</label>
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
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Record Payment'}
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

// Attendance Modal Component — edits check-in / check-out time on an
// existing record (e.g. to fix a missed checkout or a mistaken check-in).
export const AttendanceModal = ({ record, onClose, onSuccess }) => {
  const toLocalInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [formData, setFormData] = useState({
    checkInTime: toLocalInput(record.checkInTime),
    checkOutTime: toLocalInput(record.checkOutTime)
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`/api/attendance/${record.id}`, {
        checkInTime: formData.checkInTime ? new Date(formData.checkInTime).toISOString() : undefined,
        checkOutTime: formData.checkOutTime ? new Date(formData.checkOutTime).toISOString() : ''
      });
      toast.success('Attendance updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Edit Attendance</h3>
          <button onClick={onClose} className="text-ink-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Check-in Time</label>
            <input
              type="datetime-local"
              className="input"
              value={formData.checkInTime}
              onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Check-out Time</label>
            <input
              type="datetime-local"
              className="input"
              value={formData.checkOutTime}
              onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
            />
            <p className="text-xs text-ink-500 mt-1.5">Leave blank if the member hasn't checked out.</p>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
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
