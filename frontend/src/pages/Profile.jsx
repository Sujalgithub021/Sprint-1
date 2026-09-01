import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    college: "",
    course: "",
    year: "",
    profile_image: ""
  });


  // ==================================================
  // FETCH PROFILE
  // ==================================================

  const fetchProfile = async () => {

    try {

      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "https://sprint-1-hr8e.onrender.com/users/me",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = response.data;

      setUser(data);

      setFormData({
        name: data.name || "",
        email: data.email || "",
        college: data.college || "",
        course: data.course || "",
        year: data.year || "",
        profile_image: data.profile_image || ""
      });

    } catch (error) {

      console.error(
        "PROFILE ERROR:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.detail ||
        "Unable to load profile"
      );

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // LOAD PROFILE
  // ==================================================

  useEffect(() => {
    fetchProfile();
  }, []);


  // ==================================================
  // HANDLE INPUT
  // ==================================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

  };


  // ==================================================
  // UPDATE PROFILE
  // ==================================================

  const handleSave = async (e) => {

    e.preventDefault();

    try {

      setSaving(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      const response = await axios.put(
        `https://sprint-1-hr8e.onrender.com/users/${user.id}`,
        {
          name: formData.name,
          email: formData.email,
          college: formData.college,
          course: formData.course,

          year:
            formData.year === ""
              ? null
              : Number(formData.year),

          profile_image:
            formData.profile_image || null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUser(response.data);

      setFormData({
        name: response.data.name || "",
        email: response.data.email || "",
        college: response.data.college || "",
        course: response.data.course || "",
        year: response.data.year || "",
        profile_image:
          response.data.profile_image || ""
      });

      setEditing(false);

      setSuccess(
        "Profile updated successfully!"
      );

    } catch (error) {

      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to update profile"
      );

    } finally {

      setSaving(false);

    }
  };


  // ==================================================
  // CANCEL EDIT
  // ==================================================

  const handleCancel = () => {

    setFormData({
      name: user.name || "",
      email: user.email || "",
      college: user.college || "",
      course: user.course || "",
      year: user.year || "",
      profile_image:
        user.profile_image || ""
    });

    setEditing(false);

    setError("");
    setSuccess("");

  };


  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = () => {

    localStorage.removeItem("token");

    navigate("/login");

  };


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (
      <main className="profile-page">

        <div className="profile-loading">
          Loading profile...
        </div>

      </main>
    );

  }


  // ==================================================
  // UI
  // ==================================================

  return (

    <main className="profile-page">

      {/* HEADER */}

      <div className="profile-header">

        <div>

          <p className="profile-eyebrow">
            ACCOUNT
          </p>

          <h1>
            My Profile 👤
          </h1>

          <p className="profile-subtitle">
            Manage your Campus Exchange account.
          </p>

        </div>


        <div className="profile-header-actions">

          {!editing && (

            <button
              className="profile-edit-btn"
              onClick={() => {
                setEditing(true);
                setSuccess("");
                setError("");
              }}
            >
              ✏️ Edit Profile
            </button>

          )}

        </div>

      </div>


      {/* MESSAGES */}

      {error && (

        <div className="profile-message profile-error">
          {error}
        </div>

      )}

      {success && (

        <div className="profile-message profile-success">
          {success}
        </div>

      )}


      {/* PROFILE CARD */}

      <div className="profile-card">


        {/* PROFILE TOP */}

        <div className="profile-top">

          <div className="profile-avatar">

            {user?.profile_image ? (

              <img
                src={user.profile_image}
                alt={user.name}
              />

            ) : (

              <span>
                {user?.name
                  ? user.name
                      .charAt(0)
                      .toUpperCase()
                  : "U"}
              </span>

            )}

          </div>


          <div className="profile-identity">

            <h2>
              {user?.name}
            </h2>

            <p>
              {user?.email}
            </p>

            {user?.is_verified && (

              <span className="verified-badge">
                ✓ Verified
              </span>

            )}

          </div>

        </div>


        {/* EDIT FORM */}

        {editing ? (

          <form
            className="profile-form"
            onSubmit={handleSave}
          >

            <div className="profile-form-grid">


              <div className="profile-field">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="profile-field">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="profile-field">

                <label>
                  College
                </label>

                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="profile-field">

                <label>
                  Course
                </label>

                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="profile-field">

                <label>
                  Year
                </label>

                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  min="1"
                  max="10"
                />

              </div>


              <div className="profile-field">

                <label>
                  Profile Image URL
                </label>

                <input
                  type="text"
                  name="profile_image"
                  value={formData.profile_image}
                  onChange={handleChange}
                  placeholder="https://..."
                />

              </div>

            </div>


            {/* FORM BUTTONS */}

            <div className="profile-form-actions">

              <button
                type="submit"
                className="profile-save-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "💾 Save Changes"}
              </button>


              <button
                type="button"
                className="profile-cancel-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

            </div>

          </form>

        ) : (

          /* ==================================================
             PROFILE INFORMATION
             ================================================== */

          <div className="profile-info">


            <div className="profile-info-item">

              <span className="profile-info-label">
                📧 Email
              </span>

              <strong>
                {user?.email}
              </strong>

            </div>


            <div className="profile-info-item">

              <span className="profile-info-label">
                🎓 College
              </span>

              <strong>
                {user?.college}
              </strong>

            </div>


            <div className="profile-info-item">

              <span className="profile-info-label">
                📚 Course
              </span>

              <strong>
                {user?.course}
              </strong>

            </div>


            <div className="profile-info-item">

              <span className="profile-info-label">
                📅 Year
              </span>

              <strong>
                {user?.year || "Not provided"}
              </strong>

            </div>


            <div className="profile-info-item">

              <span className="profile-info-label">
                🆔 Account ID
              </span>

              <strong>
                #{user?.id}
              </strong>

            </div>


            <div className="profile-info-item">

              <span className="profile-info-label">
                🔐 Account Status
              </span>

              <strong>
                {user?.is_verified
                  ? "Verified"
                  : "Not Verified"}
              </strong>

            </div>

          </div>

        )}

      </div>


      {/* ACCOUNT ACTIONS */}

      {!editing && (

        <div className="profile-actions-card">

          <h3>
            Account
          </h3>

          <p>
            Manage your account session.
          </p>

          <button
            className="profile-logout-btn"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

        </div>

      )}

    </main>

  );
}

export default Profile;