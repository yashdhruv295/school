import {
  Building2,
  Database,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  School,
  Settings,
  UserPlus,
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
  collection,
  getDocs,
} from "firebase/firestore";

import {
  db,
} from "../firebase/firebase";

import {
  clearSession,
  getSession,
} from "../utils/session";

import {
  schools,
} from "../data/schools";


/* =========================================================
   TYPES
========================================================= */

interface DirectorStats {
  principals: number;
  students: number;
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
   DEFAULT STATS
========================================================= */

const initialStats: DirectorStats = {
  principals: 0,
  students: 0,
  teachers: 0,
  classrooms: 0,
};


/* =========================================================
   NUMBER HELPER
========================================================= */

function numberValue(
  value: unknown
): number {

  const result =
    Number(value);

  return Number.isFinite(result)
    ? result
    : 0;
}


/* =========================================================
   STUDENT TOTAL HELPER
========================================================= */

function getStudentTotal(
  data: Record<string, any>
): number {

  const direct =
    numberValue(
      data.totalStudents
    );

  if (direct > 0) {
    return direct;
  }


  const boys =
    numberValue(
      data.totalBoys
    );

  const girls =
    numberValue(
      data.totalGirls
    );


  if (
    boys > 0 ||
    girls > 0
  ) {

    return boys + girls;

  }


  if (
    Array.isArray(
      data.classes
    )
  ) {

    return data.classes.reduce(
      (
        total: number,
        classData: Record<string, any>
      ) => {

        const classTotal =
          numberValue(
            classData.totalStudents
          );


        if (classTotal > 0) {

          return (
            total +
            classTotal
          );

        }


        return (
          total +
          numberValue(
            classData.boys
          ) +
          numberValue(
            classData.girls
          )
        );

      },
      0
    );

  }


  return 0;
}


/* =========================================================
   TEACHER TOTAL HELPER
========================================================= */

function getTeacherTotal(
  data: Record<string, any>
): number {

  const direct =
    numberValue(
      data.totalTeachers
    );


  if (direct > 0) {

    return direct;

  }


  const male =
    numberValue(
      data.maleTeachers
    );

  const female =
    numberValue(
      data.femaleTeachers
    );


  if (
    male > 0 ||
    female > 0
  ) {

    return male + female;

  }


  if (
    Array.isArray(
      data.teachers
    )
  ) {

    return data.teachers.length;

  }


  return 0;
}


/* =========================================================
   CLASSROOM TOTAL HELPER
========================================================= */

function getClassroomTotal(
  data: Record<string, any>
): number {

  return (
    numberValue(
      data.classrooms
    ) ||
    numberValue(
      data.totalClassrooms
    ) ||
    numberValue(
      data.usableClassrooms
    )
  );

}


/* =========================================================
   DIRECTOR DASHBOARD
========================================================= */

export default function DirectorDashboard() {

  const navigate =
    useNavigate();

  const location =
    useLocation();


  /*
   * Keep session stable for this
   * dashboard render.
   */

  const [session] =
    useState(
      () => getSession()
    );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    stats,
    setStats,
  ] = useState<DirectorStats>(
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
      session.role !== "director"
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
    session,
  ]);


  /* =======================================================
     CLOSE MOBILE MENU AFTER ROUTE CHANGE
  ======================================================= */

  useEffect(() => {

    setSidebarOpen(false);

  }, [
    location.pathname,
  ]);


  /* =======================================================
     LOCK BODY WHEN SIDEBAR OPEN
  ======================================================= */

  useEffect(() => {

    document.body.style.overflow =
      sidebarOpen
        ? "hidden"
        : "";


    return () => {

      document.body.style.overflow =
        "";

    };

  }, [
    sidebarOpen,
  ]);


  /* =======================================================
     LOAD DASHBOARD DATA
  ======================================================= */

  useEffect(() => {

    if (
      !session ||
      session.role !== "director"
    ) {

      return;

    }


    let cancelled =
      false;


    const loadDashboardData =
      async () => {

        setLoading(true);


        /* -----------------------------------------------
           PRINCIPALS
        ----------------------------------------------- */

        let principals = 0;

        try {

          const snapshot =
            await getDocs(
              collection(
                db,
                "users"
              )
            );


          snapshot.forEach(
            (userDocument) => {

              const data =
                userDocument.data();


              if (
                String(
                  data.role || ""
                )
                  .trim()
                  .toLowerCase() ===
                "principal"
              ) {

                principals += 1;

              }

            }
          );

        }

        catch (error) {

          console.error(
            "Director principals load error:",
            error
          );

        }


        /* -----------------------------------------------
           STUDENTS
        ----------------------------------------------- */

        let students = 0;

        try {

          const snapshot =
            await getDocs(
              collection(
                db,
                "studentData"
              )
            );


          snapshot.forEach(
            (studentDocument) => {

              students +=
                getStudentTotal(
                  studentDocument.data()
                );

            }
          );

        }

        catch (error) {

          console.error(
            "Director students load error:",
            error
          );

        }


        /* -----------------------------------------------
           TEACHERS
        ----------------------------------------------- */

        let teachers = 0;

        try {

          const snapshot =
            await getDocs(
              collection(
                db,
                "teacherData"
              )
            );


          snapshot.forEach(
            (teacherDocument) => {

              teachers +=
                getTeacherTotal(
                  teacherDocument.data()
                );

            }
          );

        }

        catch (error) {

          console.error(
            "Director teachers load error:",
            error
          );

        }


        /* -----------------------------------------------
           CLASSROOMS
        ----------------------------------------------- */

        let classrooms = 0;

        try {

          const snapshot =
            await getDocs(
              collection(
                db,
                "infrastructureData"
              )
            );


          snapshot.forEach(
            (infrastructureDocument) => {

              classrooms +=
                getClassroomTotal(
                  infrastructureDocument.data()
                );

            }
          );

        }

        catch (error) {

          console.error(
            "Director infrastructure load error:",
            error
          );

        }


        /* -----------------------------------------------
           UPDATE STATE
        ----------------------------------------------- */

        if (!cancelled) {

          setStats({
            principals,
            students,
            teachers,
            classrooms,
          });


          setLoading(false);

        }

      };


    loadDashboardData();


    return () => {

      cancelled = true;

    };

  }, [
    session,
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
    path: string,
    includeChildren = false
  ) => {

    if (includeChildren) {

      return (
        location.pathname === path ||
        location.pathname.startsWith(
          `${path}/`
        )
      );

    }


    return (
      location.pathname === path
    );

  };


  /* =======================================================
     INVALID SESSION
  ======================================================= */

  if (
    !session ||
    session.role !== "director"
  ) {

    return null;

  }


  /* =======================================================
     UI
  ======================================================= */

  return (

    <div className="director-dashboard">


      {/* ===================================================
          MOBILE OVERLAY
      =================================================== */}

      <div
        className={
          sidebarOpen
            ? "director-sidebar-overlay active"
            : "director-sidebar-overlay"
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
            ? "dashboard-sidebar mobile-open"
            : "dashboard-sidebar"
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
              Director Panel
            </span>

          </div>


          {/* MOBILE CLOSE */}

          <button
            type="button"
            className="director-sidebar-close"
            onClick={() =>
              setSidebarOpen(false)
            }
            aria-label="Close menu"
          >

            <X size={21} />

          </button>

        </div>


        {/* USER */}

        <div className="dashboard-user">

          <div className="dashboard-avatar">

            {session.name
              ?.charAt(0)
              .toUpperCase() ||
              "D"}

          </div>


          <section>

            <strong>

              {session.name ||
                "Director"}

            </strong>

            <span>
              Director / Administrator
            </span>

          </section>

        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav>


          {/* DASHBOARD */}

          <Link
            to="/director"
            className={
              isActive(
                "/director"
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


          {/* MANAGE SCHOOLS */}

          <Link
            to="/director/schools"
            className={
              isActive(
                "/director/schools",
                true
              )
                ? "active"
                : ""
            }
          >

            <Building2
              size={18}
            />

            <span>
              Manage Schools
            </span>

          </Link>


          {/* =================================================
              NEW - MANAGE SCHOOL DATA
          ================================================= */}

          <Link
            to="/director/manage-data"
            className={
              isActive(
                "/director/manage-data",
                true
              )
                ? "active"
                : ""
            }
          >

            <Database
              size={18}
            />

            <span>
              Manage School Data
            </span>

          </Link>


          {/* PRINCIPALS */}

          <Link
            to="/director/principals"
            className={
              isActive(
                "/director/principals",
                true
              )
                ? "active"
                : ""
            }
          >

            <Users
              size={18}
            />

            <span>
              Manage Principals
            </span>

          </Link>


          {/* APPOINT PRINCIPAL */}

          <Link
            to="/director/create-principal"
            className={
              isActive(
                "/director/create-principal"
              )
                ? "active"
                : ""
            }
          >

            <UserPlus
              size={18}
            />

            <span>
              Appoint Principal
            </span>

          </Link>


          {/* ALL SCHOOL DATA */}

          <Link
            to="/director/school-data"
            className={
              isActive(
                "/director/school-data"
              )
                ? "active"
                : ""
            }
          >

            <School
              size={18}
            />

            <span>
              All School Data
            </span>

          </Link>


          {/* REPORTS */}

          <Link
            to="/director/reports"
            className={
              isActive(
                "/director/reports"
              )
                ? "active"
                : ""
            }
          >

            <FileBarChart
              size={18}
            />

            <span>
              Reports
            </span>

          </Link>


          {/* SETTINGS */}

          <Link
            to="/director/settings"
            className={
              isActive(
                "/director/settings"
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
          className="director-logout-button"
          onClick={() =>
            setLogoutModal(true)
          }
        >

          <LogOut size={18} />

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
            TOPBAR
        ================================================= */}

        <header className="dashboard-topbar">


          <div className="director-topbar-left">


            {/* MOBILE MENU */}

            <button
              type="button"
              className="director-mobile-menu"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open menu"
            >

              <Menu size={23} />

            </button>


            <div>

              <h1>
                Director Dashboard
              </h1>

              <p>
                समूह साधन केंद्र कट्टीपार
              </p>

            </div>

          </div>


          {/* TOPBAR USER */}

          <div className="topbar-user">

            <div className="director-topbar-user-info">

              <strong>

                {session.name ||
                  "Director"}

              </strong>

              <span>
                Administrator
              </span>

            </div>


            <div className="dashboard-avatar">

              {session.name
                ?.charAt(0)
                .toUpperCase() ||
                "D"}

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
              DIRECTOR CONTROL PANEL
            </span>


            <h2>

              Welcome,{" "}

              {session.name ||
                "Director"}

            </h2>


            <p>

              Manage schools,
              Principal accounts,
              student information,
              teacher information,
              infrastructure and
              consolidated school
              reports from one place.

            </p>

          </section>


          {/* =================================================
              STATISTICS
          ================================================= */}

          <section className="dashboard-stats">


            {/* TOTAL SCHOOLS */}

            <DashboardStat
              icon={
                <School size={24} />
              }
              label="Total Schools"
              value={
                schools.length
              }
              note={`${schools.length} UDISE school records available`}
            />


            {/* PRINCIPALS */}

            <DashboardStat
              icon={
                <Users size={24} />
              }
              label="Principals"
              value={
                loading
                  ? "..."
                  : stats.principals
              }
              note="Principal accounts"
            />


            {/* STUDENTS */}

            <DashboardStat
              icon={
                <GraduationCap
                  size={24}
                />
              }
              label="Students"
              value={
                loading
                  ? "..."
                  : stats.students
              }
              note="Total reported students"
            />


            {/* TEACHERS */}

            <DashboardStat
              icon={
                <Building2
                  size={24}
                />
              }
              label="Teachers"
              value={
                loading
                  ? "..."
                  : stats.teachers
              }
              note={`${stats.classrooms} classrooms reported`}
            />


          </section>


          {/* =================================================
              QUICK ACTION HEADING
          ================================================= */}

          <div
            style={{
              marginTop: "30px",
              marginBottom: "15px",
            }}
          >

            <span
              style={{
                color: "#d38a0d",
                fontSize: "9px",
                fontWeight: 900,
                letterSpacing: "1.2px",
              }}
            >
              DIRECTOR MANAGEMENT
            </span>


            <h2
              style={{
                margin: "4px 0 0",
                color: "#214b65",
                fontSize: "18px",
              }}
            >
              Quick Actions
            </h2>

          </div>


          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className="director-actions">


            {/* =================================================
                NEW - MANAGE SCHOOL DATA
            ================================================= */}

            <Link
              to="/director/manage-data"
            >

              <Database
                size={24}
              />

              <strong>
                Manage School Data
              </strong>

              <span>

                Select any school and
                enter or update its
                complete information.

              </span>

            </Link>


            {/* MANAGE SCHOOLS */}

            <Link
              to="/director/schools"
            >

              <Building2
                size={24}
              />

              <strong>
                Manage Schools
              </strong>

              <span>

                View all schools
                and school information.

              </span>

            </Link>


            {/* MANAGE PRINCIPALS */}

            <Link
              to="/director/principals"
            >

              <Users
                size={24}
              />

              <strong>
                Manage Principals
              </strong>

              <span>

                View, activate,
                deactivate or delete
                Principal accounts.

              </span>

            </Link>


            {/* APPOINT PRINCIPAL */}

            <Link
              to="/director/create-principal"
            >

              <UserPlus
                size={24}
              />

              <strong>
                Appoint Principal
              </strong>

              <span>

                Create a Principal
                login and assign
                a school.

              </span>

            </Link>


            {/* ALL SCHOOL DATA */}

            <Link
              to="/director/school-data"
            >

              <School
                size={24}
              />

              <strong>
                All School Data
              </strong>

              <span>

                View consolidated
                information submitted
                by all schools.

              </span>

            </Link>


            {/* REPORTS */}

            <Link
              to="/director/reports"
            >

              <FileBarChart
                size={24}
              />

              <strong>
                Reports
              </strong>

              <span>

                View school-wise
                student, teacher and
                infrastructure reports.

              </span>

            </Link>


            {/* SETTINGS */}

            <Link
              to="/director/settings"
            >

              <Settings
                size={24}
              />

              <strong>
                Account Settings
              </strong>

              <span>

                Change Director
                account password
                and settings.

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
          className="director-logout-modal-overlay"
          onClick={() =>
            setLogoutModal(false)
          }
        >

          <div
            className="director-logout-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="director-logout-modal-icon">

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
              Director Panel?

            </p>


            <div className="director-logout-modal-actions">


              <button
                type="button"
                className="director-logout-cancel"
                onClick={() =>
                  setLogoutModal(false)
                }
              >
                Cancel
              </button>


              <button
                type="button"
                className="director-logout-confirm"
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
   DASHBOARD STAT COMPONENT
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