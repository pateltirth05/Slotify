import { useAuth } from "./context/AuthContext.jsx";

function App() {
  const { user, login, logout } = useAuth();

  return (
    <div>
      <h1>Slotify Authentication Test</h1>

      <p>
        User: {user ? user.name : "Not logged in"}
      </p>

      <button
        onClick={() =>
          login({
            id: 1,
            name: "GOD",
            email: "test@example.com",
            role: "CUSTOMER"
          })
        }
      >
        Test Login
      </button>

      <button onClick={logout}>
        Test Logout
      </button>
    </div>
  );
}

export default App;