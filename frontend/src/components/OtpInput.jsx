import React, { useRef } from 'react';

/** Saisie du code à 6 chiffres (une case par chiffre, collage supporté). */
export default function OtpInput({ value, onChange, length = 6, autoFocus = true }) {
  const refs = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const update = (index, char) => {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join('').slice(0, length));
  };

  const handleChange = (index, e) => {
    const input = e.target.value.replace(/\D/g, '');
    if (input.length > 1) {
      onChange(input.slice(0, length));
      refs.current[Math.min(input.length, length) - 1]?.focus();
      return;
    }
    update(index, input);
    if (input && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      update(index - 1, '');
      refs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < length - 1) refs.current[index + 1]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" role="group">
      {digits.map((digit, index) => (
        <input key={index} ref={(el) => { refs.current[index] = el; }}
          type="text" inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} maxLength={length}
          autoFocus={autoFocus && index === 0} value={digit}
          aria-label={`Chiffre ${index + 1}`}
          onChange={(e) => handleChange(index, e)} onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-14 sm:w-12 sm:h-16 rounded-xl border-2 text-center font-headline-lg text-headline-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 bg-surface-container-lowest dark:bg-slate-900 dark:text-white ${digit ? 'border-primary' : 'border-outline-variant'}`} />
      ))}
    </div>
  );
}
