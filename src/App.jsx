import { useState, useCallback, useMemo } from 'react';
import Calendar from './Calendar';
import { useHolidays } from './useHolidays';
import { REGIONS } from './regions';

const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

const ALL_COUNTRY_CODES = REGIONS.flatMap((r) => r.countries.map((c) => c.code));

export default function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [activeCountries, setActiveCountries] = useState(new Set(ALL_COUNTRY_CODES));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHolidays, setSelectedHolidays] = useState([]);

  const activeCountryCodes = useMemo(() => [...activeCountries], [activeCountries]);
  const { holidays, loading } = useHolidays(year, activeCountryCodes);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  // 'all' | 'some' | 'none'
  const getRegionState = (region) => {
    const codes = region.countries.map((c) => c.code);
    const count = codes.filter((code) => activeCountries.has(code)).length;
    if (count === codes.length) return 'all';
    if (count === 0) return 'none';
    return 'some';
  };

  const toggleRegion = (region) => {
    const codes = region.countries.map((c) => c.code);
    const state = getRegionState(region);
    setActiveCountries((prev) => {
      const next = new Set(prev);
      if (state === 'all') {
        codes.forEach((code) => next.delete(code));
      } else {
        codes.forEach((code) => next.add(code));
      }
      return next;
    });
  };

  const toggleCountry = (code) => {
    setActiveCountries((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleSelectDay = useCallback((dateStr, dayHolidays) => {
    setSelectedDate(dateStr);
    setSelectedHolidays(dayHolidays);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          🌏 세계 공휴일 달력
        </h1>

        {/* Filter Panel */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 space-y-3">
          <p className="text-xs text-gray-500 font-semibold">지역 / 국가 필터</p>
          {REGIONS.map((region) => {
            const state = getRegionState(region);
            return (
              <div key={region.id}>
                <button
                  onClick={() => toggleRegion(region)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all mb-1.5
                    ${state === 'all'
                      ? 'text-white border-transparent shadow-sm'
                      : state === 'some'
                      ? 'bg-white border-2'
                      : 'bg-white text-gray-400 border-gray-200'}
                  `}
                  style={
                    state === 'all'
                      ? { backgroundColor: region.dotColor, borderColor: region.dotColor }
                      : state === 'some'
                      ? { borderColor: region.dotColor, color: region.dotColor }
                      : {}
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: state === 'all' ? 'white' : region.dotColor }}
                  />
                  {region.label}
                  {state === 'some' && <span className="text-xs opacity-60 ml-0.5">일부</span>}
                </button>

                <div className="flex flex-wrap gap-1 pl-1">
                  {region.countries.map((c) => {
                    const isActive = activeCountries.has(c.code);
                    return (
                      <button
                        key={c.code}
                        onClick={() => toggleCountry(c.code)}
                        className={`
                          text-xs px-2 py-0.5 rounded-full border transition-all
                          ${isActive ? 'border-transparent' : 'bg-white border-gray-200 text-gray-400'}
                        `}
                        style={isActive ? {
                          backgroundColor: `${region.dotColor}22`,
                          color: region.dotColor,
                          borderColor: `${region.dotColor}55`,
                        } : {}}
                      >
                        {c.nameKo}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-center gap-3 mb-1">
            <button
              onClick={() => setYear(y => y - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors text-lg leading-none"
            >‹</button>
            <span className="text-sm font-semibold text-gray-500 w-16 text-center">{year}</span>
            <button
              onClick={() => setYear(y => y + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors text-lg leading-none"
            >›</button>
          </div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors text-xl leading-none">‹</button>
            <h2 className="text-xl font-bold text-gray-800">{MONTH_NAMES[month]}</h2>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors text-xl leading-none">›</button>
          </div>

          {loading && (
            <div className="text-center text-sm text-gray-400 py-2">공휴일 불러오는 중...</div>
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

        {/* Selected day */}
        {selectedDate && selectedHolidays.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-500 font-semibold mb-3">{selectedDate} 공휴일</p>
            <ul className="space-y-2">
              {selectedHolidays.map((h, i) => {
                const region = REGIONS.find((r) => r.id === h.regionId);
                const country = region?.countries.find((c) => c.code === h.countryCode);
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
                        {country?.nameKo ?? h.countryName}
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
