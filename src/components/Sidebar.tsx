/**
 * @file Sidebar.tsx
 * @description Optimized sidebar with improved drag-and-drop performance and collapsible functionality.
 */
import { useStore } from "../store/useStore";
import { cn } from "../lib/utils";
import { Plus, Trash2, LayoutTemplate, GripVertical, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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
import { useCallback, useMemo } from "react";

interface SidebarProps {
  onNavigateBack?: () => void;
  projectName?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Memoized slide item component for better performance
const SortableSlideItem = ({ slide, index }: { slide: any; index: number }) => {
  const { currentSlideId, setCurrentSlide, removeSlide } = useStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: slide.id,
    transition: { duration: 150, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = useCallback(() => {
    setCurrentSlide(slide.id);
  }, [slide.id, setCurrentSlide]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    removeSlide(slide.id);
  }, [slide.id, removeSlide]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      className={cn(
        "group relative flex cursor-pointer flex-col gap-2 rounded-lg border p-2.5 transition-all hover:bg-muted/50 active:scale-[0.98]",
        currentSlideId === slide.id
          ? "border-primary/50 bg-muted ring-1 ring-primary/20"
          : "bg-background/50 hover:border-primary/30",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-medium text-muted-foreground truncate">
            Slide {index + 1}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
          onClick={handleRemove}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <div className="h-10 overflow-hidden rounded bg-muted/30 p-1.5 pointer-events-none flex-shrink-0">
        <pre className="text-[5px] leading-[7px] text-muted-foreground/70 select-none font-mono line-clamp-3">
          {slide.code.slice(0, 150)}
        </pre>
      </div>
    </div>
  );
};

export function Sidebar({ onNavigateBack, projectName, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { slides, addSlide, reorderSlides } = useStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex((s) => s.id === active.id);
      const newIndex = slides.findIndex((s) => s.id === over.id);
      reorderSlides(oldIndex, newIndex);
    }
  }, [slides, reorderSlides]);

  const slideIds = useMemo(() => slides.map(s => s.id), [slides]);

  if (isCollapsed) {
    return (
      <div className="flex h-full w-12 flex-col border-r bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-center border-b p-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleCollapse}
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex flex-col items-center gap-2 p-2 overflow-y-auto">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => useStore.getState().setCurrentSlide(slide.id)}
              className={cn(
                "h-8 w-8 rounded-md flex items-center justify-center text-xs font-medium transition-colors",
                useStore.getState().currentSlideId === slide.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              title={`Slide ${index + 1}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="border-t p-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={addSlide}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2 min-w-0">
          {onNavigateBack && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 -ml-1.5 flex-shrink-0"
              onClick={onNavigateBack}
            >
              <LayoutTemplate className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold truncate">{projectName || 'OpenSlides'}</h1>
          </div>
        </div>
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 flex-shrink-0"
            onClick={onToggleCollapse}
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={slideIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {slides.map((slide, index) => (
                <SortableSlideItem key={slide.id} slide={slide} index={index} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="border-t p-3">
        <Button onClick={addSlide} className="w-full text-xs h-9">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Slide
        </Button>
      </div>
    </div>
  );
}
