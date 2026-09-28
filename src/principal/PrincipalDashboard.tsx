import {
  BookOpen,
  Building2,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  School,
  Settings,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import {
  clearSession,
  getSession,
} from "../utils/session";


/* =========================================================
   TYPES
========================================================= */

interface PrincipalStats {
  students: number;
  boys: number;
  girls: number;
  teachers: number;
  classrooms: number;
}

interface DashboardStatProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  note: string;
}


/* =========================================================
   INITIAL STATS
========================================================= */

const initialStats: PrincipalStats = {
  students: 0,
  boys: 0,
  girls: 0,
  teachers: 0,
  classrooms: 0,
};


/* =========================================================
   NUMBER HELPER
========================================================= */

function numberValue(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}


/* =========================================================
   PRINCIPAL DASHBOARD
========================================================= */

export default function PrincipalDashboard() {

  const navigate = useNavigate();

  const location = useLocation();

  const session = getSession();


  const [loading, setLoading] =
    useState(true);


  const [stats, setStats] =
    useState<PrincipalStats>(
      initialStats
    );


  /* =======================================================
     MOBILE SIDEBAR
  ======================================================= */

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);


  /* =======================================================
     LOGOUT MODAL
  ======================================================= */

  const [
    logoutModal,
    setLogoutModal,
  ] = useState(false);


  /* =======================================================
     AUTH CHECK
  ======================================================= */

  useEffect(() => {

    if (
      !session ||
      session.role !== "principal" ||
      !session.schoolId
    ) {

      navigate(
        "/login",
        {
          replace: true,
        }
      );

    }

  }, [
    navigate,
    session?.id,
    session?.role,
    session?.schoolId,
  ]);


  /* =======================================================
     CLOSE SIDEBAR AFTER ROUTE CHANGE
  ======================================================= */

  useEffect(() => {

    setSidebarOpen(false);

  }, [
    location.pathname,
  ]);


  /* =======================================================
     PREVENT BODY SCROLL WHEN MENU OPEN
  ======================================================= */

  useEffect(() => {

    if (sidebarOpen) {

      document.body.style.overflow =
        "hidden";

    } else {

      document.body.style.overflow =
        "";

    }


    return () => {

      document.body.style.overflow =
        "";

    };

  }, [
    sidebarOpen,
  ]);


  /* =======================================================
     LOAD SCHOOL SUMMARY
  ======================================================= */

  useEffect(() => {

    if (
      !session ||
      session.role !== "principal" ||
      !session.schoolId
    ) {
      return;
    }


    let cancelled = false;


    const loadDashboard =
      async () => {

        setLoading(true);


        let students = 0;

        let boys = 0;

        let girls = 0;

        let teachers = 0;

        let classrooms = 0;


        /* =================================================
           STUDENT SUMMARY
        ================================================= */

        try {

          const studentReference =
            doc(
              db,
              "studentData",
              String(
                session.schoolId
              )
            );


          const studentSnapshot =
            await getDoc(
              studentReference
            );


          if (
            studentSnapshot.exists()
          ) {

            const data =
              studentSnapshot.data();


            boys =
              numberValue(
                data.totalBoys
              );


            girls =
              numberValue(
                data.totalGirls
              );


            students =
              numberValue(
                data.totalStudents
              );


            /* FALLBACK */

            if (
              students === 0 &&
              (
                boys > 0 ||
                girls > 0
              )
            ) {

              students =
                boys + girls;

            }


            /* FALLBACK FROM CLASSES */

            if (
              students === 0 &&
              Array.isArray(
                data.classes
              )
            ) {

              let calculatedBoys = 0;

              let calculatedGirls = 0;


              data.classes.forEach(
                (
                  classData:
                    Record<
                      string,
                      unknown
                    >
                ) => {

                  calculatedBoys +=
                    numberValue(
                      classData.boys
                    );


                  calculatedGirls +=
                    numberValue(
                      classData.girls
                    );

                }
              );


              boys =
                calculatedBoys;


              girls =
                calculatedGirls;


              students =
                calculatedBoys +
                calculatedGirls;

            }

          }

        }

        catch (error) {

          console.error(
            "Principal student summary error:",
            error
          );

        }


        /* =================================================
           TEACHER SUMMARY
        ================================================= */

        try {

          const teacherReference =
            doc(
              db,
              "teacherData",
              String(
                session.schoolId
              )
            );


          const teacherSnapshot =
            await getDoc(
              teacherReference
            );


          if (
            teacherSnapshot.exists()
          ) {

            const data =
              teacherSnapshot.data();


            teachers =
              numberValue(
                data.totalTeachers
              );


            if (
              teachers === 0
            ) {

              const male =
                numberValue(
                  data.maleTeachers
                );


              const female =
                numberValue(
                  data.femaleTeachers
                );


              teachers =
                male + female;

            }

          }

        }

        catch (error) {

          console.error(
            "Principal teacher summary error:",
            error
          );

        }


        /* =================================================
           INFRASTRUCTURE
        ================================================= */

        try {

          const infrastructureReference =
            doc(
              db,
              "infrastructureData",
              String(
                session.schoolId
              )
            );


          const infrastructureSnapshot =
            await getDoc(
              infrastructureReference
            );


          if (
            infrastructureSnapshot.exists()
          ) {

            const data =
              infrastructureSnapshot.data();


            classrooms =
              numberValue(
                data.classrooms
              ) ||
              numberValue(
                data.totalClassrooms
              );

          }

        }

        catch (error) {

          console.error(
            "Principal infrastructure error:",
            error
          );

        }


        /* =================================================
           UPDATE UI
        ================================================= */

        if (!cancelled) {

          setStats({
            students,
            boys,
            girls,
            teachers,
            classrooms,
          });


          setLoading(false);

        }

      };


    loadDashboard();


    return () => {

      cancelled = true;

    };

  }, [
    session?.id,
    session?.schoolId,
    session?.role,
  ]);


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {

    clearSession();

    setSidebarOpen(false);

    setLogoutModal(false);


    navigate(
      "/login",
      {
        replace: true,
      }
    );

  };


  /* =======================================================
     ACTIVE LINK
  ======================================================= */

  const isActive = (
    path: string
  ) => {

    return (
      location.pathname === path
    );

  };


  /* =======================================================
     SECURITY
  ======================================================= */

  if (
    !session ||
    session.role !== "principal" ||
    !session.schoolId
  ) {

    return null;

  }


  /* =======================================================
     UI
  ======================================================= */

  return (

    <div className="director-dashboard principal-dashboard">


      {/* ===================================================
          MOBILE BACKDROP
      =================================================== */}

      <div
        className={
          sidebarOpen
            ? "principal-sidebar-overlay active"
            : "principal-sidebar-overlay"
        }
        onClick={() =>
          setSidebarOpen(false)
        }
      />


      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={
          sidebarOpen
            ? "dashboard-sidebar principal-sidebar mobile-open"
            : "dashboard-sidebar principal-sidebar"
        }
      >


        {/* BRAND */}

        <div className="dashboard-brand">

          <School size={34} />

          <div>

            <strong>
              Kattipar Portal
            </strong>

            <span>
              Principal Panel
            </span>

          </div>


          {/* MOBILE CLOSE */}

          <button
            type="button"
            className="principal-sidebar-close"
            onClick={() =>
              setSidebarOpen(false)
            }
            aria-label="Close menu"
          >

            <X size={21} />

          </button>

        </div>


        {/* =================================================
            USER
        ================================================= */}

        <div className="dashboard-user">

          <div className="dashboard-avatar">

            {session.name
              ?.charAt(0)
              .toUpperCase() ||
              "P"}

          </div>


          <section>

            <strong>

              {session.name ||
                "Principal"}

            </strong>

            <span>
              Principal
            </span>

          </section>

        </div>


        {/* =================================================
            SCHOOL DETAILS
        ================================================= */}

        <div className="principal-school-card">

          <strong>

            {session.schoolName ||
              "Assigned School"}

          </strong>


          <span>

            UDISE:{" "}

            {session.udise ||
              "-"}

          </span>

        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav>


          {/* DASHBOARD */}

          <Link
            to="/principal"
            className={
              isActive(
                "/principal"
              )
                ? "active"
                : ""
            }
          >

            <LayoutDashboard
              size={18}
            />

            <span>
              Dashboard
            </span>

          </Link>


          {/* SCHOOL PROFILE */}

          <Link
            to="/principal/profile"
            className={
              isActive(
                "/principal/profile"
              )
                ? "active"
                : ""
            }
          >

            <School
              size={18}
            />

            <span>
              School Profile
            </span>

          </Link>


          {/* STUDENT SUMMARY */}

          <Link
            to="/principal/students"
            className={
              isActive(
                "/principal/students"
              )
                ? "active"
                : ""
            }
          >

            <GraduationCap
              size={18}
            />

            <span>
              Student Summary
            </span>

          </Link>


          {/* INDIVIDUAL STUDENTS */}

          <Link
            to="/principal/students-list"
            className={
              isActive(
                "/principal/students-list"
              )
                ? "active"
                : ""
            }
          >

            <Users
              size={18}
            />

            <span>
              Student Records
            </span>

          </Link>


          {/* TEACHERS */}

          <Link
            to="/principal/teachers"
            className={
              isActive(
                "/principal/teachers"
              )
                ? "active"
                : ""
            }
          >

            <UserRound
              size={18}
            />

            <span>
              Teacher Data
            </span>

          </Link>


          {/* INFRASTRUCTURE */}

          <Link
            to="/principal/infrastructure"
            className={
              isActive(
                "/principal/infrastructure"
              )
                ? "active"
                : ""
            }
          >

            <Building2
              size={18}
            />

            <span>
              Infrastructure
            </span>

          </Link>


          {/* REPORT */}

          <Link
            to="/principal/report"
            className={
              isActive(
                "/principal/report"
              )
                ? "active"
                : ""
            }
          >

            <FileBarChart
              size={18}
            />

            <span>
              Monthly Report
            </span>

          </Link>


          {/* SETTINGS */}

          <Link
            to="/principal/settings"
            className={
              isActive(
                "/principal/settings"
              )
                ? "active"
                : ""
            }
          >

            <Settings
              size={18}
            />

            <span>
              Change Password
            </span>

          </Link>

        </nav>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          type="button"
          className="principal-logout-button"
          onClick={() =>
            setLogoutModal(true)
          }
        >

          <LogOut
            size={18}
          />

          <span>
            Logout
          </span>

        </button>


      </aside>


      {/* ===================================================
          MAIN
      =================================================== */}

      <div className="dashboard-main">


        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className="dashboard-topbar">


          <div className="principal-topbar-left">


            {/* MOBILE HAMBURGER */}

            <button
              type="button"
              className="principal-mobile-menu"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open menu"
            >

              <Menu size={23} />

            </button>


            <div>

              <h1>
                Principal Dashboard
              </h1>

              <p>

                {session.schoolName ||
                  "School Management"}

              </p>

            </div>

          </div>


          {/* USER */}

          <div className="topbar-user">


            <div className="principal-topbar-user-info">

              <strong>

                {session.name ||
                  "Principal"}

              </strong>

              <span>
                Principal
              </span>

            </div>


            <div className="dashboard-avatar">

              {session.name
                ?.charAt(0)
                .toUpperCase() ||
                "P"}

            </div>

          </div>


        </header>


        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="dashboard-content">


          {/* =================================================
              WELCOME
          ================================================= */}

          <section className="dashboard-welcome">

            <span>
              PRINCIPAL CONTROL PANEL
            </span>


            <h2>

              Welcome,{" "}

              {session.name ||
                "Principal"}

            </h2>


            <p>

              Manage your school's
              student information,
              teachers, infrastructure,
              profile and monthly
              reports from one place.

            </p>

          </section>


          {/* =================================================
              STATISTICS
          ================================================= */}

          <section className="dashboard-stats">


            {/* STUDENTS */}

            <DashboardStat
              icon={
                <Users
                  size={24}
                />
              }
              label="Students"
              value={
                loading
                  ? "..."
                  : stats.students
              }
              note={
                `Boys ${stats.boys} • Girls ${stats.girls}`
              }
            />


            {/* BOYS */}

            <DashboardStat
              icon={
                <GraduationCap
                  size={24}
                />
              }
              label="Boys"
              value={
                loading
                  ? "..."
                  : stats.boys
              }
              note="Reported boys"
            />


            {/* GIRLS */}

            <DashboardStat
              icon={
                <GraduationCap
                  size={24}
                />
              }
              label="Girls"
              value={
                loading
                  ? "..."
                  : stats.girls
              }
              note="Reported girls"
            />


            {/* TEACHERS */}

            <DashboardStat
              icon={
                <UserRound
                  size={24}
                />
              }
              label="Teachers"
              value={
                loading
                  ? "..."
                  : stats.teachers
              }
              note={
                `${stats.classrooms} classrooms reported`
              }
            />


          </section>


          {/* =================================================
              QUICK ACTION HEADING
          ================================================= */}

          <div className="principal-section-heading">

            <span>
              SCHOOL MANAGEMENT
            </span>

            <h2>
              Quick Actions
            </h2>

          </div>


          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className="director-actions">


            {/* STUDENT RECORDS */}

            <Link
              to="/principal/students-list"
            >

              <Users
                size={24}
              />

              <strong>
                Student Records
              </strong>

              <span>

                Add, edit, search and
                manage individual
                student information.

              </span>

            </Link>


            {/* STUDENT SUMMARY */}

            <Link
              to="/principal/students"
            >

              <GraduationCap
                size={24}
              />

              <strong>
                Student Summary
              </strong>

              <span>

                Update class-wise boys,
                girls and total student
                information.

              </span>

            </Link>


            {/* TEACHERS */}

            <Link
              to="/principal/teachers"
            >

              <UserRound
                size={24}
              />

              <strong>
                Teacher Data
              </strong>

              <span>

                Update school teacher
                information.

              </span>

            </Link>


            {/* INFRASTRUCTURE */}

            <Link
              to="/principal/infrastructure"
            >

              <Building2
                size={24}
              />

              <strong>
                Infrastructure
              </strong>

              <span>

                Update classrooms and
                school facilities.

              </span>

            </Link>


            {/* PROFILE */}

            <Link
              to="/principal/profile"
            >

              <School
                size={24}
              />

              <strong>
                School Profile
              </strong>

              <span>

                Update your school's
                basic information.

              </span>

            </Link>


            {/* REPORT */}

            <Link
              to="/principal/report"
            >

              <BookOpen
                size={24}
              />

              <strong>
                Monthly Report
              </strong>

              <span>

                View consolidated
                school information.

              </span>

            </Link>


          </section>


        </main>


      </div>


      {/* ===================================================
          LOGOUT CONFIRMATION
      =================================================== */}

      {logoutModal && (

        <div
          className="principal-logout-modal-overlay"
          onClick={() =>
            setLogoutModal(false)
          }
        >

          <div
            className="principal-logout-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="principal-logout-modal-icon">

              <LogOut
                size={28}
              />

            </div>


            <h2>
              Logout
            </h2>


            <p>

              Are you sure you want
              to logout from the
              Principal Panel?

            </p>


            <div className="principal-logout-modal-actions">


              <button
                type="button"
                className="principal-logout-cancel"
                onClick={() =>
                  setLogoutModal(false)
                }
              >

                Cancel

              </button>


              <button
                type="button"
                className="principal-logout-confirm"
                onClick={
                  handleLogout
                }
              >

                <LogOut
                  size={16}
                />

                Logout

              </button>


            </div>

          </div>

        </div>

      )}


    </div>

  );

}


/* =========================================================
   STAT CARD
========================================================= */

function DashboardStat({
  icon,
  label,
  value,
  note,
}: DashboardStatProps) {

  return (

    <article className="dashboard-stat-card">

      <div>
        {icon}
      </div>


      <section>

        <span>
          {label}
        </span>


        <strong>
          {value}
        </strong>


        <small>
          {note}
        </small>

      </section>

    </article>

  );

}