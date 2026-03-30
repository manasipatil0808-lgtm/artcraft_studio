import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  ArrowLeft,
  ShoppingCart,
  Upload,
  Check,
  Star,
  Loader2,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import type { ChangeEvent } from "react";
import { useProductStore } from "../store/productStore";
import { useCartStore } from "../store/cartStore";
import { useReviewStore } from "../store/reviewStore";
import { useAuthStore } from "../store/authStore";
import api from "../services/api";

interface CustomizationForm {
  customText: string;
  color: string;
}

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Get products from store
  const {
    products,
    fetchProductById,
    loading: productLoading,
  } = useProductStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const addItem = useCartStore((state) => state.addItem);

  const { reviews, fetchReviews, addReview, deleteReview, loading: reviewLoading } = useReviewStore();
  const { user, isAuthenticated } = useAuthStore();

  const [quantity, setQuantity] = useState(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Review state
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomizationForm>();

  // Fetch product on mount or when id changes
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // First check if product exists in store
        let foundProduct = products.find(
          (p) => p.id.toString() === id.toString(),
        );

        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          // If not in store, fetch from API
          const fetchedProduct = await fetchProductById(parseInt(id));
          setProduct(fetchedProduct);
        }
      } catch (error: any) {
        console.error("Error loading product:", error);
        toast.error(error.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, products, fetchProductById]);

  // Fetch reviews when product loads
  useEffect(() => {
    if (id) {
      fetchReviews(id);
    }
  }, [id, fetchReviews]);

  // Handle loading state
  if (loading || productLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
        <p className="text-gray-600 font-hand text-lg">
          Loading product details...
        </p>
      </div>
    );
  }

  // Handle product not found
  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-display font-bold mb-4">
          Product Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/shop")}
          className="bg-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-600 transition-colors"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        toast.success("Image uploaded successfully!");
      };
      reader.onerror = () => {
        toast.error("Failed to upload image");
      };
      reader.readAsDataURL(file);
    }
  };

  // In ProductDetails.tsx - Update onSubmit function

  const onSubmit = async (data: CustomizationForm) => {
    try {
      // Check if user is logged in
      if (!api.isLoggedIn()) {
        toast.error("Please login to add items to cart");
        navigate("/login");
        return;
      }

      // Extract numeric price from string (remove ₹ symbol)
      let priceValue = product.price;
      if (typeof priceValue === "string" && priceValue.startsWith("₹")) {
        priceValue = parseFloat(priceValue.replace("₹", ""));
      }

      const customizations = product.customizable
        ? {
            text: data.customText,
            color: data.color,
            image: uploadedImage || undefined,
          }
        : undefined;

      console.log("Adding to cart:", { product, quantity, customizations });

      // Add to cart using store
      const success = await addItem(product, quantity, customizations);

      if (success) {
        toast.success(`Added ${product.name} to cart!`);

        // Optional: Navigate to cart after short delay
        setTimeout(() => {
          navigate("/cart");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Add to cart error:", error);
      toast.error(error.message || "Failed to add to cart");
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!isAuthenticated) {
      toast.error("Please login to write a review");
      navigate("/login");
      return;
    }

    try {
      await addReview(Number(id), rating, reviewComment);
      setReviewComment("");
      setRating(5);
      toast.success("Review added! Thank you for your feedback.");
    } catch (error: any) {
      toast.error(error.message || "Failed to add review");
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await deleteReview(reviewId);
      toast.success("Review deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete review");
    }
  };

  // Calculate total price
  const getPriceValue = () => {
    if (typeof product.price === "string" && product.price.startsWith("₹")) {
      return parseFloat(product.price.replace("₹", ""));
    }
    return parseFloat(product.price) || 0;
  };

  const priceValue = getPriceValue();
  const totalPrice = (priceValue * quantity).toFixed(2);

  // Get display image
  const displayImage =
    product.image || product.image_url || "https://via.placeholder.com/500";

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 mb-8 hover:text-pink-600 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Product Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white p-4 rounded-3xl shadow-lg border-2 border-gray-100 rotate-1 hover:rotate-0 transition-transform duration-500"
        >
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50">
            <img
              src={displayImage}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/500";
              }}
            />
          </div>
          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              Only {product.stock_quantity} left!
            </div>
          )}
          {product.stock_quantity === 0 && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              Out of Stock
            </div>
          )}
        </motion.div>

        {/* Product Info & Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-2">
              {product.name}
            </h1>
            <p className="text-2xl text-pink-600 font-bold">{product.price}</p>
            {product.category && (
              <p className="text-sm text-gray-500 mt-2">
                Category: {product.category}
              </p>
            )}
          </div>

          <div className="prose prose-lg font-hand text-gray-600">
            <p>{product.description || "No description available."}</p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
          >
            {product.customizable && (
              <div className="space-y-4">
                <h3 className="text-xl font-display font-bold border-b pb-2">
                  Personalize It
                </h3>

                <div>
                  <label className="block text-sm font-bold mb-1">
                    Custom Text / Name
                  </label>
                  <input
                    {...register("customText", {
                      required: product.customizable
                        ? "This field is required for customization"
                        : false,
                    })}
                    type="text"
                    placeholder="Enter name or message..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                    disabled={product.stock_quantity === 0}
                  />
                  {errors.customText && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customText.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">
                    Color Preference
                  </label>
                  <select
                    {...register("color")}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none bg-white"
                    disabled={product.stock_quantity === 0}
                  >
                    <option value="Standard">Standard (As shown)</option>
                    <option value="Pastel Pink">Pastel Pink</option>
                    <option value="Mint Green">Mint Green</option>
                    <option value="Sky Blue">Sky Blue</option>
                    <option value="Lavender">Lavender</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">
                    Upload Photo (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <label
                      className={`cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 transition-colors ${product.stock_quantity === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Upload className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-bold text-gray-600">
                        Choose File
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={product.stock_quantity === 0}
                      />
                    </label>
                    {uploadedImage && (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
                        <Check className="w-4 h-4" /> Image attached
                      </div>
                    )}
                  </div>
                  {uploadedImage && (
                    <div className="mt-2 w-20 h-20 rounded-md overflow-hidden border border-gray-300">
                      <img
                        src={uploadedImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-end gap-4 pt-4 border-t border-gray-100">
              <div className="w-24">
                <label className="block text-sm font-bold mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock_quantity}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.min(
                        parseInt(e.target.value) || 1,
                        product.stock_quantity,
                      ),
                    )
                  }
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-center font-bold"
                  disabled={product.stock_quantity === 0}
                />
              </div>

              <button
                type="submit"
                disabled={product.stock_quantity === 0}
                className={`flex-grow flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 duration-200 ${
                  product.stock_quantity === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-pink-500 text-white hover:bg-pink-600"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock_quantity === 0
                  ? "Out of Stock"
                  : `Add to Cart - ₹${totalPrice}`}
              </button>
            </div>

            {product.stock_quantity > 0 && (
              <p className="text-sm text-gray-500 text-right">
                {product.stock_quantity} available in stock
              </p>
            )}
          </form>
        </motion.div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
        <h2 className="text-3xl font-display font-bold mb-8">
          Customer Reviews
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <p className="text-gray-500 font-hand text-lg">
                  No reviews yet. Be the first to share your thoughts!
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b border-gray-100 last:border-0 pb-6"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold">{review.userName}</h4>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                      {(user?.role === 'admin' || (user && Number(user.id) === review.userId)) && (
                        <button
                          onClick={() => handleDeleteReview(Number(review.id))}
                          className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 font-hand text-lg">
                    {review.comment}
                  </p>
                </motion.div>
              ))
            )}
          </div>

          {/* Add Review Form */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Write a Review</h3>
            {isAuthenticated ? (
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Reviewing as <span className="text-pink-600">{user?.name}</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-3xl transition-all hover:scale-110 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">
                    Your Review
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg h-24 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Tell us what you think... (min 5 characters)"
                    required
                    minLength={5}
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-full bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Please login to write a review</p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-pink-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-pink-600 transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
