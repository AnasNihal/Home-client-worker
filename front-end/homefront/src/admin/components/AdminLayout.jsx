import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { clearAdminSession, getAdminUser } from '../adminUtils';

const navigation = [
  { path: '/admin/dashboard', label: 'Overview', icon: '▦' },
  { path: '/admin/users', label: 'Customers', icon: '◉' },
  { path: '/admin/workers', label: 'Workers', icon: '⚒' },
  { path: '/admin/services', label: 'Services', icon: '◆' },
  { path: '/admin/bookings', label: 'Bookings', icon: '▣' },
  { path: '/admin/reviews', label: 'Reviews', icon: '★' },
  { path: '/admin/payments', label: 'Payments', icon: '₹' },
];

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const admin = getAdminUser();
  const active = navigation.find((item) => location.pathname.startsWith(item.path));

  const logout = () => {
    clearAdminSession();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {sidebarOpen && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-950 text-white shadow-xl transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-lg font-black text-slate-950">O</div>
          <div>
            <div className="text-lg font-bold">Olton</div>
            <div className="text-xs text-slate-400">Marketplace control</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Administration</p>
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/20' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-sm">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl bg-white/5 px-3 py-3">
            <div className="truncate text-sm font-semibold">{admin.username || 'Administrator'}</div>
            <div className="text-xs text-slate-400">Superuser account</div>
          </div>
          <button onClick={logout} className="w-full rounded-xl border border-white/10 px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/10 hover:text-white">Sign out</button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button aria-label="Open menu" className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden" onClick={() => setSidebarOpen(true)}>☰</button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Admin console</p>
              <h1 className="text-xl font-bold text-slate-900">{active?.label || 'Overview'}</h1>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">Protected area</span>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 font-bold text-white">{(admin.username || 'A').slice(0, 1).toUpperCase()}</div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-5rem)] p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
