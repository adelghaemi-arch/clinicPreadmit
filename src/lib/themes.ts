export interface ThemeOption {
  id: string;
  label: string;
  hint: string;
  dark: boolean;
  swatch: string;
}

export const themeOptions: ThemeOption[] = [
  { id: 'clinic', label: 'مهر روشن', hint: 'تم اختصاصی کلینیک', dark: false, swatch: '#0f766e' },
  { id: 'clinicedark', label: 'مهر تاریک', hint: 'تم اختصاصی کلینیک', dark: true, swatch: '#2dd4bf' },
  { id: 'emerald', label: 'زمرد', hint: 'DaisyUI', dark: false, swatch: '#10b981' },
  { id: 'corporate', label: 'سازمانی', hint: 'DaisyUI', dark: false, swatch: '#4b6bfb' },
  { id: 'night', label: 'شب', hint: 'DaisyUI', dark: true, swatch: '#1e293b' },
  { id: 'dim', label: 'تیره ملایم', hint: 'DaisyUI', dark: true, swatch: '#2a303c' },
  { id: 'dracula', label: 'دراکولا', hint: 'DaisyUI', dark: true, swatch: '#ff79c6' },
];

export const DARK_THEMES = themeOptions.filter((t) => t.dark).map((t) => t.id);

export const isDarkTheme = (theme: string): boolean => DARK_THEMES.includes(theme);

export const oppositeTheme = (theme: string): string =>
  isDarkTheme(theme) ? 'clinic' : 'clinicedark';
