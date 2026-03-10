import { Link } from 'react-router-dom';
import { useAuth } from './shared/auth/AuthContext';

export default function App() {
  const { user, isAdmin, logout } = useAuth();

  const products = [
    { name: 'Yard Signs', desc: 'Corrugated plastic signs for campaigns, retail, and real estate.' },
    { name: 'Banners', desc: 'Indoor and outdoor banner printing with finishing options.' },
    { name: 'Aluminum Signs', desc: 'Durable metal signage for long-term exterior applications.' },
    { name: 'PVC Signs', desc: 'Rigid lightweight boards for clean, professional branding.' },
    { name: 'Acrylic Signs', desc: 'Premium clear and printed acrylic for modern presentation.' },
    { name: 'Window Graphics', desc: 'Perforated and adhesive vinyl solutions for storefronts.' },
  ];

  const steps = [
    { title: 'Choose Product', text: 'Select your product, size, material, quantity, and finishing.' },
    { title: 'Upload Artwork', text: 'Send press-ready files or request a review before production.' },
    { title: 'Approve and Print', text: 'We preflight, produce, package, and ship with production updates.' },
  ];

  const features = [
    'Trade-only wholesale pricing',
    'Fast production turnaround',
    'Large format product range',
    'Live quote-driven ordering',
    'Production-ready file workflow',
    'Nationwide shipping ready',
  ];

  return (
    <div className="min-h-screen bg-black text-white font-body">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <img
              src="/signscous-logo.png"
              alt="Signscous logo"
              className="h-24 w-auto object-contain md:h-28"
              onError={(e) => {
                e.currentTarget.src = '/signscous-logo.svg';
              }}
            />
          </div>

          <nav className="hidden items-center gap-8 text-sm text-zinc-300 md:flex">
            <a href="#products" className="hover:text-white">Products</a>
            <a href="#quote" className="hover:text-white">Instant Quote</a>
            <a href="#process" className="hover:text-white">How It Works</a>
            <a href="#about" className="hover:text-white">About</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                {isAdmin ? (
                  <Link to="/admin" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/5">Admin</Link>
                ) : (
                  <Link to="/account/orders" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/5">My Orders</Link>
                )}
                <button onClick={logout} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/5">Logout</button>
              </>
            ) : (
              <Link to="/login" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/5">Sign In</Link>
            )}
            <Link to="/yard-signs" className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-400">Get Instant Quote</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_25%)]" />
          <div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 md:grid-cols-2 md:py-28">
            <div className="hero-reveal relative z-10">
              <div className="mb-5 inline-flex rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-orange-400">
                Built for trade professionals
              </div>
              <h1 className="font-display max-w-xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
                Wholesale signage, <span className="text-orange-500">modernized</span>.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300">
                Signscous is a large format print platform for sign shops, resellers, agencies, and production buyers who need speed, clarity, and dependable wholesale output.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/yard-signs" className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold shadow-xl shadow-orange-500/20 hover:bg-orange-400">Start a Quote</Link>
                <Link to="/signup" className="rounded-2xl border border-white/15 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/5">Open Trade Account</Link>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-4 text-sm text-zinc-300 sm:grid-cols-3">
                {['Fast Turnaround', 'Wholesale Pricing', 'File Review', 'Bulk Orders', 'Nationwide Delivery', 'Production Updates'].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">{item}</div>
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <div className="mx-auto w-full max-w-xl md:max-w-2xl">
                <div className="grid gap-5 md:grid-cols-[16rem_1fr] md:items-start">
                <div className="h-44 w-full max-w-72 rounded-3xl border border-white/10 bg-zinc-900/85 p-5 shadow-2xl backdrop-blur-sm md:mt-20 md:max-w-none">
                  <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">Popular Product</div>
                  <div className="mt-4 text-3xl font-black">Yard Signs</div>
                  <div className="mt-2 text-zinc-400">18x24 • Coroplast • Double-sided</div>
                  <div className="mt-8 text-4xl font-black text-orange-500">$2.45</div>
                </div>
                <div className="h-[420px] w-full rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Instant Quote</div>
                      <div className="mt-2 text-2xl font-bold">Configure your order</div>
                    </div>
                    <div className="rounded-xl bg-orange-500/10 px-3 py-2 text-sm font-semibold text-orange-400">Live pricing</div>
                  </div>
                  <div className="mt-8 grid gap-4">
                    {['Product: Aluminum Sign', 'Size: 24 x 36', 'Sides: Double-sided', 'Quantity: 100', 'Finishing: Drill Holes'].map((field) => (
                      <div key={field} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-zinc-300">{field}</div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-5">
                    <div className="flex items-center justify-between text-sm text-zinc-300">
                      <span>Total</span>
                      <span className="text-3xl font-black text-white">$845.00</span>
                    </div>
                    <div className="mt-2 text-sm text-zinc-400">Estimated production: 24-48 hours</div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">Product categories</div>
              <h2 className="font-display mt-3 text-4xl font-bold tracking-tight">Core large format products</h2>
            </div>
            <div className="hidden text-sm text-zinc-400 md:block">Structured for high-volume wholesale ordering</div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product, idx) => (
              <div key={product.name} className="group rounded-3xl border border-white/10 bg-zinc-950 p-6 transition hover:-translate-y-1 hover:border-orange-500/30 hover:bg-zinc-900">
                <div className="mb-6 flex h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 ring-1 ring-white/10">
                  <div className="h-24 w-36 rounded-2xl border border-white/10 bg-white/5 shadow-xl" style={{ transform: `rotate(${idx % 2 === 0 ? -6 : 6}deg)` }} />
                </div>
                <div className="text-2xl font-bold">{product.name}</div>
                <p className="mt-3 leading-7 text-zinc-400">{product.desc}</p>
                <button className="mt-6 text-sm font-semibold text-orange-400">View specifications -&gt;</button>
              </div>
            ))}
          </div>
        </section>

        <section id="quote" className="border-y border-white/10 bg-zinc-950/60">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-white/10 bg-black p-8">
              <div className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">Instant quote engine</div>
              <h3 className="font-display mt-3 text-3xl font-bold">A pricing workflow your customers will actually use</h3>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {['Material', 'Size', 'Sides', 'Quantity', 'Finishing', 'Turnaround'].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-5 text-zinc-300">{item}</div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-dashed border-orange-500/30 bg-orange-500/5 p-5 text-zinc-300">
                Add file upload, artwork review, shipping calculation, and dynamic price rules here.
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-orange-500/10 to-transparent p-8">
              <div className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">Business value</div>
              <ul className="mt-6 space-y-4 text-zinc-300">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-4">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="process" className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">How it works</div>
            <h2 className="font-display mt-3 text-4xl font-bold tracking-tight">Simple workflow. Production mindset.</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="rounded-[2rem] border border-white/10 bg-zinc-950 p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-lg font-black text-white">{i + 1}</div>
                <div className="mt-6 text-2xl font-bold">{step.title}</div>
                <p className="mt-3 leading-7 text-zinc-400">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="border-t border-white/10 bg-zinc-950/60">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">Why Signscous</div>
              <h2 className="font-display mt-3 text-4xl font-bold tracking-tight">A wholesale brand that looks like the future, not the past</h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                This layout positions Signscous as a serious B2B print platform: sharp visual hierarchy, immediate quoting, a clear trade workflow, and a premium industrial aesthetic.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {['Modern dark interface', 'Clear product-led navigation', 'Quote-first conversion path', 'Scalable for portal and dashboard expansion'].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-black px-5 py-6 text-zinc-300">{item}</div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-[2rem] border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-zinc-900 p-8 md:p-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">Launch CTA</div>
                <h3 className="font-display mt-3 text-3xl font-bold md:text-4xl">Ready to build the full Signscous platform?</h3>
                <p className="mt-3 max-w-2xl text-zinc-300">Use this layout as the base for your homepage, then extend it into product pages, customer login, artwork upload, and order tracking.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white">Continue Design System</button>
                <button className="rounded-2xl border border-white/15 px-6 py-3 text-sm font-semibold text-zinc-100">Build Product Pages</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
          <div>
            <div className="font-display text-xl font-bold">SIGNSCOUS</div>
            <p className="mt-3 text-sm leading-7 text-zinc-400">Wholesale large format printing platform for trade buyers and production-driven resellers.</p>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">Products</div>
            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <div>Yard Signs</div>
              <div>Banners</div>
              <div>Aluminum</div>
              <div>Acrylic</div>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">Company</div>
            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <div>About</div>
              <div>Trade Accounts</div>
              <div>Resources</div>
              <div>Contact</div>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">Support</div>
            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <div>Artwork Guidelines</div>
              <div>Shipping Policy</div>
              <div>FAQ</div>
              <div>Order Status</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
