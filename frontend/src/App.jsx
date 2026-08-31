import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import BrowseItems from "./pages/BrowseItems";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ListingDetails from "./pages/ListingDetails";
import Messages from "./pages/Messages";
import Deals from "./pages/Deals";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import CreateListing from "./pages/CreateListing";
import Exchanges from "./pages/Exchanges";
import NearbySellers from "./pages/NearbySellers";
import MyListings from "./pages/MyListings";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ==============================
            AUTHENTICATION
        ============================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ==============================
            MAIN APPLICATION
        ============================== */}

        <Route element={<MainLayout />}>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/listings"
            element={<BrowseItems />}
          />

          <Route
          path="/nearby"
          element={<NearbySellers />}
          />

          <Route
          path="/exchanges"
          element={<Exchanges />}
          />

          {/* IMPORTANT */}

          <Route
            path="/favorites"
            element={<Favorites />}
          />

          <Route
            path="/messages"
            element={<Messages />}
          />

          <Route
            path="/deals"
            element={<Deals />}
          />

          <Route
            path="/profile"
            element={<Profile />}
              />

          <Route
          path="/create-listing"
          element={<CreateListing />}
          />

          <Route
            path="/listings/:id"
            element={<ListingDetails />}
          />

          <Route
          path="/my-listings"
          element={<MyListings />}
          />

        </Route>

      </Routes>

    </BrowserRouter>

  );
}

export default App;