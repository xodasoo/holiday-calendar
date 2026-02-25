export const REGIONS = [
  {
    id: 'taiwan_china',
    label: '대만 / 중국',
    dotColor: '#ef4444',
    countries: [
      { code: 'TW', name: 'Taiwan' },
      { code: 'CN', name: 'China' },
    ],
  },
  {
    id: 'japan',
    label: '일본',
    dotColor: '#ec4899',
    countries: [{ code: 'JP', name: 'Japan' }],
  },
  {
    id: 'thailand',
    label: '태국',
    dotColor: '#f59e0b',
    countries: [{ code: 'TH', name: 'Thailand' }],
  },
  {
    id: 'north_america',
    label: '북미',
    dotColor: '#3b82f6',
    countries: [
      { code: 'US', name: 'United States' },
      { code: 'CA', name: 'Canada' },
      { code: 'MX', name: 'Mexico' },
    ],
  },
  {
    id: 'europe',
    label: '유럽',
    dotColor: '#22c55e',
    // Reduced to 3 major countries; global:true filter applied in useHolidays
    countries: [
      { code: 'GB', name: 'United Kingdom' },
      { code: 'FR', name: 'France' },
      { code: 'DE', name: 'Germany' },
    ],
  },
];
