"use client";
import { useState, useRef, useEffect } from "react";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  placeholder?: string;
}

const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];
const DAYS_HEADER = ["L","M","X","J","V","S","D"];

export default function DatePicker({ value, onChange, label, className, placeholder = "—" }: DatePickerProps) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value + "T12:00:00") : null;

  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (y: number, m: number) => {
    const d = new Date(y, m, 1).getDay();
    return d === 0 ? 6 : d - 1; // Monday=0
  };

  const handleDayClick = (day: number) => {
    const str = `${viewYear}-${String(viewMonth + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    onChange(str);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
    : placeholder;

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDay(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  const isSelected = (day: number | null) =>
    !!day && !!selectedDate &&
    selectedDate.getFullYear() === viewYear &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getDate() === day;

  const isTodayCell = (day: number | null) =>
    !!day &&
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  const years = Array.from({ length: 16 }, (_, i) => today.getFullYear() - 4 + i);

  return (
    <div className={`relative ${className || ""}`} ref={ref}>
      {label && (
        <label className="block text-sm font-semibold text-gray-400 mb-1">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm text-left flex items-center justify-between hover:border-[#14a085] focus:outline-none focus:border-[#14a085] transition-colors group"
      >
        <span className={selectedDate ? "text-white" : "text-gray-500"}>{displayValue}</span>
        <span className="text-gray-400 group-hover:text-[#14a085] transition-colors">📅</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 bg-[#0d1726] border border-white/10 rounded-xl shadow-2xl shadow-black/70 p-3 w-60">
          {/* Nav: prev / mes+año / next */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={prevMonth}
              className="text-gray-400 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-lg font-bold"
            >
              ‹
            </button>
            <div className="flex gap-1">
              <select
                value={viewMonth}
                onChange={e => setViewMonth(Number(e.target.value))}
                className="bg-white/10 border border-white/10 rounded px-1 py-0.5 text-white text-xs focus:outline-none cursor-pointer"
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i} className="bg-[#0d1726]">{m}</option>
                ))}
              </select>
              <select
                value={viewYear}
                onChange={e => setViewYear(Number(e.target.value))}
                className="bg-white/10 border border-white/10 rounded px-1 py-0.5 text-white text-xs focus:outline-none cursor-pointer"
              >
                {years.map(y => (
                  <option key={y} value={y} className="bg-[#0d1726]">{y}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="text-gray-400 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-lg font-bold"
            >
              ›
            </button>
          </div>

          {/* Cabecera días */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_HEADER.map(d => (
              <div key={d} className="text-center text-[0.6rem] text-gray-500 font-bold py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Celdas días */}
          <div className="grid grid-cols-7 gap-px">
            {cells.map((day, idx) => (
              <button
                key={idx}
                type="button"
                disabled={!day}
                onClick={() => day && handleDayClick(day)}
                className={[
                  "aspect-square rounded-lg text-xs font-medium transition-all duration-100 flex items-center justify-center",
                  !day ? "invisible pointer-events-none" : "",
                  isSelected(day)
                    ? "bg-[#14a085] text-white font-bold shadow-lg shadow-[#14a085]/40"
                    : isTodayCell(day)
                    ? "border border-[#14a085]/70 text-[#14a085] font-semibold hover:bg-[#14a085]/20"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                ].join(" ")}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Hoy */}
          <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                setViewYear(today.getFullYear());
                setViewMonth(today.getMonth());
                handleDayClick(today.getDate());
              }}
              className="text-xs text-[#14a085] hover:text-[#1abc9c] font-semibold transition-colors"
            >
              Hoy
            </button>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                Borrar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
