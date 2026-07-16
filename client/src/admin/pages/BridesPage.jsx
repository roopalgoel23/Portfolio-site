import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Upload, Trash2, ChevronUp, ChevronDown, X, Loader2, Star, Images, Video, Plus } from 'lucide-react';
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

const OCCASIONS = ['Wedding', 'Engagement', 'Reception', 'Mehendi', 'Party', 'Other'];

export default function BridesPage() {
  const { confirm } = useConfirm();
  const [brides, setBrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBride, setEditingBride] = useState(null);

  const [form, setForm] = useState({ file: null, preview: '', name: '', occasion: 'Wedding' });
  const [adding, setAdding] = useState(false);

  const fetchBrides = useCallback(async () => {
    try {
      const { data } = await api.get('/api/brides');
      setBrides(data);
    } catch {
      toast.error('Failed to load featured brides');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBrides(); }, [fetchBrides]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, file, preview: URL.createObjectURL(file) }));
  };

  const handleAdd = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.file) { toast.error('Please upload a photo'); return; }
    setAdding(true);
    try {
      const formData = new FormData();
      formData.append('file', form.file);
      const { data: uploadData } = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imagePath = uploadData.path;

      const { data } = await api.post('/api/brides', {
        name: form.name,
        occasion: form.occasion,
        image: imagePath,
        gallery: [{ type: 'image', src: imagePath }],
        order: brides.length
      });

      if (data.gallery && data.gallery.length > 0) {
        await api.patch(`/api/brides/${data._id}/gallery`, {
          action: 'setThumbnail',
          itemId: data.gallery[0]._id
        });
      }

      fetchBrides();
      setForm({ file: null, preview: '', name: '', occasion: 'Wedding' });
      toast.success('Bride added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add bride');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Delete Bride?',
      message: 'This will permanently remove the bride and all gallery images.'
    });
    if (!ok) return;
    try {
      await api.delete(`/api/brides/${id}`);
      setBrides(brides.filter((b) => b._id !== id));
      toast.success('Bride removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleReorder = async (index, dir) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= brides.length) return;
    const reordered = [...brides];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    const updated = reordered.map((b, i) => ({ ...b, order: i }));
    setBrides(updated);
    try {
      await api.post('/api/brides/reorder', {
        order: updated.map((b) => ({ id: b._id, order: b.order }))
      });
    } catch {
      toast.error('Failed to update order');
      fetchBrides();
    }
  };

  const getThumb = (bride) => {
    if (!bride.gallery || bride.gallery.length === 0) return bride.image || '';
    const thumb = bride.thumbnailId
      ? bride.gallery.find((g) => g._id === bride.thumbnailId)
      : bride.gallery[0];
    return thumb ? thumb.src : bride.image || '';
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
        title="Featured Brides"
        subtitle="Manage brides and their photo/video galleries"
      />

      {/* Add form */}
      <AdminCard className="mb-6 border-2 border-accent">
        <h3 className="mb-4 font-heading text-lg font-600 text-primary">Add New Bride</h3>
        <div className="grid gap-5 sm:grid-cols-[auto_1fr_1fr]">
          <div>
            <FieldLabel>Photo</FieldLabel>
            {!form.preview ? (
              <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-btn border-2 border-dashed border-line transition-colors duration-300 hover:border-accentHover">
                <Upload size={20} className="text-secondary" />
                <span className="font-body text-xs text-secondary">Upload</span>
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>
            ) : (
              <div className="relative">
                <img src={form.preview} alt="Preview" className="h-32 w-32 rounded-btn border border-line object-cover" />
                <button
                  onClick={() => setForm({ ...form, file: null, preview: '' })}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
          <div>
            <FieldLabel>Bride Name</FieldLabel>
            <AdminInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Priya Sharma" />
          </div>
          <div>
            <FieldLabel>Occasion</FieldLabel>
            <AdminSelect value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })}>
              {OCCASIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
            </AdminSelect>
          </div>
        </div>
        <div className="mt-6">
          <AdminButton onClick={handleAdd} disabled={adding}>
            {adding ? (<><Loader2 size={18} className="animate-spin" />Adding...</>) : (<><Upload size={18} />Add Bride</>)}
          </AdminButton>
        </div>
      </AdminCard>

      {/* Brides grid */}
      <div>
        <h3 className="mb-4 font-heading text-lg font-600 text-primary">
          Current Brides ({brides.length})
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {brides.map((bride, index) => {
            const thumb = getThumb(bride);
            const galleryCount = bride.gallery?.length || 0;
            return (
              <AdminCard key={bride._id} className="group p-4">
                <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-btn">
                  {thumb ? (
                    <img src={assetUrl(thumb)} alt={bride.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-accent">
                      <span className="font-heading text-3xl text-secondary">{bride.name?.charAt(0)}</span>
                    </div>
                  )}
                  {galleryCount > 1 && (
                    <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-primary/80 px-2 py-1 font-body text-xs text-white">
                      <Images size={12} /> {galleryCount}
                    </span>
                  )}
                </div>
                <h4 className="font-heading text-base font-600 text-primary">{bride.name}</h4>
                <p className="font-body text-xs text-secondary">{bride.occasion}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-1">
                    <IconButton onClick={() => setEditingBride(bride)} title="Manage gallery">
                      <Images size={16} />
                    </IconButton>
                    <IconButton onClick={() => handleReorder(index, -1)} disabled={index === 0} title="Move up">
                      <ChevronUp size={16} />
                    </IconButton>
                    <IconButton onClick={() => handleReorder(index, 1)} disabled={index === brides.length - 1} title="Move down">
                      <ChevronDown size={16} />
                    </IconButton>
                  </div>
                  <IconButton variant="danger" onClick={() => handleDelete(bride._id)} title="Delete">
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              </AdminCard>
            );
          })}
        </div>
        {brides.length === 0 && (
          <AdminCard className="text-center">
            <p className="font-body text-secondary">No featured brides yet. Add one above.</p>
          </AdminCard>
        )}
      </div>

      {/* Gallery Manager Modal */}
      {editingBride && (
        <GalleryManager bride={editingBride} onClose={() => { setEditingBride(null); fetchBrides(); }} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Gallery Manager Modal
// ─────────────────────────────────────────────────────────────
function GalleryManager({ bride, onClose }) {
  const [uploading, setUploading] = useState(false);
  const [gallery, setGallery] = useState(bride.gallery || []);
  const [thumbnailId, setThumbnailId] = useState(bride.thumbnailId);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const items = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const { data: uploadData } = await api.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const isVideo = file.type.startsWith('video/');
        items.push({
          type: isVideo ? 'video' : 'image',
          src: uploadData.path,
          videoUrl: isVideo ? uploadData.path : ''
        });
      }

      const { data: updated } = await api.patch(`/api/brides/${bride._id}/gallery`, {
        action: 'add',
        items
      });
      setGallery(updated.gallery);
      setThumbnailId(updated.thumbnailId);
      toast.success(`Added ${items.length} item(s)`);
    } catch {
      toast.error('Failed to upload');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = async (itemId) => {
    try {
      const { data: updated } = await api.patch(`/api/brides/${bride._id}/gallery`, {
        action: 'remove',
        itemId
      });
      setGallery(updated.gallery);
      setThumbnailId(updated.thumbnailId);
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleSetThumbnail = async (itemId) => {
    try {
      const { data: updated } = await api.patch(`/api/brides/${bride._id}/gallery`, {
        action: 'setThumbnail',
        itemId
      });
      setThumbnailId(updated.thumbnailId);
      toast.success('Thumbnail updated');
    } catch {
      toast.error('Failed to set thumbnail');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-primary/80 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-card bg-base p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-xl font-600 text-primary">{bride.name} — Gallery</h3>
          <button onClick={onClose} className="text-secondary hover:text-primary">
            <X size={24} />
          </button>
        </div>

        <label className="mb-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-btn border-2 border-dashed border-line py-8 transition-colors duration-300 hover:border-accentHover">
          {uploading ? (
            <><Loader2 size={24} className="animate-spin text-secondary" />
            <span className="font-body text-sm text-secondary">Uploading...</span></>
          ) : (
            <><Plus size={24} className="text-secondary" />
            <span className="font-body text-sm text-secondary">Add photos or videos</span></>
          )}
          <input type="file" accept="image/*,video/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>

        {gallery.length === 0 ? (
          <p className="py-8 text-center font-body text-secondary">No items in gallery yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {gallery.map((item) => (
              <div
                key={item._id}
                className={`group relative overflow-hidden rounded-btn border-2 ${thumbnailId === item._id ? 'border-accentHover' : 'border-transparent'}`}
              >
                {item.type === 'video' ? (
                  <div className="flex aspect-square items-center justify-center bg-primary">
                    <Video size={32} className="text-white" />
                  </div>
                ) : (
                  <img src={assetUrl(item.src)} alt="" className="aspect-square w-full object-cover" />
                )}
                {thumbnailId === item._id && (
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-accentHover px-2 py-1 font-body text-xs text-white">
                    <Star size={10} fill="white" /> Thumbnail
                  </span>
                )}
                <div className="absolute inset-0 flex items-end justify-center gap-2 bg-primary/0 p-3 opacity-0 transition-all duration-200 group-hover:bg-primary/40 group-hover:opacity-100">
                  {thumbnailId !== item._id && (
                    <button
                      onClick={() => handleSetThumbnail(item._id)}
                      title="Set as thumbnail"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-base/90 text-primary hover:bg-accentHover hover:text-white"
                    >
                      <Star size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(item._id)}
                    title="Remove"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-base/90 text-primary hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
