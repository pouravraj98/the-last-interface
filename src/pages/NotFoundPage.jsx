import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <h1 className="font-serif text-6xl text-stone-900 mb-4">404</h1>
      <p className="text-stone-500 mb-8">Page not found.</p>
      <Link to="/" className="text-accent-400 text-sm font-semibold hover:text-accent-300 transition-colors">
        Go home &rarr;
      </Link>
    </div>
  )
}
