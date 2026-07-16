import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Minimize2,
  Upload,
  Download,
  Loader2,
  FileImage,
  FileVideo,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import api from '../../api/axios';
import { PageHeader, AdminCard, AdminButton, AdminSelect, FieldLabel } from '../components/AdminUI';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function CompressionPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [quality, setQuality] = useState('auto');
  const [compressing, setCompressing] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // ── Handle file selection ──
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
      toast.error('Please select an image or video file.');
      return;
    }

    const isVideo   = selectedFile.type.startsWith('video/');
    const maxBytes  = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    const maxLabel  = isVideo ? '100 MB' : '10 MB';

    if (selectedFile.size > maxBytes) {
      toast.error(`File too large. ${isVideo ? 'Videos' : 'Images'} must be under ${maxLabel} (Cloudinary free plan limit). Your file is ${(selectedFile.size / 1024 / 1024).toFixed(1)} MB.`);
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  // ── Compress ──
  const handleCompress = async () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }

    setCompressing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('quality', quality);

      const { data } = await api.post('/api/storage/compress', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000 // 2 min timeout for large videos
      });

      setResult(data);
      toast.success(`Compressed! Saved ${data.savedPercent}% (${data.savedBytesHuman})`);
    } catch (err) {
      console.error('Compress error:', err);
      toast.error(err.response?.data?.message || 'Compression failed.');
    } finally {
      setCompressing(false);
    }
  };

  // ── Reset ──
  const handleReset = () => {
    setFile(null);
    setPreview('');
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isVideo = file && file.type.startsWith('video/');

  return (
    <div>
      <PageHeader
        title="Media Compression"
        subtitle="Upload a file, compress it, and download the smaller version"
      />

      {/* ── Info Banner ── */}
      <AdminCard className="mb-6 border-accentHover/40 bg-accent/20">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accentHover/30">
            <Sparkles size={20} className="text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="font-body text-sm font-600 text-primary">How it works</h4>
            <p className="mt-0.5 font-body text-sm text-secondary">
              Upload any image or video. Cloudinary will optimize it using smart compression (auto-format + quality reduction).
              You get a download link for the compressed version. The original file stays on your computer — nothing is uploaded permanently
              unless you choose to use the compressed version.
            </p>
          </div>
        </div>
      </AdminCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ��─ Left: Upload + Config ── */}
        <AdminCard>
          <h3 className="mb-4 font-heading text-lg font-600 text-primary">1. Select File</h3>

          {/* Dropzone */}
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed py-12 transition-all ${
                dragOver
                  ? 'border-accentHover bg-accent/20'
                  : 'border-line bg-accent/10 hover:border-accentHover hover:bg-accent/10'
              }`}
            >
              <Upload size={36} className="mb-3 text-secondary" strokeWidth={1} />
              <p className="font-body text-sm font-500 text-primary">Click to browse or drag & drop</p>
              <p className="mt-1 font-body text-xs text-secondary">Images & Videos up to 100 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />
            </div>
          ) : (
            <div>
              {/* Preview */}
              <div className="mb-3 overflow-hidden rounded-card border border-line bg-accent/10">
                {isVideo ? (
                  <video src={preview} controls className="max-h-64 w-full object-contain" />
                ) : (
                  <img src={preview} alt="Preview" className="max-h-64 w-full object-contain" />
                )}
              </div>

              {/* File info */}
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-accent/20 p-3">
                {isVideo ? <FileVideo size={18} className="text-primary" /> : <FileImage size={18} className="text-primary" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-sm font-500 text-primary">{file.name}</p>
                  <p className="font-body text-xs text-secondary">{formatBytes(file.size)}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="font-body text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>

              {/* Quality selector */}
              <div className="mb-4">
                <FieldLabel>Compression Quality</FieldLabel>
                <AdminSelect value={quality} onChange={(e) => setQuality(e.target.value)}>
                  <option value="auto">Auto (Recommended — Smart optimization)</option>
                  <option value="80">High (80 — Minimal quality loss)</option>
                  <option value="60">Medium (60 — Good balance)</option>
                  <option value="40">Low (40 — Maximum compression)</option>
                </AdminSelect>
                <p className="mt-1.5 font-body text-xs text-secondary">
                  Lower quality = smaller file. 'Auto' uses Cloudinary's smart algorithm.
                </p>
              </div>

              {/* Compress button */}
              <AdminButton
                onClick={handleCompress}
                disabled={compressing}
                className="w-full"
              >
                {compressing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Compressing...
                  </>
                ) : (
                  <>
                    <Minimize2 size={16} strokeWidth={1.5} />
                    Compress File
                  </>
                )}
              </AdminButton>
            </div>
          )}
        </AdminCard>

        {/* ── Right: Results ── */}
        <AdminCard>
          <h3 className="mb-4 font-heading text-lg font-600 text-primary">2. Result</h3>

          {!result && !compressing && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Minimize2 size={40} className="mb-3 text-secondary/40" strokeWidth={1} />
              <p className="font-body text-sm text-secondary">
                Upload a file and click "Compress" to see results here.
              </p>
            </div>
          )}

          {compressing && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 size={40} className="mb-3 animate-spin text-primary" strokeWidth={1.5} />
              <p className="font-body text-sm text-secondary">
                {isVideo ? 'Compressing video... This may take a minute.' : 'Compressing image...'}
              </p>
            </div>
          )}

          {result && (
            <div>
              {/* Success Banner */}
              <div className="mb-4 flex items-center gap-3 rounded-card border border-green-200 bg-green-50 p-4">
                <CheckCircle2 size={24} className="shrink-0 text-green-600" />
                <div>
                  <p className="font-body text-sm font-600 text-green-800">
                    Saved {result.savedPercent}% — {result.savedBytesHuman} reduced!
                  </p>
                  <p className="font-body text-xs text-green-600">
                    Original {result.original.bytesHuman} → Compressed {result.compressed.bytesHuman}
                  </p>
                </div>
              </div>

              {/* Before / After visual */}
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-card border border-line bg-accent/10 p-4 text-center">
                  <p className="mb-1 font-body text-xs font-500 uppercase tracking-wide text-secondary">Before</p>
                  <p className="font-heading text-2xl font-700 text-primary">{result.original.bytesHuman}</p>
                  <div className="mx-auto mt-2 h-1.5 w-full overflow-hidden rounded-full bg-accent">
                    <div className="h-full bg-secondary" style={{ width: '100%' }} />
                  </div>
                </div>
                <div className="rounded-card border border-accentHover/40 bg-accentHover/10 p-4 text-center">
                  <p className="mb-1 font-body text-xs font-500 uppercase tracking-wide text-secondary">After</p>
                  <p className="font-heading text-2xl font-700 text-primary">{result.compressed.bytesHuman}</p>
                  <div className="mx-auto mt-2 h-1.5 w-full overflow-hidden rounded-full bg-accent">
                    <div
                      className="h-full bg-accentHover"
                      style={{ width: `${(result.compressed.bytes / result.original.bytes) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Arrow flow */}
              <div className="mb-4 flex items-center justify-center gap-3 text-secondary">
                <span className="font-body text-sm">{result.original.bytesHuman}</span>
                <ArrowRight size={16} strokeWidth={1.5} />
                <span className="font-body text-sm font-600 text-primary">{result.compressed.bytesHuman}</span>
              </div>

              {/* Preview of compressed */}
              <div className="mb-4 overflow-hidden rounded-card border border-line bg-accent/10">
                {result.compressed.format && result.compressed.format.match(/mp4|webm|mov/i) ? (
                  <video
                    src={result.compressed.url}
                    controls
                    className="max-h-48 w-full object-contain"
                  />
                ) : (
                  <img
                    src={result.compressed.url}
                    alt="Compressed"
                    className="max-h-48 w-full object-contain"
                  />
                )}
              </div>

              {/* Download Button */}
              <a href={result.compressed.url} download target="_blank" rel="noopener noreferrer">
                <AdminButton className="w-full">
                  <Download size={16} strokeWidth={1.5} />
                  Download Compressed File
                </AdminButton>
              </a>

              <button
                onClick={handleReset}
                className="mt-3 w-full font-body text-sm text-secondary hover:underline"
              >
                Compress another file
              </button>
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
