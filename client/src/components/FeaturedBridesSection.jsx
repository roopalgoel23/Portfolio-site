import React, { useState, useCallback, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';

import api, { assetUrl } from '../api/axios';
import useFetch from '../hooks/useFetch';
import SectionSkeleton from './SectionSkeleton';

const FALLBACK_BRIDES = [
  { name: 'Priya Sharma',  occasion: 'Wedding',    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Anjali Verma',  occasion: 'Engagement', image: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Neha Gupta',    occasion: 'Reception',  image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Riya Malhotra', occasion: 'Mehendi',    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80' }
];

export default function FeaturedBridesSection() {
  const { data: brides, loading, error } = useFetch(
    () => api.get('/api/brides').then((r) => r.data)
  );

  const [galleryBride, setGalleryBride] = useState(null);

  const items = (() => {
    if (!brides || !brides.length) return FALLBACK_BRIDES;
    const mapped = brides
      .map((b) => {
        let thumb = b.image || '';
        if (b.gallery && b.gallery.length > 0) {
          const t = b.thumbnailId
            ? b.gallery.find((g) => g._id === b.thumbnailId)
            : b.gallery[0];
          if (t) thumb = t.src;
        }
        return { ...b, displayImage: thumb ? assetUrl(thumb) : '', gallery: (b.gallery || []).map((g) => ({ ...g, src: assetUrl(g.src), videoUrl: g.videoUrl ? assetUrl(g.videoUrl) : '' })) };
      })
      .filter((b) => b.displayImage);
    return mapped.length ? mapped : FALLBACK_BRIDES;
  })();

  const openGallery = useCallback((bride) => {
    setGalleryBride(bride);
  }, []);

  const closeGallery = useCallback(() => {
    setGalleryBride(null);
  }, []);

  if (error) return null;

  return (
    <section id="brides" className="bg-base py-24">
      <div className="container-lux">
        <div className="reveal mx-auto mb-16 max-w-2xl text-center">
          <p className="font-body text-sm font-500 tracking-[0.2em] text-secondary uppercase">
            Real Brides
          </p>
          <h2 className="mt-4 font-heading text-4xl font-600 text-primary sm:text-5xl">
            Featured Brides
          </h2>
          <p className="mt-4 font-body text-lg text-secondary">
            A glimpse into some of the beautiful looks I&apos;ve had the honour
            to create. Click a bride to view her gallery.
          </p>
        </div>

        {loading ? (
          <SectionSkeleton />
        ) : (
          <div>
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              loop={items.length > 3}
              pagination={{ clickable: true }}
              breakpoints={{
                640:  { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
              }}
              className="!pb-14"
            >
              {items.map((bride, i) => {
                const galleryCount = bride.gallery?.length || 0;
                return (
                  <SwiperSlide key={bride._id || i}>
                    <div
                      className="group relative cursor-pointer overflow-hidden rounded-card"
                      onClick={() => openGallery(bride)}
                    >
                      <div className="aspect-[3/4] w-full">
                        <img
                          src={bride.displayImage}
                          alt={`${bride.name} — ${bride.occasion}`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/0 to-transparent" />
                      {/* Name + occasion */}
                      <div className="absolute bottom-0 left-0 w-full p-6">
                        <h3 className="font-heading text-xl font-600 text-white">
                          {bride.name}
                        </h3>
                        <p className="font-body text-sm text-white/80">
                          {bride.occasion}
                        </p>
                        {galleryCount > 1 && (
                          <p className="mt-1 font-body text-xs text-white/60">
                            {galleryCount} photos — Click to view gallery
                          </p>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        )}
      </div>

      {/* Gallery Lightbox */}
      {galleryBride && (
        <GalleryLightbox bride={galleryBride} onClose={closeGallery} />
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Gallery Lightbox — full-screen gallery viewer
// ─────────────────────────────────────────────────────────────
function GalleryLightbox({ bride, onClose }) {
  const gallery = bride.gallery && bride.gallery.length > 0
    ? bride.gallery
    : [{ type: 'image', src: bride.displayImage }];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(true); // true = grid view, false = single view

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % gallery.length);
  }, [gallery.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + gallery.length) % gallery.length);
  }, [gallery.length]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') { if (!showGrid) setShowGrid(true); else onClose(); }
      if (e.key === 'ArrowRight' && !showGrid) next();
      if (e.key === 'ArrowLeft' && !showGrid) prev();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, next, prev, showGrid]);

  const currentItem = gallery[currentIndex];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-primary/95"
      onClick={onClose}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <div>
          <h3 className="font-heading text-xl font-600 text-white">{bride.name}</h3>
          <p className="font-body text-sm text-white/60">{bride.occasion}</p>
        </div>
        <div className="flex items-center gap-3">
          {gallery.length > 1 && (
            <button
              onClick={() => setShowGrid(!showGrid)}
              className="font-body text-sm text-white/70 hover:text-white"
            >
              {showGrid ? 'Slideshow' : 'Grid'}
            </button>
          )}
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X size={28} />
          </button>
        </div>
      </div>

      {showGrid && gallery.length > 1 ? (
        /* ── Grid View ── */
        <div
          className="flex-1 overflow-y-auto px-6 pb-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 py-4 sm:grid-cols-3">
            {gallery.map((item, i) => (
              <div
                key={i}
                className="group relative cursor-pointer overflow-hidden rounded-card"
                onClick={() => { setCurrentIndex(i); setShowGrid(false); }}
              >
                {item.type === 'video' ? (
                  <div className="flex aspect-square items-center justify-center bg-black/40">
                    <Play size={32} className="text-white" fill="white" />
                  </div>
                ) : (
                  <img
                    src={item.src}
                    alt={`${bride.name} ${i + 1}`}
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Single Item View ── */
        <div
          className="flex flex-1 items-center justify-center px-4 pb-8"
          onClick={onClose}
        >
          {gallery.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            >
              <ChevronLeft size={40} />
            </button>
          )}

          <div className="max-h-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {currentItem.type === 'video' ? (
              <div className="aspect-video w-full overflow-hidden rounded-card">
                <video
                  src={currentItem.videoUrl || currentItem.src}
                  controls
                  autoPlay
                  className="h-full w-full"
                />
              </div>
            ) : (
              <img
                src={currentItem.src}
                alt={`${bride.name} ${currentIndex + 1}`}
                className="max-h-[80vh] w-auto rounded-card object-contain"
              />
            )}
            {gallery.length > 1 && (
              <p className="mt-3 text-center font-body text-sm text-white/60">
                {currentIndex + 1} / {gallery.length}
              </p>
            )}
          </div>

          {gallery.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            >
              <ChevronRight size={40} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
