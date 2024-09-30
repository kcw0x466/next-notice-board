import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-300 border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <Link href="/" className="text-gray-800 text-2xl font-bold">
          IPLAB
        </Link>
      </div>
    </nav>
  );
}