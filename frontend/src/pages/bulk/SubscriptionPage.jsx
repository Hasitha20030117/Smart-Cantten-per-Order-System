import React, { useState, useEffect } from 'react';
import { CheckCircle, Crown, Sparkles, Star, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../../lib/axios';

const SubscriptionPage = () => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });

  const plans = [
    {
      id: 'base',
      name: 'Base',
      price: 'Free',
      features: [
        '✓ Group creation',
        '✓ Token generation',
        '✗ No priority preparation',
        '✗ Standard queue'
      ],
      priority: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'Rs 89/month',
      features: [
        '✓ Unlimited bulk events',
        '✓ Priority preparation',
        '✓ Express token pickup',
        '✓ Dedicated support',
        '✓ 30% faster service'
      ],
      priority: true,
      badge: '⭐ Best Value'
    },
    {
      id: 'yearly',
      name: 'Yearly Pro',
      price: 'Rs 889/year',
      features: [
        '✓ All Pro benefits',
        '✓ 15% discount',
        '✓ Priority support',
        '✓ Early access features'
      ],
      priority: true,
      badge: '🔥 Save 15%'
    }
  ];

  useEffect(() => {
    fetchCurrentSubscription();
    fetchUserEvents();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.email) {
        const response = await axios.get('/api/subscription/current', {
          params: { email: user.email }
        });
        setCurrentPlan(response.data.plan || 'base');
        setForm({
          name: user.name || '',
          email: user.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setCurrentPlan('base');
    }
  };

  const fetchUserEvents = async () => {
    try {
      const response = await axios.get('/api/bulk-order/user-events');
      setUserEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Mock data for demo
      setUserEvents([
        { id: 1, name: 'Team Lunch', date: '2025-05-24', participants: 12, priority: currentPlan === 'pro' },
        { id: 2, name: 'Client Meeting', date: '2025-06-02', participants: 8, priority: currentPlan === 'pro' }
      ]);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please enter your name and email first.");
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/subscription/subscribe', {
        name: form.name.trim(),
        email: form.email.trim(),
        plan: planId
      });
      
      setCurrentPlan(planId);
      toast.success(`Successfully subscribed to ${planId === 'pro' ? 'Pro' : 'Yearly Pro'} plan!`);
      
      // Refresh events to show priority status
      fetchUserEvents();
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error.response?.data?.message || "Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose priority preparation benefits.')) {
      setLoading(true);
      try {
        await axios.post('/api/subscription/cancel', {
          email: form.email
        });
        setCurrentPlan('base');
        toast.success('Subscription cancelled successfully');
        fetchUserEvents();
      } catch (error) {
        console.error('Error cancelling subscription:', error);
        toast.error('Failed to cancel subscription');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#fff3e0_0%,#ffe0b2_45%,#ffd7a1_100%)] px-4 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex rounded-full bg-white/70 p-4 shadow">
            <Crown className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="mt-4 text-4xl font-black text-slate-900">Subscription Plans</h1>
          <p className="mt-2 text-slate-600">
            Unlock priority preparation for bulk meal events and get your meals faster.
          </p>
          
          {currentPlan === 'pro' || currentPlan === 'yearly' ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="font-semibold text-green-700">Priority Preparation Active</span>
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
            </div>
          ) : null}
        </div>

        {/* User Info Form */}
        <div className="mb-8 rounded-[2rem] bg-white/85 p-6 shadow-xl backdrop-blur-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-800">Your Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Your full name"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500"
            />
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Your email address"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Priority Info Banner */}
        <div className="mb-8 rounded-[2rem] bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-lg border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-500 p-2">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900">⚡ Priority Preparation = Meals cooked first!</h3>
              <p className="mt-1 text-blue-700">
                Pro subscribers get their meals prepared ahead of regular orders, ensuring express pickup and faster service.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1 text-sm text-blue-600">
                  <CheckCircle size={14} /> 30% faster pickup
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-blue-600">
                  <CheckCircle size={14} /> Priority tokens
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-blue-600">
                  <CheckCircle size={14} /> Dedicated support
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-[2rem] border p-6 shadow-xl transition-all ${
                currentPlan === plan.id
                  ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 ring-2 ring-orange-500'
                  : plan.priority
                  ? 'border-orange-300 bg-white/90 hover:shadow-2xl'
                  : 'border-slate-200 bg-white/80 hover:shadow-xl'
              }`}
            >
              {plan.badge && (
                <div className="mb-3 inline-block rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-xs font-bold text-white">
                  {plan.badge}
                </div>
              )}
              
              <h2 className="text-2xl font-black text-slate-900">{plan.name}</h2>
              <p className="mt-2 text-3xl font-black text-orange-600">{plan.price}</p>
              
              <div className="mt-6 space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                    {feature.includes('✓') ? (
                      <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle size={16} className="text-gray-400 flex-shrink-0" />
                    )}
                    <span className={feature.includes('✗') ? 'text-gray-400' : ''}>
                      {feature.replace('✓', '').replace('✗', '').trim()}
                    </span>
                  </div>
                ))}
              </div>

              {currentPlan === plan.id ? (
                <div className="mt-8 rounded-xl bg-green-100 px-4 py-3 text-center">
                  <CheckCircle className="mx-auto mb-1 h-5 w-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">Current Plan</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading}
                  className={`mt-8 w-full rounded-2xl px-5 py-3 font-semibold text-white transition-all ${
                    plan.priority
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                      : 'bg-gray-400 hover:bg-gray-500'
                  } disabled:opacity-60`}
                >
                  {loading ? 'Processing...' : 'Subscribe'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Current Subscription Status & Events */}
        {(currentPlan === 'pro' || currentPlan === 'yearly') && (
          <div className="mt-8 rounded-[2rem] bg-white/95 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Your Priority Events</h3>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                Priority Active
              </span>
            </div>
            
            {userEvents.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {userEvents.map(event => (
                  <div key={event.id} className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-gray-800">{event.name}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {event.participants} participants
                        </p>
                      </div>
                      <div className="rounded-full bg-yellow-100 p-2">
                        <Star className="h-4 w-4 text-yellow-600 fill-current" />
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg bg-yellow-50 p-2 text-center">
                      <p className="text-xs font-semibold text-yellow-700">
                        ⚡ Priority Preparation - Meals cooked first!
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No events yet. Create a bulk event to see priority benefits!</p>
            )}
            
            <button 
              className="mt-6 w-full rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 font-semibold text-red-600 transition-all hover:bg-red-100"
              onClick={handleCancelSubscription}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Cancel Subscription'}
            </button>
          </div>
        )}

        {/* Benefits Footer */}
        <div className="mt-8 rounded-[2rem] bg-white/85 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <Sparkles className="mt-1 h-6 w-6 text-orange-500" />
            <div>
              <p className="font-bold text-slate-900">Why priority preparation matters?</p>
              <p className="mt-2 text-slate-600">
                Priority preparation means your meals are cooked first, before regular orders. 
                This ensures faster token readiness, express pickup, and smoother large-group service. 
                Perfect for team lunches, client meetings, and time-sensitive events.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;