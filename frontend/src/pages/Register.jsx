import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    course: "",
    year: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  const handleRegister = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);

    try {

      await axios.post(
        "https://sprint-1-hr8e.onrender.com/users/",
        {
          ...formData,

          year: formData.year
            ? Number(formData.year)
            : null
        }
      );

      navigate("/login");

    } catch (error) {

      console.error(
        "REGISTER ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Registration failed"
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="auth-page">


      {/* LEFT BRANDING */}

      <div className="auth-brand">

        <div className="auth-logo">
          CE
        </div>

        <h1>
          Join Campus Exchange
        </h1>

        <p>
          Create your student account and
          start buying, selling and exchanging
          items on campus.
        </p>


        <div className="auth-features">

          <div>
            <span>✓</span>
            Create your own listings
          </div>

          <div>
            <span>✓</span>
            Save favorite items
          </div>

          <div>
            <span>✓</span>
            Connect with other students
          </div>

        </div>

      </div>


      {/* REGISTER CARD */}

      <div className="auth-form-wrapper">

        <div className="auth-form-card register-card">

          <div className="auth-form-header">

            <p className="auth-small-title">
              GET STARTED
            </p>

            <h2>
              Create your account
            </h2>

            <p>
              Fill in your details to join
              Campus Exchange.
            </p>

          </div>


          <form onSubmit={handleRegister}>


            {/* NAME */}

            <div className="auth-field">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />

            </div>


            {/* EMAIL */}

            <div className="auth-field">

              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />

            </div>


            {/* PASSWORD */}

            <div className="auth-field">

              <label>
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />

            </div>


            {/* COLLEGE */}

            <div className="auth-field">

              <label>
                College
              </label>

              <input
                type="text"
                name="college"
                placeholder="Enter your college"
                value={formData.college}
                onChange={handleChange}
                required
              />

            </div>


            {/* COURSE + YEAR */}

            <div className="auth-row">

              <div className="auth-field">

                <label>
                  Course
                </label>

                <input
                  type="text"
                  name="course"
                  placeholder="e.g. BCA"
                  value={formData.course}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="auth-field">

                <label>
                  Year
                </label>

                <input
                  type="number"
                  name="year"
                  placeholder="Year"
                  min="1"
                  max="10"
                  value={formData.year}
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* ERROR */}

            {error && (

              <div className="auth-error">
                ⚠️ {error}
              </div>

            )}


            {/* REGISTER BUTTON */}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >

              {loading
                ? "Creating account..."
                : "Create Account →"}

            </button>

          </form>


          {/* LOGIN */}

          <div className="auth-bottom">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Login
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;