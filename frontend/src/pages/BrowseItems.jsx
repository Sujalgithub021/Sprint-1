import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function BrowseItems() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [condition, setCondition] = useState("All");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [error, setError] = useState("");

  // -------------------------
  // Fetch Listings
  // -------------------------

  const fetchListings = async () => {
    try {
      const response = await axios.get(
        "https://sprint-1-hr8e.onrender.com/listings/"
      );

      setListings(response.data);

    } catch (error) {
      setError("Unable to load listings");
    }
  };


  // -------------------------
  // Fetch Favorites
  // -------------------------

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await axios.get(
        "https://sprint-1-hr8e.onrender.com/favorites/",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setFavorites(response.data);

    } catch (error) {
      console.log("Unable to load favorites");
    }
  };


  useEffect(() => {
    fetchListings();
    fetchFavorites();
  }, []);


  // -------------------------
  // Toggle Favorite
  // -------------------------

  const toggleFavorite = async (listingId) => {

    try {

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const isFavorite = favorites.some(
        (favorite) =>
          favorite.listing_id === listingId
      );


      if (isFavorite) {

        await axios.delete(
          `https://sprint-1-hr8e.onrender.com/favorites/${listingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setFavorites(
          favorites.filter(
            (favorite) =>
              favorite.listing_id !== listingId
          )
        );

      } else {

        const response = await axios.post(
          `https://sprint-1-hr8e.onrender.com/favorites/?listing_id=${listingId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setFavorites([
          ...favorites,
          response.data
        ]);
      }

    } catch (error) {

      setError(
        error.response?.data?.detail ||
        "Unable to update favorite"
      );

    }
  };


  // -------------------------
  // Filter Listings
  // -------------------------

  const filteredListings = listings.filter((listing) => {

    const matchesSearch =
      listing.title
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (listing.description || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" ||
      listing.category === category;

    const matchesCondition =
      condition === "All" ||
      listing.condition === condition;

    const matchesPrice =
      Number(listing.price) <= Number(maxPrice);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesCondition &&
      matchesPrice
    );
  });


  // -------------------------
  // UI
  // -------------------------

  return (
    <div className="browse-page">

      {/* Header */}

      <div className="browse-header">

        <div>
          <h1>Browse Items</h1>

          <p>
            Find books, notes, lab equipment and more from students.
          </p>
        </div>

        <button
          className="post-item-button"
          onClick={() => navigate("/create-listing")}
        >
          + Post Item
        </button>

      </div>


      {/* Categories */}

      <div className="category-tabs">

        {[
          "All",
          "Books",
          "Notes",
          "Lab Equipment",
          "Electronics",
          "Stationery",
          "Other"
        ].map((item) => (

          <button
            key={item}
            className={
              category === item
                ? "category-tab active"
                : "category-tab"
            }
            onClick={() => setCategory(item)}
          >
            {item}
          </button>

        ))}

      </div>


      <div className="browse-layout">

        {/* Filters */}

        <aside className="filter-box">

          <div className="filter-title">

            <h2>Filters</h2>

            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
                setCondition("All");
                setMaxPrice(5000);
              }}
            >
              Clear all
            </button>

          </div>


          {/* Search */}

          <div className="filter-section">

            <label>Search in results</label>

            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          {/* Category */}

          <div className="filter-section">

            <label>Category</label>

            {[
              "All",
              "Books",
              "Notes",
              "Lab Equipment",
              "Electronics",
              "Stationery",
              "Other"
            ].map((item) => (

              <label
                className="checkbox-label"
                key={item}
              >

                <input
                  type="radio"
                  name="category"
                  checked={category === item}
                  onChange={() =>
                    setCategory(item)
                  }
                />

                {item}

              </label>

            ))}

          </div>


          {/* Condition */}

          <div className="filter-section">

            <label>Condition</label>

            {[
              "All",
              "New",
              "Like New",
              "Good",
              "Used"
            ].map((item) => (

              <label
                className="checkbox-label"
                key={item}
              >

                <input
                  type="radio"
                  name="condition"
                  checked={condition === item}
                  onChange={() =>
                    setCondition(item)
                  }
                />

                {item}

              </label>

            ))}

          </div>


          {/* Price */}

          <div className="filter-section">

            <label>
              Maximum Price: ₹{maxPrice}
            </label>

            <input
              type="range"
              min="0"
              max="5000"
              step="50"
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(e.target.value)
              }
            />

          </div>

        </aside>


        {/* Results */}

        <main className="browse-results">

          <div className="results-header">

            <p>
              Showing{" "}
              <strong>
                {filteredListings.length}
              </strong>{" "}
              items
            </p>

          </div>


          {error && (
            <p className="error-message">
              {error}
            </p>
          )}


          {filteredListings.length === 0 && !error && (

            <div className="empty-listings">

              <h2>No items found</h2>

              <p>
                Try changing your search or filters.
              </p>

            </div>

          )}


          <div className="listing-grid">

            {filteredListings.map((listing) => {

              const isFavorite = favorites.some(
                (favorite) =>
                  favorite.listing_id === listing.id
              );

              return (

                <div
                  className="listing-card"
                  key={listing.id}
                >

                  {/* Image */}

                  <div className="listing-image">

                    {listing.images &&
                    listing.images.length > 0 ? (

                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                      />

                    ) : (

                      <span>📦</span>

                    )}

                  </div>


                  {/* Information */}

                  <div className="listing-info">

                    <div className="listing-card-top">

                      <span className="listing-category">
                        {listing.category}
                      </span>


                      <button
                        className="favorite-button"
                        onClick={() =>
                          toggleFavorite(listing.id)
                        }
                      >
                        {isFavorite ? "❤️" : "♡"}
                      </button>

                    </div>


                    <h3>
                      {listing.title}
                    </h3>


                    <p className="listing-description">
                      {listing.description ||
                        "No description available"}
                    </p>


                    <p className="listing-condition">
                      Condition: {listing.condition}
                    </p>


                    <div className="listing-bottom">

                      <strong>
                        ₹{listing.price}
                      </strong>


                      <button
                        onClick={() =>
                          navigate(
                            `/listings/${listing.id}`
                          )
                        }
                      >
                        View
                      </button>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        </main>

      </div>

    </div>
  );
}

export default BrowseItems;