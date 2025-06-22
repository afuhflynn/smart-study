import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface Document {
  id: string;
  title: string;
  content: string;
  type: 'pdf' | 'text' | 'image';
  uploadedAt: Date;
  progress: number;
  lastRead?: Date;
  chapters: Array<{
    id: string;
    title: string;
    startIndex: number;
  }>;
  metadata: {
    wordCount: number;
    pageCount: number;
    estimatedReadTime: number;
    category?: string;
  };
}

interface ReadingSession {
  documentId: string;
  chapterId: string;
  startTime: Date;
  endTime?: Date;
  progress: number;
  quizScores: Array<{
    quizId: string;
    score: number;
    completedAt: Date;
  }>;
}

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Documents
  documents: Document[];
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  getDocument: (id: string) => Document | undefined;

  // Reading progress
  readingSessions: ReadingSession[];
  addReadingSession: (session: ReadingSession) => void;
  updateReadingProgress: (documentId: string, progress: number) => void;

  // Preferences
  preferences: {
    theme: 'light' | 'dark' | 'system';
    fontSize: number;
    readingSpeed: number;
    autoplay: boolean;
    notifications: boolean;
  };
  updatePreferences: (updates: Partial<AppState['preferences']>) => void;

  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentDocument: string | null;
  setCurrentDocument: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),

      // Documents
      documents: [],
      addDocument: (document) => set((state) => ({
        documents: [...state.documents, document]
      })),
      updateDocument: (id, updates) => set((state) => ({
        documents: state.documents.map(doc => 
          doc.id === id ? { ...doc, ...updates } : doc
        )
      })),
      removeDocument: (id) => set((state) => ({
        documents: state.documents.filter(doc => doc.id !== id)
      })),
      getDocument: (id) => get().documents.find(doc => doc.id === id),

      // Reading progress
      readingSessions: [],
      addReadingSession: (session) => set((state) => ({
        readingSessions: [...state.readingSessions, session]
      })),
      updateReadingProgress: (documentId, progress) => set((state) => ({
        documents: state.documents.map(doc =>
          doc.id === documentId ? { ...doc, progress, lastRead: new Date() } : doc
        )
      })),

      // Preferences
      preferences: {
        theme: 'system',
        fontSize: 16,
        readingSpeed: 250,
        autoplay: false,
        notifications: true,
      },
      updatePreferences: (updates) => set((state) => ({
        preferences: { ...state.preferences, ...updates }
      })),

      // UI state
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      currentDocument: null,
      setCurrentDocument: (id) => set({ currentDocument: id }),
    }),
    {
      name: 'chapterflux-store',
      partialize: (state) => ({
        user: state.user,
        documents: state.documents,
        readingSessions: state.readingSessions,
        preferences: state.preferences,
      }),
    }
  )
);