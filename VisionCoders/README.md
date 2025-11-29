# PDF GPT - VisionCoders

A modern React + TypeScript application for PDF-based AI chat interactions with a beautiful 3D galaxy visualization interface.

## 🚀 Features

- **React 19** with TypeScript
- **3D Galaxy Visualization** using Three.js and React Three Fiber
- **Tailwind CSS** for modern, responsive UI
- **Vite** for fast development and building
- **React Router** for navigation
- **Framer Motion** for smooth animations
- **Supabase** integration ready (configured but not yet implemented)

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

## 🏗️ Build

```bash
npm run build
```

## 📁 Project Structure

```
VisionCoders/
├── src/
│   ├── animations/      # Login/Logout animations
│   ├── dashboard/       # Dashboard components
│   ├── galaxy/          # 3D galaxy scene components
│   ├── layout/          # Layout components (Sidebar, DashboardLayout)
│   ├── pages/           # Page components (Login, Signup, Profile)
│   ├── lib/             # Utility functions
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies
```

## 🎨 Tech Stack

- **Frontend Framework:** React 19.2.0
- **Language:** TypeScript 5.9.3
- **Bundler:** Vite 7.2.4
- **Styling:** Tailwind CSS 3.4.17
- **3D Graphics:** Three.js, React Three Fiber, React Three Drei
- **Animations:** Framer Motion, React Spring
- **Routing:** React Router DOM 7.9.6
- **State Management:** Zustand (ready for implementation)
- **Icons:** Lucide React

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 📝 Notes

- The application is currently set up with placeholder authentication
- Supabase integration is configured but needs to be connected
- Store implementations (useAuthStore, useChatStore) are ready for implementation
- The 3D galaxy scene is functional and displays orbit rings and stars

## 👥 Team

**VisionCoders** - Nirman 5.0 Hackathon

## 📄 License

This project is part of the Nirman 5.0 Hackathon.

