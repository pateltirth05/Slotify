import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import Owner from "../pages/owner/Owner.jsx";
import OwnerGrounds from "../pages/owner/OwnerGrounds.jsx";
import OwnerGroundDetails from "../pages/owner/OwnerGroundDetails.jsx";
import OwnerAddGround from "../pages/owner/OwnerAddGround.jsx";
import OwnerEditGround from "../pages/owner/OwnerEditGround.jsx";
import OwnerAddResource from "../pages/owner/OwnerAddResource.jsx";
import OwnerManageResource from "../pages/owner/OwnerManageResource.jsx";
import OwnerResources from "../pages/owner/OwnerResources.jsx";
import OwnerAvailability from "../pages/owner/OwnerAvailability.jsx";
import OwnerBookings from "../pages/owner/OwnerBookings.jsx";
import OwnerBookingDetails from "../pages/owner/OwnerBookingDetails.jsx";
import OwnerEarnings from "../pages/owner/OwnerEarnings.jsx";
import OwnerPaymentDetails from "../pages/owner/OwnerPaymentDetails.jsx";
import OwnerProfile from "../pages/owner/OwnerProfile.jsx";
import Admin from "../pages/admin/Admin.jsx";
import AdminUsers from "../pages/admin/AdminUsers.jsx";
import AdminGrounds from "../pages/admin/AdminGrounds.jsx";
import Constructions from "../pages/admin/Constructions.jsx";
import AdminPayments from "../pages/admin/AdminPayments.jsx";
import AdminSettlements from "../pages/admin/AdminSettlements.jsx";
import AdminProfile from "../pages/admin/AdminProfile.jsx";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/construction" element={<Construction />} />

        <Route path="/grounds" element={<Grounds />} />

        <Route path="/grounds/:id" element={<GroundDetails />} />

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
          <Route element={<RoleRoute allowedRoles={["CUSTOMER"]} />}>
            <Route
              path="/grounds/:groundId/resources/:resourceId/booking"
              element={<BookingCheckout />}
            />

            <Route
              path="/booking-confirmation/:bookingId"
              element={<BookingConfirmation />}
            />

            <Route path="/my-bookings" element={<MyBookings />} />

            <Route path="/bookings/:id" element={<BookingDetails />} />

            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* =========================
              OWNER
          ========================= */}

          <Route element={<RoleRoute allowedRoles={["OWNER"]} />}>
            <Route path="/owner/dashboard" element={<Owner />} />

            <Route path="/owner/grounds" element={<OwnerGrounds />} />
            <Route path="/owner/grounds/:id" element={<OwnerGroundDetails />} />
            <Route path="/owner/grounds/add" element={<OwnerAddGround />} />

            <Route
              path="/owner/grounds/:id/edit"
              element={<OwnerEditGround />}
            />
            <Route path="/owner/resources/add" element={<OwnerAddResource />} />
            <Route path="/owner/resources/add" element={<OwnerAddResource />} />

            <Route
              path="/owner/grounds/:groundId/resources/add"
              element={<OwnerAddResource />}
            />
            <Route
              path="/owner/resources/:id/edit"
              element={<OwnerManageResource />}
            />
            <Route path="/owner/resources" element={<OwnerResources />} />
            <Route path="/owner/availability" element={<OwnerAvailability />} />
            <Route path="/owner/bookings" element={<OwnerBookings />} />
            <Route
              path="/owner/bookings/:id"
              element={<OwnerBookingDetails />}
            />
            <Route path="/owner/earnings" element={<OwnerEarnings />} />
            <Route
              path="/owner/payment-details"
              element={<OwnerPaymentDetails />}
            />
            <Route path="/owner/profile" element={<OwnerProfile />} />
          </Route>

          {/* =========================
              ADMIN
          ========================= */}

          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin/dashboard" element={<Admin />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/grounds" element={<AdminGrounds />} />
            <Route path="/admin/construction" element={<Constructions />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/settlements" element={<AdminSettlements />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
