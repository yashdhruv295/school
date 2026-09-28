import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";

export type Language = "en" | "hi" | "mr";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    home: "Home",
    centreInfo: "Centre Information",
    centreServices: "Centre Services",
    academicCalendar: "Academic Calendar",
    schoolDirectory: "School Directory",
    trainingResources: "Training & Resources",
    bestPractices: "Best Practices",
    downloads: "Downloads",
    photoGallery: "Photo Gallery",
    contact: "Contact / Help Desk",
    secureLogin: "Secure Login",

    portalTitle: "Samuh Sadhan Kendra Kattipar",
    portalSubtitle:
      "School Information & Management Portal",

    welcome: "Welcome",
    welcomeTitle:
      "Samuh Sadhan Kendra Kattipar",
    welcomeDescription:
      "A centralized digital platform for school information, educational resources and school management.",

    viewSchools: "View Schools",
    loginPortal: "Login Portal",

    totalSchools: "Total Schools",
    totalStudents: "Total Students",
    totalTeachers: "Total Teachers",
    totalClassrooms: "Total Classrooms",
    boys: "Boys",
    girls: "Girls",
    udiseRecords: "UDISE Records",

    quickAccess: "Quick Access",
    quickAccessDescription:
      "Access important sections of the portal.",

    schools: "Schools",
    schoolsDescription:
      "View school directory and school information.",

    resources: "Resources",
    resourcesDescription:
      "Access educational and training resources.",

    calendar: "Calendar",
    calendarDescription:
      "View academic calendar and important dates.",

    gallery: "Gallery",
    galleryDescription:
      "View school activities and photographs.",

    schoolList: "School Directory",
    schoolName: "School Name",
    udiseCode: "UDISE Code",
    action: "Action",
    viewDetails: "View Details",

    directorAccess: "Director Access",
    principalAccess: "Principal Access",
    username: "Username",
    password: "Password",
    login: "Login",
    logout: "Logout",

    loading: "Loading...",
    noData: "No data available",
  },

  hi: {
    home: "मुख्य पृष्ठ",
    centreInfo: "केंद्र परिचय",
    centreServices: "केंद्र सेवाएँ",
    academicCalendar: "शैक्षणिक कैलेंडर",
    schoolDirectory: "विद्यालय निर्देशिका",
    trainingResources: "प्रशिक्षण एवं संसाधन",
    bestPractices: "उत्कृष्ट गतिविधियाँ",
    downloads: "डाउनलोड",
    photoGallery: "फोटो गैलरी",
    contact: "संपर्क / सहायता केंद्र",
    secureLogin: "सुरक्षित लॉगिन",

    portalTitle: "समूह साधन केंद्र कट्टीपार",
    portalSubtitle:
      "विद्यालय सूचना एवं प्रबंधन पोर्टल",

    welcome: "स्वागत है",
    welcomeTitle:
      "समूह साधन केंद्र कट्टीपार",
    welcomeDescription:
      "विद्यालय की जानकारी, शैक्षणिक संसाधनों और विद्यालय प्रबंधन के लिए एक केंद्रीकृत डिजिटल प्लेटफॉर्म।",

    viewSchools: "विद्यालय देखें",
    loginPortal: "पोर्टल लॉगिन",

    totalSchools: "कुल विद्यालय",
    totalStudents: "कुल विद्यार्थी",
    totalTeachers: "कुल शिक्षक",
    totalClassrooms: "कुल कक्षाएँ",
    boys: "बालक",
    girls: "बालिकाएँ",
    udiseRecords: "UDISE रिकॉर्ड",

    quickAccess: "त्वरित पहुँच",
    quickAccessDescription:
      "पोर्टल के महत्वपूर्ण विभागों तक पहुँचें।",

    schools: "विद्यालय",
    schoolsDescription:
      "विद्यालय निर्देशिका और विद्यालय की जानकारी देखें।",

    resources: "संसाधन",
    resourcesDescription:
      "शैक्षणिक और प्रशिक्षण संसाधन देखें।",

    calendar: "कैलेंडर",
    calendarDescription:
      "शैक्षणिक कैलेंडर और महत्वपूर्ण तिथियाँ देखें।",

    gallery: "गैलरी",
    galleryDescription:
      "विद्यालय की गतिविधियाँ और फोटो देखें।",

    schoolList: "विद्यालय निर्देशिका",
    schoolName: "विद्यालय का नाम",
    udiseCode: "UDISE कोड",
    action: "कार्य",
    viewDetails: "विवरण देखें",

    directorAccess: "निदेशक प्रवेश",
    principalAccess: "प्रधानाचार्य प्रवेश",
    username: "उपयोगकर्ता नाम",
    password: "पासवर्ड",
    login: "लॉगिन",
    logout: "लॉगआउट",

    loading: "लोड हो रहा है...",
    noData: "कोई डेटा उपलब्ध नहीं है",
  },

  mr: {
    home: "मुख्यपृष्ठ",
    centreInfo: "केंद्र परिचय",
    centreServices: "केंद्र सेवा",
    academicCalendar: "शैक्षणिक कॅलेंडर",
    schoolDirectory: "शाळांची निर्देशिका",
    trainingResources: "प्रशिक्षण व संसाधने",
    bestPractices: "उत्कृष्ट उपक्रम",
    downloads: "डाउनलोड",
    photoGallery: "फोटो गॅलरी",
    contact: "संपर्क / मदत कक्ष",
    secureLogin: "सुरक्षित लॉगिन",

    portalTitle: "समूह साधन केंद्र कट्टीपार",
    portalSubtitle:
      "शाळा माहिती व व्यवस्थापन पोर्टल",

    welcome: "स्वागत आहे",
    welcomeTitle:
      "समूह साधन केंद्र कट्टीपार",
    welcomeDescription:
      "शाळेची माहिती, शैक्षणिक संसाधने आणि शाळा व्यवस्थापनासाठी एक केंद्रीकृत डिजिटल व्यासपीठ.",

    viewSchools: "शाळा पहा",
    loginPortal: "पोर्टल लॉगिन",

    totalSchools: "एकूण शाळा",
    totalStudents: "एकूण विद्यार्थी",
    totalTeachers: "एकूण शिक्षक",
    totalClassrooms: "एकूण वर्गखोल्या",
    boys: "मुले",
    girls: "मुली",
    udiseRecords: "UDISE नोंदी",

    quickAccess: "त्वरित प्रवेश",
    quickAccessDescription:
      "पोर्टलच्या महत्त्वाच्या विभागांमध्ये प्रवेश करा.",

    schools: "शाळा",
    schoolsDescription:
      "शाळांची निर्देशिका आणि शाळेची माहिती पहा.",

    resources: "संसाधने",
    resourcesDescription:
      "शैक्षणिक आणि प्रशिक्षण संसाधने पहा.",

    calendar: "कॅलेंडर",
    calendarDescription:
      "शैक्षणिक कॅलेंडर आणि महत्त्वाच्या तारखा पहा.",

    gallery: "गॅलरी",
    galleryDescription:
      "शाळेचे उपक्रम आणि छायाचित्रे पहा.",

    schoolList: "शाळांची निर्देशिका",
    schoolName: "शाळेचे नाव",
    udiseCode: "UDISE कोड",
    action: "कृती",
    viewDetails: "तपशील पहा",

    directorAccess: "संचालक प्रवेश",
    principalAccess: "मुख्याध्यापक प्रवेश",
    username: "वापरकर्ता नाव",
    password: "पासवर्ड",
    login: "लॉगिन",
    logout: "लॉगआउट",

    loading: "लोड होत आहे...",
    noData: "माहिती उपलब्ध नाही",
  },
} as const;

const LanguageContext =
  createContext<LanguageContextType | undefined>(
    undefined
  );

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] =
    useState<Language>(() => {
      const savedLanguage =
        localStorage.getItem(
          "kattipar_language"
        );

      if (
        savedLanguage === "en" ||
        savedLanguage === "hi" ||
        savedLanguage === "mr"
      ) {
        return savedLanguage;
      }

      return "mr";
    });

  const setLanguage = (
    newLanguage: Language
  ) => {
    setLanguageState(newLanguage);

    localStorage.setItem(
      "kattipar_language",
      newLanguage
    );
  };

  useEffect(() => {
    document.documentElement.lang =
      language;
  }, [language]);

  const t = (key: string): string => {
    const selected =
      translations[language] as Record<
        string,
        string
      >;

    const english =
      translations.en as Record<
        string,
        string
      >;

    return (
      selected[key] ||
      english[key] ||
      key
    );
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}