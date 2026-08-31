import { NavLink, Outlet, useNavigate } from "react-router-dom";

function MainLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="logo-section">
          <div className="logo-icon">🎓</div>

          <div>
            <h2>Campus Exchange</h2>
            <p>Buy • Sell • Exchange</p>
          </div>
        </div>

        <nav className="sidebar-nav">

          <NavLink to="/" className="nav-item">
             Dashboard
          </NavLink>

          <NavLink to="/listings" className="nav-item">
             Browse Items
          </NavLink>

          <NavLink to="/my-listings" className="nav-item">
           My Listings
          </NavLink>

          <NavLink to="/nearby" className="nav-item">
             Nearby Sellers
          </NavLink>

          <NavLink to="/exchanges" className="nav-item">
             Exchanges
          </NavLink>

          <NavLink to="/favorites" className="nav-item">
             Favorites
          </NavLink>

          <NavLink to="/messages" className="nav-item">
             Messages
          </NavLink>

          <NavLink to="/deals" className="nav-item">
             Deals
          </NavLink>

          <NavLink to="/profile" className="nav-item">
             Profile
          </NavLink>

        </nav>

        <div className="sidebar-bottom">

          <button onClick={logout} className="logout-button">
            🚪 Logout
          </button>

        </div>

      </aside>


      {/* Main Area */}
      <div className="main-area">

        {/* Top Navbar */}
        <header className="top-navbar">

          <div className="search-box">
            🔍
            <input
              type="text"
              placeholder="Search books, notes, calculators..."
            />
          </div>

          

          <div className="top-actions">

            <span><NavLink to="/messages" className="nav-item">
             💬
          </NavLink></span>

            <span>🔔</span>

            <div className="user-info">
              <div className="user-avatar">
               <NavLink to="/profile" className="nav-item">
             👤
          </NavLink> 
              </div>

              
            </div>

          </div>

        </header>


        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default MainLayout;