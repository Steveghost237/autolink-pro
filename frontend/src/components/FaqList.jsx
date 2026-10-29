import React, { useState } from 'react';
import Icon from './Icon';
import { uiText } from '../i18n';

const t = (text) => uiText('components.FaqList', text);

export default function FaqList({ items, numbered = true }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div key={item.q} className="rounded-xl bg-surface-container-lowest dark:bg-slate-800 border border-outline-variant/30 dark:border-slate-700 overflow-hidden">
          <button onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}
            className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left font-headline-sm text-headline-sm text-on-surface dark:text-white">
            <span>{numbered ? `${index + 1}. ` : ''}{t(item.q)}</span>
            <Icon name="expand_more" className={`transition-transform ${open === index ? 'rotate-180 text-primary' : 'text-on-surface-variant'}`} />
          </button>
          {open === index && <p className="px-5 pb-5 font-body-lg text-body-lg text-on-surface-variant dark:text-slate-300">{t(item.a)}</p>}
        </div>
      ))}
    </div>
  );
}
