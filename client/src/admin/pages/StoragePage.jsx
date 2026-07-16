import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  HardDrive,
  ImageIcon,
  Video,
  Trash2,
  Download,
  Loader2,
  RefreshCw,
  Calendar,
  ChevronRight,
  Layers
} from 'lucide-react';
import api from '../../api/axios';
import { PageHeader, AdminCard, AdminButton, IconButton } from '../components/AdminUI';
import { useConfirm } from '../components/ConfirmModal';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function StoragePage() {
  const { confirm } = useConfirm();
  const [usage, setUsage] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [filter, setFilter] = useState('all');     // all | image | video
  const [sortBy, setSortBy] = useState('date');     // date | size
  const [order, setOrder] = useState('desc');       // asc | desc
  const [deleting, setDeleting] = useState(null);

  // ── Fetch usage stats ──
  const fetchUsage = useCallback(async () => {
    try {
      const { data } = await api.get('/api/storage/usage');
      setUsage(data);
    } catch (err) {
      console.error('Usage error:', err);
      toast.error('Failed to load storage stats.');
    }
  }, []);

  // ── Fetch resources ──
  const fetchResources = useCallback(async (cursor = null) => {
    try {
      const params = { type: filter, sort: sortBy, order };
      if (cursor) params.cursor = cursor;

      const { data } = await api.get('/api/storage/resources', { params });

      if (cursor) {
        setResources((prev) => [...prev, ...data.resources]);
      } else {
        setResources(data.resources);
      }
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error('Resources error:', err);
      toast.error('Failed to load resources.');
    }
  }, [filter, sortBy, order]);

  // ── Load both on mount and when filters change ──
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchUsage(), fetchResources()]).finally(() => setLoading(false));
  }, [fetchUsage, fetchResources]);

  // ── Load more ──
  const handleLoadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    await fetchResources(nextCursor);
    setLoadingMore(false);
  };

  // ── Delete a resource ──
  const handleDelete = async (resource) => {
    const ok = await confirm({
      title: 'Delete this file?',
      message: `This will permanently delete "${resource.publicId}" from Cloudinary. This cannot be undone.`,
      confirmText: 'Delete',
      danger: true
    });
    if (!ok) return;

    setDeleting(resource.publicId);
    try {
      const encodedId = encodeURIComponent(resource.publicId);
      await api.delete(`/api/storage/resources/${encodedId}?type=${resource.resourceType}`);
      setResources((prev) => prev.filter((r) => r.publicId !== resource.publicId));
      toast.success('File deleted.');
      fetchUsage(); // Refresh usage stats
    } catch (err) {
      toast.error('Failed to delete file.');
    } finally {
      setDeleting(null);
    }
  };

  // ── Computed values from API (accurate, includes ALL resources) ──
  const usedPercent = usage?.percent || 0;
  const usedGB = usage?.usedGB?.toFixed(3) || '0';
  const planLimit = usage?.planLimitGB || 25;
  const usedHuman = usage?.usedHuman || '0 B';

  // Composition from API
  const imageCount = usage?.images?.count || 0;
  const videoCount = usage?.videos?.count || 0;
  const imageBytes = usage?.images?.bytes || 0;
  const videoBytes = usage?.videos?.bytes || 0;
  const totalBytes = usage?.usedBytes || 0;
  const imageBytesHuman = usage?.images?.bytesHuman || '0 B';
  const videoBytesHuman = usage?.videos?.bytesHuman || '0 B';
  const imagePct = usage?.images?.percent || 0;
  const videoPct = usage?.videos?.percent || 0;
  const totalResources = usage?.totalResources || 0;

  return (
    <div>
      <PageHeader
        title="Storage"
        subtitle="Manage your Cloudinary media storage"
        action={
          <AdminButton variant="secondary" onClick={() => { fetchUsage(); fetchResources(); }}>
            <RefreshCw size={16} strokeWidth={1.5} />
            Refresh
          </AdminButton>
        }
      />

      {/* ── Storage Usage Card ── */}
      <AdminCard className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive size={20} className="text-primary" strokeWidth={1.5} />
            <h3 className="font-heading text-lg font-600 text-primary">Storage Usage</h3>
          </div>
          <span className="font-body text-sm text-secondary">
            Plan: <span className="font-600 text-primary">Free</span> ({planLimit} GB)
          </span>
        </div>

        {/* Big number display */}
        <div className="mb-4 flex items-baseline gap-2">
          <span className="font-heading text-4xl font-700 text-primary">{usedGB}</span>
          <span className="font-body text-lg text-secondary">/ {planLimit} GB</span>
          <span className="ml-auto font-body text-sm text-secondary">{usedPercent}% used</span>
        </div>

        {/* Progress bar */}
        <div className="mb-2 h-4 w-full overflow-hidden rounded-full bg-accent/40">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min(usedPercent, 100)}%` }}
          />
        </div>

        {/* Composition bar (images vs videos) */}
        <div className="mb-1 flex items-center gap-2 text-xs text-secondary">
          <span className="font-500">Composition:</span>
          {totalBytes > 0 ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-accentHover"></span>
                Images {imageBytesHuman} ({imageCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary"></span>
                Videos {videoBytesHuman} ({videoCount})
              </span>
            </div>
          ) : (
            <span>No resources found</span>
          )}
        </div>

        {/* Segmented composition bar */}
        {totalBytes > 0 && (
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-accent/20">
            <div className="bg-accentHover" style={{ width: `${imagePct}%` }} />
            <div className="bg-primary" style={{ width: `${videoPct}%` }} />
          </div>
        )}

        {/* Stats grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-accent/30 p-3 text-center">
            <ImageIcon size={18} className="mx-auto mb-1 text-primary" strokeWidth={1.5} />
            <p className="font-heading text-lg font-600 text-primary">{imageCount}</p>
            <p className="text-xs text-secondary">Images</p>
          </div>
          <div className="rounded-lg bg-accent/30 p-3 text-center">
            <Video size={18} className="mx-auto mb-1 text-primary" strokeWidth={1.5} />
            <p className="font-heading text-lg font-600 text-primary">{videoCount}</p>
            <p className="text-xs text-secondary">Videos</p>
          </div>
          <div className="rounded-lg bg-accent/30 p-3 text-center">
            <HardDrive size={18} className="mx-auto mb-1 text-primary" strokeWidth={1.5} />
            <p className="font-heading text-lg font-600 text-primary">{usedHuman}</p>
            <p className="text-xs text-secondary">Total Size</p>
          </div>
          <div className="rounded-lg bg-accent/30 p-3 text-center">
            <Layers size={18} className="mx-auto mb-1 text-primary" strokeWidth={1.5} />
            <p className="font-heading text-lg font-600 text-primary">{totalResources}</p>
            <p className="text-xs text-secondary">Total Files</p>
          </div>
        </div>
      </AdminCard>

      {/* ── Filters & Sort ── */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Filter */}
        <div className="flex items-center gap-1 rounded-btn border border-line bg-card p-1">
          {['all', 'image', 'video'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 font-body text-sm font-500 capitalize transition-all ${
                filter === f ? 'bg-primary text-white' : 'text-secondary hover:bg-accent'
              }`}
            >
              {f === 'all' ? 'All' : f === 'image' ? 'Photos' : 'Videos'}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 rounded-btn border border-line bg-card p-1">
          {[
            { key: 'date', label: 'Date', icon: Calendar },
            { key: 'size', label: 'Size', icon: HardDrive }
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => {
                if (sortBy === s.key) {
                  setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                } else {
                  setSortBy(s.key);
                  setOrder('desc');
                }
              }}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 font-body text-sm font-500 transition-all ${
                sortBy === s.key ? 'bg-primary text-white' : 'text-secondary hover:bg-accent'
              }`}
            >
              <s.icon size={14} strokeWidth={1.5} />
              {s.label}
              {sortBy === s.key && (
                <span className="text-xs">{order === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Resource Grid ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : resources.length === 0 ? (
        <AdminCard className="text-center py-12">
          <ImageIcon size={40} className="mx-auto mb-3 text-secondary/40" strokeWidth={1} />
          <p className="font-body text-secondary">No media found. Upload some images or videos to see them here.</p>
        </AdminCard>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {resources.map((resource) => (
              <div
                key={resource.publicId}
                className="group relative overflow-hidden rounded-card border border-line bg-card transition-all hover:shadow-card"
              >
                {/* Thumbnail */}
                <div className="relative aspect-square overflow-hidden bg-accent/20">
                  {resource.resourceType === 'video' ? (
                    <>
                      <video
                        src={resource.url}
                        className="h-full w-full object-cover"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                        <Video size={24} className="text-white" fill="white" strokeWidth={1} />
                      </div>
                    </>
                  ) : (
                    <img
                      src={resource.url}
                      alt={resource.publicId}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}

                  {/* Hover overlay with actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-primary/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <a
                      href={resource.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-primary transition-all hover:bg-white"
                      title="Download"
                    >
                      <Download size={16} strokeWidth={1.5} />
                    </a>
                    <button
                      onClick={() => handleDelete(resource)}
                      disabled={deleting === resource.publicId}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/90 text-white transition-all hover:bg-red-500 disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === resource.publicId ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2.5">
                  <p className="truncate font-body text-xs font-500 text-primary">
                    {resource.publicId.split('/').pop()}
                  </p>
                  <div className="mt-0.5 flex items-center justify-between">
                    <span className="text-xs text-secondary">{resource.bytesHuman}</span>
                    <span className="rounded bg-accent/40 px-1.5 py-0.5 text-xs capitalize text-secondary">
                      {resource.resourceType}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {nextCursor && (
            <div className="mt-6 flex justify-center">
              <AdminButton variant="secondary" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More
                    <ChevronRight size={16} strokeWidth={1.5} />
                  </>
                )}
              </AdminButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}
