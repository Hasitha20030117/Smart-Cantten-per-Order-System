import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ShoppingBag, Check, ArrowLeft, User, Mail, Coffee, Pizza, Leaf, Utensils, Clock, Crown, Star, Award, Gift, Users, ChevronDown, Sparkles } from 'lucide-react';

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
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [activeMember, setActiveMember] = useState(null);

  // Function to add 50 LKR to price
  const addFiftyLKR = (price) => {
    return price + 50;
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
      fetchMenu();
      fetchSubscriptionInfo();
    }
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      console.log('Fetching group data for ID:', groupId);
      
      const response = await axios.get(`http://localhost:5050/api/bulk-order/group/${groupId}`);
      
      console.log('Group data response:', response.data);
      
      if (response.data.success) {
        setGroupInfo(response.data.group);
        setMembers(response.data.members);
        setSelectedMeals({});
        
        // Set first member as active by default
        if (response.data.members.length > 0) {
          setActiveMember(response.data.members[0]);
        }
        
        // Check if group has earned reward points
        if (response.data.group.earnedRewardPoints) {
          setEarnedPoints(response.data.group.earnedRewardPoints);
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching group data:', error);
      
      if (error.response) {
        toast.error(error.response.data?.message || 'Failed to load group data');
      } else if (error.request) {
        toast.error('Cannot connect to server. Please make sure the backend server is running on port 5050');
      } else {
        toast.error('An error occurred while loading group data');
      }
      
      setTimeout(() => {
        navigate('/bulk-order');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await axios.get('http://localhost:5050/api/bulk-order/menu');
      // Add 50 LKR to each menu item price
      const updatedMenu = response.data.map(item => ({
        ...item,
        price: addFiftyLKR(item.price)
      }));
      setMenu(updatedMenu);
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast.error('Failed to load menu. Please refresh the page.');
    }
  };

  const fetchSubscriptionInfo = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.email) {
        const response = await axios.get(`http://localhost:5050/api/subscription/check/${user.email}`);
        setSubscriptionInfo({ 
          hasPriority: response.data.isSubscribed || false, 
          plan: response.data.plan || 'base' 
        });
      } else {
        setSubscriptionInfo({ hasPriority: false, plan: 'base' });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscriptionInfo({ hasPriority: false, plan: 'base' });
    }
  };

  const handleMealSelect = (memberEmail, memberName, mealId, mealName, mealPrice) => {
    console.log('Selecting meal for:', memberName, 'Meal:', mealName);
    
    setSelectedMeals(prev => {
      const newSelections = {
        ...prev,
        [memberEmail]: { id: mealId, name: mealName, price: mealPrice }
      };
      return newSelections;
    });
    
    toast.success(`${memberName} selected ${mealName}`);
    
    // Auto move to next unselected member
    const currentIndex = members.findIndex(m => m.email === memberEmail);
    const nextUnselected = members.slice(currentIndex + 1).find(m => !selectedMeals[m.email] && m.email !== memberEmail);
    
    if (nextUnselected) {
      setTimeout(() => {
        setActiveMember(nextUnselected);
        const memberElement = document.getElementById(`member-${nextUnselected.email.replace(/[^a-zA-Z0-9]/g, '-')}`);
        if (memberElement) {
          memberElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  };

  const handleSubmitSelections = async () => {
    const unselectedMembers = members.filter(m => !selectedMeals[m.email]);
    
    if (unselectedMembers.length > 0) {
      toast.error(`${unselectedMembers.length} member(s) haven't selected a meal yet`);
      return;
    }

    setSubmitting(true);
    
    try {
      for (const member of members) {
        const selectedMeal = selectedMeals[member.email];
        if (selectedMeal) {
          await axios.post('http://localhost:5050/api/bulk-order/select-meal', {
            groupId: groupId,
            memberEmail: member.email,
            mealId: selectedMeal.id,
            specialInstructions: ''
          });
        }
      }
      
      toast.success('All meals selected successfully!');
      
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
          hasPriority: subscriptionInfo?.hasPriority || false,
          earnedRewardPoints: earnedPoints
        } 
      });
    } catch (error) {
      console.error('Error submitting selections:', error);
      
      if (error.response) {
        toast.error(error.response.data?.message || 'Failed to submit selections');
      } else if (error.request) {
        toast.error('Cannot connect to server. Please make sure the backend server is running on port 5050');
      } else {
        toast.error('An error occurred while submitting selections');
      }
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
      case 'non-vegetarian': return <Pizza className="w-5 h-5" />;
      default: return <Utensils className="w-5 h-5" />;
    }
  };

  // Format price in LKR
  const formatLKR = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading group details...</p>
        </div>
      </div>
    );
  }

  const selectedCount = Object.keys(selectedMeals).length;
  const totalMembers = members.length;
  const allSelected = selectedCount === totalMembers && totalMembers > 0;
  const currentMember = activeMember || members[0];

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
          
          {/* Floating Subscription Button - Top Right */}
          {!subscriptionInfo?.hasPriority && (
            <button
              onClick={navigateToSubscription}
              className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 animate-pulse"
            >
              <Crown className="w-5 h-5" />
              <span>Upgrade to Pro</span>
              <Sparkles className="w-4 h-4" />
            </button>
          )}
          
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

          {/* Reward Points Banner */}
          {earnedPoints > 0 && (
            <div className="mt-4 max-w-md mx-auto bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl px-6 py-3 shadow-lg">
              <div className="flex items-center justify-center gap-2">
                <Award className="w-5 h-5" />
                <span className="font-semibold">🎉 You earned {earnedPoints} reward points!</span>
                <Gift className="w-5 h-5" />
              </div>
              <p className="text-sm text-center mt-1">Worth {formatLKR(earnedPoints * 10)} - Redeemable on future orders!</p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Members List - Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl sticky top-6">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 rounded-t-2xl">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Group Members ({members.length})
                </h2>
                <p className="text-orange-100 text-sm">Click on any member to select their meal</p>
              </div>
              
              <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {members.map((member, idx) => {
                  const hasSelected = selectedMeals[member.email];
                  const isActive = activeMember?.email === member.email;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveMember(member);
                        const memberElement = document.getElementById(`member-${member.email.replace(/[^a-zA-Z0-9]/g, '-')}`);
                        if (memberElement) {
                          memberElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          memberElement.classList.add('ring-4', 'ring-orange-400', 'ring-opacity-50');
                          setTimeout(() => {
                            memberElement.classList.remove('ring-4', 'ring-orange-400', 'ring-opacity-50');
                          }, 2000);
                        }
                      }}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        hasSelected
                          ? 'border-green-500 bg-green-50'
                          : isActive
                          ? 'border-orange-500 bg-orange-50 shadow-md'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-gray-500" />
                            <p className="font-semibold text-gray-800">{member.name}</p>
                            {member.isPriority && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" />
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
                                ✓ Selected: {selectedMeals[member.email].name} ({formatLKR(selectedMeals[member.email].price)})
                              </span>
                            </div>
                          )}
                          {isActive && !hasSelected && (
                            <div className="mt-2">
                              <span className="text-xs text-orange-600 font-medium animate-pulse">
                                ⚡ Currently selecting...
                              </span>
                            </div>
                          )}
                        </div>
                        {hasSelected && (
                          <Check className="w-5 h-5 text-green-500" />
                        )}
                        {isActive && !hasSelected && (
                          <ChevronDown className="w-5 h-5 text-orange-500 animate-bounce" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="p-4 border-t border-gray-200 space-y-3">
                <div className="mb-3 text-sm text-gray-600">
                  <span className="font-semibold">{selectedCount}</span> of {totalMembers} members have selected
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(selectedCount / totalMembers) * 100}%` }}
                  />
                </div>
                
                {/* Current Member Indicator */}
                {currentMember && !selectedMeals[currentMember.email] && (
                  <div className="bg-orange-100 rounded-lg p-2 mb-3 text-center">
                    <p className="text-sm text-orange-700">
                      🍽️ Now selecting for: <span className="font-bold">{currentMember.name}</span>
                    </p>
                  </div>
                )}
                
                {/* Subscription Upgrade Button - Left Column */}
                {!subscriptionInfo?.hasPriority && (
                  <button
                    onClick={navigateToSubscription}
                    className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:via-pink-600 hover:to-red-600 transition-all duration-300 shadow-lg transform hover:scale-105 flex items-center justify-center gap-3 animate-pulse"
                  >
                    <Crown className="w-5 h-5" />
                    <span>✨ UPGRADE TO PRO ✨</span>
                    <Sparkles className="w-5 h-5" />
                  </button>
                )}
                
                <button
                  onClick={handleSubmitSelections}
                  disabled={submitting || !allSelected}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    allSelected && !submitting
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></div>
                      Submitting...
                    </>
                  ) : allSelected ? (
                    'Confirm All Selections →'
                  ) : (
                    `Select ${totalMembers - selectedCount} more meal(s)`
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
                  Menu - Select for {currentMember?.name || 'Member'}
                </h2>
                <p className="text-orange-100 text-sm">Click on any meal to select for the active member</p>
              </div>
              
              <div className="p-6">
                {/* Promotional Banner for Non-Subscribed Users */}
                {!subscriptionInfo?.hasPriority && (
                  <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 shadow-md">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">🚀</div>
                        <div>
                          <h3 className="font-bold text-purple-800">Get Priority Preparation!</h3>
                          <p className="text-sm text-purple-600">Skip the queue with Pro subscription</p>
                        </div>
                      </div>
                      <button
                        onClick={navigateToSubscription}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 shadow-md"
                      >
                        <Crown className="w-4 h-4" />
                        Subscribe Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Active Member Card */}
                {currentMember && !selectedMeals[currentMember.email] && (
                  <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-300 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">👤</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-orange-800 text-lg">Selecting meal for {currentMember.name}</h3>
                        <p className="text-sm text-orange-600">{currentMember.email}</p>
                        <p className="text-xs text-orange-500 mt-1">👇 Click on any meal below to select for this member</p>
                      </div>
                      <div className="animate-pulse text-2xl">👇</div>
                    </div>
                  </div>
                )}

                {/* Member Selection Dropdown */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Or switch to another member:
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={activeMember?.email || ''}
                    onChange={(e) => {
                      const memberEmail = e.target.value;
                      const member = members.find(m => m.email === memberEmail);
                      if (member) {
                        setActiveMember(member);
                        const memberElement = document.getElementById(`member-${member.email.replace(/[^a-zA-Z0-9]/g, '-')}`);
                        if (memberElement) {
                          memberElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }
                    }}
                  >
                    {members.map((member, idx) => (
                      <option key={idx} value={member.email}>
                        {member.name} - {selectedMeals[member.email] ? '✓ ' + selectedMeals[member.email].name : '⏳ Pending'}
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

                {/* Meal Selection Grid for Current Member */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 border-b-2 border-orange-300 pb-2">
                    Available Meals for {currentMember?.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menu.map((item) => {
                      const isSelected = selectedMeals[currentMember?.email]?.id === (item._id || item.id);
                      return (
                        <div
                          key={item._id || item.id}
                          onClick={() => {
                            if (currentMember && !selectedMeals[currentMember.email]) {
                              handleMealSelect(currentMember.email, currentMember.name, item._id || item.id, item.name, item.price);
                            } else if (selectedMeals[currentMember?.email]) {
                              toast.error(`${currentMember?.name} already selected a meal!`);
                            }
                          }}
                          className={`cursor-pointer p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50 shadow-md'
                              : 'border-gray-200 hover:border-orange-300 hover:shadow-lg'
                          } ${selectedMeals[currentMember?.email] && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-3xl">
                              {getMealIcon(item.category)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">{item.name}</h4>
                              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-orange-600 font-bold">{formatLKR(item.price)}</span>
                                {item.preparationTime && (
                                  <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {item.preparationTime}min
                                  </span>
                                )}
                              </div>
                              {item.spicyLevel === 'spicy' && (
                                <span className="text-xs text-red-500 mt-1 inline-block">🌶️ Spicy</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* All Members Selections Summary */}
                <div className="mt-8 pt-6 border-t-2 border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    All Members Selections Summary
                  </h3>
                  <div className="space-y-2">
                    {members.map((member, idx) => {
                      const hasSelected = selectedMeals[member.email];
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{member.name}</span>
                          </div>
                          <div className="text-right">
                            {hasSelected ? (
                              <span className="text-green-600 text-sm">
                                ✓ {selectedMeals[member.email].name} - {formatLKR(selectedMeals[member.email].price)}
                              </span>
                            ) : (
                              <span className="text-orange-500 text-sm animate-pulse">⏳ Pending selection</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
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