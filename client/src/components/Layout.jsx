import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function Layout() {
  return (
    <div className="min-h-screen text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;