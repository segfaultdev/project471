import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { productsAPI, reviewsAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  Loader2,
  ArrowLeft,
  Package,
  ShoppingCart,
  Heart,
  Star,
  Trash2,
} from "lucide-react";
import ShopNavbar from "../components/ShopNavbar";

const StarRating = ({ rating, onRate, readonly = false, size = 20 }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRate(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`${readonly ? "cursor-default" : "cursor-pointer"} transition-transform hover:scale-110`}
        >
          <Star
            className={`${
              star <= (hover || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-300"
            }`}
            size={size}
          />
        </button>
      ))}
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingData, setRatingData] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id, user?.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getOne(id);
      setProduct(response.data);
    } catch (err) {
      setError("Product not found");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const [reviewsRes, ratingRes] = await Promise.all([
        reviewsAPI.getByProduct(id),
        reviewsAPI.getAverageRating(id),
      ]);
      setReviews(reviewsRes.data);
      setRatingData(ratingRes.data);

      if (user) {
        try {
          const statusRes = await reviewsAPI.getReviewStatus(id);
          const status = statusRes.data;
          setHasPurchased(status.hasPurchased);
          setCanReview(status.canReview);
          setUserReview(status.review);

          if (status.review) {
            setReviewRating(status.review.rating);
            setReviewComment(status.review.comment || "");
          } else {
            setReviewRating(5);
            setReviewComment("");
          }
        } catch (statusErr) {
          console.error("Error checking review eligibility:", statusErr);
          setHasPurchased(false);
          setCanReview(false);
          setUserReview(null);
        }
      } else {
        setHasPurchased(false);
        setCanReview(false);
        setUserReview(null);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");
    setReviewLoading(true);

    try {
      if (userReview) {
        // Update existing review
        const response = await reviewsAPI.update(userReview.id, {
          rating: reviewRating,
          comment: reviewComment,
        });
        setUserReview(response.data);
        setReviewSuccess("Review updated successfully!");
      } else {
        // Create new review
        const response = await reviewsAPI.create({
          productId: id,
          rating: reviewRating,
          comment: reviewComment,
        });
        setReviewSuccess("Review submitted successfully!");
        setCanReview(false);
        setUserReview(response.data);
      }
      setShowReviewForm(false);
      // Refresh reviews
      fetchReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;

    if (!window.confirm("Are you sure you want to delete your review?")) return;

    try {
      await reviewsAPI.delete(userReview.id);
      setUserReview(null);
      setReviewRating(5);
      setReviewComment("");
      setCanReview(true);
      setShowReviewForm(false);
      setReviewSuccess("Review deleted successfully!");
      fetchReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to delete review");
    }
  };

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id: product.id, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart!");
  };

  const handleAddToWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    if (!wishlist.includes(product.id)) {
      wishlist.push(product.id);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      alert("Added to wishlist!");
    } else {
      alert("Already in wishlist!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 text-red-600 mx-auto mb-6">
            <Package className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-slate-600 mb-6">
            The product you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <ShopNavbar />

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square w-full overflow-hidden rounded-3xl bg-slate-100">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML =
                      '<svg class="h-24 w-24 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package className="h-24 w-24 text-slate-400" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 h-20 w-20 overflow-hidden rounded-xl border-2 ${
                      index === currentImageIndex
                        ? "border-blue-500"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML =
                          '<svg class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {product.name}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-4xl font-bold text-blue-600">
                ৳{product.price}
              </p>
              <div className="text-sm text-slate-500">
                <p>Stock: {product.stock}</p>
                {product.category && (
                  <p className="mt-1">
                    Category:{" "}
                    <span className="font-medium">{product.category}</span>
                  </p>
                )}
              </div>
            </div>

            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Description
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-5 w-5" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
              <button
                onClick={handleAddToWishlist}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                <Heart className="h-5 w-5" />
                Wishlist
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Customer Reviews
              </h2>
              <div className="mt-2 flex items-center gap-3">
                <StarRating
                  rating={Math.round(ratingData.average)}
                  readonly
                  size={18}
                />
                <span className="text-sm text-slate-600">
                  {ratingData.count > 0
                    ? `${ratingData.average.toFixed(1)} from ${ratingData.count} review${ratingData.count === 1 ? "" : "s"}`
                    : "No reviews yet"}
                </span>
              </div>
            </div>

            <div>
              {userReview ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm((current) => !current)}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Edit your review
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteReview}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              ) : canReview ? (
                <button
                  type="button"
                  onClick={() => setShowReviewForm((current) => !current)}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Write a review
                </button>
              ) : (
                <p className="max-w-sm text-sm text-slate-500">
                  {user
                    ? hasPurchased
                      ? "You have already reviewed this product."
                      : "Only customers who bought this product can review it."
                    : "Log in and buy this product to leave a review."}
                </p>
              )}
            </div>
          </div>

          {showReviewForm && (canReview || userReview) && (
            <form
              onSubmit={handleSubmitReview}
              className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {userReview ? "Update your review" : "Write your review"}
              </h3>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Rating
                </label>
                <StarRating rating={reviewRating} onRate={setReviewRating} />
              </div>

              <div className="mt-4">
                <label
                  htmlFor="reviewComment"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Comment
                </label>
                <textarea
                  id="reviewComment"
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  rows="4"
                  className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Share what you liked, fit, quality, delivery, or anything useful."
                />
              </div>

              {reviewError && (
                <p className="mt-4 text-sm font-medium text-red-600">
                  {reviewError}
                </p>
              )}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {reviewLoading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {userReview ? "Update review" : "Submit review"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {reviewSuccess && (
            <p className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {reviewSuccess}
            </p>
          )}

          <div className="mt-6 space-y-4">
            {reviews.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
                No one has reviewed this product yet.
              </p>
            ) : (
              reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {review.user
                          ? `${review.user.firstName} ${review.user.lastName}`
                          : "Customer"}
                      </p>
                      <div className="mt-1">
                        <StarRating rating={review.rating} readonly size={16} />
                      </div>
                    </div>
                    <time className="text-sm text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  {review.comment && (
                    <p className="mt-4 leading-relaxed text-slate-600">
                      {review.comment}
                    </p>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductDetail;
