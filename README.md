# CollabCode
A real-time, browser-based collaborative cloud IDE featuring zero-latency multiplayer coding, an AI pair programmer, and secure containerized code execution.
CollabCode is an enterprise-grade, browser-based collaborative cloud IDE inspired by VS Code and GitHub. It empowers developers to build, edit, and execute full-stack web applications together in real time without needing a local development environment. 

Featuring zero-conflict multiplayer synchronization, live communication, and an integrated AI pair programmer, CollabCode provides a complete, cloud-native workspace for modern engineering teams.

## 🚀 Key Features

### 💻 The Workspace
* **VS Code in the Browser**: Powered by the Monaco Editor, complete with a file explorer, multi-tab support, and advanced syntax highlighting.
* **Real-Time Multiplayer Coding**: Utilizes Yjs (CRDTs) and WebSockets for seamless concurrent editing, live cursors, and active presence tracking.
* **Secure Code Execution**: Compiles and runs code inside isolated Docker containers, streaming terminal output back to the frontend safely via Xterm.js.

### 🤖 AI & Communication
* **AI Pair Programmer**: Integrates the Groq and Google Gemini APIs for instant code autocompletion, syntax debugging, and time/space complexity analysis.
* **Integrated Communication**: Features Redis-backed real-time text chat and WebRTC for peer-to-peer audio and video calls directly within the coding workspace.

### 🔐 Platform Management
* **Developer Dashboard**: A GitHub-style landing page featuring a dynamic contribution activity graph, user profile, and quick access to active workspaces.
* **Role-Based Access Control (RBAC)**: Fine-grained permissions allowing users to join workspaces as Admins, Editors, or Viewers.
* **Version Control Sync**: Import existing repositories and push commits directly back to GitHub using OAuth integration.

## 🛠️ Technology Stack

**Frontend**
* React.js
* Monaco Editor (Code editing engine)
* Xterm.js (Web terminal)
* WebRTC (Peer-to-peer A/V calls)

**Backend & Synchronization**
* Node.js & Express
* Socket.IO & WebSockets (Low-latency communication)
* Yjs (Conflict-free Replicated Data Types for state sync)
* Redis (Pub/Sub messaging for chat and presence)

**Database & Infrastructure**
* MongoDB (Workspace metadata, user profiles, and directory trees)
* Firebase Auth (Authentication)
* Docker (Isolated sandboxed execution environments)
* Groq API & Google Gemini API (AI integrations)

## 🏗️ Architecture Highlights
* **Zero-Conflict Sync**: Achieves high-performance state synchronization across distributed clients using CRDT mathematical models.
* **Containerized Execution**: Protects the host server by routing all unknown user code into ephemeral, resource-limited Docker containers.
* **Event-Driven Messaging**: Employs a Redis pub/sub architecture to broadcast real-time socket events across multiple active workspace channels.
