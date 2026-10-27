import React from 'react';

/** Icône Material Symbols (iconographie du design system AutoLink Pro). */
export default function Icon({ name, size = 20, fill = false, className = '', title }) {
  return (
    <span
      aria-hidden={title ? undefined : true}
      title={title}
      className={`material-symbols-outlined select-none ${fill ? 'icon-fill' : ''} ${className}`}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  );
}
