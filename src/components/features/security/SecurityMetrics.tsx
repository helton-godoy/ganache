import React from "react";
import { SecurityMetrics as MetricsType } from "../../../types/security";

interface SecurityMetricsProps {
  metrics: MetricsType;
}

export const SecurityMetrics: React.FC<SecurityMetricsProps> = ({
  metrics,
}) => {
  const cards = [
    {
      title: "Events / Minute",
      value: metrics.events_per_minute.toFixed(1),
      color: "bg-blue-500",
      textColor: "text-blue-500",
    },
    {
      title: "Active Users",
      value: metrics.active_users.length,
      color: "bg-green-500",
      textColor: "text-green-500",
    },
    {
      title: "Suspicious IPs",
      value: metrics.suspicious_ips.length,
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
    },
    {
      title: "Critical Events",
      value: metrics.critical_alerts,
      color: "bg-red-500",
      textColor: "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow p-4 border-l-4"
          style={{ borderColor: `var(--${card.color.replace("bg-", "")})` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                {card.title}
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${card.textColor}`}>
                {card.value}
              </h3>
            </div>
            <div className={`p-3 rounded-full opacity-10 ${card.color}`}>
              {/* Icon placeholder */}
              <div className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
