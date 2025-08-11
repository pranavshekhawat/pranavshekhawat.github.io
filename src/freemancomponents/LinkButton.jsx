import React from 'react';

export default function LinkButton({
  children,
  onClick,
  color = 'blue',          // blue | green | red
  variant = 'link',        // link | solid
  disabled,
  className = '',
  ...rest
}) {
  const linkColors = {
    blue: '#2563eb',   // blue-600
    green: '#16a34a',  // green-600
    red: '#dc2626',    // red-600
  };
  const solidColors = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    green: 'bg-green-600 hover:bg-green-700 text-white',
    red: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const base = 'transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  const linkBase = 'text-xs bg-transparent border-0 p-0 m-0 shadow-none';
  const solidBase = 'text-xs px-2 py-1 rounded';

const isSolid = variant === 'solid';
  const variantBase = isSolid ? solidBase : linkBase;

  // Apply inline style for link variant
    const inlineStyle = !isSolid
    ? {
        color: linkColors[color] || linkColors.blue,
        textDecoration: disabled ? 'none' : 'underline',
        opacity: disabled ? 0.5 : undefined,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }
    : undefined;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variantBase} ${isSolid ? (solidColors[color] || solidColors.blue) : ''} ${className}`}
      style={inlineStyle}
      {...rest}
    >
      {children}
    </button>
  );
}