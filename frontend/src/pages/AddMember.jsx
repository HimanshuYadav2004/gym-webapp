import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { digitsOnly, toStoredPhone } from '../utils/phone';

const AddMember = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    photo: null
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
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
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          data.append(key, key === 'phoneNumber' ? toStoredPhone(formData[key]) : formData[key]);
        }
      });

      const response = await axios.post('/api/members', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Member added successfully!');
      navigate(`/members/${response.data.member.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/members')}
          className="btn-ghost -ml-3 mb-3"
        >
          <ArrowLeft size={17} />
          Back to Members
        </button>
        <h1 className="page-title">Add New Member</h1>
        <p className="page-subtitle">Fill in the member details below</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-8">
        {/* Photo Upload */}
        <div className="flex justify-center">
          <div className="relative">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Preview"
                className="w-28 h-28 rounded-full object-cover ring-4 ring-white/5"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-white/5 flex items-center justify-center ring-4 ring-white/5">
                <User className="text-ink-500" size={36} />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="absolute -bottom-1 -right-1 bg-primary-600 text-white rounded-full p-2.5 cursor-pointer hover:bg-primary-700 shadow-soft transition-colors"
            >
              <Camera size={15} />
            </label>
          </div>
        </div>

        {/* Personal Information */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4 pb-3 border-b border-white/10">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">Full Name *</label>
              <input
                type="text"
                className="input"
                placeholder="Rohan Sharma"
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
                placeholder="rohan.sharma@gmail.com"
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
                placeholder="+91 98765 43210"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="label">Address</label>
          <textarea
            className="input"
            rows="3"
            placeholder="House No. 245, Sector 22, Chandigarh, 160022"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary py-3"
          >
            {loading ? 'Adding Member...' : 'Add Member'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/members')}
            className="btn-secondary py-3 px-6"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMember;
