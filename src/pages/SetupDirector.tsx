import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  School,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";

import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { hashPassword } from "../utils/password";

export default function SetupDirector() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreateDirector = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();

    const cleanUsername =
      username.trim().toLowerCase();

    if (
      !cleanName ||
      !cleanUsername ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill all fields.");
      return;
    }

    if (cleanName.length < 2) {
      setError(
        "Director name must contain at least 2 characters."
      );
      return;
    }

    if (
      !/^[a-z0-9@._-]{4,50}$/.test(cleanUsername)
    ) {
      setError(
        "Please enter a valid username."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Password and Confirm Password do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const usersRef = collection(db, "users");

      // Check username
      const usernameQuery = query(
        usersRef,
        where(
          "username",
          "==",
          cleanUsername
        )
      );

      const usernameSnapshot =
        await getDocs(usernameQuery);

      if (!usernameSnapshot.empty) {
        setError(
          "This username is already registered."
        );
        return;
      }

      // Check existing Director
      const directorQuery = query(
        usersRef,
        where("role", "==", "director")
      );

      const directorSnapshot =
        await getDocs(directorQuery);

      if (!directorSnapshot.empty) {
        setError(
          "A Director account already exists. Please use the Login page."
        );
        return;
      }

      const passwordHash =
        await hashPassword(password);

      await addDoc(usersRef, {
        name: cleanName,

        username: cleanUsername,

        passwordHash,

        role: "director",

        active: true,

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),
      });

      setSuccess(
        "Director account created successfully."
      );

      setName("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error(
        "Director Setup Error:",
        err
      );

      setError(
        "Unable to create Director account. Please check Firestore."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="director-setup-page">

      <div className="director-setup-container">

        {/* LEFT SIDE */}

        <section className="director-setup-info">

          <div className="setup-school-icon">
            <School size={35} />
          </div>

          <span className="setup-label">
            INITIAL PORTAL SETUP
          </span>

          <h1>
            समूह साधन केंद्र
            <br />
            कट्टीपार
          </h1>

          <p>
            Create the Director account for
            the School Information &
            Management Portal.
          </p>

          <div className="setup-feature">

            <ShieldCheck size={22} />

            <div>
              <strong>
                Director / Administrator
              </strong>

              <p>
                The Director can manage all
                schools and Principal accounts.
              </p>
            </div>

          </div>

          <div className="setup-feature">

            <UserPlus size={22} />

            <div>
              <strong>
                Principal Management
              </strong>

              <p>
                Create username and password
                for every school Principal.
              </p>
            </div>

          </div>

          <div className="setup-feature">

            <School size={22} />

            <div>
              <strong>
                Centralized School Data
              </strong>

              <p>
                Monitor student, teacher and
                infrastructure information.
              </p>
            </div>

          </div>

        </section>

        {/* RIGHT SIDE */}

        <section className="director-setup-form-area">

          <div className="director-setup-form-card">

            <div className="setup-lock-icon">
              <ShieldCheck size={28} />
            </div>

            <span className="setup-form-label">
              DIRECTOR ACCOUNT
            </span>

            <h2>
              Create Director
            </h2>

            <p className="setup-subtitle">
              Create the main administrator
              account for the portal.
            </p>

            {error && (
              <div className="setup-error">
                {error}
              </div>
            )}

            {success && (
              <div className="setup-success">
                <ShieldCheck size={17} />
                {success}
              </div>
            )}

            <form
              onSubmit={handleCreateDirector}
              className="setup-form"
            >

              {/* NAME */}

              <div className="setup-field">

                <label>
                  Director Name
                </label>

                <div className="setup-input">

                  <User size={18} />

                  <input
                    type="text"
                    placeholder="Enter Director name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                  />

                </div>

              </div>

              {/* USERNAME */}

              <div className="setup-field">

                <label>
                  Username
                </label>

                <div className="setup-input">

                  <User size={18} />

                  <input
                    type="text"
                    placeholder="Example: director"
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value
                      )
                    }
                    autoComplete="username"
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="setup-field">

                <label>
                  Password
                </label>

                <div className="setup-input">

                  <LockKeyhole size={18} />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="setup-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label="Show password"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>

              {/* CONFIRM PASSWORD */}

              <div className="setup-field">

                <label>
                  Confirm Password
                </label>

                <div className="setup-input">

                  <LockKeyhole size={18} />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter password again"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="setup-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    aria-label="Show confirm password"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>

              <button
                type="submit"
                className="setup-submit"
                disabled={loading}
              >

                <UserPlus size={18} />

                {loading
                  ? "Creating Account..."
                  : "Create Director Account"}

              </button>

            </form>

            <button
              type="button"
              className="setup-login-link"
              onClick={() =>
                navigate("/login")
              }
            >
              Already have an account? Login
            </button>

          </div>

        </section>

      </div>

    </div>
  );
}
