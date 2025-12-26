"use client";

import { useState } from "react";
import { AuditSearch } from "../../components/features/security/AuditSearch";
import { SecurityEvent } from "../../types/security";

/**
 * Audit Dashboard Page
 *
 * @description Main page for audit log search and compliance reporting
 * @ref Story-5.2 - Visual audit manager dashboard
 */
export default function AuditPage() {
  const [results, setResults] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (
    filename: string,
    user?: string,
    dateFrom?: string,
    dateTo?: string,
  ) => {
    setIsLoading(true);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("resource", filename);
      params.append("event_type", "file_access");

      if (user) params.append("user", user);
      if (dateFrom)
        params.append("date_from", new Date(dateFrom).toISOString());
      if (dateTo) params.append("date_to", new Date(dateTo).toISOString());
      params.append("limit", "1000");

      const response = await fetch(
        `/api/v1/security/events?${params.toString()}`,
        {
          headers: {
            "X-Auth-User": "admin", // In production, this would come from auth context
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const events: SecurityEvent[] = await response.json();
      setResults(events);
    } catch (error) {
      console.error("Audit search error:", error);
      alert(
        `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Audit Manager</h1>
          <p className="text-gray-600 mt-1">
            Search file access logs for compliance and security audits
          </p>
        </header>

        <AuditSearch
          onSearch={handleSearch}
          results={results}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
