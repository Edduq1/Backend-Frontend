// src/components/Dashboard/common/RealTimeClockWidget.tsx
import React, { useState, useEffect } from "react";

const RealTimeClockWidget: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const timeString = currentTime.toLocaleTimeString("es-ES", timeOptions);
  const dateString = currentTime
    .toLocaleDateString("es-ES", dateOptions)
    .replace(",", "");

  return (
    <div
      className="flex items-center gap-4 bg-white/20 backdrop-blur-md rounded-xl px-5 py-2 transition-all duration-200"
    >
      {/* Icono del reloj */}
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/30 text-blue-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Hora y fecha */}
      <div className="flex flex-col">
        <span className="text-lg font-semibold text-white tracking-tight">
          {timeString}
        </span>
        <span className="text-xs text-gray-200 capitalize">{dateString}</span>
      </div>
    </div>
  );
};

export default RealTimeClockWidget;
