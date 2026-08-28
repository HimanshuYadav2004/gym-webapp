import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Dumbbell, Phone, ArrowRight, CheckCircle2, Flame, Clock, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

const CheckIn = () => {
  const { gymOwnerId } = useParams();
  const [gym, setGym] = useState(null);
  const [gymError, setGymError] = useState(false);

  const [step, setStep] = useState('phone'); // phone -> confirm -> done
  const [phone, setPhone] = useState('');
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`/api/checkin/gym/${gymOwnerId}`)
      .then((res) => setGym(res.data.gym))
      .catch(() => setGymError(true));
  }, [gymOwnerId]);

  const handleLookup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/checkin/lookup', { gymOwnerId, phoneNumber: phone });
      setMatches(res.data.members);
      if (res.data.members.length === 1) {
        setSelected(res.data.members[0]);
      }
      setStep('confirm');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/checkin/confirm', { memberId: selected.id });
      setResult(res.data);
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('phone');
    setPhone('');
    setMatches([]);
    setSelected(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center px-5 py-10">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500/15 ring-1 ring-primary-400/25 mb-4">
            <Dumbbell className="text-primary-400" size={26} />
          </div>
          {gymError ? (
            <p className="text-rose-400 text-sm">This check-in link isn't valid.</p>
          ) : gym ? (
            <>
              <p className="text-xs font-semibold text-primary-400 uppercase tracking-[0.2em] mb-1">Check In</p>
              <h1 className="font-display text-2xl text-white uppercase tracking-wide">{gym.gymName}</h1>
              {gym.gymAddress && <p className="text-ink-500 text-sm mt-1">{gym.gymAddress}</p>}
            </>
          ) : (
            <div className="spinner w-8 h-8" />
          )}
        </div>

        {gym && step === 'phone' && (
          <form onSubmit={handleLookup} className="card animate-fade-up">
            <label className="label">Your Phone Number</label>
            <div className="relative">
              <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                type="tel"
                inputMode="numeric"
                className="input pl-10"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoFocus
                required
              />
            </div>
            {error && <p className="text-rose-400 text-sm mt-3">{error}</p>}
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 mt-5">
              {loading ? 'Looking you up...' : 'Find Me'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>
        )}

        {step === 'confirm' && (
          <div className="card animate-fade-up">
            {matches.length === 0 ? (
              <p className="text-ink-400 text-sm text-center py-4">No members found with that number.</p>
            ) : matches.length > 1 ? (
              <>
                <p className="label mb-3">Multiple matches — that's you?</p>
                <div className="space-y-2">
                  {matches.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelected(m)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        selected?.id === m.id ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 hover:bg-white/5'
                      }`}
                    >
                      {m.photoUrl ? (
                        <img src={m.photoUrl} alt={m.fullName} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="avatar-fallback w-10 h-10 text-sm">{m.fullName.charAt(0)}</div>
                      )}
                      <span className="font-medium text-white">{m.fullName}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-2">
                {selected.photoUrl ? (
                  <img src={selected.photoUrl} alt={selected.fullName} className="w-20 h-20 rounded-full object-cover mb-4" />
                ) : (
                  <div className="avatar-fallback w-20 h-20 text-2xl mb-4">{selected.fullName.charAt(0)}</div>
                )}
                <p className="text-ink-400 text-sm">Is this you?</p>
                <p className="font-display text-2xl text-white uppercase tracking-wide mt-1">{selected.fullName}</p>
                <p className="text-ink-500 text-sm mt-0.5">{selected.membershipId}</p>
              </div>
            )}

            {error && <p className="text-rose-400 text-sm mt-3 text-center">{error}</p>}

            <div className="flex gap-2 mt-5">
              <button onClick={reset} className="btn-secondary px-4">
                <RotateCcw size={16} />
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading || !selected}
                className="flex-1 btn-primary py-3"
              >
                {loading ? 'Checking in...' : "Yes, that's me — Check In"}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && result && (
          <div className="card animate-fade-up text-center py-8">
            <div className={`flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-5 ${
              result.alreadyCheckedIn
                ? (result.stillIn ? 'bg-sky-500/15 text-sky-400' : 'bg-amber-500/15 text-amber-400')
                : 'bg-emerald-500/15 text-emerald-400'
            }`}>
              <CheckCircle2 size={32} />
            </div>

            {result.alreadyCheckedIn ? (
              result.stillIn ? (
                <>
                  <p className="font-display text-2xl text-white uppercase tracking-wide">Already In!</p>
                  <p className="text-ink-400 mt-2 text-sm">
                    Hey {result.member.fullName.split(' ')[0]}, you checked in today at{' '}
                    <span className="text-white font-medium">{format(new Date(result.checkInTime), 'hh:mm a')}</span> and haven't checked out yet.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display text-2xl text-white uppercase tracking-wide">Visit Complete</p>
                  <p className="text-ink-400 mt-2 text-sm">
                    {result.member.fullName.split(' ')[0]}, you already visited today from{' '}
                    <span className="text-white font-medium">{format(new Date(result.checkInTime), 'hh:mm a')}</span> to{' '}
                    <span className="text-white font-medium">{format(new Date(result.checkOutTime), 'hh:mm a')}</span>. See you tomorrow!
                  </p>
                </>
              )
            ) : (
              <>
                <p className="font-display text-2xl text-white uppercase tracking-wide">Checked In!</p>
                <p className="text-ink-400 mt-2 text-sm">
                  Welcome, {result.member.fullName.split(' ')[0]}. Have a great workout 💪
                </p>
                <div className="flex items-center justify-center gap-6 mt-5 pt-5 border-t border-white/10">
                  <div className="flex items-center gap-2 text-sm text-ink-300">
                    <Clock size={15} className="text-ink-500" />
                    {format(new Date(result.checkInTime), 'hh:mm a')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary-400 font-medium">
                    <Flame size={15} />
                    Visit #{result.visitCount}
                  </div>
                </div>
              </>
            )}

            <button onClick={reset} className="btn-ghost text-ink-400 hover:text-white mt-6 text-sm">
              Not you? Check in someone else
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckIn;
