import React, { useState, useCallback } from 'react';
import { Play, X, ZoomIn } from 'lucide-react';
import api, { assetUrl } from '../api/axios';
import useFetch from '../hooks/useFetch';
import Skeleton from './Skeleton';
import SectionSkeleton from './SectionSkeleton';

const CATEGORIES = ['All', 'Bridal', 'Engagement', 'Mehendi', 'Party', 'Editorial', 'Pre-Wedding'];

// Build dynamic tab list: 'All' + preset categories (that exist in data) + any custom categories
function buildCategoryTabs(allItems) {
  const presetSet = new Set(CATEGORIES.slice(1).map((c) => c.toLowerCase()));
  const dataCats = new Set(allItems.map((i) => (i.category || '').toLowerCase()).filter(Boolean));
  const tabs = ['All'];
  // Preset tabs
  CATEGORIES.slice(1).forEach((c) => { if (dataCats.has(c.toLowerCase())) tabs.push(c); });
  // Custom tabs from data not covered by presets
  dataCats.forEach((cat) => {
    if (!presetSet.has(cat)) {
      tabs.push(cat.charAt(0).toUpperCase() + cat.slice(1));
    }
  });
  return tabs;
}

export default function PortfolioSection() {
  const [activeTab, setActiveTab] = useState('All');
  const [lightbox, setLightbox]   = useState(null); // {type, src}

  const { data: items, loading, error } = useFetch(
    () => api.get('/api/portfolio').then((r) => r.data)
  );

  // Use API data; map src/videoUrl through assetUrl
  const allItems = (() => {
    if (!items || !items.length) return [];
    return items
      .map((item) => ({
        ...item,
        src:      item.src      ? assetUrl(item.src)      : '',
        videoUrl: item.videoUrl ? assetUrl(item.videoUrl) : ''
      }))
      .filter((item) => item.src || item.videoUrl);
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
  if (!loading && allItems.length === 0) return null;

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
          {buildCategoryTabs(allItems).map((cat) => (
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
