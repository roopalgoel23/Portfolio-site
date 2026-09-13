import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Mail,
  MailOpen,
  Trash2,
  Phone,
  Calendar,
  Loader2,
  RefreshCw,
  Inbox
} from 'lucide-react';
import api from '../../api/axios';
import { PageHeader, AdminCard, IconButton } from '../components/AdminUI';
import { useConfirm } from '../components/ConfirmModal';

export default function EnquiriesPage() {
  const { confirm } = useConfirm();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [expanded, setExpanded] = useState(null);

  // ── Fetch enquiries ──
  const fetchEnquiries = useCallback(async () => {
    try {
      const { data } = await api.get('/api/enquiries');
      setEnquiries(data);
    } catch (err) {
      console.error('Enquiries error:', err);
      toast.error('Failed to load enquiries.');
    }
  }, []);

  useEffect(() => {
    fetchEnquiries().finally(() => setLoading(false));
  }, [fetchEnquiries]);

  // ── Mark as read ──
  const handleMarkRead = async (id) => {
    try {
      await api.put(`/api/enquiries/${id}/read`);
      setEnquiries((prev) =>
        prev.map((e) => (e._id === id ? { ...e, isRead: true } : e))
      );
    } catch (err) {
      toast.error('Failed to mark as read.');
    }
  };

  // ── Delete ──
  const handleDelete = async (enquiry) => {
    const ok = await confirm({
      title: 'Delete this enquiry?',
      message: `This will permanently delete the enquiry from "${enquiry.name}".`,
      confirmText: 'Delete',
      danger: true
    });
    if (!ok) return;

    setDeleting(enquiry._id);
    try {
      await api.delete(`/api/enquiries/${enquiry._id}`);
      setEnquiries((prev) => prev.filter((e) => e._id !== enquiry._id));
      toast.success('Enquiry deleted.');
    } catch (err) {
      toast.error('Failed to delete enquiry.');
    } finally {
      setDeleting(null);
    }
  };

  // ── Stats ──
  const unreadCount = enquiries.filter((e) => !e.isRead).length;

  // ── Format date ──
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div>
      <PageHeader
        title="Enquiries"
        subtitle="Customer enquiries from the contact form"
        action={
          <button
            onClick={() => {
              setLoading(true);
              fetchEnquiries().finally(() => setLoading(false));
            }}
            className="flex items-center gap-2 rounded-btn border border-line bg-card px-4 py-2.5 font-body text-sm font-500 text-secondary transition-all hover:bg-accent hover:text-primary"
          >
            <RefreshCw size={16} strokeWidth={1.5} />
            Refresh
          </button>
        }
      />

      {/* Stats bar */}
      <div className="mb-6 flex gap-4">
        <div className="flex items-center gap-2 rounded-card border border-line bg-card px-5 py-3">
          <Inbox size={20} className="text-primary" strokeWidth={1.5} />
          <div>
            <p className="font-heading text-xl font-600 text-primary">{enquiries.length}</p>
            <p className="text-xs text-secondary">Total</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 rounded-card border border-line bg-card px-5 py-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-600 text-white">
              {unreadCount}
            </div>
            <div>
              <p className="font-heading text-xl font-600 text-primary">{unreadCount}</p>
              <p className="text-xs text-secondary">Unread</p>
            </div>
          </div>
        )}
      </div>

      {/* Enquiries list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : enquiries.length === 0 ? (
        <AdminCard className="py-12 text-center">
          <Inbox size={40} className="mx-auto mb-3 text-secondary/40" strokeWidth={1} />
          <p className="font-body text-secondary">No enquiries yet. They'll appear here when customers submit the contact form.</p>
        </AdminCard>
      ) : (
        <div className="space-y-3">
          {enquiries.map((enquiry) => (
            <div
              key={enquiry._id}
              className={`rounded-card border bg-card p-5 transition-all hover:shadow-card ${
                enquiry.isRead ? 'border-line' : 'border-primary/30 bg-primary/[0.02]'
              }`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {/* Unread indicator */}
                  <button
                    onClick={() => !enquiry.isRead && handleMarkRead(enquiry._id)}
                    className="mt-0.5"
                    title={enquiry.isRead ? 'Read' : 'Mark as read'}
                  >
                    {enquiry.isRead ? (
                      <MailOpen size={18} className="text-secondary" strokeWidth={1.5} />
                    ) : (
                      <Mail size={18} className="text-primary" strokeWidth={2} />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-base font-600 text-primary">{enquiry.name}</h3>
                      {!enquiry.isRead && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-600 uppercase tracking-wide text-white">
                          New
                        </span>
                      )}
                    </div>

                    {/* Contact info */}
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-secondary">
                      <a href={`mailto:${enquiry.email}`} className="flex items-center gap-1 hover:text-primary">
                        <Mail size={12} strokeWidth={1.5} />
                        {enquiry.email}
                      </a>
                      {enquiry.phone && (
                        <a
                          href={`https://wa.me/${enquiry.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <Phone size={12} strokeWidth={1.5} />
                          {enquiry.phone}
                        </a>
                      )}
                      {enquiry.eventDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} strokeWidth={1.5} />
                          {enquiry.eventDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <IconButton
                    onClick={() => setExpanded(expanded === enquiry._id ? null : enquiry._id)}
                    className="text-xs"
                    title={expanded === enquiry._id ? 'Collapse' : 'Expand'}
                  >
                    {expanded === enquiry._id ? '−' : '+'}
                  </IconButton>
                  <IconButton
                    variant="danger"
                    onClick={() => handleDelete(enquiry)}
                    title="Delete"
                    disabled={deleting === enquiry._id}
                  >
                    {deleting === enquiry._id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} strokeWidth={1.5} />
                    )}
                  </IconButton>
                </div>
              </div>

              {/* Message */}
              <div className="mt-3">
                {expanded === enquiry._id ? (
                  <p className="whitespace-pre-wrap rounded-btn bg-accent/30 p-3 font-body text-sm text-primary">
                    {enquiry.message}
                  </p>
                ) : (
                  <p className="line-clamp-2 font-body text-sm text-secondary">
                    {enquiry.message}
                  </p>
                )}
              </div>

              {/* Timestamp */}
              <p className="mt-2 text-[11px] text-secondary/60">{formatDate(enquiry.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
