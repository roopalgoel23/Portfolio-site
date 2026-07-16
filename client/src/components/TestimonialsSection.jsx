import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Star, Quote } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';

import api, { assetUrl } from '../api/axios';
import useFetch from '../hooks/useFetch';
import Skeleton from './Skeleton';
import SectionSkeleton from './SectionSkeleton';

const FALLBACK_TESTIMONIALS = [
  {
    clientName: 'Priya Sharma',
    occasion:   'Wedding',
    rating:     5,
    review:
      'Roopal made me feel like the most beautiful bride. The makeup lasted the entire day and looked amazing in every photo!'
  },
  {
    clientName: 'Anjali Verma',
    occasion:   'Engagement',
    rating:     5,
    review:
      'Absolutely loved my engagement look. She understood exactly what I wanted and delivered beyond expectations.'
  },
  {
    clientName: 'Neha Gupta',
    occasion:   'Reception',
    rating:     5,
    review:
      'Professional, punctual and incredibly talented. Highly recommend for any special occasion!'
  }
];

export default function TestimonialsSection() {
  const { data: testimonials, loading, error } = useFetch(
    () => api.get('/api/testimonials').then((r) => r.data)
  );

  const items = testimonials && testimonials.length ? testimonials : FALLBACK_TESTIMONIALS;

  if (error) return null;

  return (
    <section id="testimonials" className="bg-base py-24">
      <div className="container-lux">
        <div className="reveal mx-auto mb-16 max-w-2xl text-center">
          <p className="font-body text-sm font-500 tracking-[0.2em] text-secondary uppercase">
            Testimonials
          </p>
          <h2 className="mt-4 font-heading text-4xl font-600 text-primary sm:text-5xl">
            Kind Words
          </h2>
          <p className="mt-4 font-body text-lg text-secondary">
            What my wonderful clients have to say about their experience.
          </p>
        </div>

        {loading ? (
          <SectionSkeleton />
        ) : (
          <div className="reveal">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={32}
              slidesPerView={1}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              loop
              pagination={{ clickable: true }}
              breakpoints={{
                768:  { slidesPerView: 2 }
              }}
              className="!pb-14"
            >
              {items.map((t, i) => (
                <SwiperSlide key={t._id || i}>
                  <div className="card flex h-full flex-col">
                    <Quote size={36} className="text-accentHover" />

                    {/* Stars */}
                    <div className="mt-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          size={18}
                          className={
                            s < (t.rating || 5)
                              ? 'fill-accentHover text-accentHover'
                              : 'text-line'
                          }
                        />
                      ))}
                    </div>

                    <p className="mt-4 flex-1 font-body text-lg leading-[1.8] text-secondary">
                      &ldquo;{t.review}&rdquo;
                    </p>

                    <div className="mt-6 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent font-heading text-lg font-600 text-primary">
                        {t.clientName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-heading text-lg font-600 text-primary">
                          {t.clientName}
                        </p>
                        <p className="font-body text-sm text-secondary">
                          {t.occasion}
                        </p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </section>
  );
}
