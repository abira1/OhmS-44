// Mock data for the classroom application
// Days and time slots for the routine
export const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday'];
export const timeSlots = ['10:00 - 11:40 AM', '1:45 - 3:00 PM', '3:00 - 4:15 PM', '4:15 - 5:30 PM'];
// Mock classes data - removed for production, classes now come from Firebase
export const mockClasses: any[] = [];
// Mock students data
export const mockStudents = [{
  id: 1,
  name: 'Alex Johnson',
  roll: 'EEE2301',
  bloodGroup: 'A+',
  phone: '+1 (555) 123-4567',
  email: 'alex.johnson@university.edu',
  image: 'https://randomuser.me/api/portraits/men/32.jpg'
}, {
  id: 2,
  name: 'Samantha Lee',
  roll: 'EEE2302',
  bloodGroup: 'B-',
  phone: '+1 (555) 234-5678',
  email: 'samantha.lee@university.edu',
  image: 'https://randomuser.me/api/portraits/women/44.jpg'
}, {
  id: 3,
  name: 'Michael Zhang',
  roll: 'EEE2303',
  bloodGroup: 'O+',
  phone: '+1 (555) 345-6789',
  email: 'michael.zhang@university.edu',
  image: 'https://randomuser.me/api/portraits/men/45.jpg'
}, {
  id: 4,
  name: 'Jessica Patel',
  roll: 'EEE2304',
  bloodGroup: 'AB+',
  phone: '+1 (555) 456-7890',
  email: 'jessica.patel@university.edu',
  image: 'https://randomuser.me/api/portraits/women/63.jpg'
}, {
  id: 5,
  name: 'David Kim',
  roll: 'EEE2305',
  bloodGroup: 'A-',
  phone: '+1 (555) 567-8901',
  email: 'david.kim@university.edu',
  image: 'https://randomuser.me/api/portraits/men/22.jpg'
}, {
  id: 6,
  name: 'Emma Wilson',
  roll: 'EEE2306',
  bloodGroup: 'O-',
  phone: '+1 (555) 678-9012',
  email: 'emma.wilson@university.edu',
  image: 'https://randomuser.me/api/portraits/women/24.jpg'
}, {
  id: 7,
  name: 'Ryan Garcia',
  roll: 'EEE2307',
  bloodGroup: 'B+',
  phone: '+1 (555) 789-0123',
  email: 'ryan.garcia@university.edu',
  image: 'https://randomuser.me/api/portraits/men/67.jpg'
}, {
  id: 8,
  name: 'Olivia Brown',
  roll: 'EEE2308',
  bloodGroup: 'AB-',
  phone: '+1 (555) 890-1234',
  email: 'olivia.brown@university.edu',
  image: 'https://randomuser.me/api/portraits/women/90.jpg'
}, {
  id: 9,
  name: 'Ethan Davis',
  roll: 'EEE2309',
  bloodGroup: 'A+',
  phone: '+1 (555) 901-2345',
  email: 'ethan.davis@university.edu',
  image: 'https://randomuser.me/api/portraits/men/75.jpg'
}];
// Mock attendance data
export const mockAttendance = [{
  date: '2023-11-01',
  subject: 'Digital Electronics',
  presentCount: 8,
  absentStudents: [2]
}, {
  date: '2023-11-01',
  subject: 'Electrical Circuits',
  presentCount: 7,
  absentStudents: [3, 7]
}, {
  date: '2023-10-30',
  subject: 'Power Systems',
  presentCount: 9,
  absentStudents: []
}, {
  date: '2023-10-30',
  subject: 'Control Systems',
  presentCount: 6,
  absentStudents: [1, 5, 8]
}, {
  date: '2023-10-27',
  subject: 'Signals & Systems',
  presentCount: 7,
  absentStudents: [4, 9]
}];
// Mock notices data
export const mockNotices = [{
  id: 1,
  date: '2023-11-05',
  title: 'Mid-term Examination Schedule',
  description: 'The mid-term examinations will commence from November 20th. All students are required to check the detailed schedule posted on the department notice board.'
}, {
  id: 2,
  date: '2023-11-02',
  title: 'Workshop on Embedded Systems',
  description: 'A workshop on Embedded Systems will be conducted on November 10th at the Main Auditorium. Attendance is mandatory for all 3rd year students.'
}, {
  id: 3,
  date: '2023-10-28',
  title: 'Lab Equipment Maintenance',
  description: 'The Digital Electronics Lab will be closed for maintenance from October 30th to November 2nd. Scheduled lab sessions during this period will be rescheduled.'
}];