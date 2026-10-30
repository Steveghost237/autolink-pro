import React, { useRef } from 'react';

/* Saisie d'un code OTP en cases séparées — avance auto, retour arrière, collage. */
export default function OtpInput({ value, onChange, length = 6 }) {
  const refs = useRef([]);
  const digits = value.padEnd(length).slice(0, length).split('');

  const update = (i, raw) => {
    const ch = raw.replace(/\D/g, '');
    if (!ch) return;
    const next = (value.slice(0, i) + ch[ch.length - 1] + value.slice(i + 1)).slice(0, length);
    onChange(next);
    if (i < length - 1) refs.current[i + 1]?.focus();
  };

  const onKey = (i, e) => {
    if (e.key === 'Backspace') {
      const next = value.slice(0, i) + value.slice(i + 1);
      onChange(next);
      if (!digits[i] && i > 0) refs.current[i - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (text) {
      onChange(text);
      refs.current[Math.min(text.length, length - 1)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex justify-center gap-2.5" onPaste={onPaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={d.trim()}
          onChange={e => update(i, e.target.value)}
          onKeyDown={e => onKey(i, e)}
          onFocus={e => e.target.select()}
          autoFocus={i === 0}
          className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-black text-slate-900 border-2 border-slate-200 rounded-xl bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
        />
      ))}
    </div>
  );
}
