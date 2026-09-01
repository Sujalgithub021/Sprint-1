import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Favorites() {

  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==================================================
  // GET FAVORITES
  // ==================================================

  const fetchFavorites = async () => {

    try {

      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
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

      console.error(
        "FETCH FAVORITES ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to load favorites"
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    fetchFavorites();
  }, []);


  // ==================================================
  // REMOVE FAVORITE
  // ==================================================

  const removeFavorite = async (listingId) => {

    try {

      const token = localStorage.getItem("token");

      await axios.delete(
        `https://sprint-1-hr8e.onrender.com/favorites/${listingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setFavorites((previousFavorites) =>
        previousFavorites.filter(
          (favorite) =>
            favorite.listing_id !== listingId
        )
      );

    } catch (error) {

      console.error(
        "REMOVE FAVORITE ERROR:",
        error
      );

      alert(
        error.response?.data?.detail ||
        "Unable to remove favorite"
      );
    }
  };


  // ==================================================
  // UI
  // ==================================================

  return (

    <main className="favorites-page">

      <div className="favorites-header">

        <div>

          <h1>
            Favorites <span>♥</span>
          </h1>

          <p>
            Your saved items
          </p>

        </div>

        <div className="favorites-count">

          {favorites.length}

          <span>
            saved
          </span>

        </div>

      </div>


      {/* LOADING */}

      {loading && (

        <div className="favorites-status">
          Loading favorites...
        </div>

      )}


      {/* ERROR */}

      {!loading && error && (

        <div className="favorites-error">
          {error}
        </div>

      )}


      {/* EMPTY */}

      {!loading &&
        !error &&
        favorites.length === 0 && (

        <div className="favorites-empty">

          <div className="empty-heart">
            ♡
          </div>

          <h2>
            No favorites yet
          </h2>

          <p>
            Save items you like and they will
            appear here.
          </p>

          <button
            className="browse-favorites-btn"
            onClick={() => navigate("/listings")}
          >
            Browse Items
          </button>

        </div>

      )}


      {/* FAVORITES */}

      {!loading &&
        !error &&
        favorites.length > 0 && (

        <div className="favorites-grid">

          {favorites.map((favorite) => (

            <div
              className="favorite-card"
              key={favorite.id}
            >

              <div className="favorite-card-content">

                <div className="favorite-heart">
                  ♥
                </div>

                <div>

                  <span className="saved-text">
                    SAVED
                  </span>

                  <h2>
                    {favorite.listing_title ||
                      "Unnamed Listing"}
                  </h2>

                </div>

              </div>


              <div className="favorite-card-footer">

                <button
                  className="view-favorite-btn"
                  onClick={() =>
                    navigate(
                      `/listings/${favorite.listing_id}`
                    )
                  }
                >
                  View Listing
                </button>


                <button
                  className="remove-favorite-btn"
                  onClick={() =>
                    removeFavorite(
                      favorite.listing_id
                    )
                  }
                >
                  Remove
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </main>
  );
}

export default Favorites;