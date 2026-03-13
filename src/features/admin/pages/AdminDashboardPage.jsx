import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../shared/auth/AuthContext';
import { getAdminCustomers, getAdminOrders, updateAdminOrderStatus } from '../api/adminApi';
import { getAllMockOrders, updateMockOrderStatus } from '../../../shared/mock/flowStore';
import { getAllMockUsers } from '../../../shared/mock/authStore';
import { getOrderBadgeDetails } from '../../../shared/ui/productBadge';
import { downloadArtworkFromServer } from '../../../shared/api/artworkApi';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        const [liveOrders, liveCustomers] = await Promise.all([
          getAdminOrders(),
          getAdminCustomers(),
        ]);
        if (isMounted) {
          setOrders(liveOrders.orders || []);
          setCustomers(liveCustomers.customers || []);
        }
      } catch {
        if (!isMounted) return;
        if (import.meta.env.DEV) {
          setOrders(getAllMockOrders());
          setCustomers(getAllMockUsers());
        }
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleStatusChange(orderNumber, nextStatus) {
    try {
      await updateAdminOrderStatus(orderNumber, nextStatus);
      const live = await getAdminOrders();
      setOrders(live.orders || []);
    } catch {
      if (import.meta.env.DEV) {
        updateMockOrderStatus(orderNumber, nextStatus);
        setOrders(getAllMockOrders());
      }
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 text-zinc-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black">Admin Panel</h1>
          <p className="mt-2 text-zinc-400">Manage orders and monitor customer flow.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-white/15 px-3 py-2 text-xs text-zinc-300">{user?.email}</span>
          <button onClick={logout} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-zinc-200 hover:bg-white/5">Logout</button>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Customers</h2>
          <span className="text-sm text-zinc-400">{customers.length} total</span>
        </div>

        {customers.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-zinc-400">
            No customers found yet.
          </div>
        ) : (
          <div className="space-y-3">
            {customers.map((customer) => (
              <div key={customer.id} className="rounded-xl border border-white/10 bg-black/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">{customer.name || 'Unnamed Customer'}</div>
                    <div className="text-sm text-zinc-400">{customer.email}</div>
                    <div className="mt-1 text-sm text-zinc-400">Phone: {customer.phone || 'Not provided'}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Address: {[customer.addressLine1, customer.addressLine2, customer.city, customer.state, customer.postalCode, customer.country]
                        .filter(Boolean)
                        .join(', ') || 'Not provided'}
                    </div>
                  </div>
                  <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-zinc-300">{customer.role}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Orders</h2>
          <span className="text-sm text-zinc-400">{orders.length} total</span>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-zinc-400">
            No orders yet. Place a demo order from the checkout flow.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.orderNumber} className="rounded-xl border border-white/10 bg-black/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{order.orderNumber}</div>
                      {(() => {
                        const badge = getOrderBadgeDetails(order.items || []);
                        return (
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${badge.className}`}
                            title={badge.typeLabels.join(', ')}
                          >
                            {badge.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="text-sm text-zinc-400">Status: {order.status}</div>
                    <div className="text-xs text-zinc-500">Payment: {String(order.paymentMethod || 'card').replace('_', ' ')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${Number(order.totals?.total || 0).toFixed(2)}</div>
                    <Link to={`/orders/${order.orderNumber}`} className="text-sm text-orange-400">View tracking</Link>
                    {order.artworkId && (
                      <button
                        type="button"
                        onClick={() => downloadArtworkFromServer(order.artworkId).catch(() => alert('Artwork download failed.'))}
                        className="mt-1 flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                        Download artwork
                      </button>
                    )}
                    <select
                      className="mt-2 w-full rounded-lg border border-white/10 bg-zinc-900 px-2 py-1 text-xs"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.orderNumber, e.target.value)}
                    >
                      <option value="paid">paid</option>
                      <option value="preflight">preflight</option>
                      <option value="in_production">in_production</option>
                      <option value="packed">packed</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
