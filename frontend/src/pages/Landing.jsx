import { Link } from 'react-router-dom';
import { Dumbbell, Users, IndianRupee, CalendarCheck, ArrowRight, Check } from 'lucide-react';

const features = [
  {
    icon: Users,
    label: 'Member Management',
    headline: ['TRACK EVERY', 'MEMBER WITH', 'PRECISION'],
    accent: 2,
    description: 'Photos, contact details, membership history — every member\'s full record in one place.'
  },
  {
    icon: IndianRupee,
    label: 'Payments & Renewals',
    headline: ['NEVER MISS', 'A RENEWAL', 'AGAIN'],
    accent: 1,
    description: 'Automatic due-date tracking so expiring memberships never slip through the cracks.'
  },
  {
    icon: CalendarCheck,
    label: 'Attendance Tracking',
    headline: ['SEE WHO\'S', 'TRAINING IN', 'REAL TIME'],
    accent: 2,
    description: 'One-tap check-ins and a live view of everyone in your gym right now.'
  }
];

const previewStats = [
  { label: 'Total Members', value: '17' },
  { label: "Today's Check-ins", value: '6' },
  { label: 'Month Revenue', value: '₹9,000' }
];

const Landing = () => {
  return (
    <div className="bg-ink-950 text-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-ink-950/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500/15 ring-1 ring-primary-400/25">
              <Dumbbell className="text-primary-400" size={18} />
            </div>
            <span className="font-display text-xl tracking-wide">
              GYM<span className="text-primary-500">FLOW</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-white hover:text-primary-400 transition-colors px-2">
              Login
            </Link>
            <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-20 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 ring-1 ring-white/10 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-ink-300">Built for Tricity Gym Owners</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl xl:text-7xl uppercase leading-[0.95] tracking-wide">
            Manage Smarter<br />
            Grow <span className="text-primary-500">Faster.</span>
          </h1>

          <p className="text-ink-400 text-lg mt-6 max-w-md leading-relaxed">
            Members, memberships, payments, and attendance — one clean dashboard built for gym owners who'd rather train people than chase spreadsheets.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-8">
            <Link to="/register" className="btn-primary !py-3 !px-6">
              Get Started
              <ArrowRight size={17} />
            </Link>
            <Link to="/login" className="btn-secondary !bg-transparent !border-white/15 !text-white hover:!bg-white/5 !py-3 !px-6">
              I have an account
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-3 mt-12 pt-8 border-t border-white/10">
            {['5 Core Modules', 'Real-time Sync', '100% Cloud-Based'].map((stat) => (
              <div key={stat} className="flex items-center gap-2 text-sm text-ink-300">
                <Check size={15} className="text-primary-500" strokeWidth={3} />
                {stat}
              </div>
            ))}
          </div>
        </div>

        {/* Abstract product preview */}
        <div className="relative hidden lg:block">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary-500/10 rounded-full blur-[100px]" />
          <div className="relative bg-ink-900 rounded-2xl border border-white/10 p-6 shadow-lift rotate-2">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Dashboard Overview</p>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white/20" />
                <span className="w-2 h-2 rounded-full bg-white/20" />
                <span className="w-2 h-2 rounded-full bg-primary-500" />
              </div>
            </div>
            <div className="space-y-3">
              {previewStats.map((s) => (
                <div key={s.label} className="flex items-center justify-between p-3.5 rounded-xl bg-white/5">
                  <span className="text-sm text-ink-300">{s.label}</span>
                  <span className="font-display text-xl text-white tracking-wide">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 bg-ink-900 border border-white/10 rounded-xl p-4 shadow-lift -rotate-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400">
                <Check size={14} strokeWidth={3} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Payment recorded</p>
                <p className="text-[0.65rem] text-ink-400">Just now</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="hazard-stripe" />

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <h2 className="font-display text-3xl md:text-4xl uppercase leading-tight max-w-xl">
            Built for the way<br />you run your <span className="text-primary-500">gym.</span>
          </h2>
          <p className="text-ink-400 max-w-sm">
            Everything a gym owner touches daily, without the spreadsheets and sticky notes.
          </p>
        </div>

        <div id="how-it-works" className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.label} className="bg-ink-900 rounded-2xl border border-white/10 p-7 hover:border-primary-500/30 transition-colors">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary-500/15 text-primary-400 mb-6">
                <f.icon size={20} strokeWidth={2.2} />
              </div>
              <h3 className="font-display text-2xl uppercase leading-[1.05] mb-4">
                {f.headline.map((line, i) => (
                  <span key={i} className={i === f.accent ? 'text-primary-500' : ''}>
                    {line}
                    <br />
                  </span>
                ))}
              </h3>
              <p className="text-ink-400 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 text-center">
          <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
            Run your gym like <span className="text-primary-500">clockwork.</span>
          </h2>
          <p className="text-ink-400 mt-4 max-w-md mx-auto">
            Set up your gym in minutes — no credit card, no spreadsheets, no missed renewals.
          </p>
          <Link to="/register" className="btn-primary !py-3.5 !px-8 mt-8 inline-flex">
            Get Started Free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500/15 ring-1 ring-primary-400/25">
              <Dumbbell className="text-primary-400" size={16} />
            </div>
            <span className="font-display text-lg tracking-wide">
              GYM<span className="text-primary-500">FLOW</span>
            </span>
          </div>
          <p className="text-xs text-ink-500">&copy; {new Date().getFullYear()} GymFlow. Built for gym owners in Chandigarh, Mohali & Panchkula.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
