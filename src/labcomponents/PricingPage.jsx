import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { initiatePayment, PLAN_PRICING } from '../utils/razorpay';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../utils/firebase-config';
import LabNavbar from './LabNavbar';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '₹0',
    period: 'forever',
    description: 'Perfect for hobbyists getting started',
    features: [
      '5 recipes',
      '20 ingredients in inventory',
      '10 batch records',
      'Basic recipe calculator',
      'Label generator',
      'Community support',
    ],
    limitations: [
      'No data backup',
      'No sales tracking',
      'No reports',
    ],
    cta: 'Current Plan',
    popular: false,
    color: '#9e9e9e',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 199,
    priceLabel: '₹199',
    period: '/month',
    description: 'For serious home crafters',
    features: [
      '50 recipes',
      '100 ingredients in inventory',
      '50 batch records',
      'Advanced recipe calculator',
      'Label generator with templates',
      'Data backup & export',
      'Basic sales tracking',
      'Email support',
    ],
    limitations: [],
    cta: 'Upgrade to Starter',
    popular: false,
    color: '#4fc3f7',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    priceLabel: '₹499',
    period: '/month',
    description: 'For growing soap businesses',
    features: [
      'Unlimited recipes',
      'Unlimited ingredients',
      'Unlimited batch records',
      'Advanced recipe generator',
      'Custom label templates',
      'Full sales dashboard',
      'Usage reports & analytics',
      'Priority email support',
      'Recipe scaling tools',
      'Cost calculator',
    ],
    limitations: [],
    cta: 'Upgrade to Pro',
    popular: true,
    color: '#7c4dff',
  },
  {
    id: 'business',
    name: 'Business',
    price: 999,
    priceLabel: '₹999',
    period: '/month',
    description: 'For established businesses',
    features: [
      'Everything in Pro',
      'Team members (up to 5)',
      'Role-based permissions',
      'Custom branding',
      'API access',
      'Advanced analytics',
      'Dedicated support',
      'Custom integrations',
      'White-label options',
    ],
    limitations: [],
    cta: 'Contact Sales',
    popular: false,
    color: '#ffd700',
  },
];

