import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../shared/auth/AuthContext';
import { getAdminOrders, updateAdminOrderStatus } from '../api/adminApi';
import { getAllMockOrders, updateMockOrderStatus } from '../../../shared/mock/flowStore';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        const live = await getAdminOrders();
        if (isMounted) {
          setOrders(live.orders || []);
        }
      } catch {
        if (isMounted) {
          setOrders(getAllMockOrders());
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
      updateMockOrderStatus(orderNumber, nextStatus);
      setOrders(getAllMockOrders());
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
                    <div className="font-semibold">{order.orderNumber}</div>
                    <div className="text-sm text-zinc-400">Status: {order.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${Number(order.totals?.total || 0).toFixed(2)}</div>
                    <Link to={`/orders/${order.orderNumber}`} className="text-sm text-orange-400">View tracking</Link>
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
