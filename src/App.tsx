import type { ReactNode } from "react";

import {
  BrowserRouter,
  Route,
  Routes,
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
   DIRECTOR PAGES
========================================================= */

import DirectorDashboard from "./director/DirectorDashboard";
import ManageSchools from "./director/ManageSchools";
import ManagePrincipals from "./director/ManagePrincipals";
import CreatePrincipal from "./director/CreatePrincipal";
import AllSchoolData from "./director/AllSchoolData";
import Reports from "./director/Reports";
import DirectorSettings from "./director/DirectorSettings";

/* NEW */
import DirectorSchoolStudents from "./director/DirectorSchoolStudents";


/* =========================================================
   PRINCIPAL PAGES
========================================================= */

import PrincipalDashboard from "./principal/PrincipalDashboard";
import SchoolProfile from "./principal/SchoolProfile";
import StudentData from "./principal/StudentData";
import TeacherData from "./principal/TeacherData";
import Infrastructure from "./principal/Infrastructure";
import MonthlyReport from "./principal/MonthlyReport";
import PrincipalSettings from "./principal/PrincipalSettings";

/* NEW */
import Students from "./principal/Students";


/* =========================================================
   PUBLIC LAYOUT
========================================================= */

interface PublicLayoutProps {
  children: ReactNode;
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
    <div className="temporary-page">

      <div className="temporary-page-card">

        <span>
          SCHOOL MANAGEMENT PORTAL
        </span>

        <h1>
          404 - Page Not Found
        </h1>

        <p>
          The page you are looking for
          does not exist.
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   APP
========================================================= */

export default function App() {

  return (

    <BrowserRouter>

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
            <SetupDirector />
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


        {/* =================================================
            IMPORTANT
            Director selected school private data
        ================================================= */}


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


        {/* SCHOOL PROFILE */}

        <Route
          path="/principal/profile"
          element={
            <SchoolProfile />
          }
        />


        {/* =================================================
            STUDENT SUMMARY

            Existing class-wise boys/girls
            summary page
        ================================================= */}


        <Route
          path="/principal/students"
          element={
            <StudentData />
          }
        />


        {/* =================================================
            INDIVIDUAL PRIVATE STUDENT RECORDS

            Name
            DOB
            Age
            Gender
            Class
            Roll Number
            Parent
            Mobile
            Address
        ================================================= */}


        <Route
          path="/principal/students-list"
          element={
            <Students />
          }
        />


        {/* TEACHERS */}

        <Route
          path="/principal/teachers"
          element={
            <TeacherData />
          }
        />


        {/* INFRASTRUCTURE */}

        <Route
          path="/principal/infrastructure"
          element={
            <Infrastructure />
          }
        />


        {/* REPORT */}

        <Route
          path="/principal/report"
          element={
            <MonthlyReport />
          }
        />


        {/* SETTINGS */}

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
            <PublicLayout>
              <NotFoundPage />
            </PublicLayout>
          }
        />


      </Routes>

    </BrowserRouter>

  );

}