"use client";

import React, { useState } from "react";
import PassengerApp from "@/components/PassengerApp";
import DriverDashboard from "@/components/DriverDashboard";

type ViewMode = "split" | "passenger" | "driver";

export default function SolutionPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("split");

  return (
    <div className="w-full h-screen min-h-screen bg-slate-50 text-slate-900 pb-28">
      {/* Top bar */}
      <div className="w-full bg-white border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Solution Workspace</h1>
        <div className="inline-flex rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setViewMode("split")}
            className={`px-3 py-1 text-sm font-medium rounded-md ${viewMode === "split" ? "bg-pink-500 text-white" : "text-slate-600"}`}>
            Split
          </button>
          <button
            onClick={() => setViewMode("passenger")}
            className={`px-3 py-1 text-sm font-medium rounded-md ${viewMode === "passenger" ? "bg-pink-500 text-white" : "text-slate-600"}`}>
            Passenger
          </button>
          <button
            onClick={() => setViewMode("driver")}
            className={`px-3 py-1 text-sm font-medium rounded-md ${viewMode === "driver" ? "bg-pink-500 text-white" : "text-slate-600"}`}>
            Driver
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="w-full h-[calc(100vh-72px)] overflow-hidden">
        {viewMode === "split" && (
          <div className="flex w-full h-full">
            <div className="w-1/2 border-r overflow-auto">
              <div className="bg-pink-500 text-white text-center py-2 font-semibold">PASSENGER VIEW</div>
              <PassengerApp />
            </div>
            <div className="w-1/2 overflow-auto">
              <div className="bg-[hsl(220,65%,25%)] text-white text-center py-2 font-semibold">DRIVER VIEW</div>
              <DriverDashboard />
            </div>
          </div>
        )}

        {viewMode === "passenger" && (
          <div className="w-full h-full overflow-auto">
            <PassengerApp />
          </div>
        )}

        {viewMode === "driver" && (
          <div className="w-full h-full overflow-auto">
            <DriverDashboard />
          </div>
        )}
      </div>
    </div>
  );
}
