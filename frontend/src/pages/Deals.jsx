import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams
} from "react-router-dom";
import axios from "axios";

function Deals() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // --------------------------------------------------
  // URL DATA
  // --------------------------------------------------

  const listingIdFromUrl = searchParams.get("listing_id");
  const sellerIdFromUrl = searchParams.get("seller_id");

  // --------------------------------------------------
  // STATE
  // --------------------------------------------------

  const [deals, setDeals] = useState([]);
  const [listings, setListings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [listingId, setListingId] = useState(
    listingIdFromUrl || ""
  );

  const [sellerId, setSellerId] = useState(
    sellerIdFromUrl || ""
  );

  const [meetupLocation, setMeetupLocation] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Review
  const [reviewDeal, setReviewDeal] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // --------------------------------------------------
  // HELPER - ERROR MESSAGE
  // --------------------------------------------------

  const getErrorMessage = (error, fallback) => {
    const detail = error?.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return (
        detail
          .map((item) => item?.msg)
          .filter(Boolean)
          .join(", ") || fallback
      );
    }

    if (typeof error?.response?.data === "string") {
      return error.response.data;
    }

    return fallback;
  };

  // --------------------------------------------------
  // FETCH CURRENT USER
  // --------------------------------------------------

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://127.0.0.1:8000/auth/me",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setCurrentUser(response.data);
    } catch (error) {
      console.error("FETCH USER ERROR:", error);

      setError(
        getErrorMessage(
          error,
          "Unable to load user"
        )
      );
    }
  };

  // --------------------------------------------------
  // FETCH LISTINGS
  // --------------------------------------------------

  const fetchListings = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/listings/"
      );

      setListings(response.data);
    } catch (error) {
      console.error("FETCH LISTINGS ERROR:", error);
    }
  };

  // --------------------------------------------------
  // FETCH DEALS
  // --------------------------------------------------

  const fetchDeals = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://127.0.0.1:8000/deals/",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setDeals(response.data);
    } catch (error) {
      console.error("FETCH DEALS ERROR:", error);

      setError(
        getErrorMessage(
          error,
          "Unable to load deals"
        )
      );
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    fetchCurrentUser();
    fetchDeals();
    fetchListings();
  }, []);

  // --------------------------------------------------
  // REFRESH DEALS
  // --------------------------------------------------
  // Buyer and seller use separate browser sessions.
  // When one person confirms, the other person's page
  // needs to fetch the updated database state.
  //
  // Poll every 3 seconds while the user is on this page.
  // This makes the confirmation tick appear for both
  // users without requiring a manual page refresh.
  // --------------------------------------------------

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const interval = setInterval(() => {
      fetchDeals();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [currentUser]);

  // --------------------------------------------------
  // FIND LISTING
  // --------------------------------------------------

  const getListing = (id) => {
    return listings.find(
      (listing) => Number(listing.id) === Number(id)
    );
  };

  // --------------------------------------------------
  // CREATE DEAL
  // --------------------------------------------------

  const createDeal = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!currentUser) {
      setError(
        "User information is not loaded yet."
      );
      return;
    }

    if (!listingId || !sellerId) {
      setError(
        "Listing and seller information is missing."
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://127.0.0.1:8000/deals/",
        {
          listing_id: Number(listingId),

          // Logged-in user = buyer
          buyer_id: Number(currentUser.id),

          // Listing owner = seller
          seller_id: Number(sellerId),

          meetup_location:
            meetupLocation.trim() || null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setDeals((previousDeals) => [
        ...previousDeals,
        response.data
      ]);

      setMeetupLocation("");

      setSuccess(
        "Deal created successfully!"
      );

      // Refresh
      await fetchDeals();

    } catch (error) {
      console.error(
        "CREATE DEAL ERROR:",
        error?.response?.data
      );

      setError(
        getErrorMessage(
          error,
          "Unable to create deal"
        )
      );
    }
  };

  // --------------------------------------------------
  // CONFIRM MEETUP
  //
  // IMPORTANT:
  // This function receives the COMPLETE deal object.
  // --------------------------------------------------

// --------------------------------------------------
// CONFIRM MEETUP
// Buyer / Seller confirmation
// --------------------------------------------------

const confirmMeetup = async (deal) => {
  try {
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    if (!token || !currentUser) {
      setError("User information is not available.");
      return;
    }

    const currentUserId = Number(currentUser.id);
    const buyerId = Number(deal.buyer_id);
    const sellerId = Number(deal.seller_id);

    let payload = null;

    // ==============================
    // BUYER
    // ==============================

    if (currentUserId === buyerId) {

      if (deal.buyer_confirmed === true) {
        return;
      }

      payload = {
        buyer_confirmed: true
      };

      console.log("BUYER CONFIRMING");
      console.log("Current User:", currentUserId);
      console.log("Buyer ID:", buyerId);
      console.log("Seller ID:", sellerId);
      console.log("Payload:", payload);
    }

    // ==============================
    // SELLER
    // ==============================

    else if (currentUserId === sellerId) {

      if (deal.seller_confirmed === true) {
        return;
      }

      payload = {
        seller_confirmed: true
      };

      console.log("SELLER CONFIRMING");
      console.log("Current User:", currentUserId);
      console.log("Buyer ID:", buyerId);
      console.log("Seller ID:", sellerId);
      console.log("Payload:", payload);
    }

    // ==============================
    // NOT BUYER / SELLER
    // ==============================

    else {
      setError("You are not part of this deal.");
      return;
    }

    // ==============================
    // SEND TO BACKEND
    // ==============================

    const response = await axios.put(
      `http://127.0.0.1:8000/deals/${deal.id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("BACKEND RESPONSE:", response.data);

    // ==============================
    // UPDATE THIS DEAL
    // ==============================

    setDeals((previousDeals) =>
      previousDeals.map((item) =>
        Number(item.id) === Number(deal.id)
          ? response.data
          : item
      )
    );

    setSuccess("Meetup confirmation saved!");

    // Get latest database state
    await fetchDeals();

  } catch (error) {

    console.error("CONFIRM ERROR:", error);
    console.error(
      "BACKEND ERROR:",
      error?.response?.data
    );

    setError(
      error?.response?.data?.detail ||
      "Unable to confirm meetup."
    );
  }
};  // --------------------------------------------------
  // CHANGE MEETUP LOCATION
  //
  // Only allowed until BOTH confirm.
  // --------------------------------------------------

  const updateMeetup = async (deal) => {
    if (!deal || !deal.id) {
      setError(
        "Invalid deal information."
      );
      return;
    }

    // Both confirmed = location locked
    if (
      deal.buyer_confirmed &&
      deal.seller_confirmed
    ) {
      setError(
        "Meetup location is locked because both users have confirmed it."
      );
      return;
    }

    const location = window.prompt(
      "Enter meetup location:",
      deal.meetup_location || ""
    );

    if (location === null) {
      return;
    }

    const cleanLocation = location.trim();

    if (!cleanLocation) {
      setError(
        "Meetup location cannot be empty."
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://127.0.0.1:8000/deals/${deal.id}`,
        {
          meetup_location: cleanLocation
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setDeals((previousDeals) =>
        previousDeals.map((item) =>
          item.id === deal.id
            ? response.data
            : item
        )
      );

      setSuccess(
        "Meetup location updated!"
      );

      setError("");

      await fetchDeals();

    } catch (error) {
      console.error(
        "UPDATE MEETUP ERROR:",
        error?.response?.data
      );

      setError(
        getErrorMessage(
          error,
          "Unable to update meetup location"
        )
      );
    }
  };

  // --------------------------------------------------
  // COMPLETE DEAL
  //
  // Seller completes transaction.
  // --------------------------------------------------

  const completeDeal = async (deal) => {
    if (!deal || !deal.id) {
      setError(
        "Invalid deal information."
      );
      return;
    }

    if (!currentUser) {
      setError(
        "User information is not loaded."
      );
      return;
    }

    // Only seller
    if (
      Number(currentUser.id) !==
      Number(deal.seller_id)
    ) {
      setError(
        "Only the seller can complete this transaction."
      );
      return;
    }

    // Both must confirm meetup
    if (
      !deal.buyer_confirmed ||
      !deal.seller_confirmed
    ) {
      setError(
        "Both buyer and seller must confirm the meetup first."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure the transaction has been completed?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://127.0.0.1:8000/deals/${deal.id}`,
        {
          status: "Completed"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setDeals((previousDeals) =>
        previousDeals.map((item) =>
          item.id === deal.id
            ? response.data
            : item
        )
      );

      setSuccess(
        "Transaction completed successfully!"
      );

      setError("");

      await fetchDeals();

      // Refresh listings too
      // because backend should change
      // listing status to Sold.
      await fetchListings();

    } catch (error) {
      console.error(
        "COMPLETE DEAL ERROR:",
        error?.response?.data
      );

      setError(
        getErrorMessage(
          error,
          "Unable to complete transaction"
        )
      );
    }
  };

  // --------------------------------------------------
  // CANCEL DEAL
  // --------------------------------------------------

  const cancelDeal = async (deal) => {
    if (!deal || !deal.id) {
      setError(
        "Invalid deal information."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this deal?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://127.0.0.1:8000/deals/${deal.id}`,
        {
          status: "Cancelled"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setDeals((previousDeals) =>
        previousDeals.map((item) =>
          item.id === deal.id
            ? response.data
            : item
        )
      );

      setSuccess(
        "Deal cancelled."
      );

      setError("");

      await fetchDeals();

    } catch (error) {
      console.error(
        "CANCEL DEAL ERROR:",
        error?.response?.data
      );

      setError(
        getErrorMessage(
          error,
          "Unable to cancel deal"
        )
      );
    }
  };

  // --------------------------------------------------
  // OPEN REVIEW
  // --------------------------------------------------

  const openReview = (deal) => {
    setReviewDeal(deal);
    setRating(5);
    setComment("");
    setError("");
    setSuccess("");
  };

  // --------------------------------------------------
  // SUBMIT REVIEW
  // --------------------------------------------------

  const submitReview = async () => {
    if (!reviewDeal) {
      return;
    }

    if (!currentUser) {
      setError(
        "User information is not loaded."
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");

      /*
        Buyer reviews seller.
      */

      const reviewedUserId =
        Number(reviewDeal.seller_id);

      await axios.post(
        "http://127.0.0.1:8000/reviews/",
        {
          deal_id: Number(reviewDeal.id),

          reviewed_user_id:
            reviewedUserId,

          rating: Number(rating),

          comment:
            comment.trim() || null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess(
        "Review submitted successfully!"
      );

      setError("");

      setReviewDeal(null);
      setRating(5);
      setComment("");

    } catch (error) {
      console.error(
        "REVIEW ERROR:",
        error?.response?.data
      );

      setError(
        getErrorMessage(
          error,
          "Unable to submit review"
        )
      );
    }
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="deals-page">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="deals-header">

        <div>
          <h1>
            My Deals 🤝
          </h1>

          <p>
            Manage your purchases and exchanges.
          </p>
        </div>

      </div>

      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ==========================================
          SUCCESS
      ========================================== */}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* ==========================================
          CREATE DEAL
      ========================================== */}

      <div className="deal-form">

        <h2>
          Create Deal 🤝
        </h2>

        <p>
          {listingId && sellerId
            ? "You are creating a deal for the selected item."
            : "Open a listing and start a transaction."}
        </p>

        {!listingId || !sellerId ? (

          <button
            type="button"
            onClick={() =>
              navigate("/listings")
            }
          >
            Browse Items
          </button>

        ) : (

          <form onSubmit={createDeal}>

            <input
              type="text"
              placeholder="Meetup Location"
              value={meetupLocation}
              onChange={(e) =>
                setMeetupLocation(
                  e.target.value
                )
              }
              required
            />

            <button type="submit">
              🤝 Create Deal
            </button>

          </form>

        )}

      </div>

      {/* ==========================================
          DEALS LIST
      ========================================== */}

      <div className="deals-list">

        <div className="deals-list-header">

          <h2>
            My Deals
          </h2>

          <span>
            {deals.length} deals
          </span>

        </div>

        {deals.length === 0 ? (

          <div className="empty-deals">

            <div className="empty-icon">
              🤝
            </div>

            <h2>
              Ready to make a deal?
            </h2>

            <p>
              Open a listing and start a transaction.
            </p>

            <button
              onClick={() =>
                navigate("/listings")
              }
            >
              Browse Items
            </button>

          </div>

        ) : (

          deals.map((deal) => {

            const listing =
              getListing(deal.listing_id);

            // ------------------------------------------
            // PRODUCT NAME
            // ------------------------------------------

            const productName =
              listing?.title ||
              `Listing #${deal.listing_id}`;

            // ------------------------------------------
            // PRODUCT PRICE
            // ------------------------------------------

            const productPrice =
              listing?.price;

            // ------------------------------------------
            // SELLER NAME
            //
            // Prevent React from trying to render
            // an object.
            // ------------------------------------------

            let sellerName =
              `User ${deal.seller_id}`;

            if (
              typeof listing?.seller ===
              "string"
            ) {
              sellerName =
                listing.seller;
            } else if (
              listing?.seller?.name
            ) {
              sellerName =
                listing.seller.name;
            } else if (
              listing?.seller?.username
            ) {
              sellerName =
                listing.seller.username;
            }

            // ------------------------------------------
            // BUYER / SELLER
            // ------------------------------------------

            const isBuyer =
              currentUser &&
              Number(deal.buyer_id) ===
                Number(currentUser.id);

            const isSeller =
              currentUser &&
              Number(deal.seller_id) ===
                Number(currentUser.id);

            // ------------------------------------------
            // BOTH CONFIRMED
            // ------------------------------------------

            const bothConfirmed =
              Boolean(
                deal.buyer_confirmed &&
                deal.seller_confirmed
              );

            // ------------------------------------------
            // STATUS
            // ------------------------------------------

            const statusClass =
              deal.status
                ?.toLowerCase()
                .replace(/\s+/g, "-");

            return (

              <div
                className="deal-card"
                key={deal.id}
              >

                {/* ======================================
                    CARD HEADER
                ====================================== */}

                <div className="deal-card-header">

                  <div className="deal-product">

                    <div className="deal-product-icon">
                      📦
                    </div>

                    <div>

                      <h3>
                        {productName}
                      </h3>

                      <p>
                        Seller:{" "}
                        <strong>
                          {sellerName}
                        </strong>
                      </p>

                    </div>

                  </div>

                  <span
                    className={`deal-status ${statusClass || ""}`}
                  >
                    {deal.status}
                  </span>

                </div>

                {/* ======================================
                    DEAL INFORMATION
                ====================================== */}

                <div className="deal-info">

                  <div>

                    <span>
                      Price
                    </span>

                    <strong>
                      {productPrice !== undefined &&
                      productPrice !== null
                        ? `₹${productPrice}`
                        : "Not available"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Meetup
                    </span>

                    <strong>
                      {deal.meetup_location ||
                        "Not specified"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Deal #
                    </span>

                    <strong>
                      {deal.id}
                    </strong>

                  </div>

                </div>

                {/* ======================================
                    CONFIRMATION STATUS
                ====================================== */}

                {(deal.status === "Pending" ||
                  deal.status === "Meetup") && (

                  <div className="confirmation-status">

                    <p>
                      {deal.buyer_confirmed
                        ? "✅ Buyer confirmed"
                        : "⏳ Buyer hasn't confirmed yet"}
                    </p>

                    <p>
                      {deal.seller_confirmed
                        ? "✅ Seller confirmed"
                        : "⏳ Seller hasn't confirmed yet"}
                    </p>

                  </div>

                )}

                {/* ======================================
                    ACTIONS
                ====================================== */}

                <div className="deal-actions">

  {/* ================================= */}
{/* BUYER CONFIRMATION */}
{/* ================================= */}

{deal.status === "Pending" && isBuyer && (
  <button
    type="button"
    className="primary-action"
    onClick={() => confirmMeetup(deal)}
    disabled={deal.buyer_confirmed === true}
  >
    {deal.buyer_confirmed === true
      ? "✅ Meetup Confirmed"
      : "📍 Confirm Meetup"}
  </button>
)}


{/* ================================= */}
{/* SELLER CONFIRMATION */}
{/* ================================= */}

{deal.status === "Pending" && isSeller && (
  <button
    type="button"
    className="primary-action"
    onClick={() => confirmMeetup(deal)}
    disabled={deal.seller_confirmed === true}
  >
    {deal.seller_confirmed === true
      ? "✅ Meetup Confirmed"
      : "📍 Confirm Meetup"}
  </button>
)}


  {/* ================================= */}
  {/* CHANGE MEETUP */}
  {/* ================================= */}

  {(deal.status === "Pending" ||
    deal.status === "Meetup") &&
    (isBuyer || isSeller) &&
    !(deal.buyer_confirmed &&
      deal.seller_confirmed) && (

      <button
        type="button"
        className="secondary-action"
        onClick={() => updateMeetup(deal)}
      >
        📍 Change Meetup
      </button>
  )}


  {/* ================================= */}
  {/* COMPLETE DEAL */}
  {/* ================================= */}

  {deal.status === "Meetup" &&
    isSeller && (

      <button
        type="button"
        className="complete-action"
        onClick={() => completeDeal(deal)}
      >
        ✅ Mark Transaction Complete
      </button>
  )}


  {/* ================================= */}
  {/* RATE SELLER */}
  {/* ================================= */}

  {deal.status === "Completed" &&
    isBuyer && (

      <button
        type="button"
        className="review-action"
        onClick={() => openReview(deal)}
      >
        ⭐ Rate Seller
      </button>
  )}

  {/* ================================= */}
{/* CHAT AFTER BOTH CONFIRM */}
{/* ================================= */}

{bothConfirmed &&
  deal.status === "Meetup" &&
  (isBuyer || isSeller) && (

  <button
    type="button"
    className="chat-action"
    onClick={() => {

      const otherUserId = isBuyer
        ? deal.seller_id
        : deal.buyer_id;

      navigate(
        `/messages?receiver_id=${otherUserId}&listing_id=${deal.listing_id}`
      );

    }}
  >
    💬 Chat
  </button>

)}


  {/* ================================= */}
  {/* CANCEL */}
  {/* ================================= */}

  {(deal.status === "Pending" ||
    deal.status === "Meetup") && (

      <button
        type="button"
        className="cancel-action"
        onClick={() => cancelDeal(deal)}
      >
        Cancel Deal
      </button>
  )}

</div>

                {/* ======================================
                    COMPLETED
                ====================================== */}

                {deal.status === "Completed" && (

                  <div className="completed-message">
                    ✅ Transaction Completed
                  </div>

                )}

                {/* ======================================
                    CANCELLED
                ====================================== */}

                {deal.status === "Cancelled" && (

                  <div className="cancelled-message">
                    ❌ Deal Cancelled
                  </div>

                )}

              </div>

            );

          })

        )}

      </div>

      {/* ==========================================
          REVIEW MODAL
      ========================================== */}

      {reviewDeal && (

        <div className="review-overlay">

          <div className="review-modal">

            <button
              type="button"
              className="close-review"
              onClick={() =>
                setReviewDeal(null)
              }
            >
              ✕
            </button>

            <h2>
              Rate Seller ⭐
            </h2>

            <p>
              How was your experience with the seller?
            </p>

            {/* --------------------------------------
                STARS
            -------------------------------------- */}

            <div className="rating-stars">

              {[1, 2, 3, 4, 5].map(
                (star) => (

                <button
                  type="button"
                  key={star}
                  className={
                    star <= rating
                      ? "star active"
                      : "star"
                  }
                  onClick={() =>
                    setRating(star)
                  }
                >
                  ★
                </button>

              ))}

            </div>

            <p className="rating-text">
              {rating} out of 5
            </p>

            {/* --------------------------------------
                COMMENT
            -------------------------------------- */}

            <textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e) =>
                setComment(
                  e.target.value
                )
              }
            />

            {/* --------------------------------------
                REVIEW BUTTONS
            -------------------------------------- */}

            <div className="review-actions">

              <button
                type="button"
                className="secondary-action"
                onClick={() =>
                  setReviewDeal(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-action"
                onClick={submitReview}
              >
                Submit Review
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Deals;