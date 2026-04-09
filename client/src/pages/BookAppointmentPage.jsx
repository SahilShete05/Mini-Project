import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import SectionHeader from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';
import { bookAppointment, getDoctors } from '../services/api';

const initialForm = {
  doctorId: '',
  date: '',
  time: '',
};

function BookAppointmentPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const response = await getDoctors();
        const list = response.data.data.doctors || [];
        setDoctors(list);

        const preselectedDoctorId = location.state?.doctorId;
        if (preselectedDoctorId) {
          setFormData((current) => ({ ...current, doctorId: preselectedDoctorId }));
        } else if (list[0]?._id) {
          setFormData((current) => ({ ...current, doctorId: list[0]._id }));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load doctors.');
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [location.state]);

  const selectedDoctor = doctors.find((doctor) => doctor._id === formData.doctorId);

  const dateOptions = useMemo(() => {
    if (!selectedDoctor?.availableSlots?.length) {
      return [];
    }

    return [...new Set(selectedDoctor.availableSlots.map((slot) => slot.date))];
  }, [selectedDoctor]);

  const timeOptions = useMemo(() => {
    if (!selectedDoctor?.availableSlots?.length || !formData.date) {
      return [];
    }

    return [
      ...new Set(
        selectedDoctor.availableSlots
          .filter((slot) => slot.date === formData.date)
          .map((slot) => slot.time)
      ),
    ];
  }, [selectedDoctor, formData.date]);

  useEffect(() => {
    if (!selectedDoctor) {
      return;
    }

    if (!selectedDoctor.availableSlots?.length) {
      return;
    }

    const firstDate = selectedDoctor.availableSlots[0]?.date || '';
    const firstTime =
      selectedDoctor.availableSlots.find((slot) => slot.date === firstDate)?.time || '';

    setFormData((current) => ({
      ...current,
      date: firstDate,
      time: firstTime,
    }));
  }, [selectedDoctor?._id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'date') {
      const nextTime =
        selectedDoctor?.availableSlots
          ?.find((slot) => slot.date === value)
          ?.time || '';

      setFormData((current) => ({ ...current, date: value, time: nextTime }));
      return;
    }

    setFormData((current) => ({ ...current, [name]: value }));
  };

  const validate = () => {
    if (!formData.doctorId) return 'Please select a doctor.';
    if (!formData.date) return 'Please choose a date.';
    if (!formData.time) return 'Please choose a time.';

    const appointmentDate = new Date(`${formData.date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) return 'Date must be today or later.';

    return '';
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

    setSubmitting(true);

    try {
      await bookAppointment(formData);
      setSuccess('Appointment booked successfully.');
      setFormData((current) => ({ ...current, date: '', time: '' }));
      setTimeout(() => navigate('/patient/dashboard'), 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Preparing booking form" fullScreen />;
  }

  if (error && doctors.length === 0) {
    return (
      <EmptyState
        title="Unable to load doctors"
        description={error}
        action={
          <button type="button" onClick={() => navigate('/doctors')} className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">
            Back to doctors
          </button>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
        <SectionHeader
          eyebrow="Booking"
          title="Book an appointment"
          description={`${user?.name || 'Patient'}, choose your doctor and select a convenient date and time.`}
        />

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Doctor</span>
            <select
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </label>

          {dateOptions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Step 1: Choose date</span>
                <select
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="">Select date</option>
                  {dateOptions.map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Step 2: Choose time</span>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  disabled={!formData.date || timeOptions.length === 0}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">Select time</option>
                  {timeOptions.map((time) => (
                    <option key={`${formData.date}-${time}`} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Date</span>
                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Time</span>
                <input
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </label>
            </div>
          )}

          {error ? <Alert type="error" title="Booking error">{error}</Alert> : null}
          {success ? <Alert type="success" title="Booked">{success}</Alert> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-teal-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Booking...' : 'Confirm appointment'}
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/20 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal-200">Selected doctor</p>
        {selectedDoctor ? (
          <div className="mt-5 space-y-5">
            <div>
              <h2 className="text-3xl font-black">{selectedDoctor.name}</h2>
              <p className="mt-2 text-sm text-slate-300">{selectedDoctor.specialization}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">Fees</p>
                <p className="mt-2 text-lg font-bold">₹{selectedDoctor.fees}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">Availability</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {selectedDoctor.availableSlots?.length ? selectedDoctor.availableSlots.map((slot) => `${slot.date} ${slot.time}`).join(' · ') : 'Flexible slots'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
              Choose a slot that works best for you and confirm your visit in one step.
            </div>
          </div>
        ) : (
          <div className="mt-6 text-sm text-slate-300">Select a doctor to see details.</div>
        )}
      </section>
    </div>
  );
}

export default BookAppointmentPage;