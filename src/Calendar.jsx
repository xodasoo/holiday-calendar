import { REGIONS } from './regions';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

function toDateStr(year, month, day) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function HolidayDot({ regionId }) {
  const region = REGIONS.find((r) => r.id === regionId);
  if (!region) return null;
  return (
    <span
      className="inline-block w-2 h-2 rounded-full mx-0.5 flex-shrink-0"
      style={{ backgroundColor: region.dotColor }}
      title={region.label}
    />
  );
}

function DayCell({ day, year, month, holidays, onSelect, selected }) {
  const today = new Date();
  const isToday =
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const dateStr = toDateStr(year, month, day);
  const dayHolidays = holidays[dateStr] || [];

  const isWeekend = (() => {
    const dow = new Date(year, month, day).getDay();
    return dow === 0 || dow === 6;
  })();

  const isSelected = selected === dateStr;

  // Group dots by region (show one dot per region)
  const regionIds = [...new Set(dayHolidays.map((h) => h.regionId))];

  return (
    <div
      className={`
        relative p-1 min-h-16 cursor-pointer rounded-lg border transition-colors
        ${isSelected ? 'border-indigo-400 bg-indigo-50' : 'border-transparent hover:border-gray-200 hover:bg-gray-50'}
        ${isToday ? 'ring-2 ring-indigo-400' : ''}
      `}
      onClick={() => onSelect(dateStr, dayHolidays)}
    >
      <span
        className={`
          text-sm font-medium
          ${isToday ? 'bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}
          ${!isToday && isWeekend ? 'text-red-500' : ''}
          ${!isToday && !isWeekend ? 'text-gray-800' : ''}
        `}
      >
        {day}
      </span>
      {regionIds.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mt-1">
          {regionIds.map((rid) => (
            <HolidayDot key={rid} regionId={rid} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Calendar({ year, month, holidays, onSelectDay, selectedDate }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDow = getFirstDayOfWeek(year, month);

  const cells = [];
  // empty cells before the 1st
  for (let i = 0; i < firstDow; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  return (
    <div className="w-full">
      {/* Day name headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((name, i) => (
          <div
            key={name}
            className={`text-center text-xs font-semibold py-2 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) =>
          day === null ? (
            <div key={`empty-${idx}`} />
          ) : (
            <DayCell
              key={day}
              day={day}
              year={year}
              month={month}
              holidays={holidays}
              onSelect={onSelectDay}
              selected={selectedDate}
            />
          )
        )}
      </div>
    </div>
  );
}
