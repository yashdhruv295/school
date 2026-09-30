import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  Download,
  GraduationCap,
  Library,
  Loader2,
  LogIn,
  School,
  Sparkles,
  Users,
} from "lucide-react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { schools } from "../data/schools";


/* =========================================================
   TYPES
========================================================= */

interface HomeSummary {
  students: number;
  boys: number;
  girls: number;

  teachers: number;
  maleTeachers: number;
  femaleTeachers: number;

  classrooms: number;
  usableClassrooms: number;
}


interface ClassRangeData {
  boys: number;
  girls: number;
  total: number;
}


interface ClassRangeSummary {
  class1to5: ClassRangeData;
  class6to8: ClassRangeData;
  class9to10: ClassRangeData;
  class11to12: ClassRangeData;
}


interface StudentClassRecord {
  className?: string | number;
  boys?: number | string;
  girls?: number | string;
}


/* =========================================================
   DEFAULT VALUES
========================================================= */

const initialSummary: HomeSummary = {
  students: 0,
  boys: 0,
  girls: 0,

  teachers: 0,
  maleTeachers: 0,
  femaleTeachers: 0,

  classrooms: 0,
  usableClassrooms: 0,
};


const createEmptyClassRange =
  (): ClassRangeData => ({
    boys: 0,
    girls: 0,
    total: 0,
  });


const createInitialClassSummary =
  (): ClassRangeSummary => ({
    class1to5: createEmptyClassRange(),
    class6to8: createEmptyClassRange(),
    class9to10: createEmptyClassRange(),
    class11to12: createEmptyClassRange(),
  });


/* =========================================================
   COMPONENT
========================================================= */

