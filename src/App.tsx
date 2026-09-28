import {
  HashRouter,
  Routes,
  Route,
} from "react-router-dom";

/* =========================================================
   PUBLIC COMPONENTS
========================================================= */

import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Announcement from "./components/Announcement";
import Footer from "./components/Footer";


/* =========================================================
   PUBLIC PAGES
========================================================= */

import Home from "./pages/Home";
import About from "./pages/About";
import Schools from "./pages/Schools";
import SchoolDetails from "./pages/SchoolDetails";
import Calendar from "./pages/Calendar";
import Resources from "./pages/Resources";
import BestPractices from "./pages/BestPractices";
import Gallery from "./pages/Gallery";
import Downloads from "./pages/Downloads";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import SetupDirector from "./pages/SetupDirector";


/* =========================================================
   PRINCIPAL PAGES
========================================================= */

import PrincipalDashboard from "./principal/PrincipalDashboard";
import SchoolProfile from "./principal/SchoolProfile";
import StudentData from "./principal/StudentData";
import Students from "./principal/Students";
import TeacherData from "./principal/TeacherData";
import Infrastructure from "./principal/Infrastructure";
import MonthlyReport from "./principal/MonthlyReport";
import PrincipalSettings from "./principal/PrincipalSettings";


/* =========================================================
   DIRECTOR PAGES
========================================================= */

import DirectorDashboard from "./director/DirectorDashboard";
import ManageSchools from "./director/ManageSchools";
import ManagePrincipals from "./director/ManagePrincipals";
import CreatePrincipal from "./director/CreatePrincipal";
import AllSchoolData from "./director/AllSchoolData";
import Reports from "./director/Reports";
import DirectorSettings from "./director/DirectorSettings";
import DirectorSchoolStudents from "./director/DirectorSchoolStudents";


/* =========================================================
   PUBLIC LAYOUT
========================================================= */

interface PublicLayoutProps {
  children: React.ReactNode;
}

function PublicLayout({
  children,
}: PublicLayoutProps) {
  return (
    <>
      <Header />

      <Navbar />

      <Announcement />

      <main>
        {children}
      </main>

      <Footer />
    </>
  );
}


/* =========================================================
   404 PAGE
========================================================= */

function NotFoundPage() {
  return (
    <PublicLayout>

      <section
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "50px 20px",
          background: "#f5f9fc",
        }}
      >

        <div>

          <p
            style={{
              color: "#174f72",
              fontSize: "15px",
              marginBottom: "8px",
            }}
          >
            SCHOOL MANAGEMENT PORTAL
          </p>

          <h1
            style={{
              margin: "0 0 15px",
              color: "#07558c",
              fontSize: "42px",
            }}
          >
            404 - Page Not Found
          </h1>

          <p
            style={{
              color: "#708090",
              marginBottom: "25px",
            }}
          >
            The page you are looking for does not exist.
          </p>

          <a
            href="#/"
            style={{
              display: "inline-block",
              padding: "11px 22px",
              borderRadius: "7px",
              background: "#075c91",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Go to Home
          </a>

        </div>

      </section>

    </PublicLayout>
  );
}


/* =========================================================
   APP
========================================================= */

export default function App() {
  return (

    <HashRouter>

      <Routes>

        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />


        <Route
          path="/about"
          element={
            <PublicLayout>
              <About />
            </PublicLayout>
          }
        />


        <Route
          path="/schools"
          element={
            <PublicLayout>
              <Schools />
            </PublicLayout>
          }
        />


        <Route
          path="/schools/:id"
          element={
            <PublicLayout>
              <SchoolDetails />
            </PublicLayout>
          }
        />


        <Route
          path="/calendar"
          element={
            <PublicLayout>
              <Calendar />
            </PublicLayout>
          }
        />


        <Route
          path="/resources"
          element={
            <PublicLayout>
              <Resources />
            </PublicLayout>
          }
        />


        <Route
          path="/best-practices"
          element={
            <PublicLayout>
              <BestPractices />
            </PublicLayout>
          }
        />


        <Route
          path="/gallery"
          element={
            <PublicLayout>
              <Gallery />
            </PublicLayout>
          }
        />


        <Route
          path="/downloads"
          element={
            <PublicLayout>
              <Downloads />
            </PublicLayout>
          }
        />


        <Route
          path="/contact"
          element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          }
        />


        <Route
          path="/login"
          element={
            <PublicLayout>
              <Login />
            </PublicLayout>
          }
        />


        {/* =================================================
            DIRECTOR INITIAL SETUP
        ================================================= */}

        <Route
          path="/setup-director"
          element={
            <PublicLayout>
              <SetupDirector />
            </PublicLayout>
          }
        />


        {/* =================================================
            DIRECTOR ROUTES
        ================================================= */}

        <Route
          path="/director"
          element={
            <DirectorDashboard />
          }
        />


        <Route
          path="/director/schools"
          element={
            <ManageSchools />
          }
        />


        <Route
          path="/director/school/:id"
          element={
            <DirectorSchoolStudents />
          }
        />


        <Route
          path="/director/principals"
          element={
            <ManagePrincipals />
          }
        />


        <Route
          path="/director/create-principal"
          element={
            <CreatePrincipal />
          }
        />


        <Route
          path="/director/school-data"
          element={
            <AllSchoolData />
          }
        />


        <Route
          path="/director/reports"
          element={
            <Reports />
          }
        />


        <Route
          path="/director/settings"
          element={
            <DirectorSettings />
          }
        />


        {/* =================================================
            PRINCIPAL ROUTES
        ================================================= */}

        <Route
          path="/principal"
          element={
            <PrincipalDashboard />
          }
        />


        <Route
          path="/principal/profile"
          element={
            <SchoolProfile />
          }
        />


        <Route
          path="/principal/students"
          element={
            <StudentData />
          }
        />


        <Route
          path="/principal/students-list"
          element={
            <Students />
          }
        />


        <Route
          path="/principal/teachers"
          element={
            <TeacherData />
          }
        />


        <Route
          path="/principal/infrastructure"
          element={
            <Infrastructure />
          }
        />


        <Route
          path="/principal/report"
          element={
            <MonthlyReport />
          }
        />


        <Route
          path="/principal/settings"
          element={
            <PrincipalSettings />
          }
        />


        {/* =================================================
            404
        ================================================= */}

        <Route
          path="*"
          element={
            <NotFoundPage />
          }
        />

      </Routes>

    </HashRouter>

  );
}