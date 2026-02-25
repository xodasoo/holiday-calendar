import { useState, useEffect, useCallback } from 'react';
import { REGIONS } from './regions';

const API_BASE = 'https://date.nager.at/api/v3/PublicHolidays';
const cache = {};

// country code → { regionId, countryName, nameKo }
const countryMeta = {};
REGIONS.forEach((r) => {
  r.countries.forEach((c) => {
    countryMeta[c.code] = { regionId: r.id, countryName: c.name, nameKo: c.nameKo };
  });
});

async function fetchHolidaysForCountry(year, countryCode) {
  const key = `${year}-${countryCode}`;
  if (cache[key]) return cache[key];
  const res = await fetch(`${API_BASE}/${year}/${countryCode}`);
  if (!res.ok) return [];
  const data = await res.json();
  cache[key] = data;
  return data;
}

export function useHolidays(year, activeCountryCodes) {
  const [holidays, setHolidays] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (activeCountryCodes.length === 0) {
      setHolidays({});
      return;
    }
    setLoading(true);

    const results = await Promise.allSettled(
      activeCountryCodes.map(async (code) => {
        const meta = countryMeta[code];
        if (!meta) return [];
        const data = await fetchHolidaysForCountry(year, code);
        return data
          .filter((h) => h.global === true)
          .map((h) => ({ ...h, countryCode: code, countryName: meta.countryName, regionId: meta.regionId }));
      })
    );

    const merged = {};
    results.forEach((r) => {
      if (r.status !== 'fulfilled') return;
      r.value.forEach((h) => {
        const date = h.date;
        if (!merged[date]) merged[date] = [];
        merged[date].push(h);
      });
    });

    setHolidays(merged);
    setLoading(false);
  }, [year, activeCountryCodes.join(',')]); // eslint-disable-line

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { holidays, loading };
}
