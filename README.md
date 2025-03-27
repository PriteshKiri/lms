# Zen Academy LMS

Zen Academy is an AI-powered Learning Management System (LMS) designed for structured learning with a simple, intuitive interface. Built with Vite React and Tailwind CSS for the frontend and Supabase for the backend.

## Features

- **User Authentication**: Email and password login with role-based access
- **Role-Based Access Control**: Admin and normal user roles with different permissions
- **Learning Interface**: YouTube video player with module and chapter navigation
- **Admin Features**: Manage courses, chapters, and users
- **User Settings**: Update profile information

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Supabase (Authentication, Database)
- **Video Player**: React YouTube

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Setup Supabase

1. Create a new Supabase project
2. Run the `setup_database.sql` script in the Supabase SQL Editor to create all required tables and set up Row Level Security (RLS) policies
3. Set up initial users by following the instructions in the `SETUP_USERS.md` file

#### Default Login Credentials

After setting up the users, you can log in with:

**Admin User:**
- Email: admin@zenacademy.com
- Password: password123

**Normal User:**
- Email: user@zenacademy.com
- Password: password123

### Environment Setup

1. Clone the repository
2. Create a `.env` file in the root directory with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
zen-academy-lms/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Layout.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Learn.jsx
│   │   ├── Login.jsx
│   │   ├── ManageCourse.jsx
│   │   ├── ManageUsers.jsx
│   │   └── Settings.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## License

MIT