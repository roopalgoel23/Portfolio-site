import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Pencil, ChevronUp, ChevronDown, X, Check, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import {
  FieldLabel,
  AdminInput,
  AdminTextarea,
  AdminCard,
  PageHeader,
  AdminButton,
  IconButton
} from '../components/AdminUI';
import { useConfirm } from '../components/ConfirmModal';

export default function ServicesPage() {
  const { confirm } = useConfirm();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add form state
  const [showAdd, setShowAdd]   = useState(false);
  const [adding, setAdding]     = useState(false);
  const [newSvc, setNewSvc]     = useState({ title: '', description: '', priceRange: '', icon: '' });

  // Edit state
  const [editId, setEditId]     = useState(null);
  const [editSvc, setEditSvc]   = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // ── Fetch ──
  const fetchServices = useCallback(async () => {
    try {
      const { data } = await api.get('/api/services');
      setServices(data);
    } catch {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  // ── Add ──
  const handleAdd = async () => {
    if (!newSvc.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setAdding(true);
    try {
      const { data } = await api.post('/api/services', {
        ...newSvc,
        order: services.length
      });
      setServices([...services, data]);
      setNewSvc({ title: '', description: '', priceRange: '', icon: '' });
      setShowAdd(false);
      toast.success('Service added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add service');
    } finally {
      setAdding(false);
    }
  };

  // ── Edit ──
  const startEdit = (svc) => {
    setEditId(svc._id);
    setEditSvc({ ...svc });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditSvc(null);
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const { data } = await api.put(`/api/services/${editId}`, {
        title: editSvc.title,
        description: editSvc.description,
        priceRange: editSvc.priceRange,
        icon: editSvc.icon,
        order: editSvc.order
      });
      setServices(services.map((s) => (s._id === editId ? data : s)));
      cancelEdit();
      toast.success('Service updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Delete Service?',
      message: 'This will permanently remove the service from the site.'
    });
    if (!ok) return;
    try {
      await api.delete(`/api/services/${id}`);
      setServices(services.filter((s) => s._id !== id));
      toast.success('Service deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  // ── Reorder ──
  const handleReorder = async (index, dir) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= services.length) return;

    const reordered = [...services];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];

    // Update local order values
    const updated = reordered.map((s, i) => ({ ...s, order: i }));
    setServices(updated);

    try {
      await api.post('/api/services/reorder', {
        order: updated.map((s) => ({ id: s._id, order: s.order }))
      });
      toast.success('Order updated');
    } catch {
      toast.error('Failed to update order');
      fetchServices(); // revert on failure
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
        title="Services"
        subtitle="Manage makeup services displayed on the site"
        action={
          <AdminButton onClick={() => setShowAdd(!showAdd)}>
            <Plus size={18} />
            Add Service
          </AdminButton>
        }
      />

      {/* ── Add form ── */}
      {showAdd && (
        <AdminCard className="mb-6 border-2 border-accent">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-lg font-600 text-primary">
              New Service
            </h3>
            <IconButton onClick={() => setShowAdd(false)}>
              <X size={20} />
            </IconButton>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel>Title</FieldLabel>
              <AdminInput
                value={newSvc.title}
                onChange={(e) => setNewSvc({ ...newSvc, title: e.target.value })}
                placeholder="Bridal Makeup"
              />
            </div>
            <div>
              <FieldLabel>Price Range</FieldLabel>
              <AdminInput
                value={newSvc.priceRange}
                onChange={(e) => setNewSvc({ ...newSvc, priceRange: e.target.value })}
                placeholder="₹15,000 - ₹35,000"
              />
            </div>
          </div>
          <div className="mt-5">
            <FieldLabel>Description</FieldLabel>
            <AdminTextarea
              rows={2}
              value={newSvc.description}
              onChange={(e) => setNewSvc({ ...newSvc, description: e.target.value })}
              placeholder="Complete bridal look including HD makeup, hair styling, and draping."
            />
          </div>
          <div className="mt-5">
            <FieldLabel>Icon (emoji or keyword)</FieldLabel>
            <AdminInput
              value={newSvc.icon}
              onChange={(e) => setNewSvc({ ...newSvc, icon: e.target.value })}
              placeholder="👰 or bridal, engagement, party..."
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <AdminButton variant="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </AdminButton>
            <AdminButton onClick={handleAdd} disabled={adding}>
              {adding ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              Add Service
            </AdminButton>
          </div>
        </AdminCard>
      )}

      {/* ── Service list ── */}
      <div className="space-y-4">
        {services.map((svc, index) => (
          <AdminCard key={svc._id}>
            {editId === svc._id ? (
              /* ── Edit mode ── */
              <div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Title</FieldLabel>
                    <AdminInput
                      value={editSvc.title}
                      onChange={(e) => setEditSvc({ ...editSvc, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <FieldLabel>Price Range</FieldLabel>
                    <AdminInput
                      value={editSvc.priceRange}
                      onChange={(e) => setEditSvc({ ...editSvc, priceRange: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-5">
                  <FieldLabel>Description</FieldLabel>
                  <AdminTextarea
                    rows={2}
                    value={editSvc.description}
                    onChange={(e) => setEditSvc({ ...editSvc, description: e.target.value })}
                  />
                </div>
                <div className="mt-5">
                  <FieldLabel>Icon</FieldLabel>
                  <AdminInput
                    value={editSvc.icon}
                    onChange={(e) => setEditSvc({ ...editSvc, icon: e.target.value })}
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
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
                  <div className="flex items-center gap-3">
                    {svc.icon && <span className="text-2xl">{svc.icon}</span>}
                    <h3 className="font-heading text-lg font-600 text-primary">
                      {svc.title}
                    </h3>
                  </div>
                  <p className="mt-2 font-body text-sm text-secondary">
                    {svc.description}
                  </p>
                  {svc.priceRange && (
                    <p className="mt-2 font-body text-sm font-600 text-primary">
                      {svc.priceRange}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-1">
                    <IconButton
                      onClick={() => handleReorder(index, -1)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <ChevronUp size={18} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleReorder(index, 1)}
                      disabled={index === services.length - 1}
                      title="Move down"
                    >
                      <ChevronDown size={18} />
                    </IconButton>
                  </div>
                  <div className="flex gap-1">
                    <IconButton onClick={() => startEdit(svc)} title="Edit">
                      <Pencil size={16} />
                    </IconButton>
                    <IconButton
                      variant="danger"
                      onClick={() => handleDelete(svc._id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </div>
              </div>
            )}
          </AdminCard>
        ))}

        {services.length === 0 && !showAdd && (
          <AdminCard className="text-center">
            <p className="font-body text-secondary">
              No services yet. Click "Add Service" to create one.
            </p>
          </AdminCard>
        )}
      </div>
    </div>
  );
}
