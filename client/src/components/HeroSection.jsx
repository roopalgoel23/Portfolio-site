import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import api, { assetUrl } from '../api/axios';
import useFetch from '../hooks/useFetch';
import Skeleton from './Skeleton';

export default function HeroSection() {
  const { data: content, loading } = useFetch(
    () => api.get('/api/content').then((r) => r.data)
  );

  const heroImage = content?.heroImage ? assetUrl(content.heroImage) : '';

  const scrollTo = (e, id) => {
    e.preventDefault();
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center pt-24 pb-16"
    >
      <div className="container-lux grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left */}
        <div className="reveal order-2 lg:order-1">
          {loading ? (
            <>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-6 h-16 w-full sm:h-20 sm:w-3/4" />
              <Skeleton className="mt-6 h-6 w-full sm:w-2/3" />
              <Skeleton className="mt-8 h-14 w-48 rounded-btn" />
            </>
          ) : (
            <>
              <p className="font-body text-sm font-500 tracking-[0.2em] text-secondary uppercase">
                {content?.heroKicker || 'Bridal Makeup Artist'}
              </p>
              <h1 className="mt-4 font-heading text-[2.5rem] font-600 leading-[1.1] text-primary sm:text-[3.5rem] lg:text-[4.5rem]">
                {content?.heroTitle || 'Makeup by Roopal Goel'}
              </h1>
              <p className="mt-6 max-w-lg font-body text-lg text-secondary">
                {content?.heroSubtitle ||
                  'Enhancing your natural beauty on your most special day.'}
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#contact"
                  onClick={(e) => scrollTo(e, '#contact')}
                  className="btn-primary"
                >
                  <Calendar size={18} />
                  Book Now
                </a>
                <a
                  href="#portfolio"
                  onClick={(e) => scrollTo(e, '#portfolio')}
                  className="btn-secondary"
                >
                  View Portfolio
                  <ArrowRight size={18} />
                </a>
              </div>
            </>
          )}
        </div>

        {/* Right — image */}
        <div className="reveal order-1 lg:order-2">
          {loading ? (
            <Skeleton className="aspect-[3/4] w-full rounded-card" />
          ) : (
            <div className="overflow-hidden rounded-card">
              <img
                src={heroImage || FALLBACK_HERO}
                alt="Roopal Goel — Bridal Makeup Artist"
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                loading="eager"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?auto=format&fit=crop&w=900&q=80';
