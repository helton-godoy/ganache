"use client";

import { Clock, Download, FileText, MapPin, Search, User } from "lucide-react";
import React, { useState } from "react";
import { SecurityEvent } from "../../../types/security";

interface AuditSearchProps {
  onSearch: (
    filename: string,
    user?: string,
    dateFrom?: string,
    dateTo?: string,
  ) => void;
  results: SecurityEvent[];
  isLoading: boolean;
}

/**
 * Audit Search Component
 *
 * @description Provides search interface for file access audit logs
 * @ref Story-5.2 - Visual audit manager search UI
 */
export const AuditSearch: React.FC<AuditSearchProps> = ({
  onSearch,
  results,
  isLoading,
}) => {
  const [filename, setFilename] = useState("");
  const [user, setUser] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(
      filename,
      user || undefined,
      dateFrom || undefined,
      dateTo || undefined,
    );
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;

    const headers = ["Timestamp", "User", "Client IP", "Action", "Resource"];
    const rows = results.map((event) => [
      event.timestamp,
      event.user,
      event.source_ip || "N/A",
      event.action,
      event.resource || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-log-${filename || "search"}-${new Date().toISOString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    if (results.length === 0) return;

    try {
      // Dynamic import to avoid SSR issues with jsPDF
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();

      // Add header
      doc.setFontSize(18);
      doc.text("Audit Log Report", 14, 20);

      // Add search criteria
      doc.setFontSize(10);
      doc.text(`Search Criteria:`, 14, 30);
      doc.text(`  Filename: ${filename}`, 14, 36);
      if (user) doc.text(`  User: ${user}`, 14, 42);
      if (dateFrom)
        doc.text(`  From: ${new Date(dateFrom).toLocaleString()}`, 14, 48);
      if (dateTo)
        doc.text(`  To: ${new Date(dateTo).toLocaleString()}`, 14, 54);
      doc.text(`  Results: ${results.length} events`, 14, 60);

      // Prepare table data
      const tableData = results.map((event) => [
        new Date(event.timestamp).toLocaleString(),
        event.user,
        event.source_ip || "N/A",
        event.action,
        event.resource || "N/A",
      ]);

      // Add table
      autoTable(doc, {
        head: [["Timestamp", "User", "Client IP", "Action", "Resource"]],
        body: tableData,
        startY: 70,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] }, // Blue header
      });

      // Save PDF
      doc.save(
        `audit-log-${filename || "search"}-${new Date().toISOString()}.pdf`,
      );
    } catch (error) {
      console.error("PDF generation error:", error);
      alert(
        `PDF export failed: ${error instanceof Error ? error.message : "Unknown error"}. Please install jspdf packages.`,
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Audit Log Search
        </h2>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="filename"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Filename *
              </label>
              <input
                id="filename"
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g., patient_records.xls"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="user"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                User (optional)
              </label>
              <input
                id="user"
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="e.g., alice"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="dateFrom"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                From Date (optional)
              </label>
              <input
                id="dateFrom"
                type="datetime-local"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="dateTo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                To Date (optional)
              </label>
              <input
                id="dateTo"
                type="datetime-local"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={isLoading || !filename}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? "Searching..." : "Search"}
            </button>

            {results.length > 0 && (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({results.length} events)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Timestamp
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      User
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Client IP
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {event.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.source_ip || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.action.toLowerCase().includes("delete")
                            ? "bg-red-100 text-red-800"
                            : event.action.toLowerCase().includes("write")
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {event.action}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate"
                      title={event.resource || "N/A"}
                    >
                      {event.resource || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Searching audit logs...</p>
        </div>
      )}

      {!isLoading && results.length === 0 && filename && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No events found for "{filename}"</p>
          <p className="text-sm text-gray-500 mt-2">
            Try adjusting your search criteria
          </p>
        </div>
      )}
    </div>
  );
};