export default function Home() {
  const [summary, setSummary] =
    useState<HomeSummary>(
      initialSummary
    );

  const [
    classSummary,
    setClassSummary,
  ] =
    useState<ClassRangeSummary>(
      createInitialClassSummary()
    );

  const [loading, setLoading] =
    useState(true);


  /* =========================================================
     LOAD FIRESTORE DATA
  ========================================================= */

  useEffect(() => {
    const loadHomeData =
      async () => {
        try {
          setLoading(true);


          /* -----------------------------------------------------
             LOAD COLLECTIONS
          ----------------------------------------------------- */

          const [
            studentSnapshot,
            teacherSnapshot,
            infrastructureSnapshot,
          ] =
            await Promise.all([
              getDocs(
                collection(
                  db,
                  "studentData"
                )
              ),

              getDocs(
                collection(
                  db,
                  "teacherData"
                )
              ),

              getDocs(
                collection(
                  db,
                  "infrastructureData"
                )
              ),
            ]);


          /* -----------------------------------------------------
             SUMMARY VARIABLES
          ----------------------------------------------------- */

          let totalStudents = 0;
          let totalBoys = 0;
          let totalGirls = 0;

          let totalTeachers = 0;
          let maleTeachers = 0;
          let femaleTeachers = 0;

          let totalClassrooms = 0;
          let usableClassrooms = 0;


          /* -----------------------------------------------------
             CLASS RANGE VARIABLES
          ----------------------------------------------------- */

          const rangeSummary =
            createInitialClassSummary();


          /* =====================================================
             STUDENT DATA
          ===================================================== */

          studentSnapshot.forEach(
            (documentSnapshot) => {
              const data =
                documentSnapshot.data();


              /* -------------------------------------------------
                 OVERALL TOTAL
              ------------------------------------------------- */

              totalStudents +=
                Number(
                  data.totalStudents
                ) || 0;

              totalBoys +=
                Number(
                  data.totalBoys
                ) || 0;

              totalGirls +=
                Number(
                  data.totalGirls
                ) || 0;


              /* -------------------------------------------------
                 CLASS-WISE DATA
              ------------------------------------------------- */

              const classes:
                StudentClassRecord[] =
                Array.isArray(
                  data.classes
                )
                  ? data.classes
                  : [];


              classes.forEach(
                (classData) => {
                  /*
                    Supported class names:

                    "1"
                    "Class 1"
                    "इयत्ता 1"

                    etc.
                  */

                  const rawClassName =
                    String(
                      classData.className ??
                        ""
                    );


                  const match =
                    rawClassName.match(
                      /\d+/
                    );


                  if (!match) {
                    return;
                  }


                  const classNumber =
                    Number(match[0]);


                  const boys =
                    Number(
                      classData.boys
                    ) || 0;


                  const girls =
                    Number(
                      classData.girls
                    ) || 0;


                  let target:
                    | ClassRangeData
                    | null = null;


                  /* =============================================
                     CLASS 1 TO 5
                  ============================================= */

                  if (
                    classNumber >= 1 &&
                    classNumber <= 5
                  ) {
                    target =
                      rangeSummary
                        .class1to5;
                  }


                  /* =============================================
                     CLASS 6 TO 8
                  ============================================= */

                  else if (
                    classNumber >= 6 &&
                    classNumber <= 8
                  ) {
                    target =
                      rangeSummary
                        .class6to8;
                  }


                  /* =============================================
                     CLASS 9 TO 10
                  ============================================= */

                  else if (
                    classNumber >= 9 &&
                    classNumber <= 10
                  ) {
                    target =
                      rangeSummary
                        .class9to10;
                  }


                  /* =============================================
                     CLASS 11 TO 12
                  ============================================= */

                  else if (
                    classNumber >= 11 &&
                    classNumber <= 12
                  ) {
                    target =
                      rangeSummary
                        .class11to12;
                  }


                  /* =============================================
                     ADD BOYS + GIRLS
                  ============================================= */

                  if (target) {
                    target.boys += boys;

                    target.girls +=
                      girls;

                    target.total +=
                      boys + girls;
                  }
                }
              );
            }
          );


          /* =====================================================
             TEACHER DATA
          ===================================================== */

          teacherSnapshot.forEach(
            (documentSnapshot) => {
              const data =
                documentSnapshot.data();


              totalTeachers +=
                Number(
                  data.totalTeachers
                ) || 0;


              maleTeachers +=
                Number(
                  data.maleTeachers
                ) || 0;


              femaleTeachers +=
                Number(
                  data.femaleTeachers
                ) || 0;
            }
          );


          /* =====================================================
             INFRASTRUCTURE DATA
          ===================================================== */

          infrastructureSnapshot.forEach(
            (documentSnapshot) => {
              const data =
                documentSnapshot.data();


              totalClassrooms +=
                Number(
                  data.classrooms
                ) || 0;


              usableClassrooms +=
                Number(
                  data.usableClassrooms
                ) || 0;
            }
          );


          /* =====================================================
             UPDATE STATES
          ===================================================== */

          setSummary({
            students:
              totalStudents,

            boys:
              totalBoys,

            girls:
              totalGirls,

            teachers:
              totalTeachers,

            maleTeachers,

            femaleTeachers,

            classrooms:
              totalClassrooms,

            usableClassrooms,
          });


          setClassSummary(
            rangeSummary
          );
        }

        catch (error) {
          console.error(
            "Home data loading error:",
            error
          );
        }

        finally {
          setLoading(false);
        }
      };


    loadHomeData();
  }, []);


  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="home-page">


      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="home-hero">

        <div className="home-hero-overlay" />


        <div className="home-hero-content">

          <div className="home-hero-badge">

            <Sparkles size={16} />

            Welcome to Kattipar Education Portal

          </div>


          <h1>
            समूह साधन केंद्र
            <br />
            कट्टीपार
          </h1>


          <p>
            शाळा माहिती, विद्यार्थी संख्या,
            शिक्षक माहिती, शैक्षणिक संसाधने
            आणि केंद्रांतर्गत शाळांची माहिती
            एकाच डिजिटल पोर्टलवर.
          </p>


          <div className="home-hero-actions">

            <Link
              to="/schools"
              className="home-primary-button"
            >
              <School size={17} />

              शाळा पहा

              <ArrowRight size={16} />
            </Link>


            <Link
              to="/login"
              className="home-secondary-button"
            >
              <LogIn size={17} />

              सुरक्षित लॉगिन
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          MAIN STATISTICS
      ===================================================== */}

      <section className="home-statistics-section">

        <div className="home-section-container">

          <div className="home-statistics-grid">


            {/* TOTAL SCHOOLS */}

            <div className="home-summary-card">

              <div className="home-summary-icon">
                <School size={26} />
              </div>

              <div className="home-summary-content">

                <span>
                  Total Schools
                </span>

                <strong>
                  {schools.length}
                </strong>

                <small>
                  {schools.length} UDISE school
                  records available
                </small>

              </div>

            </div>


            {/* TOTAL STUDENTS */}

            <div className="home-summary-card">

              <div className="home-summary-icon">
                <GraduationCap size={26} />
              </div>

              <div className="home-summary-content">

                <span>
                  Total Students
                </span>

                <strong>
                  {loading
                    ? "..."
                    : summary.students}
                </strong>

                <small>
                  Boys {summary.boys} · Girls{" "}
                  {summary.girls}
                </small>

              </div>

            </div>


            {/* TOTAL TEACHERS */}

            <div className="home-summary-card">

              <div className="home-summary-icon">
                <Users size={26} />
              </div>

              <div className="home-summary-content">

                <span>
                  Total Teachers
                </span>

                <strong>
                  {loading
                    ? "..."
                    : summary.teachers}
                </strong>

                <small>
                  Male {summary.maleTeachers} ·
                  Female{" "}
                  {summary.femaleTeachers}
                </small>

              </div>

            </div>


            {/* CLASSROOMS */}

            <div className="home-summary-card">

              <div className="home-summary-icon">
                <Building2 size={26} />
              </div>

              <div className="home-summary-content">

                <span>
                  Classrooms
                </span>

                <strong>
                  {loading
                    ? "..."
                    : summary.classrooms}
                </strong>

                <small>
                  {summary.usableClassrooms} usable
                  classrooms
                </small>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          CLASS-WISE STUDENT DISTRIBUTION
      ===================================================== */}

      <section className="home-class-section">

        <div className="home-section-container">


          <div className="home-section-heading">

            <span>
              STUDENT DISTRIBUTION
            </span>

            <h2>
              इयत्तानिहाय विद्यार्थी संख्या
            </h2>

            <p>
              केंद्रांतर्गत सर्व शाळांमधील
              इयत्तांच्या गटानुसार मुले,
              मुली आणि एकूण विद्यार्थी संख्या.
            </p>

          </div>


          <div className="home-class-grid">


            {/* =================================================
                CLASS 1 TO 5
            ================================================= */}

            <article className="home-class-card">

              <div className="home-class-card-icon">
                <BookOpen size={24} />
              </div>

              <div className="home-class-title">
                इयत्ता 1 ते 5
              </div>

              <strong>
                {loading
                  ? "..."
                  : classSummary
                      .class1to5
                      .total}
              </strong>

              <small>
                एकूण विद्यार्थी
              </small>

              <div className="home-class-gender">

                <span>
                  मुले

                  <b>
                    {
                      classSummary
                        .class1to5
                        .boys
                    }
                  </b>
                </span>


                <span>
                  मुली

                  <b>
                    {
                      classSummary
                        .class1to5
                        .girls
                    }
                  </b>
                </span>

              </div>

            </article>


            {/* =================================================
                CLASS 6 TO 8
            ================================================= */}

            <article className="home-class-card">

              <div className="home-class-card-icon">
                <BookOpen size={24} />
              </div>

              <div className="home-class-title">
                इयत्ता 6 ते 8
              </div>

              <strong>
                {loading
                  ? "..."
                  : classSummary
                      .class6to8
                      .total}
              </strong>

              <small>
                एकूण विद्यार्थी
              </small>

              <div className="home-class-gender">

                <span>
                  मुले

                  <b>
                    {
                      classSummary
                        .class6to8
                        .boys
                    }
                  </b>
                </span>


                <span>
                  मुली

                  <b>
                    {
                      classSummary
                        .class6to8
                        .girls
                    }
                  </b>
                </span>

              </div>

            </article>


            {/* =================================================
                CLASS 9 TO 10
            ================================================= */}

            <article className="home-class-card">

              <div className="home-class-card-icon">
                <BookOpen size={24} />
              </div>

              <div className="home-class-title">
                इयत्ता 9 ते 10
              </div>

              <strong>
                {loading
                  ? "..."
                  : classSummary
                      .class9to10
                      .total}
              </strong>

              <small>
                एकूण विद्यार्थी
              </small>

              <div className="home-class-gender">

                <span>
                  मुले

                  <b>
                    {
                      classSummary
                        .class9to10
                        .boys
                    }
                  </b>
                </span>


                <span>
                  मुली

                  <b>
                    {
                      classSummary
                        .class9to10
                        .girls
                    }
                  </b>
                </span>

              </div>

            </article>


            {/* =================================================
                CLASS 11 TO 12
            ================================================= */}

            <article className="home-class-card">

              <div className="home-class-card-icon">
                <GraduationCap size={24} />
              </div>

              <div className="home-class-title">
                इयत्ता 11 ते 12
              </div>

              <strong>
                {loading
                  ? "..."
                  : classSummary
                      .class11to12
                      .total}
              </strong>

              <small>
                एकूण विद्यार्थी
              </small>

              <div className="home-class-gender">

                <span>
                  मुले

                  <b>
                    {
                      classSummary
                        .class11to12
                        .boys
                    }
                  </b>
                </span>


                <span>
                  मुली

                  <b>
                    {
                      classSummary
                        .class11to12
                        .girls
                    }
                  </b>
                </span>

              </div>

            </article>

          </div>

        </div>

      </section>


      {/* =====================================================
          QUICK ACCESS
      ===================================================== */}

      <section className="home-quick-section">

        <div className="home-section-container">


          <div className="home-section-heading">

            <span>
              QUICK ACCESS
            </span>

            <h2>
              महत्त्वाच्या सेवा
            </h2>

            <p>
              शाळा, शैक्षणिक कॅलेंडर,
              प्रशिक्षण, संसाधने आणि
              Downloads सहजपणे पहा.
            </p>

          </div>


          <div className="home-quick-grid">


            {/* SCHOOL DIRECTORY */}

            <article className="home-quick-card">

              <div className="home-quick-icon">
                <School size={28} />
              </div>

              <h3>
                शाळांची Directory
              </h3>

              <p>
                केंद्रांतर्गत शाळांची
                माहिती, UDISE क्रमांक
                आणि उपलब्ध शैक्षणिक डेटा पहा.
              </p>

              <Link
                to="/schools"
                className="home-quick-link"
              >
                शाळा पहा

                <span>→</span>
              </Link>

            </article>


            {/* CALENDAR */}

            <article className="home-quick-card">

              <div className="home-quick-icon">
                <CalendarDays size={28} />
              </div>

              <h3>
                शैक्षणिक कॅलेंडर
              </h3>

              <p>
                शैक्षणिक कार्यक्रम,
                उपक्रम आणि महत्त्वाच्या
                तारखांची माहिती पहा.
              </p>

              <Link
                to="/calendar"
                className="home-quick-link"
              >
                कॅलेंडर पहा

                <span>→</span>
              </Link>

            </article>


            {/* RESOURCES */}

            <article className="home-quick-card">

              <div className="home-quick-icon">
                <Library size={28} />
              </div>

              <h3>
                प्रशिक्षण व संसाधने
              </h3>

              <p>
                शिक्षक आणि शाळांसाठी
                प्रशिक्षण सामग्री आणि
                शैक्षणिक संसाधने.
              </p>

              <Link
                to="/resources"
                className="home-quick-link"
              >
                संसाधने पहा

                <span>→</span>
              </Link>

            </article>


            {/* DOWNLOADS */}

            <article className="home-quick-card">

              <div className="home-quick-icon">
                <Download size={28} />
              </div>

              <h3>
                Downloads
              </h3>

              <p>
                आवश्यक फॉर्म,
                दस्तऐवज आणि शैक्षणिक
                फायली डाउनलोड करा.
              </p>

              <Link
                to="/downloads"
                className="home-quick-link"
              >
                Downloads

                <span>→</span>
              </Link>

            </article>

          </div>

        </div>

      </section>


      {/* =====================================================
          INFORMATION
      ===================================================== */}

      <section className="home-information-section">

        <div className="home-section-container">

          <div className="home-information-card">


            <div className="home-information-icon">

              <School size={43} />

            </div>


            <div className="home-information-content">

              <span>
                ABOUT THE CENTRE
              </span>

              <h2>
                समूह साधन केंद्र कट्टीपार
              </h2>

              <p>
                केंद्रांतर्गत शाळांची
                शैक्षणिक माहिती,
                विद्यार्थी व शिक्षक डेटा,
                पायाभूत सुविधा आणि
                शैक्षणिक संसाधने डिजिटल
                पद्धतीने व्यवस्थापित करण्यासाठी
                हे पोर्टल विकसित करण्यात
                आले आहे.
              </p>


              <Link
                to="/about"
                className="home-information-button"
              >
                केंद्र परिचय

                <ArrowRight size={16} />
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          LOADING INDICATOR
      ===================================================== */}

      {loading && (

        <div className="home-loading">

          <Loader2
            size={20}
            className="home-loading-spinner"
          />

          <span>
            माहिती लोड होत आहे...
          </span>

        </div>

      )}


    </div>
  );
}