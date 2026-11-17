# Messaging App - Paused project

A modern real-time messaging application built with React, Supabase for backend/database, and ImageKit.io for media handling.

## Features

- 🔐 User authentication (signup, login, password reset)
- 💬 Real-time messaging
- 📸 Image attachments with ImageKit.io
- 🟢 Online/offline status
- ✏️ Edit and delete messages
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, React Router v6, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Realtime)
- **Media Storage**: ImageKit.io
- **State Management**: React Context + Custom Hooks
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- ImageKit.io account

### Installation

1. Clone the repository
2. Navigate to the react-app folder:
   ```bash
   cd react-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

5. Set up your Supabase database by running the SQL schema in `src/services/supabase.js`

6. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
VITE_IMAGEKIT_AUTH_ENDPOINT=http://localhost:3001/auth
```

## Database Schema

The app uses two main tables that mirror your original PHP structure:

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (from Supabase Auth) |
| username | VARCHAR(30) | Unique username |
| email | VARCHAR(50) | User email |
| avatar_url | TEXT | Profile picture URL |
| created_at | TIMESTAMP | Account creation date |
| is_verified | BOOLEAN | Email verification status |
| verification_token | VARCHAR(255) | Email verification token |
| verification_token_expires | TIMESTAMP | Token expiration |
| reset_token | VARCHAR(255) | Password reset token |
| reset_token_expires | TIMESTAMP | Reset token expiration |
| is_online | BOOLEAN | Online status |
| last_seen | TIMESTAMP | Last activity time |

### Messages Table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| sender_id | UUID | Foreign key to users |
| receiver_id | UUID | Foreign key to users |
| message | TEXT | Message content |
| image_url | TEXT | Attached image URL |
| sent_at | TIMESTAMP | Message timestamp |
| is_read | BOOLEAN | Read status |
| is_edited | BOOLEAN | Edit status |
| edited_at | TIMESTAMP | Last edit time |

## Project Structure

```
react-app/
├── src/
│   ├── components/
│   │   ├── auth/         # Authentication components
│   │   ├── chat/         # Chat UI components
│   │   ├── contacts/     # Contact management
│   │   ├── layout/       # Layout components
│   │   ├── media/        # Media handling
│   │   ├── profile/      # User profile
│   │   └── ui/           # Reusable UI components
│   ├── context/          # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── styles/           # CSS files
│   └── utils/            # Helper functions
├── public/
└── package.json
```

## ImageKit.io Setup

For image uploads to work, you need to create a backend authentication endpoint. ImageKit requires server-side authentication for uploads.

## License

MIT
