import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");

  const fetchListings = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/listings/"
      );

      setListings(response.data);
    } catch (error) {
      setError("Unable to load listings");
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div className="dashboard">

      {/* Welcome */}
      <section className="dashboard-header">

        <div>
          <h1>Welcome to Campus Exchange 👋</h1>
          <p>
            Buy, sell and exchange items with students on your campus.
          </p>
        </div>

        <button
          className="post-item-button"
          onClick={() => navigate("/create-listing")}
        >
          + Post Item
        </button>

      </section>


      {/* Error */}
      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      {/* Categories */}
      <section className="dashboard-section">

        <div className="section-heading">
          <h2>Popular Categories</h2>
        </div>

        <div className="category-grid">

          <button
            className="category-card"
            onClick={() => navigate("/listings?category=1")}
          >
            <span className="category-icon">📚</span>
            <strong>Books</strong>
            <small>Study books</small>
          </button>

          <button
            className="category-card"
            onClick={() => navigate("/listings?category=2")}
          >
            <span className="category-icon">📝</span>
            <strong>Notes</strong>
            <small>Handwritten notes</small>
          </button>

          <button
            className="category-card"
            onClick={() => navigate("/listings?category=3")}
          >
            <span className="category-icon">🔬</span>
            <strong>Lab Equipment</strong>
            <small>Lab materials</small>
          </button>

          <button
            className="category-card"
            onClick={() => navigate("/listings?category=4")}
          >
            <span className="category-icon">💻</span>
            <strong>Electronics</strong>
            <small>Devices & gadgets</small>
          </button>

          <button
            className="category-card"
            onClick={() => navigate("/listings?category=5")}
          >
            <span className="category-icon">✏️</span>
            <strong>Stationery</strong>
            <small>College supplies</small>
          </button>

          <button
            className="category-card"
            onClick={() => navigate("/listings?category=6")}
          >
            <span className="category-icon">📦</span>
            <strong>Others</strong>
            <small>Other items</small>
          </button>

        </div>

      </section>


      {/* Recent Listings */}
      <section className="dashboard-section">

        <div className="section-heading">

          <div>
            <h2>Recently Added</h2>
            <p>Latest items posted by students</p>
          </div>

          <button
            className="view-all-button"
            onClick={() => navigate("/listings")}
          >
            View all →
          </button>

        </div>


        {listings.length === 0 && !error && (
          <div className="empty-listings">
            <p>No listings available yet.</p>

            <button
              onClick={() => navigate("/create-listing")}
            >
              Post the first item
            </button>
          </div>
        )}


        <div className="listing-grid">

          {listings.slice(0, 6).map((listing) => (

            <div
              className="listing-card"
              key={listing.id}
            >

              <div className="listing-image">

                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                  />
                ) : (
                  <span>📦</span>
                )}

              </div>


              <div className="listing-info">

                <span className="listing-category">
                  {listing.category}
                </span>

                <h3>{listing.title}</h3>

                <p className="listing-description">
                  {listing.description || "No description available"}
                </p>

                <div className="listing-bottom">

                  <strong>
                    ₹{listing.price}
                  </strong>

                  <button
                    onClick={() =>
                      navigate(`/listings/${listing.id}`)
                    }
                  >
                    View
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* Simple Info Section */}
      <section className="dashboard-info">

        <div>
          <span>🔒</span>

          <div>
            <h3>Safe Student Marketplace</h3>
            <p>
              Connect with students and meet safely on campus.
            </p>
          </div>
        </div>

        <div>
          <span>🔄</span>

          <div>
            <h3>Buy, Sell & Exchange</h3>
            <p>
              Save money by finding useful items from other students.
            </p>
          </div>
        </div>

        <div>
          <span>📍</span>

          <div>
            <h3>Find Nearby Sellers</h3>
            <p>
              Find students selling items near your location.
            </p>
          </div>
        </div>

      </section>

    </div>
  );
}

export default Dashboard;