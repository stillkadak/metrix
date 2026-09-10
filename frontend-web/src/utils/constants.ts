export const SEVERITY_COLORS: Record<string, 'error' | 'warning' | 'default'> = {
  critical: 'error',
  major: 'warning',
  minor: 'default',
};

export const SEVERITY_ORDER = ['critical', 'major', 'minor'];

export const ROLE_LABELS: Record<string, string> = {
  inspector: 'Inspector',
  authority: 'Authority',
  admin: 'Administrator',
  manufacturer: 'Manufacturer',
};

export const CHART_COLORS = {
  primary: '#14213D',
  secondary: '#9C6B1F',
  critical: '#B3261E',
  major: '#9C6B1F',
  minor: '#4A5268',
};
