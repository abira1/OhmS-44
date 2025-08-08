# OhmS - Class Management System

A modern, retro-themed Progressive Web Application (PWA) for managing class schedules, student information, attendance tracking, and announcements. Built with React, TypeScript, and Firebase.

## 🎯 Project Overview

OhmS is a comprehensive class management system designed for educational institutions. It features a unique retro-tech aesthetic inspired by CRT monitors, VHS tapes, and arcade machines, while providing modern functionality and user experience.

### ✨ Key Features

- **📅 Class Routine Management** - Real-time class schedules with current/next class indicators
- **👥 Student Directory** - Complete classmate contact information with search functionality
- **📊 Attendance Tracking** - Digital attendance management system
- **📢 Announcements** - Priority-based notice board system
- **📝 Notes Section** - Subject-wise notes with admin controls
- **🔐 Role-Based Access** - Admin and regular user permissions
- **📱 Mobile-First Design** - Responsive design optimized for all devices
- **🌙 Dark/Light Mode** - Theme switching with system preference detection
- **⚡ PWA Support** - Installable app with offline capabilities
- **🔄 Real-time Updates** - Live data synchronization across devices

## 🎨 Design Philosophy

OhmS embraces a **retro-tech aesthetic** featuring:
- **Color Palette**: Neon purple, blue, coral, and teal accents
- **Typography**: Pixel fonts (Press Start 2P, VT323) for headers
- **Effects**: Subtle scanlines, neumorphic shadows, and CRT-inspired elements
- **UI Style**: Clean, calm interface with 80s/90s digital screen atmosphere

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Full type safety and enhanced developer experience
- **Tailwind CSS** - Utility-first CSS framework with custom retro theme
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Modern icon library

### Backend & Services
- **Firebase Realtime Database** - Real-time data synchronization
- **Firebase Authentication** - Secure user authentication
- **Firebase Hosting** - Fast, secure web hosting
- **ImageBB API** - Cloud image storage and optimization

### Development Tools
- **Vite** - Fast build tool and development server
- **ESLint** - Code linting and quality assurance
- **Capacitor** - Native mobile app compilation
- **PWA Plugin** - Progressive Web App features

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Firebase project with Realtime Database
- ImageBB API key (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ohms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Realtime Database and Authentication
   - Copy your Firebase config to `src/config/firebase.ts`

4. **Set up environment variables**
   ```bash
   # Create .env file with:
   VITE_IMAGEBB_API_KEY=your_imagebb_api_key
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

### Deployment

#### Firebase Hosting
```bash
npm run deploy
```

#### Mobile App (Android)
```bash
npm run mobile:android
```

## 📱 Features Overview

### 🕐 Real-Time Class Routine
- **Current Class Detection** - Automatically highlights ongoing classes
- **Next Class Preview** - Shows upcoming class information
- **Admin Controls** - Class cancellation with persistent status
- **Time-Based Logic** - Accurate 12-hour format parsing and display

### 👥 Student Management
- **Complete Directory** - Name, roll number, contact info, blood group
- **Advanced Search** - Multi-field search with highlighting
- **Role Management** - CR (Class Representative) and CO-CR designations
- **Contact Integration** - Direct phone, email, and WhatsApp links
- **Image Management** - Cloud-based profile picture storage

### 📊 Attendance System
- **Digital Tracking** - Replace traditional paper-based attendance
- **Date-wise Records** - Historical attendance data
- **Admin Controls** - Mark attendance for entire class
- **Export Functionality** - Generate attendance reports

### 📢 Notice Board
- **Priority System** - High, medium, low priority announcements
- **Rich Content** - Support for formatted text and links
- **Admin Management** - Create, edit, delete announcements
- **Real-time Updates** - Instant notification delivery

### 📝 Notes Section
- **Subject Organization** - Categorized by academic subjects
- **Admin Publishing** - Controlled content creation
- **Link Integration** - External resource links
- **Date Management** - Organized by publication date

## 🔐 Security & Privacy

### Authentication
- **Firebase Auth** - Secure user authentication
- **Role-Based Access** - Admin and user permission levels
- **Session Management** - Automatic session handling

### Data Protection
- **Firebase Rules** - Database security rules
- **Input Validation** - Client and server-side validation
- **Image Security** - Secure cloud image storage
- **Console Protection** - Production console logging disabled

### Privacy Features
- **Data Minimization** - Only collect necessary information
- **User Control** - Users control their profile information
- **Secure Communication** - HTTPS encryption for all data transfer

## 🎯 Admin Features

### User Management
- **Access Control** - Approve/deny user registration
- **Role Assignment** - Assign admin privileges
- **User Monitoring** - Track user activity and permissions

### Content Management
- **Class Scheduling** - Create and modify class routines
- **Student Data** - Add, edit, remove student information
- **Announcements** - Publish and manage notices
- **Notes Publishing** - Create subject-wise study materials

### System Controls
- **Real-time Monitoring** - Live system status
- **Data Management** - Backup and restore capabilities
- **Analytics** - Usage statistics and insights

## 📱 Mobile Experience

### Progressive Web App
- **Installable** - Add to home screen on mobile devices
- **Offline Support** - Core functionality works without internet
- **Push Notifications** - Real-time updates and announcements
- **Native Feel** - App-like experience on mobile

### Responsive Design
- **Mobile-First** - Optimized for touch interfaces
- **Adaptive Layout** - Seamless experience across screen sizes
- **Touch Gestures** - Swipe navigation and interactions
- **Performance** - Optimized for mobile networks

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── sections/       # Main app sections
│   ├── ui/            # Reusable UI components
│   ├── mobile/        # Mobile-specific components
│   └── auth/          # Authentication components
├── hooks/              # Custom React hooks
├── services/           # API and external services
├── utils/              # Utility functions
├── context/            # React context providers
├── types/              # TypeScript type definitions
└── config/             # Configuration files
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
npm run deploy       # Deploy to Firebase
```

### Code Quality
- **TypeScript** - Full type safety
- **ESLint** - Code linting and formatting
- **Component Architecture** - Modular, reusable components
- **Performance Optimization** - Lazy loading and code splitting

## 👨‍💻 Developer Information

**Developer**: AbirX
**Portfolio**: [byabir.web.app](https://byabir.web.app)
**Platform**: Firebase Hosting

### Development Approach
- **Modern React Patterns** - Hooks, functional components, context API
- **Type-Safe Development** - Comprehensive TypeScript implementation
- **Performance-First** - Optimized bundle size and loading times
- **Accessibility** - WCAG compliant design and interactions
- **Mobile-Responsive** - Touch-friendly interface design

### Technical Expertise Demonstrated
- **Frontend Architecture** - Scalable React application structure
- **State Management** - Context API with custom hooks
- **Real-time Data** - Firebase integration and synchronization
- **UI/UX Design** - Custom retro theme with modern usability
- **PWA Implementation** - Service workers and offline functionality
- **Mobile Development** - Capacitor integration for native apps

## 📄 License

This project is proprietary software developed for educational use. All rights reserved.

## 🤝 Support

For technical support or feature requests, please contact the development team through the admin panel or official channels.

---

**OhmS** - Bringing retro aesthetics to modern class management 🎓✨
