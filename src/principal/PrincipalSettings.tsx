import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ChangePassword from "../components/ChangePassword";
import { getSession } from "../utils/session";

export default function PrincipalSettings() {
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();

    if (!session || session.role !== "principal") {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <ChangePassword
      title="Principal Change Password"
      backPath="/principal"
    />
  );
}