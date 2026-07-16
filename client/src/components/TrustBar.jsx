import React from 'react';
import { Diamond, Clock, Camera, Heart } from 'lucide-react';

const ITEMS = [
  {
    icon: Diamond,
    label:       'Luxury Products',
    description: 'Premium brands for a flawless finish'
  },
  {
    icon: Clock,
    label:       'On-Time Service',
    description: 'Punctual and reliable on your big day'
  },
  {
    icon: Camera,
    label:       'Camera-Ready',
    description: 'Looks that shine in every photograph'
  },
  {
    icon: Heart,
    label:       'Personalised Care',
    description: 'Every look tailored to you'
  }
];

export default function TrustBar() {
  return (
    <section className="border-y border-line bg-base py-14">
      <div className="container-lux">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {ITEMS.map((item, i) => (
            <div
              key={item.label}
              className="reveal flex flex-col items-center text-center"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                <item.icon size={26} className="text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="font-heading text-lg font-600 text-primary">
                {item.label}
              </h3>
              <p className="mt-1 font-body text-sm text-secondary">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
