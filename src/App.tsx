import {
  HashRouter,
  Routes,
  Route,
} from "react-router-dom";

import type { ReactNode } from "react";


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
   DIRECTOR SCHOOL DATA MANAGEMENT
========================================================= */

import ManageSchoolData from "./director/ManageSchoolData";
import DirectorSchoolData from "./director/DirectorSchoolData";
import EditSchoolProfile from "./director/EditSchoolProfile";

import DirectorStudentData from "./director/DirectorStudentData";
import DirectorStudentRecords from "./director/DirectorStudentRecords";
import DirectorTeacherData from "./director/DirectorTeacherData";
import DirectorInfrastructure from "./director/DirectorInfrastructure";
import DirectorSchoolReport from "./director/DirectorSchoolReport";


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


        {/* HOME */}

        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />


        {/* ABOUT */}

        <Route
          path="/about"
          element={
            <PublicLayout>
              <About />
            </PublicLayout>
          }
        />


        {/* SCHOOL DIRECTORY */}

        <Route
          path="/schools"
          element={
            <PublicLayout>
              <Schools />
            </PublicLayout>
          }
        />


        {/* PUBLIC SCHOOL DETAILS */}

        <Route
          path="/schools/:id"
          element={
            <PublicLayout>
              <SchoolDetails />
            </PublicLayout>
          }
        />


        {/* ACADEMIC CALENDAR */}

        <Route
          path="/calendar"
          element={
            <PublicLayout>
              <Calendar />
            </PublicLayout>
          }
        />


        {/* TRAINING AND RESOURCES */}

        <Route
          path="/resources"
          element={
            <PublicLayout>
              <Resources />
            </PublicLayout>
          }
        />


        {/* BEST PRACTICES */}

        <Route
          path="/best-practices"
          element={
            <PublicLayout>
              <BestPractices />
            </PublicLayout>
          }
        />


        {/* PHOTO GALLERY */}

        <Route
          path="/gallery"
          element={
            <PublicLayout>
              <Gallery />
            </PublicLayout>
          }
        />


        {/* DOWNLOADS */}

        <Route
          path="/downloads"
          element={
            <PublicLayout>
              <Downloads />
            </PublicLayout>
          }
        />


        {/* CONTACT */}

        <Route
          path="/contact"
          element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          }
        />


        {/* LOGIN */}

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


        {/* DIRECTOR DASHBOARD */}

        <Route
          path="/director"
          element={
            <DirectorDashboard />
          }
        />


        {/* MANAGE SCHOOLS */}

        <Route
          path="/director/schools"
          element={
            <ManageSchools />
          }
        />


        {/* EXISTING SCHOOL STUDENT VIEW */}

        <Route
          path="/director/school/:id"
          element={
            <DirectorSchoolStudents />
          }
        />


        {/* MANAGE PRINCIPALS */}

        <Route
          path="/director/principals"
          element={
            <ManagePrincipals />
          }
        />


        {/* CREATE / APPOINT PRINCIPAL */}

        <Route
          path="/director/create-principal"
          element={
            <CreatePrincipal />
          }
        />


        {/* ALL SCHOOL DATA */}

        <Route
          path="/director/school-data"
          element={
            <AllSchoolData />
          }
        />


        {/* DIRECTOR REPORTS */}

        <Route
          path="/director/reports"
          element={
            <Reports />
          }
        />


        {/* DIRECTOR SETTINGS */}

        <Route
          path="/director/settings"
          element={
            <DirectorSettings />
          }
        />


        {/* =================================================
            DIRECTOR - MANAGE SCHOOL DATA
        ================================================= */}


        {/* SELECT SCHOOL */}

        <Route
          path="/director/manage-data"
          element={
            <ManageSchoolData />
          }
        />


        {/* SELECTED SCHOOL CONTROL CENTER */}

        <Route
          path="/director/manage-data/:schoolId"
          element={
            <DirectorSchoolData />
          }
        />


        {/* EDIT SCHOOL PROFILE */}

        <Route
          path="/director/manage-data/:schoolId/profile"
          element={
            <EditSchoolProfile />
          }
        />


        {/* STUDENT SUMMARY */}

        <Route
          path="/director/manage-data/:schoolId/students"
          element={
            <DirectorStudentData />
          }
        />


        {/* INDIVIDUAL STUDENT RECORDS */}

        <Route
          path="/director/manage-data/:schoolId/student-records"
          element={
            <DirectorStudentRecords />
          }
        />


        {/* TEACHER DATA */}

        <Route
          path="/director/manage-data/:schoolId/teachers"
          element={
            <DirectorTeacherData />
          }
        />


        {/* INFRASTRUCTURE */}

        <Route
          path="/director/manage-data/:schoolId/infrastructure"
          element={
            <DirectorInfrastructure />
          }
        />


        {/* SCHOOL REPORT */}

        <Route
          path="/director/manage-data/:schoolId/report"
          element={
            <DirectorSchoolReport />
          }
        />


        {/* =================================================
            PRINCIPAL ROUTES
        ================================================= */}


        {/* PRINCIPAL DASHBOARD */}

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


        {/* STUDENT SUMMARY */}

        <Route
          path="/principal/students"
          element={
            <StudentData />
          }
        />


        {/* INDIVIDUAL STUDENT RECORDS */}

        <Route
          path="/principal/students-list"
          element={
            <Students />
          }
        />


        {/* TEACHER DATA */}

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


        {/* MONTHLY / SCHOOL REPORT */}

        <Route
          path="/principal/report"
          element={
            <MonthlyReport />
          }
        />


        {/* PRINCIPAL SETTINGS */}

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