import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import {
  addDoctor,
  getDoctorRequests,
  getDoctors,
  getUsers,
  removeDoctor,
  removeUser,
  updateDoctor,
  updateDoctorRequestStatus,
  updateUser,
} from '../services/api';

const initialDoctorForm = {
  name: '',
  email: '',
  password: '',
  specialization: '',
  fees: '',
  availableSlotsText: '',
};

function parseSlots(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [date, time] = line.split(',').map((part) => part.trim());
      return { date, time };
    })
    .filter((slot) => slot.date && slot.time);
}

function AdminPanelPage() {
  const [doctorForm, setDoctorForm] = useState(initialDoctorForm);
  const [doctors, setDoctors] = useState([]);
  const [doctorRequests, setDoctorRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const [doctorResponse, userResponse, requestResponse] = await Promise.all([
        getDoctors(),
        getUsers(),
        getDoctorRequests(),
      ]);
      setDoctors(doctorResponse.data.data.doctors || []);
      setUsers(userResponse.data.data.users || []);
      setDoctorRequests(requestResponse.data.data.doctorRequests || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDoctorChange = (event) => {
    const { name, value } = event.target;
    setDoctorForm((current) => ({ ...current, [name]: value }));
  };

  const handleDoctorSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!doctorForm.name || !doctorForm.email || !doctorForm.password || !doctorForm.specialization || !doctorForm.fees) {
      setError('All doctor fields except slots are required.');
      return;
    }

    setSubmitting(true);

    try {
      await addDoctor({
        name: doctorForm.name.trim(),
        email: doctorForm.email.trim(),
        password: doctorForm.password,
        specialization: doctorForm.specialization.trim(),
        fees: Number(doctorForm.fees),
        availableSlots: parseSlots(doctorForm.availableSlotsText),
      });
      setMessage('Doctor added successfully.');
      setDoctorForm(initialDoctorForm);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add doctor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    setError('');
    setMessage('');

    try {
      await removeDoctor(doctorId);
      setMessage('Doctor removed successfully.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove doctor.');
    }
  };

  const handleReviewDoctorRequest = async (requestId, status) => {
    setError('');
    setMessage('');

    try {
      await updateDoctorRequestStatus(requestId, status);
      setMessage(`Doctor request ${status}.`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update doctor request.');
    }
  };

  const handleUpdateDoctor = async (doctor) => {
    const name = window.prompt('Doctor name', doctor.name);
    if (name === null) return;

    const specialization = window.prompt('Specialization', doctor.specialization);
    if (specialization === null) return;

    const feesInput = window.prompt('Fees', String(doctor.fees));
    if (feesInput === null) return;

    const isActiveInput = window.prompt('Active doctor? (yes/no)', doctor.isActive ? 'yes' : 'no');
    if (isActiveInput === null) return;

    try {
      await updateDoctor(doctor._id, {
        name: name.trim(),
        specialization: specialization.trim(),
        fees: Number(feesInput),
        isActive: isActiveInput.toLowerCase() === 'yes',
      });
      setMessage('Doctor updated successfully.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update doctor.');
    }
  };

  const handleDeleteUser = async (userId) => {
    setError('');
    setMessage('');

    try {
      await removeUser(userId);
      setMessage('User removed successfully.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove user.');
    }
  };

  const handleUpdateUser = async (account) => {
    const name = window.prompt('User name', account.name);
    if (name === null) return;

    const email = window.prompt('User email', account.email);
    if (email === null) return;

    const role = window.prompt('Role (patient/doctor/admin)', account.role);
    if (role === null) return;

    const isActiveInput = window.prompt('Active user? (yes/no)', account.isActive ? 'yes' : 'no');
    if (isActiveInput === null) return;

    try {
      await updateUser(account._id, {
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
        isActive: isActiveInput.toLowerCase() === 'yes',
      });
      setMessage('User updated successfully.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update user.');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Admin"
        title="Clinic management"
        description="Add doctors, organize staff records, and keep clinic schedules up to date."
      />

      {error ? <Alert type="error" title="Action could not be completed">{error}</Alert> : null}
      {message ? <Alert type="success" title="Updated">{message}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
          <h3 className="text-xl font-black text-slate-900">Add a doctor</h3>
          <form onSubmit={handleDoctorSubmit} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="name" value={doctorForm.name} onChange={handleDoctorChange} placeholder="Doctor name" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100" />
              <input name="email" value={doctorForm.email} onChange={handleDoctorChange} placeholder="Doctor email" type="email" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100" />
              <input name="password" value={doctorForm.password} onChange={handleDoctorChange} placeholder="Temporary password" type="password" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100" />
              <input name="specialization" value={doctorForm.specialization} onChange={handleDoctorChange} placeholder="Specialization" className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100" />
            </div>

            <input name="fees" value={doctorForm.fees} onChange={handleDoctorChange} placeholder="Fees" type="number" min="0" className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100" />

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Available slots</span>
              <textarea
                name="availableSlotsText"
                value={doctorForm.availableSlotsText}
                onChange={handleDoctorChange}
                rows="5"
                placeholder="2026-04-10, 10:00\n2026-04-10, 11:00"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
              <p className="text-xs text-slate-500">Add one time slot per line in <span className="font-semibold">date, time</span> format.</p>
            </label>

            <button type="submit" disabled={submitting} className="w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? 'Saving...' : 'Add doctor'}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-black text-slate-900">Doctor approval requests</h3>
              <p className="text-sm text-slate-500">{doctorRequests.length} pending</p>
            </div>

            {loading ? (
              <LoadingSpinner label="Loading requests" />
            ) : doctorRequests.length === 0 ? (
              <EmptyState title="No pending doctor requests" description="New doctor account requests will show up here for review." />
            ) : (
              <div className="mt-5 space-y-3">
                {doctorRequests.map((request) => (
                  <div key={request._id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{request.name}</p>
                        <p className="text-sm text-slate-500">{request.specialization}</p>
                        <p className="text-sm text-slate-600">{request.userId?.email}</p>
                        <p className="mt-2 text-sm text-slate-600">Fees: ₹{request.fees}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleReviewDoctorRequest(request._id, 'approved')}
                          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewDoctorRequest(request._id, 'rejected')}
                          className="rounded-full border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-black text-slate-900">Doctors</h3>
              <p className="text-sm text-slate-500">{doctors.length} active records</p>
            </div>

            {loading ? (
              <LoadingSpinner label="Loading doctors" />
            ) : doctors.length === 0 ? (
              <EmptyState title="No doctors yet" description="Add the first doctor using the form on the left." />
            ) : (
              <div className="mt-5 space-y-3">
                {doctors.map((doctor) => (
                  <div key={doctor._id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{doctor.name}</p>
                        <p className="text-sm text-slate-500">{doctor.specialization}</p>
                        <p className="mt-2 text-sm text-slate-600">Fees: ₹{doctor.fees}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge value={doctor.isActive ? 'active' : 'cancelled'} />
                        <button type="button" onClick={() => handleUpdateDoctor(doctor)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDeleteDoctor(doctor._id)} className="rounded-full border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-black text-slate-900">Users</h3>
              <p className="text-sm text-slate-500">{users.length} accounts</p>
            </div>

            {loading ? (
              <LoadingSpinner label="Loading users" />
            ) : users.length === 0 ? (
              <EmptyState title="No users found" description="User management data will appear here once the backend returns accounts." />
            ) : (
              <div className="mt-5 space-y-3">
                {users.map((account) => (
                  <div key={account._id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{account.name}</p>
                        <p className="text-sm text-slate-500">{account.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge value={account.role} />
                        <button type="button" onClick={() => handleUpdateUser(account)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDeleteUser(account._id)} className="rounded-full border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminPanelPage;