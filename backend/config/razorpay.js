import Razorpay from 'razorpay';

// The SDK throws synchronously if key_id/key_secret are missing, which would
// otherwise crash the whole server at import time — before the app even gets
// a chance to serve unrelated routes. Build it lazily so a missing key only
// breaks the payment routes that actually need it.
let instance = null;

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys are not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
  }
  if (!instance) {
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return instance;
};

export default getRazorpay;
