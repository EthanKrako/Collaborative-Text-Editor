# Collaborative Real-Time Editor

A lightweight real-time collaborative text editor built with Angular, NestJS, and Yjs. Multiple users can edit documents simultaneously with instant synchronization.

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Angular + TypeScript + RxJS |
| Backend | NestJS |
| Database | MongoDB |
| Real-time | Socket.IO + Yjs (CRDT) |
| Editor | Quill.js |
| Deployment | Docker |

## 🚀 Quick Start
To run the project locally using Docker, execute the following command from the root directory:

>docker-compose -f docker-compose.dev.yml up --build

Once the containers are running:

Frontend: Open http://localhost:4200  
Backend: Available at http://localhost:3000  
Database: Available at http://localhost:8081  
>**Note:** Since there is no authentication, simply open the app in multiple browser tabs or windows to test real-time collaboration.

## 🏗️ Architecture

The application uses a **CRDT-based synchronization** model with Yjs over Socket.IO for real-time collaboration. Key features:

- **Real-time sync**: Changes propagate instantly across all connected users
- **Debounce persistence**: Database saves are debounced every 5 seconds to reduce load
- **RxJS integration**: UI updates reactively based on socket events
- **Containerized**: Single Docker container for easy deployment
User Input → Quill Editor → Yjs CRDT → Socket.IO → NestJS → (5s debounce) → MongoDB

⚠️ Known Limitations  
This is a personal learning project, not production-ready:

❌ No authentication — all users share the same documents  
❌ No access control — anyone can delete any document  
❌ Database stores Yjs updates instead of storing the document text, which can take up a lot of memory really fast  
❌ Minimal UI design  
❌ No version history  
