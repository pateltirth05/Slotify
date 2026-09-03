import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Login from "../pages/auth/Login.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import RoleRoute from "./RoleRoute.jsx";
import Register from "../pages/auth/Register.jsx";
import Home from "../pages/Home.jsx";
import Construction from "../pages/Construction.jsx";








function CustomerDashboard() {
  return <h1>Customer Dashboard</h1>;
}


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

        {/* Public */}
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />
        <Route path="/construction" element={<Construction/>}/>

        {/* Logged-in users */}
        <Route element={<ProtectedRoute />}>

          {/* Customer */}
          <Route element={<RoleRoute allowedRoles={["CUSTOMER"]} />}>

            <Route
              path="/customer/dashboard"
              element={<CustomerDashboard />}
            />

          </Route>


          {/* Owner */}
          <Route element={<RoleRoute allowedRoles={["OWNER"]} />}>

            <Route
              path="/owner/dashboard"
              element={<OwnerDashboard />}
            />

          </Route>


          {/* Admin */}
          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>

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