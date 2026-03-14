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
* **Flexible Layouts:** Drag-and-drop slide reordering with bottom navigation panel.
* **Language Locking:** First slide's language locks all slides for consistent presentations.
* **Dynamic Mode:** Enable mixed-language slides for multi-language tutorials.
* **Responsive Design:** Optimized for desktop, tablet, and mobile devices.

---

## 🎯 Language Management

### 🔒 Locked Mode (Default)
- **First slide controls all**: The language selected on Slide 1 is automatically applied to all slides
- **Consistent presentations**: Perfect for single-language code tutorials
- **Easy to change**: Update Slide 1's language to change all slides at once
- **Visual indicators**: Locked slides show "Locked to Slide 1" with info tooltips

### 🔄 Dynamic Mode
- **Mixed languages**: Select "🔄 Dynamic (Mixed Languages)" on Slide 1 to enable
- **Per-slide languages**: Each slide can use a different programming language
- **Ideal for**: Multi-language comparisons, polyglot tutorials, or framework migrations
- **Flexible**: Add slides with any language independently

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
│   ├── ui/                     # Reusable Radix-based components
│   ├── CodeEditor.tsx          # Syntax-highlighted editor & settings
│   ├── Editor.tsx              # Main editor page with responsive layout
│   ├── BottomSlidesPanel.tsx   # Bottom slide navigation (replaces sidebar)
│   ├── SlidePreview.tsx        # Real-time "Magic Move" viewer
│   ├── Dashboard.tsx           # Project management dashboard
│   └── Settings.tsx            # Storage & app settings
├── remotion/
│   └── RemotionVideo.tsx       # Video composition logic
├── store/
│   ├── useStore.ts             # Global state with language locking logic
│   └── useProjectStore.ts      # Project management with localStorage
└── types.ts                    # TypeScript definitions & language constants
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

## 📱 Responsive UI Layout

### Desktop
- **Left**: Dashboard navigation (back button)
- **Center**: Slide preview (aspect ratio maintained)
- **Right**: Code editor with settings panel
- **Bottom**: Collapsible slide navigation panel with drag-and-drop

### Mobile/Tablet
- **Top**: Header with project name and controls
- **Middle**: Stacked preview and editor (40% height each)
- **Bottom**: Compact slide navigation (collapsible)
- **Touch-optimized**: All controls sized for mobile interaction

### Bottom Slide Panel
- **Horizontal scroll**: Browse slides left-to-right
- **Drag-and-drop**: Reorder slides by dragging
- **Quick preview**: See code snippets and language badges
- **Collapse/Expand**: Toggle visibility with chevron button
- **Slide info**: Shows slide number, language, and duration

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

**Language not changing on all slides?**
- Only Slide 1 can change the language for all slides (when not in Dynamic mode)
- Look for the "Locked to Slide 1" indicator on other slides
- Change the language on Slide 1 to update all slides automatically

**Dynamic mode not working?**
- Select "🔄 Dynamic (Mixed Languages)" on Slide 1
- Each subsequent slide can then have its own language
- First slide uses TypeScript as fallback for highlighting
