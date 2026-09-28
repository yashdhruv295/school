import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ChangePassword from "../components/ChangePassword";
import { getSession } from "../utils/session";

export default function DirectorSettings() {
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();

    if (
      !session ||
      session.role !== "director"
    ) {
      navigate(
        "/login",
        { replace: true }
      );
    }
  }, [navigate]);

  return (
    <ChangePassword
      title="Director Change Password"
      backPath="/director"
    />
  );
}