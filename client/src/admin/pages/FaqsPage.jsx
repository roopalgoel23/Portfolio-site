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

export default function FaqsPage() {
  const { confirm } = useConfirm();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add state
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

  // Edit state
  const [editId, setEditId] = useState(null);
  const [editFaq, setEditFaq] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // ── Fetch ──
  const fetchFaqs = useCallback(async () => {
    try {
      const { data } = await api.get('/api/faqs');
      setFaqs(data);
    } catch {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFaqs(); }, [fetchFaqs]);

  // ── Add ──
  const handleAdd = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }
    setAdding(true);
    try {
      const { data } = await api.post('/api/faqs', {
        ...newFaq,
        order: faqs.length
      });
      setFaqs([...faqs, data]);
      setNewFaq({ question: '', answer: '' });
      setShowAdd(false);
      toast.success('FAQ added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add FAQ');
    } finally {
      setAdding(false);
    }
  };

  // ── Edit ──
  const startEdit = (faq) => {
    setEditId(faq._id);
    setEditFaq({ ...faq });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditFaq(null);
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const { data } = await api.put(`/api/faqs/${editId}`, {
        question: editFaq.question,
        answer: editFaq.answer,
        order: editFaq.order
      });
      setFaqs(faqs.map((f) => (f._id === editId ? data : f)));
      cancelEdit();
      toast.success('FAQ updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Delete FAQ?',
      message: 'This will permanently remove the question.'
    });
    if (!ok) return;
    try {
      await api.delete(`/api/faqs/${id}`);
      setFaqs(faqs.filter((f) => f._id !== id));
      toast.success('FAQ deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  // ── Reorder ──
  const handleReorder = async (index, dir) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= faqs.length) return;

    const reordered = [...faqs];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];

    const updated = reordered.map((f, i) => ({ ...f, order: i }));
    setFaqs(updated);

    try {
      await api.post('/api/faqs/reorder', {
        order: updated.map((f) => ({ id: f._id, order: f.order }))
      });
      toast.success('Order updated');
    } catch {
      toast.error('Failed to update order');
      fetchFaqs();
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
        title="FAQs"
        subtitle="Frequently asked questions shown on the site"
        action={
          <AdminButton onClick={() => setShowAdd(!showAdd)}>
            <Plus size={18} />
            Add FAQ
          </AdminButton>
        }
      />

      {/* ── Add form ── */}
      {showAdd && (
        <AdminCard className="mb-6 border-2 border-accent">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-lg font-600 text-primary">New FAQ</h3>
            <IconButton onClick={() => setShowAdd(false)}>
              <X size={20} />
            </IconButton>
          </div>
          <div className="space-y-5">
            <div>
              <FieldLabel>Question</FieldLabel>
              <AdminInput
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                placeholder="How far in advance should I book?"
              />
            </div>
            <div>
              <FieldLabel>Answer</FieldLabel>
              <AdminTextarea
                rows={3}
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                placeholder="We recommend booking at least 2-3 months in advance..."
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <AdminButton variant="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </AdminButton>
            <AdminButton onClick={handleAdd} disabled={adding}>
              {adding ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              Add FAQ
            </AdminButton>
          </div>
        </AdminCard>
      )}

      {/* ── FAQ list ── */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <AdminCard key={faq._id}>
            {editId === faq._id ? (
              /* ── Edit mode ── */
              <div className="space-y-5">
                <div>
                  <FieldLabel>Question</FieldLabel>
                  <AdminInput
                    value={editFaq.question}
                    onChange={(e) => setEditFaq({ ...editFaq, question: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>Answer</FieldLabel>
                  <AdminTextarea
                    rows={3}
                    value={editFaq.answer}
                    onChange={(e) => setEditFaq({ ...editFaq, answer: e.target.value })}
                  />
                </div>
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
                  <h3 className="font-heading text-base font-600 text-primary">
                    {faq.question}
                  </h3>
                  <p className="mt-2 font-body text-sm text-secondary">
                    {faq.answer}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-1">
                    <IconButton
                      onClick={() => handleReorder(index, -1)}
                      disabled={index === 0}
                    >
                      <ChevronUp size={18} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleReorder(index, 1)}
                      disabled={index === faqs.length - 1}
                    >
                      <ChevronDown size={18} />
                    </IconButton>
                  </div>
                  <div className="flex gap-1">
                    <IconButton onClick={() => startEdit(faq)}>
                      <Pencil size={16} />
                    </IconButton>
                    <IconButton variant="danger" onClick={() => handleDelete(faq._id)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </div>
              </div>
            )}
          </AdminCard>
        ))}

        {faqs.length === 0 && !showAdd && (
          <AdminCard className="text-center">
            <p className="font-body text-secondary">
              No FAQs yet. Click "Add FAQ" to create one.
            </p>
          </AdminCard>
        )}
      </div>
    </div>
  );
}
