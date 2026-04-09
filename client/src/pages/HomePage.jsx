import { Link } from 'react-router-dom';

const highlights = [
  { label: 'Quick booking', value: 'Book in a few steps' },
  { label: 'Trusted doctors', value: 'Experienced specialists' },
  { label: 'Care support', value: 'Help for every visit' },
];

const features = [
  'Find doctors by specialty',
  'Book appointments with preferred time slots',
  'Track and manage upcoming visits',
  'Better coordination for patients and clinics',
];

function HomePage() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/75 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:p-14">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-teal-800">
              Care appointments
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Your doctor appointment system, built for real care journeys.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Discover trusted doctors, choose suitable time slots, and stay on top of every appointment.
                Designed to be simple for patients, doctors, and clinic teams.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/doctors"
                className="rounded-full bg-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:-translate-y-0.5 hover:bg-teal-700"
              >
                Explore doctors
              </Link>
              <Link
                to="/auth"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Create account
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 p-6 text-white shadow-2xl shadow-slate-900/20 sm:p-8">
            <div className="flex h-full flex-col justify-between gap-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal-200">What you can do</p>
                <div className="mt-5 space-y-4">
                  {features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="text-sm font-medium text-slate-100">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-teal-100">Need help managing visits?</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Patients can track appointments, doctors can review requests, and clinics can organize daily schedules.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;