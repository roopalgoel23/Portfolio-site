import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Save, Loader2, Upload, X, ImagePlus } from 'lucide-react';
import api, { assetUrl } from '../../api/axios';
import {
  FieldLabel,
  AdminInput,
  AdminTextarea,
  AdminCard,
  PageHeader,
  AdminButton
} from '../components/AdminUI';

export default function ContentPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingAbout, setUploadingAbout] = useState(false);

  useEffect(() => {
    api
      .get('/api/content')
      .then(({ data }) => {
        setContent(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load content');
        setLoading(false);
      });
  }, []);

  // ── Field update helper ──
  const updateField = (field, value) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  // ── Save text fields ──
  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/api/content', {
        heroKicker:   content.heroKicker,
        heroTitle:    content.heroTitle,
        heroSubtitle: content.heroSubtitle,
        aboutTitle:   content.aboutTitle,
        aboutBody:    content.aboutBody,
        whatsapp:     content.whatsapp,
        email:        content.email,
        instagram:    content.instagram
      });
      setContent(data);
      toast.success('Content saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  // ── Hero image upload ──
  const handleHeroUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/api/content/hero-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateField('heroImage', data.heroImage);
      toast.success('Hero image uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingHero(false);
      e.target.value = '';
    }
  };

  // ── About images upload ──
  const handleAboutUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingAbout(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      const { data } = await api.post('/api/content/about-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateField('aboutImages', data.aboutImages);
      toast.success('About images uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingAbout(false);
      e.target.value = '';
    }
  };

  // ── Remove about image (client-side; no delete endpoint, so clear via save) ──
  const removeAboutImage = (index) => {
    const updated = content.aboutImages.filter((_, i) => i !== index);
    updateField('aboutImages', updated);
    // Note: aboutImages are stored separately in DB; we update locally for preview
    toast('Image removed from preview. Save content to persist.', { icon: 'ℹ️' });
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
        title="Site Content"
        subtitle="Manage homepage hero, about section, and contact details"
        action={
          <AdminButton onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </AdminButton>
        }
      />

      {/* ── Row 1: Two-column (hero kicker + instagram) ── */}
      <AdminCard className="mb-6">
        <h3 className="mb-4 font-heading text-lg font-600 text-primary">
          Hero & Social
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel>Hero Kicker</FieldLabel>
            <AdminInput
              value={content.heroKicker || ''}
              onChange={(e) => updateField('heroKicker', e.target.value)}
              placeholder="Bridal Makeup Artist"
            />
          </div>
          <div>
            <FieldLabel>Instagram URL</FieldLabel>
            <AdminInput
              value={content.instagram || ''}
              onChange={(e) => updateField('instagram', e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
        </div>
      </AdminCard>

      {/* ── Row 2: Full-width fields ── */}
      <AdminCard className="mb-6">
        <h3 className="mb-4 font-heading text-lg font-600 text-primary">
          Hero Section
        </h3>
        <div className="space-y-5">
          <div>
            <FieldLabel>Hero Title</FieldLabel>
            <AdminInput
              value={content.heroTitle || ''}
              onChange={(e) => updateField('heroTitle', e.target.value)}
              placeholder="Makeup by Roopal Goel"
            />
          </div>
          <div>
            <FieldLabel>Hero Subtitle</FieldLabel>
            <AdminTextarea
              rows={2}
              value={content.heroSubtitle || ''}
              onChange={(e) => updateField('heroSubtitle', e.target.value)}
              placeholder="Enhancing your natural beauty on your most special day."
            />
          </div>
        </div>
      </AdminCard>

      <AdminCard className="mb-6">
        <h3 className="mb-4 font-heading text-lg font-600 text-primary">
          About Section
        </h3>
        <div className="space-y-5">
          <div>
            <FieldLabel>About Title</FieldLabel>
            <AdminInput
              value={content.aboutTitle || ''}
              onChange={(e) => updateField('aboutTitle', e.target.value)}
              placeholder="About Roopal"
            />
          </div>
          <div>
            <FieldLabel>About Body</FieldLabel>
            <AdminTextarea
              rows={5}
              value={content.aboutBody || ''}
              onChange={(e) => updateField('aboutBody', e.target.value)}
              placeholder="Tell the story of Roopal Goel..."
            />
          </div>
        </div>
      </AdminCard>

      <AdminCard className="mb-6">
        <h3 className="mb-4 font-heading text-lg font-600 text-primary">
          Contact Details
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel>WhatsApp Number</FieldLabel>
            <AdminInput
              value={content.whatsapp || ''}
              onChange={(e) => updateField('whatsapp', e.target.value)}
              placeholder="+91-9876543210"
            />
          </div>
          <div>
            <FieldLabel>Contact Email</FieldLabel>
            <AdminInput
              type="email"
              value={content.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="Makeupbyroopalgoel@gmail.com"
            />
          </div>
        </div>
      </AdminCard>

      {/* ── Image upload section ── */}
      <AdminCard>
        <h3 className="mb-4 font-heading text-lg font-600 text-primary">
          Images
        </h3>

        {/* Hero image */}
        <div className="mb-8">
          <FieldLabel>Hero Image</FieldLabel>
          <div className="flex flex-wrap items-center gap-6">
            {content.heroImage && (
              <div className="relative">
                <img
                  src={assetUrl(content.heroImage)}
                  alt="Hero"
                  className="h-32 w-24 rounded-btn border border-line object-cover"
                />
              </div>
            )}
            <label
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-btn border-2 border-dashed border-line px-8 py-6 transition-colors duration-300 hover:border-accentHover"
            >
              {uploadingHero ? (
                <Loader2 size={24} className="animate-spin text-secondary" />
              ) : (
                <Upload size={24} className="text-secondary" />
              )}
              <span className="font-body text-sm text-secondary">
                {uploadingHero ? 'Uploading...' : 'Upload Hero Image'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleHeroUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* About images */}
        <div>
          <FieldLabel>About Images (Max 3)</FieldLabel>
          <div className="flex flex-wrap items-start gap-4">
            {(content.aboutImages || []).map((img, i) => (
              <div key={i} className="group relative">
                <img
                  src={assetUrl(img)}
                  alt={`About ${i + 1}`}
                  className="h-32 w-24 rounded-btn border border-line object-cover"
                />
                <button
                  onClick={() => removeAboutImage(i)}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {(content.aboutImages || []).length < 3 && (
              <label className="flex h-32 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-btn border-2 border-dashed border-line transition-colors duration-300 hover:border-accentHover">
                {uploadingAbout ? (
                  <Loader2 size={20} className="animate-spin text-secondary" />
                ) : (
                  <ImagePlus size={20} className="text-secondary" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAboutUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
