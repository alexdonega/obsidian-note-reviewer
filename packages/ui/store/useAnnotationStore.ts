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
  history: string[];

  addAnnotation: (annotation: Annotation) => void;
  deleteAnnotation: (id: string) => void;
  selectAnnotation: (id: string | null) => void;
  undo: () => void;
  clear: () => void;
  setAnnotations: (annotations: Annotation[]) => void;
}

export const useAnnotationStore = create<AnnotationState>()(
  devtools(
    persist(
      (set, get) => ({
        annotations: [],
        selectedId: null,
        history: [],

        addAnnotation: (annotation) => set((state) => ({
          annotations: [...state.annotations, annotation],
          history: [...state.history, annotation.id],
          selectedId: annotation.id
        })),

        deleteAnnotation: (id) => set((state) => ({
          annotations: state.annotations.filter(a => a.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId
        })),

        selectAnnotation: (id) => set({ selectedId: id }),

        undo: () => {
          const { history, annotations } = get();
          if (history.length === 0) return;

          const lastId = history[history.length - 1];
          set({
            annotations: annotations.filter(a => a.id !== lastId),
            history: history.slice(0, -1),
            selectedId: null
          });
        },

        clear: () => set({ annotations: [], selectedId: null, history: [] }),

        setAnnotations: (annotations) => set({ annotations, history: annotations.map(a => a.id) })
      }),
      { name: 'annotation-store' }
    )
  )
);
