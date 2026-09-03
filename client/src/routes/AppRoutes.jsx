import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";

import Home from "../pages/Home.jsx";
import Construction from "../pages/Construction.jsx";
import About from "../pages/About.jsx";

import Grounds from "../pages/Grounds.jsx";
import GroundDetails from "../pages/GroundDetails.jsx";
import ResourseBooking from "../pages/ResourseBooking.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import RoleRoute from "./RoleRoute.jsx";

import BookingCheckout from "../pages/BookingCheckout.jsx";
import BookingConfirmation from "../pages/BookingConfirmation.jsx";
import MyBookings from "../pages/MyBookings.jsx";
import BookingDetails from "../pages/BookingDetails.jsx";
import Profile from "../pages/Profile.jsx";





function OwnerDashboard() {
  return <h1>Owner Dashboard</h1>;
}


function AdminDashboard() {
  return <h1>Admin Dashboard</h1>;
}


function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/construction"
          element={<Construction />}
        />

        <Route
          path="/grounds"
          element={<Grounds />}
        />

        <Route
          path="/grounds/:id"
          element={<GroundDetails />}
        />

        {/* Resource booking selection stays public.
            Login happens when customer continues to checkout. */}

        <Route
          path="/grounds/:groundId/resources/:resourceId"
          element={<ResourseBooking />}
        />


        {/* =========================
            LOGGED-IN CUSTOMER
        ========================= */}

        <Route element={<ProtectedRoute />}>

          <Route
            element={
              <RoleRoute
                allowedRoles={["CUSTOMER"]}
              />
            }
          >

            <Route
              path="/grounds/:groundId/resources/:resourceId/booking"
              element={<BookingCheckout />}
            />

            <Route
              path="/booking-confirmation/:bookingId"
              element={<BookingConfirmation />}
            />

            <Route
              path="/my-bookings"
              element={<MyBookings />}
            />

            <Route
              path="/bookings/:id"
              element={<BookingDetails />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

            

          </Route>


          {/* =========================
              OWNER
          ========================= */}

          <Route
            element={
              <RoleRoute
                allowedRoles={["OWNER"]}
              />
            }
          >

            <Route
              path="/owner/dashboard"
              element={<OwnerDashboard />}
            />

          </Route>


          {/* =========================
              ADMIN
          ========================= */}

          <Route
            element={
              <RoleRoute
                allowedRoles={["ADMIN"]}
              />
            }
          >

            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;