import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  MessageCircle,
  Mail,
  Instagram,
  Send,
  CheckCircle,
  Loader2,
  Calendar,
  Phone,
  User
} from 'lucide-react';
import api from '../api/axios';
import useFetch from '../hooks/useFetch';
import Skeleton from './Skeleton';

export default function ContactSection() {
  const { data: content, loading } = useFetch(
    () => api.get('/api/content').then((r) => r.data)
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  const whatsapp  = content?.whatsapp  || '+91-9876543210';
  const email     = content?.email     || 'Makeupbyroopalgoel@gmail.com';
  const instagram = content?.instagram || 'https://www.instagram.com/makeupbyroopalgoel';

  const cleanPhone = whatsapp.replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${cleanPhone}`;

  const onSubmit = async (formData) => {
    try {
      setStatus('submitting');
      await api.post('/api/contact', {
        name:       formData.name,
        email:      formData.email || `${formData.phone}@placeholder.com`,
        phone:      formData.phone,
        message:    formData.message,
        eventDate:  formData.weddingDate || ''
      });
      setStatus('success');
      reset();
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <section id="contact" className="bg-base py-24">
      <div className="container-lux">
        <div className="reveal mx-auto mb-16 max-w-2xl text-center">
          <p className="font-body text-sm font-500 tracking-[0.2em] text-secondary uppercase">
            Get in Touch
          </p>
          <h2 className="mt-4 font-heading text-4xl font-600 text-primary sm:text-5xl">
            Book Your Date
          </h2>
          <p className="mt-4 font-body text-lg text-secondary">
            Ready to look stunning on your special day? Let&apos;s start a
            conversation.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left — Contact info */}
          <div className="reveal">
            <h3 className="font-heading text-2xl font-600 text-primary">
              Let&apos;s Connect
            </h3>
            <p className="mt-4 font-body text-lg text-secondary">
              Reach out via WhatsApp for the fastest response, or send an email
              with your event details.
            </p>

            <div className="mt-8 flex flex-col gap-5">
              {/* WhatsApp */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="card flex items-center gap-4 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                  <MessageCircle size={24} className="text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-body text-sm font-500 text-secondary">WhatsApp</p>
                  <p className="font-heading text-lg font-600 text-primary">{whatsapp}</p>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${email}`}
                className="card flex items-center gap-4 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                  <Mail size={24} className="text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-body text-sm font-500 text-secondary">Email</p>
                  <p className="font-heading text-lg font-600 text-primary break-all">
                    {email}
                  </p>
                </div>
              </a>

              {/* Instagram */}
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="card flex items-center gap-4 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                  <Instagram size={24} className="text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-body text-sm font-500 text-secondary">Instagram</p>
                  <p className="font-heading text-lg font-600 text-primary">
                    @makeupbyroopalgoel
                  </p>
                </div>
              </a>
            </div>

            {loading && <Skeleton className="mt-6 h-20 w-full" />}
          </div>

          {/* Right — Form */}
          <div className="reveal card">
            {status === 'success' ? (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
                <CheckCircle size={64} className="text-accentHover" strokeWidth={1.5} />
                <h3 className="mt-4 font-heading text-2xl font-600 text-primary">
                  Message Sent!
                </h3>
                <p className="mt-2 font-body text-secondary">
                  Thank you for reaching out. Roopal will get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {/* Name */}
                <div>
                  <label className="mb-2 block font-body text-sm font-600 text-primary">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                    <input
                      type="text"
                      {...register('name', { required: 'Name is required' })}
                      className={`w-full rounded-btn border bg-base py-3.5 pl-12 pr-4 font-body text-primary outline-none transition-colors duration-300 focus:border-primary ${
                        errors.name ? 'border-red-400' : 'border-line'
                      }`}
                      placeholder="Your name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 font-body text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block font-body text-sm font-600 text-primary">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                    <input
                      type="tel"
                      {...register('phone', { required: 'Phone is required' })}
                      className={`w-full rounded-btn border bg-base py-3.5 pl-12 pr-4 font-body text-primary outline-none transition-colors duration-300 focus:border-primary ${
                        errors.phone ? 'border-red-400' : 'border-line'
                      }`}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 font-body text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block font-body text-sm font-600 text-primary">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full rounded-btn border border-line bg-base py-3.5 pl-12 pr-4 font-body text-primary outline-none transition-colors duration-300 focus:border-primary"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Wedding Date */}
                <div>
                  <label className="mb-2 block font-body text-sm font-600 text-primary">
                    Wedding / Event Date
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                    <input
                      type="date"
                      {...register('weddingDate')}
                      className="w-full rounded-btn border border-line bg-base py-3.5 pl-12 pr-4 font-body text-primary outline-none transition-colors duration-300 focus:border-primary"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="mb-2 block font-body text-sm font-600 text-primary">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    {...register('message', { required: 'Please tell us about your event' })}
                    className={`w-full rounded-btn border bg-base px-4 py-3.5 font-body text-primary outline-none transition-colors duration-300 focus:border-primary ${
                      errors.message ? 'border-red-400' : 'border-line'
                    }`}
                    placeholder="Tell us about your event, location, number of people, etc."
                  />
                  {errors.message && (
                    <p className="mt-1 font-body text-sm text-red-500">{errors.message.message}</p>
                  )}
                </div>

                {status === 'error' && (
                  <p className="rounded-btn bg-red-50 px-4 py-3 font-body text-sm text-red-600">
                    Something went wrong. Please try again or reach out via WhatsApp.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Enquiry
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
