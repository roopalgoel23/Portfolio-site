import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'About',    href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Brides',   href: '#brides' },
  { label: 'Portfolio',href: '#portfolio' },
  { label: 'Reviews',  href: '#testimonials' },
  { label: 'FAQ',      href: '#faq' },
  { label: 'Contact',  href: '#contact' }
];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-base/95 shadow-card backdrop-blur-sm'
            : 'bg-transparent'
        }`}
      >
        <nav className="container-lux flex items-center justify-between py-0 min-h-16 sm:min-h-20">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="flex items-center"
          >
            <img
              src="/Logo.png"
              alt="Makeup by Roopal Goel"
              className="h-[3.6rem] w-auto object-contain sm:h-[4.5rem]"
            />
          </a>

          {/* Desktop links */}
          <ul className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="font-body text-[0.95rem] font-medium text-primary transition-colors duration-300 hover:text-accentHover"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, '#contact')}
            className="btn-primary hidden !px-6 !py-3 text-sm lg:inline-flex"
          >
            Book Now
          </a>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="text-primary lg:hidden"
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-base transition-opacity duration-300 lg:hidden ${
          mobileOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="flex h-full flex-col items-center justify-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="font-heading text-2xl font-600 text-primary"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, '#contact')}
            className="btn-primary mt-4"
          >
            Book Now
          </a>
        </div>
      </div>
    </>
  );
}
