import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminFetch, readAdminError } from '../adminUtils';
import { API_ENDPOINTS } from '../../constants/api';

const statusTone = { pending: 'bg-amber-50 text-amber-700', confirmed: 'bg-blue-50 text-blue-700', accepted: 'bg-blue-50 text-blue-700', in_progress: 'bg-violet-50 text-violet-700', completed: 'bg-emerald-50 text-emerald-700', canceled: 'bg-rose-50 text-rose-700' };
const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
const date = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const Stat = ({ label, value, hint, accent }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`mb-5 h-1.5 w-12 rounded-full ${accent}`} /><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{value}</p>{hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}</div>
);

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    adminFetch(API_ENDPOINTS.ADMIN_DASHBOARD).then(async (response) => {
      if (!response.ok) throw new Error(await readAdminError(response, 'Unable to load dashboard'));
      return response.json();
    }).then((data) => mounted && setStats(data)).catch((err) => mounted && setError(err.message)).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <AdminLayout><div className="grid min-h-[420px] place-items-center"><div className="text-sm text-slate-500">Loading dashboard…</div></div></AdminLayout>;
  if (error) return <AdminLayout><div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700">{error}</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-emerald-600">Good to see you</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Marketplace overview</h2><p className="mt-1 text-slate-500">A live snapshot of Olton’s customers, workers and bookings.</p></div><div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">Updated {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Total customers" value={stats.total_users} hint={`${stats.new_users_this_month || 0} joined this month`} accent="bg-emerald-500" /><Stat label="Total workers" value={stats.total_workers} hint={`${stats.new_workers_this_month || 0} registered this month`} accent="bg-blue-500" /><Stat label="Services" value={stats.total_services} hint="Worker-provided services" accent="bg-violet-500" /><Stat label="Total bookings" value={stats.total_bookings} hint={`${stats.pending_bookings || 0} waiting for action`} accent="bg-amber-500" /></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Pending" value={stats.pending_bookings} accent="bg-amber-500" /><Stat label="In progress" value={stats.in_progress_bookings} accent="bg-violet-500" /><Stat label="Completed" value={stats.completed_bookings} accent="bg-emerald-500" /><Stat label="Cancelled" value={stats.cancelled_bookings} accent="bg-rose-500" /></div>
        <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h3 className="font-semibold text-slate-950">Recent bookings</h3><p className="text-xs text-slate-500">Latest marketplace activity</p></div><a href="/admin/bookings" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">View all</a></div><div className="divide-y divide-slate-100">{(stats.recent_bookings || []).length === 0 && <div className="p-8 text-center text-sm text-slate-500">No bookings yet.</div>}{(stats.recent_bookings || []).map((booking) => <div key={booking.id} className="flex items-center justify-between gap-4 px-5 py-4"><div className="min-w-0"><p className="truncate font-semibold text-slate-800">#{booking.id} · {booking.service_name}</p><p className="mt-1 truncate text-sm text-slate-500">{booking.user_name} → {booking.worker_name} · {date(booking.scheduled_date)}</p></div><div className="text-right"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[booking.booking_status] || 'bg-slate-100 text-slate-600'}`}>{booking.booking_status.replace('_', ' ')}</span><p className="mt-1 text-xs text-slate-500">{money(booking.total_amount)}</p></div></div>)}</div></section>
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h3 className="font-semibold text-slate-950">Recent registrations</h3><p className="text-xs text-slate-500">Newest customers and workers</p></div><div className="divide-y divide-slate-100">{(stats.recent_users || []).map((user) => <div key={`u-${user.id}`} className="flex items-center justify-between px-5 py-3"><div><p className="font-medium text-slate-800">{user.full_name}</p><p className="text-xs text-slate-500">Customer · {user.email || user.username}</p></div><span className="text-xs text-slate-400">{date(user.date_joined)}</span></div>)}{(stats.recent_workers || []).map((worker) => <div key={`w-${worker.id}`} className="flex items-center justify-between px-5 py-3"><div><p className="font-medium text-slate-800">{worker.name}</p><p className="text-xs text-slate-500">Worker · {worker.category}</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold capitalize text-slate-600">{worker.verification_status}</span></div>)}</div></section>
        </div>
        <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-slate-950 p-6 text-white"><p className="text-sm text-slate-400">Paid revenue</p><p className="mt-2 text-3xl font-bold">{money(stats.total_revenue)}</p><p className="mt-2 text-sm text-slate-400">{money(stats.revenue_this_month)} this month</p></div><div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6"><p className="text-sm font-semibold text-emerald-700">Operations health</p><p className="mt-2 text-3xl font-bold text-emerald-950">{stats.pending_bookings || 0}</p><p className="mt-2 text-sm text-emerald-700">bookings need review</p></div></div>
      </div>
    </AdminLayout>
  );
};

export default DashboardOverview;
