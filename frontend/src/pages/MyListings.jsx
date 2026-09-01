import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MyListings() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // FETCH MY LISTINGS
  // ==================================================

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await axios.get(
        "https://sprint-1-hr8e.onrender.com/listings/my",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setListings(response.data);

    } catch (error) {
      console.error("MY LISTINGS ERROR:", error);

      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(
          error.response?.data?.detail ||
          "Unable to load your listings."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOAD LISTINGS
  // ==================================================

  useEffect(() => {
    fetchMyListings();
  }, []);

  // ==================================================
  // REMOVE LISTING
  // ==================================================

  const removeListing = async (listingId) => {
    const confirmRemove = window.confirm(
      "Are you sure you want to remove this listing?"
    );

    if (!confirmRemove) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first.");
        return;
      }

      await axios.delete(
        `https://sprint-1-hr8e.onrender.com/listings/${listingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Remove listing immediately from screen
      setListings((previousListings) =>
        previousListings.filter(
          (listing) => listing.id !== listingId
        )
      );

    } catch (error) {
      console.error("REMOVE LISTING ERROR:", error);

      alert(
        error.response?.data?.detail ||
        "Unable to remove listing."
      );
    }
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <main className="my-listings-page">

        <div className="my-listings-loading">
          <h2>Loading your listings...</h2>
        </div>

      </main>
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <main className="my-listings-page">

      {/* ==============================================
          HEADER
          ============================================== */}

      <div className="my-listings-header">

        <div>

          <span className="my-listings-label">
            MY PRODUCTS
          </span>

          <h1>
            My Listings 📦
          </h1>

          <p>
            Manage all the products you have posted.
          </p>

        </div>

        <button
          className="my-listings-post-button"
          onClick={() => navigate("/create-listing")}
        >
          + Post Item
        </button>

      </div>


      {/* ==============================================
          ERROR
          ============================================== */}

      {error && (
        <div className="my-listings-error">
          {error}
        </div>
      )}


      {/* ==============================================
          EMPTY STATE
          ============================================== */}

      {!error && listings.length === 0 && (

        <div className="my-listings-empty">

          <div className="my-listings-empty-icon">
            📦
          </div>

          <h2>
            No listings yet
          </h2>

          <p>
            You haven't posted any products yet.
          </p>

          <button
            className="my-listings-post-button"
            onClick={() => navigate("/create-listing")}
          >
            + Post Your First Item
          </button>

        </div>

      )}


      {/* ==============================================
          LISTING COUNT
          ============================================== */}

      {!error && listings.length > 0 && (

        <div className="my-listings-count">

          <strong>
            {listings.length}
          </strong>

          <span>
            {listings.length === 1
              ? " Product Posted"
              : " Products Posted"}
          </span>

        </div>

      )}


      {/* ==============================================
          LISTING GRID
          ============================================== */}

      {!error && listings.length > 0 && (

        <div className="my-listings-grid">

          {listings.map((listing) => (

            <div
              className="my-listing-card"
              key={listing.id}
            >

              {/* ========================================
                  PRODUCT IMAGE
                  ======================================== */}

              <div className="my-listing-image">

                {listing.images &&
                listing.images.length > 0 ? (

                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                  />

                ) : (

                  <span>
                    📦
                  </span>

                )}

              </div>


              {/* ========================================
                  CARD CONTENT
                  ======================================== */}

              <div className="my-listing-content">

                {/* Category + Status */}

                <div className="my-listing-top">

                  <span className="my-listing-category">
                    {listing.category}
                  </span>

                  <span
                    className={`my-listing-status ${
                      listing.status?.toLowerCase()
                    }`}
                  >
                    {listing.status}
                  </span>

                </div>


                {/* Product Name */}

                <h2 className="my-listing-title">
                  {listing.title}
                </h2>


                {/* Description */}

                <p className="my-listing-description">

                  {listing.description ||
                    "No description available."}

                </p>


                {/* ======================================
                    PRODUCT INFORMATION
                    ====================================== */}

                <div className="my-listing-info">

                  <div>

                    <span>
                      Condition
                    </span>

                    <strong>
                      {listing.condition}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Type
                    </span>

                    <strong>
                      {listing.listing_type}
                    </strong>

                  </div>

                </div>


                {/* ======================================
                    PRICE + REMOVE
                    ====================================== */}

                <div className="my-listing-bottom">

                  <strong className="my-listing-price">
                    ₹{listing.price}
                  </strong>

                  <button
                    className="my-listing-remove-button"
                    onClick={() =>
                      removeListing(listing.id)
                    }
                  >
                    🗑 Remove
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </main>
  );
}

export default MyListings;