import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  ArrowLeft,
  Eye,
  GraduationCap,
  School,
  Users,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { db } from "../firebase/firebase";
import { schools } from "../data/schools";
import { getSession } from "../utils/session";

interface SchoolStats {
  schoolId: string;
  students: number;
  teachers: number;
}

export default function AllSchoolData() {
  const navigate = useNavigate();

  const [stats, setStats] =
    useState<SchoolStats[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadData = async () => {
      const session = getSession();

      if (
        !session ||
        session.role !== "director"
      ) {
        navigate("/login");
        return;
      }

      try {
        const [
          studentSnapshot,
          teacherSnapshot,
        ] = await Promise.all([
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
        ]);

        const records =
          schools.map((school) => {
            const studentDoc =
              studentSnapshot.docs.find(
                (document) =>
                  document.id ===
                  String(school.id)
              );

            const teacherDoc =
              teacherSnapshot.docs.find(
                (document) =>
                  document.id ===
                  String(school.id)
              );

            return {
              schoolId:
                String(school.id),

              students:
                Number(
                  studentDoc?.data()
                    .totalStudents
                ) || 0,

              teachers:
                Number(
                  teacherDoc?.data()
                    .totalTeachers
                ) || 0,
            };
          });

        setStats(records);
      } catch (err) {
        console.error(
          "All School Data Error:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const findStats = (
    schoolId: number
  ) =>
    stats.find(
      (item) =>
        item.schoolId ===
        String(schoolId)
    );

  return (
    <div className="director-management-page">
      <header className="director-management-header">
        <div>
          <Link
            to="/director"
            className="director-back-link"
          >
            <ArrowLeft size={17} />
            Director Dashboard
          </Link>

          <span>
            CENTRE INFORMATION
          </span>

          <h1>
            All School Data
          </h1>

          <p>
            View information submitted
            by each school.
          </p>
        </div>

        <School size={38} />
      </header>

      <main className="director-management-content">
        <div className="director-table-wrapper">
          <table className="director-table">
            <thead>
              <tr>
                <th>#</th>
                <th>School</th>
                <th>UDISE</th>
                <th>
                  <GraduationCap
                    size={14}
                  />
                  Students
                </th>
                <th>
                  <Users
                    size={14}
                  />
                  Teachers
                </th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    Loading school data...
                  </td>
                </tr>
              ) : (
                schools.map(
                  (school) => {
                    const schoolStats =
                      findStats(
                        school.id
                      );

                    return (
                      <tr
                        key={
                          school.id
                        }
                      >
                        <td>
                          {school.id}
                        </td>

                        <td>
                          <strong>
                            {
                              school.name
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            school.udise
                          }
                        </td>

                        <td>
                          {
                            schoolStats?.students ||
                            0
                          }
                        </td>

                        <td>
                          {
                            schoolStats?.teachers ||
                            0
                          }
                        </td>

                        <td>
                          <Link
                            to={`/director/school/${school.id}`}
                            className="view-school-button"
                          >
                            <Eye
                              size={
                                15
                              }
                            />
                            View Data
                          </Link>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}