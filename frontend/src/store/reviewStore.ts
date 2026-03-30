import { create } from 'zustand';
import api from '../services/api';

export interface Review {
  id: string | number;
  productId: string;
  userName: string;
  userId?: number;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  fetchReviews: (productId: string | number) => Promise<void>;
  addReview: (productId: number, rating: number, comment: string) => Promise<void>;
  deleteReview: (reviewId: number) => Promise<void>;
}

export const useReviewStore = create<ReviewState>()((set) => ({
  reviews: [],
  loading: false,
  error: null,

  fetchReviews: async (productId: string | number) => {
    set({ loading: true, error: null });
    try {
      const data = await api.getProductReviews(Number(productId));
      set({ reviews: data.reviews || [], loading: false });
    } catch (error: any) {
      console.error('Fetch reviews error:', error);
      set({ error: error.message, loading: false });
    }
  },

  addReview: async (productId: number, rating: number, comment: string) => {
    set({ loading: true, error: null });
    try {
      const data = await api.addReview(productId, rating, comment);
      // Add the new review to state
      set((state) => ({
        reviews: [data.review, ...state.reviews],
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteReview: async (reviewId: number) => {
    try {
      await api.deleteReview(reviewId);
      set((state) => ({
        reviews: state.reviews.filter((r) => Number(r.id) !== reviewId),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));
