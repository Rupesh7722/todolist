# Task Management System

## Overview

The Task Management System is a fully functional full-stack web application designed to help users manage their daily tasks efficiently. The application is integrated with a backend for persistent data storage and provides a clean, modern, and user-friendly interface focused on productivity.


## Tech Stack

- Frontend: React.js, TypeScript, Vite, Material UI (MUI)
- Backend: Node.js, Express.js
- Database: MongoDB

## Setup Instructions

### Backend

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies
4. Configure environment variables (.env)
5. Start the backend server

### Frontend

1. Navigate to the frontend directory
2. Install dependencies
3. Start the development server
4. Open the application in the browser at http://localhost:5173

## Features Implemented

- Create, update, and delete tasks
- Backend-integrated task storage
- Category-based task organization
- Sidebar-based navigation
- Purge tasks functionality
- Modern dark-themed user interface
- Floating action button for quick task creation

- Future enhancement:
  - Task priorities and reminders

## Challenges and Solutions

Managing strict ESLint and TypeScript rules caused build-time errors due to unused variables and empty blocks. This was resolved by refactoring error handling logic and removing unused destructuring patterns.

Maintaining synchronization between frontend state and backend API responses required careful state management, which was handled by centralizing API calls and updating UI state based on backend responses.
