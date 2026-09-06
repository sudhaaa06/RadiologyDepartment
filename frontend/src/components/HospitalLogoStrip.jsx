import React from 'react';

/**
 * Hospital partner logos — inline SVG icons so no external assets are needed.
 * Each logo renders at any size with perfect crisp quality.
 */

export const HOSPITALS = [
  {
    id: 'stmary',
    name: "St. Mary's Medical Centre",
    shortName: 'SMMC',
    location: 'New York, USA',
    specialty: 'Neuroradiology',
    color: '#06b6d4',
    Logo: ({ size = 40 }) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#0a1628" stroke="#06b6d4" strokeWidth="1.5" />
        {/* Cross */}
        <rect x="21" y="10" width="6" height="28" rx="2" fill="#06b6d4" />
        <rect x="10" y="21" width="28" height="6" rx="2" fill="#06b6d4" />
        {/* Heart center */}
        <path d="M24 26.5c0 0-4-2.8-4-5.2a2.2 2.2 0 014-1.3 2.2 2.2 0 014 1.3c0 2.4-4 5.2-4 5.2z" fill="#fff" opacity="0.9" />
      </svg>
    ),
  },
  {
    id: 'apollo',
    name: 'Apollo Radiology Institute',
    shortName: 'ARI',
    location: 'Chennai, India',
    specialty: 'Advanced Imaging',
    color: '#8b5cf6',
    Logo: ({ size = 40 }) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#0a1628" stroke="#8b5cf6" strokeWidth="1.5" />
        {/* Atom orbits */}
        <ellipse cx="24" cy="24" rx="14" ry="7" stroke="#8b5cf6" strokeWidth="1.5" fill="none" />
        <ellipse cx="24" cy="24" rx="14" ry="7" stroke="#8b5cf6" strokeWidth="1.5" fill="none" transform="rotate(60 24 24)" />
        <ellipse cx="24" cy="24" rx="14" ry="7" stroke="#8b5cf6" strokeWidth="1.5" fill="none" transform="rotate(120 24 24)" />
        {/* Nucleus */}
        <circle cx="24" cy="24" r="3.5" fill="#8b5cf6" />
        <circle cx="24" cy="24" r="2" fill="#fff" opacity="0.9" />
      </svg>
    ),
  },
  {
    id: 'national',
    name: 'National Health Institute',
    shortName: 'NHI',
    location: 'Washington D.C., USA',
    specialty: 'Research & Oncology',
    color: '#10b981',
    Logo: ({ size = 40 }) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#0a1628" stroke="#10b981" strokeWidth="1.5" />
        {/* Shield */}
        <path d="M24 10L12 15v9c0 7 5.4 12.5 12 14 6.6-1.5 12-7 12-14v-9L24 10z" fill="#10b981" opacity="0.2" stroke="#10b981" strokeWidth="1.2" />
        {/* Cross on shield */}
        <rect x="21.5" y="17" width="5" height="14" rx="1.5" fill="#10b981" />
        <rect x="17" y="21.5" width="14" height="5" rx="1.5" fill="#10b981" />
        {/* Laurel dots */}
        <circle cx="10" cy="24" r="1.5" fill="#10b981" opacity="0.6" />
        <circle cx="38" cy="24" r="1.5" fill="#10b981" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: 'citygeneral',
    name: 'City General Hospital',
    shortName: 'CGH',
    location: 'London, UK',
    specialty: 'Trauma & Emergency',
    color: '#f59e0b',
    Logo: ({ size = 40 }) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#0a1628" stroke="#f59e0b" strokeWidth="1.5" />
        {/* Building silhouette */}
        <rect x="16" y="22" width="16" height="16" rx="1" fill="#f59e0b" opacity="0.3" stroke="#f59e0b" strokeWidth="1" />
        <rect x="19" y="16" width="10" height="8" rx="1" fill="#f59e0b" opacity="0.4" stroke="#f59e0b" strokeWidth="1" />
        <rect x="22" y="12" width="4" height="6" rx="1" fill="#f59e0b" opacity="0.5" stroke="#f59e0b" strokeWidth="1" />
        {/* Cross on top */}
        <rect x="23" y="8" width="2" height="6" rx="0.5" fill="#f59e0b" />
        <rect x="21" y="10" width="6" height="2" rx="0.5" fill="#f59e0b" />
        {/* Windows */}
        <rect x="18" y="25" width="3" height="3" rx="0.5" fill="#f59e0b" opacity="0.8" />
        <rect x="23" y="25" width="3" height="3" rx="0.5" fill="#f59e0b" opacity="0.8" />
        <rect x="28" y="25" width="3" height="3" rx="0.5" fill="#f59e0b" opacity="0.8" />
      </svg>
    ),
  },
  {
    id: 'lakeside',
    name: 'Lakeside Medical Center',
    shortName: 'LMC',
    location: 'Toronto, Canada',
    specialty: 'Musculoskeletal',
    color: '#14b8a6',
    Logo: ({ size = 40 }) => (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#0a1628" stroke="#14b8a6" strokeWidth="1.5" />
        {/* Wave */}
        <path d="M10 26 Q14 20 18 26 Q22 32 26 26 Q30 20 34 26 Q36 29 38 26" stroke="#14b8a6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M10 30 Q14 24 18 30 Q22 36 26 30 Q30 24 34 30 Q36 33 38 30" stroke="#14b8a6" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
        {/* Cross above wave */}
        <rect x="22" y="12" width="4" height="10" rx="1.5" fill="#14b8a6" />
        <rect x="18" y="15" width="12" height="4" rx="1.5" fill="#14b8a6" />
      </svg>
    ),
  },
];

/**
 * Horizontal logo strip — used on Login/Register hero panel and Dashboard.
 * `variant`: 'compact' (small icons + name) | 'full' (icon + name + location + specialty)
 */
export default function HospitalLogoStrip({ variant = 'compact' }) {
  if (variant === 'full') {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '0.85rem',
      }}>
        {HOSPITALS.map(({ id, name, shortName, location, specialty, color, Logo }) => (
          <div
            key={id}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${color}30`,
              borderRadius: '0.6rem',
              padding: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color + '70'; e.currentTarget.style.background = color + '10'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = color + '30'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Logo size={38} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.72rem', color: '#f8fafc', lineHeight: 1.3 }}>{name}</div>
                <div style={{ fontSize: '0.62rem', color: color, fontWeight: 600 }}>{shortName}</div>
              </div>
            </div>
            <div style={{ paddingLeft: '0.25rem' }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)' }}>📍 {location}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.1rem' }}>🩻 {specialty}</div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: color + '15',
              borderRadius: '0.3rem',
              padding: '0.2rem 0.4rem',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 4px #10b981' }} />
              <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 600 }}>CONNECTED</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // compact horizontal strip
  return (
    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
      {HOSPITALS.map(({ id, name, shortName, color, Logo }) => (
        <div
          key={id}
          title={name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${color}35`,
            borderRadius: '0.4rem',
            padding: '0.3rem 0.55rem',
            cursor: 'default',
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = color + '18'; e.currentTarget.style.borderColor = color + '65'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = color + '35'; }}
        >
          <Logo size={22} />
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color, whiteSpace: 'nowrap' }}>{shortName}</span>
        </div>
      ))}
    </div>
  );
}
