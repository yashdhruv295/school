import {
  ArrowLeft,
  Building2,
  GraduationCap,
  School,
  Users,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { db } from "../firebase/firebase";
import { schools } from "../data/schools";
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

  principalName: string;
  village: string;
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

  principalName: "",
  village: "",
};


export default function DirectorSchoolReport() {

  const navigate =
    useNavigate();

  const { schoolId } =
    useParams();

  const session =
    getSession();


  const school =
    schools.find(
      (item) =>
        String(item.id) ===
        String(schoolId)
    );


  const [report, setReport] =
    useState<ReportData>(
      initialReport
    );

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    if (
      !session ||
      session.role !== "director" ||
      !schoolId
    ) {

      navigate(
        "/login",
        { replace: true }
      );

      return;

    }


    const loadReport = async () => {

      try {

        setLoading(true);


        const [
          profileSnapshot,
          studentSnapshot,
          teacherSnapshot,
          infrastructureSnapshot,
        ] = await Promise.all([

          getDoc(
            doc(
              db,
              "schoolProfiles",
              String(schoolId)
            )
          ),

          getDoc(
            doc(
              db,
              "studentData",
              String(schoolId)
            )
          ),

          getDoc(
            doc(
              db,
              "teacherData",
              String(schoolId)
            )
          ),

          getDoc(
            doc(
              db,
              "infrastructureData",
              String(schoolId)
            )
          ),

        ]);


        const profile =
          profileSnapshot.exists()
            ? profileSnapshot.data()
            : {};

        const student =
          studentSnapshot.exists()
            ? studentSnapshot.data()
            : {};

        const teacher =
          teacherSnapshot.exists()
            ? teacherSnapshot.data()
            : {};

        const infrastructure =
          infrastructureSnapshot.exists()
            ? infrastructureSnapshot.data()
            : {};


        setReport({

          students:
            Number(
              student.totalStudents
            ) || 0,

          boys:
            Number(
              student.totalBoys
            ) || 0,

          girls:
            Number(
              student.totalGirls
            ) || 0,

          teachers:
            Number(
              teacher.totalTeachers
            ) || 0,

          maleTeachers:
            Number(
              teacher.maleTeachers
            ) || 0,

          femaleTeachers:
            Number(
              teacher.femaleTeachers
            ) || 0,

          classrooms:
            Number(
              infrastructure.classrooms
            ) || 0,

          usableClassrooms:
            Number(
              infrastructure
                .usableClassrooms
            ) || 0,

          principalName:
            String(
              profile.principalName ??
              ""
            ),

          village:
            String(
              profile.village ??
              ""
            ),
        });

      }

      catch (error) {

        console.error(
          "Report load error:",
          error
        );

      }

      finally {

        setLoading(false);

      }

    };


    loadReport();

  }, [
    navigate,
    schoolId,
  ]);


  if (!school) {

    return (
      <div className="director-editor-page">
        <h2>School not found.</h2>
      </div>
    );

  }


  return (

    <div className="director-editor-page">

      <div className="director-editor-top">

        <button
          type="button"
          onClick={() =>
            navigate(
              `/director/manage-data/${school.id}`
            )
          }
        >
          <ArrowLeft size={18} />
          Back
        </button>


        <div>

          <span>
            SCHOOL REPORT
          </span>

          <h1>
            {school.name}
          </h1>

          <p>
            UDISE: {school.udise}
          </p>

        </div>

      </div>


      {loading ? (

        <div className="director-editor-loading">
          Loading report...
        </div>

      ) : (

        <>

          <section className="director-report-school">

            <School size={30} />

            <div>

              <span>
                SCHOOL
              </span>

              <h2>
                {school.name}
              </h2>

              <p>
                UDISE: {school.udise}
              </p>

            </div>

          </section>


          <section className="director-report-grid">

            <ReportCard
              icon={
                <GraduationCap
                  size={25}
                />
              }
              label="Total Students"
              value={
                report.students
              }
              note={`Boys ${report.boys} • Girls ${report.girls}`}
            />


            <ReportCard
              icon={
                <Users size={25} />
              }
              label="Total Teachers"
              value={
                report.teachers
              }
              note={`Male ${report.maleTeachers} • Female ${report.femaleTeachers}`}
            />


            <ReportCard
              icon={
                <Building2
                  size={25}
                />
              }
              label="Classrooms"
              value={
                report.classrooms
              }
              note={`${report.usableClassrooms} usable classrooms`}
            />

          </section>


          <section className="director-report-details">

            <h2>
              School Information
            </h2>


            <div>

              <article>
                <span>
                  Principal
                </span>

                <strong>
                  {report.principalName ||
                    "Not entered"}
                </strong>
              </article>


              <article>
                <span>
                  Village
                </span>

                <strong>
                  {report.village ||
                    "Not entered"}
                </strong>
              </article>


              <article>
                <span>
                  UDISE
                </span>

                <strong>
                  {school.udise}
                </strong>
              </article>

            </div>

          </section>

        </>

      )}

    </div>

  );

}


interface ReportCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  note: string;
}


function ReportCard({
  icon,
  label,
  value,
  note,
}: ReportCardProps) {

  return (

    <article className="director-report-card">

      <div>
        {icon}
      </div>

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        {note}
      </small>

    </article>

  );

}