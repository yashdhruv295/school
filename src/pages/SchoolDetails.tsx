import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  ArrowLeft,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  MapPin,
  School,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import { db } from "../firebase/firebase";
import { schools } from "../data/schools";


/* =========================================================
   TYPES
========================================================= */

interface SchoolProfileData {
  schoolName?: string;
  udise?: string;

  principalName?: string;

  village?: string;
  cluster?: string;
  block?: string;
  district?: string;
  state?: string;

  schoolType?: string;
  management?: string;
  category?: string;
  medium?: string;

  lowestClass?: string;
  highestClass?: string;

  establishmentYear?: string;

  address?: string;
  pinCode?: string;

  phone?: string;
  email?: string;
}


interface StudentClassData {
  className: string;
  boys: number;
  girls: number;
}


interface StudentInfo {
  totalStudents: number;
  totalBoys: number;
  totalGirls: number;

  classes: StudentClassData[];
}


interface TeacherInfo {
  totalTeachers: number;
  maleTeachers: number;
  femaleTeachers: number;

  permanentTeachers: number;
  contractTeachers: number;
}


/* =========================================================
   INDIVIDUAL TEACHER
========================================================= */

interface TeacherRecord {
  id: string;

  teacherName: string;
  role: string;

  schoolId: string;
  schoolName: string;
  udise: string;

  joiningDate: string;

  /*
    NEW:
    One teacher can teach multiple classes.

    Example:
    ["5", "6", "7"]
  */
  teachingClasses: string[];

  subject: string;
}


interface InfrastructureInfo {
  classrooms: number;

  usableClassrooms: number;

  facilities: Record<
    string,
    boolean
  >;

  remarks?: string;
}


/* =========================================================
   FACILITY NAMES
========================================================= */

const facilityNames:
  Record<string, string> = {

    drinkingWater:
      "Drinking Water",

    electricity:
      "Electricity",

    boysToilet:
      "Boys Toilet",

    girlsToilet:
      "Girls Toilet",

    library:
      "Library",

    computer:
      "Computer Facility",

    internet:
      "Internet Facility",

    playground:
      "Playground",

    digitalClassroom:
      "Digital Classroom",

    boundaryWall:
      "Boundary Wall",

    ramp:
      "Ramp for CWSN",

    handwash:
      "Hand Wash Facility",
  };


/* =========================================================
   COMPONENT
========================================================= */

