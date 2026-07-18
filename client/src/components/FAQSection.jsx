import React, { useState, useRef, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import api from '../api/axios';
import useFetch from '../hooks/useFetch';
import Skeleton from './Skeleton';

// Inject FAQ structured data so Google can show rich snippets in search results
const FAQ_SCHEMA_ID = 'faq-schema-dynamic';
function injectFAQSchema(faqs) {
  const existing = document.getElementById(FAQ_SCHEMA_ID);
  if (existing) existing.remove();
  if (!faqs || !faqs.length) return;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = FAQ_SCHEMA_ID;
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer }
    }))
  });
  document.head.appendChild(script);
}

const FALLBACK_FAQS = [
  {
    question: 'How far in advance should I book?',
    answer:
      'We recommend booking at least 2-3 months in advance, especially during wedding season (October-February).'
  },
  {
    question: 'Do you offer a trial session?',
    answer:
      'Yes! We offer trial sessions so you can experience the look before your big day. Contact us to schedule one.'
  },
  {
    question: 'What products do you use?',
    answer:
      'We use high-quality, skin-friendly products from premium brands like MAC, Huda Beauty, and NARS.'
  },
  {
    question: 'Do you travel for destination weddings?',
    answer:
      'Yes, we travel for destination weddings. Travel and accommodation charges may apply.'
  },
  {
    question: 'Is hair styling included in the package?',
    answer:
      'Hair styling and draping can be included in bridal packages. Please contact us for detailed pricing.'
  },
  {
    question: 'What is the payment and cancellation policy?',
    answer:
      'A 50% advance is required to confirm the booking. Cancellations made 30+ days in advance receive a full refund of the advance.'
  }
];

function FAQItem({ faq, isOpen, onToggle }) {
  const contentRef = useRef(null);

  return (
    <div className="overflow-hidden border-b border-line">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-heading text-lg font-600 text-primary">
          {faq.question}
        </span>
        <span className="flex-shrink-0 text-primary">
          {isOpen ? <Minus size={20} /> : <Plus size={20} />}
        </span>
      </button>
      <div
        ref={contentRef}
        className="grid transition-all duration-300 ease-in-out"
        style={{
          gridTemplateRows: isOpen ? '1fr' : '0fr'
        }}
      >
        <div className="overflow-hidden">
          <p className="pb-5 font-body text-base leading-[1.8] text-secondary">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const { data: faqs, loading, error } = useFetch(
    () => api.get('/api/faqs').then((r) => r.data)
  );

  const items = faqs && faqs.length ? faqs : FALLBACK_FAQS;

  // Keep Google's FAQ rich-snippet in sync with whatever is displayed
  useEffect(() => {
    injectFAQSchema(items);
    return () => {
      const el = document.getElementById(FAQ_SCHEMA_ID);
      if (el) el.remove();
    };
  }, [items]);

  if (error) return null;

  return (
    <section id="faq" className="bg-card py-24">
      <div className="container-lux">
        <div className="reveal mx-auto mb-16 max-w-2xl text-center">
          <p className="font-body text-sm font-500 tracking-[0.2em] text-secondary uppercase">
            FAQ
          </p>
          <h2 className="mt-4 font-heading text-4xl font-600 text-primary sm:text-5xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="reveal mx-auto max-w-[780px]">
          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-card border border-line bg-base px-8">
              {items.map((faq, i) => (
                <FAQItem
                  key={faq._id || i}
                  faq={faq}
                  isOpen={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
