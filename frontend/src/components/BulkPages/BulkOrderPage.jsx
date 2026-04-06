import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, Users, Mail, User, Clock, Sparkles, Plus, Trash2, UserPlus, AlertCircle } from 'lucide-react';

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
  
  // Validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [memberErrors, setMemberErrors] = useState([{ name: '', email: '' }]);

  // ============ VALIDATION FUNCTIONS ============

  // Email validation - checks for @ symbol and proper format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email (e.g., name@domain.com)';
    if (!email.includes('@')) return 'Email must contain @ symbol';
    if (email.startsWith('@') || email.endsWith('@')) return 'Email cannot start or end with @';
    if (email.includes('..')) return 'Email cannot contain consecutive dots';
    return '';
  };

  // Name validation - checks for special characters and length
  const validateName = (name, fieldName = 'Name') => {
    if (!name) return `${fieldName} is required`;
    if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
    if (name.trim().length > 50) return `${fieldName} must be less than 50 characters`;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(name)) return `${fieldName} cannot contain special characters`;
    return '';
  };

  // Event name validation
  const validateEventName = (name) => {
    if (!name) return 'Event name is required';
    if (name.trim().length < 3) return 'Event name must be at least 3 characters';
    if (name.trim().length > 100) return 'Event name must be less than 100 characters';
    return '';
  };

  // Event date validation - prevents past dates
  const validateEventDate = (date) => {
    if (!date) return 'Event date is required';
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) return 'Event date cannot be in the past';
    return '';
  };

  // Event time validation
  const validateEventTime = (time) => {
    if (!time) return 'Event time is required';
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) return 'Please enter a valid time (HH:MM)';
    return '';
  };

  // Number of groups validation
  const validateNumberOfGroups = (num) => {
    const number = parseInt(num);
    if (isNaN(number)) return 'Number of groups is required';
    if (number < 1) return 'Must have at least 1 group';
    if (number > 20) return 'Maximum 20 groups allowed';
    return '';
  };

  // Max members per group validation
  const validateMaxMembers = (num) => {
    const number = parseInt(num);
    if (isNaN(number)) return 'Max members is required';
    if (number < 1) return 'Must have at least 1 member per group';
    if (number > 50) return 'Maximum 50 members per group allowed';
    return '';
  };

  // Main form validation - checks all fields
  const validateForm = () => {
    const newErrors = {};
    
    newErrors.eventName = validateEventName(formData.eventName);
    newErrors.eventDate = validateEventDate(formData.eventDate);
    newErrors.eventTime = validateEventTime(formData.eventTime);
    newErrors.leaderName = validateName(formData.leaderName, 'Leader name');
    newErrors.leaderEmail = validateEmail(formData.leaderEmail);
    newErrors.numberOfGroups = validateNumberOfGroups(formData.numberOfGroups);
    newErrors.maxMembersPerGroup = validateMaxMembers(formData.maxMembersPerGroup);
    
    // Validate all members
    const newMemberErrors = members.map(member => ({
      name: validateName(member.name, 'Member name'),
      email: validateEmail(member.email)
    }));
    
    setMemberErrors(newMemberErrors);
    
    // Check if any member has errors
    const hasMemberErrors = newMemberErrors.some(m => m.name || m.email);
    
    // Check if any required fields are empty
    const hasErrors = Object.values(newErrors).some(error => error);
    
    setErrors(newErrors);
    
    return !hasErrors && !hasMemberErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Update members array when maxMembersPerGroup changes
    if (name === 'maxMembersPerGroup') {
      const newMax = parseInt(value);
      const currentLength = members.length;
      
      if (!isNaN(newMax)) {
        if (newMax > currentLength) {
          // Add empty member fields
          const newMembers = [...members];
          const newMemberErrorsList = [...memberErrors];
          for (let i = currentLength; i < newMax; i++) {
            newMembers.push({ name: '', email: '' });
            newMemberErrorsList.push({ name: '', email: '' });
          }
          setMembers(newMembers);
          setMemberErrors(newMemberErrorsList);
        } else if (newMax < currentLength) {
          // Remove extra member fields
          setMembers(members.slice(0, newMax));
          setMemberErrors(memberErrors.slice(0, newMax));
        }
      }
    }
  };

  // Handle blur events to validate when user leaves a field
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate on blur
    let error = '';
    switch(field) {
      case 'eventName':
        error = validateEventName(formData.eventName);
        break;
      case 'eventDate':
        error = validateEventDate(formData.eventDate);
        break;
      case 'eventTime':
        error = validateEventTime(formData.eventTime);
        break;
      case 'leaderName':
        error = validateName(formData.leaderName, 'Leader name');
        break;
      case 'leaderEmail':
        error = validateEmail(formData.leaderEmail);
        break;
      case 'numberOfGroups':
        error = validateNumberOfGroups(formData.numberOfGroups);
        break;
      case 'maxMembersPerGroup':
        error = validateMaxMembers(formData.maxMembersPerGroup);
        break;
      default:
        break;
    }
    
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle member input changes with validation
  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
    
    // Validate member field
    const updatedMemberErrors = [...memberErrors];
    if (field === 'name') {
      updatedMemberErrors[index].name = validateName(value, 'Member name');
    } else if (field === 'email') {
      updatedMemberErrors[index].email = validateEmail(value);
    }
    setMemberErrors(updatedMemberErrors);
  };

  // Add a new member manually
  const addMember = () => {
    if (members.length < formData.maxMembersPerGroup) {
      setMembers([...members, { name: '', email: '' }]);
      setMemberErrors([...memberErrors, { name: '', email: '' }]);
    } else {
      toast.error(`Maximum ${formData.maxMembersPerGroup} members allowed`);
    }
  };

  // Remove a member
  const removeMember = (index) => {
    if (members.length > 1) {
      const updatedMembers = members.filter((_, i) => i !== index);
      const updatedMemberErrors = memberErrors.filter((_, i) => i !== index);
      setMembers(updatedMembers);
      setMemberErrors(updatedMemberErrors);
    } else {
      toast.error('At least one member is required');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = ['eventName', 'eventDate', 'eventTime', 'leaderName', 'leaderEmail', 'numberOfGroups', 'maxMembersPerGroup'];
    const touchedFields = {};
    allFields.forEach(field => { touchedFields[field] = true; });
    setTouched(touchedFields);
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    // Check if any members are empty
    const emptyMembers = members.some(m => !m.name.trim() || !m.email.trim());
    if (emptyMembers) {
      toast.error('Please fill in all member names and emails');
      return;
    }
    
    setLoading(true);
    
    try {
      // Try to create event with backend
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
      // Navigate to meal selection page with the actual group ID from backend
      navigate(`/meal-selection/${response.data.group._id}`);
      
    } catch (error) {
      console.error('Backend error:', error);
      
      // If backend is not running or there's an error, use mock data for testing
      if (error.code === 'ERR_NETWORK' || error.response?.status === 500) {
        toast.error('Backend not available. Using demo mode...');
        
        // Create a mock group ID for testing
        const mockGroupId = `mock-${Date.now()}`;
        
        // Store mock data in localStorage for the meal selection page
        localStorage.setItem('mockGroupData', JSON.stringify({
          groupId: mockGroupId,
          eventName: formData.eventName,
          eventDate: formData.eventDate,
          eventTime: formData.eventTime,
          leaderName: formData.leaderName,
          leaderEmail: formData.leaderEmail,
          members: members,
          description: formData.description
        }));
        
        // Navigate with mock data
        navigate(`/meal-selection/${mockGroupId}`, {
          state: {
            groupInfo: {
              _id: mockGroupId,
              name: formData.eventName,
              eventDate: formData.eventDate,
              leader: formData.leaderName
            },
            members: members,
            isMockData: true
          }
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to create event');
      }
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
                Event Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className={`h-5 w-5 ${touched.eventName && errors.eventName ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  name="eventName"
                  required
                  value={formData.eventName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('eventName')}
                  placeholder="e.g., Q2 All-Hands · 30 May"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                    touched.eventName && errors.eventName 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-orange-500 focus:border-transparent'
                  }`}
                />
              </div>
              {touched.eventName && errors.eventName && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.eventName}
                </p>
              )}
            </div>

            {/* Event Date & Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className={`h-5 w-5 ${touched.eventDate && errors.eventDate ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="date"
                    name="eventDate"
                    required
                    value={formData.eventDate}
                    onChange={handleChange}
                    onBlur={() => handleBlur('eventDate')}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                      touched.eventDate && errors.eventDate
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-orange-500'
                    }`}
                  />
                </div>
                {touched.eventDate && errors.eventDate && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.eventDate}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className={`h-5 w-5 ${touched.eventTime && errors.eventTime ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="time"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleChange}
                    onBlur={() => handleBlur('eventTime')}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                      touched.eventTime && errors.eventTime
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-orange-500'
                    }`}
                  />
                </div>
                {touched.eventTime && errors.eventTime && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.eventTime}
                  </p>
                )}
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
                    Leader Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className={`h-5 w-5 ${touched.leaderName && errors.leaderName ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="text"
                      name="leaderName"
                      required
                      value={formData.leaderName}
                      onChange={handleChange}
                      onBlur={() => handleBlur('leaderName')}
                      placeholder="Your full name"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                        touched.leaderName && errors.leaderName
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-orange-500'
                      }`}
                    />
                  </div>
                  {touched.leaderName && errors.leaderName && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.leaderName}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leader Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className={`h-5 w-5 ${touched.leaderEmail && errors.leaderEmail ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="email"
                      name="leaderEmail"
                      required
                      value={formData.leaderEmail}
                      onChange={handleChange}
                      onBlur={() => handleBlur('leaderEmail')}
                      placeholder="leader@company.com"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                        touched.leaderEmail && errors.leaderEmail
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-orange-500'
                      }`}
                    />
                  </div>
                  {touched.leaderEmail && errors.leaderEmail && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.leaderEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Group Configuration */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Groups <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className={`h-5 w-5 ${touched.numberOfGroups && errors.numberOfGroups ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="number"
                    name="numberOfGroups"
                    min="1"
                    max="20"
                    value={formData.numberOfGroups}
                    onChange={handleChange}
                    onBlur={() => handleBlur('numberOfGroups')}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                      touched.numberOfGroups && errors.numberOfGroups
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-orange-500'
                    }`}
                  />
                </div>
                {touched.numberOfGroups && errors.numberOfGroups && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.numberOfGroups}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Members Per Group <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="maxMembersPerGroup"
                  min="1"
                  max="50"
                  value={formData.maxMembersPerGroup}
                  onChange={handleChange}
                  onBlur={() => handleBlur('maxMembersPerGroup')}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                    touched.maxMembersPerGroup && errors.maxMembersPerGroup
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-orange-500'
                  }`}
                />
                {touched.maxMembersPerGroup && errors.maxMembersPerGroup && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.maxMembersPerGroup}
                  </p>
                )}
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
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                          placeholder="Member name"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            memberErrors[index]?.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          required
                        />
                        {memberErrors[index]?.name && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {memberErrors[index].name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Email <span className="text-red-500">*</span>
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
                            className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                              memberErrors[index]?.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                          />
                        </div>
                        {memberErrors[index]?.email && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {memberErrors[index].email}
                          </p>
                        )}
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
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Event...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Create Event →
                </>
              )}
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