import { useId } from 'react';
import { cx } from '../ui/utils';
import { faDigits, num } from '../../lib/utils';

export function TrendChart({
  data,
  height = 190,
  color = '#0f766e',
  suffix = '',
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  suffix?: string;
}) {
  const gradientId = useId().replace(/:/g, '');
  const width = 520;
  const padding = { top: 18, right: 10, bottom: 14, left: 10 };
  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const stepX = innerW / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => {
    const x = padding.left + i * stepX;
    const y = padding.top + innerH - ((d.value - min) / range) * innerH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1]?.x ?? 0},${height - padding.bottom} L${points[0]?.x ?? 0},${height - padding.bottom} Z`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
        role="img"
        aria-label="نمودار روند"
      >
        <defs>
          <linearGradient id={`grad-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + innerH * ratio}
            y2={padding.top + innerH * ratio}
            stroke="currentColor"
            className="text-base-content/10"
            strokeDasharray="4 6"
            strokeWidth="1"
          />
        ))}
        <path d={areaPath} fill={`url(#grad-${gradientId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {points.map((p) => (
          <circle key={p.label} cx={p.x} cy={p.y} r="3.2" fill="var(--fallback-b1, #fff)" stroke={color} strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between gap-1 px-1 text-[10px] text-base-content/45" dir="ltr">
        {data.map((d) => (
          <span key={d.label} className="truncate">
            {d.label}
          </span>
        ))}
      </div>
      <p className="mt-1 text-center text-[10px] text-base-content/35">
        بیشترین مقدار: {num(max)} {suffix}
      </p>
    </div>
  );
}

export function Donut({
  segments,
  size = 150,
  thickness = 16,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
  const radius = 50 - thickness / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="-rotate-90" width={size} height={size}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" className="text-base-content/5" strokeWidth={thickness} />
        {segments.map((segment) => {
          const length = (segment.value / total) * circumference;
          const dash = `${Math.max(length - 3, 0)} ${circumference}`;
          const element = (
            <circle
              key={segment.label}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={thickness}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
          offset += length;
          return element;
        })}
      </svg>
      <div className="absolute text-center">
        <p className="text-lg font-extrabold text-base-content">{centerValue}</p>
        <p className="text-[10px] text-base-content/50">{centerLabel}</p>
      </div>
    </div>
  );
}

export function DonutLegend({ segments, suffix = '' }: { segments: { label: string; value: number; color: string }[]; suffix?: string }) {
  return (
    <ul className="space-y-2">
      {segments.map((segment) => (
        <li key={segment.label} className="flex items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-2 text-base-content/70">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
            {segment.label}
          </span>
          <span className="font-semibold text-base-content">
            {faDigits(segment.value)}{suffix}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function HBar({
  label,
  value,
  max,
  color = 'bg-primary',
  suffix = '',
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
  suffix?: string;
}) {
  const pct = Math.round((value / (max || 1)) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-base-content/65">{label}</span>
        <span className="font-semibold text-base-content">
          {num(value)}
          {suffix}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-base-200">
        <div className={cx('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function SparkBars({ values, color = 'bg-primary' }: { values: number[]; color?: string }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-8 items-end gap-0.5">
      {values.map((v, i) => (
        <span
          key={i}
          className={cx('flex-1 rounded-sm opacity-80', color)}
          style={{ height: `${Math.max((v / max) * 100, 12)}%` }}
        />
      ))}
    </div>
  );
}
