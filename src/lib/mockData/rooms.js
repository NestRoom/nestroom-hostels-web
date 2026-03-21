import { ROOM_STATUS } from '../constants/rooms';

export const initialRoomsState = [
  {
    id: 'room-101',
    number: '101',
    status: ROOM_STATUS.OCCUPIED,
    sharing: '2-Sharing',
    capacity: 2,
    residents: [
      { id: 'usr-1', name: 'Rohan Gupta', bed: 'Bed A', feeStatus: 'Paid' },
      { id: 'usr-2', name: 'Amit Sharma', bed: 'Bed B', feeStatus: 'Paid' },
    ]
  },
  {
    id: 'room-102',
    number: '102',
    status: ROOM_STATUS.PARTIALLY_VACANT,
    sharing: '4-Sharing',
    capacity: 4,
    residents: [
      { id: 'usr-3', name: 'Prakash Jha', bed: 'Bed A', feeStatus: 'Paid' },
    ]
  },
  {
    id: 'room-103',
    number: '103',
    status: ROOM_STATUS.VACANT,
    sharing: '2-Sharing',
    capacity: 2,
    residents: []
  },
  {
    id: 'room-104',
    number: '104',
    status: ROOM_STATUS.MAINTENANCE,
    sharing: '2-Sharing',
    capacity: 2,
    residents: [],
    maintenanceInfo: 'Leaky tap fixing in progress'
  },
  {
    id: 'room-201',
    number: '201',
    status: ROOM_STATUS.OCCUPIED,
    sharing: '2-Sharing',
    capacity: 2,
    residents: [
      { id: 'usr-4', name: 'Priya Patel', bed: 'Bed A', feeStatus: 'Paid' },
      { id: 'usr-5', name: 'Sneha Kapoor', bed: 'Bed B', feeStatus: 'Overdue' },
    ]
  },
  {
    id: 'room-202',
    number: '202',
    status: ROOM_STATUS.OCCUPIED,
    sharing: '2-Sharing',
    capacity: 2,
    residents: [
      { id: 'usr-6', name: 'Rahul Varma', bed: 'Bed A', feeStatus: 'Paid' },
      { id: 'usr-7', name: 'Arjun Nair', bed: 'Bed B', feeStatus: 'Paid' },
    ]
  }
];
