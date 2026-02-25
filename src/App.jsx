import { useState, useCallback } from 'react';
import Calendar from './Calendar';
import { useHolidays } from './useHolidays';
import { REGIONS } from './regions';

const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

function regionColor(id) {
  return REGIONS.find((r) => r.id === id)?.dotColor ?? '#999';
}

export default function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [activeRegions, setActiveRegions] = useState(REGIONS.map((r) => r.id));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHolidays, setSelectedHolidays] = useState([]);

  const { holidays, loading } = useHolidays(year, activeRegions);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const toggleRegion = (id) => {
    setActiveRegions((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSelectDay = useCallback((dateStr, dayHolidays) => {
    setSelectedDate(dateStr);
    setSelectedHolidays(dayHolidays);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          🌏 세계 공휴일 달력
        </h1>

        {/* Region Filter */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <p className="text-xs text-gray-500 font-semibold mb-2">지역 필터</p>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((region) => {
              const active = activeRegions.includes(region.id);
              return (
                <button
                  key={region.id}
                  onClick={() => toggleRegion(region.id)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                    ${active
                      ? 'text-white border-transparent shadow-sm'
                      : 'bg-white text-gray-400 border-gray-200'}
                  `}
                  style={active ? { backgroundColor: region.dotColor, borderColor: region.dotColor } : {}}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: active ? 'white' : region.dotColor }}
                  />
                  {region.label}
                </button>
              );
            })}
          </div>
          {/* Active country chips */}
          <div className="mt-2 flex flex-wrap gap-1">
            {REGIONS.filter((r) => activeRegions.includes(r.id)).flatMap((r) =>
              r.countries.map((c) => (
                <span
                  key={c.code}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${r.dotColor}22`, color: r.dotColor }}
                >
                  {c.name}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Month navigation + Calendar */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          {/* Year navigation */}
          <div className="flex items-center justify-center gap-3 mb-1">
            <button
              onClick={() => setYear(y => y - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors text-lg leading-none"
            >
              ‹
            </button>
            <span className="text-sm font-semibold text-gray-500 w-16 text-center">{year}</span>
            <button
              onClick={() => setYear(y => y + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors text-lg leading-none"
            >
              ›
            </button>
          </div>
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors text-xl leading-none"
            >
              ‹
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              {MONTH_NAMES[month]}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors text-xl leading-none"
            >
              ›
            </button>
          </div>

          {loading && (
            <div className="text-center text-sm text-gray-400 py-2">
              공휴일 불러오는 중...
            </div>
          )}

          <Calendar
            year={year}
            month={month}
            holidays={holidays}
            onSelectDay={handleSelectDay}
            selectedDate={selectedDate}
          />
        </div>

        {/* Legend */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <p className="text-xs text-gray-500 font-semibold mb-2">범례</p>
          <div className="flex flex-wrap gap-3">
            {REGIONS.map((r) => (
              <div key={r.id} className="flex items-center gap-1.5 text-sm text-gray-600">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: r.dotColor }} />
                {r.label}
              </div>
            ))}
          </div>
        </div>

        {/* Selected day holiday list */}
        {selectedDate && selectedHolidays.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-500 font-semibold mb-3">
              {selectedDate} 공휴일
            </p>
            <ul className="space-y-2">
              {selectedHolidays.map((h, i) => {
                const region = REGIONS.find((r) => r.id === h.regionId);
                return (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: region?.dotColor }}
                    />
                    <div>
                      <span className="font-medium text-gray-800">{h.name}</span>
                      <span
                        className="ml-2 text-xs px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${region?.dotColor}22`,
                          color: region?.dotColor,
                        }}
                      >
                        {h.countryName}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {selectedDate && selectedHolidays.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center text-sm text-gray-400">
            {selectedDate} — 선택된 지역의 공휴일이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
