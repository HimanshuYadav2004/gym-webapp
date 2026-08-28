import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Dumbbell, Clock3, LogOut, ShieldX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const POLL_INTERVAL = 5000;

const PendingApproval = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(user?.licenseStatus || 'pending');
  const redirected = useRef(false);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await axios.get('/api/auth/profile');
        const owner = res.data.gymOwner;
        setStatus(owner.licenseStatus);

        if (owner.licenseStatus === 'trial' || owner.licenseStatus === 'active') {
          if (!redirected.current) {
            redirected.current = true;
            const token = localStorage.getItem('token');
            login(token, owner);
            toast.success("You're approved! Welcome to GymFlow.");
            navigate('/dashboard');
          }
        }
      } catch {
        // ignore transient poll failures
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const rejected = status === 'rejected';

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

        <div className="card text-center animate-fade-up">
          <div className={`flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-5 ${
            rejected ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'
          }`}>
            {rejected ? <ShieldX size={28} /> : <Clock3 size={28} />}
          </div>

          {rejected ? (
            <>
              <h1 className="font-display text-2xl uppercase text-white tracking-wide">Not Approved</h1>
              <p className="text-ink-400 mt-3 text-sm leading-relaxed">
                Your gym registration for <span className="text-white">{user?.gymName}</span> wasn't approved. Reach out to the GymFlow team if you think this is a mistake.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl uppercase text-white tracking-wide">Awaiting Approval</h1>
              <p className="text-ink-400 mt-3 text-sm leading-relaxed">
                Thanks for registering <span className="text-white">{user?.gymName}</span>. A GymFlow admin is reviewing your details — this page will update automatically the moment you're approved.
              </p>
              <div className="flex items-center justify-center gap-2 mt-5 text-xs text-ink-500">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Checking status...
              </div>
            </>
          )}

          <button onClick={handleLogout} className="btn-secondary w-full mt-6">
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
