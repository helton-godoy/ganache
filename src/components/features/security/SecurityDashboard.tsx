"use client";

import React from "react";
import { useSecurityEvents } from "../../../hooks/useSecurityEvents";
import {
  SecurityAlert,
  SecurityEvent,
  SecurityMetrics as SecurityMetricsType,
} from "../../../types/security";
import { EventTimeline } from "./EventTimeline";
import { SecurityMetrics } from "./SecurityMetrics";

interface SecurityDashboardProps {
  initialEvents?: SecurityEvent[];
  initialMetrics?: SecurityMetricsType;
  initialAlerts?: SecurityAlert[];
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  initialEvents,
  initialMetrics,
  initialAlerts,
}) => {
  const { events, metrics, isConnected } = useSecurityEvents({
    events: initialEvents,
    metrics: initialMetrics,
    alerts: initialAlerts,
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Security Monitor
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time threat detection and system audit
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isConnected
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              {isConnected ? "Live Connected" : "Disconnected"}
            </div>
          </div>
        </header>

        <SecurityMetrics metrics={metrics} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EventTimeline events={events} />
          </div>
          <div className="space-y-6">
            {/* Placeholder for future widgets like Top IPs, Threat Map, etc. */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-gray-700 mb-3">
                System Status
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service Status</span>
                  <span className="text-green-600 font-medium">Healthy</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Scan</span>
                  <span className="text-gray-700">2 mins ago</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Active Policies</span>
                  <span className="text-gray-700">24</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
