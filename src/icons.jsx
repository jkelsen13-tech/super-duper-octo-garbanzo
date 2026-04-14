// All SVG illustration icons used throughout Threshold.
// Dark-ink nav icons + gold-stroke method icons.

export const GOLD     = '#d4a017'
export const GOLD_SEL = '#5e2d99'

export const LeafIllustration = ({ size = 28, color = '#1a2e1a' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 28C16 28 13 24 12 20C11 16 12 12 16 8C20 12 21 16 20 20C19 24 16 28 16 28Z" strokeWidth="1.2" />
    <path d="M16 20C16 20 11 19 8 16C5 13 5 9 7 7C10 6 13 8 14 11C15 14 16 20 16 20Z" strokeWidth="1.1" />
    <path d="M16 20C16 20 21 19 24 16C27 13 27 9 25 7C22 6 19 8 18 11C17 14 16 20 16 20Z" strokeWidth="1.1" />
    <path d="M14 14C14 14 10 14 8 11C6 9 7 6 9 6C11 5 13 7 13 10C13.2 11.5 14 14 14 14Z" strokeWidth="0.9" />
    <path d="M18 14C18 14 22 14 24 11C26 9 25 6 23 6C21 5 19 7 19 10C18.8 11.5 18 14 18 14Z" strokeWidth="0.9" />
    <path d="M16 28V8" strokeWidth="0.8" />
    <path d="M15.5 22C15.5 22 13 21 11 19" strokeWidth="0.6" />
    <path d="M15 18C15 18 12 17 10 15" strokeWidth="0.6" />
    <path d="M14.5 14C14.5 14 12 13 10 11" strokeWidth="0.6" />
    <path d="M16.5 22C16.5 22 19 21 21 19" strokeWidth="0.6" />
    <path d="M17 18C17 18 20 17 22 15" strokeWidth="0.6" />
    <path d="M17.5 14C17.5 14 20 13 22 11" strokeWidth="0.6" />
    <path d="M16 28C16 28 15 30 16 31C17 30 16 28 16 28" strokeWidth="1" />
  </svg>
)

export const TrackerIllustration = ({ size = 28, color = '#1a2e1a' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3C23.2 3 29 8.8 29 16C29 23.2 23.2 29 16 29C8.8 29 3 23.2 3 16C3 8.8 8.8 3 16 3Z" strokeWidth="1.1" />
    <path d="M16 4V6.5M16 25.5V28M4 16H6.5M25.5 16H28" strokeWidth="1" />
    <path d="M8.5 6.5L9.8 8.5M22.2 23.5L23.5 25.5M6.5 23.5L8.5 22.2M23.5 6.5L22.2 8.5" strokeWidth="0.8" />
    <path d="M16 8C20.4 8 24 11.6 24 16C24 20.4 20.4 24 16 24C11.6 24 8 20.4 8 16C8 11.6 11.6 8 16 8Z" strokeWidth="0.9" />
    <path d="M16 11C18.8 11 21 13.2 21 16C21 18.8 18.8 21 16 21C13.2 21 11 18.8 11 16C11 13.2 13.2 11 16 11Z" strokeWidth="1" />
    <circle cx="16" cy="16" r="2.5" strokeWidth="1.2" />
    <circle cx="17" cy="15" r="0.6" fill={color} stroke="none" />
    <path d="M13 14C13.5 13 15 12.5 16 12.5" strokeWidth="0.5" />
    <path d="M13 18C13.5 19 15 19.5 16 19.5" strokeWidth="0.5" />
  </svg>
)

export const ScheduleIllustration = ({ size = 28, color = '#1a2e1a' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7C4 6 5 5 6 5H26C27 5 28 6 28 7V27C28 28 27 29 26 29H6C5 29 4 28 4 27V7Z" strokeWidth="1.2" />
    <path d="M4 11H28" strokeWidth="1" />
    <path d="M10 3V7M22 3V7" strokeWidth="1.3" />
    <circle cx="9"  cy="15" r="0.8" fill={color} stroke="none" />
    <circle cx="13" cy="15" r="0.8" fill={color} stroke="none" />
    <circle cx="17" cy="15" r="0.8" fill={color} stroke="none" />
    <circle cx="21" cy="15" r="0.8" fill={color} stroke="none" />
    <circle cx="25" cy="15" r="0.8" fill={color} stroke="none" />
    <circle cx="9"  cy="19" r="0.8" fill={color} stroke="none" />
    <circle cx="13" cy="19" r="0.8" fill={color} stroke="none" />
    <circle cx="21" cy="19" r="0.8" fill={color} stroke="none" />
    <circle cx="25" cy="19" r="0.8" fill={color} stroke="none" />
    <path d="M15 17.5C15 17.5 15 19 17 19C19 19 19 17.5 19 17.5C19 16 18 15.5 17 15.5C16 15.5 15 16 15 17.5Z" strokeWidth="0.8" />
  </svg>
)

export const SavingsIllustration = ({ size = 28, color = '#1a2e1a' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3C23.2 3 29 8.8 29 16C29 23.2 23.2 29 16 29C8.8 29 3 23.2 3 16C3 8.8 8.8 3 16 3Z" strokeWidth="1.3" />
    <path d="M16 6C21.5 6 26 10.5 26 16C26 21.5 21.5 26 16 26C10.5 26 6 21.5 6 16C6 10.5 10.5 6 16 6Z" strokeWidth="0.8" />
    <path d="M16 9.5V22.5" strokeWidth="1" />
    <path d="M13 12.5C13 12.5 13 11 16 11C19 11 19 12.5 19 13.5C19 15 17.5 15.5 16 16C14.5 16.5 13 17 13 18.5C13 20 14 21 16 21C18 21 19 19.5 19 19.5" strokeWidth="1.1" />
  </svg>
)

export const SmokeIllustration = ({ size = 28, color = '#1a2e1a' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 18C5 18 5 14 16 14C27 14 27 18 27 18C27 22 22 26 16 26C10 26 5 22 5 18Z" strokeWidth="1.2" />
    <path d="M9 18C9 18 9 16 16 16C23 16 23 18 23 18C23 20.5 20 23 16 23C12 23 9 20.5 9 18Z" strokeWidth="0.9" />
    <path d="M16 14C16 14 15 12 15.5 10C16 8 17 7.5 17 9C17 10.5 16 14 16 14" strokeWidth="0.8" strokeDasharray="0.7 0.6" />
    <path d="M13 14C13 14 12 12 12.5 10C13 8.5 14 8 14 9.5C14 11 13 14 13 14" strokeWidth="0.7" strokeDasharray="0.7 0.7" />
    <path d="M19 14C19 14 20 12 19.5 10C19 8.5 18 8 18 9.5C18 11 19 14 19 14" strokeWidth="0.7" strokeDasharray="0.7 0.7" />
    <path d="M12 18C12 17 14 16.5 16 16.5C18 16.5 20 17 20 18C20 19 18 20 16 20C14 20 12 19 12 18Z" strokeWidth="0.7" />
  </svg>
)

export const HeartIllustration = ({ size = 18, color = '#1a2e1a', filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21C12 21 3 15.5 3 9.5C3 6.5 5.5 4.5 8 4.5C9.5 4.5 11 5.5 12 7C13 5.5 14.5 4.5 16 4.5C18.5 4.5 21 6.5 21 9.5C21 15.5 12 21 12 21Z" strokeWidth="1.3" />
  </svg>
)

export const CommentIllustration = ({ size = 18, color = '#1a2e1a' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4C4 3.4 4.5 3 5 3H19C19.5 3 20 3.4 20 4V14C20 14.6 19.5 15 19 15H8L4 19V4Z" strokeWidth="1.3" />
    <path d="M7 7H17M7 10H14M7 13H11" strokeWidth="0.8" />
  </svg>
)

export const ShareIllustration = ({ size = 18, color = '#1a2e1a' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11L15 6M15 6H11M15 6V10" strokeWidth="1.3" />
    <path d="M5 17V19C5 20 6 21 7 21H17C18 21 19 20 19 19V10" strokeWidth="1.2" />
    <path d="M5 13V17M5 13C5 11.5 6 10.5 7.5 10.5H9" strokeWidth="1.1" />
  </svg>
)

export const BellIllustration = ({ size = 20, color = '#1a2e1a' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.5 17C5.5 17 6 15.5 6 13V10C6 7 8.5 5 12 5C15.5 5 18 7 18 10V13C18 15.5 18.5 17 18.5 17H5.5Z" strokeWidth="1.2" />
    <path d="M10 17C10 17 10 19 12 19C14 19 14 17 14 17" strokeWidth="1.1" />
    <path d="M12 5V3.5" strokeWidth="1.1" />
  </svg>
)

// ── Method icons (gold stroke) ───────────────────────────────

export const FlowerMethodIcon = ({ size = 18, color = GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 19C16 19 14 17 14 14.5C14 12 15 11 16 11C17 11 18 12 18 14.5C18 17 16 19 16 19Z" strokeWidth="1" />
    <path d="M16 19C16 19 13 18 11.5 15.8C10 13.5 10.5 12 11.5 11.5C12.5 11 14 11.8 14.5 14C15 16 16 19 16 19Z" strokeWidth="1" />
    <path d="M16 19C16 19 19 18 20.5 15.8C22 13.5 21.5 12 20.5 11.5C19.5 11 18 11.8 17.5 14C17 16 16 19 16 19Z" strokeWidth="1" />
    <path d="M16 19C16 19 13.5 20 12 18C10.5 16 11 14.5 12 14C13 13.5 14.5 14.5 15 17C15.5 18.5 16 19 16 19Z" strokeWidth="0.9" />
    <path d="M16 19C16 19 18.5 20 20 18C21.5 16 21 14.5 20 14C19 13.5 17.5 14.5 17 17C16.5 18.5 16 19 16 19Z" strokeWidth="0.9" />
    <circle cx="16" cy="16" r="2.8" strokeWidth="1.1" />
    <circle cx="16" cy="16" r="1.2" strokeWidth="0.8" />
    <circle cx="15" cy="15" r="0.4" fill={color} stroke="none" />
    <circle cx="17" cy="15" r="0.4" fill={color} stroke="none" />
    <circle cx="16" cy="17" r="0.4" fill={color} stroke="none" />
    <path d="M16 29V20M16 26C16 26 13 25.5 12 23.5C11.5 22 12.5 21 14 21.5C15 22 15.5 23.5 16 24" strokeWidth="0.9" />
    <path d="M16 24C16 24 19 23.5 20 21.5C20.5 20 19.5 19 18 19.5C17 20 16.5 21.5 16 22" strokeWidth="0.9" />
  </svg>
)

export const PreRollMethodIcon = ({ size = 18, color = GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 24C8 24 7 25.5 8 26.5C9 27.5 10.5 27 11 26L23 8C23 8 23.5 6.5 22.5 5.5C21.5 4.5 20 5 19.5 6L8 24Z" strokeWidth="1.2" />
    <path d="M22 6C22 6 23.5 4.5 24.5 5C25.5 5.5 25 7 25 7C25 7 24 5.8 22.8 6.5C22.3 6.8 22 6 22 6Z" strokeWidth="0.9" />
    <path d="M12 22C12.8 21 13.5 20.5 14 21M14 19C14.8 18 15.5 17.5 16 18M16 16C16.8 15 17.5 14.5 18 15M18 13C18.8 12 19.5 11.5 20 12" strokeWidth="0.6" />
  </svg>
)

export const DabMethodIcon = ({ size = 18, color = GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 29C10 29 7 24.5 7 21C7 16 11 13.5 11 13.5C11 13.5 10 17 13 18C13 18 10 14.5 13 10C13 10 14 14 16.5 14C16.5 14 14 11.5 15 7C15 7 22 11 22 18C22 18 23.5 16 23 14C23 14 26 17 26 21C26 25.5 22 29 16 29Z" strokeWidth="1.2" />
    <path d="M16 26C13 26 11.5 23.5 11.5 21.5C11.5 19 13.5 17.5 13.5 17.5C13.5 19 15 19.5 15 19.5C14 18 14.5 16 16 15C17.5 16 18 17.5 17 19C17 19 18.5 18.5 18.5 17.5C18.5 17.5 21 19 20.5 22C20 24.5 18.5 26 16 26Z" strokeWidth="0.9" />
    <path d="M16 24C14.8 24 14 22.8 14 22C14 20.5 16 19 16 19C16 19 18 20.5 18 22C18 22.8 17.2 24 16 24Z" strokeWidth="0.8" />
  </svg>
)

export const VapeMethodIcon = ({ size = 18, color = GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.5 4C13.5 3.2 14.2 2.5 16 2.5C17.8 2.5 18.5 3.2 18.5 4V7H13.5V4Z" strokeWidth="1.1" />
    <path d="M12 7H20V24C20 25.5 18.2 27 16 27C13.8 27 12 25.5 12 24V7Z" strokeWidth="1.2" />
    <path d="M13.5 9H18.5V18H13.5V9Z" strokeWidth="0.9" />
    <path d="M13.5 14H18.5" strokeWidth="0.7" strokeDasharray="1 0.5" />
    <path d="M20 11.5H21.5C22 11.5 22.5 12 22.5 12.5V14C22.5 14.5 22 15 21.5 15H20" strokeWidth="0.9" />
    <circle cx="15" cy="21" r="0.5" fill={color} stroke="none" />
    <circle cx="16" cy="21" r="0.5" fill={color} stroke="none" />
    <circle cx="17" cy="21" r="0.5" fill={color} stroke="none" />
  </svg>
)

export const EdibleMethodIcon = ({ size = 18, color = GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 14C10 14 8 15 8 18C8 22 11 26 16 26C21 26 24 22 24 18C24 15 22 14 22 14" strokeWidth="1.2" />
    <path d="M11 14C11 10 13 7 16 7C19 7 21 10 21 14C21 16 20 17 16 17C12 17 11 16 11 14Z" strokeWidth="1.2" />
    <circle cx="13.5" cy="12.5" r="1.2" strokeWidth="0.9" />
    <circle cx="18.5" cy="12.5" r="1.2" strokeWidth="0.9" />
    <path d="M13.5 15C13.5 15 14.5 16 16 16C17.5 16 18.5 15 18.5 15" strokeWidth="0.9" />
    <circle cx="16" cy="21" r="1" strokeWidth="0.8" />
  </svg>
)

export const CapsuleMethodIcon = ({ size = 18, color = GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 16C10 16 10 10 16 10C22 10 22 16 22 16H10Z" strokeWidth="1.2" />
    <path d="M10 16C10 16 10 22 16 22C22 22 22 16 22 16H10Z" strokeWidth="1.2" />
    <path d="M10 16H22" strokeWidth="1" />
    <path d="M12 10C12.5 8 14 7 16 7C18 7 19.5 8 20 10" strokeWidth="0.9" />
    <path d="M12 22C12.5 24 14 25 16 25C18 25 19.5 24 20 22" strokeWidth="0.9" />
    <path d="M14.5 12.5H17.5M16 11V14" strokeWidth="0.7" />
  </svg>
)

export const SizeColumnIll = ({ h, color }) => (
  <svg width="24" height="34" viewBox="0 0 24 34" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 34H17" strokeWidth="1.2" />
    <rect x="9" y={34 - h - 4} width="6" height={h} rx="2.5" strokeWidth="1.1" />
    <path d={`M10 ${34 - h}H14`} strokeWidth="0.5" strokeDasharray="1 0.8" />
    <path d={`M10 ${34 - h + 3}H14`} strokeWidth="0.5" strokeDasharray="1 0.8" />
    <path d={`M12 ${34 - h - 4}C12 ${34 - h - 4} 11 ${34 - h - 7} 12 ${34 - h - 9}C13 ${34 - h - 11} 12 ${34 - h - 12} 12 ${34 - h - 12}`} strokeWidth="0.7" strokeDasharray="0.8 0.8" />
  </svg>
)

export const MapIllustration = ({ size = 28, color = '#1a2e1a' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4C11.6 4 8 7.6 8 12C8 18 16 28 16 28C16 28 24 18 24 12C24 7.6 20.4 4 16 4Z" strokeWidth="1.2" />
    <circle cx="16" cy="12" r="3.5" strokeWidth="1.1" />
    <path d="M5 22C5 22 9 20 16 20C23 20 27 22 27 22" strokeWidth="0.9" strokeDasharray="1.2 1" />
  </svg>
)

export const ALL_METHODS = [
  { key: 'flower',      Ill: FlowerMethodIcon },
  { key: 'pre-roll',    Ill: PreRollMethodIcon },
  { key: 'dab',         Ill: DabMethodIcon },
  { key: 'concentrate', Ill: DabMethodIcon },
  { key: 'vape',        Ill: VapeMethodIcon },
  { key: 'edible',      Ill: EdibleMethodIcon },
  { key: 'capsule',     Ill: CapsuleMethodIcon },
]

export const SIZE_OPTIONS = [
  { key: 'small',   label: 'small',   h: 14 },
  { key: 'medium',  label: 'medium',  h: 18 },
  { key: 'large',   label: 'large',   h: 22 },
  { key: 'massive', label: 'massive', h: 27 },
]
