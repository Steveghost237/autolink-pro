import React from 'react';
import Icon from './Icon';

/** Bandeau d'en-tête des pages publiques (Comment ça marche, Tarifs, Propriétaire, Aide). */
export default function PageHero({ badge, title, text, image, children }) {
  return (
    <section className="relative overflow-hidden bg-inverse-surface">
      {image && (
        <>
          <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-inverse-surface via-inverse-surface/85 to-inverse-surface/40" />
        </>
      )}
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="max-w-4xl flex flex-col gap-5">
        {badge && <span className="w-fit flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/80 text-on-primary font-label-sm text-label-sm uppercase tracking-wider"><Icon name="verified" size={16} />{badge}</span>}
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-surface-container-lowest">{title}</h1>
        {text && <p className="font-body-lg text-body-lg text-surface-variant max-w-2xl">{text}</p>}
        {children}
        </div>
      </div>
    </section>
  );
}
