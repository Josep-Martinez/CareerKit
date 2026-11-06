import React from 'react'

export function SectionIcon({ name }) {
  const common = {
    className: 'section-icon-svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: false,
  }
  if (name === 'home')
    return (
      <svg {...common}>
        <path d="m3.5 10 8.5-6.5 8.5 6.5" />
        <path d="M5.5 9v11h13V9M9.5 20v-6h5v6" />
      </svg>
    )
  if (name === 'profile')
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.8 19a5.2 5.2 0 0 1 10.4 0M16 7.2h4.5M18.25 5v4.5" />
      </svg>
    )
  if (name === 'linkedin')
    return (
      <svg {...common}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
        <circle cx="8" cy="8" r=".9" fill="currentColor" stroke="none" />
        <path d="M7.2 11v5.6M10.8 16.6v-3.1a2 2 0 0 1 4 0v3.1M10.8 12.5V11" />
      </svg>
    )
  if (name === 'cv')
    return (
      <svg {...common}>
        <path d="M6 3.5h8l4 4V20H6z" />
        <path d="M14 3.5V8h4M9 12h6M9 15h6M9 18h4" />
      </svg>
    )
  if (name === 'prompts')
    return (
      <svg {...common}>
        <path d="M4 7.5h16v12H4z" />
        <path d="M4 13h4l1.5 2h5L16 13h4M8 4.5h8" />
      </svg>
    )
  return (
    <svg {...common}>
      <rect x="3.5" y="7.5" width="17" height="12.5" rx="2" />
      <path d="M8.5 7.5V5h7v2.5M3.5 12h17M10 12v2h4v-2" />
    </svg>
  )
}
