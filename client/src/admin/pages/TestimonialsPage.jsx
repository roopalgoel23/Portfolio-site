import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Pencil, Star, X, Check, Loader2, ChevronDown, ChevronUp, Upload, ImageIcon, Link2 } from 'lucide-react';
import api from '../../api/axios';
import {
  FieldLabel,
  AdminInput,
  AdminTextarea,
  AdminSelect,
  AdminCard,
  PageHeader,
  AdminButton,
  IconButton
} from '../components/AdminUI';
import { useConfirm } from '../components/ConfirmModal';
import MediaPicker from '../components/MediaPicker';
import { assetUrl } from '../../api/axios';

const OCCASIONS = ['Wedding', 'Engagement', 'Reception', 'Mehendi', 'Party', 'Other'];

export default function TestimonialsPage() {
  const { confirm } = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add state
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    clientName: '',
    occasion: 'Wedding',
    rating: 5,
    review: '',
    photo: ''
  });
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [uploadingAddPhoto, setUploadingAddPhoto] = useState(false);

  // Edit state
  const [editId, setEditId] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [showEditPicker, setShowEditPicker] = useState(false);
  const [uploadingEditPhoto, setUploadingEditPhoto] = useState(false);

  // ── Fetch ──
  const fetchItems = useCallback(async () => {
    try {
      const { data } = await api.get('/api/testimonials');
      setItems(data);
    } catch {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Star rating selector ──
  const StarSelector = ({ value, onChange }) => (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className="transition-transform duration-200 hover:scale-110"
        >
          <Star
            size={24}
            className={
              star <= value
                ? 'fill-accentHover text-accentHover'
                : 'text-line'
            }
          />
        </button>
      ))}
    </div>
  );

  // ── Upload photo (file) for add form ──
  const handleAddPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAddPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewItem((prev) => ({ ...prev, photo: data.path }));
      toast.success('Photo uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingAddPhoto(false);
      e.target.value = '';
    }
  };

  // ── Upload photo (file) for edit form ──
  const handleEditPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingEditPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditItem((prev) => ({ ...prev, photo: data.path }));
      toast.success('Photo uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingEditPhoto(false);
      e.target.value = '';
    }
  };

  // ── Reusable photo field component ──
  const PhotoField = ({ photo, onUpload, onPick, onClear, uploading }) => (
    <div>
      <FieldLabel>Client Photo</FieldLabel>
      <div className="flex flex-wrap items-center gap-3">
        {photo ? (
          <div className="group relative">
            <img
              src={assetUrl(photo)}
              alt="Client"
              className="h-20 w-20 rounded-full border border-line object-cover"
            />
            <button
              onClick={onClear}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white"
            >
              <X size={12} />
            </button>
          </div>
        ) : null}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPick()}
            className="inline-flex items-center gap-1.5 rounded-btn border border-line px-3 py-2 font-body text-xs font-500 text-secondary transition-colors hover:bg-card"
          >
            <ImageIcon size={14} />
            Browse Library
          </button>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-btn border border-line px-3 py-2 font-body text-xs font-500 text-secondary transition-colors hover:bg-card">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? 'Uploading...' : 'Upload New'}
            <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );

  // ── Add ──
  const handleAdd = async () => {
    if (!newItem.clientName.trim()) {
      toast.error('Client name is required');
      return;
    }
    if (!newItem.review.trim()) {
      toast.error('Review is required');
      return;
    }
    setAdding(true);
    try {
      const { data } = await api.post('/api/testimonials', {
        ...newItem,
        photo: newItem.photo || undefined,
        order: items.length
      });
      setItems([...items, data]);
      setNewItem({ clientName: '', occasion: 'Wedding', rating: 5, review: '', photo: '' });
      setShowAdd(false);
      toast.success('Testimonial added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  // ── Edit ──
  const startEdit = (item) => {
    setEditId(item._id);
    setEditItem({ ...item });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditItem(null);
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const { data } = await api.put(`/api/testimonials/${editId}`, {
        clientName: editItem.clientName,
        occasion: editItem.occasion,
        rating: editItem.rating,
        review: editItem.review,
        photo: editItem.photo || '',
        order: editItem.order
      });
      setItems(items.map((i) => (i._id === editId ? data : i)));
      cancelEdit();
      toast.success('Testimonial updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Delete Testimonial?',
      message: 'This will permanently remove the review.'
    });
    if (!ok) return;
    try {
      await api.delete(`/api/testimonials/${id}`);
      setItems(items.filter((i) => i._id !== id));
      toast.success('Testimonial deleted');
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
        title="Testimonials"
        subtitle="Manage client reviews shown on the site"
        action={
          <AdminButton onClick={() => setShowAdd(!showAdd)}>
            <Plus size={18} />
            Add Testimonial
          </AdminButton>
        }
      />

      {/* ── Add form ── */}
      {showAdd && (
        <AdminCard className="mb-6 border-2 border-accent">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-lg font-600 text-primary">
              New Testimonial
            </h3>
            <IconButton onClick={() => setShowAdd(false)}>
              <X size={20} />
            </IconButton>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel>Client Name</FieldLabel>
              <AdminInput
                value={newItem.clientName}
                onChange={(e) => setNewItem({ ...newItem, clientName: e.target.value })}
                placeholder="Priya Sharma"
              />
            </div>
            <div>
              <FieldLabel>Occasion</FieldLabel>
              <AdminSelect
                value={newItem.occasion}
                onChange={(e) => setNewItem({ ...newItem, occasion: e.target.value })}
              >
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </AdminSelect>
            </div>
          </div>
          <div className="mt-5">
            <FieldLabel>Rating</FieldLabel>
            <StarSelector
              value={newItem.rating}
              onChange={(val) => setNewItem({ ...newItem, rating: val })}
            />
          </div>
          <div className="mt-5">
            <FieldLabel>Review</FieldLabel>
            <AdminTextarea
              rows={3}
              value={newItem.review}
              onChange={(e) => setNewItem({ ...newItem, review: e.target.value })}
              placeholder="Roopal made me feel like the most beautiful bride..."
            />
          </div>
          <div className="mt-5">
            <PhotoField
              photo={newItem.photo}
              uploading={uploadingAddPhoto}
              onUpload={handleAddPhotoUpload}
              onPick={() => setShowAddPicker(true)}
              onClear={() => setNewItem({ ...newItem, photo: '' })}
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <AdminButton variant="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </AdminButton>
            <AdminButton onClick={handleAdd} disabled={adding}>
              {adding ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              Add Testimonial
            </AdminButton>
          </div>
        </AdminCard>
      )}

      {/* ── Testimonials list ── */}
      <div className="space-y-4">
        {items.map((item) => (
          <AdminCard key={item._id}>
            {editId === item._id ? (
              /* ── Edit mode ── */
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Client Name</FieldLabel>
                    <AdminInput
                      value={editItem.clientName}
                      onChange={(e) => setEditItem({ ...editItem, clientName: e.target.value })}
                    />
                  </div>
                  <div>
                    <FieldLabel>Occasion</FieldLabel>
                    <AdminSelect
                      value={editItem.occasion}
                      onChange={(e) => setEditItem({ ...editItem, occasion: e.target.value })}
                    >
                      {OCCASIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </AdminSelect>
                  </div>
                </div>
                <div>
                  <FieldLabel>Rating</FieldLabel>
                  <StarSelector
                    value={editItem.rating}
                    onChange={(val) => setEditItem({ ...editItem, rating: val })}
                  />
                </div>
                <div>
                  <FieldLabel>Review</FieldLabel>
                  <AdminTextarea
                    rows={3}
                    value={editItem.review}
                    onChange={(e) => setEditItem({ ...editItem, review: e.target.value })}
                  />
                </div>
                <PhotoField
                  photo={editItem.photo || ''}
                  uploading={uploadingEditPhoto}
                  onUpload={handleEditPhotoUpload}
                  onPick={() => setShowEditPicker(true)}
                  onClear={() => setEditItem({ ...editItem, photo: '' })}
                />
                <div className="flex justify-end gap-3">
                  <AdminButton variant="secondary" onClick={cancelEdit}>
                    Cancel
                  </AdminButton>
                  <AdminButton onClick={handleSaveEdit} disabled={savingEdit}>
                    {savingEdit ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    Save Changes
                  </AdminButton>
                </div>
              </div>
            ) : (
              /* ── View mode ── */
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    {item.photo ? (
                      <img
                        src={assetUrl(item.photo)}
                        alt={item.clientName}
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-accentHover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-heading font-600 text-primary">
                        {item.clientName?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-heading text-base font-600 text-primary">
                        {item.clientName}
                      </h4>
                      <p className="font-body text-xs text-secondary">{item.occasion}</p>
                    </div>
                  </div>
                  <div className="mb-2 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        size={16}
                        className={
                          s < (item.rating || 5)
                            ? 'fill-accentHover text-accentHover'
                            : 'text-line'
                        }
                      />
                    ))}
                  </div>
                  <p className="font-body text-sm text-secondary">
                    {item.review}
                  </p>
                </div>
                <div className="flex gap-1">
                  <IconButton onClick={() => startEdit(item)} title="Edit">
                    <Pencil size={16} />
                  </IconButton>
                  <IconButton
                    variant="danger"
                    onClick={() => handleDelete(item._id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              </div>
            )}
          </AdminCard>
        ))}

        {items.length === 0 && !showAdd && (
          <AdminCard className="text-center">
            <p className="font-body text-secondary">
              No testimonials yet. Click "Add Testimonial" to create one.
            </p>
          </AdminCard>
        )}
      </div>

      {/* ── Media Pickers ── */}
      <MediaPicker
        open={showAddPicker}
        onClose={() => setShowAddPicker(false)}
        onSelect={(url) => setNewItem((prev) => ({ ...prev, photo: url }))}
        type="image"
        title="Choose Client Photo"
      />
      <MediaPicker
        open={showEditPicker}
        onClose={() => setShowEditPicker(false)}
        onSelect={(url) => setEditItem((prev) => ({ ...prev, photo: url }))}
        type="image"
        title="Choose Client Photo"
      />
    </div>
  );
}
