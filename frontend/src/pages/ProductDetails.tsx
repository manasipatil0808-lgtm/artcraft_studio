import { useParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

import { ArrowLeft, ShoppingCart, Upload, Check, Star } from 'lucide-react';
import { motion } from 'motion/react';
import type { ChangeEvent } from 'react';
import { nanoid } from 'nanoid';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { useReviewStore } from '../store/reviewStore';

interface CustomizationForm {
  customText: string;
  color: string;
}

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const products = useProductStore((state) => state.products);
  const product = products.find(p => p.id === id);
  const addItem = useCartStore((state) => state.addItem);
  
  const allReviews = useReviewStore(state => state.reviews);
  const addReview = useReviewStore(state => state.addReview);
  
  // Cache the filtered reviews to avoid infinite loop
  const reviews = useMemo(() => {
    return allReviews.filter(r => r.productId === id);
  }, [allReviews, id]);

  const [quantity, setQuantity] = useState(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Review state
  const [rating, setRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<CustomizationForm>();

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-display">Product Not Found</h2>
        <button onClick={() => navigate('/shop')} className="text-pink-600 hover:underline">Return to Shop</button>
      </div>
    );
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        toast.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: CustomizationForm) => {
    const customizations = product.customizable ? {
      text: data.customText,
      color: data.color,
      image: uploadedImage || undefined
    } : undefined;

    addItem(product, quantity, customizations);
    toast.success(`Added ${product.name} to cart!`);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    addReview({
      id: nanoid(),
      productId: id,
      userName: reviewName || 'Anonymous',
      rating,
      comment: reviewComment,
      date: new Date().toISOString()
    });
    
    setReviewName('');
    setReviewComment('');
    setRating(5);
    toast.success("Review added!");
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-8 hover:text-pink-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Product Image */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative bg-white p-4 rounded-3xl shadow-lg border-2 border-gray-100 rotate-1 hover:rotate-0 transition-transform duration-500"
        >
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Product Info & Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-2xl text-pink-600 font-bold">${product.price.toFixed(2)}</p>
          </div>

          <div className="prose prose-lg font-hand text-gray-600">
            <p>{product.description}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            {product.customizable && (
              <div className="space-y-4">
                <h3 className="text-xl font-display font-bold border-b pb-2">Personalize It</h3>
                
                <div>
                  <label className="block text-sm font-bold mb-1">Custom Text / Name</label>
                  <input 
                    {...register("customText", { required: "This field is required for customization" })}
                    type="text" 
                    placeholder="Enter name or message..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                  />
                  {errors.customText && <p className="text-red-500 text-sm mt-1">{errors.customText.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">Color Preference</label>
                  <select 
                    {...register("color")}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none bg-white"
                  >
                    <option value="Standard">Standard (As shown)</option>
                    <option value="Pastel Pink">Pastel Pink</option>
                    <option value="Mint Green">Mint Green</option>
                    <option value="Sky Blue">Sky Blue</option>
                    <option value="Lavender">Lavender</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">Upload Photo (Optional)</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 transition-colors">
                      <Upload className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-bold text-gray-600">Choose File</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
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
                      <img src={uploadedImage} alt="Preview" className="w-full h-full object-cover" />
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
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-center font-bold"
                />
              </div>
              
              <button 
                type="submit" 
                className="flex-grow flex items-center justify-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600 transition-colors font-bold shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 duration-200"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart - ${(product.price * quantity).toFixed(2)}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
        <h2 className="text-3xl font-display font-bold mb-8">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-gray-500 font-hand text-lg">No reviews yet. Be the first to share your thoughts!</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold">{review.userName}</h4>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600 font-hand text-lg">{review.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Review Form */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Write a Review</h3>
            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Your Name</label>
                <input 
                  type="text" 
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Your Review</label>
                <textarea 
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg h-24"
                  placeholder="Tell us what you think..."
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-700 transition-colors"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}