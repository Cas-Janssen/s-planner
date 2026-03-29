<div align="center">

# Planner App

### A collaborative kanban-style planner for students and teams

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socket.io)](https://socket.io)

</div>

Planner App helps users organize projects with boards, columns, and tasks, while keeping collaboration smooth through realtime updates, role-based access, and board activity history.

## Highlights

- Drag-and-drop kanban workflow for columns and tasks
- Board-level permissions with manager/member/viewer roles
- Realtime collaboration powered by Socket.IO
- Activity log to track board events
- Invites and member management per board
- Authentication with email/password and optional Google/GitHub OAuth
- Responsive UI built with Next.js App Router, Tailwind CSS, and Radix UI

## Tech Stack

| Layer      | Technology                                                 |
| ---------- | ---------------------------------------------------------- |
| Frontend   | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Radix UI |
| Backend    | Next.js server runtime + custom Node server                |
| Realtime   | Socket.IO                                                  |
| Auth       | Better Auth                                                |
| Database   | MongoDB with Prisma ORM                                    |
| Validation | Zod                                                        |

## Project Structure

```text
src/
	app/
		(auth)/          # sign-in / sign-up
		(main)/
			boards/        # board list + board detail pages
			dashboard/     # profile and account settings
	components/        # shared and UI components
	lib/
		actions/         # server actions for boards/columns/tasks/invites
		auth/            # auth configuration
		socket/          # realtime events + hooks
prisma/
	schema.prisma      # MongoDB data model
server.ts            # custom Next.js + Socket.IO server
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority"

# Optional OAuth providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Runtime
NODE_ENV="development"
HOSTNAME="localhost"
PORT="3000"

# Public branding
NEXT_PUBLIC_APP_NAME="Planner App"
```

### 3. Prepare Prisma client and database

```bash
npx prisma generate
npx prisma db push
```

### 4. Start development server

```bash
npm run dev
```

Open http://localhost:3000

## Available Scripts

```bash
npm run dev        # Start custom Next.js + Socket.IO development server
npm run dev:next   # Start plain Next.js dev server (Turbopack)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Lint codebase
```

## Realtime Architecture

- Socket.IO endpoint: `/api/socketio`
- Clients join board rooms by board id
- Board updates are broadcast to connected members in the same room

## Deployment

For production:

```bash
npm run build
npm run start
```

Deployment options:

- Self-host Node.js server (recommended for Socket.IO support)
- Platform hosting with WebSocket support enabled

## Publish Checklist

- Add production environment variables in your hosting platform
- Ensure MongoDB network access/allowlist is configured
- Confirm OAuth callback URLs for Google/GitHub (if used)
- Run lint and test critical board flows before release
- Add a LICENSE file if you plan to open source the project

## Roadmap Ideas

- Board templates
- Due-date reminders and notifications
- File attachments for tasks
- Activity filtering and analytics

## Acknowledgements

- Next.js
- Prisma
- Better Auth
- Radix UI
- Socket.IO
