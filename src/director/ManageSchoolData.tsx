import {
  Building2,
  ChevronRight,
  Database,
  GraduationCap,
  Search,
  School,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  schools,
} from "../data/schools";

import {
  getSession,
} from "../utils/session";


export default function ManageSchoolData() {

  const navigate = useNavigate();

  const session = getSession();

  const [
    search,
    setSearch,
  ] = useState("");


  /* =======================================================
     SECURITY
  ======================================================= */

  if (
    !session ||
    session.role !== "director"
  ) {

    return (
      <div className="director-data-security">

        <h2>
          Access Denied
        </h2>

        <p>
          Director login is required.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/login",
              {
                replace: true,
              }
            )
          }
        >
          Go to Login
        </button>

      </div>
    );

  }


  /* =======================================================
     FILTER
  ======================================================= */

  const filteredSchools =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();


      if (!value) {

        return schools;

      }


      return schools.filter(
        (school) => {

          return (
            school.name
              .toLowerCase()
              .includes(value) ||

            school.udise
              .toLowerCase()
              .includes(value)
          );

        }
      );

    }, [
      search,
    ]);


  return (

    <div className="director-school-data-page">


      {/* HEADER */}

      <section className="director-data-header">

        <div>

          <span>
            DIRECTOR CONTROL PANEL
          </span>

          <h1>
            Manage School Data
          </h1>

          <p>
            Select any school to enter,
            view or update its information.
          </p>

        </div>


        <button
          type="button"
          onClick={() =>
            navigate("/director")
          }
        >
          ← Dashboard
        </button>

      </section>


      {/* SUMMARY */}

      <section className="director-data-summary">

        <article>

          <div>
            <School size={24} />
          </div>

          <section>

            <span>
              Total Schools
            </span>

            <strong>
              {schools.length}
            </strong>

          </section>

        </article>


        <article>

          <div>
            <Database size={24} />
          </div>

          <section>

            <span>
              Data Management
            </span>

            <strong>
              Full Access
            </strong>

          </section>

        </article>


        <article>

          <div>
            <GraduationCap size={24} />
          </div>

          <section>

            <span>
              Director
            </span>

            <strong>
              {session.name ||
                "Director"}
            </strong>

          </section>

        </article>

      </section>


      {/* SEARCH */}

      <section className="director-data-search">

        <Search size={20} />

        <input
          type="text"
          placeholder="Search school name or UDISE..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />

      </section>


      {/* SCHOOL GRID */}

      <section className="director-school-selection-grid">

        {filteredSchools.map(
          (school) => (

            <article
              key={school.id}
              className="director-school-selection-card"
            >

              <div className="director-school-selection-icon">

                <Building2
                  size={25}
                />

              </div>


              <div className="director-school-selection-content">

                <span>
                  SCHOOL {school.id}
                </span>

                <h2>
                  {school.name}
                </h2>

                <p>
                  UDISE: {school.udise}
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/director/manage-data/${school.id}`
                  )
                }
              >

                Manage Data

                <ChevronRight
                  size={17}
                />

              </button>

            </article>

          )
        )}

      </section>


      {filteredSchools.length === 0 && (

        <div className="director-data-empty">

          <School size={40} />

          <h3>
            No school found
          </h3>

          <p>
            Try another school name
            or UDISE number.
          </p>

        </div>

      )}


    </div>

  );

}