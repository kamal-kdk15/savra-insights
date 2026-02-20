interface StatsCardProps {
  label:     string;
  value:     number | string;
  icon:      React.ReactNode;
  color:     "violet" | "blue" | "green" | "amber" | "rose";
  subtitle?: string;
}

const COLOR_MAP = {
  violet: { bg: "bg-violet-50",  iconWrap: "bg-violet-100 text-violet-600"  },
  blue:   { bg: "bg-blue-50",    iconWrap: "bg-blue-100 text-blue-600"      },
  green:  { bg: "bg-emerald-50", iconWrap: "bg-emerald-100 text-emerald-600"},
  amber:  { bg: "bg-amber-50",   iconWrap: "bg-amber-100 text-amber-600"    },
  rose:   { bg: "bg-rose-50",    iconWrap: "bg-rose-100 text-rose-600"      },
};

export function StatsCard({ label, value, icon, color, subtitle }: StatsCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div className={`${c.bg} rounded-2xl p-5 flex items-start gap-4`}>
      <div className={`${c.iconWrap} p-2.5 rounded-xl flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600 mt-0.5">{label}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
