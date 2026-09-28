import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  School,
  User,
} from "lucide-react";

import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { hashPassword } from "../utils/password";
import {
  getSession,
  saveSession,
} from "../utils/session";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getSession();

    if (!session) return;

    if (session.role === "director") {
      navigate("/director");
    } else if (session.role === "principal") {
      navigate("/principal");
    }
  }, [navigate]);

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    const cleanUsername =
      username.trim().toLowerCase();

    if (!cleanUsername || !password) {
      setError(
        "Please enter username and password."
      );
      return;
    }

    try {
      setLoading(true);

      const usersRef = collection(db, "users");

      const q = query(
        usersRef,
        where("username", "==", cleanUsername),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("Invalid username or password.");
        return;
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();

      if (userData.active === false) {
        setError(
          "Your account has been disabled. Please contact the Director."
        );
        return;
      }

      const enteredHash =
        await hashPassword(password);

      if (enteredHash !== userData.passwordHash) {
        setError("Invalid username or password.");
        return;
      }

      if (
        userData.role !== "director" &&
        userData.role !== "principal"
      ) {
        setError("Invalid user role.");
        return;
      }

      saveSession({
        id: userDoc.id,
        name: userData.name || "Portal User",
        username: userData.username,
        role: userData.role,
        schoolId: userData.schoolId,
        schoolName: userData.schoolName,
        udise: userData.udise,
      });

      if (userData.role === "director") {
        navigate("/director");
      } else {
        navigate("/principal");
      }
    } catch (err) {
      console.error("Login Error:", err);

      setError(
        "Unable to login. Please check Firestore and your internet connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">

        <div className="login-information">
          <div className="login-logo">
            <School size={40} />
          </div>

          <span className="login-label">
            AUTHORIZED ACCESS
          </span>

          <h1>
            Kattipar School
            <br />
            Management Portal
          </h1>

          <p>
            Management portal for Samuh Sadhan
            Kendra Kattipar.
          </p>

          <div className="login-feature">
            <span>01</span>

            <div>
              <strong>Director Access</strong>

              <p>
                Manage schools, principals and
                consolidated reports.
              </p>
            </div>
          </div>

          <div className="login-feature">
            <span>02</span>

            <div>
              <strong>Principal Access</strong>

              <p>
                View and update assigned school
                information.
              </p>
            </div>
          </div>

          <div className="login-feature">
            <span>03</span>

            <div>
              <strong>Centralized Data</strong>

              <p>
                School information is stored in
                Firebase Firestore.
              </p>
            </div>
          </div>
        </div>

        <div className="login-form-area">
          <div className="login-form-card">

            <div className="login-icon">
              <LockKeyhole size={27} />
            </div>

            <h2>Secure Login</h2>

            <p className="login-subtitle">
              Enter your assigned username and password.
            </p>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <label>Username</label>

              <div className="login-input">
                <User size={18} />

                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  autoComplete="username"
                />
              </div>

              <label>Password</label>

              <div className="login-input">
                <LockKeyhole size={18} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    <LogIn size={18} />
                    Login
                  </>
                )}
              </button>
            </form>

            <div className="login-help">
              <strong>Login Assistance</strong>

              <p>
                Contact the Director if you have
                forgotten your username or password.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}