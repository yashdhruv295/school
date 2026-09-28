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
  Eye,
  Search,
  School,
  UserPlus,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { db } from "../firebase/firebase";
import { schools } from "../data/schools";
import { getSession } from "../utils/session";

interface PrincipalAssignment {
  id: string;
  name: string;
  username: string;
  schoolId: string;
  active: boolean;
}

export default function ManageSchools() {
  const navigate = useNavigate();

  const [
    principalAssignments,
    setPrincipalAssignments,
  ] = useState<
    PrincipalAssignment[]
  >([]);

  const [search, setSearch] =
    useState("");

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
        const principalQuery = query(
          collection(db, "users"),
          where(
            "role",
            "==",
            "principal"
          )
        );

        const snapshot =
          await getDocs(
            principalQuery
          );

        const assignments =
          snapshot.docs.map(
            (document) => {
              const data =
                document.data();

              return {
                id:
                  document.id,

                name:
                  data.name || "",

                username:
                  data.username || "",

                schoolId:
                  String(
                    data.schoolId ||
                      ""
                  ),

                active:
                  data.active !==
                  false,
              };
            }
          );

        setPrincipalAssignments(
          assignments
        );
      } catch (err) {
        console.error(
          "School Assignment Error:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const filteredSchools =
    useMemo(() => {
      const value =
        search
          .toLowerCase()
          .trim();

      if (!value) {
        return schools;
      }

      return schools.filter(
        (school) =>
          school.name
            .toLowerCase()
            .includes(value) ||
          school.udise.includes(
            value
          )
      );
    }, [search]);

  const getPrincipal = (
    schoolId: number
  ) =>
    principalAssignments.find(
      (principal) =>
        principal.schoolId ===
        String(schoolId)
    );

  const assignedCount =
    schools.filter(
      (school) =>
        Boolean(
          getPrincipal(
            school.id
          )
        )
    ).length;

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
            SCHOOL MANAGEMENT
          </span>

          <h1>
            Manage Schools
          </h1>

          <p>
            View schools and Principal
            assignments.
          </p>
        </div>

        <School size={38} />
      </header>

      <main className="director-management-content">
        <div className="management-summary">
          <div>
            <span>
              Reported Total Schools
            </span>

            <strong>18</strong>
          </div>

          <div>
            <span>
              Available School Records
            </span>

            <strong>
              {schools.length}
            </strong>
          </div>

          <div>
            <span>
              Principals Appointed
            </span>

            <strong>
              {assignedCount}
            </strong>
          </div>

          <div>
            <span>
              Awaiting Appointment
            </span>

            <strong>
              {schools.length -
                assignedCount}
            </strong>
          </div>
        </div>

        <div className="management-toolbar">
          <div className="management-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search school or UDISE..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />
          </div>

          <Link
            to="/director/create-principal"
            className="director-primary-button"
          >
            <UserPlus size={17} />
            Appoint Principal
          </Link>
        </div>

        <div className="director-table-wrapper">
          <table className="director-table">
            <thead>
              <tr>
                <th>#</th>
                <th>School Name</th>
                <th>UDISE</th>
                <th>Principal</th>
                <th>Username</th>
                <th>Status</th>
                <th>School Data</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    Loading schools...
                  </td>
                </tr>
              ) : (
                filteredSchools.map(
                  (school) => {
                    const principal =
                      getPrincipal(
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
                          {principal
                            ? principal.name
                            : "Not Appointed"}
                        </td>

                        <td>
                          {principal
                            ? principal.username
                            : "--"}
                        </td>

                        <td>
                          {principal ? (
                            <span
                              className={
                                principal.active
                                  ? "status-active"
                                  : "status-disabled"
                              }
                            >
                              {principal.active
                                ? "Active"
                                : "Disabled"}
                            </span>
                          ) : (
                            <span className="school-unassigned">
                              Awaiting
                            </span>
                          )}
                        </td>

                        <td>
                          <Link
                            className="view-school-button"
                            to={`/director/school/${school.id}`}
                          >
                            <Eye
                              size={
                                15
                              }
                            />
                            View
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

        <p className="school-record-note">
          Latest total provided for the
          centre is 18 schools. The
          current verified list contains
          {` ${schools.length} `}
          school records. The missing
          school's name/UDISE should be
          added only after the correct
          record is available.
        </p>
      </main>
    </div>
  );
}