/**
 * @typedef {Object} IResident
 * @property {string} id
 * @property {string} name
 * @property {string} phone
 * @property {string} roomNo
 * @property {string} joinDate
 * @property {'Active'|'Notice'|'New'} status
 * @property {'Paid'|'Overdue'|'Partial'} payments
 * @property {string|null} [avatarUrl]
 */

/**
 * @typedef {Object} ISummaryCard
 * @property {string} id
 * @property {string} title
 * @property {number|string} value
 * @property {string} subtitle
 * @property {string} [subtitleIcon]
 * @property {'green'|'blue'|'orange'} [colorScheme]
 * @property {string} [badgeText]
 */

export const mockResidents = [
  {
    id: 'res-1',
    name: 'Anjali Rao',
    phone: '+91 98765 43210',
    roomNo: 'Room 102 (A)',
    joinDate: '12 Jan 2024',
    status: 'Active',
    payments: 'Paid',
    avatarUrl: null
  },
  {
    id: 'res-2',
    name: 'Siddharth Malhotra',
    phone: '+91 98231 00982',
    roomNo: 'Room 205 (B)',
    joinDate: '05 Feb 2024',
    status: 'Active',
    payments: 'Overdue',
    avatarUrl: null
  },
  {
    id: 'res-3',
    name: 'Priya Patel',
    phone: '+91 91102 33456',
    roomNo: 'Room 301 (A)',
    joinDate: '18 Feb 2024',
    status: 'Notice',
    payments: 'Paid',
    avatarUrl: null
  },
  {
    id: 'res-4',
    name: 'Amit Das',
    phone: '+91 97765 22110',
    roomNo: 'Room 105 (C)',
    joinDate: '22 Dec 2023',
    status: 'Active',
    payments: 'Paid',
    avatarUrl: null
  },
  {
    id: 'res-5',
    name: 'Ishaan Reddy',
    phone: '+91 95567 88901',
    roomNo: 'Room 201 (B)',
    joinDate: '10 Mar 2024',
    status: 'New',
    payments: 'Partial',
    avatarUrl: null
  }
];

export const fetchResidentsList = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockResidents);
    }, 400); // simulate API delay
  });
};
