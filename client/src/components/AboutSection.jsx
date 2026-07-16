import React from 'react';
import { ArrowRight } from 'lucide-react';
import api, { assetUrl } from '../api/axios';
import useFetch from '../hooks/useFetch';
import Skeleton from './Skeleton';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&w=600&q=80'
];

export default function AboutSection() {
  const { data: content, loading } = useFetch(
    () => api.get('/api/content').then((r) => r.data)
  );

  const aboutImages =
    content?.aboutImages && content.aboutImages.length
      ? content.aboutImages.map((img) => assetUrl(img))
      : FALLBACK_IMAGES;

  const scrollTo = (e, id) => {
    e.preventDefault();
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="about" className="bg-card py-24">
      <div className="container-lux grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Left — text */}
        <div className="reveal">
          {loading ? (
            <>
              <Skeleton className="h-6 w-28" />
              <Skeleton className="mt-4 h-12 w-3/4" />
              <Skeleton className="mt-6 h-6 w-full" />
              <Skeleton className="mt-3 h-6 w-5/6" />
              <Skeleton className="mt-3 h-6 w-4/5" />
              <Skeleton className="mt-8 h-14 w-44 rounded-btn" />
            </>
          ) : (
            <>
              <p className="font-body text-sm font-500 tracking-[0.2em] text-secondary uppercase">
                About
              </p>
              <h2 className="mt-4 font-heading text-4xl font-600 text-primary sm:text-5xl">
                {content?.aboutTitle || 'About Roopal'}
              </h2>
              <p className="mt-6 font-body text-lg leading-[1.8] text-secondary">
                {content?.aboutBody ||
                  'Roopal Goel is a professional bridal makeup artist dedicated to creating flawless, long-lasting looks for brides and special occasions.'}
              </p>

              <a
                href="#contact"
                onClick={(e) => scrollTo(e, '#contact')}
                className="btn-primary mt-8"
              >
                Book a Consultation
                <ArrowRight size={18} />
              </a>
            </>
          )}
        </div>

        {/* Right — staggered images */}
        <div className="reveal relative h-[420px] sm:h-[500px]">
          {loading ? (
            <div className="grid h-full grid-cols-2 gap-4">
              <Skeleton className="h-full rounded-card" />
              <div className="flex flex-col gap-4 pt-12">
                <Skeleton className="h-40 rounded-card" />
                <Skeleton className="flex-1 rounded-card" />
              </div>
            </div>
          ) : (
            <div className="grid h-full grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="overflow-hidden rounded-card">
                  <img
                    src={aboutImages[0]}
                    alt="Bridal makeup by Roopal"
                    className="h-[500px] w-full max-w-[260px] object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4 pt-16">
                <div className="overflow-hidden rounded-card">
                  <img
                    src={aboutImages[1]}
                    alt="Engagement makeup by Roopal"
                    className="h-[220px] w-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="overflow-hidden rounded-card">
                  <img
                    src={aboutImages[2]}
                    alt="Party makeup by Roopal"
                    className="h-[240px] w-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
