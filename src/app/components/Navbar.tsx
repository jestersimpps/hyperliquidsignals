'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full bg-background border-b border-black/[.1] dark:border-white/[.1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-bold text-xl">
                HyperLiquid Analytics
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/'
                    ? 'border-blue-500 text-foreground'
                    : 'border-transparent text-foreground/60 hover:text-foreground'
                }`}
              >
                Volume
              </Link>
              {/* Add more navigation items here */}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
