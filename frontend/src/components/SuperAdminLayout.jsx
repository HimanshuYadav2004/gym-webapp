import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Building2, LogOut, ShieldCheck } from 'lucide-react';

const SuperAdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Platform' },
    { path: '/admin/gyms', icon: Building2, label: 'All Gyms' },
  ];

  return (
    <div className="min-h-screen flex bg-ink-950">
      <aside className="w-72 shrink-0 h-screen sticky top-0 flex flex-col bg-ink-900 border-r border-white/10">
        <div className="px-6 pt-7 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary-500/15 ring-1 ring-primary-400/25">
              <ShieldCheck className="text-primary-400" size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-lg tracking-wide leading-none">
                GYM<span className="text-primary-500">FLOW</span>
              </h1>
              <p className="text-xs text-primary-400 mt-1.5 font-semibold uppercase tracking-wide">Super Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="px-3.5 mb-2 text-[0.65rem] font-semibold text-ink-500 uppercase tracking-widest">
            Platform
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? 'sidebar-link-active' : 'sidebar-link')}
            >
              <item.icon size={18} strokeWidth={2.2} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 pb-5 pt-3">
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center gap-3 px-2 mb-3">
              <div className="avatar-fallback w-9 h-9 text-xs ring-1 ring-white/10">
                {(user?.fullName || 'A').charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.fullName}</p>
                <p className="text-xs text-ink-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-ink-300 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors duration-150"
            >
              <LogOut size={17} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-[1400px] mx-auto p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;
