import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  ArrowLeft,
  BookOpen,
  Building2,
  CheckCircle2,
  GraduationCap,
  MapPin,
  School,
  Users,
  XCircle,
} from "lucide-react";

import { db } from "../firebase/firebase";
import { schools } from "../data/schools";

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

interface StudentInfo {
  totalStudents: number;
  totalBoys: number;
  totalGirls: number;

  classes: {
    className: string;
    boys: number;
    girls: number;
  }[];
}

interface TeacherInfo {
  totalTeachers: number;
  maleTeachers: number;
  femaleTeachers: number;

  permanentTeachers: number;
  contractTeachers: number;
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

export default function SchoolDetails() {
  const { id } = useParams();

  const school =
    schools.find(
      (item) =>
        item.id === Number(id)
    );

  const [profile, setProfile] =
    useState<SchoolProfileData>({});

  const [students, setStudents] =
    useState<StudentInfo>({
      totalStudents: 0,
      totalBoys: 0,
      totalGirls: 0,
      classes: [],
    });

  const [teachers, setTeachers] =
    useState<TeacherInfo>({
      totalTeachers: 0,
      maleTeachers: 0,
      femaleTeachers: 0,
      permanentTeachers: 0,
      contractTeachers: 0,
    });

  const [
    infrastructure,
    setInfrastructure,
  ] =
    useState<InfrastructureInfo>({
      classrooms: 0,
      usableClassrooms: 0,
      facilities: {},
    });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadSchool = async () => {
      if (!school) {
        setLoading(false);
        return;
      }

      try {
        const schoolId =
          String(school.id);

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

        if (
          profileSnapshot.exists()
        ) {
          setProfile(
            profileSnapshot.data()
          );
        }

        if (
          studentSnapshot.exists()
        ) {
          const data =
            studentSnapshot.data();

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

            classes:
              Array.isArray(
                data.classes
              )
                ? data.classes
                : [],
          });
        }

        if (
          teacherSnapshot.exists()
        ) {
          const data =
            teacherSnapshot.data();

          setTeachers({
            totalTeachers:
              Number(
                data.totalTeachers
              ) || 0,

            maleTeachers:
              Number(
                data.maleTeachers
              ) || 0,

            femaleTeachers:
              Number(
                data.femaleTeachers
              ) || 0,

            permanentTeachers:
              Number(
                data.permanentTeachers
              ) || 0,

            contractTeachers:
              Number(
                data.contractTeachers
              ) || 0,
          });
        }

        if (
          infrastructureSnapshot.exists()
        ) {
          const data =
            infrastructureSnapshot.data();

          setInfrastructure({
            classrooms:
              Number(
                data.classrooms
              ) || 0,

            usableClassrooms:
              Number(
                data.usableClassrooms
              ) || 0,

            facilities:
              data.facilities || {},

            remarks:
              data.remarks || "",
          });
        }
      } catch (err) {
        console.error(
          "Public School Details Error:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    loadSchool();
  }, [school]);

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

  if (loading) {
    return (
      <div className="school-details-loading">
        Loading School Information...
      </div>
    );
  }

  const displayName =
    profile.schoolName ||
    school.name;

  const displayUdise =
    profile.udise ||
    school.udise;

  return (
    <div className="public-school-page">

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

      <div className="school-details-container">

        <div className="school-public-stats">

          <div>
            <GraduationCap />

            <section>
              <span>
                Students
              </span>

              <strong>
                {
                  students.totalStudents
                }
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
                {
                  teachers.totalTeachers
                }
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
                {
                  infrastructure.classrooms
                }
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
                {profile.medium ||
                  "--"}
              </strong>
            </section>
          </div>

        </div>

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

          <div className="student-public-summary">

            <div>
              <span>
                Boys
              </span>

              <strong>
                {
                  students.totalBoys
                }
              </strong>
            </div>

            <div>
              <span>
                Girls
              </span>

              <strong>
                {
                  students.totalGirls
                }
              </strong>
            </div>

            <div>
              <span>
                Total
              </span>

              <strong>
                {
                  students.totalStudents
                }
              </strong>
            </div>

          </div>

          {students.classes.length >
            0 && (

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
                            {
                              item.boys
                            }
                          </td>

                          <td>
                            {
                              item.girls
                            }
                          </td>

                          <td>
                            <strong>
                              {Number(
                                item.boys
                              ) +
                                Number(
                                  item.girls
                                )}
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
              value={String(
                teachers.totalTeachers
              )}
            />

            <InfoItem
              label="Male Teachers"
              value={String(
                teachers.maleTeachers
              )}
            />

            <InfoItem
              label="Female Teachers"
              value={String(
                teachers.femaleTeachers
              )}
            />

            <InfoItem
              label="Permanent Teachers"
              value={String(
                teachers.permanentTeachers
              )}
            />

            <InfoItem
              label="Contract / Temporary"
              value={String(
                teachers.contractTeachers
              )}
            />

          </div>

        </section>

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