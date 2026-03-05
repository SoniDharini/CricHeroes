import { useTheme } from '../context/ThemeContext';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  const { theme } = useTheme();
  
  if (!active || !payload || !payload.length) {
    return null;
  }
  
  const isDark = theme === 'dark';
  
  return (
    <div
      className="rounded-lg p-3 shadow-lg border"
      style={{
        backgroundColor: isDark ? '#1e293b' : 'white',
        borderColor: isDark ? '#475569' : '#e5e7eb',
      }}
    >
      {label && (
        <p className="text-sm font-medium mb-1" style={{ color: isDark ? '#f1f5f9' : '#111827' }}>
          {label}
        </p>
      )}
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color || (isDark ? '#f1f5f9' : '#111827') }}>
          {entry.name && <span className="font-medium">{entry.name}: </span>}
          {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
        </p>
      ))}
    </div>
  );
}
