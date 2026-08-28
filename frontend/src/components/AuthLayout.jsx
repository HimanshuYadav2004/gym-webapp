import { Dumbbell, Check } from 'lucide-react';

const features = [
  'Track dues before they slip through the cracks',
  'Record payments and renewals in seconds',
  "See today's check-ins at a glance"
];

const AuthLayout = ({ children, wide = false }) => {
  return (
    <div className="min-h-screen flex bg-ink-950">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden bg-gradient-to-br from-ink-950 via-ink-900 to-ink-950 border-r border-white/10 flex-col justify-between p-12 shrink-0">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] animate-[aurora-drift-1_16s_ease-in-out_infinite]" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px] animate-[aurora-drift-2_20s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary-400/10 rounded-full blur-[90px] animate-[aurora-drift-2_24s_ease-in-out_infinite]" />

        <div className="relative flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary-500/15 ring-1 ring-primary-400/25">
            <Dumbbell className="text-primary-400" size={22} />
          </div>
          <span className="font-display text-lg tracking-wide">
            GYM<span className="text-primary-500">FLOW</span>
          </span>
        </div>

        <div className="relative">
          <h2 className="font-display text-4xl text-white uppercase leading-[0.95] mb-4">
            Run your gym,<br />like <span className="text-primary-500">clockwork.</span>
          </h2>
          <p className="text-ink-400 max-w-sm leading-relaxed">
            Members, memberships, payments, and attendance — all in one clean workspace built for gym owners.
          </p>

          <div className="mt-8 space-y-3">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-ink-300">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-500/15 shrink-0">
                  <Check size={12} className="text-primary-400" strokeWidth={3} />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-ink-500">&copy; {new Date().getFullYear()} GymFlow</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-ink-950">
        <div className={`w-full ${wide ? 'max-w-xl' : 'max-w-sm'}`}>
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500/15 ring-1 ring-primary-400/25">
              <Dumbbell className="text-primary-400" size={26} />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
