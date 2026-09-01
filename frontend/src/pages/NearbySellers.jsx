import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function NearbySellers() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [locationMessage, setLocationMessage] =
    useState("");

  const [radius, setRadius] = useState(10);


  // ==================================================
  // FIND NEARBY SELLERS
  // ==================================================

  const findNearbySellers = () => {

    setError("");
    setLocationMessage("");

    if (!navigator.geolocation) {

      setError(
        "Your browser does not support location."
      );

      return;
    }


    setLocationLoading(true);


    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        try {

          setLoading(true);

          const response =
            await axios.get(
              "https://sprint-1-hr8e.onrender.com/listings/nearby",
              {
                params: {
                  latitude: latitude,
                  longitude: longitude,
                  radius: radius
                }
              }
            );


          setListings(response.data);

          setLocationMessage(
            `Showing sellers within ${radius} km of your location.`
          );

        } catch (error) {

          console.error(
            "NEARBY ERROR:",
            error
          );

          setError(
            error.response?.data?.detail ||
            "Unable to find nearby sellers."
          );

        } finally {

          setLoading(false);
          setLocationLoading(false);

        }

      },

      (error) => {

        console.error(
          "LOCATION ERROR:",
          error
        );

        setLocationLoading(false);

        setError(
          "Location permission is required to find nearby sellers."
        );

      }

    );
  };


  return (

    <main className="nearby-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="nearby-header">

        <div>

          <span className="nearby-label">
            CAMPUS EXCHANGE
          </span>

          <h1>
            Nearby Sellers 📍
          </h1>

          <p>
            Discover products available from
            students near you.
          </p>

        </div>


        <button
          className="nearby-back-button"
          onClick={() =>
            navigate("/listings")
          }
        >
          ← Browse Items
        </button>

      </div>


      {/* ==================================================
          LOCATION CONTROLS
      ================================================== */}

      <div className="nearby-controls">

        <div>

          <label>
            Search radius
          </label>

          <select
            value={radius}
            onChange={(e) =>
              setRadius(
                Number(e.target.value)
              )
            }
          >
            <option value={2}>
              2 km
            </option>

            <option value={5}>
              5 km
            </option>

            <option value={10}>
              10 km
            </option>

            <option value={20}>
              20 km
            </option>

            <option value={50}>
              50 km
            </option>
          </select>

        </div>


        <button
          className="nearby-find-button"
          onClick={findNearbySellers}
          disabled={
            loading ||
            locationLoading
          }
        >

          {locationLoading
            ? "Getting location..."
            : loading
              ? "Finding sellers..."
              : "📍 Find Nearby Sellers"}

        </button>

      </div>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (

        <div className="nearby-error">
          {error}
        </div>

      )}


      {/* ==================================================
          LOCATION MESSAGE
      ================================================== */}

      {locationMessage && (

        <div className="nearby-success">
          ✓ {locationMessage}
        </div>

      )}


      {/* ==================================================
          EMPTY STATE
      ================================================== */}

      {!loading &&
        listings.length === 0 &&
        !error && (

        <div className="nearby-empty">

          <div className="nearby-empty-icon">
            📍
          </div>

          <h2>
            Find sellers near you
          </h2>

          <p>
            Allow location access and we'll
            show available products from
            nearby students.
          </p>

          <button
            className="nearby-find-button"
            onClick={findNearbySellers}
          >
            📍 Find Nearby Sellers
          </button>

        </div>

      )}


      {/* ==================================================
          LISTINGS
      ================================================== */}

      {listings.length > 0 && (

        <div className="nearby-grid">

          {listings.map(
            (listing) => (

            <div
              className="nearby-card"
              key={listing.id}
            >

              {/* IMAGE */}

              <div className="nearby-image">

                {listing.images &&
                listing.images.length > 0 ? (

                  <img
                    src={
                      listing.images[0]
                    }
                    alt={
                      listing.title
                    }
                  />

                ) : (

                  <span>
                    📦
                  </span>

                )}

              </div>


              {/* CONTENT */}

              <div className="nearby-content">

                <span className="nearby-category">
                  {listing.category}
                </span>

                <h2>
                  {listing.title}
                </h2>

                <div className="nearby-price">
                  ₹{listing.price}
                </div>


                <div className="nearby-meta">

                  <span>
                    {listing.condition}
                  </span>

                  <span>
                    {listing.listing_type}
                  </span>

                </div>


                <div className="nearby-seller">

                  <div className="nearby-avatar">
                    {listing.seller
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <div>

                    <small>
                      Seller
                    </small>

                    <strong>
                      {listing.seller}
                    </strong>

                  </div>

                </div>


                <button
                  className="nearby-view-button"
                  onClick={() =>
                    navigate(
                      `/listings/${listing.id}`
                    )
                  }
                >
                  View Item →
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </main>

  );
}

export default NearbySellers;