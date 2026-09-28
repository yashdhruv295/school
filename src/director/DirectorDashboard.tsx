import {
  Building2,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  School,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  useEffect,
  useState,
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


const EMPTY_STATS: DashboardStats = {
  principals: 0,
  students: 0,
  teachers: 0,
  classrooms: 0,
};


/* =========================================================
   NUMBER HELPER
========================================================= */

function toNumber(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}


/* =========================================================
   STUDENT TOTAL HELPER
========================================================= */

function getStudentTotal(
  data: Record<string, any>
): number {

  /*
    First preference:
    saved total field
  */

  const directTotal =
    toNumber(data.totalStudents);

  if (directTotal > 0) {
    return directTotal;
  }


  /*
    Second preference:
    boys + girls
  */

  const boys =
    toNumber(data.totalBoys) ||
    toNumber(data.boys);

  const girls =
    toNumber(data.totalGirls) ||
    toNumber(data.girls);

  if (boys > 0 || girls > 0) {
    return boys + girls;
  }


  /*
    Third preference:
    calculate from classes array
  */

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


        const classBoys =
          toNumber(
            classData.boys
          );

        const classGirls =
          toNumber(
            classData.girls
          );

        return (
          total +
          classBoys +
          classGirls
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

  /*
    First preference:
    totalTeachers
  */

  const directTotal =
    toNumber(data.totalTeachers);

  if (directTotal > 0) {
    return directTotal;
  }


  /*
    Second:
    male + female
  */

  const male =
    toNumber(data.maleTeachers) ||
    toNumber(data.male);

  const female =
    toNumber(data.femaleTeachers) ||
    toNumber(data.female);

  if (male > 0 || female > 0) {
    return male + female;
  }


  /*
    Third:
    teacher list array
  */

  if (Array.isArray(data.teachers)) {
    return data.teachers.length;
  }


  return 0;
}


/* =========================================================
   CLASSROOM HELPER
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
   COMPONENT
========================================================= */

export default function DirectorDashboard() {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const session =
    getSession();


  const [loading, setLoading] =
    useState(true);


  const [stats, setStats] =
    useState<DashboardStats>(
      EMPTY_STATS
    );


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
    session?.id,
    session?.role,
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


    let cancelled = false;


    const loadDashboardData =
      async () => {

        setLoading(true);


        let principals = 0;
        let students = 0;
        let teachers = 0;
        let classrooms = 0;


        /* =================================================
           PRINCIPALS
        ================================================= */

        try {

          const usersSnapshot =
            await getDocs(
              collection(
                db,
                "users"
              )
            );


          usersSnapshot.forEach(
            (userDocument) => {

              const data =
                userDocument.data();


              const role =
                String(
                  data.role || ""
                )
                  .trim()
                  .toLowerCase();


              if (role === "principal") {
                principals++;
              }

            }
          );


          console.log(
            "Principal count:",
            principals
          );

        }

        catch (error) {

          console.error(
            "Principal data error:",
            error
          );

        }


        /* =================================================
           STUDENTS
        ================================================= */

        try {

          const studentSnapshot =
            await getDocs(
              collection(
                db,
                "studentData"
              )
            );


          studentSnapshot.forEach(
            (studentDocument) => {

              const data =
                studentDocument.data();


              const schoolStudents =
                getStudentTotal(data);


              students +=
                schoolStudents;


              console.log(
                "Student document:",
                studentDocument.id,
                schoolStudents,
                data
              );

            }
          );


          console.log(
            "Total students:",
            students
          );

        }

        catch (error) {

          console.error(
            "Student data error:",
            error
          );

        }


        /* =================================================
           TEACHERS
        ================================================= */

        try {

          const teacherSnapshot =
            await getDocs(
              collection(
                db,
                "teacherData"
              )
            );


          teacherSnapshot.forEach(
            (teacherDocument) => {

              const data =
                teacherDocument.data();


              const schoolTeachers =
                getTeacherTotal(data);


              teachers +=
                schoolTeachers;


              console.log(
                "Teacher document:",
                teacherDocument.id,
                schoolTeachers,
                data
              );

            }
          );


          console.log(
            "Total teachers:",
            teachers
          );

        }

        catch (error) {

          console.error(
            "Teacher data error:",
            error
          );

        }


        /* =================================================
           CLASSROOMS
        ================================================= */

        try {

          const infrastructureSnapshot =
            await getDocs(
              collection(
                db,
                "infrastructureData"
              )
            );


          infrastructureSnapshot.forEach(
            (infrastructureDocument) => {

              const data =
                infrastructureDocument.data();


              classrooms +=
                getClassroomTotal(
                  data
                );

            }
          );


          console.log(
            "Total classrooms:",
            classrooms
          );

        }

        catch (error) {

          console.error(
            "Infrastructure data error:",
            error
          );

        }


        /* =================================================
           UPDATE DASHBOARD
        ================================================= */

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

    navigate(
      "/login",
      {
        replace: true,
      }
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
     UI
  ======================================================= */

  return (

    <div className="director-dashboard">


      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside className="dashboard-sidebar">


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

            <Users
              size={18}
            />

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

            <School
              size={18}
            />

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
          onClick={handleLogout}
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


        {/* TOPBAR */}

        <header className="dashboard-topbar">

          <div>

            <h1>
              Director Dashboard
            </h1>

            <p>
              समूह साधन केंद्र कट्टीपार
            </p>

          </div>


          <div className="topbar-user">

            <div>

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



        {/* CONTENT */}

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
              consolidated school reports
              from one place.
            </p>

          </section>



          {/* =================================================
              STATISTICS
          ================================================= */}

          <section className="dashboard-stats">


            {/* SCHOOLS */}

            <DashboardStat

              icon={
                <School
                  size={24}
                />
              }

              label="Total Schools"

              value="18"

              note="17 school records currently available"

            />


            {/* PRINCIPALS */}

            <DashboardStat

              icon={
                <Users
                  size={24}
                />
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
                <Users
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
              QUICK ACTIONS
          ================================================= */}

          <h2
            style={{
              marginTop: "30px",
              marginBottom: "15px",
              color: "#214b65",
              fontSize: "18px",
            }}
          >
            Quick Actions
          </h2>


          <section className="director-actions">


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
                View all schools and
                school information.
              </span>

            </Link>



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
                username and password.
              </span>

            </Link>



            <Link
              to="/director/principals"
            >

              <Users
                size={24}
              />

              <strong>
                Principal Accounts
              </strong>

              <span>
                Manage existing
                Principal accounts.
              </span>

            </Link>



            <Link
              to="/director/settings"
            >

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

    </div>

  );

}


/* =========================================================
   STAT CARD
========================================================= */

interface DashboardStatProps {

  icon: React.ReactNode;

  label: string;

  value: string | number;

  note: string;

}


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