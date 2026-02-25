import { useState, useEffect, useCallback } from 'react';
import { REGIONS } from './regions';

const API_BASE = 'https://date.nager.at/api/v3/PublicHolidays';
const cache = {};

async function fetchHolidaysForCountry(year, countryCode) {
  const key = `${year}-${countryCode}`;
  if (cache[key]) return cache[key];

  const res = await fetch(`${API_BASE}/${year}/${countryCode}`);
  if (!res.ok) return [];
  const data = await res.json();
  cache[key] = data;
  return data;
}

export function useHolidays(year, activeRegionIds) {
  const [holidays, setHolidays] = useState({}); // { 'YYYY-MM-DD': [{name, countryCode, regionId, ...}] }
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (activeRegionIds.length === 0) {
      setHolidays({});
      return;
    }
    setLoading(true);

    const activeRegions = REGIONS.filter((r) => activeRegionIds.includes(r.id));
    const countryCodes = activeRegions.flatMap((r) =>
      r.countries.map((c) => ({ ...c, regionId: r.id }))
    );

    const results = await Promise.allSettled(
      countryCodes.map(async ({ code, name, regionId }) => {
        const data = await fetchHolidaysForCountry(year, code);
        return data
          .filter((h) => h.global === true) // nationwide holidays only
          .map((h) => ({ ...h, countryCode: code, countryName: name, regionId }));
      })
    );

    const merged = {};
    results.forEach((r) => {
      if (r.status !== 'fulfilled') return;
      r.value.forEach((h) => {
        const date = h.date; // 'YYYY-MM-DD'
        if (!merged[date]) merged[date] = [];
        merged[date].push(h);
      });
    });

    setHolidays(merged);
    setLoading(false);
  }, [year, activeRegionIds.join(',')]); // eslint-disable-line

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { holidays, loading };
}