export default function PricingPage() {
  const { user, userProfile, fetchUserProfile } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(null);
  const [message, setMessage] = useState(null);

  const currentPlan = userProfile?.plan || 'free';

  // Update user's plan after successful payment
  const updateUserPlan = async (planId, billingCycle, paymentDetails) => {
    try {
      const expiryDate = new Date();
      if (billingCycle === 'yearly') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      }

      const planLimits = {
        starter: { maxRecipes: 50, maxIngredients: 100, maxBatches: 50 },
        pro: { maxRecipes: -1, maxIngredients: -1, maxBatches: -1 },
        business: { maxRecipes: -1, maxIngredients: -1, maxBatches: -1 },
      };

      await updateDoc(doc(db, 'users', user.uid), {
        plan: planId,
        planExpiry: expiryDate,
        billingCycle,
        limits: planLimits[planId],
        lastPayment: {
          ...paymentDetails,
          date: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });

      // Refresh user profile
      await fetchUserProfile(user.uid);
      
      setMessage({ type: 'success', text: `Successfully upgraded to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan!` });
    } catch (error) {
      console.error('Failed to update plan:', error);
      setMessage({ type: 'error', text: 'Payment succeeded but failed to update plan. Please contact support.' });
    }
  };

  const handleSelectPlan = async (planId) => {
    if (!user) {
      navigate('/signup');
      return;
    }

    if (planId === currentPlan) {
      return;
    }

    if (planId === 'free') {
      // Downgrade confirmation
      if (!window.confirm('Are you sure you want to downgrade to Free? You may lose access to some features.')) {
        return;
      }
      // Handle downgrade
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          plan: 'free',
          planExpiry: null,
          limits: { maxRecipes: 5, maxIngredients: 20, maxBatches: 10 },
          updatedAt: serverTimestamp(),
        });
        await fetchUserProfile(user.uid);
        setMessage({ type: 'success', text: 'Downgraded to Free plan.' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to downgrade. Please try again.' });
      }
      return;
    }

    if (planId === 'business') {
      // Contact sales
      window.open('mailto:support@soaplab.app?subject=Business Plan Inquiry', '_blank');
      return;
    }

    setLoading(planId);
    setMessage(null);

    // Initiate Razorpay payment
    initiatePayment({
      planId,
      billingCycle,
      user,
      onSuccess: async (paymentDetails) => {
        setLoading(null);
        await updateUserPlan(planId, billingCycle, paymentDetails);
      },
      onError: (error) => {
        setLoading(null);
        setMessage({ type: 'error', text: error.message || 'Payment failed. Please try again.' });
      },
      onClose: () => {
        setLoading(null);
      },
    });
  };

  return (
    <div>
      <LabNavbar />
      <style>{`
        .pricing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
          padding: 40px 20px 80px;
        }

        .pricing-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 50px;
        }

        .pricing-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 16px;
        }

        .pricing-header p {
          font-size: 1.1rem;
          color: #666;
          line-height: 1.6;
        }

        .billing-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 40px;
        }

        .billing-toggle span {
          font-size: 0.95rem;
          color: #666;
        }

        .billing-toggle span.active {
          color: #7c4dff;
          font-weight: 600;
        }

        .toggle-switch {
          position: relative;
          width: 56px;
          height: 28px;
          background: #e0e0e0;
          border-radius: 28px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .toggle-switch.yearly {
          background: #7c4dff;
        }

        .toggle-switch::after {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 22px;
          height: 22px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .toggle-switch.yearly::after {
          transform: translateX(28px);
        }

        .save-badge {
          background: #4caf50;
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .plan-card {
          background: white;
          border-radius: 20px;
          padding: 32px 24px;
          position: relative;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .plan-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }

        .plan-card.popular {
          border: 3px solid #7c4dff;
          transform: scale(1.02);
        }

        .plan-card.popular:hover {
          transform: scale(1.02) translateY(-8px);
        }

        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #7c4dff 0%, #536dfe 100%);
          color: white;
          padding: 6px 20px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .plan-header {
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #eee;
        }

        .plan-name {
          font-size: 1.3rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 8px;
        }

        .plan-price {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 4px;
          margin-bottom: 8px;
        }

        .price-amount {
          font-size: 2.5rem;
          font-weight: 800;
          color: #333;
        }

        .price-period {
          font-size: 1rem;
          color: #999;
        }

        .plan-description {
          font-size: 0.9rem;
          color: #666;
        }

        .plan-features {
          flex: 1;
          margin-bottom: 24px;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 0.9rem;
          color: #555;
        }

        .feature-item svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .feature-check {
          color: #4caf50;
        }

        .feature-x {
          color: #bdbdbd;
        }

        .limitation-item {
          color: #999;
        }

        .plan-cta {
          width: 100%;
          padding: 14px 24px;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .plan-cta.primary {
          background: linear-gradient(135deg, #7c4dff 0%, #536dfe 100%);
          color: white;
        }

        .plan-cta.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(124, 77, 255, 0.4);
        }

        .plan-cta.secondary {
          background: #f5f5f5;
          color: #333;
        }

        .plan-cta.secondary:hover {
          background: #eeeeee;
        }

        .plan-cta.current {
          background: #e8f5e9;
          color: #4caf50;
          cursor: default;
        }

        .plan-cta:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .faq-section {
          max-width: 800px;
          margin: 80px auto 0;
        }

        .faq-section h2 {
          text-align: center;
          font-size: 1.8rem;
          margin-bottom: 32px;
          color: #333;
        }

        .faq-item {
          background: white;
          border-radius: 12px;
          padding: 20px 24px;
          margin-bottom: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .faq-question {
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .faq-answer {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .pricing-header h1 {
            font-size: 1.8rem;
          }

          .pricing-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
          }

          .plan-card.popular {
            transform: none;
          }
        }
        
        .pricing-message {
          max-width: 600px;
          margin: 0 auto 24px;
          padding: 16px 24px;
          border-radius: 12px;
          text-align: center;
          font-weight: 500;
          animation: slideDown 0.3s ease;
        }
        
        .pricing-message.success {
          background: #e8f5e9;
          color: #2e7d32;
          border: 1px solid #a5d6a7;
        }
        
        .pricing-message.error {
          background: #ffebee;
          color: #c62828;
          border: 1px solid #ef9a9a;
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="pricing-page">
        <div className="pricing-header">
          <h1>Simple, Transparent Pricing</h1>
          <p>
            Choose the plan that fits your soap-making journey. Start free and upgrade as you grow.
            All plans include our core recipe calculator and label generator.
          </p>
        </div>
        
        {message && (
          <div className={`pricing-message ${message.type}`}>
            {message.type === 'success' ? '✓ ' : '⚠ '}{message.text}
          </div>
        )}

        <div className="billing-toggle">
          <span className={billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
          <div 
            className={`toggle-switch ${billingCycle === 'yearly' ? 'yearly' : ''}`}
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          />
          <span className={billingCycle === 'yearly' ? 'active' : ''}>Yearly</span>
          <span className="save-badge">Save 20%</span>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            const yearlyPrice = Math.round(plan.price * 12 * 0.8);
            const displayPrice = billingCycle === 'yearly' && plan.price > 0 
              ? `₹${yearlyPrice}` 
              : plan.priceLabel;
            const displayPeriod = plan.price === 0 
              ? 'forever' 
              : billingCycle === 'yearly' ? '/year' : '/month';

            return (
              <div key={plan.id} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                
                <div className="plan-header">
                  <div className="plan-name">{plan.name}</div>
                  <div className="plan-price">
                    <span className="price-amount">{displayPrice}</span>
                    <span className="price-period">{displayPeriod}</span>
                  </div>
                  <div className="plan-description">{plan.description}</div>
                </div>

                <div className="plan-features">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="feature-item">
                      <svg className="feature-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, idx) => (
                    <div key={idx} className="feature-item limitation-item">
                      <svg className="feature-x" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      <span>{limitation}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`plan-cta ${isCurrentPlan ? 'current' : plan.popular ? 'primary' : 'secondary'}`}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading === plan.id}
                >
                  {loading === plan.id ? (
                    'Processing...'
                  ) : isCurrentPlan ? (
                    '✓ Current Plan'
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          
          <div className="faq-item">
            <div className="faq-question">Can I change plans anytime?</div>
            <div className="faq-answer">
              Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll get 
              immediate access to new features. When downgrading, your access continues until the 
              end of your billing period.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">What happens to my data if I downgrade?</div>
            <div className="faq-answer">
              Your data is never deleted. If you exceed the limits of your new plan, you won't be 
              able to create new items until you're within limits, but existing data remains accessible.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">Is there a free trial for paid plans?</div>
            <div className="faq-answer">
              Yes! All new users get a 14-day free trial of Pro features. No credit card required.
              After the trial, you can choose to continue with Pro or stay on the Free plan.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">What payment methods do you accept?</div>
            <div className="faq-answer">
              We accept all major credit/debit cards, UPI, Net Banking, and digital wallets 
              through Razorpay. For Business plans, we also offer bank transfers.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">Can I get a refund?</div>
            <div className="faq-answer">
              We offer a 7-day money-back guarantee for all paid plans. If you're not satisfied, 
              contact us within 7 days of your purchase for a full refund.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
