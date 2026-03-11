import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../shared/auth/AuthContext';
import { getMyMockOrders } from '../../../shared/mock/flowStore';
import { getMyOrders } from '../../orders/api/ordersApi';
import { getOrderBadgeMeta } from '../../../shared/ui/productBadge';

export default function AccountOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        const live = await getMyOrders();
        if (isMounted) setOrders(live.orders || []);
      } catch {
        if (isMounted) setOrders(getMyMockOrders(user?.id));
      }
    }

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 text-zinc-100">
      <h1 className="text-4xl font-black">My Orders</h1>
      <p className="mt-3 text-zinc-400">Track all orders placed from your account.</p>

      <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-6">
        {orders.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-zinc-400">
            No orders yet. Start with a quote to place your first order.
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
                        const badge = getOrderBadgeMeta(order.items || []);
                        return (
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${badge.className}`}>
                            {badge.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="text-sm text-zinc-400">Status: {order.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${Number(order.totals?.total || 0).toFixed(2)}</div>
                    <Link to={`/orders/${order.orderNumber}`} className="text-sm text-orange-400">View tracking</Link>
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
