import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Phone, Mail, MapPin, DollarSign } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const DueMembers = () => {
  const [dueMembers, setDueMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState(7);

  useEffect(() => {
    fetchDueMembers();
  }, [daysFilter]);

  const fetchDueMembers = async () => {
    try {
      const response = await axios.get(`/api/dashboard/due-members?days=${daysFilter}`);
      setDueMembers(response.data.dueMembers);
    } catch (error) {
      toast.error('Failed to fetch due members');
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Due Members</h1>
          <p className="text-gray-600 mt-2">Members with expiring or expired memberships</p>
        </div>
        
        <select
          value={daysFilter}
          onChange={(e) => setDaysFilter(Number(e.target.value))}
          className="input w-48"
        >
          <option value={3}>Next 3 days</option>
          <option value={7}>Next 7 days</option>
          <option value={15}>Next 15 days</option>
          <option value={30}>Next 30 days</option>
        </select>
      </div>

      {dueMembers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dueMembers.map((member) => (
            <div key={member.id} className="card border-l-4 border-l-red-500">
              <div className="flex items-start space-x-4">
                {/* Member Photo */}
                <div className="flex-shrink-0">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.fullName}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gray-300 flex items-center justify-center">
                      <span className="text-3xl text-gray-600 font-bold">
                        {member.fullName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Member Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{member.fullName}</h3>
                      <p className="text-sm text-gray-500">{member.membershipId}</p>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      member.isExpired 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {member.isExpired ? 'Expired' : `${member.daysUntilExpiry} days left`}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {member.phoneNumber && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone size={16} className="mr-2" />
                        {member.phoneNumber}
                      </div>
                    )}
                    {member.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail size={16} className="mr-2" />
                        {member.email}
                      </div>
                    )}
                    {member.address && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={16} className="mr-2" />
                        {member.address}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Current Plan:</span>
                      <span className="font-medium text-gray-900">{member.planName}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">End Date:</span>
                      <span className="font-medium text-gray-900">
                        {format(new Date(member.membershipEndDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Next Fee:</span>
                      <span className="font-bold text-primary-600 text-lg">
                        ${parseFloat(member.nextFeeAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <Link 
                      to={`/members/${member.id}`}
                      className="flex-1 btn-primary text-center text-sm py-2"
                    >
                      View Details
                    </Link>
                    <a 
                      href={`tel:${member.phoneNumber}`}
                      className="btn-secondary text-sm py-2 px-4"
                    >
                      <Phone size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Due Members</h3>
          <p className="text-gray-600">
            All memberships are up to date for the selected period.
          </p>
        </div>
      )}
    </div>
  );
};

export default DueMembers;
