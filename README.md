# OpenSlides

**OpenSlides** is a specialized presentation tool designed for developers to create high-quality code presentations and videos with seamless "magic move" transitions between snippets. Powered by **Remotion** and **Shiki Magic Move**, it allows users to animate code changes smoothly, making it ideal for tutorials, live demos, and technical storytelling.

---

## 🚀 Features

* **Magic Move Transitions:** Smoothly animate code changes between slides using `shiki-magic-move`.
* **Real-time Preview:** Interactive editor with an instant preview of the current slide.
* **Video Export:** Preview and prepare videos for export using Remotion's frame-accurate rendering engine.
* **Customizable Themes:** Choose from 16+ professional syntax highlighting themes (e.g., Dracula, Nord, Github Dark).
* **Flexible Layouts:** Drag-and-drop slide reordering and a dedicated settings panel for fine-tuning animations.
* **Presentation Mode:** Full-screen mode with keyboard navigation support.

---

## 🛠️ Tech Stack

* **Framework:** [React](https://react.dev/) with [Vite](https://vitejs.dev/)
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
│   ├── CodeEditor.tsx  # Slide & animation settings
│   ├── Sidebar.tsx     # Slide management & reordering
│   ├── SlidePreview.tsx # Real-time "Magic Move" viewer
├── remotion/
│   └── RemotionVideo.tsx # Video composition logic
├── store/
│   └── useStore.ts     # Global state for slides and settings
└── types.ts            # TypeScript definitions

```

---

## ⚙️ Configuration & Controls

### Animation Settings

You can control animations globally or per-slide:

* **Transition Duration:** Time taken to move characters between states.
* **Stagger Delay:** Incremental delay between character movements for a more organic feel.

### Playback

* **Slide Duration:** Set how long each slide remains visible in the final video.
* **Global Overrides:** Toggle global settings to apply uniform animations across the entire deck.

---

## 🛠️ Getting Started

1. **Install dependencies:**
```bash
npm install

```


2. **Run the development server:**
```bash
npm run dev

```


3. **Export Preview:**
Click the **Export** button in the header to preview the full Remotion video sequence.


---

> [!NOTE]
> Rendering full MP4 files currently requires a backend or `ffmpeg.wasm` implementation; the Export modal provides a high-fidelity preview of the final animation logic.``
