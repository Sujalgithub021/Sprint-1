import { useState } from "react";
import {
  useNavigate,
  Link,
  useLocation
} from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://sprint-1-hr8e.onrender.com/auth/login",
        {
          email: email,
          password: password
        }
      );

      const token = response.data.access_token;

      localStorage.setItem("token", token);

      const redirectTo = location.state?.from || "/";

      navigate(redirectTo, {
      replace: true
      });

    } catch (error) {

      console.error("LOGIN ERROR:", error);

      setError(
        error.response?.data?.detail ||
        "Invalid email or password"
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
          Campus Exchange
        </h1>

        <p>
          Buy, sell and exchange items
          with students around you.
        </p>

        <div className="auth-features">

          <div>
            <span>✓</span>
            Easy to use marketplace
          </div>

          <div>
            <span>✓</span>
            Connect with students
          </div>

          <div>
            <span>✓</span>
            Safe local exchanges
          </div>

        </div>

      </div>


      {/* LOGIN CARD */}

      <div className="auth-form-wrapper">

        <div className="auth-form-card">

          <div className="auth-form-header">

            <p className="auth-small-title">
              WELCOME BACK
            </p>

            <h2>
              Login to your account
            </h2>

            <p>
              Enter your details to continue.
            </p>

          </div>


          <form onSubmit={handleLogin}>

            {/* EMAIL */}

            <div className="auth-field">

              <label>
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>


            {/* ERROR */}

            {error && (

              <div className="auth-error">
                ⚠️ {error}
              </div>

            )}


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >

              {loading
                ? "Logging in..."
                : "Login →"}

            </button>

          </form>


          {/* REGISTER */}

          <div className="auth-bottom">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create an account
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;