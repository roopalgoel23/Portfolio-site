import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FieldLabel, AdminInput, AdminButton } from '../components/AdminUI';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const from = location.state?.from?.pathname || '/admin/content';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Login failed. Check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-600 text-primary">
            Roopal Goel
          </h1>
          <p className="mt-1 font-body text-xs tracking-[0.15em] text-secondary uppercase">
            Admin Panel
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-card border border-line bg-card p-8 shadow-card"
        >
          <h2 className="mb-6 font-heading text-xl font-600 text-primary">
            Sign In
          </h2>

          <div className="mb-5">
            <FieldLabel>Email</FieldLabel>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary"
              />
              <AdminInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="pl-12"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="mb-6">
            <FieldLabel>Password</FieldLabel>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary"
              />
              <AdminInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-12"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <AdminButton
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </AdminButton>
        </form>

        <p className="mt-6 text-center">
          <a
            href="/"
            className="font-body text-sm text-secondary transition-colors hover:text-primary"
          >
            ← Back to website
          </a>
        </p>
      </div>
    </div>
  );
}
