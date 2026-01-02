import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Annotation {
  id: string;
  blockId: string;
  startOffset: number;
  endOffset: number;
  type: 'comment' | 'highlight' | 'delete' | 'insert' | 'replace';
  text?: string;
  originalText: string;
  createdAt: number;
  author: string;
  startMeta?: unknown;
  endMeta?: unknown;
}

interface AnnotationState {
  annotations: Annotation[];
  selectedId: string | null;
  selectedIds: string[]; // For bulk selection operations
  history: string[];

  addAnnotation: (annotation: Annotation) => void;
  deleteAnnotation: (id: string) => void;
  selectAnnotation: (id: string | null) => void;
  undo: () => void;
  clear: () => void;
  setAnnotations: (annotations: Annotation[]) => void;

  // Bulk selection actions
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  getSelectedCount: () => number;
}

export const useAnnotationStore = create<AnnotationState>()(
  devtools(
    persist(
      (set, get) => ({
        annotations: [],
        selectedId: null,
        selectedIds: [],
        history: [],

        addAnnotation: (annotation) => set((state) => ({
          annotations: [...state.annotations, annotation],
          history: [...state.history, annotation.id],
          selectedId: annotation.id
        })),

        deleteAnnotation: (id) => set((state) => ({
          annotations: state.annotations.filter(a => a.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
          selectedIds: state.selectedIds.filter(sid => sid !== id)
        })),

        selectAnnotation: (id) => set({ selectedId: id }),

        undo: () => {
          const { history, annotations, selectedIds } = get();
          if (history.length === 0) return;

          const lastId = history[history.length - 1];
          set({
            annotations: annotations.filter(a => a.id !== lastId),
            history: history.slice(0, -1),
            selectedId: null,
            selectedIds: selectedIds.filter(id => id !== lastId)
          });
        },

        clear: () => set({ annotations: [], selectedId: null, selectedIds: [], history: [] }),

        setAnnotations: (annotations) => set({ annotations, selectedIds: [], history: annotations.map(a => a.id) }),

        // Bulk selection actions
        toggleSelection: (id) => set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter(sid => sid !== id)
            : [...state.selectedIds, id]
        })),

        selectAll: () => set((state) => ({
          selectedIds: state.annotations.map(a => a.id)
        })),

        clearSelection: () => set({ selectedIds: [] }),

        getSelectedCount: () => get().selectedIds.length
      }),
      { name: 'annotation-store' }
    )
  )
);
