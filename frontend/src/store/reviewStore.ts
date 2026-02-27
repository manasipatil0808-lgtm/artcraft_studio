import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewState {
  reviews: Review[];
  addReview: (review: Review) => void;
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set) => ({
      reviews: [],
      addReview: (review) => set((state) => ({ reviews: [...state.reviews, review] })),
    }),
    {
      name: 'review-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
