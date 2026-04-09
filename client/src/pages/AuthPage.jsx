import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import SectionHeader from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';
import { registerDoctorRequest } from '../services/api';

const initialRegister = {
  name: '',
  email: '',
  password: '',
  specialization: '',
  fees: '',
  availableSlotsText: '',
};

const initialLogin = {
  email: '',
  password: '',
};

function AuthPage() {
  const { login, register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [registerAs, setRegisterAs] = useState('patient');
  const [formData, setFormData] = useState(initialLogin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  useEffect(() => {
    setFormData(mode === 'login' ? initialLogin : initialRegister);
    setError('');
    setSuccess('');
  }, [mode]);

  const validate = () => {
    if (mode === 'register') {
      if (!formData.name.trim()) return 'Name is required.';
      if (registerAs === 'doctor') {
        if (!formData.specialization.trim()) return 'Specialization is required for doctor request.';
        if (!formData.fees || Number(formData.fees) < 0) return 'Please enter valid consultation fees.';
      }
    }

    if (!formData.email.includes('@')) return 'Please enter a valid email address.';
    if (!formData.password || formData.password.length < 6) return 'Password must be at least 6 characters.';

    return '';
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        if (registerAs === 'doctor') {
          const availableSlots = formData.availableSlotsText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const [date, time] = line.split(',').map((part) => part.trim());
              return { date, time };
            })
            .filter((slot) => slot.date && slot.time);

          await registerDoctorRequest({
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            specialization: formData.specialization.trim(),
            fees: Number(formData.fees),
            availableSlots,
          });

          setSuccess('Doctor request submitted. Admin approval is required before dashboard access.');
          setMode('login');
          setRegisterAs('patient');
          return;
        }

        const authUser = await register({ name: formData.name.trim(), email: formData.email.trim(), password: formData.password });
        setSuccess(`Welcome${authUser?.name ? `, ${authUser.name}` : ''}.`);
        navigate('/dashboard', { replace: true });
        return;
      }

      const authUser = await login({ email: formData.email.trim(), password: formData.password });
      setSuccess(`Welcome back${authUser?.name ? `, ${authUser.name}` : ''}.`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/20">
        <div className="flex h-full flex-col justify-between gap-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal-200">Access portal</p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Welcome to your care portal.</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              Patients can create accounts here and start booking appointments quickly. Doctor and clinic staff accounts are provided by the clinic team.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Easy', 'Simple booking journey'],
              ['Trusted', 'Verified care team'],
              ['Smooth', 'Quick account access'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">{label}</p>
                <p className="mt-2 text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
        <SectionHeader
          eyebrow="Account"
          title={mode === 'login' ? 'Welcome back' : 'Create your account'}
          description={
            mode === 'login'
              ? 'Sign in to view your appointments and continue your care journey.'
              : registerAs === 'doctor'
                ? 'Submit your doctor profile request. Admin approval is required before your account becomes active.'
                : 'Create a patient account to book appointments in minutes.'
          }
        />

        <div className="mt-6 flex rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition ${mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'register' ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setRegisterAs('patient')}
                  className={`rounded-2xl border px-4 py-2 text-sm font-bold transition ${registerAs === 'patient' ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-slate-300 text-slate-600'}`}
                >
                  Register as patient
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterAs('doctor')}
                  className={`rounded-2xl border px-4 py-2 text-sm font-bold transition ${registerAs === 'doctor' ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-slate-300 text-slate-600'}`}
                >
                  Request doctor account
                </button>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Full name</span>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </label>

              {registerAs === 'doctor' ? (
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Specialization</span>
                    <input
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="e.g. Cardiology"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Consultation fees</span>
                    <input
                      name="fees"
                      value={formData.fees}
                      onChange={handleChange}
                      type="number"
                      min="0"
                      placeholder="Enter fees"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Available slots</span>
                    <textarea
                      name="availableSlotsText"
                      value={formData.availableSlotsText}
                      onChange={handleChange}
                      rows="3"
                      placeholder="2026-04-10, 10:00\n2026-04-10, 11:00"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    />
                  </label>
                </div>
              ) : null}
            </>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            />
          </label>

          {error ? <Alert type="error" title="Validation failed">{error}</Alert> : null}
          {success ? <Alert type="success" title="Success">{success}</Alert> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : registerAs === 'doctor' ? 'Submit doctor request' : 'Create patient account'}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-500">
          Doctor accounts require admin verification before dashboard and patient booking access.
        </p>

        {user ? (
          <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
            Signed in as <span className="font-bold">{user.name}</span>.
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default AuthPage;