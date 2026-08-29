// Lazily injects the Razorpay Checkout script — only the renewal page needs
// it, so it's not worth loading on every page via index.html.
let loadPromise = null;

export const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return loadPromise;
};
