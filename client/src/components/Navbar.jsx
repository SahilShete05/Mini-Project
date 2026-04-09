import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardRoute =
    user?.role === 'doctor'
      ? '/doctor/dashboard'
      : user?.role === 'admin'
        ? '/admin'
        : '/patient/dashboard';

  const dashboardLabel =
    user?.role === 'doctor'
      ? 'Doctor Dashboard'
      : user?.role === 'admin'
        ? 'Admin Panel'
        : 'My Appointments';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-500 text-lg font-black text-white shadow-lg shadow-teal-600/20">
            D+
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">
              Appointment Hub
            </p>
            <p className="text-sm text-slate-500">Smart care appointments</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:absolute md:left-1/2 md:flex md:-translate-x-1/2">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/doctors" className={navLinkClass}>
            Doctors
          </NavLink>
          {isAuthenticated ? (
            <NavLink to={dashboardRoute} className={navLinkClass}>
              {dashboardLabel}
            </NavLink>
          ) : (
            <NavLink to="/auth" className={navLinkClass}>
              My Account
            </NavLink>
          )}
        </nav>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default Navbar;