import React from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  Image as ImageIcon,
  Heart,
  Star,
  HelpCircle,
  LogOut,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { ConfirmProvider } from './components/ConfirmModal';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/admin/content',      label: 'Content',      icon: FileText },
  { to: '/admin/services',     label: 'Services',     icon: Sparkles },
  { to: '/admin/portfolio',    label: 'Portfolio',    icon: ImageIcon },
  { to: '/admin/brides',       label: 'Brides',       icon: Heart },
  { to: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { to: '/admin/faqs',         label: 'FAQs',         icon: HelpCircle }
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <ConfirmProvider>
      <div className="flex min-h-screen bg-base">
        {/* ── Sidebar ──────────────────────────────────── */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-line bg-card transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo area */}
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <div>
              <h1 className="font-heading text-lg font-600 text-primary">
                Roopal Goel
              </h1>
              <p className="text-xs tracking-[0.1em] text-secondary uppercase">
                Admin
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-secondary lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-btn px-4 py-3 font-body text-sm font-500 transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-secondary hover:bg-accent hover:text-primary'
                  }`
                }
              >
                <item.icon size={18} strokeWidth={1.5} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer actions */}
          <div className="space-y-1 border-t border-line px-3 py-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-btn px-4 py-3 font-body text-sm font-500 text-secondary transition-all duration-300 hover:bg-accent hover:text-primary"
            >
              <ExternalLink size={18} strokeWidth={1.5} />
              View Site
            </a>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-btn px-4 py-3 font-body text-sm font-500 text-red-500 transition-all duration-300 hover:bg-red-50"
            >
              <LogOut size={18} strokeWidth={1.5} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-primary/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main content ─────────────────────────────── */}
        <div className="flex min-h-screen flex-1 flex-col lg:pl-60">
          {/* Top bar */}
          <header className="flex items-center justify-between border-b border-line bg-card px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-secondary lg:hidden"
              >
                <Menu size={24} />
              </button>
              <h2 className="font-heading text-lg font-600 text-primary">
                Roopal Goel <span className="text-secondary">·</span>{' '}
                <span className="text-secondary">Admin</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {admin?.email && (
                <span className="font-body text-sm text-secondary">
                  {admin.email}
                </span>
              )}
            </div>
          </header>

          {/* Page outlet */}
          <main className="flex-1 p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ConfirmProvider>
  );
}
