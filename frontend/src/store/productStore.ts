import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../services/api";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  image: string | null; // Base64 encoded image or binary data
  image_url?: string; // Optional URL for display
  stock_quantity: number;
  created_at?: string;
  updated_at?: string;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalProducts: number;
  currentPage: number;
  totalPages: number;

  // Fetch actions
  fetchProducts: (
    page?: number,
    limit?: number,
    filters?: any,
  ) => Promise<void>;
  fetchProductById: (id: number) => Promise<Product | null>;
  fetchCategories: () => Promise<string[]>;

  // Admin actions
  addProduct: (
    product: FormData | Omit<Product, "id" | "created_at" | "updated_at">,
  ) => Promise<void>;
  updateProduct: (
    id: number,
    updates: FormData | Partial<Product>,
  ) => Promise<void>;
  removeProduct: (id: number) => Promise<void>;

  // Local state management
  setProducts: (products: Product[]) => void;
  clearError: () => void;
  resetState: () => void;
}

// Helper function to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Helper function to create FormData with image
export const createProductFormData = (
  productData: any,
  imageFile?: File,
): FormData => {
  const formData = new FormData();

  // Append all product fields
  Object.keys(productData).forEach((key) => {
    if (key !== "image" && productData[key] !== undefined) {
      formData.append(key, String(productData[key]));
    }
  });

  // Append image file if provided
  if (imageFile) {
    formData.append("image", imageFile);
  }

  return formData;
};

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],
      loading: false,
      error: null,
      totalProducts: 0,
      currentPage: 1,
      totalPages: 1,

      // Fetch products from database
      fetchProducts: async (page = 1, limit = 12, filters = {}) => {
        set({ loading: true, error: null });
        try {
          const response = await api.getProducts({ page, limit, ...filters });

          // Convert image URLs to base64 if needed
          const productsWithImages = await Promise.all(
            response.products.map(async (product: any) => {
              // If product has image URL, fetch and convert to base64
              if (product.image_url && !product.image) {
                try {
                  const imageBase64 = await fetchImageAsBase64(
                    product.image_url,
                  );
                  return { ...product, image: imageBase64 };
                } catch (err) {
                  console.warn(
                    `Failed to load image for product ${product.id}:`,
                    err,
                  );
                  return product;
                }
              }
              return product;
            }),
          );

          set({
            products: productsWithImages,
            totalProducts: response.total,
            currentPage: response.page,
            totalPages: response.totalPages,
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || "Failed to fetch products",
            loading: false,
          });
        }
      },

      // Fetch single product by ID
      fetchProductById: async (id: number) => {
        set({ loading: true, error: null });
        try {
          const product = await api.getProductById(id);

          // Fetch and convert image if needed
          if (product.image_url && !product.image) {
            try {
              const imageBase64 = await fetchImageAsBase64(product.image_url);
              product.image = imageBase64;
            } catch (err) {
              console.warn(`Failed to load image for product ${id}:`, err);
            }
          }

          set({ loading: false });
          return product;
        } catch (error: any) {
          set({
            error: error.message || "Failed to fetch product",
            loading: false,
          });
          return null;
        }
      },

      // Fetch categories
      fetchCategories: async () => {
        try {
          const categories = await api.getCategories();
          return categories;
        } catch (error: any) {
          set({ error: error.message || "Failed to fetch categories" });
          return [];
        }
      },

      // Add new product (Admin only)
      addProduct: async (productData: FormData | any) => {
        set({ loading: true, error: null });
        try {
          let response;

          if (productData instanceof FormData) {
            // If it's FormData, send directly
            response = await api.createProductWithImage(productData);
          } else {
            // If it's regular object, send as JSON
            response = await api.createProduct(productData);
          }

          // Refresh products list
          await get().fetchProducts();

          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.message || "Failed to add product",
            loading: false,
          });
          throw error;
        }
      },

      // Update product (Admin only)
      updateProduct: async (
        id: number,
        updates: FormData | Partial<Product>,
      ) => {
        set({ loading: true, error: null });
        try {
          let response;

          if (updates instanceof FormData) {
            response = await api.updateProductWithImage(id, updates);
          } else {
            response = await api.updateProduct(id, updates);
          }

          // Update local state
          set((state) => ({
            products: state.products.map((p) =>
              p.id === id ? { ...p, ...(response.product || updates) } : p,
            ),
            loading: false,
          }));
        } catch (error: any) {
          set({
            error: error.message || "Failed to update product",
            loading: false,
          });
          throw error;
        }
      },

      // Remove product (Admin only)
      removeProduct: async (id: number) => {
        set({ loading: true, error: null });
        try {
          await api.deleteProduct(id);

          // Remove from local state
          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
            loading: false,
          }));
        } catch (error: any) {
          set({
            error: error.message || "Failed to delete product",
            loading: false,
          });
          throw error;
        }
      },

      // Local state management
      setProducts: (products) => set({ products }),

      clearError: () => set({ error: null }),

      resetState: () =>
        set({
          products: [],
          loading: false,
          error: null,
          totalProducts: 0,
          currentPage: 1,
          totalPages: 1,
        }),
    }),
    {
      name: "artcraft-product-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({
        products: state.products.map((p) => ({
          ...p,
          // Don't store large images in localStorage
          image: p.image ? "[IMAGE_STORED]" : null,
        })),
      }),
    },
  ),
);

// Helper function to fetch image as base64
async function fetchImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to fetch image:", error);
    throw error;
  }
}
