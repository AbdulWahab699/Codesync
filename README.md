# CodeSync — Real-time Collaborative Code Editor

> Code together. Build faster.

A production-grade collaborative code editor where multiple developers can write, edit, and execute code simultaneously in real time — with live cursors, conflict-free editing powered by CRDTs, and sandboxed Docker execution.

**Live Demo:** [codesync.vercel.app](#) · **Backend:** [codesync-api.railway.app](#)

---

## What Makes This Different

Most "collaborative editors" are just shared text boxes over WebSockets. CodeSync handles the hard problems:

- **Two users editing the same line simultaneously** — Yjs CRDTs resolve conflicts mathematically. Nothing gets lost, nothing gets overwritten.
- **Arbitrary code execution** — User code runs inside isolated Docker containers with memory limits, CPU limits, and zero network access. Your server stays safe.
- **Cursor presence** — Every user sees exactly where teammates are typing, with colored cursors and username labels updated in real time via Yjs Awareness.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Code Editor | Monaco Editor (VS Code engine) |
| Real-time Sync | Yjs CRDT, y-websocket, WebsocketProvider |
| WebSockets | Socket.io |
| Backend | Node.js, Express.js |
| Auth | JWT, bcryptjs |
| Database | MongoDB, Mongoose |
| Code Execution | Docker (child_process), sandboxed containers |
| Routing | React Router v6 |
| Animations | Framer Motion |
| Icons | Lucide React |

---

## Features

- **Real-time collaborative editing** — Multiple users edit simultaneously with zero conflicts via Yjs CRDTs
- **Live cursors** — See where every teammate is typing with colored cursor labels using Monaco Content Widgets + Yjs Awareness
- **Code execution** — Run JavaScript, Python, and C++ in isolated Docker containers
- **Sandboxed execution** — 50MB memory limit, 50% CPU limit, no network access, auto-timeout at 5 seconds
- **User presence** — See who is online in your room in real time
- **Auto-save** — Code saves to MongoDB debounced at 2 seconds after last keystroke
- **Persistent rooms** — Rejoin any room and your code is exactly where you left it
- **JWT Authentication** — Secure register, login, protected routes
- **Room system** — Create rooms with unique IDs, share IDs to invite teammates

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     CLIENT (React)                   │
│  Monaco Editor + Yjs ──► WebsocketProvider ──────┐  │
│  Socket.io Client ───────────────────────────┐   │  │
└──────────────────────────────────────────────│───│──┘
                                               │   │
                ┌──────────────────────────────│───│──┐
                │         EXPRESS SERVER        │   │  │
                │  REST API (auth, rooms) ◄─────┘   │  │
                │  Socket.io Server (presence) ◄────┘  │
                │  Docker Executor (code runner)        │
                └───────────────┬───────────────────────┘
                                │
                ┌───────────────▼────────────┐
                │    Yjs WebSocket Server     │
                │    (port 1234 — CRDT sync)  │
                └───────────────┬────────────┘
                                │
                ┌───────────────▼────────────┐
                │    MongoDB Atlas            │
                │    Users, Rooms, Code       │
                └────────────────────────────┘
```

---

## How CRDTs Work (The Hard Part)

When two users type simultaneously, a naive system picks one edit and discards the other. CRDTs (Conflict-free Replicated Data Types) solve this mathematically:

```
User A types " World" at position 5  →  "Hello World"
User B types " Wahab" at position 5  →  "Hello Wahab"

CRDT result  →  "Hello World Wahab"   ← both edits survive, deterministic
```

Yjs implements a CRDT called **YATA** (Yet Another Transformation Approach). Every character insertion is tagged with a unique client ID and vector clock position. Inserts are ordered by their origin, so all clients always converge to the same document regardless of network order.

---

## How Docker Execution Works

```
User clicks Run
     │
     ▼
Express receives { code, language }
     │
     ▼
child_process.exec() runs:
  docker run
    --rm                    (auto-delete container)
    --memory=50m            (50MB RAM limit)
    --cpus=0.5              (50% CPU limit)
    --network none          (no internet access)
    node:18-alpine node -e "user code here"
     │
     ▼
Output streams back to frontend
     │
     ▼
Container destroyed automatically
```

Timeout kills the container at 5 seconds — infinite loops can't hang your server.

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Docker Desktop running

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/codesync.git
cd codesync
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `.env` in `/backend`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
PORT=5000
```

Start the Express server:

```bash
npm run dev
```

Start the Yjs WebSocket server (new terminal):

```bash
node yjsServer.js
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `.env` in `/frontend`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

### 4. Open the app

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Yjs server: `ws://localhost:1234`

---

## Project Structure

```
codesync/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js      # register, login + validation
│   │   │   └── roomController.js      # create, join, get, saveCode
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js      # JWT protect middleware
│   │   ├── models/
│   │   │   ├── User.js                # username, email, password (hashed)
│   │   │   └── Room.js                # roomId (uuid), code, language, members
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── roomRoutes.js
│   │   │   └── executionRoutes.js
│   │   ├── services/
│   │   │   └── executionController.js # Docker sandboxed execution
│   │   └── socket/
│   │       └── socketHandler.js       # join-room, presence, disconnect
│   ├── yjsServer.js                   # Yjs WebSocket server (port 1234)
│   ├── index.js                       # Express + Socket.io entry
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Editor.jsx             # Monaco + Yjs CRDT + live cursors
    │   │   ├── Toolbar.jsx            # language selector, run, copy ID
    │   │   ├── Terminal.jsx           # output panel
    │   │   └── UserPresence.jsx       # online users bar
    │   ├── pages/
    │   │   ├── HomePage.jsx           # landing page
    │   │   ├── LoginPage.jsx          # auth with validation
    │   │   ├── RegisterPage.jsx       # auth with validation
    │   │   └── RoomPage.jsx           # room lobby + editor layout
    │   ├── routes/
    │   │   └── AppRoutes.jsx          # protected routes
    │   ├── socket/
    │   │   └── socket.js              # singleton socket instance
    │   └── App.jsx
    └── .env
```

---

## Environment Variables

### Backend `.env`

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `PORT` | Server port (default 5000) |

### Frontend `.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL |

---

## Key Technical Decisions

**JWT over Sessions** — Stateless auth scales better for real-time apps. No DB lookup on every WebSocket message.

**Yjs over manual OT** — Implementing Operational Transformation from scratch is months of work. Yjs is a battle-tested CRDT library used in production by dozens of major apps.

**Monaco over CodeMirror** — Same engine as VS Code. Richer API for cursor decorations and content widgets needed for live cursor implementation.

**child_process over dockerode** — Simpler, same security guarantees. dockerode SDK adds unnecessary complexity for single-file execution.

**Debounced save at 2s** — Saving on every keystroke would hammer MongoDB with thousands of writes per minute. 2 second debounce reduces writes by ~95% while still feeling instant.

---

## What I Learned Building This

- **Distributed systems fundamentals** — How CRDTs resolve concurrent edits without coordination
- **WebSocket architecture at depth** — Room management, reconnection, state sync, awareness protocol
- **Container security** — Sandboxing untrusted code with resource limits and network isolation
- **Monaco Editor internals** — Content Widgets API for persistent cursor overlays
- **Debouncing in React** — Using refs instead of state for performance-critical callbacks

---

## Author

**Abdul Wahab**
BS Software Engineering — COMSATS University Islamabad (3rd Semester)
Upwork Freelancer — Shopify Development

[GitHub](https://github.com/YOUR_USERNAME) · [LinkedIn](https://linkedin.com/in/YOUR_USERNAME) · [Upwork](#)

---

## License

MIT License — feel free to use, modify, and distribute.
