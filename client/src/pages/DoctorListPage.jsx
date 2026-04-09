import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getDoctors } from '../services/api';

function DoctorListPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('all');

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const response = await getDoctors();
        setDoctors(response.data.data.doctors || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load doctors.');
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const specializations = useMemo(() => {
    const values = doctors.map((doctor) => doctor.specialization).filter(Boolean);
    return ['all', ...new Set(values)];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesSearch =
        !query ||
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialization?.toLowerCase().includes(query);

      const matchesSpecialization = specialization === 'all' || doctor.specialization === specialization;

      return matchesSearch && matchesSpecialization;
    });
  }, [doctors, search, specialization]);

  const handleBook = (doctorId) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (user?.role !== 'patient') {
      navigate('/dashboard');
      return;
    }

    navigate('/book', { state: { doctorId } });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Doctors"
        title="Browse available doctors"
        description="Search by name or specialty and book the doctor that fits your needs."
      />

      {error ? <Alert type="error" title="Unable to load doctors">{error}</Alert> : null}

      <div className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-white/85 p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_240px]">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Search</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search doctors or specialties"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Specialization</span>
          <select
            value={specialization}
            onChange={(event) => setSpecialization(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          >
            {specializations.map((item) => (
              <option key={item} value={item}>
                {item === 'all' ? 'All specializations' : item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading doctors" />
      ) : filteredDoctors.length === 0 ? (
        <EmptyState
          title="No doctors found"
          description="Try a different search term or remove the specialization filter."
          action={
            <Link to="/auth" className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-bold text-white">
              Sign in to continue booking
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <article key={doctor._id} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-slate-950">{doctor.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{doctor.specialization}</p>
                </div>
                <StatusBadge value={doctor.isActive ? 'active' : 'inactive'} />
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-900">Fees:</span> ₹{doctor.fees}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Slots:</span>{' '}
                  {doctor.availableSlots?.length ? doctor.availableSlots.map((slot) => `${slot.date} ${slot.time}`).join(' · ') : 'Flexible scheduling'}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Contact:</span> {doctor.userId?.email || 'Available after booking'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleBook(doctor._id)}
                className="mt-5 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
              >
                Book appointment
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorListPage;