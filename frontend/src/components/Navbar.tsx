import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  return (
    <>
      {/* Horizontal structural line behind header */}
      <div className="absolute top-[72px] left-[-100vw] right-[-100vw] h-[1px] bg-gray-200/80 dark:bg-gray-800 z-0 pointer-events-none" />

      {/* Top Header */}
      <header className="h-[72px] flex items-center justify-between px-6 md:px-10 relative z-10 bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 transition-colors">
        <Link href="/" className="flex items-center gap-2">
          {/* Starburst Logo */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black dark:text-white">
            <path d="M12 2v20M17 5l-10 14M22 12H2M19 17L5 7" />
          </svg>
          <span className="font-bold text-lg tracking-tight text-black dark:text-white">TransitOps</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-gray-500 dark:text-gray-400">
          <Link href="/#features" className="hover:text-black dark:hover:text-white transition-colors">Product</Link>
          <Link href="/#roles" className="hover:text-black dark:hover:text-white transition-colors">Company</Link>
          <Link href="/#features" className="hover:text-black dark:hover:text-white transition-colors">Features</Link>
          <Link href="/#roles" className="hover:text-black dark:hover:text-white transition-colors">Solutions</Link>
          <Link href="/#pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="bg-black dark:bg-white text-white dark:text-black text-[13px] font-semibold px-5 py-2.5 flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Contact Sales <ArrowRight size={14} />
          </Link>
        </div>
      </header>
    </>
  );
}
