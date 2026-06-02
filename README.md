# AttendX
📋 AttendX — A smart, offline attendance tracker for college students. Track subject-wise attendance, manage your weekly timetable, visualize progress with animated circular charts, and backup/restore your data. Built with React Native &amp; Expo.

<div align="center">

# 📋 AttendX

### Smart Attendance Tracker for College Students

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=for-the-badge&logo=expo)](https://expo.dev/)
[![Platform](https://img.shields.io/badge/Platform-Android-3DDC84?style=for-the-badge&logo=android)](https://www.android.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

*Never miss a class. Always know where you stand.*

</div>

---

## 📱 About AttendX

**AttendX** is a beautiful, fast, and intuitive attendance tracking app built for college students. It helps you monitor your attendance percentage across all subjects, manage your weekly timetable, and get a visual overview of your academic attendance — all in one place.

The app is designed for **offline-first** use. No login, no cloud sync, no privacy concerns — all your data stays securely on your device.

---

## ✨ Features

### 🏠 Home Screen
- **Overall attendance percentage** displayed as an animated circular progress ring
- **Per-subject attendance cards** with individual circular progress indicators
- **Green glow hero card** with a premium glassmorphism visual effect
- **Launch animation** — attendance circles animate from 0% to actual value on every app open (session-aware: does not repeat when switching tabs)
- **Live semester info** displayed in the header

### ✅ Mark Attendance
- Mark yourself **Present** or **Absent** for each subject
- Navigate between days using a smooth date navigator
- Attendance updates instantly with haptic feedback
- Smart timetable awareness — shows only the subjects scheduled for the selected day

### 📅 Calendar View
- Monthly calendar with **color-coded date indicators**:
  - 🟢 Green — 75%+ attendance
  - 🟡 Yellow — 50–74% attendance
  - 🔴 Red — Below 50% attendance
- Tap any date to view attendance details for that day
- Calendar clears automatically when all subjects are deleted

### 📚 Subjects
- **Add, edit, and delete** subjects freely
- Set a custom **target attendance percentage** per subject
- Changes reflect instantly across all screens

### 🗓️ Timetable
- Build a **weekly slot-based timetable** (Monday–Saturday)
- Assign subjects to each time slot per day
- The Mark screen reads from your timetable automatically

### ⚙️ Settings
- 🌙 **Dark / Light mode** toggle — switches instantly with no delay
- 📤 **Export data** — backs up all subjects and timetable to a `.json` file and shares it via your device's share sheet
- 📥 **Import data** — restore from a backup file with a preview before applying
- 🎓 **Semester management** — start a new semester (resets attendance) or edit the current semester name
- 🎯 **Global target** — set an overall attendance target percentage for the whole app

### 🎨 UI & UX
- Premium dark and light themes
- Smooth micro-animations throughout
- Custom **splash intro screen** with logo shown for 1 second on launch
- **Default Light Mode** for new users
- Haptic feedback on attendance actions
- Responsive and snappy across all interactions

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React Native** | 0.81.5 | Core mobile framework |
| **Expo** | SDK 54 | Build toolchain & native APIs |
| **React** | 19.1.0 | UI library |
| **React Navigation** | v7 | Screen navigation & bottom tabs |
| **AsyncStorage** | 2.2.0 | Offline data persistence |
| **react-native-svg** | 15.12.1 | Circular progress rings |
| **react-native-calendars** | 1.1305.0 | Calendar view |
| **expo-haptics** | 15.x | Tactile feedback |
| **expo-file-system** | 19.x | File read/write for import/export |
| **expo-sharing** | 14.x | Native share sheet |
| **expo-document-picker** | 14.x | File picker for import |
| **@expo-google-fonts/inter** | — | Typography |
| **EAS Build** | — | Production APK generation |

---

## 📁 Project Structure

```
AttendX/
├── App.js                    # Root entry — handles splash & navigation
├── app.json                  # Expo app configuration
├── eas.json                  # EAS Build profiles
│
├── screens/
│   ├── HomeScreen.js         # Dashboard with attendance overview
│   ├── MarkScreen.js         # Daily attendance marking
│   ├── CalendarScreen.js     # Monthly calendar view
│   ├── SubjectsScreen.js     # Subject management
│   ├── TimetableScreen.js    # Weekly timetable editor
│   └── SettingsScreen.js     # App settings & data management
│
├── components/
│   ├── CircularProgress.js   # SVG-based circular progress ring
│   ├── SplashIntro.js        # App launch logo screen
│   ├── Header.js             # Global top header
│   ├── AnimatedTabIcon.js    # Animated bottom tab icons
│   ├── AttendanceButton.js   # Present/Absent action button
│   ├── ConfirmModal.js       # Reusable confirmation dialog
│   ├── DateNavigator.js      # Left/right date picker navigation
│   ├── DatePickerModal.js    # Full date picker modal
│   └── ImportPreviewModal.js # Data import preview modal
│
├── context/
│   ├── AttendanceContext.js  # Global state (subjects + attendance)
│   └── ThemeContext.js       # Dark/light mode state
│
├── utils/
│   ├── storage.js            # AsyncStorage helpers & defaults
│   └── importExport.js       # JSON backup/restore logic
│
├── constants/                # Colors, themes, shared constants
├── navigation/               # Bottom tab navigator setup
└── assets/                   # App icons, splash, logo images
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/client) app on your Android device (for development)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/AttendX.git
cd AttendX

# 2. Install dependencies
npm install

# 3. Start the development server
npx expo start
```

Then scan the QR code with **Expo Go** on your Android phone.

---

## 📦 Building the APK

This project uses **EAS Build** (Expo Application Services) to produce a production-ready APK.

### Setup (one-time)
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure your project
eas build:configure
```

### Build
```bash
eas build --platform android --profile preview
```

The built APK will be available for download from your [Expo dashboard](https://expo.dev).

---

## 📊 Data Storage

All app data is stored **locally on device** using `AsyncStorage`. No internet connection or user account is required.

| Data | Storage Key | Description |
|---|---|---|
| Subjects | `attendx_subjects` | List of all subjects |
| Attendance | `attendx_attendance` | Daily attendance records |
| Timetable | `attendx_timetable` | Weekly slot schedule |
| Settings | `attendx_settings` | Theme, target %, semester |

### Backup & Restore
Use the **Export** feature in Settings to save a `.json` backup to your device, and **Import** to restore it on any Android phone with AttendX installed.

---

## 🎨 Theming

AttendX supports full **Dark and Light mode**. The theme preference is saved persistently and new users start in **Light mode** by default.

The theme system is implemented via React Context (`ThemeContext`) and toggles synchronously — no animation delay or flash.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add: your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure your code follows the existing style and doesn't break existing features.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

Built with ❤️ by **mahi_10**

- GitHub: [@mahi_10](https://github.com/mahi_10)

---

<div align="center">

⭐ **If AttendX helps you track your attendance better, give it a star!** ⭐

</div>
