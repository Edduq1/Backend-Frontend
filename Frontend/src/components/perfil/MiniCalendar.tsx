import React, { useState, useMemo, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";

// =============================================================
// 1. Constantes y Utilidades
// =============================================================
const VIEW_MODES = {
  DAYS: "days",
  MONTHS: "months",
  YEARS: "years",
  FULL_YEAR: "full_year",
} as const;

type ViewMode = (typeof VIEW_MODES)[keyof typeof VIEW_MODES];

const MONTH_NAMES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAY_NAMES_ES_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const getCalendarDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const actualDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  return [...Array(startOffset).fill(null), ...actualDays];
};

const getWeekNumber = (d: Date): number => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
};

// =============================================================
// 2. Props
// =============================================================
interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateChange?: (date: Date) => void;
  tareasConFecha?: string[]; // lista de fechas con tareas ("YYYY-MM-DD")
}

// =============================================================
// 3. Componente Principal
// =============================================================
const MiniCalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  onDateChange,
  tareasConFecha = [],
}) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODES.FULL_YEAR);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const isFullView = viewMode === VIEW_MODES.FULL_YEAR;

  // --- Bloquear scroll del body cuando el modal está abierto ---
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();
  const currentYearView = currentDate.getFullYear();

  // =============================================================
  // 4. Navegación entre vistas
  // =============================================================
  const goToPreviousYear = () =>
    setCurrentDate((prev) => new Date(prev.getFullYear() - 1, prev.getMonth(), 1));
  const goToNextYear = () =>
    setCurrentDate((prev) => new Date(prev.getFullYear() + 1, prev.getMonth(), 1));
  const goToPreviousMonth = () =>
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goToNextMonth = () =>
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const goToPreviousYearRange = () =>
    setCurrentDate((prev) => new Date(prev.getFullYear() - 16, prev.getMonth(), 1));
  const goToNextYearRange = () =>
    setCurrentDate((prev) => new Date(prev.getFullYear() + 16, prev.getMonth(), 1));

  const toggleViewMode = () => {
    setViewMode((prevMode) =>
      prevMode === VIEW_MODES.FULL_YEAR ? VIEW_MODES.DAYS : VIEW_MODES.FULL_YEAR
    );
  };

  // =============================================================
  // 5. Selección de día
  // =============================================================
  const handleDayClick = useCallback(
    (day: number | null, monthIndex: number = currentDate.getMonth(), year: number = currentDate.getFullYear()) => {
      if (day !== null) {
        const newDate = new Date(year, monthIndex, day);
        setSelectedDate(newDate);
        onDateChange?.(newDate);

        if (isFullView) {
          setCurrentDate(newDate);
          setViewMode(VIEW_MODES.DAYS);
        } else {
          onClose();
        }
      }
    },
    [isFullView, onClose, onDateChange]
  );

  // =============================================================
  // 6. Renderizado de días del mes
  // =============================================================
  const RenderMonthGrid: React.FC<{
    displayDate: Date;
    onDayClick: (day: number | null, monthIndex: number, year: number) => void;
    isFullView: boolean;
  }> = ({ displayDate, onDayClick, isFullView }) => {
    const days = getCalendarDays(displayDate);
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const selectedDay =
      month === selectedDate.getMonth() && year === selectedDate.getFullYear()
        ? selectedDate.getDate()
        : -1;
    const isCurrentMonthView = month === todayMonth && year === todayYear;

    const getWeekHighlight = (dayIndex: number) => {
      if (!isFullView) return false;
      const day = days[dayIndex];
      if (day === null) return false;
      const date = new Date(year, month, day);
      const currentWeekNumber = getWeekNumber(today);
      const dayWeekNumber = getWeekNumber(date);
      return dayWeekNumber === currentWeekNumber && year === todayYear;
    };

    const hasTask = (day: number | null) => {
      if (!day) return false;
      const dateStr = new Date(year, month, day).toISOString().split("T")[0];
      return tareasConFecha.includes(dateStr);
    };

    return (
      <div className="grid grid-cols-7 text-sm gap-0.5">
        {days.map((day, index) => {
          const isTodayHighlight = isCurrentMonthView && day === todayDay;
          const isSelected = day === selectedDay && !isTodayHighlight;
          const isWeekend = day !== null && (index % 7 === 5 || index % 7 === 6);
          const isCurrentWeek = getWeekHighlight(index);
          const showDot = hasTask(day);

          return (
            <div
              key={index}
              onClick={day !== null ? () => onDayClick(day, month, year) : undefined}
              className={`relative w-full h-8 flex flex-col items-center justify-center rounded-lg transition-colors text-xs font-medium
                ${
                  day === null
                    ? "text-gray-300 pointer-events-none"
                    : isTodayHighlight
                    ? "bg-purple-600 text-white font-bold hover:bg-purple-700"
                    : isSelected
                    ? "bg-purple-400 text-white font-bold"
                    : isCurrentWeek && isFullView
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : isWeekend
                    ? "text-gray-400 hover:bg-gray-100"
                    : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                }`}
            >
              {day}
              {showDot && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // =============================================================
  // 7. Renderizadores de vistas
  // =============================================================
  const renderFullYearView = () => (
    <div className="grid grid-cols-3 gap-4 mt-4 max-h-[80vh] overflow-y-auto p-2">
      {Array.from({ length: 12 }, (_, i) => {
        const date = new Date(currentYearView, i, 1);
        const isCurrentMonth = i === todayMonth && currentYearView === todayYear;
        return (
          <div
            key={i}
            className={`p-2 border rounded-xl shadow-sm ${
              isCurrentMonth ? "border-purple-500 bg-purple-100" : "border-gray-200 bg-gray-50"
            }`}
          >
            <h5
              className={`text-center font-bold mb-2 ${
                isCurrentMonth ? "text-purple-600" : "text-gray-800"
              }`}
            >
              {MONTH_NAMES_ES[i]}
            </h5>
            <div className="grid grid-cols-7 text-xs font-semibold text-gray-400 mb-1">
              {DAY_NAMES_ES_SHORT.map((day) => (
                <span key={day} className="text-center">
                  {day[0]}
                </span>
              ))}
            </div>
            <RenderMonthGrid
              displayDate={date}
              onDayClick={handleDayClick}
              isFullView={true}
            />
          </div>
        );
      })}
    </div>
  );

  const renderDayView = () => (
    <>
      <div className="grid grid-cols-7 text-xs font-semibold text-gray-500 gap-1 mb-2 border-b pb-2">
        {DAY_NAMES_ES_SHORT.map((day) => (
          <span key={day} className="text-center">{day}</span>
        ))}
      </div>
      <RenderMonthGrid displayDate={currentDate} onDayClick={handleDayClick} isFullView={false} />
    </>
  );

  const renderMonthView = () => (
    <div className="grid grid-cols-3 gap-3 p-2 mt-4">
      {MONTH_NAMES_ES.map((monthName, index) => (
        <button
          key={monthName}
          onClick={() => {
            setCurrentDate(new Date(currentDate.getFullYear(), index, 1));
            setViewMode(VIEW_MODES.DAYS);
          }}
          className={`p-3 text-sm font-semibold rounded-xl transition-colors ${
            index === currentDate.getMonth()
              ? "bg-purple-600 text-white"
              : "bg-gray-100 hover:bg-purple-100 hover:text-purple-600"
          }`}
        >
          {monthName}
        </button>
      ))}
    </div>
  );

  const renderYearView = () => {
    const selectedYear = currentDate.getFullYear();
    const startYear = selectedYear - (selectedYear % 16);
    const years = Array.from({ length: 16 }, (_, i) => startYear + i);
    return (
      <div className="grid grid-cols-4 gap-3 p-2 mt-4">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => {
              setCurrentDate(new Date(year, currentDate.getMonth(), 1));
              setViewMode(VIEW_MODES.MONTHS);
            }}
            className={`p-3 text-base font-semibold rounded-xl ${
              year === todayYear
                ? "bg-purple-600 text-white"
                : "bg-gray-100 hover:bg-purple-100 hover:text-purple-600"
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    );
  };

  // =============================================================
  // 8. Header de navegación
  // =============================================================
  const { title, leftAction, rightAction, CenterAction, isRangeView } = useMemo(() => {
    const year = currentDate.getFullYear();
    if (viewMode === VIEW_MODES.FULL_YEAR)
      return { title: `Año ${year}`, leftAction: goToPreviousYear, rightAction: goToNextYear, CenterAction: () => setViewMode(VIEW_MODES.MONTHS), isRangeView: false };
    if (viewMode === VIEW_MODES.DAYS)
      return { title: currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" }), leftAction: goToPreviousMonth, rightAction: goToNextMonth, CenterAction: () => setViewMode(VIEW_MODES.MONTHS), isRangeView: false };
    if (viewMode === VIEW_MODES.MONTHS)
      return { title: year.toString(), leftAction: goToPreviousYear, rightAction: goToNextYear, CenterAction: () => setViewMode(VIEW_MODES.YEARS), isRangeView: true };
    const startYear = year - (year % 16);
    const endYear = startYear + 15;
    return { title: `${startYear} - ${endYear}`, leftAction: goToPreviousYearRange, rightAction: goToNextYearRange, CenterAction: () => setViewMode(VIEW_MODES.MONTHS), isRangeView: true };
  }, [viewMode, currentDate]);

  const maxWidthClass = isFullView ? "max-w-4xl" : "max-w-sm";

  // =============================================================
  // 9. Render final (Modal)
  // =============================================================
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className={`bg-gradient-to-br from-[#DBDBDB] to-[#DBDBDB] text-gray-900 rounded-3xl border border-[#C4B5FD] w-full ${maxWidthClass} p-6 relative shadow-xl`}
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl"
              >
                ✕
              </button>

              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <button onClick={leftAction} className="p-2 rounded-full text-purple-500 hover:bg-purple-100">
                  {isRangeView ? <ChevronDoubleLeftIcon className="w-6 h-6" /> : <ChevronLeftIcon className="w-6 h-6" />}
                </button>
                <h4 onClick={CenterAction} className="text-xl font-bold capitalize hover:text-purple-600 cursor-pointer">
                  {title}
                </h4>
                <button onClick={rightAction} className="p-2 rounded-full text-purple-500 hover:bg-purple-100">
                  {isRangeView ? <ChevronDoubleRightIcon className="w-6 h-6" /> : <ChevronRightIcon className="w-6 h-6" />}
                </button>
              </div>

              <button
                onClick={toggleViewMode}
                className="absolute top-4 left-4 p-2 rounded-full text-gray-500 hover:text-purple-600 hover:bg-gray-100"
              >
                {isFullView ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
              </button>

              {viewMode === VIEW_MODES.FULL_YEAR && renderFullYearView()}
              {viewMode === VIEW_MODES.DAYS && renderDayView()}
              {viewMode === VIEW_MODES.MONTHS && renderMonthView()}
              {viewMode === VIEW_MODES.YEARS && renderYearView()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default MiniCalendarModal;