export default function SchoolDetails() {

  const { id } =
    useParams();


  const school =
    schools.find(
      (item) =>
        item.id === Number(id)
    );


  /* =======================================================
     STATES
  ======================================================= */

  const [
    profile,
    setProfile,
  ] =
    useState<SchoolProfileData>({});


  const [
    students,
    setStudents,
  ] =
    useState<StudentInfo>({
      totalStudents: 0,
      totalBoys: 0,
      totalGirls: 0,
      classes: [],
    });


  const [
    teachers,
    setTeachers,
  ] =
    useState<TeacherInfo>({
      totalTeachers: 0,
      maleTeachers: 0,
      femaleTeachers: 0,
      permanentTeachers: 0,
      contractTeachers: 0,
    });


  const [
    teacherRecords,
    setTeacherRecords,
  ] =
    useState<TeacherRecord[]>([]);


  const [
    infrastructure,
    setInfrastructure,
  ] =
    useState<InfrastructureInfo>({
      classrooms: 0,
      usableClassrooms: 0,
      facilities: {},
      remarks: "",
    });


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  /* =======================================================
     LOAD SCHOOL
  ======================================================= */

  useEffect(() => {

    const loadSchool =
      async () => {

        if (!school) {

          setLoading(false);

          return;
        }


        try {

          setLoading(true);


          const schoolId =
            String(school.id);


          /* ===============================================
             LOAD NORMAL SCHOOL DOCUMENTS
          =============================================== */

          const [
            profileSnapshot,
            studentSnapshot,
            teacherSnapshot,
            infrastructureSnapshot,
          ] =
            await Promise.all([

              getDoc(
                doc(
                  db,
                  "schoolProfiles",
                  schoolId
                )
              ),

              getDoc(
                doc(
                  db,
                  "studentData",
                  schoolId
                )
              ),

              getDoc(
                doc(
                  db,
                  "teacherData",
                  schoolId
                )
              ),

              getDoc(
                doc(
                  db,
                  "infrastructureData",
                  schoolId
                )
              ),

            ]);


          /* ===============================================
             SCHOOL PROFILE
          =============================================== */

          if (
            profileSnapshot.exists()
          ) {

            const data =
              profileSnapshot.data();


            setProfile({
              schoolName:
                String(
                  data.schoolName ?? ""
                ),

              udise:
                String(
                  data.udise ?? ""
                ),

              principalName:
                String(
                  data.principalName ?? ""
                ),

              village:
                String(
                  data.village ?? ""
                ),

              cluster:
                String(
                  data.cluster ?? ""
                ),

              block:
                String(
                  data.block ?? ""
                ),

              district:
                String(
                  data.district ?? ""
                ),

              state:
                String(
                  data.state ?? ""
                ),

              schoolType:
                String(
                  data.schoolType ?? ""
                ),

              management:
                String(
                  data.management ?? ""
                ),

              category:
                String(
                  data.category ?? ""
                ),

              medium:
                String(
                  data.medium ?? ""
                ),

              lowestClass:
                String(
                  data.lowestClass ?? ""
                ),

              highestClass:
                String(
                  data.highestClass ?? ""
                ),

              establishmentYear:
                String(
                  data.establishmentYear ?? ""
                ),

              address:
                String(
                  data.address ?? ""
                ),

              pinCode:
                String(
                  data.pinCode ?? ""
                ),

              phone:
                String(
                  data.phone ?? ""
                ),

              email:
                String(
                  data.email ?? ""
                ),
            });

          } else {

            setProfile({});

          }


          /* ===============================================
             STUDENT SUMMARY
          =============================================== */

          if (
            studentSnapshot.exists()
          ) {

            const data =
              studentSnapshot.data();


            const classes:
              StudentClassData[] =
              Array.isArray(
                data.classes
              )
                ? data.classes.map(
                    (
                      item:
                        Record<
                          string,
                          unknown
                        >
                    ) => ({
                      className:
                        String(
                          item.className ??
                          ""
                        ),

                      boys:
                        Number(
                          item.boys
                        ) || 0,

                      girls:
                        Number(
                          item.girls
                        ) || 0,
                    })
                  )
                : [];


            setStudents({

              totalStudents:
                Number(
                  data.totalStudents
                ) || 0,

              totalBoys:
                Number(
                  data.totalBoys
                ) || 0,

              totalGirls:
                Number(
                  data.totalGirls
                ) || 0,

              classes,

            });

          } else {

            setStudents({
              totalStudents: 0,
              totalBoys: 0,
              totalGirls: 0,
              classes: [],
            });

          }


          /* ===============================================
             TEACHER SUMMARY
          =============================================== */

          if (
            teacherSnapshot.exists()
          ) {

            const data =
              teacherSnapshot.data();


            const male =
              Number(
                data.maleTeachers
              ) || 0;


            const female =
              Number(
                data.femaleTeachers
              ) || 0;


            setTeachers({

              totalTeachers:
                Number(
                  data.totalTeachers
                ) ||
                male + female,

              maleTeachers:
                male,

              femaleTeachers:
                female,

              permanentTeachers:
                Number(
                  data.permanentTeachers
                ) || 0,

              contractTeachers:
                Number(
                  data.contractTeachers
                ) || 0,

            });

          } else {

            setTeachers({
              totalTeachers: 0,
              maleTeachers: 0,
              femaleTeachers: 0,
              permanentTeachers: 0,
              contractTeachers: 0,
            });

          }


          /* ===============================================
             INFRASTRUCTURE
          =============================================== */

          if (
            infrastructureSnapshot.exists()
          ) {

            const data =
              infrastructureSnapshot.data();


            const facilities:
              Record<string, boolean> =
              {};

            if (
              data.facilities &&
              typeof data.facilities ===
                "object"
            ) {

              Object.entries(
                data.facilities
              ).forEach(
                ([key, value]) => {

                  facilities[key] =
                    Boolean(value);

                }
              );

            }


            setInfrastructure({

              classrooms:
                Number(
                  data.classrooms
                ) || 0,

              usableClassrooms:
                Number(
                  data.usableClassrooms
                ) || 0,

              facilities,

              remarks:
                String(
                  data.remarks ?? ""
                ),

            });

          } else {

            setInfrastructure({
              classrooms: 0,
              usableClassrooms: 0,
              facilities: {},
              remarks: "",
            });

          }


          /* ===============================================
             LOAD INDIVIDUAL TEACHERS
          =============================================== */

          const teacherRecordsQuery =
            query(

              collection(
                db,
                "teachers"
              ),

              where(
                "schoolId",
                "==",
                schoolId
              )

            );


          const teacherRecordsSnapshot =
            await getDocs(
              teacherRecordsQuery
            );


          const teacherList:
            TeacherRecord[] =
            teacherRecordsSnapshot.docs.map(
              (teacherDocument) => {

                const data =
                  teacherDocument.data();


                /* =========================================
                   MULTIPLE CLASS SUPPORT

                   NEW FIRESTORE:
                   teachingClasses:
                   ["5", "6", "7"]

                   OLD FIRESTORE:
                   teachingClass: "5"

                   Both formats work.
                ========================================= */

                let teachingClasses:
                  string[] = [];


                if (
                  Array.isArray(
                    data.teachingClasses
                  )
                ) {

                  teachingClasses =
                    data.teachingClasses
                      .map(
                        (value) =>
                          String(value)
                      )
                      .filter(
                        (value) =>
                          value.trim() !== ""
                      );

                } else if (
                  data.teachingClass
                ) {

                  const oldValue =
                    String(
                      data.teachingClass
                    );


                  /*
                    Older version may have:
                    "Multiple Classes"

                    It is not an actual class number,
                    therefore don't convert that text
                    into a class tag.
                  */

                  if (
                    oldValue !==
                    "Multiple Classes"
                  ) {

                    teachingClasses = [
                      oldValue,
                    ];

                  }

                }


                /* =========================================
                   SORT CLASSES
                ========================================= */

                teachingClasses.sort(
                  (a, b) => {

                    const numberA =
                      Number(a);

                    const numberB =
                      Number(b);


                    if (
                      Number.isNaN(
                        numberA
                      ) ||
                      Number.isNaN(
                        numberB
                      )
                    ) {

                      return a.localeCompare(
                        b
                      );

                    }


                    return (
                      numberA -
                      numberB
                    );

                  }
                );


                /* =========================================
                   REMOVE DUPLICATES
                ========================================= */

                teachingClasses = [
                  ...new Set(
                    teachingClasses
                  ),
                ];


                return {

                  id:
                    teacherDocument.id,

                  teacherName:
                    String(
                      data.teacherName ??
                      ""
                    ),

                  role:
                    String(
                      data.role ??
                      ""
                    ),

                  schoolId:
                    String(
                      data.schoolId ??
                      schoolId
                    ),

                  schoolName:
                    String(
                      data.schoolName ??
                      school.name
                    ),

                  udise:
                    String(
                      data.udise ??
                      school.udise
                    ),

                  joiningDate:
                    String(
                      data.joiningDate ??
                      ""
                    ),

                  teachingClasses,

                  subject:
                    String(
                      data.subject ??
                      ""
                    ),

                };

              }
            );


          /* ===============================================
             SORT TEACHERS
          =============================================== */

          teacherList.sort(
            (a, b) =>
              a.teacherName.localeCompare(
                b.teacherName
              )
          );


          setTeacherRecords(
            teacherList
          );

        } catch (err) {

          console.error(
            "Public School Details Error:",
            err
          );

          setTeacherRecords([]);

        } finally {

          setLoading(false);

        }

      };


    loadSchool();

  }, [school]);


  /* =======================================================
     SCHOOL NOT FOUND
  ======================================================= */

  if (!school) {

    return (

      <div className="school-not-found">

        <School size={50} />


        <h1>
          School Not Found
        </h1>


        <Link to="/schools">

          Back to School Directory

        </Link>

      </div>

    );

  }


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <div className="school-details-loading">

        Loading School Information...

      </div>

    );

  }


  /* =======================================================
     DISPLAY VALUES
  ======================================================= */

  const displayName =
    profile.schoolName ||
    school.name;


  const displayUdise =
    profile.udise ||
    school.udise;


  /* =======================================================
     UI
  ======================================================= */

  return (

    <div className="public-school-page">


      {/* ===================================================
          HERO
      =================================================== */}

      <section className="school-details-hero">

        <div className="school-details-hero-inner">


          <Link
            to="/schools"
            className="school-details-back"
          >

            <ArrowLeft size={17} />

            School Directory

          </Link>


          <span>
            SCHOOL INFORMATION
          </span>


          <h1>
            {displayName}
          </h1>


          <p>

            UDISE Code:{" "}

            <strong>
              {displayUdise}
            </strong>

          </p>


        </div>

      </section>


      {/* ===================================================
          MAIN CONTAINER
      =================================================== */}

      <div className="school-details-container">


        {/* =================================================
            TOP STATS
        ================================================= */}

        <div className="school-public-stats">


          <div>

            <GraduationCap />

            <section>

              <span>
                Students
              </span>

              <strong>
                {students.totalStudents}
              </strong>

            </section>

          </div>


          <div>

            <Users />

            <section>

              <span>
                Teachers
              </span>

              <strong>
                {teachers.totalTeachers}
              </strong>

            </section>

          </div>


          <div>

            <Building2 />

            <section>

              <span>
                Classrooms
              </span>

              <strong>
                {infrastructure.classrooms}
              </strong>

            </section>

          </div>


          <div>

            <BookOpen />

            <section>

              <span>
                Medium
              </span>

              <strong className="text-stat">
                {profile.medium || "--"}
              </strong>

            </section>

          </div>


        </div>


        {/* =================================================
            SCHOOL INFORMATION
        ================================================= */}

        <section className="public-school-section">


          <div className="public-school-title">

            <School />

            <div>

              <h2>
                School Information
              </h2>

              <p>
                General information
                about the school.
              </p>

            </div>

          </div>


          <div className="school-information-grid">


            <InfoItem
              label="Principal"
              value={
                profile.principalName
              }
            />


            <InfoItem
              label="Village"
              value={
                profile.village
              }
            />


            <InfoItem
              label="Cluster / Centre"
              value={
                profile.cluster
              }
            />


            <InfoItem
              label="Block / Taluka"
              value={
                profile.block
              }
            />


            <InfoItem
              label="District"
              value={
                profile.district
              }
            />


            <InfoItem
              label="State"
              value={
                profile.state
              }
            />


            <InfoItem
              label="School Type"
              value={
                profile.schoolType
              }
            />


            <InfoItem
              label="Management"
              value={
                profile.management
              }
            />


            <InfoItem
              label="Category"
              value={
                profile.category
              }
            />


            <InfoItem
              label="Medium"
              value={
                profile.medium
              }
            />


            <InfoItem
              label="Classes"
              value={
                profile.lowestClass &&
                profile.highestClass

                  ? `Class ${profile.lowestClass} to ${profile.highestClass}`

                  : ""
              }
            />


            <InfoItem
              label="Established"
              value={
                profile.establishmentYear
              }
            />


          </div>


          {/* ADDRESS */}

          {profile.address && (

            <div className="school-address-box">

              <MapPin />

              <div>

                <strong>
                  Address
                </strong>

                <p>

                  {profile.address}

                  {profile.pinCode
                    ? ` - ${profile.pinCode}`
                    : ""}

                </p>

              </div>

            </div>

          )}


        </section>


        {/* =================================================
            STUDENT ENROLLMENT
        ================================================= */}

        <section className="public-school-section">


          <div className="public-school-title">

            <GraduationCap />

            <div>

              <h2>
                Student Enrollment
              </h2>

              <p>
                Class-wise student
                information.
              </p>

            </div>

          </div>


          {/* STUDENT SUMMARY */}

          <div className="student-public-summary">


            <div>

              <span>
                Boys
              </span>

              <strong>
                {students.totalBoys}
              </strong>

            </div>


            <div>

              <span>
                Girls
              </span>

              <strong>
                {students.totalGirls}
              </strong>

            </div>


            <div>

              <span>
                Total
              </span>

              <strong>
                {students.totalStudents}
              </strong>

            </div>


          </div>


          {/* CLASS TABLE */}

          {students.classes.length > 0 && (

            <div className="public-table-wrapper">

              <table className="public-data-table">

                <thead>

                  <tr>

                    <th>
                      Class
                    </th>

                    <th>
                      Boys
                    </th>

                    <th>
                      Girls
                    </th>

                    <th>
                      Total
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {students.classes

                    .filter(
                      (item) =>
                        Number(
                          item.boys
                        ) > 0 ||
                        Number(
                          item.girls
                        ) > 0
                    )

                    .map(
                      (item) => (

                        <tr
                          key={
                            item.className
                          }
                        >

                          <td>

                            Class{" "}

                            {
                              item.className
                            }

                          </td>


                          <td>
                            {item.boys}
                          </td>


                          <td>
                            {item.girls}
                          </td>


                          <td>

                            <strong>

                              {
                                Number(
                                  item.boys
                                ) +
                                Number(
                                  item.girls
                                )
                              }

                            </strong>

                          </td>

                        </tr>

                      )
                    )}

                </tbody>

              </table>

            </div>

          )}


        </section>


        {/* =================================================
            TEACHING STAFF SUMMARY
        ================================================= */}

        <section className="public-school-section">


          <div className="public-school-title">

            <Users />

            <div>

              <h2>
                Teaching Staff
              </h2>

              <p>
                Teacher information.
              </p>

            </div>

          </div>


          <div className="school-information-grid">


            <InfoItem
              label="Total Teachers"
              value={
                String(
                  teachers.totalTeachers
                )
              }
            />


            <InfoItem
              label="Male Teachers"
              value={
                String(
                  teachers.maleTeachers
                )
              }
            />


            <InfoItem
              label="Female Teachers"
              value={
                String(
                  teachers.femaleTeachers
                )
              }
            />


            <InfoItem
              label="Permanent Teachers"
              value={
                String(
                  teachers.permanentTeachers
                )
              }
            />


            <InfoItem
              label="Contract / Temporary"
              value={
                String(
                  teachers.contractTeachers
                )
              }
            />


          </div>


        </section>


        {/* =================================================
            INDIVIDUAL TEACHER DETAILS
        ================================================= */}

        <section className="public-school-section">


          <div className="public-school-title">

            <UserRound />

            <div>

              <h2>
                Teacher Details
              </h2>

              <p>
                Individual teaching staff
                information.
              </p>

            </div>

          </div>


          {/* ===============================================
              NO TEACHERS
          =============================================== */}

          {teacherRecords.length === 0 ? (

            <div className="public-teacher-empty">

              <UserRound size={38} />

              <strong>
                Teacher records are not available yet.
              </strong>

              <span>
                Teacher details will appear here after
                they are added by the school.
              </span>

            </div>

          ) : (

            <>


              {/* ===========================================
                  TEACHER CARDS
              =========================================== */}

              <div className="public-teacher-grid">

                {teacherRecords.map(
                  (teacher) => (

                    <article
                      key={teacher.id}
                      className="public-teacher-card"
                    >


                      {/* AVATAR */}

                      <div className="public-teacher-avatar">

                        <UserRound size={26} />

                      </div>


                      {/* NAME + ROLE */}

                      <div className="public-teacher-card-heading">

                        <h3>
                          {teacher.teacherName}
                        </h3>

                        <span>
                          {teacher.role ||
                            "Teacher"}
                        </span>

                      </div>


                      {/* SCHOOL */}

                      <div className="public-teacher-school">

                        <School size={15} />

                        <span>
                          {teacher.schoolName}
                        </span>

                      </div>


                      {/* DETAILS */}

                      <div className="public-teacher-info">


                        {/* =================================
                            MULTIPLE TEACHING CLASSES
                        ================================= */}

                        <div>

                          <GraduationCap
                            size={17}
                          />

                          <section>

                            <span>
                              Teaching Classes
                            </span>


                            {teacher
                              .teachingClasses
                              .length > 0 ? (

                              <div className="public-teacher-class-tags">

                                {teacher
                                  .teachingClasses
                                  .map(
                                    (
                                      className
                                    ) => (

                                      <strong
                                        key={
                                          className
                                        }
                                      >
                                        Class{" "}
                                        {
                                          className
                                        }
                                      </strong>

                                    )
                                  )}

                              </div>

                            ) : (

                              <strong>
                                --
                              </strong>

                            )}


                          </section>

                        </div>


                        {/* SUBJECT */}

                        <div>

                          <BookOpen size={17} />

                          <section>

                            <span>
                              Subject
                            </span>

                            <strong>
                              {teacher.subject ||
                                "--"}
                            </strong>

                          </section>

                        </div>


                        {/* JOINING DATE */}

                        <div>

                          <CalendarDays
                            size={17}
                          />

                          <section>

                            <span>
                              Job Starting Date
                            </span>

                            <strong>
                              {formatDate(
                                teacher.joiningDate
                              )}
                            </strong>

                          </section>

                        </div>


                      </div>


                    </article>

                  )
                )}

              </div>


              {/* ===========================================
                  TOTAL INDIVIDUAL RECORDS
              =========================================== */}

              <div className="public-teacher-record-count">

                <Users size={18} />

                <span>

                  Individual Teacher Records:{" "}

                  <strong>
                    {teacherRecords.length}
                  </strong>

                </span>

              </div>


            </>

          )}


        </section>


        {/* =================================================
            INFRASTRUCTURE
        ================================================= */}

        <section className="public-school-section">


          <div className="public-school-title">

            <Building2 />

            <div>

              <h2>
                Infrastructure
              </h2>

              <p>
                School facilities and
                infrastructure.
              </p>

            </div>

          </div>


          {/* CLASSROOMS */}

          <div className="classroom-info">


            <div>

              <span>
                Total Classrooms
              </span>

              <strong>
                {
                  infrastructure.classrooms
                }
              </strong>

            </div>


            <div>

              <span>
                Usable Classrooms
              </span>

              <strong>
                {
                  infrastructure.usableClassrooms
                }
              </strong>

            </div>


          </div>


          {/* FACILITIES */}

          <div className="public-facility-grid">


            {Object.entries(
              facilityNames
            ).map(
              ([key, label]) => {

                const available =
                  Boolean(
                    infrastructure
                      .facilities[key]
                  );


                return (

                  <div
                    key={key}
                    className={
                      available
                        ? "public-facility available"
                        : "public-facility unavailable"
                    }
                  >

                    {available ? (

                      <CheckCircle2 />

                    ) : (

                      <XCircle />

                    )}


                    <span>
                      {label}
                    </span>

                  </div>

                );

              }
            )}


          </div>


          {/* REMARKS */}

          {infrastructure.remarks && (

            <div className="infrastructure-remarks">

              <strong>
                Remarks
              </strong>

              <p>
                {
                  infrastructure.remarks
                }
              </p>

            </div>

          )}


        </section>


      </div>

    </div>

  );

}


/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {

  return (

    <div className="school-info-item">

      <span>
        {label}
      </span>

      <strong>
        {value || "--"}
      </strong>

    </div>

  );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
  value: string
) {

  if (!value) {
    return "--";
  }


  const parts =
    value.split("-");


  if (
    parts.length !== 3
  ) {

    return value;

  }


  return `${parts[2]}/${parts[1]}/${parts[0]}`;

}