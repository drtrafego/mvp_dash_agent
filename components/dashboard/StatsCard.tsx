interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "blue" | "green" | "purple" | "orange" | "gray";
  icon?: string;
}

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200",
  green: "bg-green-50 border-green-200",
  purple: "bg-purple-50 border-purple-200",
  orange: "bg-orange-50 border-orange-200",
  gray: "bg-gray-50 border-gray-200",
};
const textMap: Record<string, string> = {
  blue: "text-blue-700", green: "text-green-700",
  purple: "text-purple-700", orange: "text-orange-700", gray: "text-gray-700",
};

export default function StatsCard({ title, value, subtitle, color = "blue", icon }: StatsCardProps) {
  return (
    <div className={`rounded-2xl border p-6 ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${textMap[color]}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {icon && <span className="text-2xl ml-3">{icon}</span>}
      </div>
    </div>
  );
}
