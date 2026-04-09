import { useEffect, useMemo, useState } from 'react';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import { approveAppointment, getAppointments, rejectAppointment } from '../services/api';

function DoctorDashboardPage() {
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

  const pendingCount = useMemo(() => appointments.filter((appointment) => appointment.status === 'pending').length, [appointments]);

  const handleAction = async (appointmentId, action) => {
    setMessage('');
    try {
      if (action === 'approve') {
        await approveAppointment(appointmentId);
        setMessage('Appointment approved.');
      } else {
        await rejectAppointment(appointmentId);
        setMessage('Appointment rejected.');
      }
      loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update appointment.');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Doctor"
        title="Appointment requests"
        description={`You have ${pendingCount} pending request${pendingCount === 1 ? '' : 's'} to review.`}
      />

      {error ? <Alert type="error" title="Dashboard error">{error}</Alert> : null}
      {message ? <Alert type="success" title="Updated">{message}</Alert> : null}

      {loading ? (
        <LoadingSpinner label="Loading appointments" />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No appointments assigned"
          description="New patient requests will appear here once appointments are booked."
        />
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <article key={appointment._id} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-black text-slate-950">{appointment.patientId?.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{appointment.patientId?.email}</p>
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
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Fees</p>
                  <p className="mt-2 font-semibold text-slate-900">₹{appointment.doctorId?.fees}</p>
                </div>
              </div>

              {appointment.status === 'pending' ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleAction(appointment._id, 'approve')}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(appointment._id, 'reject')}
                    className="rounded-full border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
                  >
                    Decline
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorDashboardPage;