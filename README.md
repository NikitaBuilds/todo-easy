# Todo App

A modern, full-stack todo application built with Next.js 15, TypeScript, and TanStack Query. Features a clean architecture following established patterns for maintainability and scalability.

## ✨ Features

- **Add & Manage Todos**: Create, update, and delete todos with real-time feedback
- **Smart Filtering**: View all todos, active only, or completed only
- **Progress Tracking**: Live statistics showing total, active, and completed todos
- **Optimistic Updates**: Instant UI feedback with automatic rollback on errors
- **Persistent Storage**: Todos are saved to localStorage and persist between sessions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Automatic dark/light theme based on system preferences

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **State Management**: TanStack Query (React Query) with optimistic updates
- **Styling**: Tailwind CSS with responsive design
- **Data Storage**: localStorage (no external database required)
- **Architecture**: Service layer pattern with clean separation of concerns

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd crypto-real-estate-0
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the app in action.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/todos/           # RESTful API routes
│   │   ├── route.ts         # GET, POST /api/todos
│   │   └── [id]/route.ts    # GET, PATCH, DELETE /api/todos/[id]
│   ├── layout.tsx           # Root layout with QueryProvider
│   └── page.tsx             # Main todo interface
├── services/todos/          # Business logic layer
│   ├── types/index.ts       # TypeScript interfaces
│   ├── hooks/index.ts       # React Query hooks
│   └── index.ts             # Service exports
├── components/
│   └── QueryProvider.tsx    # TanStack Query configuration
└── lib/
    └── todoStore.ts         # localStorage data persistence
```

## 🏗 Architecture Patterns

This project demonstrates several key architectural patterns:

- **Service Layer Architecture**: Clean separation between UI and business logic
- **Consistent API Design**: Standardized request/response formats with proper error handling
- **Type Safety**: End-to-end TypeScript with proper interfaces and type guards
- **Optimistic Updates**: Immediate UI feedback with automatic error recovery
- **Caching Strategy**: Smart caching based on data volatility patterns

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 API Endpoints

- `GET /api/todos` - Fetch all todos
- `POST /api/todos` - Create a new todo
- `GET /api/todos/[id]` - Fetch a specific todo
- `PATCH /api/todos/[id]` - Update a todo
- `DELETE /api/todos/[id]` - Delete a todo

## 🔧 Development

The app uses localStorage for data persistence, so no external database setup is required. All data is stored locally in your browser and will persist between sessions.

## 📄 License

This project is for demonstration purposes.
