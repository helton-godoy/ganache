"use client";

import React, { useEffect, useRef } from "react";
import { SecurityEvent, SecuritySeverity } from "../../../types/security";

interface EventTimelineProps {
  events: SecurityEvent[];
}

const getSeverityColor = (severity: SecuritySeverity) => {
  switch (severity) {
    case SecuritySeverity.CRITICAL:
      return "bg-red-50 border-red-200 text-red-700";
    case SecuritySeverity.WARNING:
      return "bg-yellow-50 border-yellow-200 text-yellow-700";
    case SecuritySeverity.INFO:
    default:
      return "bg-blue-50 border-blue-200 text-blue-700";
  }
};

export const EventTimeline: React.FC<EventTimelineProps> = ({ events }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new events arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [events]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">
          Security Event Feed
        </h3>
        <p className="text-sm text-gray-500">
          Real-time monitoring of system activities
        </p>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            Waiting for events...
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`p-3 rounded border ${getSeverityColor(event.severity)} transition-all duration-300 animate-fade-in-down`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm uppercase tracking-wide px-2 py-0.5 rounded bg-white bg-opacity-50">
                      {event.event_type.replace("_", " ")}
                    </span>
                    <span className="text-xs opacity-75">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1 font-medium">{event.action}</p>
                </div>
                {(event.source_ip || event.user) && (
                  <div className="text-right text-xs opacity-80">
                    {event.user && (
                      <div>
                        User: <span className="font-mono">{event.user}</span>
                      </div>
                    )}
                    {event.source_ip && (
                      <div>
                        IP: <span className="font-mono">{event.source_ip}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
