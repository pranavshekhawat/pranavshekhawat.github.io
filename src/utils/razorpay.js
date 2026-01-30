/**
 * Razorpay Payment Integration
 * 
 * Setup:
 * 1. Create account at https://dashboard.razorpay.com
 * 2. Get API keys from Settings > API Keys
 * 3. Add REACT_APP_RAZORPAY_KEY_ID to your .env file
 * 
 * For production:
 * - Create a backend endpoint to create orders (more secure)
 * - Verify payment signatures on backend
 */

// Razorpay Key ID (public - safe to expose)
const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXX';

// Plan pricing (in INR)
export const PLAN_PRICING = {
  free: { monthly: 0, yearly: 0 },
  starter: { monthly: 199, yearly: Math.round(199 * 12 * 0.8) }, // 20% off yearly
  pro: { monthly: 499, yearly: Math.round(499 * 12 * 0.8) },
  business: { monthly: 999, yearly: Math.round(999 * 12 * 0.8) },
};

/**
 * Load Razorpay script dynamically
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Create Razorpay order (client-side for demo)
 * In production, this should be done on your backend
 */
export const createOrder = async (planId, billingCycle, userEmail, userName) => {
  const pricing = PLAN_PRICING[planId];
  if (!pricing) throw new Error('Invalid plan');
  
  const amount = billingCycle === 'yearly' ? pricing.yearly : pricing.monthly;
  if (amount === 0) throw new Error('Cannot process free plan');
  
  // In production, call your backend API to create an order
  // const response = await fetch('/api/create-order', {
  //   method: 'POST',
  //   body: JSON.stringify({ planId, billingCycle, amount }),
  // });
  // return response.json();
  
  // For demo, return mock order
  return {
    id: `order_${Date.now()}`,
    amount: amount * 100, // Razorpay expects paise
    currency: 'INR',
    planId,
    billingCycle,
  };
};

/**
 * Initialize Razorpay payment
 */
export const initiatePayment = async ({
  planId,
  billingCycle,
  user,
  onSuccess,
  onError,
  onClose,
}) => {
  // Load Razorpay script
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onError(new Error('Failed to load Razorpay. Please check your internet connection.'));
    return;
  }
  
  try {
    // Create order
    const order = await createOrder(planId, billingCycle, user?.email, user?.displayName);
    
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Soap Lab',
      description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan - ${billingCycle === 'yearly' ? 'Annual' : 'Monthly'}`,
      image: '/logo192.png', // Your logo
      order_id: order.id,
      prefill: {
        name: user?.displayName || '',
        email: user?.email || '',
        contact: user?.phoneNumber || '',
      },
      notes: {
        planId,
        billingCycle,
        userId: user?.uid,
      },
      theme: {
        color: '#7c4dff',
        backdrop_color: 'rgba(0, 0, 0, 0.5)',
      },
      modal: {
        ondismiss: () => {
          if (onClose) onClose();
        },
        confirm_close: true,
        escape: true,
        animation: true,
      },
      handler: async (response) => {
        // Payment successful
        // In production, verify the payment on your backend
        try {
          // await fetch('/api/verify-payment', {
          //   method: 'POST',
          //   body: JSON.stringify({
          //     razorpay_payment_id: response.razorpay_payment_id,
          //     razorpay_order_id: response.razorpay_order_id,
          //     razorpay_signature: response.razorpay_signature,
          //     planId,
          //     billingCycle,
          //     userId: user?.uid,
          //   }),
          // });
          
          onSuccess({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            planId,
            billingCycle,
          });
        } catch (error) {
          onError(error);
        }
      },
    };
    
    const razorpay = new window.Razorpay(options);
    
    razorpay.on('payment.failed', (response) => {
      onError(new Error(response.error.description || 'Payment failed'));
    });
    
    razorpay.open();
  } catch (error) {
    onError(error);
  }
};

/**
 * Format price for display
 */
export const formatPrice = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default {
  loadRazorpayScript,
  createOrder,
  initiatePayment,
  formatPrice,
  PLAN_PRICING,
};
