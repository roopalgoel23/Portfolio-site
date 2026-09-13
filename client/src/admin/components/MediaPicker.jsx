import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Search, Loader2, Image as ImageIcon, Film, Check, Filter, ChevronDown } from 'lucide-react';
import api, { assetUrl } from '../../api/axios';

/**
 * MediaPicker — a modal that lets admins browse and pick from
 * images already uploaded to Cloudinary (via /api/storage/resources).
 *
 * Props:
 *   open       — boolean, whether modal is visible
 *   onClose    — callback when modal closes
 *   onSelect   — callback(selectedUrl) when an image is picked
 *   type       — 'image' | 'video' | 'all'  (default: 'image')
 *   title      — modal title (default: 'Choose from Media Library')
 */
export default function MediaPicker({ open, onClose, onSelect, type = 'image', title = 'Choose from Media Library' }) {
  const [resources, setResources]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor]         = useState(null);
  const [hasMore, setHasMore]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState(type);
  const [sortBy, setSortBy]         = useState('date');
  const [sortOrder, setSortOrder]   = useState('desc');
  const scrollRef = useRef(null);

  // ── Fetch resources ──
  const fetchResources = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setResources([]);
      setCursor(null);
      setHasMore(true);
    } else {
      if (!hasMore || loadingMore) return;
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        type: filterType,
        sort: sortBy,
        order: sortOrder,
        pageSize: '30'
      });
      if (!reset && cursor) params.set('cursor', cursor);

      const { data } = await api.get(`/api/storage/resources?${params}`);
      const newItems = data.resources || [];

      // Client-side search filter on publicId / url
      const filtered = search.trim()
        ? newItems.filter((r) =>
            r.publicId?.toLowerCase().includes(search.toLowerCase()) ||
            r.url?.toLowerCase().includes(search.toLowerCase())
          )
        : newItems;

      setResources((prev) => reset ? filtered : [...prev, ...filtered]);
      setCursor(data.nextCursor || null);
      setHasMore(!!data.nextCursor);
    } catch {
      // silently fail — picker is optional
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filterType, sortBy, sortOrder, cursor, hasMore, loadingMore, search]);

  // ── Initial fetch + refetch when filters change ──
  useEffect(() => {
    if (open) fetchResources(true);
  }, [open, filterType, sortBy, sortOrder]);

  // ── Handle scroll for infinite load ──
  const handleScroll = useCallback((e) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 100 && hasMore && !loadingMore) {
      fetchResources(false);
    }
  }, [fetchResources, hasMore, loadingMore]);

  // ── Handle pick ──
  const handlePick = () => {
    if (!selected) return;
    onSelect(selected);
    setSelected(null);
    onClose();
  };

  // ── Close on Escape ──
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-card border border-line bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-line p-5">
          <h3 className="font-heading text-lg font-600 text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-card"
          >
            <X size={18} className="text-secondary" />
          </button>
        </div>

        {/* ── Filters bar ── */}
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name…"
              className="w-full rounded-btn border border-line bg-white py-2 pl-9 pr-3 font-body text-sm text-primary outline-none focus:border-accentHover"
            />
          </div>

          {/* Type filter */}
          {type === 'all' && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="cursor-pointer rounded-btn border border-line bg-white px-3 py-2 font-body text-sm text-primary outline-none focus:border-accentHover"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
          )}

          {/* Sort by */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="cursor-pointer rounded-btn border border-line bg-white px-3 py-2 font-body text-sm text-primary outline-none focus:border-accentHover"
          >
            <option value="date">Sort: Date</option>
            <option value="size">Sort: Size</option>
          </select>

          {/* Sort order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="cursor-pointer rounded-btn border border-line bg-white px-3 py-2 font-body text-sm text-primary outline-none focus:border-accentHover"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* ── Grid ── */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4"
          style={{ minHeight: '300px' }}
        >
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 size={32} className="animate-spin text-secondary" />
            </div>
          ) : resources.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-secondary">
              <ImageIcon size={40} className="opacity-30" />
              <p className="font-body text-sm">No media found. Upload some images first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {resources.map((r, i) => {
                const isSelected = selected === r.url;
                return (
                  <button
                    key={r.publicId + i}
                    onClick={() => setSelected(r.url)}
                    className={`group relative aspect-square overflow-hidden rounded-btn border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-accentHover ring-2 ring-accentHover'
                        : 'border-line hover:border-accentHover'
                    }`}
                  >
                    {/* Thumbnail */}
                    {r.resourceType === 'video' ? (
                      <div className="flex h-full w-full items-center justify-center bg-primary">
                        <Film size={20} className="text-white" />
                      </div>
                    ) : (
                      <img
                        src={r.url}
                        alt={r.publicId}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}

                    {/* Size badge */}
                    <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 font-body text-[10px] text-white">
                      {r.bytesHuman}
                    </span>

                    {/* Selected check */}
                    {isSelected && (
                      <div className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accentHover text-white">
                        <Check size={14} />
                      </div>
                    )}

                    {/* Public ID tooltip */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-black/70 px-1 py-0.5 font-body text-[10px] text-white opacity-0 transition-transform duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                      {r.publicId.split('/').pop()}
                    </div>
                  </button>
                );
              })}

              {/* Loading more indicator */}
              {loadingMore && (
                <div className="col-span-full flex items-center justify-center py-4">
                  <Loader2 size={24} className="animate-spin text-secondary" />
                </div>
              )}

              {!hasMore && resources.length > 0 && (
                <div className="col-span-full py-4 text-center font-body text-xs text-secondary">
                  — End of media —
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-line p-4">
          <p className="font-body text-xs text-secondary">
            {selected ? 'Click "Use Selected" to confirm' : 'Select an image from the library'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-btn border border-line px-5 py-2 font-body text-sm font-500 text-secondary transition-colors hover:bg-card"
            >
              Cancel
            </button>
            <button
              onClick={handlePick}
              disabled={!selected}
              className="inline-flex items-center gap-2 rounded-btn bg-primary px-5 py-2 font-body text-sm font-500 text-white transition-colors hover:bg-accentHover hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={16} />
              Use Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
