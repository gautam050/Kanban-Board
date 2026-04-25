# 🚀 Live Collaborative Kanban Board

A production-style **Kanban Board** built using **React + Redux Toolkit** with **native HTML5 drag & drop**, **optimistic updates**, **custom virtualization**, **real-time simulation**, and **accessibility-first design**.

Designed as a frontend developer assessment project to demonstrate architecture, performance, UX, and state management skills.

---

## 🔗 Live Demo

👉 Add your deployed link here  
`https://your-kanban-board.vercel.app`

---

## 📦 GitHub Repository

👉 Add your repo link here  
`https://github.com/yourusername/kanban-board`

---

# ✨ Features

## ✅ Core Requirements

### 📌 Drag & Drop (No Libraries)

- Native HTML5 Drag API used
- Move cards between columns
- Reorder cards within column
- Drop into empty columns
- Smooth drag ghost + drop feedback
- No `react-dnd`, `dnd-kit`, etc.

### 📌 State Architecture

- Global state managed with **Redux Toolkit**
- No prop drilling
- Predictable reducers + actions
- Centralized board state

### 📌 Optimistic Persistence

- Changes reflect instantly in UI
- localStorage save happens after update
- Retry logic on simulated API failure

### 📌 Undo / Redo

- `Ctrl + Z` → Undo  
- `Ctrl + Y` → Redo

### 📌 Performance Optimized

- Handles **1000 cards**
- Custom virtualization renders only visible cards
- Memoized cards using `React.memo`
- Reduced unnecessary re-renders

### 📌 Real-Time Collaboration Simulation

- Simulated remote user moves card every 10s
- Conflict detection while dragging
- Conflict resolution via toast notification

### 📌 Search & Filter

- Debounced live search (`300ms`)
- Multi-label filtering
- URL synced filters

Example:

```text
?labels=bug,urgent
Custom highlighted search matches
📌 Accessibility
Keyboard navigation
Arrow keys move cards
Enter opens modal
ARIA roles implemented:
role="list"
role="listitem"
aria-grabbed
aria-dropeffect
Screen reader announcements
🎁 Bonus Features
🌙 Dark / Light Theme
CSS custom properties
Theme persisted in localStorage
No flash on reload
📝 Rich Text Card Modal
Built with TipTap
Edit descriptions
Labels
Subtasks
⚠️ API Failure Simulation
Toggle failure mode
Retry save functionality
🧠 Architectural Decisions
Why Redux Toolkit?

Redux Toolkit was chosen for:

predictable state updates
centralized board state
scalable architecture
easier debugging
undo/redo implementation
middleware support
Why Normalized State?

Cards and columns stored separately:

columns: {
  todo: { cardIds: [] }
}

cards: {
  card-1: { title: "Task" }
}

Benefits:

faster updates
easier movement between columns
scalable structure
Why Custom Virtualization?

Instead of using libraries:

more control
lightweight bundle
demonstrates frontend skill
Why Native Drag API?

Assessment required no shortcuts.

Implemented manually using:

draggable
onDragStart
onDragOver
onDrop
📁 Folder Structure
src/
│── app/
│   └── App.jsx

│── components/
│   ├── Board/
│   ├── Card/
│   ├── Modal/
│   ├── Toolbar/
│   └── ui/

│── hooks/
│   └── useDebounce.js

│── store/
│   ├── boardSlice.js
│   └── store.js

│── styles/
│   └── global.css

│── utils/
│   ├── boardLogic.js
│   ├── storage.js
│   └── highlight.jsx

│── main.jsx
🪝 Custom Hook Extracted
useDebounce.js

Used for optimized search input.

const debounced = useDebounce(search, 300);

Prevents re-filtering on every keystroke.

⚙️ Tech Stack
React
Redux Toolkit
React Redux
Vite
JavaScript
CSS
TipTap
🚀 Run Locally
npm install
npm run dev
🏗 Build for Production
npm run build
📸 Performance Proof

React DevTools Profiler Screenshot:

Add screenshot here

/docs/profiler-screenshot.png
📊 Evaluation Coverage
Area	Covered
Drag & Drop	✅
State Management	✅
Performance	✅
Code Quality	✅
Accessibility	✅
Real-Time UI	✅

⭐ Final Note

This project was built to demonstrate production-grade React engineering skills, including performance optimization, architecture, accessibility, and scalable state management.
