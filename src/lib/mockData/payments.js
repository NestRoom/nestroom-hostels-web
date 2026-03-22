export const summaryCardsData = {
  collected: {
    amount: "₹8,42,500",
    trend: "+ 14% higher than last month",
    isPositive: true,
  },
  dues: {
    amount: "₹1,12,000",
    trend: "8 residents overdue",
    isPositive: false,
  },
  renewals: {
    count: "24",
    trend: "Expiring in next 7 days",
  }
};

export const revenueChartData = [
  { month: "Jan", revenue: 2.1 },
  { month: "Feb", revenue: 3.8 },
  { month: "Mar", revenue: 4.8 },
  { month: "Apr", revenue: 5.5 },
  { month: "May", revenue: 6.2 },
  { month: "Jun", revenue: 7.0 },
];

export const transactionHistory = [
  {
    id: 1,
    residentName: "Sneha Kapoor",
    room: "Room 105",
    amount: "₹12,500",
    method: "UPI",
    date: "12 Oct 2023",
    time: "12:45 PM",
    status: "Successful",
  },
  {
    id: 2,
    residentName: "Amit Das",
    room: "Room 302",
    amount: "₹1,240",
    method: "Cash",
    date: "12 Oct 2023",
    time: "10:20 AM",
    status: "Successful",
  },
  {
    id: 3,
    residentName: "Priya Patel",
    room: "Room 204",
    amount: "₹14,000",
    method: "Transfer",
    date: "Due Date: 05 Oct 2023",
    time: "",
    status: "Pending",
  },
  {
    id: 4,
    residentName: "Rajesh Kumar",
    room: "Room 201",
    amount: "₹11,000",
    method: "Transfer",
    date: "11 Oct 2023",
    time: "04:15 PM",
    status: "Successful",
  },
];

export const managementOverviewData = {
  disputes: {
    count: "03",
    failedUpi: 2,
    amountMismatch: 1,
  },
  forecast: {
    amount: "₹4.2L",
    pendingBills: 42,
    progress: 80, // percentage string or number
  }
};
