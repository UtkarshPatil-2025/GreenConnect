import Link from "next/link";
import Navbar from "@/components/Navbar";
import ImpactEstimator from "@/components/ImpactEstimator";
import {
  FiRefreshCw,
  FiTruck,
  FiShield,
  FiAward,
  FiMapPin,
  FiCheckCircle,
  FiArrowRight,
  FiCpu,
  FiUsers,
  FiBarChart2,
  FiArrowUpRight,
  FiCheck,
  FiClock,
  FiLock,
} from "react-icons/fi";

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfcf9] text-slate-900">
      <Navbar />

      <main>
        <section className="hero-wash relative isolate overflow-hidden">
          <div className="hero-grid absolute inset-0 -z-10 opacity-60" />
          <div className="absolute -right-40 top-10 -z-10 h-[34rem] w-[34rem] rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-emerald-900 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
                </span>
                A smarter circle for your old tech
              </div>
              <h1 className="mt-7 max-w-2xl text-5xl font-extrabold leading-[1.04] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.5rem]">
                Your old tech.
                <span className="block text-emerald-700">A better next life.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Book a responsible e-waste pickup, follow its journey, and
                connect with recyclers who put valuable materials back to work.
                A clearer path from clutter to circular.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-800"
                >
                  Start recycling <FiArrowRight aria-hidden="true" />
                </Link>
                <Link
                  href="/recyclers"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-5 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white"
                >
                  <FiShield className="text-emerald-700" aria-hidden="true" />
                  Explore recyclers
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5"><FiCheck className="text-emerald-700" /> Clear pickup updates</span>
                <span className="inline-flex items-center gap-1.5"><FiCheck className="text-emerald-700" /> Secure handover</span>
                <span className="inline-flex items-center gap-1.5"><FiCheck className="text-emerald-700" /> Recycler directory</span>
              </div>
            </div>

            <div className="hero-scene relative mx-auto h-[430px] w-full max-w-[540px] sm:h-[500px]" aria-label="Illustration of electronics being returned to a circular economy">
              <div className="scene-glow absolute inset-[8%] rounded-full bg-emerald-200/70 blur-3xl" />
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="orbit orbit-three" />

              <div className="device laptop-device">
                <div className="laptop-screen">
                  <div className="laptop-camera" />
                  <div className="screen-art">
                    <FiRefreshCw className="screen-cycle" aria-hidden="true" />
                    <span>give tech</span>
                    <span>a next life</span>
                  </div>
                  <div className="screen-base" />
                </div>
                <div className="laptop-keyboard" />
                <div className="laptop-bottom" />
              </div>
              <div className="device phone-device">
                <div className="phone-notch" />
                <div className="phone-screen">
                  <FiRefreshCw aria-hidden="true" />
                  <span>circular</span>
                  <span>by design</span>
                </div>
                <div className="phone-button" />
              </div>

              <div className="float-card tracking-card">
                <div className="flex items-center justify-between gap-5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><FiTruck /></span>
                    <div><p className="text-xs font-bold text-slate-900">Pickup update</p><p className="text-[10px] text-slate-500">Your item is in good hands</p></div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.12)]" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="h-1.5 flex-1 rounded-full bg-emerald-600" /><span className="h-1.5 flex-1 rounded-full bg-emerald-600" /><span className="h-1.5 flex-1 rounded-full bg-emerald-100" /><span className="h-1.5 flex-1 rounded-full bg-slate-100" />
                </div>
                <div className="mt-2 flex justify-between text-[9px] font-medium text-slate-400"><span>Booked</span><span>Collected</span><span>Recycled</span></div>
              </div>
              <div className="float-card trust-card">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800"><FiShield /></span>
                <span><span className="block text-xs font-bold text-slate-900">Recycler partners</span><span className="text-[10px] text-slate-500">Find a recycler near you</span></span>
                <FiArrowUpRight className="ml-auto text-emerald-700" />
              </div>
              <div className="scene-caption absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/80 bg-white/70 px-4 py-2 text-[10px] font-semibold tracking-wide text-emerald-950 shadow-sm backdrop-blur">
                KEEP MATERIALS MOVING FORWARD
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200/80 bg-white py-8">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
            {[
              { icon: FiClock, title: "Convenient pickups", text: "Choose a time that works" },
              { icon: FiMapPin, title: "Journey updates", text: "Know what happens next" },
              { icon: FiLock, title: "Secure handover", text: "One-time pickup verification" },
              { icon: FiShield, title: "Recycler discovery", text: "Explore listed facilities" },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><Icon aria-hidden="true" /></span>
                <span><span className="block text-xs font-bold text-slate-900 sm:text-sm">{title}</span><span className="mt-0.5 block text-[10px] text-slate-500 sm:text-xs">{text}</span></span>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Simple by design</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">A better way to let go of old tech</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">From your first listing to responsible processing, stay in the loop at every step.</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                { number: "01", icon: FiCpu, title: "Tell us what you have", text: "Create a listing with the item category, condition, and estimated weight." },
                { number: "02", icon: FiTruck, title: "Choose your pickup", text: "Request collection and keep your handover protected with a one-time code." },
                { number: "03", icon: FiRefreshCw, title: "Follow the next chapter", text: "Track pickup progress and keep a record of items moving toward recovery." },
              ].map(({ number, icon: Icon, title, text }) => (
                <article key={number} className="group rounded-3xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 transition group-hover:bg-emerald-700 group-hover:text-white"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="text-sm font-bold tracking-widest text-emerald-800/35">{number}</span>
                  </div>
                  <h3 className="mt-7 text-lg font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f1f5ef] py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Tools for a cleaner handoff</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Thoughtful at every step</h2>
              </div>
              <Link href="/recyclers" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950">Browse recycler directory <FiArrowRight /></Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: FiMapPin, title: "Pickup journey", text: "See pickup status and follow progress through the collection lifecycle.", tint: "bg-sky-100 text-sky-800" },
                { icon: FiShield, title: "Secure handover", text: "Use a one-time pickup code to help confirm the right person collects your items.", tint: "bg-emerald-100 text-emerald-800" },
                { icon: FiCheckCircle, title: "Recycler directory", text: "Explore recycler profiles, processing capabilities, and pickup availability.", tint: "bg-violet-100 text-violet-800" },
                { icon: FiBarChart2, title: "Personal impact", text: "See your listed items and pickup activity together in your dashboard.", tint: "bg-amber-100 text-amber-800" },
                { icon: FiAward, title: "Eco-credit tracking", text: "Keep an eye on reward points associated with your recycling activity.", tint: "bg-rose-100 text-rose-800" },
                { icon: FiUsers, title: "Generator & recycler accounts", text: "Separate experiences for households and facilities, with role-based workspaces.", tint: "bg-cyan-100 text-cyan-800" },
              ].map(({ icon: Icon, title, text, tint }) => (
                <article key={title} className="rounded-2xl border border-white bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tint}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ImpactEstimator />
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 px-6 py-14 text-center text-white sm:px-12 sm:py-16">
            <div className="absolute -right-10 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute -right-1 -top-16 h-56 w-56 rounded-full border border-white/10" />
            <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Take the first step</p>
            <h2 className="relative mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">Give your unused electronics a responsible next chapter.</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-sm leading-6 text-emerald-100/80">Create an account to list an item, plan a pickup, and keep track of the journey.</p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-950 shadow transition hover:-translate-y-0.5 hover:bg-emerald-50">Create your account <FiArrowRight /></Link>
              <Link href="/recyclers" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15">Find a recycler <FiArrowUpRight /></Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-sm text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 sm:px-6 md:flex-row lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white"><FiRefreshCw /></span>Green<span className="-ml-2 text-emerald-700">Circuit</span></Link>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/recyclers" className="hover:text-emerald-700">Recycler directory</Link>
            <Link href="/login" className="hover:text-emerald-700">Sign in</Link>
            <Link href="/signup" className="hover:text-emerald-700">Create account</Link>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} GreenCircuit</p>
        </div>
      </footer>
    </div>
  );
}
