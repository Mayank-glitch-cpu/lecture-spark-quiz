
import { Card } from "../ui/card";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

const MetricCard = ({ title, value, icon, description, trend, trendValue }: MetricCardProps) => {
  return (
    <Card className="metric-card">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold">{value}</p>
            {trendValue && (
              <span className={`ml-2 text-xs font-medium ${
                trend === "up" ? "text-green-600" : 
                trend === "down" ? "text-red-600" : "text-gray-500"
              }`}>
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
              </span>
            )}
          </div>
          {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
        <div className="p-2 rounded-full bg-quiz-lavender/30">
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;
