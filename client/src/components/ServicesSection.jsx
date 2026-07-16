import React from 'react';
import { Sparkles, Crown, Flower2, PartyPopper, Camera, Wand2, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import useFetch from '../hooks/useFetch';
import Skeleton from './Skeleton';
import SectionSkeleton from './SectionSkeleton';

// Map common emoji/keyword icons to Lucide components
const ICON_MAP = {
  '👰': Crown,
  '💍': Sparkles,
  '🌿': Flower2,
  '🎉': PartyPopper,
  '📷': Camera,
  '✨': Wand2,
  bridal:       Crown,
  engagement:   Sparkles,
  mehendi:      Flower2,
  party:        PartyPopper,
  'pre-wedding':Camera,
  trial:        Wand2
};

function getServiceIcon(iconStr, title) {
  if (iconStr && ICON_MAP[iconStr]) return ICON_MAP[iconStr];
  const lower = (title || '').toLowerCase();
  const key = Object.keys(ICON_MAP).find((k) => lower.includes(k));
  return key ? ICON_MAP[key] : Sparkles;
}

export default function ServicesSection() {
  const { data: services, loading, error } = useFetch(
    () => api.get('/api/services').then((r) => r.data)
  );

  const scrollTo = (e, id) => {
    e.preventDefault();
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (error) return null;

  return (
    <section id="services" className="bg-base py-24">
      <div className="container-lux">
        {/* Heading */}
        <div className="reveal mx-auto mb-16 max-w-2xl text-center">
          <p className="font-body text-sm font-500 tracking-[0.2em] text-secondary uppercase">
            What I Offer
          </p>
          <h2 className="mt-4 font-heading text-4xl font-600 text-primary sm:text-5xl">
            Services &amp; Pricing
          </h2>
          <p className="mt-4 font-body text-lg text-secondary">
            Tailored makeup services to make you look and feel your absolute best.
          </p>
        </div>

        {/* Cards */}
        {loading ? (
          <SectionSkeleton />
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services?.map((svc, i) => {
              const Icon = getServiceIcon(svc.icon, svc.title);
              return (
                <div
                  key={svc._id}
                  className="reveal card flex flex-col"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                    <Icon size={26} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-heading text-2xl font-600 text-primary">
                    {svc.title}
                  </h3>
                  <p className="mt-3 flex-1 font-body text-base text-secondary">
                    {svc.description}
                  </p>
                  {svc.priceRange && (
                    <p className="mt-5 font-heading text-lg font-500 text-primary">
                      {svc.priceRange}
                    </p>
                  )}
                  <a
                    href="#contact"
                    onClick={(e) => scrollTo(e, '#contact')}
                    className="mt-6 inline-flex items-center gap-2 font-body text-sm font-600 text-primary transition-colors duration-300 hover:text-accentHover"
                  >
                    Enquire Now
                    <ArrowRight size={16} />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
