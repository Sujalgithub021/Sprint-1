import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CreateListing() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    condition: "Good",
    listing_type: "Sell",
    latitude: "",
    longitude: ""
  });

  const [imageUrl, setImageUrl] = useState("");

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [posting, setPosting] = useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationStatus, setLocationStatus] =
    useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");


  // ==================================================
  // GET CATEGORIES
  // ==================================================

  useEffect(() => {

    const fetchCategories = async () => {

      try {

        const response = await axios.get(
          "http://127.0.0.1:8000/categories/"
        );

        setCategories(response.data);

      } catch (error) {

        console.error(
          "CATEGORY ERROR:",
          error
        );

        setError(
          "Unable to load categories."
        );

      } finally {

        setLoadingCategories(false);

      }

    };

    fetchCategories();

  }, []);


  // ==================================================
  // GET USER LOCATION AUTOMATICALLY
  // ==================================================

  useEffect(() => {

    if (!navigator.geolocation) {

      setLocationStatus(
        "Location is not supported by this browser."
      );

      return;
    }


    setLocationLoading(true);

    setLocationStatus(
      "Getting your location..."
    );


    navigator.geolocation.getCurrentPosition(

      (position) => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        setFormData((previous) => ({
          ...previous,

          latitude: latitude,
          longitude: longitude
        }));


        setLocationLoading(false);

        setLocationStatus(
          "✓ Location detected automatically"
        );

      },


      (locationError) => {

        console.error(
          "LOCATION ERROR:",
          locationError
        );


        setLocationLoading(false);


        if (
          locationError.code === 1
        ) {

          setLocationStatus(
            "Location permission denied. Nearby seller features may not work."
          );

        } else {

          setLocationStatus(
            "Unable to detect your location."
          );

        }

      },


      {
        enableHighAccuracy: true,

        timeout: 10000,

        maximumAge: 300000
      }

    );

  }, []);


  // ==================================================
  // HANDLE INPUT
  // ==================================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setFormData((previous) => ({
      ...previous,

      [name]: value
    }));

  };


  // ==================================================
  // CREATE LISTING
  // ==================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    setSuccess("");


    const token =
      localStorage.getItem("token");


    if (!token) {

      navigate("/login");

      return;
    }


    // ----------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------

    if (!formData.category_id) {

      setError(
        "Please select a category."
      );

      return;
    }


    if (!formData.title.trim()) {

      setError(
        "Please enter a product name."
      );

      return;
    }


    if (
      !formData.price ||
      Number(formData.price) < 0
    ) {

      setError(
        "Please enter a valid price."
      );

      return;
    }


    try {

      setPosting(true);


      // ==============================================
      // CREATE LISTING
      // ==============================================

      const response = await axios.post(

        "http://127.0.0.1:8000/listings/",

        {

          category_id:
            Number(formData.category_id),

          title:
            formData.title.trim(),

          description:
            formData.description.trim() ||
            null,

          price:
            Number(formData.price),

          condition:
            formData.condition,

          listing_type:
            formData.listing_type,

          // AUTOMATIC LOCATION
          latitude:
            formData.latitude !== ""
              ? Number(formData.latitude)
              : null,

          longitude:
            formData.longitude !== ""
              ? Number(formData.longitude)
              : null

        },

        {

          headers: {

            Authorization:
              `Bearer ${token}`

          }

        }

      );


      const createdListing =
        response.data;


      // ==============================================
      // ADD IMAGE
      // ==============================================

      if (imageUrl.trim()) {

        try {

          await axios.post(

            "http://127.0.0.1:8000/listing-images/",

            {

              listing_id:
                createdListing.id,

              image_url:
                imageUrl.trim()

            },

            {

              headers: {

                Authorization:
                  `Bearer ${token}`

              }

            }

          );

        } catch (imageError) {

          console.error(
            "IMAGE ERROR:",
            imageError
          );

        }

      }


      setSuccess(
        "Your item has been posted successfully!"
      );


      // ----------------------------------------------
      // REDIRECT
      // ----------------------------------------------

      setTimeout(() => {

        navigate(
          `/listings/${createdListing.id}`
        );

      }, 800);


    } catch (error) {

      console.error(
        "CREATE LISTING ERROR:",
        error
      );


      if (
        error.response?.status === 401
      ) {

        localStorage.removeItem(
          "token"
        );

        navigate("/login");

        return;
      }


      setError(
        error.response?.data?.detail ||
        "Unable to post item."
      );


    } finally {

      setPosting(false);

    }

  };


  return (

    <main className="create-listing-page">


      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="create-listing-header">

        <div>

          <p className="create-listing-eyebrow">
            SELL AN ITEM
          </p>

          <h1>
            Post an Item 📦
          </h1>

          <p>
            Share your item with students
            on Campus Exchange.
          </p>

        </div>

      </div>


      {/* ==================================================
          FORM CARD
      ================================================== */}

      <div className="create-listing-card">

        <form onSubmit={handleSubmit}>


          {/* ==================================================
              BASIC INFORMATION
          ================================================== */}

          <div className="listing-form-section">

            <h2>
              Item Information
            </h2>

            <p>
              Tell buyers about the item
              you're selling.
            </p>


            {/* PRODUCT NAME */}

            <div className="listing-form-field">

              <label>
                Product Name
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Python Programming Book"
                maxLength={150}
                required
              />

            </div>


            {/* DESCRIPTION */}

            <div className="listing-form-field">

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the item, its features, and anything the buyer should know..."
                rows="5"
              />

            </div>


            {/* PRICE + CATEGORY */}

            <div className="listing-form-row">

              <div className="listing-form-field">

                <label>
                  Price (₹)
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  required
                />

              </div>


              <div className="listing-form-field">

                <label>
                  Category
                </label>

                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : "Select category"}
                  </option>

                  {categories.map(
                    (category) => (

                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>

                    )
                  )}

                </select>

              </div>

            </div>


            {/* CONDITION */}

            <div className="listing-form-field">

              <label>
                Condition
              </label>

              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
              >

                <option value="New">
                  New
                </option>

                <option value="Like New">
                  Like New
                </option>

                <option value="Good">
                  Good
                </option>

                <option value="Used">
                  Used
                </option>

              </select>

            </div>

          </div>


          {/* ==================================================
              LISTING TYPE
          ================================================== */}

          <div className="listing-form-section">

            <h2>
              Listing Type
            </h2>

            <p>
              Choose what you want to do with
              this item.
            </p>


            <div className="listing-type-options">

              <label
                className={
                  formData.listing_type === "Sell"
                    ? "listing-type-option active"
                    : "listing-type-option"
                }
              >

                <input
                  type="radio"
                  name="listing_type"
                  value="Sell"
                  checked={
                    formData.listing_type === "Sell"
                  }
                  onChange={handleChange}
                />

                <div>

                  <strong>
                    💰 Sell
                  </strong>

                  <span>
                    Sell this item for money.
                  </span>

                </div>

              </label>


              <label
                className={
                  formData.listing_type === "Exchange"
                    ? "listing-type-option active"
                    : "listing-type-option"
                }
              >

                <input
                  type="radio"
                  name="listing_type"
                  value="Exchange"
                  checked={
                    formData.listing_type === "Exchange"
                  }
                  onChange={handleChange}
                />

                <div>

                  <strong>
                    🔄 Exchange
                  </strong>

                  <span>
                    Exchange this item with another item.
                  </span>

                </div>

              </label>

            </div>

          </div>


          {/* ==================================================
              IMAGE
          ================================================== */}

          <div className="listing-form-section">

            <h2>
              Product Image
            </h2>

            <p>
              Add an image URL for your product.
            </p>


            <div className="listing-form-field">

              <label>
                Image URL
              </label>

              <input
                type="url"
                value={imageUrl}
                onChange={(e) =>
                  setImageUrl(e.target.value)
                }
                placeholder="https://example.com/product.jpg"
              />

            </div>


            {imageUrl && (

              <div className="listing-image-preview">

                <img
                  src={imageUrl}
                  alt="Product preview"
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";
                  }}
                />

              </div>

            )}

          </div>


          {/* ==================================================
              AUTOMATIC LOCATION
          ================================================== */}

          <div className="listing-form-section">

            <h2>
              Location
            </h2>

            <p>
              Your location is detected automatically
              to help students find nearby sellers.
            </p>


            <div className="automatic-location-box">

              <div className="automatic-location-icon">
                📍
              </div>

              <div>

                <strong>
                  {locationLoading
                    ? "Detecting location..."
                    : formData.latitude &&
                      formData.longitude
                      ? "Location detected"
                      : "Location unavailable"}
                </strong>

                <span>
                  {locationStatus}
                </span>

              </div>

            </div>

          </div>


          {/* ==================================================
              ERROR / SUCCESS
          ================================================== */}

          {error && (

            <div className="create-listing-error">
              ⚠️ {error}
            </div>

          )}


          {success && (

            <div className="create-listing-success">
              ✓ {success}
            </div>

          )}


          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="create-listing-actions">

            <button
              type="button"
              className="create-listing-cancel"
              onClick={() =>
                navigate("/listings")
              }
              disabled={posting}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="create-listing-submit"
              disabled={posting}
            >

              {posting
                ? "Posting Item..."
                : "📦 Post Item"}

            </button>

          </div>

        </form>

      </div>

    </main>
  );
}

export default CreateListing;