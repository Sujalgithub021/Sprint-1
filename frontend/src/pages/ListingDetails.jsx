import {useEffect,useState} from "react";

import {
  useNavigate,
  useParams,
  useLocation
} from "react-router-dom";

import axios from "axios";

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [listing, setListing] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [myListings, setMyListings] = useState([]);
  const [showExchange, setShowExchange] = useState(false);
  const [selectedListing, setSelectedListing] = useState("");
  const [exchangeError, setExchangeError] = useState("");
  const [exchangeLoading, setExchangeLoading] = useState(false);

  const requireLogin = (action) => {
  const token = localStorage.getItem("token");

  const requireLogin = (action) => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login", {
      state: {
        from: location.pathname + location.search
      }
    });

    return;
  }

  action();
};

  if (!token) {
    navigate("/login", {
      state: {
        from: location.pathname + location.search
      }
    });

    return;
  }

  action();
};


  // ==================================================
  // LOAD LISTING
  // ==================================================

  useEffect(() => {
    fetchListing();
  }, [id]);


  const fetchListing = async () => {
    try {
      setError("");

      const response = await axios.get(
        `https://sprint-1-hr8e.onrender.com/listings/${id}`
      );

      setListing(response.data);

    } catch (error) {

      console.error(
        "LISTING ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to load listing"
      );
    }
  };


  // ==================================================
  // ADD FAVORITE
  // ==================================================

  const addFavorite = async () => {

    try {

      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      await axios.post(
        `https://sprint-1-hr8e.onrender.com/favorites/?listing_id=${id}`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      setMessage(
        "Added to favorites ❤️"
      );

    } catch (error) {

      setMessage(
        error.response?.data?.detail ||
        "Unable to add favorite"
      );
    }
  };


  // ==================================================
  // LOAD MY LISTINGS
  // ==================================================

const fetchMyListings = async () => {

  try {

    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const response = await axios.get(
      "https://sprint-1-hr8e.onrender.com/listings/my",
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

    const ownListings =
      response.data.filter(
        (item) =>
          Number(item.id) !== Number(id)
      );

    setMyListings(ownListings);

  } catch (error) {

    console.error(
      "MY LISTINGS ERROR:",
      error
    );

    setExchangeError(
      error.response?.data?.detail ||
      "Unable to load your listings."
    );
  }
};


  // ==================================================
  // OPEN EXCHANGE FORM
  // ==================================================

  const openExchangeForm = async () => {

    setExchangeError("");

    setSelectedListing("");

    setShowExchange(true);

    await fetchMyListings();
  };


  // ==================================================
  // PROPOSE EXCHANGE
  // ==================================================

  const proposeExchange = async () => {

    setExchangeError("");

    if (!selectedListing) {

      setExchangeError(
        "Please select an item to offer."
      );

      return;
    }


    try {

      const token =
        localStorage.getItem("token");

      if (!token) {

        navigate("/login");

        return;
      }


      setExchangeLoading(true);


      await axios.post(

        "https://sprint-1-hr8e.onrender.com/exchanges/",

        {
          receiver_id:
            listing.seller_id,

          offered_listing_id:
            Number(selectedListing),

          requested_listing_id:
            Number(listing.id)
        },

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }

      );


      setMessage(
        "Exchange request sent successfully! 🔄"
      );

      setShowExchange(false);

      setSelectedListing("");


    } catch (error) {

      console.error(
        "EXCHANGE ERROR:",
        error
      );

      setExchangeError(
        error.response?.data?.detail ||
        "Unable to send exchange request."
      );

    } finally {

      setExchangeLoading(false);
    }
  };


  // ==================================================
  // ERROR PAGE
  // ==================================================

  if (error) {

    return (

      <div className="details-page">

        <h2>
          {error}
        </h2>

        <button
          onClick={() =>
            navigate("/listings")
          }
        >
          Back to Listings
        </button>

      </div>
    );
  }


  // ==================================================
  // LOADING
  // ==================================================

  if (!listing) {

    return (

      <div className="details-page">

        <h2>
          Loading...
        </h2>

      </div>
    );
  }


  // ==================================================
  // UI
  // ==================================================

  return (

    <div className="details-page">


      {/* BACK */}

      <button
        className="back-button"
        onClick={() =>
          navigate("/listings")
        }
      >
        ← Back to Listings
      </button>


      <div className="listing-details-card">


        {/* ==================================================
            IMAGES
            ================================================== */}

        <div className="details-image">

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


        {/* ==================================================
            CONTENT
            ================================================== */}

        <div className="details-content">


          <span className="listing-category">
            {listing.category}
          </span>


          <h1>
            {listing.title}
          </h1>


          <h2>
            ₹{listing.price}
          </h2>


          <p>
            {listing.description ||
              "No description available."}
          </p>


          {/* ==================================================
              INFORMATION
              ================================================== */}

          <div className="details-info">

            <p>
              <strong>
                Condition:
              </strong>{" "}
              {listing.condition}
            </p>

            <p>
              <strong>
                Type:
              </strong>{" "}
              {listing.listing_type}
            </p>

            <p>
              <strong>
                Status:
              </strong>{" "}
              {listing.status}
            </p>

            <p>
              <strong>
                Seller:
              </strong>{" "}
              {listing.seller}
            </p>

          </div>


          {/* ==================================================
              ACTION BUTTONS
              ================================================== */}

          <div className="details-actions">

  {/* FAVORITE */}
  <button
    className="favorite-action"
    onClick={addFavorite}
  >
    ❤️ Add to Favorites
  </button>


  {/* MESSAGE SELLER */}
  <button className="btns"
  onClick={() =>
    requireLogin(() =>
      navigate(
        `/messages?receiver_id=${listing.seller_id}&listing_id=${listing.id}`
      )
    )
  }
>
  💬 Message Seller
</button>


  {/* BUY */}
  <button
  className="btns"
  onClick={() =>
    requireLogin(() =>
      navigate(
        `/deals?listing_id=${listing.id}&seller_id=${listing.seller_id}`
      )
    )
  }
>
  🛒 Buy Now
</button>


  {/* REQUEST EXCHANGE */}
  <button
  className="btns"
  onClick={() =>
    requireLogin(() =>
      navigate(
        `/exchanges?listing_id=${listing.id}&seller_id=${listing.seller_id}`
      )
    )
  }
>
  🔄 Request Exchange
</button>


  {/* PROPOSE EXCHANGE */}
  <button
  className="btns"
  onClick={() =>
    requireLogin(() =>
      navigate(
        `/exchanges?listing_id=${listing.id}&seller_id=${listing.seller_id}`
      )
    )
  }
>
  🔄 Propose Exchange
</button>

</div>


          {/* ==================================================
              EXCHANGE FORM
              ================================================== */}

          {showExchange && (

            <div className="exchange-box">

              <div className="exchange-box-header">

                <div>

                  <h3>
                    Propose an Exchange
                  </h3>

                  <p>
                    Choose one of your available
                    items to offer.
                  </p>

                </div>


                <button
                  type="button"
                  className="exchange-close"
                  onClick={() =>
                    setShowExchange(false)
                  }
                >
                  ×
                </button>

              </div>


              {myListings.length === 0 ? (

                <div className="exchange-empty">

                  <p>
                    You don't have any other
                    available listings to offer.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/create-listing")
                    }
                  >
                    + Post an Item
                  </button>

                </div>

              ) : (

                <>

                  <label>
                    Select your item
                  </label>


                  <select
                    value={selectedListing}
                    onChange={(e) =>
                      setSelectedListing(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Choose an item...
                    </option>

                    {myListings.map(
                      (item) => (

                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.title} — ₹
                        {item.price}
                      </option>

                    ))}

                  </select>


                  {exchangeError && (

                    <p className="exchange-error">
                      {exchangeError}
                    </p>

                  )}


                  <button
                    className="exchange-submit"
                    onClick={proposeExchange}
                    disabled={exchangeLoading}
                  >

                    {exchangeLoading
                      ? "Sending..."
                      : "Send Exchange Request"}

                  </button>

                </>

              )}

            </div>

          )}


          {/* ==================================================
              MESSAGE
              ================================================== */}

          {message && (

            <p className="success-message">
              {message}
            </p>

          )}

        </div>

      </div>

    </div>
  );
}

export default ListingDetails;