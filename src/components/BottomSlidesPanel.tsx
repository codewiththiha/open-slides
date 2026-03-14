/**
 * @file BottomSlidesPanel.tsx
 * @description Bottom panel for slide navigation with drag-and-drop support.
 * Replaces the left sidebar with a horizontal slide strip at the bottom.
 */
import { useStore } from "../store/useStore";
import { cn } from "../lib/utils";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
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
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useMemo } from "react";

interface BottomSlidesPanelProps {
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
        "group relative flex min-w-[140px] max-w-[140px] cursor-pointer flex-col gap-1.5 rounded-md border p-2 transition-all hover:bg-muted/50 active:scale-[0.98]",
        currentSlideId === slide.id
          ? "border-primary/50 bg-muted ring-1 ring-primary/20"
          : "bg-background/50 hover:border-primary/30",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3 w-3" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground truncate">
            Slide {index + 1}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
          onClick={handleRemove}
        >
          <Trash2 className="h-2.5 w-2.5" />
        </Button>
      </div>
      <div className="h-12 overflow-hidden rounded bg-muted/30 p-1.5 pointer-events-none flex-shrink-0">
        <pre className="text-[4px] leading-[5px] text-muted-foreground/70 select-none font-mono line-clamp-4">
          {slide.code.slice(0, 200)}
        </pre>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[8px] text-muted-foreground uppercase px-1 py-0.5 rounded bg-muted/50">
          {slide.language}
        </span>
        <span className="text-[8px] text-muted-foreground">
          {slide.duration / 1000}s
        </span>
      </div>
    </div>
  );
};

export function BottomSlidesPanel({ isCollapsed = false, onToggleCollapse }: BottomSlidesPanelProps) {
  const { slides, addSlide, reorderSlides, currentSlideId } = useStore();

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
      <div className="flex h-10 w-full items-center justify-between border-t bg-card/50 backdrop-blur-sm px-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggleCollapse}
            title="Show slides"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {slides.length} slide{slides.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground px-2">
            Slide {slides.findIndex(s => s.id === currentSlideId) + 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={addSlide}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-44 w-full flex-col border-t bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b px-3 py-1.5">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onToggleCollapse}
            title="Collapse slides"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs font-medium text-muted-foreground">
            Slides ({slides.length})
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={addSlide}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Slide
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={slideIds}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex h-full items-center gap-2">
              {slides.map((slide, index) => (
                <SortableSlideItem key={slide.id} slide={slide} index={index} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
