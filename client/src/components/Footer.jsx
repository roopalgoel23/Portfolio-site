import React from 'react';
import { Instagram, Mail, MessageCircle } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import api from '../api/axios';

const NAV = [
  { label: 'About',    href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Portfolio',href: '#portfolio' },
  { label: 'Reviews',  href: '#testimonials' },
  { label: 'FAQ',      href: '#faq' },
  { label: 'Contact',  href: '#contact' }
];

export default function Footer() {
  const { data: content } = useFetch(
    () => api.get('/api/content').then((r) => r.data)
  );

  const whatsapp  = content?.whatsapp  || '+91-9876543210';
  const email     = content?.email     || 'Makeupbyroopalgoel@gmail.com';
  const instagram = content?.instagram || 'https://www.instagram.com/makeupbyroopalgoel';

  const cleanPhone = whatsapp.replace(/[^0-9]/g, '');

  const handleClick = (e, href) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-line bg-base py-16">
      <div className="container-lux">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Logo & tagline */}
          <div>
            <h3 className="font-heading text-2xl font-600 text-primary">
              Roopal Goel
            </h3>
            <p className="mt-1 font-body text-sm tracking-[0.15em] text-secondary uppercase">
              Bridal Makeup Artist
            </p>
            <p className="mt-4 max-w-xs font-body text-base text-secondary">
              Enhancing your natural beauty on your most special day.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading text-lg font-600 text-primary">
              Quick Links
            </h4>
            <ul className="mt-4 flex flex-col gap-2">
              {NAV.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleClick(e, link.href)}
                    className="font-body text-base text-secondary transition-colors duration-300 hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Social */}
          <div>
            <h4 className="font-heading text-lg font-600 text-primary">
              Connect
            </h4>
            <div className="mt-4 flex flex-col gap-2">
              <p className="font-body text-base text-secondary">{whatsapp}</p>
              <p className="break-all font-body text-base text-secondary">{email}</p>
            </div>
            <div className="mt-6 flex gap-4">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-primary transition-all duration-300 hover:bg-primary hover:text-white"
              >
                <MessageCircle size={20} />
              </a>
              <a
                href={`mailto:${email}`}
                aria-label="Email"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-primary transition-all duration-300 hover:bg-primary hover:text-white"
              >
                <Mail size={20} />
              </a>
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-primary transition-all duration-300 hover:bg-primary hover:text-white"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-8 text-center">
          <p className="font-body text-sm text-secondary">
            &copy; {new Date().getFullYear()} Makeup by Roopal Goel. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
