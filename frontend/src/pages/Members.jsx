import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, Phone, Mail } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMembers();
  }, [statusFilter]);

  const fetchMembers = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await axios.get('/api/members', { params });
      setMembers(response.data.members);
    } catch (error) {
      toast.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.membershipId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phoneNumber.includes(searchTerm)
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600 mt-2">Manage your gym members</p>
        </div>
        
        <Link to="/members/add" className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Member</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, ID, or phone..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input md:w-48"
          >
            <option value="all">All Members</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Members Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const latestMembership = member.memberships[0];
            const isExpiringSoon = latestMembership && 
              new Date(latestMembership.endDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            return (
              <Link 
                key={member.id} 
                to={`/members/${member.id}`}
                className="card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-2xl text-gray-600 font-bold">
                        {member.fullName.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{member.fullName}</h3>
                        <p className="text-sm text-gray-500">{member.membershipId}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1">
                      {member.phoneNumber && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone size={14} className="mr-2" />
                          {member.phoneNumber}
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail size={14} className="mr-2" />
                          {member.email}
                        </div>
                      )}
                    </div>

                    {latestMembership && (
                      <div className={`mt-3 p-2 rounded text-xs ${
                        isExpiringSoon 
                          ? 'bg-yellow-50 text-yellow-700' 
                          : 'bg-gray-50 text-gray-700'
                      }`}>
                        {latestMembership.planName} - 
                        Expires {format(new Date(latestMembership.endDate), 'MMM dd, yyyy')}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-gray-600">Attendance:</span>
                      <span className="font-medium">{member._count?.attendance || 0} visits</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Users className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Members Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Try adjusting your search criteria' 
              : 'Get started by adding your first member'}
          </p>
          {!searchTerm && (
            <Link to="/members/add" className="btn-primary inline-flex items-center space-x-2">
              <Plus size={20} />
              <span>Add First Member</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Members;
