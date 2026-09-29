import {
  ArrowLeft,
  Building2,
  ClipboardList,
  FileBarChart,
  GraduationCap,
  School,
  UserRound,
  Users,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  schools,
} from "../data/schools";

import {
  getSession,
} from "../utils/session";


export default function DirectorSchoolData() {

  const navigate = useNavigate();

  const {
    schoolId,
  } = useParams();


  const session =
    getSession();


  /* =======================================================
     SECURITY
  ======================================================= */

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

    return null;

  }


  /* =======================================================
     FIND SCHOOL
  ======================================================= */

  const school =
    schools.find(
      (item) =>
        String(item.id) ===
        String(schoolId)
    );


  if (!school) {

    return (

      <div className="director-school-control-page">

        <div className="director-data-empty">

          <School size={45} />

          <h2>
            School Not Found
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/director/manage-data"
              )
            }
          >
            Back to Schools
          </button>

        </div>

      </div>

    );

  }


  return (

    <div className="director-school-control-page">


      {/* TOP */}

      <section className="director-school-control-header">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/director/manage-data"
            )
          }
        >

          <ArrowLeft size={18} />

          All Schools

        </button>


        <div>

          <span>
            DIRECTOR SCHOOL MANAGEMENT
          </span>

          <h1>
            {school.name}
          </h1>

          <p>
            UDISE: {school.udise}
          </p>

        </div>

      </section>


      {/* INFORMATION */}

      <section className="director-selected-school-info">

        <div>

          <Building2
            size={32}
          />

        </div>


        <section>

          <span>
            SELECTED SCHOOL
          </span>

          <strong>
            {school.name}
          </strong>

          <small>
            School ID: {school.id}
            {" • "}
            UDISE: {school.udise}
          </small>

        </section>

      </section>


      {/* HEADING */}

      <div className="director-control-heading">

        <span>
          DATA MANAGEMENT
        </span>

        <h2>
          What do you want to manage?
        </h2>

        <p>
          Changes made here will use
          the same school data used by
          the Principal panel.
        </p>

      </div>


      {/* OPTIONS */}

      <section className="director-school-control-grid">


        <ManagementCard
          icon={
            <School size={25} />
          }
          title="School Profile"
          description="Update school profile and basic information."
          onClick={() =>
            navigate(
              `/director/manage-data/${school.id}/profile`
            )
          }
        />


        <ManagementCard
          icon={
            <GraduationCap
              size={25}
            />
          }
          title="Student Summary"
          description="Update class-wise boys, girls and student totals."
          onClick={() =>
            navigate(
              `/director/manage-data/${school.id}/students`
            )
          }
        />


        <ManagementCard
          icon={
            <Users size={25} />
          }
          title="Student Records"
          description="Add and manage individual student records."
          onClick={() =>
            navigate(
              `/director/manage-data/${school.id}/student-records`
            )
          }
        />


        <ManagementCard
          icon={
            <UserRound size={25} />
          }
          title="Teacher Data"
          description="Update teachers and staff information."
          onClick={() =>
            navigate(
              `/director/manage-data/${school.id}/teachers`
            )
          }
        />


        <ManagementCard
          icon={
            <Building2 size={25} />
          }
          title="Infrastructure"
          description="Manage classrooms and school facilities."
          onClick={() =>
            navigate(
              `/director/manage-data/${school.id}/infrastructure`
            )
          }
        />


        <ManagementCard
          icon={
            <FileBarChart
              size={25}
            />
          }
          title="School Report"
          description="View consolidated information for this school."
          onClick={() =>
            navigate(
              `/director/manage-data/${school.id}/report`
            )
          }
        />


        <ManagementCard
          icon={
            <ClipboardList
              size={25}
            />
          }
          title="Back to Director"
          description="Return to the main Director Dashboard."
          onClick={() =>
            navigate(
              "/director"
            )
          }
        />


      </section>


    </div>

  );

}


/* =========================================================
   CARD
========================================================= */

interface ManagementCardProps {

  icon: React.ReactNode;

  title: string;

  description: string;

  onClick: () => void;

}


function ManagementCard({
  icon,
  title,
  description,
  onClick,
}: ManagementCardProps) {

  return (

    <button
      type="button"
      className="director-management-card"
      onClick={onClick}
    >

      <div>
        {icon}
      </div>


      <section>

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </section>


      <span className="director-management-arrow">
        →
      </span>

    </button>

  );

}