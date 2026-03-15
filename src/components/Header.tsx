'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [{ href: '/repertory', label: 'Repertory' }];

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'nav-blur border-b' : ''
      }`}
      style={{
        backgroundColor: isScrolled
          ? `color-mix(in srgb, var(--bg-primary) 85%, transparent)`
          : 'transparent',
        borderColor: isScrolled ? 'var(--border-subtle)' : 'transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[68px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/repertory" className="flex items-center gap-2.5 group">
          <AppLogo size={32} />
          <span
            className="font-display text-lg font-semibold tracking-tight hidden sm:block"
            style={{ color: 'var(--text-primary)' }}
          >
            RubricRepertory
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-200 relative py-1 ${
                isActive(link.href) ? '' : ''
              }`}
              style={{
                color: isActive(link.href) ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
            >
              {link.label}
              {isActive(link.href) && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-secondary)',
            }}
          >
            {theme === 'light' ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>

          {/* Open Repertory CTA */}
          <Link
            href="/repertory"
            className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
            }}
          >
            Open Repertory
          </Link>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
            style={{ color: 'var(--text-primary)' }}
          >
            <span
              className={`block h-0.5 w-5 rounded-full transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`}
              style={{ backgroundColor: 'var(--text-primary)' }}
            />
            <span
              className={`block h-0.5 w-5 rounded-full transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`}
              style={{ backgroundColor: 'var(--text-primary)' }}
            />
            <span
              className={`block h-0.5 w-5 rounded-full transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`}
              style={{ backgroundColor: 'var(--text-primary)' }}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden nav-blur`}
        style={{
          maxHeight: mobileOpen ? '300px' : '0',
          backgroundColor: `color-mix(in srgb, var(--bg-primary) 95%, transparent)`,
          borderTop: mobileOpen ? `1px solid var(--border-subtle)` : 'none',
        }}
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-base font-medium py-2"
              style={{
                color: isActive(link.href) ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/repertory"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold mt-2"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
            }}
          >
            Open Repertory
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
