import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Save,
  ShieldCheck,
} from "lucide-react";

import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { hashPassword } from "../utils/password";
import { getSession } from "../utils/session";

interface ChangePasswordProps {
  title: string;
  backPath: string;
}

export default function ChangePassword({
  title,
  backPath,
}: ChangePasswordProps) {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const session = getSession();

    if (!session) {
      navigate("/login");
      return;
    }

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError(
        "Please fill all password fields."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "New Password and Confirm Password do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "New password must be different from current password."
      );
      return;
    }

    try {
      setLoading(true);

      const userRef = doc(
        db,
        "users",
        session.id
      );

      const userSnapshot =
        await getDoc(userRef);

      if (!userSnapshot.exists()) {
        setError(
          "User account could not be found."
        );
        return;
      }

      const userData =
        userSnapshot.data();

      const currentPasswordHash =
        await hashPassword(
          currentPassword
        );

      if (
        currentPasswordHash !==
        userData.passwordHash
      ) {
        setError(
          "Current password is incorrect."
        );
        return;
      }

      const newPasswordHash =
        await hashPassword(newPassword);

      await updateDoc(userRef, {
        passwordHash: newPasswordHash,
        passwordChangedAt:
          serverTimestamp(),
        updatedAt:
          serverTimestamp(),
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccess(
        "Password changed successfully. Use your new password the next time you login."
      );
    } catch (err) {
      console.error(
        "Change Password Error:",
        err
      );

      setError(
        "Unable to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">

      <div className="change-password-container">

        <button
          type="button"
          className="password-back"
          onClick={() =>
            navigate(backPath)
          }
        >
          ← Back to Dashboard
        </button>

        <div className="password-card">

          <div className="password-card-header">

            <div className="password-header-icon">
              <ShieldCheck size={28} />
            </div>

            <div>
              <span>
                ACCOUNT SECURITY
              </span>

              <h1>{title}</h1>

              <p>
                Update your portal login
                password securely.
              </p>
            </div>

          </div>

          {error && (
            <div className="password-message error">
              {error}
            </div>
          )}

          {success && (
            <div className="password-message success">
              <ShieldCheck size={18} />
              {success}
            </div>
          )}

          <form
            className="change-password-form"
            onSubmit={handleSubmit}
          >

            <PasswordField
              label="Current Password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              visible={showCurrent}
              setVisible={setShowCurrent}
            />

            <div className="password-divider">
              <span>
                NEW PASSWORD
              </span>
            </div>

            <PasswordField
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={setNewPassword}
              visible={showNew}
              setVisible={setShowNew}
            />

            <PasswordField
              label="Confirm New Password"
              placeholder="Enter new password again"
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={showConfirm}
              setVisible={setShowConfirm}
            />

            <div className="password-security-note">

              <KeyRound size={20} />

              <div>
                <strong>
                  Password Security
                </strong>

                <p>
                  Use at least 8 characters.
                  Avoid using an easily guessed
                  password.
                </p>
              </div>

            </div>

            <button
              type="submit"
              className="password-save-button"
              disabled={loading}
            >
              <Save size={18} />

              {loading
                ? "Updating Password..."
                : "Change Password"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   PASSWORD FIELD
========================================================= */

interface PasswordFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  setVisible: (value: boolean) => void;
}

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  visible,
  setVisible,
}: PasswordFieldProps) {
  return (
    <div className="password-field">

      <label>
        {label}
      </label>

      <div className="password-input-wrapper">

        <LockKeyhole size={18} />

        <input
          type={
            visible
              ? "text"
              : "password"
          }
          placeholder={placeholder}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          autoComplete="new-password"
        />

        <button
          type="button"
          onClick={() =>
            setVisible(!visible)
          }
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
        >
          {visible ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>

      </div>

    </div>
  );
}