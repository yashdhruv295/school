import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Building2,
  Download,
  GraduationCap,
  Loader2,
  Printer,
  School,
  Search,
  Users,
} from "lucide-react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { schools } from "../data/schools";
import { getSession } from "../utils/session";

interface StudentRecord {
  schoolId?: string;
  totalStudents?: number;
  totalBoys?: number;
  totalGirls?: number;
}

interface TeacherRecord {
  schoolId?: string;
  totalTeachers?: number;
  maleTeachers?: number;
  femaleTeachers?: number;
}

interface InfrastructureRecord {
  schoolId?: string;
  classrooms?: number;
  usableClassrooms?: number;
  facilities?: Record<string, boolean>;
}

interface SchoolReport {
  id: number;
  name: string;
  udise: string;

  students: number;
  boys: number;
  girls: number;

  teachers: number;
  maleTeachers: number;
  femaleTeachers: number;

  classrooms: number;
  usableClassrooms: number;
  facilities: number;
}

export default function Reports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState<SchoolReport[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    const session = getSession();

    if (!session || session.role !== "director") {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    loadReports();
  }, [navigate]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        studentSnapshot,
        teacherSnapshot,
        infrastructureSnapshot,
      ] = await Promise.all([
        getDocs(collection(db, "studentData")),
        getDocs(collection(db, "teacherData")),
        getDocs(collection(db, "infrastructureData")),
      ]);

      const studentMap = new Map<
        string,
        StudentRecord
      >();

      const teacherMap = new Map<
        string,
        TeacherRecord
      >();

      const infrastructureMap = new Map<
        string,
        InfrastructureRecord
      >();

      studentSnapshot.forEach((document) => {
        studentMap.set(
          document.id,
          document.data() as StudentRecord
        );
      });

      teacherSnapshot.forEach((document) => {
        teacherMap.set(
          document.id,
          document.data() as TeacherRecord
        );
      });

      infrastructureSnapshot.forEach((document) => {
        infrastructureMap.set(
          document.id,
          document.data() as InfrastructureRecord
        );
      });

      const finalReports: SchoolReport[] =
        schools.map((school) => {
          const schoolId = String(school.id);

          const student =
            studentMap.get(schoolId);

          const teacher =
            teacherMap.get(schoolId);

          const infrastructure =
            infrastructureMap.get(schoolId);

          const facilities =
            infrastructure?.facilities || {};

          const availableFacilities =
            Object.values(facilities).filter(
              (value) => value === true
            ).length;

          return {
            id: school.id,
            name: school.name,
            udise: school.udise,

            students:
              Number(student?.totalStudents) || 0,

            boys:
              Number(student?.totalBoys) || 0,

            girls:
              Number(student?.totalGirls) || 0,

            teachers:
              Number(teacher?.totalTeachers) || 0,

            maleTeachers:
              Number(teacher?.maleTeachers) || 0,

            femaleTeachers:
              Number(teacher?.femaleTeachers) || 0,

            classrooms:
              Number(
                infrastructure?.classrooms
              ) || 0,

            usableClassrooms:
              Number(
                infrastructure?.usableClassrooms
              ) || 0,

            facilities:
              availableFacilities,
          };
        });

      setReports(finalReports);
    } catch (err) {
      console.error(
        "Reports loading error:",
        err
      );

      setError(
        "Unable to load reports. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return reports;
    }

    return reports.filter(
      (school) =>
        school.name
          .toLowerCase()
          .includes(value) ||
        school.udise.includes(value)
    );
  }, [reports, search]);

  const totals = useMemo(() => {
    return reports.reduce(
      (total, school) => {
        total.students += school.students;
        total.boys += school.boys;
        total.girls += school.girls;

        total.teachers += school.teachers;

        total.maleTeachers +=
          school.maleTeachers;

        total.femaleTeachers +=
          school.femaleTeachers;

        total.classrooms +=
          school.classrooms;

        total.usableClassrooms +=
          school.usableClassrooms;

        return total;
      },
      {
        students: 0,
        boys: 0,
        girls: 0,

        teachers: 0,
        maleTeachers: 0,
        femaleTeachers: 0,

        classrooms: 0,
        usableClassrooms: 0,
      }
    );
  }, [reports]);

  const handlePrint = () => {
    window.print();
  };

  const downloadCSV = () => {
    const headings = [
      "School",
      "UDISE",
      "Students",
      "Boys",
      "Girls",
      "Teachers",
      "Male Teachers",
      "Female Teachers",
      "Classrooms",
      "Usable Classrooms",
      "Facilities",
    ];

    const rows = filteredReports.map(
      (school) => [
        school.name,
        school.udise,
        school.students,
        school.boys,
        school.girls,
        school.teachers,
        school.maleTeachers,
        school.femaleTeachers,
        school.classrooms,
        school.usableClassrooms,
        school.facilities,
      ]
    );

    const escapeCSV = (
      value: string | number
    ) => {
      const text = String(value).replace(
        /"/g,
        '""'
      );

      return `"${text}"`;
    };

    const csv = [
      headings.map(escapeCSV).join(","),
      ...rows.map((row) =>
        row.map(escapeCSV).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "kattipar-school-report.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="reports-loading">
        <Loader2
          size={35}
          className="reports-spinner"
        />

        <p>Loading school reports...</p>
      </div>
    );
  }

  return (
    <div className="director-reports-page">

      {/* HEADER */}

      <header className="reports-header">

        <div className="reports-header-inner">

          <button
            type="button"
            className="reports-back-button"
            onClick={() =>
              navigate("/director")
            }
          >
            <ArrowLeft size={18} />

            Dashboard
          </button>

          <div className="reports-header-title">

            <div className="reports-header-icon">
              <BarChart3 size={28} />
            </div>

            <div>
              <span>
                DIRECTOR PANEL
              </span>

              <h1>
                School Reports
              </h1>

              <p>
                Samuh Sadhan Kendra Kattipar
              </p>
            </div>

          </div>

          <div className="reports-header-actions">

            <button
              type="button"
              onClick={handlePrint}
              className="reports-action secondary"
            >
              <Printer size={16} />
              Print
            </button>

            <button
              type="button"
              onClick={downloadCSV}
              className="reports-action primary"
            >
              <Download size={16} />
              CSV
            </button>

          </div>

        </div>

      </header>


      <main className="reports-container">

        {error && (
          <div className="reports-error">
            {error}
          </div>
        )}


        {/* SUMMARY */}

        <section className="reports-summary">

          <article className="reports-stat-card">

            <div className="reports-stat-icon">
              <School size={24} />
            </div>

            <div>
              <span>
                Reported Schools
              </span>

              <strong>18</strong>

              <small>
                {schools.length} school records
              </small>
            </div>

          </article>


          <article className="reports-stat-card">

            <div className="reports-stat-icon">
              <GraduationCap size={24} />
            </div>

            <div>
              <span>
                Total Students
              </span>

              <strong>
                {totals.students}
              </strong>

              <small>
                Boys {totals.boys} · Girls{" "}
                {totals.girls}
              </small>
            </div>

          </article>


          <article className="reports-stat-card">

            <div className="reports-stat-icon">
              <Users size={24} />
            </div>

            <div>
              <span>
                Total Teachers
              </span>

              <strong>
                {totals.teachers}
              </strong>

              <small>
                Male {totals.maleTeachers} · Female{" "}
                {totals.femaleTeachers}
              </small>
            </div>

          </article>


          <article className="reports-stat-card">

            <div className="reports-stat-icon">
              <Building2 size={24} />
            </div>

            <div>
              <span>
                Classrooms
              </span>

              <strong>
                {totals.classrooms}
              </strong>

              <small>
                {totals.usableClassrooms} usable
              </small>
            </div>

          </article>

        </section>


        {/* REPORT TABLE */}

        <section className="reports-table-section">

          <div className="reports-table-header">

            <div>
              <span>
                SCHOOL-WISE DATA
              </span>

              <h2>
                Consolidated Report
              </h2>

              <p>
                Student, teacher and infrastructure
                information from Firestore.
              </p>
            </div>


            <div className="reports-search">

              <Search size={17} />

              <input
                type="text"
                placeholder="Search school or UDISE..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

            </div>

          </div>


          <div className="reports-table-wrapper">

            <table className="reports-table">

              <thead>
                <tr>
                  <th>#</th>

                  <th>School</th>

                  <th>UDISE</th>

                  <th>Students</th>

                  <th>Boys</th>

                  <th>Girls</th>

                  <th>Teachers</th>

                  <th>Male</th>

                  <th>Female</th>

                  <th>Classrooms</th>

                  <th>Usable</th>

                  <th>Facilities</th>
                </tr>
              </thead>

              <tbody>

                {filteredReports.length === 0 ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="reports-empty"
                    >
                      No school found.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map(
                    (school, index) => (
                      <tr key={school.id}>

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="reports-school-name"
                            onClick={() =>
                              navigate(
                                `/director/school/${school.id}`
                              )
                            }
                          >
                            {school.name}
                          </button>
                        </td>

                        <td>
                          <span className="reports-udise">
                            {school.udise}
                          </span>
                        </td>

                        <td>
                          {school.students}
                        </td>

                        <td>
                          {school.boys}
                        </td>

                        <td>
                          {school.girls}
                        </td>

                        <td>
                          {school.teachers}
                        </td>

                        <td>
                          {school.maleTeachers}
                        </td>

                        <td>
                          {school.femaleTeachers}
                        </td>

                        <td>
                          {school.classrooms}
                        </td>

                        <td>
                          {school.usableClassrooms}
                        </td>

                        <td>
                          {school.facilities}
                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>


          <div className="reports-table-footer">
            Showing{" "}
            <strong>
              {filteredReports.length}
            </strong>{" "}
            of{" "}
            <strong>
              {schools.length}
            </strong>{" "}
            available school records.
          </div>

        </section>

      </main>

    </div>
  );
}