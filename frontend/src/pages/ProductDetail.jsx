import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { productsAPI, reviewsAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "../components/ConfirmModal";
import {
  Loader2,
  ArrowLeft,
  Package,
  ShoppingCart,
  Heart,
  Star,
  Trash2,
  CheckCircle2,
  X,
  Store,
} from "lucide-react";

const formatCurrency = (amount) => `৳${Number(amount || 0).toLocaleString("en-BD")}`;

const DELETE_REVIEW_MESSAGE =
  "Are you sure you want to delete your review? This action cannot be undone.";

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
          className={`${readonly ? "cursor-default" : "cursor-pointer"} transition hover:scale-110`}
          aria-label={`${star} star`}
        >
          <Star
            className={
              star <= (hover || rating)
                ? "fill-amber-400 text-amber-400"
                : "text-neutral-300"
            }
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
  const [notice, setNotice] = useState("");

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewDeleteLoading, setReviewDeleteLoading] = useState(false);
  const [showDeleteReviewModal, setShowDeleteReviewModal] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id, user?.id]);

  const showNotice = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 2500);
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await productsAPI.getOne(id);
      setProduct(response.data || response);
    } catch (err) {
      setError("Product not found.");
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

      setReviews(reviewsRes.data || reviewsRes || []);
      setRatingData(ratingRes.data || ratingRes || { average: 0, count: 0 });

      if (user) {
        try {
          const statusRes = await reviewsAPI.getReviewStatus(id);
          const status = statusRes.data || statusRes;

          setHasPurchased(Boolean(status.hasPurchased));
          setCanReview(Boolean(status.canReview));
          setUserReview(status.review || null);

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
        const response = await reviewsAPI.update(userReview.id, {
          rating: reviewRating,
          comment: reviewComment,
        });
        setUserReview(response.data || response);
        setReviewSuccess("Review updated successfully.");
      } else {
        const response = await reviewsAPI.create({
          productId: id,
          rating: reviewRating,
          comment: reviewComment,
        });
        setUserReview(response.data || response);
        setReviewSuccess("Review submitted successfully.");
        setCanReview(false);
      }

      setShowReviewForm(false);
      fetchReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = () => {
    if (!userReview) return;

    setReviewError("");
    setReviewSuccess("");
    setShowDeleteReviewModal(true);
  };

  const confirmDeleteReview = async () => {
    if (!userReview || reviewDeleteLoading) return;

    try {
      setReviewDeleteLoading(true);
      setReviewError("");
      await reviewsAPI.delete(userReview.id);
      setUserReview(null);
      setReviewRating(5);
      setReviewComment("");
      setCanReview(true);
      setShowReviewForm(false);
      setReviewSuccess("Review deleted successfully.");
      setShowDeleteReviewModal(false);
      await fetchReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to delete review.");
    } finally {
      setReviewDeleteLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || Number(product.stock) <= 0) {
      showNotice("This product is currently out of stock.");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.storeSlug = product.store?.slug || existingItem.storeSlug;
      existingItem.storeName = product.store?.name || existingItem.storeName;
    } else {
      cart.push({
        id: product.id,
        quantity: 1,
        storeSlug: product.store?.slug,
        storeName: product.store?.name,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    showNotice(`${product.name} added to cart.`);
  };

  const handleAddToWishlist = () => {
    if (!product) return;

    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

    if (!wishlist.includes(product.id)) {
      wishlist.push(product.id);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      showNotice(`${product.name} saved to wishlist.`);
    } else {
      showNotice("This product is already in your wishlist.");
    }
  };

  const storePath = product?.store?.slug ? `/store/${product.store.slug}` : "/stores";
  const outOfStock = Number(product?.stock) <= 0;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 text-neutral-950">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin" />
          <p className="mt-4 text-sm font-semibold text-neutral-600">Loading product...</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 text-neutral-950">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-neutral-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Package className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold">Product not found</h1>
          <p className="mt-2 text-neutral-600">The product you are looking for does not exist or is no longer available.</p>
          <Link
            to="/stores"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Stores
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <ConfirmModal
        isOpen={showDeleteReviewModal}
        message={DELETE_REVIEW_MESSAGE}
        onConfirm={confirmDeleteReview}
        onCancel={() => !reviewDeleteLoading && setShowDeleteReviewModal(false)}
        isLoading={reviewDeleteLoading}
      />

      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            to={storePath}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to={product.store?.slug ? `/shop-wishlist?store=${product.store.slug}` : "/shop-wishlist"}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold transition hover:border-neutral-950"
            >
              Wishlist
            </Link>
            <Link
              to="/cart"
              state={product.store?.slug ? { fromStore: `/store/${product.store.slug}` } : undefined}
              className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Cart
            </Link>
          </div>
        </div>
      </header>

      {notice && (
        <div className="fixed right-5 top-24 z-50 max-w-sm rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
            <p className="text-sm font-semibold text-neutral-800">{notice}</p>
            <button onClick={() => setNotice("")} className="ml-auto rounded-full p-1 hover:bg-neutral-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-2 lg:px-8 lg:py-14">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-400">
                <Package className="h-24 w-24" />
              </div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((image, index) => (
                <button
                  key={image || index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition ${
                    index === currentImageIndex
                      ? "border-neutral-950"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          {product.store && (
            <Link
              to={storePath}
              className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-700 ring-1 ring-neutral-200 transition hover:ring-neutral-950"
            >
              <Store className="h-4 w-4" />
              {product.store.name}
            </Link>
          )}

          {product.category && (
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">
              {product.category}
            </p>
          )}

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            {product.name}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <p className="text-4xl font-bold">{formatCurrency(product.price)}</p>
            <span
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                outOfStock
                  ? "bg-red-50 text-red-700"
                  : Number(product.stock) <= 5
                    ? "bg-amber-50 text-amber-700"
                    : "bg-green-50 text-green-700"
              }`}
            >
              {outOfStock ? "Out of stock" : `${product.stock} in stock`}
            </span>
          </div>

          {product.description && (
            <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">Description</h2>
              <p className="mt-3 leading-8 text-neutral-600">{product.description}</p>
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-7 py-4 font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-5 w-5" />
              {outOfStock ? "Unavailable" : "Add to Cart"}
            </button>
            <button
              onClick={handleAddToWishlist}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-7 py-4 font-semibold text-neutral-800 transition hover:border-neutral-950"
            >
              <Heart className="h-5 w-5" />
              Save
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 lg:px-8">
        <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 border-b border-neutral-200 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">Reviews</p>
              <h2 className="mt-2 text-3xl font-bold">Customer reviews</h2>
              <div className="mt-3 flex items-center gap-3">
                <StarRating rating={Math.round(ratingData.average || 0)} readonly size={18} />
                <span className="text-sm font-semibold text-neutral-600">
                  {ratingData.count > 0
                    ? `${Number(ratingData.average || 0).toFixed(1)} from ${ratingData.count} review${ratingData.count === 1 ? "" : "s"}`
                    : "No reviews yet"}
                </span>
              </div>
            </div>

            <div>
              {userReview ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm((current) => !current)}
                    className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    Edit review
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteReview}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              ) : canReview ? (
                <button
                  type="button"
                  onClick={() => setShowReviewForm((current) => !current)}
                  className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Write a review
                </button>
              ) : (
                <p className="max-w-sm text-sm leading-6 text-neutral-500">
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
            <form onSubmit={handleSubmitReview} className="mt-6 rounded-3xl bg-neutral-50 p-5">
              <h3 className="text-lg font-bold">{userReview ? "Update your review" : "Write your review"}</h3>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-neutral-700">Rating</label>
                <StarRating rating={reviewRating} onRate={setReviewRating} />
              </div>

              <div className="mt-4">
                <label htmlFor="reviewComment" className="mb-2 block text-sm font-semibold text-neutral-700">
                  Comment
                </label>
                <textarea
                  id="reviewComment"
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  rows="4"
                  className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-neutral-950 outline-none transition focus:border-neutral-950"
                  placeholder="Share quality, delivery, fit, packaging, or anything useful."
                />
              </div>

              {reviewError && (
                <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {reviewError}
                </p>
              )}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
                >
                  {reviewLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {userReview ? "Update review" : "Submit review"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-950"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {reviewSuccess && (
            <p className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              {reviewSuccess}
            </p>
          )}

          <div className="mt-6 space-y-4">
            {reviews.length === 0 ? (
              <p className="rounded-3xl bg-neutral-50 p-8 text-center text-neutral-500">
                No one has reviewed this product yet.
              </p>
            ) : (
              reviews.map((review) => (
                <article key={review.id} className="rounded-3xl border border-neutral-200 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-bold">
                        {review.user
                          ? `${review.user.firstName} ${review.user.lastName}`
                          : "Customer"}
                      </p>
                      <div className="mt-1">
                        <StarRating rating={review.rating} readonly size={16} />
                      </div>
                    </div>
                    {review.createdAt && (
                      <time className="text-sm text-neutral-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </time>
                    )}
                  </div>
                  {review.comment && (
                    <p className="mt-4 leading-7 text-neutral-600">{review.comment}</p>
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
