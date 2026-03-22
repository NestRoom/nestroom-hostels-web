export const SUMMARY_STATS = [
  {
    id: 'requests',
    title: 'Service Requests Open',
    value: 14,
    trend: '4 since yesterday',
    trendType: 'increase', // mapped to red in UI
  },
  {
    id: 'resolution',
    title: 'Average Resolution Time',
    value: 4.2,
    unit: 'hrs',
    trend: '15% better than last week',
    trendType: 'decrease', // mapped to green in UI
  },
  {
    id: 'subscriptions',
    title: 'Active Subscriptions',
    value: 118,
    trend: '92% resident adoption',
    trendType: 'neutral', // mapped to gray
  }
];

export const REVENUE_DATA = [
  { month: 'Jan', value: 15000 },
  { month: 'Feb', value: 25000 },
  { month: 'Mar', value: 45000 },
  { month: 'Apr', value: 55000 },
  { month: 'May', value: 60000 },
  { month: 'Jun', value: 65000 },
];

export const SERVICE_TICKETS = [
  {
    id: '#SR-1024',
    service: 'Wi-Fi',
    description: 'WiFi not working in Wing B',
    resident: 'Aryan Sharma',
    status: 'PENDING'
  },
  {
    id: '#SR-1022',
    service: 'Laundry',
    description: 'Ironing request for 5 shirts',
    resident: 'Meera Iyer',
    status: 'IN-PROGRESS'
  },
  {
    id: '#SR-1021',
    service: 'Mess',
    description: 'Extra meal coupon requested',
    resident: 'Rohan Mehta',
    status: 'RESOLVED'
  },
  {
    id: '#SR-1019',
    service: 'Plumbing',
    description: 'Water leakage in Room 304',
    resident: 'Sneha Kapoor',
    status: 'PENDING'
  }
];
