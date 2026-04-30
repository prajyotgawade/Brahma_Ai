# 🤖 Brahma AI — Intelligent AI Pocket Agent Mobile Application

<div align="center">

**A production-grade, cross-platform AI-powered mobile application that puts an intelligent conversational agent right in your pocket — available on Android & iOS.**

[![GitHub](https://img.shields.io/badge/GitHub-prajyotgawade%2FBrahma__Ai-181717?style=for-the-badge&logo=github)](https://github.com/prajyotgawade/Brahma_Ai)
[![React Native](https://img.shields.io/badge/React_Native-Expo_SDK_54-61DAFB?style=for-the-badge&logo=react)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-99.7%25-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Backend-Firebase-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com)
[![Platform](https://img.shields.io/badge/Platform-Android_%7C_iOS-green?style=for-the-badge&logo=android)](https://github.com/prajyotgawade/Brahma_Ai)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Contact](#-contact)

---

## 🚀 About the Project

**Brahma AI** is a cross-platform mobile application built with React Native & Expo that serves as an intelligent AI pocket agent — always available, always smart.

In a world where AI is becoming essential, Brahma AI makes intelligent assistance accessible directly from your mobile device. Whether it's answering questions, assisting with tasks, or providing smart recommendations — Brahma AI is your always-on intelligent companion.

> Built entirely in **TypeScript** with a production-ready architecture, real authentication, Firebase backend, and EAS build pipeline — demonstrating full mobile development capability from idea to deployment.

---

## ✨ Features

### 🤖 AI Agent
- ✅ Intelligent, context-aware conversational AI responses
- ✅ Persistent chat history and session management
- ✅ Real-time AI interaction with smooth streaming UX
- ✅ Copy responses to clipboard instantly

### 🔐 Authentication & Security
- ✅ Secure user sign-up / sign-in via **Clerk**
- ✅ OAuth (social login) support
- ✅ Secure token storage using **Expo Secure Store**
- ✅ Protected routes with auth middleware

### 📱 Mobile Experience
- ✅ Fully cross-platform — runs on **Android & iOS**
- ✅ Native haptic feedback for premium feel
- ✅ Smooth animations powered by **React Native Reanimated**
- ✅ Blur effects, gradients & polished UI components
- ✅ Keyboard-aware scroll for seamless chat experience
- ✅ Image picker integration for multimodal input

### ⚙️ Technical
- ✅ File-based routing with **Expo Router**
- ✅ Real-time data sync with **Firebase**
- ✅ Type-safe codebase with **TypeScript (99.7%)**
- ✅ Production build pipeline via **EAS Build**
- ✅ Bottom tab navigation with custom icons

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React Native + Expo SDK 54 |
| **Language** | TypeScript |
| **Routing** | Expo Router (File-based) |
| **Authentication** | Clerk (OAuth, Secure Store, Auth Session) |
| **Backend & DB** | Firebase (Firestore / Realtime DB) |
| **Animations** | React Native Reanimated 4, React Native Gesture Handler |
| **Navigation** | React Navigation (Bottom Tabs + Native Stack) |
| **HTTP Client** | Axios |
| **UI Components** | Expo Vector Icons, Lucide React Native, Expo Linear Gradient |
| **Media** | Expo Image, Expo Image Picker |
| **Build & Deploy** | EAS Build (Expo Application Services) |
| **Dev Tools** | ESLint, TypeScript Compiler |

---

## 🏗 Architecture

```
Brahma AI — Architecture Overview

┌─────────────────────────────────────────────┐
│              Mobile Client (Expo)            │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Auth    │  │   Chat   │  │ Profile  │  │
│  │ (Clerk)  │  │   UI     │  │Settings  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│         │             │             │        │
│         └─────────────┼─────────────┘        │
│                       │                      │
│              Expo Router (Navigation)         │
└───────────────────────┬─────────────────────┘
                        │
           ┌────────────┴────────────┐
           │                         │
    ┌──────▼──────┐         ┌────────▼───────┐
    │   Clerk     │         │    Firebase     │
    │    Auth     │         │  (Firestore /  │
    │   Service   │         │  Realtime DB)  │
    └─────────────┘         └────────────────┘
                                     │
                            ┌────────▼───────┐
                            │    AI API      │
                            │  (via Axios)   │
                            └────────────────┘
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) installed globally
- [Expo Go](https://expo.dev/go) app on your phone (for quick testing)
- Firebase project set up at [console.firebase.google.com](https://console.firebase.google.com)
- Clerk account at [clerk.com](https://clerk.com)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/prajyotgawade/Brahma_Ai.git
cd Brahma_Ai
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_AI_API_KEY=your_ai_api_key
```

**4. Start the development server**
```bash
npx expo start
```

**5. Run on your device**

- Scan the QR code with **Expo Go** (Android/iOS)
- Press `a` for Android emulator
- Press `i` for iOS simulator

### Production Build (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

---

## 📁 Project Structure

```
Brahma_Ai/
├── app/                    # Expo Router — screens & layouts
│   ├── (auth)/             # Authentication screens
│   ├── (tabs)/             # Bottom tab screens
│   └── _layout.tsx         # Root layout with auth provider
├── Components/
│   └── Home/               # Home screen components
├── assets/                 # Images, fonts, icons
├── config/                 # Firebase & API configuration
├── shared/                 # Shared utilities & constants
├── hooks/                  # Custom React hooks
├── app.json                # Expo app configuration
├── eas.json                # EAS Build configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

---

## 📸 Screenshots

> 📱 Cross-platform mobile app running on Android & iOS

| Screen | Description |
|---|---|
| Onboarding | Welcome flow with app introduction |
| Sign In / Sign Up | Clerk-powered secure authentication |
| AI Chat | Main conversational AI interface |
| Chat History | Previous conversations & sessions |
| Profile | User settings and account management |

---

## 🗺 Roadmap

- [x] Core AI chat functionality
- [x] Clerk authentication integration
- [x] Firebase backend setup
- [x] Cross-platform Android & iOS support
- [x] EAS production build pipeline
- [ ] Voice input & speech-to-text
- [ ] Image/document analysis (multimodal AI)
- [ ] Push notifications
- [ ] Offline mode with local caching
- [ ] Play Store & App Store deployment

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create your branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 📬 Contact

**Prajyot Gawade**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-prajyotgawade-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/prajyotgawade)
[![GitHub](https://img.shields.io/badge/GitHub-prajyotgawade-181717?style=flat&logo=github)](https://github.com/prajyotgawade)

---

<div align="center">

⭐ **If you found this project useful, please give it a star!** ⭐

Built with ❤️ by Prajyot Gawade — Mumbai, India

</div>
