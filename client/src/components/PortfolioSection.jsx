import React, { useState, useCallback } from 'react';
import { Play, X, ZoomIn } from 'lucide-react';
import api, { assetUrl } from '../api/axios';
import useFetch from '../hooks/useFetch';
import Skeleton from './Skeleton';
import SectionSkeleton from './SectionSkeleton';

const CATEGORIES = ['All', 'Bridal', 'Engagement', 'Mehendi', 'Party'];

const FALLBACK_PORTFOLIO = [
  { type:'photo', category:'bridal',     caption:'Traditional bridal look',   src:'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80' },
  { type:'photo', category:'bridal',     caption:'Reception bridal glow',     src:'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?auto=format&fit=crop&w=800&q=80' },
  { type:'photo', category:'engagement', caption:'Soft glam engagement',      src:'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80' },
  { type:'photo', category:'mehendi',    caption:'Fresh mehendi morning',     src:'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80' },
  { type:'photo', category:'party',      caption:'Bold party glam',           src:'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80' },
  { type:'photo', category:'bridal',     caption:'Royal bridal elegance',     src:'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80' },
  { type:'video', category:'bridal',     caption:'Bridal makeup reel',        src:'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&w=800&q=80', videoUrl:'https://player.vimeo.com/video/76979871' },
  { type:'photo', category:'engagement', caption:'Golden hour engagement',    src:'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80' },
  { type:'photo', category:'party',      caption:'Festive soirée look',       src:'https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=800&q=80' }
];

export default function PortfolioSection() {
  const [activeTab, setActiveTab] = useState('All');
  const [lightbox, setLightbox]   = useState(null); // {type, src}

  const { data: items, loading, error } = useFetch(
    () => api.get('/api/portfolio').then((r) => r.data)
  );

  // Use API data if it has any items with real media; map src/videoUrl through assetUrl
  const allItems = (() => {
    if (!items || !items.length) return FALLBACK_PORTFOLIO;
    const mapped = items
      .map((item) => ({
        ...item,
        src:      item.src      ? assetUrl(item.src)      : '',
        videoUrl: item.videoUrl ? assetUrl(item.videoUrl) : ''
      }))
      // Only keep items that have a displayable image or a video
      .filter((item) => item.src || item.videoUrl);
    return mapped.length ? mapped : FALLBACK_PORTFOLIO;
  })();

  const filtered =
    activeTab === 'All'
      ? allItems
      : allItems.filter(
          (item) => item.category.toLowerCase() === activeTab.toLowerCase()
        );

  const openLightbox = useCallback((item) => {
    setLightbox(item);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
    document.body.style.overflow = '';
  }, []);

  if (error) return null;

  return (
    <section id="portfolio" className="bg-card py-24">
      <div className="container-lux">
        {/* Heading */}
        <div className="reveal mx-auto mb-12 max-w-2xl text-center">
          <p className="font-body text-sm font-500 tracking-[0.2em] text-secondary uppercase">
            Gallery
          </p>
          <h2 className="mt-4 font-heading text-4xl font-600 text-primary sm:text-5xl">
            Portfolio
          </h2>
          <p className="mt-4 font-body text-lg text-secondary">
            A collection of looks created for my beautiful clients.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="reveal mb-10 flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`rounded-full px-6 py-2.5 font-body text-sm font-500 transition-all duration-300 ${
                activeTab === cat
                  ? 'bg-primary text-white'
                  : 'border border-line text-secondary hover:border-primary hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry grid */}
        {loading ? (
          <SectionSkeleton />
        ) : (
          <div className="masonry-grid">
            {filtered.map((item, i) => {
              const isUploadedVideo = item.type === 'video' && item.src && /\.(mp4|webm|mov|avi|mkv)/i.test(item.src);
              return (
              <div
                key={item._id || i}
                className="masonry-item group relative cursor-pointer overflow-hidden rounded-card"
                onClick={() => openLightbox(item)}
              >
                {isUploadedVideo ? (
                  <video
                    src={item.src}
                    alt={item.caption}
                    muted
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={item.src || item.thumbnail}
                    alt={item.caption}
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                {/* Overlay */}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="flex w-full items-center justify-between p-4">
                    <p className="font-body text-sm font-500 text-white">
                      {item.caption}
                    </p>
                    {item.type === 'video' ? (
                      <Play size={22} className="text-white" fill="white" />
                    ) : (
                      <ZoomIn size={20} className="text-white" />
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox modal */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/90 p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute right-6 top-6 text-white"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <X size={32} />
          </button>
          <div
            className="max-h-[85vh] max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.type === 'video' && lightbox.videoUrl
              ? (/\.(mp4|webm|mov|avi|mkv)/i.test(lightbox.videoUrl)
                ? (
                  <video
                    src={lightbox.videoUrl}
                    controls
                    autoPlay
                    className="max-h-[80vh] w-full rounded-card object-contain"
                  />
                ) : (
                  <div className="aspect-video w-full overflow-hidden rounded-card">
                    <iframe
                      src={lightbox.videoUrl}
                      title={lightbox.caption}
                      className="h-full w-full"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                    />
                  </div>
                )
              ) : (
              <img
                src={lightbox.src || lightbox.thumbnail}
                alt={lightbox.caption}
                className="max-h-[85vh] w-auto rounded-card object-contain"
              />
            )}
            {lightbox.caption && (
              <p className="mt-4 text-center font-body text-white/80">
                {lightbox.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
