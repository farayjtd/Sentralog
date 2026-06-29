import { Platform } from 'react-native'

/** Neutral canvas — cool, calm, instrument-panel feel. */
export const c = {
  bg: '#f5f6f8',
  surface: '#ffffff',
  surfaceAlt: '#fafbfc',
  ink: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  faint: '#94a3b8',
  line: '#e8ebf0',
  lineSoft: '#f1f3f6',
  ok: '#059669', okSoft: '#ecfdf5',
  warn: '#d97706', warnSoft: '#fffbeb',
  danger: '#dc2626', dangerSoft: '#fef2f2',
  info: '#2563eb', infoSoft: '#eff6ff',
}

/** 4px spacing scale. */
export const sp = (n: number) => n * 4

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 }

export const shadow = (level: 1 | 2 | 3 = 1) => {
  const presets = {
    1: { e: 1, o: 0.05, r: 6, y: 1 },
    2: { e: 3, o: 0.07, r: 14, y: 4 },
    3: { e: 6, o: 0.10, r: 26, y: 10 },
  } as const
  const p = presets[level]
  if (Platform.OS === 'web') {
    return { boxShadow: `0px ${p.y}px ${p.r}px rgba(15,23,42,${p.o})` } as any
  }
  return {
    elevation: p.e,
    shadowColor: '#0f172a',
    shadowOpacity: p.o,
    shadowRadius: p.r,
    shadowOffset: { width: 0, height: p.y },
  }
}

export const font = {
  display: 30, h1: 22, h2: 17, h3: 15, body: 14, small: 13, micro: 11,
}

export const numStyle = Platform.OS === 'web' ? ({ fontVariant: ['tabular-nums'] } as any) : {}
