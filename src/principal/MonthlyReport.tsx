import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  GraduationCap,
  School,
  Users,
} from "lucide-react";

import { db } from "../firebase/firebase";
import { getSession } from "../utils/session";

interface ReportData {
  students: number;
  boys: number;
  girls: number;

  teachers: number;
  maleTeachers: number;
  femaleTeachers: number;

  classrooms: number;
  usableClassrooms: number;

  availableFacilities: number;
}

const initialReport: ReportData = {
  students: 0,
  boys: 0,
  girls: 0,

  teachers: 0,
  maleTeachers: 0,
  femaleTeachers: 0,

  classrooms: 0,
  usableClassrooms: 0,

  availableFacilities: 0,
};

export default function MonthlyReport() {
  const navigate = useNavigate();

  const [schoolName, setSchoolName] = useState("");
  const [udise, setUdise] = useState("");

  const [report, setReport] =
    useState<ReportData>(initialReport);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      const session = getSession();

      if (!session || session.role !== "principal") {
        navigate("/login");
        return;
      }

      if (!session.schoolId) {
        setLoading(false);
        return;
      }

      setSchoolName(session.schoolName || "");
      setUdise(session.udise || "");

      try {
        const [
          studentsSnapshot,
          teachersSnapshot,
          infrastructureSnapshot,
        ] = await Promise.all([
          getDoc(
            doc(
              db,
              "studentData",
              session.schoolId
            )
          ),

          getDoc(
            doc(
              db,
              "teacherData",
              session.schoolId
            )
          ),

          getDoc(
            doc(
              db,
              "infrastructureData",
              session.schoolId
            )
          ),
        ]);

        const studentData =
          studentsSnapshot.exists()
            ? studentsSnapshot.data()
            : {};

        const teacherData =
          teachersSnapshot.exists()
            ? teachersSnapshot.data()
            : {};

        const infrastructureData =
          infrastructureSnapshot.exists()
            ? infrastructureSnapshot.data()
            : {};

        const facilities =
          infrastructureData.facilities || {};

        const availableFacilities =
          Object.values(facilities).filter(
            (value) => value === true
          ).length;

        setReport({
          students:
            Number(
              studentData.totalStudents
            ) || 0,

          boys:
            Number(
              studentData.totalBoys
            ) || 0,

          girls:
            Number(
              studentData.totalGirls
            ) || 0,

          teachers:
            Number(
              teacherData.totalTeachers
            ) || 0,

          maleTeachers:
            Number(
              teacherData.maleTeachers
            ) || 0,

          femaleTeachers:
            Number(
              teacherData.femaleTeachers
            ) || 0,

          classrooms:
            Number(
              infrastructureData.classrooms
            ) || 0,

          usableClassrooms:
            Number(
              infrastructureData.usableClassrooms
            ) || 0,

          availableFacilities,
        });
      } catch (err) {
        console.error(
          "Report Load Error:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [navigate]);

  if (loading) {
    return (
      <div className="principal-page-loading">
        Preparing Report...
      </div>
    );
  }

  return (
    <div className="principal-data-page">
      <header className="principal-data-header">
        <div>
          <Link
            to="/principal"
            className="principal-back-link"
          >
            <ArrowLeft size={17} />
            Principal Dashboard
          </Link>

          <span className="principal-page-label">
            SCHOOL REPORT
          </span>

          <h1>School Report</h1>

          <p>
            Consolidated school information.
          </p>
        </div>

        <div className="principal-header-icon">
          <BookOpen size={31} />
        </div>
      </header>

      <main className="principal-data-container">
        <div className="assigned-school-banner">
          <div>
            <School />
          </div>

          <section>
            <span>SCHOOL</span>
            <strong>{schoolName}</strong>
            <small>UDISE: {udise}</small>
          </section>
        </div>

        <div className="report-grid">
          <div className="report-card">
            <GraduationCap />

            <span>Total Students</span>

            <strong>{report.students}</strong>

            <small>
              Boys: {report.boys} | Girls:{" "}
              {report.girls}
            </small>
          </div>

          <div className="report-card">
            <Users />

            <span>Total Teachers</span>

            <strong>{report.teachers}</strong>

            <small>
              Male: {report.maleTeachers} | Female:{" "}
              {report.femaleTeachers}
            </small>
          </div>

          <div className="report-card">
            <Building2 />

            <span>Classrooms</span>

            <strong>{report.classrooms}</strong>

            <small>
              Usable: {report.usableClassrooms}
            </small>
          </div>

          <div className="report-card">
            <School />

            <span>Available Facilities</span>

            <strong>
              {report.availableFacilities}
            </strong>

            <small>
              Infrastructure facilities
            </small>
          </div>
        </div>
      </main>
    </div>
  );
}