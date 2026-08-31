import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Reviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);

  const [dealId, setDealId] = useState("");
  const [reviewedUserId, setReviewedUserId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [error, setError] = useState("");

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/reviews/"
      );

      setReviews(response.data);
    } catch (error) {
      setError("Unable to load reviews");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const submitReview = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://127.0.0.1:8000/reviews/",
        {
          deal_id: Number(dealId),
          reviewed_user_id: Number(reviewedUserId),
          rating: Number(rating),
          comment: comment
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setReviews([...reviews, response.data]);

      setDealId("");
      setReviewedUserId("");
      setRating(5);
      setComment("");
      setError("");

    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Unable to submit review"
      );
    }
  };

  return (
    <div>

      <nav className="navbar">

        <h2>Campus Exchange</h2>

        <div>

          <button onClick={() => navigate("/")}>
            Home
          </button>

          <button onClick={() => navigate("/listings")}>
            Listings
          </button>

          <button onClick={() => navigate("/favorites")}>
            Favorites
          </button>

          <button onClick={() => navigate("/messages")}>
            Messages
          </button>

          <button onClick={() => navigate("/deals")}>
            Deals
          </button>

          <button onClick={() => navigate("/reviews")}>
            Reviews
          </button>

        </div>

      </nav>

      <main className="reviews-page">

        <h1>Reviews ⭐</h1>

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <div className="review-form">

          <h2>Leave a Review</h2>

          <form onSubmit={submitReview}>

            <input
              type="number"
              placeholder="Deal ID"
              value={dealId}
              onChange={(e) =>
                setDealId(e.target.value)
              }
              required
            />

            <input
              type="number"
              placeholder="User ID to review"
              value={reviewedUserId}
              onChange={(e) =>
                setReviewedUserId(e.target.value)
              }
              required
            />

            <select
              value={rating}
              onChange={(e) =>
                setRating(e.target.value)
              }
            >
              <option value="5">5 ⭐</option>
              <option value="4">4 ⭐</option>
              <option value="3">3 ⭐</option>
              <option value="2">2 ⭐</option>
              <option value="1">1 ⭐</option>
            </select>

            <textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
            />

            <button type="submit">
              Submit Review
            </button>

          </form>

        </div>

        <div className="reviews-list">

          <h2>All Reviews</h2>

          {reviews.length === 0 && (
            <p>No reviews yet.</p>
          )}

          {reviews.map((review) => (

            <div
              className="review-card"
              key={review.id}
            >

              <h3>
                {"⭐".repeat(review.rating)}
              </h3>

              <p>
                {review.comment || "No comment"}
              </p>

              <p>
                <strong>Reviewer:</strong>{" "}
                User {review.reviewer_id}
              </p>

              <p>
                <strong>Reviewed User:</strong>{" "}
                User {review.reviewed_user_id}
              </p>

              <p>
                <strong>Deal:</strong>{" "}
                #{review.deal_id}
              </p>

            </div>

          ))}

        </div>

      </main>

    </div>
  );
}

export default Reviews;