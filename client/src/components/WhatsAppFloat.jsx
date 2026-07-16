import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import api from '../api/axios';
import useFetch from '../hooks/useFetch';

export default function WhatsAppFloat() {
  const { data: content } = useFetch(
    () => api.get('/api/content').then((r) => r.data)
  );

  const [showTooltip, setShowTooltip] = useState(false);

  const whatsapp = content?.whatsapp || '+91-9876543210';
  const cleanPhone = whatsapp.replace(/[^0-9]/g, '');

  useEffect(() => {
    // Show tooltip after 3 seconds
    const timer = setTimeout(() => setShowTooltip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
      {/* Tooltip */}
      {showTooltip && (
        <div className="relative mb-2 hidden rounded-card bg-primary px-4 py-3 shadow-card sm:block">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accentHover text-primary"
            aria-label="Close"
          >
            <X size={12} />
          </button>
          <p className="font-body text-sm font-500 text-white">
            Have a question? Let&apos;s chat!
          </p>
        </div>
      )}

      {/* Button */}
      <a
        href={`https://wa.me/${cleanPhone}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-card transition-all duration-300 hover:scale-110 hover:bg-accentHover hover:text-primary"
      >
        <MessageCircle size={26} fill="white" strokeWidth={1.5} />
      </a>
    </div>
  );
}
