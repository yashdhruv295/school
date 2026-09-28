import {
  Building2,
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
  collection,
  getDocs,
} from "firebase/firestore";

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

import { db } from "../firebase/firebase";

import {
  clearSession,
  getSession,
} from "../utils/session";


/* =========================================================
   TYPES
========================================================= */

interface DashboardStats {
  principals: number;
  students: number;
  teachers: number;
  classrooms: number;
}

interface StudentClassData {
  boys?: number | string;
  girls?: number | string;
  total?: number | string;
  totalStudents?: number | string;
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

const EMPTY_STATS: DashboardStats = {
  principals: 0,
  students: 0,
  teachers: 0,
  classrooms: 0,
};


/* =========================================================
   HELPERS
========================================================= */

function toNumber(
  value: unknown
): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}


/* =========================================================
   STUDENT TOTAL
========================================================= */

function getStudentTotal(
  data: Record<string, any>
): number {

  const directTotal =
    toNumber(data.totalStudents);

  if (directTotal > 0) {
    return directTotal;
  }


  const boys =
    toNumber(data.totalBoys) ||
    toNumber(data.boys);

  const girls =
    toNumber(data.totalGirls) ||
    toNumber(data.girls);

  if (boys > 0 || girls > 0) {
    return boys + girls;
  }


  if (Array.isArray(data.classes)) {

    return data.classes.reduce(
      (
        total: number,
        classData: StudentClassData
      ) => {

        const classTotal =
          toNumber(
            classData.totalStudents
          ) ||
          toNumber(
            classData.total
          );

        if (classTotal > 0) {
          return total + classTotal;
        }


        return (
          total +
          toNumber(classData.boys) +
          toNumber(classData.girls)
        );

      },
      0
    );
  }


  return 0;
}


/* =========================================================
   TEACHER TOTAL
========================================================= */

function getTeacherTotal(
  data: Record<string, any>
): number {

  const directTotal =
    toNumber(data.totalTeachers);

  if (directTotal > 0) {
    return directTotal;
  }


  const male =
    toNumber(data.maleTeachers) ||
    toNumber(data.male);

  const female =
    toNumber(data.femaleTeachers) ||
    toNumber(data.female);

  if (male > 0 || female > 0) {
    return male + female;
  }


  if (Array.isArray(data.teachers)) {
    return data.teachers.length;
  }


  return 0;
}


/* =========================================================
   CLASSROOM TOTAL
========================================================= */

