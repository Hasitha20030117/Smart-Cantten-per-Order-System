import React, { useState, useEffect } from 'react';
import "./SubscriptionPage.css";

const SubscriptionPage = () => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'base',
      name: 'Base',
      price: '$29/event',
      features: [
        '✓ Group creation',
        '✓ Tokens',
        '✗ No priority preparation'
      ],
      priority: false
    },
    {
      id: 'pro',
      name: 'Pro · Best',
      price: '$89/month',
      features: [
        '✓ Unlimited bulk events',
        '✓ Priority preparation',
        '✓ Dedicated support'
      ],
      priority: true,
      badge: '⭐'
    }
  ];

  useEffect(() => {
    // Fetch current subscription
    fetchCurrentSubscription();
    fetchUserEvents();
  }, []);

  const fetchCurrentSubscription = async () => {
    // API call to get current subscription
    // setCurrentPlan(response.data);
    setCurrentPlan('pro'); // Example
  };

  const fetchUserEvents = async () => {
    // Fetch user's events to show priority status
    const events = [
      { id: 1, name: 'Design Review', date: '2025-05-24', participants: 12, priority: true },
      { id: 2, name: 'Offsite 2025', date: '2025-06-02', participants: 44, priority: false }
    ];
    setUserEvents(events);
  };

  const handleSubscribe = async (planId) => {
    setLoading(true);
    try {
      // API call to subscribe
      // await axios.post('/api/subscribe', { planId });
      alert(`Subscribed to ${planId} plan!`);
      setCurrentPlan(planId);
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      // API call to cancel
      alert('Subscription cancelled');
      setCurrentPlan(null);
    }
  };

  return (
    <div className="subscription-container">
      <div className="subscription-header">
        <h1>Subscription Plans</h1>
        {currentPlan === 'pro' && (
          <div className="priority-badge">
            ⭐ Priority Preparation Active
          </div>
        )}
      </div>

      {/* Priority Info Banner */}
      <div className="priority-info">
        <div className="priority-icon">💡</div>
        <div className="priority-text">
          <strong>Priority Preparation = Your meals are cooked first, express pickup</strong>
          <p>Pro subscribers get their meals prepared ahead of regular orders</p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.id} className={`plan-card ${plan.priority ? 'pro-plan' : ''} ${currentPlan === plan.id ? 'current-plan' : ''}`}>
            {plan.badge && <div className="plan-badge">{plan.badge} Best Value</div>}
            
            <h2>{plan.name}</h2>
            <div className="price">{plan.price}</div>
            
            <div className="features">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="feature">{feature}</div>
              ))}
            </div>

            {currentPlan === plan.id ? (
              <div className="current-plan-badge">Current Plan</div>
            ) : (
              <button 
                className={`subscribe-btn ${plan.priority ? 'pro-btn' : ''}`}
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Subscribe'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Current Subscription Status */}
      {currentPlan === 'pro' && (
        <div className="current-subscription-info">
          <h3>Your Priority Events</h3>
          <div className="priority-events">
            {userEvents.map(event => (
              <div key={event.id} className={`event-card ${event.priority ? 'priority-event' : ''}`}>
                <div className="event-name">{event.name}</div>
                <div className="event-date">{new Date(event.date).toLocaleDateString()}</div>
                <div className="event-participants">{event.participants} participants</div>
                {event.priority && (
                  <div className="priority-tag">
                    ⭐ Priority Preparation
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <button className="cancel-subscription-btn" onClick={handleCancelSubscription}>
            Cancel Subscription
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;