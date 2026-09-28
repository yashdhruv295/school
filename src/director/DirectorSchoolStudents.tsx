import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  ArrowLeft,
  Building2,
  GraduationCap,
  School,
  Search,
  UserRound,
  Users,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { db } from "../firebase/firebase";

import {
  schools,
} from "../data/schools";

import {
  getSession,
} from "../utils/session";


/* =========================================================
   TYPES
========================================================= */

interface Student {

  id: string;

  schoolId: string;

  schoolName: string;

  udise: string;

  name: string;

  dob: string;

  age: number;

  gender: string;

  className: string;

  rollNumber: string;

  admissionNumber: string;

  parentName: string;

  mobile: string;

  address: string;

}


interface SchoolSummary {

  teachers: number;

  classrooms: number;

}


/* =========================================================
   HELPER
========================================================= */

function numberValue(
  value: unknown
): number {

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;

}


/* =========================================================
   COMPONENT
========================================================= */

export default function DirectorSchoolStudents() {

  const {
    id,
  } = useParams();


  const navigate =
    useNavigate();


  const session =
    getSession();


  const [students, setStudents] =
    useState<Student[]>([]);


  const [summary, setSummary] =
    useState<SchoolSummary>({

      teachers: 0,

      classrooms: 0,

    });


  const [search, setSearch] =
    useState("");


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  /* =========================================================
     FIND SCHOOL
  ========================================================= */

  const school =
    schools.find(
      (item) =>
        String(item.id) ===
        String(id)
    );


  /* =========================================================
     DIRECTOR AUTHORIZATION
  ========================================================= */

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


  /* =========================================================
     LOAD SCHOOL PRIVATE DATA
  ========================================================= */

  useEffect(() => {

    if (
      !session ||
      session.role !== "director" ||
      !school
    ) {

      return;

    }


    let cancelled = false;


    const loadSchoolData =
      async () => {

        setLoading(true);

        setError("");


        let teachers = 0;

        let classrooms = 0;


        /* =====================================================
           STUDENTS
        ===================================================== */

        try {

          const studentQuery =
            query(

              collection(
                db,
                "students"
              ),

              where(
                "schoolId",
                "==",
                String(
                  school.id
                )
              )

            );


          const studentSnapshot =
            await getDocs(
              studentQuery
            );


          const records: Student[] =
            studentSnapshot.docs.map(
              (studentDocument) => {

                const data =
                  studentDocument.data();


                return {

                  id:
                    studentDocument.id,


                  schoolId:
                    String(
                      data.schoolId ||
                      ""
                    ),


                  schoolName:
                    String(
                      data.schoolName ||
                      school.name
                    ),


                  udise:
                    String(
                      data.udise ||
                      school.udise
                    ),


                  name:
                    String(
                      data.name ||
                      ""
                    ),


                  dob:
                    String(
                      data.dob ||
                      ""
                    ),


                  age:
                    numberValue(
                      data.age
                    ),


                  gender:
                    String(
                      data.gender ||
                      ""
                    ),


                  className:
                    String(
                      data.className ||
                      ""
                    ),


                  rollNumber:
                    String(
                      data.rollNumber ||
                      ""
                    ),


                  admissionNumber:
                    String(
                      data.admissionNumber ||
                      ""
                    ),


                  parentName:
                    String(
                      data.parentName ||
                      ""
                    ),


                  mobile:
                    String(
                      data.mobile ||
                      ""
                    ),


                  address:
                    String(
                      data.address ||
                      ""
                    ),

                };

              }
            );


          /*
            Class first,
            then Roll Number
          */

          records.sort(
            (
              a,
              b
            ) => {

              const classDifference =
                numberValue(
                  a.className
                ) -
                numberValue(
                  b.className
                );


              if (
                classDifference !== 0
              ) {

                return classDifference;

              }


              return (
                numberValue(
                  a.rollNumber
                ) -
                numberValue(
                  b.rollNumber
                )
              );

            }
          );


          if (!cancelled) {

            setStudents(
              records
            );

          }

        }

        catch (error) {

          console.error(
            "Director student loading error:",
            error
          );


          if (!cancelled) {

            setError(
              "Student information load nahi ho saki."
            );

          }

        }


        /* =====================================================
           TEACHERS
        ===================================================== */

        try {

          const teacherQuery =
            query(

              collection(
                db,
                "teacherData"
              ),

              where(
                "schoolId",
                "==",
                String(
                  school.id
                )
              )

            );


          const teacherSnapshot =
            await getDocs(
              teacherQuery
            );


          teacherSnapshot.forEach(
            (teacherDocument) => {

              const data =
                teacherDocument.data();


              let schoolTeachers =
                numberValue(
                  data.totalTeachers
                );


              if (
                schoolTeachers === 0
              ) {

                schoolTeachers =

                  numberValue(
                    data.maleTeachers
                  ) +

                  numberValue(
                    data.femaleTeachers
                  );

              }


              teachers +=
                schoolTeachers;

            }
          );

        }

        catch (error) {

          console.error(
            "Teacher loading error:",
            error
          );

        }


        /* =====================================================
           INFRASTRUCTURE
        ===================================================== */

        try {

          const infrastructureQuery =
            query(

              collection(
                db,
                "infrastructureData"
              ),

              where(
                "schoolId",
                "==",
                String(
                  school.id
                )
              )

            );


          const infrastructureSnapshot =
            await getDocs(
              infrastructureQuery
            );


          infrastructureSnapshot.forEach(
            (
              infrastructureDocument
            ) => {

              const data =
                infrastructureDocument.data();


              classrooms +=

                numberValue(
                  data.classrooms
                ) ||

                numberValue(
                  data.totalClassrooms
                );

            }
          );

        }

        catch (error) {

          console.error(
            "Infrastructure loading error:",
            error
          );

        }


        /* =====================================================
           FINISH
        ===================================================== */

        if (!cancelled) {

          setSummary({

            teachers,

            classrooms,

          });


          setLoading(false);

        }

      };


    loadSchoolData();


    return () => {

      cancelled = true;

    };

  }, [
    school?.id,
    session?.id,
    session?.role,
  ]);


  /* =========================================================
     FILTER
  ========================================================= */

  const filteredStudents =
    useMemo(
      () => {

        const value =
          search
            .trim()
            .toLowerCase();


        if (!value) {

          return students;

        }


        return students.filter(
          (student) => {

            return (

              student.name
                .toLowerCase()
                .includes(
                  value
                ) ||

              student.className
                .toLowerCase()
                .includes(
                  value
                ) ||

              student.rollNumber
                .toLowerCase()
                .includes(
                  value
                ) ||

              student.admissionNumber
                .toLowerCase()
                .includes(
                  value
                ) ||

              student.parentName
                .toLowerCase()
                .includes(
                  value
                )

            );

          }
        );

      },
      [
        students,
        search,
      ]
    );


  /* =========================================================
     COUNTS
  ========================================================= */

  const boys =
    students.filter(
      (student) =>
        student.gender
          .toLowerCase() ===
        "male"
    ).length;


  const girls =
    students.filter(
      (student) =>
        student.gender
          .toLowerCase() ===
        "female"
    ).length;


  /* =========================================================
     SECURITY
  ========================================================= */

  if (
    !session ||
    session.role !== "director"
  ) {

    return null;

  }


  /* =========================================================
     SCHOOL NOT FOUND
  ========================================================= */

  if (!school) {

    return (

      <div className="director-school-private">

        <div
          className="private-empty"
        >

          <School
            size={45}
          />

          <h2>
            School Not Found
          </h2>


          <p>
            Invalid school ID.
          </p>


          <Link
            to="/director/schools"
          >
            Back to Manage Schools
          </Link>

        </div>

      </div>

    );

  }


  /* =========================================================
     UI
  ========================================================= */

  return (

    <div className="director-school-private">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="director-school-private-header">


        <Link
          to="/director/schools"
        >

          <ArrowLeft
            size={18}
          />

          Manage Schools

        </Link>


        <span>
          PRIVATE SCHOOL INFORMATION
        </span>


        <h1>
          {school.name}
        </h1>


        <p>

          UDISE:{" "}

          {school.udise}

        </p>


      </header>



      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="director-school-private-content">


        {/* ===================================================
            SUMMARY
        =================================================== */}

        <section className="director-private-summary">


          {/* STUDENTS */}

          <div>

            <Users
              size={25}
            />

            <span>
              Students
            </span>

            <strong>

              {loading
                ? "..."
                : students.length}

            </strong>

          </div>



          {/* BOYS */}

          <div>

            <GraduationCap
              size={25}
            />

            <span>
              Boys
            </span>

            <strong>

              {loading
                ? "..."
                : boys}

            </strong>

          </div>



          {/* GIRLS */}

          <div>

            <GraduationCap
              size={25}
            />

            <span>
              Girls
            </span>

            <strong>

              {loading
                ? "..."
                : girls}

            </strong>

          </div>



          {/* TEACHERS */}

          <div>

            <UserRound
              size={25}
            />

            <span>
              Teachers
            </span>

            <strong>

              {loading
                ? "..."
                : summary.teachers}

            </strong>

          </div>



          {/* CLASSROOMS */}

          <div>

            <Building2
              size={25}
            />

            <span>
              Classrooms
            </span>

            <strong>

              {loading
                ? "..."
                : summary.classrooms}

            </strong>

          </div>


        </section>



        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (

          <div className="private-message">

            {error}

          </div>

        )}



        {/* ===================================================
            SEARCH
        =================================================== */}

        <section className="private-student-toolbar">

          <div className="private-search">

            <Search
              size={18}
            />


            <input

              type="search"

              placeholder="Search student, class, roll number, admission number..."

              value={
                search
              }

              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }

            />

          </div>

        </section>



        {/* ===================================================
            STUDENT TABLE
        =================================================== */}

        <section className="director-private-table">


          <div className="director-private-table-heading">

            <div>

              <span>
                PRIVATE STUDENT INFORMATION
              </span>

              <h2>
                Student Records
              </h2>

            </div>


            <strong>

              {
                filteredStudents.length
              }{" "}

              Students

            </strong>

          </div>



          {/* LOADING */}

          {loading ? (

            <div className="private-empty">

              <Users
                size={40}
              />

              <h3>
                Loading...
              </h3>

              <p>
                Student information
                load ho rahi hai.
              </p>

            </div>

          ) : filteredStudents.length === 0 ? (


            /* EMPTY */

            <div className="private-empty">

              <Users
                size={40}
              />

              <h3>
                No Student Records
              </h3>

              <p>

                Is school ke Principal
                ne abhi individual
                student records add
                nahi kiye hain.

              </p>

            </div>

          ) : (


            /* TABLE */

            <div className="private-table-wrapper">

              <table>


                <thead>

                  <tr>

                    <th>
                      Student
                    </th>

                    <th>
                      Class
                    </th>

                    <th>
                      Roll No.
                    </th>

                    <th>
                      Gender
                    </th>

                    <th>
                      DOB
                    </th>

                    <th>
                      Age
                    </th>

                    <th>
                      Admission No.
                    </th>

                    <th>
                      Parent
                    </th>

                    <th>
                      Mobile
                    </th>

                    <th>
                      Address
                    </th>

                  </tr>

                </thead>



                <tbody>

                  {filteredStudents.map(
                    (student) => (

                      <tr
                        key={
                          student.id
                        }
                      >


                        {/* NAME */}

                        <td>

                          <strong>

                            {student.name ||
                              "-"}

                          </strong>

                        </td>



                        {/* CLASS */}

                        <td>

                          {student.className
                            ? `Class ${student.className}`
                            : "-"}

                        </td>



                        {/* ROLL */}

                        <td>

                          {student.rollNumber ||
                            "-"}

                        </td>



                        {/* GENDER */}

                        <td>

                          {student.gender ||
                            "-"}

                        </td>



                        {/* DOB */}

                        <td>

                          {student.dob ||
                            "-"}

                        </td>



                        {/* AGE */}

                        <td>

                          {student.age ||
                            "-"}

                        </td>



                        {/* ADMISSION */}

                        <td>

                          {student.admissionNumber ||
                            "-"}

                        </td>



                        {/* PARENT */}

                        <td>

                          {student.parentName ||
                            "-"}

                        </td>



                        {/* MOBILE */}

                        <td>

                          {student.mobile ||
                            "-"}

                        </td>



                        {/* ADDRESS */}

                        <td>

                          {student.address ||
                            "-"}

                        </td>


                      </tr>

                    )
                  )}

                </tbody>


              </table>

            </div>

          )}


        </section>


      </main>


    </div>

  );

}