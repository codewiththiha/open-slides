# OpenSlides

**OpenSlides** is a specialized presentation tool designed for developers to create high-quality code presentations and videos with seamless "magic move" transitions between snippets. Powered by **Remotion** and **Shiki Magic Move**, it allows users to animate code changes smoothly, making it ideal for tutorials, live demos, and technical storytelling.

---

## 🚀 Features

* **Magic Move Transitions:** Smoothly animate code changes between slides using `shiki-magic-move`.
* **Real-time Preview:** Interactive editor with an instant preview of the current slide.
* **Video Export:** Preview and prepare videos for export using Remotion's frame-accurate rendering engine.
* **Customizable Themes:** Choose from 16+ professional syntax highlighting themes (e.g., Dracula, Nord, Github Dark).
* **Project Management:** Create, save, and manage multiple presentation projects with local storage persistence.
* **Modern Editor:** Syntax-highlighted code editor with adjustable font size and collapsible panels.
* **Presentation Mode:** Full-screen mode with keyboard navigation (ESC to exit).
* **Flexible Layouts:** Drag-and-drop slide reordering and dedicated settings panel.

---

## 🛠️ Tech Stack

* **Framework:** [React](https://react.dev/) with [Vite](https://vitejs.dev/)
* **Routing:** [React Router](https://reactrouter.com/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/) icons
* **State Management:** [Zustand](https://github.com/pmndrs/zustand)
* **Animations:** [Shiki Magic Move](https://shiki-magic-move.netlify.app/)
* **Video Engine:** [Remotion](https://www.remotion.dev/)
* **Components:** [Radix UI](https://www.radix-ui.com/) primitives
* **Drag & Drop:** [@dnd-kit](https://dndkit.com/)

---

## 📖 Project Structure

```text
src/
├── components/
│   ├── ui/             # Reusable Radix-based components
│   ├── CodeEditor.tsx  # Syntax-highlighted editor & settings
│   ├── Sidebar.tsx     # Slide management & reordering
│   ├── SlidePreview.tsx # Real-time "Magic Move" viewer
│   ├── Dashboard.tsx   # Project management dashboard
│   └── Settings.tsx    # Storage & app settings
├── remotion/
│   └── RemotionVideo.tsx # Video composition logic
├── store/
│   ├── useStore.ts     # Global state for slides and settings
│   └── useProjectStore.ts # Project management with localStorage
└── types.ts            # TypeScript definitions
```

---

## ⚙️ Configuration & Controls

### Editor Settings

* **Editor Font Size:** Adjust code editor font size (10-24px) independently.
* **Preview Font Size:** Control preview and presentation font size (12-32px).
* **Line Height:** Adjust line spacing for better readability.
* **Line Numbers:** Toggle line numbers in editor and preview.

### Animation Settings

* **Transition Duration:** Time taken to move characters between states.
* **Stagger Delay:** Incremental delay between character movements for organic feel.
* **Global Overrides:** Toggle global settings to apply uniform animations.

### Playback

* **Slide Duration:** Set how long each slide remains visible in the final video.
* **Navigation:** Use `<` and `>` buttons in expanded editor mode to switch slides.

---

## 🛠️ Getting Started

### Frontend Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

3. **Create a Project:**
Click **New Project** on the dashboard to start your presentation.

### Backend Setup (Optional - for MP4 Export)

1. **Navigate to server directory:**
```bash
cd server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run the backend server:**
```bash
npm start
```

4. **Export MP4:**
- Click **Export** in the editor
- Click **Download MP4** to render and download your video

> **Note:** Backend requires [FFmpeg](https://ffmpeg.org/) installed on your system.

---

## 💾 Storage Management

* All projects are automatically saved to browser's localStorage.
* Access **Settings** from the dashboard to manage storage.
* Delete individual projects or clear all data.

---

## 🎬 Video Export

The backend server uses Remotion Renderer to generate MP4 files:
- **Format:** H.264 MP4 (1920x1080, 30fps)
- **Quality:** High (CRF 18)
- **Cleanup:** Files auto-deleted after 1 hour

---

## ⚠️ Troubleshooting

**Download MP4 button not working?**
- Make sure the backend server is running (`npm start` in `/server`)
- Check if FFmpeg is installed on your system
- Verify `VITE_API_URL` in `.env` matches your backend port
