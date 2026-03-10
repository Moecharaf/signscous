import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderSummary, getOrderTimeline } from '../api/ordersApi';
import { getMockOrderSummary, getMockOrderTimeline } from '../../../shared/mock/flowStore';

export default function OrderTrackingPage() {
  const { orderNumber } = useParams();
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadTracking() {
      try {
        const [liveSummary, liveTimeline] = await Promise.all([
          getOrderSummary(orderNumber),
          getOrderTimeline(orderNumber),
        ]);
        if (isMounted) {
          setSummary(liveSummary);
          setTimeline(liveTimeline.events || []);
        }
      } catch {
        if (isMounted) {
          setSummary(getMockOrderSummary(orderNumber));
          setTimeline(getMockOrderTimeline(orderNumber));
        }
      }
    }

    loadTracking();
    return () => {
      isMounted = false;
    };
  }, [orderNumber]);

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 text-zinc-100">
      <h1 className="text-4xl font-black">Order Tracking</h1>
      <p className="mt-3 text-zinc-400">Render production and shipping timeline events for the order.</p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-5 text-sm text-zinc-300">
        Tracking order: <span className="font-semibold text-white">{orderNumber}</span>
      </div>

      {summary?.status ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-950 p-5 text-sm text-zinc-300">
          Current status: <span className="font-semibold text-white">{summary.status}</span>
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {timeline.map((event, index) => (
          <div key={`${event.status}-${index}`} className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
            <div className="text-sm font-semibold text-orange-400">{event.status}</div>
            <div className="mt-1 text-sm text-zinc-300">{event.message}</div>
          </div>
        ))}
        {timeline.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4 text-sm text-zinc-400">Loading timeline...</div>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/yard-signs" className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-400">
          Start New Quote
        </Link>
        <Link to="/" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/5">
          Back to Homepage
        </Link>
      </div>
    </section>
  );
}
