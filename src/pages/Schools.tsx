import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  MapPin,
  Search,
  School,
} from "lucide-react";

import { schools } from "../data/schools";

export default function Schools() {
  const [search, setSearch] = useState("");

  const filteredSchools = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return schools;
    }

    return schools.filter((school) => {
      return (
        school.name.toLowerCase().includes(value) ||
        school.udise.toLowerCase().includes(value)
      );
    });
  }, [search]);

  return (
    <div className="schools-page">

      {/* PAGE HERO */}

      <section className="schools-hero">
        <div className="schools-hero-content">

          <div className="schools-hero-icon">
            <School size={34} />
          </div>

          <span>
            SCHOOL DIRECTORY
          </span>

          <h1>
            Schools Under Kattipar Centre
          </h1>

          <p>
            View school information and UDISE details
            of schools under Samuh Sadhan Kendra Kattipar.
          </p>

        </div>
      </section>

      {/* CONTENT */}

      <section className="schools-content">

        <div className="schools-heading-row">

          <div>
            <span className="section-small-label">
              SCHOOL DIRECTORY
            </span>

            <h2>
              Registered Schools
            </h2>

            <p>
              Latest information available for Kattipar Centre.
            </p>
          </div>

          <div className="schools-count">
            <strong>18</strong>

            <span>
              Total Schools
            </span>
          </div>

        </div>

        {/* INFO MESSAGE */}

        <div className="schools-information-note">
          <Building2 size={20} />

          <div>
            <strong>
              UDISE School Information
            </strong>

            <p>
              The latest report indicates 18 schools under
              Kattipar Centre. Currently, {schools.length} school
              UDISE records are available in the portal.
            </p>
          </div>
        </div>

        {/* SEARCH */}

        <div className="school-search-area">

          <Search size={20} />

          <input
            type="text"
            placeholder="Search school name or UDISE code..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              onClick={() => setSearch("")}
            >
              Clear
            </button>
          )}

        </div>

        {/* RESULT COUNT */}

        <div className="school-result-info">
          Showing{" "}
          <strong>
            {filteredSchools.length}
          </strong>{" "}
          school
          {filteredSchools.length !== 1
            ? "s"
            : ""}
        </div>

        {/* SCHOOL CARDS */}

        {filteredSchools.length > 0 ? (

          <div className="schools-grid">

            {filteredSchools.map(
              (school) => (

                <div
                  className="school-directory-card"
                  key={school.id}
                >

                  <div className="school-card-top">

                    <div className="school-number">
                      {String(
                        school.id
                      ).padStart(2, "0")}
                    </div>

                    <span className="school-status">
                      Active
                    </span>

                  </div>

                  <div className="school-directory-icon">
                    <School size={27} />
                  </div>

                  <h3>
                    {school.name}
                  </h3>

                  <div className="school-location">
                    <MapPin size={15} />

                    Kattipar Centre
                  </div>

                  <div className="school-udise-box">

                    <span>
                      UDISE CODE
                    </span>

                    <strong>
                      {school.udise}
                    </strong>

                  </div>

                  <Link
                    to={`/schools/${school.id}`}
                    className="school-details-button"
                  >
                    View School Details

                    <ArrowRight
                      size={16}
                    />
                  </Link>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="no-schools-found">

            <Search size={40} />

            <h3>
              No school found
            </h3>

            <p>
              Try searching with another
              school name or UDISE code.
            </p>

            <button
              onClick={() =>
                setSearch("")
              }
            >
              Show All Schools
            </button>

          </div>

        )}

      </section>

    </div>
  );
}