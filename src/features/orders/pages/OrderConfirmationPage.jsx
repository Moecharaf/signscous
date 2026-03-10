import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderSummary } from '../api/ordersApi';
import { getMockOrderSummary } from '../../../shared/mock/flowStore';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      try {
        const live = await getOrderSummary(orderNumber);
        if (isMounted) setSummary(live);
      } catch {
        const fallback = getMockOrderSummary(orderNumber);
        if (isMounted) setSummary(fallback);
      }
    }

    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [orderNumber]);

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 text-zinc-100">
      <h1 className="text-4xl font-black">Order Confirmation</h1>
      <p className="mt-3 text-zinc-400">Show order number, totals, production ETA, and shipment estimate.</p>

      <div className="mt-6 rounded-3xl border border-white/10 bg-zinc-950 p-6">
        <div className="text-sm text-zinc-400">Order number</div>
        <div className="mt-1 text-2xl font-bold text-white">{orderNumber}</div>
        {summary?.totals ? (
          <div className="mt-3 text-sm text-zinc-300">Total: ${Number(summary.totals.total || 0).toFixed(2)}</div>
        ) : null}
        <div className="mt-4 text-sm text-zinc-300">Estimated production: 2 business days</div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to={`/orders/${orderNumber}`} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-400">
          Track Order
        </Link>
        <Link to="/" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/5">
          Back to Homepage
        </Link>
      </div>
    </section>
  );
}
