import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import { cancelAppointment, getAppointments } from '../services/api';

function PatientDashboardPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadAppointments = async () => {
    try {
      const response = await getAppointments();
      setAppointments(response.data.data.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCancel = async (appointmentId) => {
    setMessage('');
    try {
      await cancelAppointment(appointmentId);
      setMessage('Appointment cancelled successfully.');
      loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Patient"
        title="My appointments"
        description="Check your upcoming visits and make changes whenever needed."
      />

      {error ? <Alert type="error" title="Dashboard error">{error}</Alert> : null}
      {message ? <Alert type="success" title="Updated">{message}</Alert> : null}

      {loading ? (
        <LoadingSpinner label="Loading appointments" />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No appointments yet"
          description="Book your first consultation from the doctors page."
        />
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <article key={appointment._id} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-black text-slate-950">{appointment.doctorId?.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{appointment.doctorId?.specialization}</p>
                </div>
                <StatusBadge value={appointment.status} />
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Date</p>
                  <p className="mt-2 font-semibold text-slate-900">{appointment.date}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Time</p>
                  <p className="mt-2 font-semibold text-slate-900">{appointment.time}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Doctor fees</p>
                  <p className="mt-2 font-semibold text-slate-900">₹{appointment.doctorId?.fees}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleCancel(appointment._id)}
                  disabled={appointment.status === 'cancelled'}
                  className="rounded-full border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel appointment
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default PatientDashboardPage;