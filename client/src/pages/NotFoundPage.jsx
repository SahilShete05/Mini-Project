import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center text-center">
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-teal-700">404</p>
      <h1 className="mt-4 text-4xl font-black text-slate-950 sm:text-5xl">Page not found</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="mt-8 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-700">
        Go home
      </Link>
    </div>
  );
}

export default NotFoundPage;