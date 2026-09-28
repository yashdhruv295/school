import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  useLanguage,
} from "../context/LanguageContext";

export default function Navbar() {
  const location = useLocation();

  const { t } =
    useLanguage();

  const active = (
    path: string
  ) =>
    location.pathname === path
      ? "active"
      : "";

  return (
    <nav className="main-navbar">

      <div className="navbar-container">

        <Link
          to="/"
          className={active("/")}
        >
          {t("home")}
        </Link>

        <Link
          to="/about"
          className={active("/about")}
        >
          {t("centreInfo")}
        </Link>

        <Link
          to="/calendar"
          className={active("/calendar")}
        >
          {t("academicCalendar")}
        </Link>

        <Link
          to="/schools"
          className={active("/schools")}
        >
          {t("schoolDirectory")}
        </Link>

        <Link
          to="/resources"
          className={active("/resources")}
        >
          {t("trainingResources")}
        </Link>

        <Link
          to="/best-practices"
          className={
            active(
              "/best-practices"
            )
          }
        >
          {t("bestPractices")}
        </Link>

        <Link
          to="/downloads"
          className={
            active("/downloads")
          }
        >
          {t("downloads")}
        </Link>

        <Link
          to="/gallery"
          className={
            active("/gallery")
          }
        >
          {t("photoGallery")}
        </Link>

        <Link
          to="/contact"
          className={
            active("/contact")
          }
        >
          {t("contact")}
        </Link>

        <Link
          to="/login"
          className={`login-nav-link ${active(
            "/login"
          )}`}
        >
          {t("secureLogin")}
        </Link>

      </div>

    </nav>
  );
}