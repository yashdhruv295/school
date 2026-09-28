import {
  Languages,
} from "lucide-react";

import {
  useLanguage,
} from "../context/LanguageContext";

export default function LanguageSwitcher() {
  const {
    language,
    setLanguage,
  } = useLanguage();

  return (
    <div className="language-switcher">

      <Languages size={16} />

      <button
        type="button"
        className={
          language === "en"
            ? "active"
            : ""
        }
        onClick={() =>
          setLanguage("en")
        }
      >
        English
      </button>

      <button
        type="button"
        className={
          language === "hi"
            ? "active"
            : ""
        }
        onClick={() =>
          setLanguage("hi")
        }
      >
        हिंदी
      </button>

      <button
        type="button"
        className={
          language === "mr"
            ? "active"
            : ""
        }
        onClick={() =>
          setLanguage("mr")
        }
      >
        मराठी
      </button>

    </div>
  );
}