'use client';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FileListProps {
  files: File[];
  onReorder: (files: File[]) => void;
  onRemove: (index: number) => void;
}

interface SortableItemProps {
  id: string;
  file: File;
  index: number;
  onRemove: () => void;
}

function SortableItem({ id, file, index, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
    >
      <div className="flex items-center space-x-4 flex-1" {...attributes} {...listeners}>
        <div className="cursor-move">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{index + 1}. {file.name}</p>
          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
        aria-label="削除"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function FileList({ files, onReorder, onRemove }: FileListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = files.findIndex((_, i) => `file-${i}` === active.id);
      const newIndex = files.findIndex((_, i) => `file-${i}` === over.id);

      onReorder(arrayMove(files, oldIndex, newIndex));
    }
  }

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        アップロードされたファイル ({files.length})
      </h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={files.map((_, i) => `file-${i}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {files.map((file, index) => (
              <SortableItem
                key={`file-${index}`}
                id={`file-${index}`}
                file={file}
                index={index}
                onRemove={() => onRemove(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <p className="text-sm text-gray-500">
        ドラッグ&ドロップでファイルの順序を変更できます
      </p>
    </div>
  );
}