function getClassroomTotal(
  data: Record<string, any>
): number {

  return (
    toNumber(data.classrooms) ||
    toNumber(data.totalClassrooms) ||
    0
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

  const session =
    getSession();


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    stats,
    setStats,
  ] = useState<DashboardStats>(
    EMPTY_STATS
  );


  /* MOBILE SIDEBAR */

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);


  /* LOGOUT MODAL */

  const [
    logoutModal,
    setLogoutModal,
  ] = useState(false);


  /* =======================================================
     AUTH
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
    session?.id,
    session?.role,
  ]);


  /* =======================================================
     CLOSE DRAWER WHEN ROUTE CHANGES
  ======================================================= */

  useEffect(() => {

    setSidebarOpen(false);

  }, [
    location.pathname,
  ]);


  /* =======================================================
     LOCK BODY SCROLL
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
     DASHBOARD DATA
  ======================================================= */

  useEffect(() => {

    if (
      !session ||
      session.role !== "director"
    ) {
      return;
    }


    let cancelled = false;


    const loadDashboardData =
      async () => {

        setLoading(true);


        let principals = 0;
        let students = 0;
        let teachers = 0;
        let classrooms = 0;


        /* PRINCIPALS */

        try {

          const snapshot =
            await getDocs(
              collection(
                db,
                "users"
              )
            );


          snapshot.forEach(
            (document) => {

              const data =
                document.data();


              const role =
                String(
                  data.role || ""
                )
                  .trim()
                  .toLowerCase();


              if (
                role === "principal"
              ) {
                principals++;
              }

            }
          );

        }

        catch (error) {

          console.error(
            "Principal data error:",
            error
          );

        }


        /* STUDENTS */

        try {

          const snapshot =
            await getDocs(
              collection(
                db,
                "studentData"
              )
            );


          snapshot.forEach(
            (document) => {

              students +=
                getStudentTotal(
                  document.data()
                );

            }
          );

        }

        catch (error) {

          console.error(
            "Student data error:",
            error
          );

        }


        /* TEACHERS */

        try {

          const snapshot =
            await getDocs(
              collection(
                db,
                "teacherData"
              )
            );


          snapshot.forEach(
            (document) => {

              teachers +=
                getTeacherTotal(
                  document.data()
                );

            }
          );

        }

        catch (error) {

          console.error(
            "Teacher data error:",
            error
          );

        }


        /* CLASSROOMS */

        try {

          const snapshot =
            await getDocs(
              collection(
                db,
                "infrastructureData"
              )
            );


          snapshot.forEach(
            (document) => {

              classrooms +=
                getClassroomTotal(
                  document.data()
                );

            }
          );

        }

        catch (error) {

          console.error(
            "Infrastructure data error:",
            error
          );

        }


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
    session?.id,
    session?.role,
  ]);


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {

    clearSession();

    setLogoutModal(false);

    setSidebarOpen(false);


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
    session.role !== "director"
  ) {
    return null;
  }


  /* =======================================================
     UI
  ======================================================= */

  return (

    <div className="director-dashboard">


      {/* ===============================================
          MOBILE OVERLAY
      =============================================== */}

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


      {/* ===============================================
          SIDEBAR
      =============================================== */}

      <aside
        className={
          sidebarOpen
            ? "dashboard-sidebar mobile-open"
            : "dashboard-sidebar"
        }
      >


        {/* BRAND */}

        <div className="dashboard-brand">

          <School size={32} />

          <div>

            <strong>
              Kattipar Portal
            </strong>

            <span>
              Director Panel
            </span>

          </div>


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


        {/* NAVIGATION */}

        <nav>

          <Link
            to="/director"
            className={
              isActive("/director")
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


          <Link
            to="/director/schools"
            className={
              isActive(
                "/director/schools"
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


          <Link
            to="/director/principals"
            className={
              isActive(
                "/director/principals"
              )
                ? "active"
                : ""
            }
          >
            <Users size={18} />

            <span>
              Manage Principals
            </span>
          </Link>


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
            <School size={18} />

            <span>
              All School Data
            </span>
          </Link>


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


        {/* LOGOUT */}

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


      {/* ===============================================
          MAIN
      =============================================== */}

      <div className="dashboard-main">


        {/* =============================================
            TOP BAR
        ============================================= */}

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


          {/* USER */}

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


        {/* =============================================
            CONTENT
        ============================================= */}

        <main className="dashboard-content">


          {/* WELCOME */}

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


          {/* ===========================================
              STATS
          =========================================== */}

          <section className="dashboard-stats">


            <DashboardStat
              icon={
                <School size={24} />
              }
              label="Total Schools"
              value="18"
              note="17 school records currently available"
            />


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


            <DashboardStat
              icon={
                <Users size={24} />
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


          {/* ===========================================
              QUICK ACTIONS
          =========================================== */}

          <div className="director-section-heading">

            <div>

              <span>
                MANAGEMENT
              </span>

              <h2>
                Quick Actions
              </h2>

            </div>

          </div>


          <section className="director-actions">


            <Link to="/director/schools">

              <Building2
                size={24}
              />

              <strong>
                Manage Schools
              </strong>

              <span>
                View all schools and
                school information.
              </span>

            </Link>


            <Link to="/director/create-principal">

              <UserPlus
                size={24}
              />

              <strong>
                Appoint Principal
              </strong>

              <span>
                Create a Principal
                username and password.
              </span>

            </Link>


            <Link to="/director/principals">

              <Users size={24} />

              <strong>
                Principal Accounts
              </strong>

              <span>
                Manage existing
                Principal accounts.
              </span>

            </Link>


            <Link to="/director/reports">

              <FileBarChart
                size={24}
              />

              <strong>
                Reports
              </strong>

              <span>
                View consolidated
                school reports.
              </span>

            </Link>


            <Link to="/director/school-data">

              <School size={24} />

              <strong>
                All School Data
              </strong>

              <span>
                View school-wise
                information and data.
              </span>

            </Link>


            <Link to="/director/settings">

              <Settings
                size={24}
              />

              <strong>
                Change Password
              </strong>

              <span>
                Update your Director
                login password.
              </span>

            </Link>


          </section>


        </main>


      </div>


      {/* ===============================================
          LOGOUT MODAL
      =============================================== */}

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

              <LogOut size={27} />

            </div>


            <h2>
              Logout
            </h2>


            <p>
              Are you sure you want
              to logout from the
              Director Panel?
            </p>


            <div className="director-logout-actions">

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

                <LogOut size={16} />

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