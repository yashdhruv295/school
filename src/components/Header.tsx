import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";

export default function Header() {
  const { t } = useLanguage();

  return (
    <header className="site-header">

      <div className="header-container">

        <div className="header-title">

          <h1>
            {t("portalTitle")}
          </h1>

          <p>
            {t("portalSubtitle")}
          </p>

        </div>

        <LanguageSwitcher />

      </div>

    </header>
  );
}