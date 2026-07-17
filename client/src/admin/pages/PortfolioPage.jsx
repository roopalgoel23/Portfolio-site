import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Upload, Trash2, Play, ImageIcon, Video, X, Loader2, Link2 } from 'lucide-react';
import api, { assetUrl } from '../../api/axios';
import {
  FieldLabel,
  AdminInput,
  AdminSelect,
  AdminCard,
  PageHeader,
  AdminButton,
  IconButton
} from '../components/AdminUI';
import { useConfirm } from '../components/ConfirmModal';

const CATEGORIES = ['bridal', 'engagement', 'mehendi', 'party', 'editorial', 'pre-wedding'];

const TABS = [
  { key: 'photo', label: 'Photo', icon: ImageIcon },
  { key: 'video', label: 'Video', icon: Video }
];

export default function PortfolioPage() {
  const { confirm } = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('photo');

  // Photo form
  const [photoForm, setPhotoForm] = useState({
    file: null,
    preview: '',
    category: 'bridal',
    caption: ''
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Video form
  const [videoForm, setVideoForm] = useState({
    file: null,
    preview: '',
    videoUrl: '',
    category: 'bridal',
    caption: ''
  });
  const [addingVideo, setAddingVideo] = useState(false);
  const [videoMode, setVideoMode] = useState('upload'); // 'upload' or 'url'

  // ── Fetch ──
  const fetchItems = useCallback(async () => {
    try {
      const { data } = await api.get('/api/portfolio');
      setItems(data);
    } catch {
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Photo: file select + preview ──
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoForm((prev) => ({
      ...prev,
      file,
      preview: URL.createObjectURL(file)
    }));
  };

  // ── Photo: upload ──
  const handlePhotoUpload = async () => {
    if (!photoForm.file) {
      toast.error('Please select an image');
      return;
    }
    setUploadingPhoto(true);
    try {
      // Upload file to get server-side path
      const formData = new FormData();
      formData.append('file', photoForm.file);

      const { data: uploadData } = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const src = uploadData.path;

      const { data } = await api.post('/api/portfolio', {
        type: 'photo',
        category: photoForm.category,
        src,
        caption: photoForm.caption,
        order: items.length
      });

      setItems([...items, data]);
      setPhotoForm({ file: null, preview: '', category: 'bridal', caption: '' });
      toast.success('Photo added to portfolio!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── Video: file select ──
  const handleVideoFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoForm((prev) => ({
      ...prev,
      file,
      preview: URL.createObjectURL(file)
    }));
  };

  // ── Video: add (upload or URL) ──
  const handleVideoAdd = async () => {
    if (videoMode === 'upload') {
      if (!videoForm.file) {
        toast.error('Please select a video file');
        return;
      }
      setAddingVideo(true);
      try {
        const formData = new FormData();
        formData.append('file', videoForm.file);
        const { data: uploadData } = await api.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const { data } = await api.post('/api/portfolio', {
          type: 'video',
          category: videoForm.category,
          src: uploadData.path,
          videoUrl: uploadData.path,
          caption: videoForm.caption,
          order: items.length
        });
        setItems([...items, data]);
        setVideoForm({ file: null, preview: '', videoUrl: '', category: 'bridal', caption: '' });
        toast.success('Video added to portfolio!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to upload video');
      } finally {
        setAddingVideo(false);
      }
    } else {
      if (!videoForm.videoUrl.trim()) {
        toast.error('Video URL is required');
        return;
      }
      setAddingVideo(true);
      try {
        const { data } = await api.post('/api/portfolio', {
          type: 'video',
          category: videoForm.category,
          videoUrl: videoForm.videoUrl,
          caption: videoForm.caption,
          order: items.length
        });
        setItems([...items, data]);
        setVideoForm({ file: null, preview: '', videoUrl: '', category: 'bridal', caption: '' });
        toast.success('Video added to portfolio!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to add video');
      } finally {
        setAddingVideo(false);
      }
    }
  };

  // ── Delete ──
  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Delete Item?',
      message: 'This will permanently remove the item from your portfolio.'
    });
    if (!ok) return;
    try {
      await api.delete(`/api/portfolio/${id}`);
      setItems(items.filter((i) => i._id !== id));
      toast.success('Item deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Portfolio"
        subtitle="Manage photos and videos in your gallery"
      />

      {/* ── Tabs ── */}
      <div className="mb-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-btn px-5 py-2.5 font-body text-sm font-500 transition-all duration-300 ${
              tab === t.key
                ? 'bg-primary text-white'
                : 'border border-line text-secondary hover:bg-card'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Photo upload tab ── */}
      {tab === 'photo' && (
        <AdminCard className="mb-6">
          <h3 className="mb-4 font-heading text-lg font-600 text-primary">
            Upload Photo
          </h3>

          {/* Drop zone */}
          <div className="mb-5">
            {!photoForm.preview ? (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-btn border-2 border-dashed border-line py-12 transition-colors duration-300 hover:border-accentHover">
                <Upload size={32} className="text-secondary" />
                <div className="text-center">
                  <p className="font-body text-sm font-600 text-primary">
                    Click to upload or drag &amp; drop
                  </p>
                  <p className="font-body text-xs text-secondary">
                    JPEG, PNG, WEBP up to 100MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative inline-block">
                <img
                  src={photoForm.preview}
                  alt="Preview"
                  className="max-h-64 rounded-btn border border-line object-cover"
                />
                <button
                  onClick={() => setPhotoForm({ ...photoForm, file: null, preview: '' })}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel>Category</FieldLabel>
              <AdminSelect
                value={photoForm.category}
                onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </AdminSelect>
            </div>
            <div>
              <FieldLabel>Caption</FieldLabel>
              <AdminInput
                value={photoForm.caption}
                onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })}
                placeholder="Traditional bridal look"
              />
            </div>
          </div>

          <div className="mt-6">
            <AdminButton onClick={handlePhotoUpload} disabled={uploadingPhoto || !photoForm.file}>
              {uploadingPhoto ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Add to Portfolio
                </>
              )}
            </AdminButton>
          </div>
        </AdminCard>
      )}

      {/* ── Video add tab ── */}
      {tab === 'video' && (
        <AdminCard className="mb-6">
          <h3 className="mb-4 font-heading text-lg font-600 text-primary">
            Add Video
          </h3>

          {/* Mode toggle: Upload vs URL */}
          <div className="mb-5 flex gap-2">
            <button
              onClick={() => setVideoMode('upload')}
              className={`flex items-center gap-2 rounded-btn px-4 py-2 font-body text-sm font-500 transition-all duration-300 ${
                videoMode === 'upload'
                  ? 'bg-primary text-white'
                  : 'border border-line text-secondary hover:bg-card'
              }`}
            >
              <Upload size={16} />
              Upload File
            </button>
            <button
              onClick={() => setVideoMode('url')}
              className={`flex items-center gap-2 rounded-btn px-4 py-2 font-body text-sm font-500 transition-all duration-300 ${
                videoMode === 'url'
                  ? 'bg-primary text-white'
                  : 'border border-line text-secondary hover:bg-card'
              }`}
            >
              <Link2 size={16} />
              Paste URL
            </button>
          </div>

          {videoMode === 'upload' ? (
            /* ── Upload zone ── */
            <div className="mb-5">
              {!videoForm.preview ? (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-btn border-2 border-dashed border-line py-12 transition-colors duration-300 hover:border-accentHover">
                  <Upload size={32} className="text-secondary" />
                  <div className="text-center">
                    <p className="font-body text-sm font-600 text-primary">
                      Click to upload a video
                    </p>
                    <p className="font-body text-xs text-secondary">
                      MP4, WEBM, MOV up to 100MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileSelect}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative inline-block w-full">
                  <video
                    src={videoForm.preview}
                    controls
                    className="max-h-64 w-full rounded-btn border border-line object-contain"
                  />
                  <button
                    onClick={() => setVideoForm({ ...videoForm, file: null, preview: '' })}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── URL input ── */
            <div className="mb-5">
              <FieldLabel>Video URL (YouTube, Vimeo, etc.)</FieldLabel>
              <div className="relative">
                <Link2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                <AdminInput
                  value={videoForm.videoUrl}
                  onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                  placeholder="https://player.vimeo.com/video/76979871"
                  className="pl-12"
                />
              </div>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel>Category</FieldLabel>
              <AdminSelect
                value={videoForm.category}
                onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </AdminSelect>
            </div>
            <div>
              <FieldLabel>Caption</FieldLabel>
              <AdminInput
                value={videoForm.caption}
                onChange={(e) => setVideoForm({ ...videoForm, caption: e.target.value })}
                placeholder="Bridal makeup reel"
              />
            </div>
          </div>
          <div className="mt-6">
            <AdminButton onClick={handleVideoAdd} disabled={addingVideo || (videoMode === 'upload' ? !videoForm.file : !videoForm.videoUrl.trim())}>
              {addingVideo ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {videoMode === 'upload' ? 'Uploading...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Play size={18} />
                  Add Video
                </>
              )}
            </AdminButton>
          </div>
        </AdminCard>
      )}

      {/* ── Existing items grid ── */}
      <div>
        <h3 className="mb-4 font-heading text-lg font-600 text-primary">
          Gallery Items ({items.length})
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="group relative overflow-hidden rounded-card border border-line bg-card"
            >
              {/* Image / Video thumbnail */}
              <div className="relative aspect-square">
                {item.type === 'video' ? (
                  <div className="flex h-full w-full items-center justify-center bg-primary">
                    <Play size={32} className="text-white" fill="white" />
                  </div>
                ) : item.src ? (
                  <img
                    src={assetUrl(item.src)}
                    alt={item.caption}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-accent">
                    <ImageIcon size={24} className="text-secondary" />
                  </div>
                )}

                {/* Type badge */}
                <span
                  className="absolute left-2 top-2 rounded-full px-2.5 py-1 font-body text-xs font-500 capitalize text-white"
                  style={{ background: 'rgba(44, 42, 42, 0.75)' }}
                >
                  {item.category}
                </span>
              </div>

              {/* Caption */}
              {item.caption && (
                <div className="p-3">
                  <p className="truncate font-body text-xs text-secondary">
                    {item.caption}
                  </p>
                </div>
              )}

              {/* Delete on hover */}
              <button
                onClick={() => handleDelete(item._id)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <AdminCard className="text-center">
            <p className="font-body text-secondary">
              No portfolio items yet.
            </p>
          </AdminCard>
        )}
      </div>
    </div>
  );
}
