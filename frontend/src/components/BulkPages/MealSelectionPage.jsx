import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ShoppingBag, Check, ArrowLeft, User, Mail, Coffee, Pizza, Leaf, Utensils, Clock, Crown, Star } from 'lucide-react';

const MealSelectionPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  const [menu, setMenu] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState({});
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  useEffect(() => {
    fetchGroupData();
    fetchMenu();
    fetchSubscriptionInfo();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/bulk-order/group/${groupId}`);
      setGroupInfo(response.data.group);
      setMembers(response.data.members);
      
      // Initialize selected meals from existing selections
      const initialSelections = {};
      response.data.members.forEach(member => {
        if (member.meal !== 'Not selected') {
          initialSelections[member.email] = member.meal;
        }
      });
      setSelectedMeals(initialSelections);
    } catch (error) {
      console.error('Error fetching group:', error);
      toast.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bulk-order/menu');
      setMenu(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast.error('Failed to load menu');
    }
  };

  const fetchSubscriptionInfo = async () => {
    try {
      // Get current user's subscription status from localStorage or API
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        const response = await axios.get(`http://localhost:5000/api/subscription/${user.id}`);
        setSubscriptionInfo(response.data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // Set default if no subscription
      setSubscriptionInfo({ hasPriority: false, plan: 'base' });
    }
  };

  const handleMealSelect = (memberEmail, mealId, mealName) => {
    setSelectedMeals(prev => ({
      ...prev,
      [memberEmail]: { id: mealId, name: mealName }
    }));
  };

  const handleSubmitSelections = async () => {
    // Check if all members have selected a meal
    const unselectedMembers = members.filter(m => !selectedMeals[m.email]);
    
    if (unselectedMembers.length > 0) {
      toast.error(`${unselectedMembers.length} member(s) haven't selected a meal yet`);
      return;
    }

    setSubmitting(true);
    
    try {
      // Submit each member's selection
      for (const member of members) {
        const selectedMeal = selectedMeals[member.email];
        if (selectedMeal) {
          await axios.post('http://localhost:5000/api/bulk-order/select-meal', {
            groupId,
            memberEmail: member.email,
            memberName: member.name,
            mealId: selectedMeal.id,
            specialInstructions: ''
          });
        }
      }
      
      toast.success('All meals selected successfully!');
      
      // Navigate to token generation page with group and member data
      navigate('/tokens', { 
        state: { 
          eventDetails: {
            id: groupId,
            name: groupInfo?.name,
            date: groupInfo?.eventDate,
            leader: groupInfo?.leader
          },
          members: members.map(member => ({
            ...member,
            selectedMeal: selectedMeals[member.email]
          })),
          groupInfo: groupInfo,
          hasPriority: subscriptionInfo?.hasPriority || false
        } 
      });
    } catch (error) {
      console.error('Error submitting selections:', error);
      toast.error('Failed to submit selections');
    } finally {
      setSubmitting(false);
    }
  };

  const navigateToSubscription = () => {
    navigate('/subscription');
  };

  const getMealIcon = (category) => {
    switch(category) {
      case 'vegetarian': return <Leaf className="w-5 h-5" />;
      case 'vegan': return <Leaf className="w-5 h-5" />;
      case 'beverage': return <Coffee className="w-5 h-5" />;
      default: return <Utensils className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <div className="inline-block bg-orange-100 rounded-full p-3 mb-4">
            <ShoppingBag className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🍽️ Meal Selection</h1>
          <p className="text-gray-600">Each member can choose their preferred meal</p>
          
          {/* Priority Preparation Banner for Subscribed Users */}
          {subscriptionInfo?.hasPriority && (
            <div className="mt-4 max-w-md mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl px-6 py-3 shadow-lg">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-semibold">⭐ Priority Preparation Active</span>
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-sm text-center mt-1">Your meals will be cooked first with express pickup!</p>
            </div>
          )}
          
          {/* Group Info Card */}
          {groupInfo && (
            <div className="mt-4 inline-block bg-white rounded-xl px-6 py-3 shadow-sm">
              <p className="text-gray-700">
                <span className="font-semibold">{groupInfo.name}</span> · 
                Event: {new Date(groupInfo.eventDate).toLocaleDateString()} · 
                Leader: {groupInfo.leader}
              </p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Members List - Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl sticky top-6">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 rounded-t-2xl">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Members ({members.length})
                </h2>
                <p className="text-orange-100 text-sm">Select meals for each member</p>
              </div>
              
              <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {members.map((member, idx) => {
                  const hasSelected = selectedMeals[member.email];
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        hasSelected
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-gray-500" />
                            <p className="font-semibold text-gray-800">{member.name}</p>
                            {member.isPriority && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                                Priority
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Mail className="w-3 h-3" />
                            <p>{member.email}</p>
                          </div>
                          {hasSelected && (
                            <div className="mt-2">
                              <span className="text-xs text-green-600 font-medium">
                                ✓ Selected: {selectedMeals[member.email].name}
                              </span>
                            </div>
                          )}
                        </div>
                        {hasSelected && (
                          <Check className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="p-4 border-t border-gray-200 space-y-3">
                <div className="mb-3 text-sm text-gray-600">
                  <span className="font-semibold">{Object.keys(selectedMeals).length}</span> of {members.length} members have selected
                </div>
                
                {/* Subscription Upgrade Button */}
                {!subscriptionInfo?.hasPriority && (
                  <button
                    onClick={navigateToSubscription}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade to Pro for Priority Preparation
                  </button>
                )}
                
                <button
                  onClick={handleSubmitSelections}
                  disabled={submitting || Object.keys(selectedMeals).length !== members.length}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Confirm All Selections →'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Menu Items - Right Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5" />
                  Menu
                </h2>
                <p className="text-orange-100 text-sm">Choose a meal for each member</p>
              </div>
              
              <div className="p-6">
                {/* Member Selection Dropdown */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Member
                  </label>
                  <select
                    id="memberSelect"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    onChange={(e) => {
                      const memberEmail = e.target.value;
                      if (memberEmail) {
                        const memberElement = document.getElementById(`member-${memberEmail.replace(/[^a-zA-Z0-9]/g, '-')}`);
                        if (memberElement) {
                          memberElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }
                    }}
                  >
                    <option value="">-- Select a member --</option>
                    {members.map((member, idx) => (
                      <option key={idx} value={member.email}>
                        {member.name} - {selectedMeals[member.email] ? '✓ Selected' : 'Pending'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Info Badge */}
                {subscriptionInfo?.hasPriority && (
                  <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-3">
                    <div className="text-2xl">⚡</div>
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-800">Priority Preparation Active</p>
                      <p className="text-sm text-yellow-700">Your meals will be cooked first with express pickup service</p>
                    </div>
                  </div>
                )}

                {/* Member Meal Selection Cards */}
                <div className="space-y-8">
                  {members.map((member, idx) => (
                    <div
                      key={idx}
                      id={`member-${member.email.replace(/[^a-zA-Z0-9]/g, '-')}`}
                      className="border-2 rounded-xl p-4 transition-all scroll-mt-4"
                      style={{
                        borderColor: selectedMeals[member.email] ? '#10b981' : '#e5e7eb',
                        backgroundColor: selectedMeals[member.email] ? '#f0fdf4' : 'white'
                      }}
                    >
                      <div className="flex items-center justify-between mb-4 pb-3 border-b">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            {member.name}
                            {subscriptionInfo?.hasPriority && member.isPriority && (
                              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" />
                                Priority
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                        {selectedMeals[member.email] && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            ✓ Meal Selected
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {menu.map((item) => (
                          <div
                            key={item._id}
                            onClick={() => handleMealSelect(member.email, item._id, item.name)}
                            className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${
                              selectedMeals[member.email]?.id === item._id
                                ? 'border-orange-500 bg-orange-50 shadow-md'
                                : 'border-gray-200 hover:border-orange-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="text-2xl">
                                {getMealIcon(item.category)}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                                <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-orange-600 font-bold text-sm">${item.price}</span>
                                  {item.preparationTime && (
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {item.preparationTime}min
                                    </span>
                                  )}
                                </div>
                                {item.spicyLevel === 'spicy' && (
                                  <span className="text-xs text-red-500">🌶️ Spicy</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {selectedMeals[member.email] && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-green-600">
                            Selected: <span className="font-semibold">{selectedMeals[member.email].name}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealSelectionPage;