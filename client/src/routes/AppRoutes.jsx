import { BrowserRouter, Routes, Route } from "react-router-dom";

function Home() {
  return <h1>Home Page</h1>;
}

function Login() {
  return <h1>Login Page</h1>;
}

function Register() {
  return <h1>Register Page</h1>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;