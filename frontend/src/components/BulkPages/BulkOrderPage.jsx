import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, Users, Mail, User, Clock, Sparkles, Plus, Trash2, UserPlus } from 'lucide-react';

const BulkOrderPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventTime: '12:00',
    leaderName: '',
    leaderEmail: '',
    numberOfGroups: 1,
    maxMembersPerGroup: 12,
    description: ''
  });
  
  // State for members in the group
  const [members, setMembers] = useState([
    { name: '', email: '' }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update members array when maxMembersPerGroup changes
    if (name === 'maxMembersPerGroup') {
      const newMax = parseInt(value);
      const currentLength = members.length;
      
      if (newMax > currentLength) {
        // Add empty member fields
        const newMembers = [...members];
        for (let i = currentLength; i < newMax; i++) {
          newMembers.push({ name: '', email: '' });
        }
        setMembers(newMembers);
      } else if (newMax < currentLength) {
        // Remove extra member fields
        setMembers(members.slice(0, newMax));
      }
    }
  };

  // Handle member input changes
  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  // Add a new member manually
  const addMember = () => {
    if (members.length < formData.maxMembersPerGroup) {
      setMembers([...members, { name: '', email: '' }]);
    } else {
      toast.error(`Maximum ${formData.maxMembersPerGroup} members allowed`);
    }
  };

  // Remove a member
  const removeMember = (index) => {
    if (members.length > 1) {
      const updatedMembers = members.filter((_, i) => i !== index);
      setMembers(updatedMembers);
    } else {
      toast.error('At least one member is required');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all members have name and email
    const invalidMembers = members.filter(m => !m.name || !m.email);
    if (invalidMembers.length > 0) {
      toast.error('Please fill in all member names and emails');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/bulk-order/create-event', {
        eventName: formData.eventName,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        leaderName: formData.leaderName,
        leaderEmail: formData.leaderEmail,
        maxMembers: formData.maxMembersPerGroup,
        numberOfGroups: formData.numberOfGroups,
        description: formData.description,
        members: members
      });
      
      toast.success('Event created successfully!');
      // Navigate to meal selection page instead of dashboard
      navigate(`/bulk-order/meal-selection/${response.data.group._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-orange-100 rounded-full p-3 mb-4">
            <Sparkles className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">✨ Create New Bulk Event</h1>
          <p className="text-gray-600">Organize group meals for events, parties, or office lunches</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Event Details</h2>
            <p className="text-orange-100 text-sm">Fill in the information below to create your bulk order event</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Event Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="eventName"
                  required
                  value={formData.eventName}
                  onChange={handleChange}
                  placeholder="e.g., Q2 All-Hands · 30 May"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Event Date & Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="eventDate"
                    required
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Leader Information */}
            <div className="bg-orange-50 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <User className="w-4 h-4" /> Group Leader Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leader Name *
                  </label>
                  <input
                    type="text"
                    name="leaderName"
                    required
                    value={formData.leaderName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leader Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="leaderEmail"
                      required
                      value={formData.leaderEmail}
                      onChange={handleChange}
                      placeholder="leader@company.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Group Configuration */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Groups
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="numberOfGroups"
                    min="1"
                    max="20"
                    value={formData.numberOfGroups}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Members Per Group
                </label>
                <input
                  type="number"
                  name="maxMembersPerGroup"
                  min="1"
                  max="50"
                  value={formData.maxMembersPerGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum participants per group (up to 50)</p>
              </div>
            </div>

            {/* Members Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-orange-500" />
                  Group Members ({members.length}/{formData.maxMembersPerGroup})
                </h3>
                <button
                  type="button"
                  onClick={addMember}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Member
                </button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {members.map((member, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-600">Member {index + 1}</span>
                      {members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMember(index)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                          placeholder="Member name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Email *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            value={member.email}
                            onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                            placeholder="member@example.com"
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {members.length === 0 && (
                <p className="text-center text-gray-500 py-4">No members added yet. Click "Add Member" to add participants.</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Description (Optional)
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add any special instructions or notes for participants..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

           {/* Submit Button */}
<button
  type="button"
  onClick={() => {
    // For testing without backend, navigate with a mock groupId
    // You can replace this with an actual group ID from your form data if needed
    const mockGroupId = 'test-group-123';
    navigate(`/meal-selection/${mockGroupId}`);
  }}
  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg flex items-center justify-center gap-2"
>
  <Sparkles className="w-5 h-5" />
  Create Event →
</button>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              ✨ After creation, each member can select their meal
            </p>
          </form>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">👥</div>
            <h4 className="font-semibold">Group Leaders</h4>
            <p className="text-sm text-gray-600">Each group gets a leader to manage members</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🍽️</div>
            <h4 className="font-semibold">Meal Selection</h4>
            <p className="text-sm text-gray-600">Each member chooses their meal</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-semibold">Priority Prep</h4>
            <p className="text-sm text-gray-600">Subscribed users get faster service</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderPage;