import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Dumbbell, ShieldAlert, Check, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';
import { loadRazorpayScript } from '../utils/loadRazorpay';

const perks = [
  'Unlimited members, payments & attendance tracking',
  'Member self check-in via QR code',
  'Full dashboard, analytics & renewal alerts'
];

const RenewLicense = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    axios
      .get('/api/license')
      .then((res) => setLicense(res.data.license))
      .catch(() => toast.error('Failed to load license status'))
      .finally(() => setLoading(false));
  }, []);

  const handlePay = async () => {
    setPaying(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Could not load payment gateway — check your connection');
        setPaying(false);
        return;
      }

      const { data: order } = await axios.post('/api/license/order');

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'GymFlow',
        description: `${license?.licensePlan || 'Monthly'} plan renewal — ${order.gymName}`,
        prefill: {
          name: order.gymName,
          email: order.email,
          contact: order.phoneNumber
        },
        theme: { color: '#dc2626' },
        handler: async (response) => {
          try {
            const res = await axios.post('/api/license/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            toast.success('Payment successful — welcome back!');
            setLicense(res.data.license);
            setTimeout(() => navigate('/dashboard'), 900);
          } catch (error) {
            toast.error(error.response?.data?.error || 'Payment verification failed');
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false)
        }
      });

      checkout.on('payment.failed', (response) => {
        console.error('Razorpay payment.failed:', response.error);
        const reason = response.error?.description || response.error?.reason || 'Payment failed';
        toast.error(reason);
        setPaying(false);
      });

      checkout.open();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not start payment');
      setPaying(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isExpired = license?.licenseExpiresAt && new Date(license.licenseExpiresAt) < new Date();

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500/15 ring-1 ring-primary-400/25 mb-4">
            <Dumbbell className="text-primary-400" size={26} />
          </div>
          <span className="font-display text-lg tracking-wide">
            GYM<span className="text-primary-500">FLOW</span>
          </span>
        </div>

        <div className="card animate-fade-up">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="spinner w-8 h-8" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-rose-500/15 text-rose-400 shrink-0">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h1 className="font-display text-xl text-white uppercase tracking-wide">
                    {isExpired ? 'License Expired' : 'Renew Your License'}
                  </h1>
                  <p className="text-ink-400 text-sm">
                    {isExpired
                      ? `Expired ${format(new Date(license.licenseExpiresAt), 'MMM dd, yyyy')}`
                      : `${user?.gymName || 'Your gym'}'s access is on hold`}
                  </p>
                </div>
              </div>

              <div className="bg-black/30 border border-white/10 rounded-2xl p-5 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">{license?.licensePlan || 'Monthly'} Plan</p>
                    <p className="font-display text-3xl text-white mt-1 tracking-wide">{formatINR(license?.licenseAmount || 999)}</p>
                    <p className="text-ink-500 text-xs mt-1">per 30 days</p>
                  </div>
                  <CreditCard className="text-ink-600" size={32} />
                </div>
              </div>

              <div className="space-y-2.5 mb-6">
                {perks.map((p) => (
                  <div key={p} className="flex items-start gap-2.5 text-sm text-ink-300">
                    <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" strokeWidth={3} />
                    {p}
                  </div>
                ))}
              </div>

              <button onClick={handlePay} disabled={paying} className="w-full btn-primary py-3">
                {paying ? 'Opening secure checkout...' : `Pay ${formatINR(license?.licenseAmount || 999)} & Reactivate`}
              </button>
              <p className="text-center text-xs text-ink-600 mt-3">
                Secured by Razorpay — cards, UPI &amp; netbanking accepted.
              </p>

              <button onClick={handleLogout} className="btn-ghost text-ink-500 hover:text-white w-full mt-2 text-sm">
                <LogOut size={14} />
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RenewLicense;
