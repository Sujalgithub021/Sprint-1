import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

function Exchanges() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ==================================================
  // STATE
  // ==================================================

  const [exchanges, setExchanges] = useState([]);
  const [myListings, setMyListings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingListings, setLoadingListings] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showExchangeForm, setShowExchangeForm] = useState(false);

  const [selectedListingId, setSelectedListingId] = useState("");

  const [requestedListingId, setRequestedListingId] =
    useState(
    searchParams.get("requested_listing_id") ||
    searchParams.get("listing_id") ||
    ""
  );

const [receiverId, setReceiverId] =
  useState(
    searchParams.get("receiver_id") ||
    searchParams.get("seller_id") ||
    ""
  );


  // ==================================================
  // FETCH EXCHANGES
  // ==================================================

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "http://127.0.0.1:8000/exchanges/",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setExchanges(response.data);

    } catch (error) {
      console.error(
        "EXCHANGES ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to load exchanges"
      );

    } finally {
      setLoading(false);
    }
  };


  // ==================================================
  // FETCH MY LISTINGS
  // ==================================================

  const fetchMyListings = async () => {
    try {
      setLoadingListings(true);

      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await axios.get(
        "http://127.0.0.1:8000/listings/my",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMyListings(response.data);

    } catch (error) {
      console.error(
        "MY LISTINGS ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to load your listings"
      );

    } finally {
      setLoadingListings(false);
    }
  };


  // ==================================================
  // PAGE LOAD
  // ==================================================

 useEffect(() => {
  fetchExchanges();

  const requestedId =
  searchParams.get("requested_listing_id") ||
  searchParams.get("listing_id");

const receiver =
  searchParams.get("receiver_id") ||
  searchParams.get("seller_id");

  if (requestedId && receiver) {
    setRequestedListingId(requestedId);
    setReceiverId(receiver);

    fetchMyListings();

    setShowExchangeForm(true);
  }
}, []);


  // ==================================================
  // OPEN EXCHANGE FORM
  // ==================================================

  const openExchangeForm = async () => {
    setSuccess("");
    setError("");

    await fetchMyListings();

    setShowExchangeForm(true);
  };


  // ==================================================
  // SEND EXCHANGE REQUEST
  // ==================================================

  const sendExchangeRequest = async () => {

    setError("");
    setSuccess("");

    if (!selectedListingId) {
      setError(
        "Please select one of your listings."
      );
      return;
    }

    if (!requestedListingId) {
      setError(
        "Requested listing is missing."
      );
      return;
    }

    if (!receiverId) {
      setError(
        "Seller information is missing."
      );
      return;
    }

    try {

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const payload = {
        receiver_id: Number(receiverId),

        offered_listing_id:
          Number(selectedListingId),

        requested_listing_id:
          Number(requestedListingId)
      };

      console.log(
        "EXCHANGE REQUEST PAYLOAD:",
        payload
      );

      const response = await axios.post(
        "http://127.0.0.1:8000/exchanges/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(
        "EXCHANGE CREATED:",
        response.data
      );

      setSuccess(
        "Exchange request sent successfully! 🔄"
      );

      setShowExchangeForm(false);

      setSelectedListingId("");

      fetchExchanges();

    } catch (error) {

      console.error(
        "CREATE EXCHANGE ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to send exchange request"
      );
    }
  };


  // ==================================================
  // UPDATE EXCHANGE
  // ==================================================

  const updateExchange = async (
    exchangeId,
    status
  ) => {

    try {

      const token =
        localStorage.getItem("token");

      await axios.put(
        `http://127.0.0.1:8000/exchanges/${exchangeId}`,
        {
          status: status
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchExchanges();

    } catch (error) {

      console.error(
        "UPDATE EXCHANGE ERROR:",
        error
      );

      alert(
        error.response?.data?.detail ||
        "Unable to update exchange"
      );
    }
  };


  // ==================================================
  // DELETE EXCHANGE
  // ==================================================

  const deleteExchange = async (
    exchangeId
  ) => {

    try {

      const token =
        localStorage.getItem("token");

      await axios.delete(
        `http://127.0.0.1:8000/exchanges/${exchangeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setExchanges(
        (previous) =>
          previous.filter(
            (exchange) =>
              exchange.id !== exchangeId
          )
      );

    } catch (error) {

      console.error(
        "DELETE EXCHANGE ERROR:",
        error
      );

      alert(
        error.response?.data?.detail ||
        "Unable to delete exchange"
      );
    }
  };


  // ==================================================
  // GET LISTING NAME
  // ==================================================

  const getListingName = (
    listingId
  ) => {

    const listing =
      myListings.find(
        (item) =>
          Number(item.id) ===
          Number(listingId)
      );

    if (listing) {
      return listing.title;
    }

    return `Listing #${listingId}`;
  };


  // ==================================================
  // UI
  // ==================================================

  return (

    <main className="exchange-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="exchange-header">

        <div>

          <span className="exchange-label">
            CAMPUS EXCHANGE
          </span>

          <h1>
            My Exchanges 🔄
          </h1>

          <p>
            Exchange your items with other students.
          </p>

        </div>

        <button
          className="exchange-browse-button"
          onClick={() =>
            navigate("/listings")
          }
        >
          Browse Items
        </button>

      </div>


      {/* ==================================================
          SUCCESS
      ================================================== */}

      {success && (

        <div className="exchange-success">
          ✓ {success}
        </div>

      )}


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (

        <div className="exchange-error">
          {error}
        </div>

      )}


      {/* ==================================================
          EXCHANGE FORM
      ================================================== */}

      {showExchangeForm && (

        <div className="exchange-form-card">

          <div className="exchange-form-header">

            <div>

              <span className="exchange-label">
                PROPOSE EXCHANGE
              </span>

              <h2>
                Choose Your Item
              </h2>

              <p>
                Select one of your listings
                that you want to offer.
              </p>

            </div>

            <button
              className="exchange-close-button"
              onClick={() => {
                setShowExchangeForm(false);
                setError("");
              }}
            >
              ✕
            </button>

          </div>


          {loadingListings && (

            <p className="exchange-message">
              Loading your listings...
            </p>

          )}


          {!loadingListings &&
            myListings.length === 0 && (

            <div className="exchange-empty-small">

              <h3>
                You don't have any listings.
              </h3>

              <p>
                Post an item first before
                requesting an exchange.
              </p>

              <button
                className="exchange-primary-button"
                onClick={() =>
                  navigate("/create-listing")
                }
              >
                + Post Item
              </button>

            </div>

          )}


          {!loadingListings &&
            myListings.length > 0 && (

            <>

              <div className="my-exchange-listings">

                {myListings
                  .filter(
                    (listing) =>
                      listing.status ===
                      "Available"
                  )
                  .map((listing) => (

                    <div
                      key={listing.id}
                      className={
                        selectedListingId ===
                        String(listing.id)
                          ? "my-listing-option selected"
                          : "my-listing-option"
                      }
                      onClick={() =>
                        setSelectedListingId(
                          String(listing.id)
                        )
                      }
                    >

                      <div className="my-listing-image">

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


                      <div className="my-listing-info">

                        <h3>
                          {listing.title}
                        </h3>

                        <p>
                          ₹{listing.price}
                        </p>

                        <span>
                          {listing.condition}
                        </span>

                      </div>


                      <div className="select-circle">

                        {selectedListingId ===
                        String(listing.id)
                          ? "✓"
                          : ""}

                      </div>

                    </div>

                  ))}

              </div>


              {selectedListingId && (

                <div className="exchange-selected">

                  <strong>
                    Your offer:
                  </strong>

                  <span>
                    {getListingName(
                      selectedListingId
                    )}
                  </span>

                </div>

              )}


              <div className="exchange-form-actions">

                <button
                  className="exchange-cancel-button"
                  onClick={() => {
                    setShowExchangeForm(false);
                    setSelectedListingId("");
                  }}
                >
                  Cancel
                </button>

                <button
                  className="exchange-primary-button"
                  disabled={!selectedListingId}
                  onClick={
                    sendExchangeRequest
                  }
                >
                  🔄 Send Exchange Request
                </button>

              </div>

            </>

          )}

        </div>

      )}


      {/* ==================================================
          LOADING EXCHANGES
      ================================================== */}

      {loading && (

        <div className="exchange-message">
          Loading exchanges...
        </div>

      )}


      {/* ==================================================
          EMPTY
      ================================================== */}

      {!loading &&
        !error &&
        exchanges.length === 0 &&
        !showExchangeForm && (

        <div className="exchange-empty">

          <div className="exchange-empty-icon">
            🔄
          </div>

          <h2>
            No exchanges yet
          </h2>

          <p>
            Browse listings and propose an
            exchange with another student.
          </p>

          <button
            className="exchange-primary-button"
            onClick={() =>
              navigate("/listings")
            }
          >
            Browse Listings
          </button>

        </div>

      )}


      {/* ==================================================
          EXCHANGE CARDS
      ================================================== */}

      {!loading &&
        exchanges.length > 0 && (

        <div className="exchange-grid">

          {exchanges.map(
            (exchange) => (

            <div
              className="exchange-card"
              key={exchange.id}
            >

              <div className="exchange-card-top">

                <div className="exchange-icon">
                  🔄
                </div>

                <span
                  className={
                    `exchange-status ${
                      exchange.status.toLowerCase()
                    }`
                  }
                >
                  {exchange.status}
                </span>

              </div>


              <h2>
                Exchange #{exchange.id}
              </h2>


              <div className="exchange-details">

  <div>
    <span>You Offer</span>

    <strong>
      📦 {exchange.offered_listing_title}
    </strong>
  </div>


  <div>
    <span>You Want</span>

    <strong>
      🎁 {exchange.requested_listing_title}
    </strong>
  </div>


  <div>
    <span>Requester</span>

    <strong>
      👤 {exchange.requester_name}
    </strong>
  </div>


  <div>
    <span>Receiver</span>

    <strong>
      👤 {exchange.receiver_name}
    </strong>
  </div>

</div>


              {/* ==================================================
                  ACTIONS
              ================================================== */}

              <div className="exchange-actions">

                {exchange.status ===
                  "Pending" && (

                  <>

                    <button
                      className="exchange-accept-button"
                      onClick={() =>
                        updateExchange(
                          exchange.id,
                          "Accepted"
                        )
                      }
                    >
                      ✓ Accept
                    </button>


                    <button
                      className="exchange-reject-button"
                      onClick={() =>
                        updateExchange(
                          exchange.id,
                          "Rejected"
                        )
                      }
                    >
                      ✕ Reject
                    </button>

                  </>

                )}


                {exchange.status === "Accepted" && (
  <div className="exchange-actions">

    <button
      className="exchange-primary-button"
      onClick={() =>
        updateExchange(
          exchange.id,
          "Completed"
        )
      }
    >
      ✓ Mark Completed
    </button>

    <button
      className="exchange-chat-button"
      onClick={() =>
        navigate(
          `/messages?user_id=${
            exchange.requester_id === Number(localStorage.getItem("user_id"))
              ? exchange.receiver_id
              : exchange.requester_id
          }`
        )
      }
    >
      💬 Chat
    </button>

  </div>
)}


                {(exchange.status ===
                  "Rejected" ||
                  exchange.status ===
                  "Completed" ||
                  exchange.status ===
                  "Cancelled") && (

                  <button
                    className="exchange-delete-button"
                    onClick={() =>
                      deleteExchange(
                        exchange.id
                      )
                    }
                  >
                    Remove
                  </button>

                )}

              </div>

            </div>

          ))}

        </div>

      )}

    </main>
  );
}

export default Exchanges;