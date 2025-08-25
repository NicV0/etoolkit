import { StateCreator } from 'zustand';
import { ToastType } from '../../../components/ui/Toast';

// UI types
export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  actionText?: string;
  onActionPress?: () => void;
  createdAt: number;
}

export interface Modal {
  id: string;
  type: string;
  props: Record<string, unknown>;
  visible: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface UISlice {
  // State
  toasts: Toast[];
  modals: Modal[];
  loading: LoadingState;
  
  // Actions
  addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  showModal: (type: string, props?: Record<string, unknown>) => string;
  hideModal: (id: string) => void;
  hideAllModals: () => void;
  setLoading: (loading: boolean, message?: string, progress?: number) => void;
  clearLoading: () => void;
}

export const createUISlice: StateCreator<UISlice> = (set, get) => ({
  // Initial state
  toasts: [],
  modals: [],
  loading: {
    isLoading: false,
  },
  
  // Actions
  addToast: (toastData) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const toast: Toast = {
      ...toastData,
      id,
      createdAt: Date.now(),
    };
    
    set((state) => ({
      toasts: [...state.toasts, toast],
    }));
    
    // Auto-remove toast after duration
    if (toastData.duration !== 0) {
      const duration = toastData.duration || 3000;
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
    
    return id;
  },
  
  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  
  clearToasts: () => {
    set({ toasts: [] });
  },
  
  showModal: (type: string, props: Record<string, unknown> = {}) => {
    const id = 'modal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const modal: Modal = {
      id,
      type,
      props,
      visible: true,
    };
    
    set((state) => ({
      modals: [...state.modals, modal],
    }));
    
    return id;
  },
  
  hideModal: (id: string) => {
    set((state) => ({
      modals: state.modals.map((modal) =>
        modal.id === id ? { ...modal, visible: false } : modal
      ),
    }));
    
    // Remove modal after animation
    setTimeout(() => {
      set((state) => ({
        modals: state.modals.filter((modal) => modal.id !== id),
      }));
    }, 300);
  },
  
  hideAllModals: () => {
    set((state) => ({
      modals: state.modals.map((modal) => ({ ...modal, visible: false })),
    }));
    
    // Remove all modals after animation
    setTimeout(() => {
      set({ modals: [] });
    }, 300);
  },
  
  setLoading: (isLoading: boolean, message?: string, progress?: number) => {
    set({
      loading: {
        isLoading,
        message,
        progress,
      },
    });
  },
  
  clearLoading: () => {
    set({
      loading: {
        isLoading: false,
      },
    });
  },
});
