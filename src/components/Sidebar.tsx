/**
 * @file Sidebar.tsx
 * @description Sidebar component for managing the presentation's slide deck.
 * @offers
 * - Drag-and-drop reordering of slides using dnd-kit.
 * - Visual thumbnails for each slide's code.
 * - Actions to add or remove slides from the deck.
 * @flow
 * Users interact with the sidebar to organize their presentation flow. 
 * Selecting a slide updates the central editor and preview.
 */
import { useStore } from "../store/useStore";

import { cn } from "../lib/utils";
import { Plus, Trash2, LayoutTemplate, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableSlideItem({ slide, index }: { slide: any; index: number }) {
  const { currentSlideId, setCurrentSlide, removeSlide } = useStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => setCurrentSlide(slide.id)}
      className={cn(
        "group relative flex cursor-pointer flex-col gap-2 rounded-lg border p-3 transition-all hover:bg-muted/50",
        currentSlideId === slide.id
          ? "border-primary bg-muted ring-1 ring-primary/20"
          : "bg-background hover:border-primary/50",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Slide {index + 1}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            removeSlide(slide.id);
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="h-12 overflow-hidden rounded bg-muted/30 p-1.5 pointer-events-none">
        <pre className="text-[6px] leading-[8px] text-muted-foreground/70 select-none font-mono">
          {slide.code.slice(0, 100)}
        </pre>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { slides, addSlide, reorderSlides } = useStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex((s) => s.id === active.id);
      const newIndex = slides.findIndex((s) => s.id === over.id);
      reorderSlides(oldIndex, newIndex);
    }
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex items-center gap-2 border-b p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <LayoutTemplate className="h-5 w-5" />
        </div>
        <h1 className="text-lg font-bold tracking-tight">OpenSlides</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={slides.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {slides.map((slide, index) => (
                <SortableSlideItem key={slide.id} slide={slide} index={index} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="border-t p-4">
        <Button onClick={addSlide} className="w-full">
          <Plus className="h-4 w-4" />
          Add Slide
        </Button>
      </div>
    </div>
  );
}
