import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  GraduationCap,
  School,
  Users,
  XCircle,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { db } from "../firebase/firebase";
import { schools } from "../data/schools";
import { getSession } from "../utils/session";

interface SchoolData {
  principalName: string;
  village: string;
  block: string;
  district: string;
  medium: string;
  category: string;
  management: string;
  lowestClass: string;
  highestClass: string;

  students: number;
  boys: number;
  girls: number;

  teachers: number;
  maleTeachers: number;
  femaleTeachers: number;

  classrooms: number;
  usableClassrooms: number;

  facilities:
    Record<string, boolean>;
}

const initialData: SchoolData = {
  principalName: "",
  village: "",
  block: "",
  district: "",
  medium: "",
  category: "",
  management: "",
  lowestClass: "",
  highestClass: "",

  students: 0,
  boys: 0,
  girls: 0,

  teachers: 0,
  maleTeachers: 0,
  femaleTeachers: 0,

  classrooms: 0,
  usableClassrooms: 0,

  facilities: {},
};

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
      "Internet",

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

export default function SchoolDataView() {
  const navigate = useNavigate();

  const { id } = useParams();

  const school = schools.find(
    (item) =>
      item.id === Number(id)
  );

  const [data, setData] =
    useState<SchoolData>(
      initialData
    );

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

        const profile =
          profileSnapshot.exists()
            ? profileSnapshot.data()
            : {};

        const students =
          studentSnapshot.exists()
            ? studentSnapshot.data()
            : {};

        const teachers =
          teacherSnapshot.exists()
            ? teacherSnapshot.data()
            : {};

        const infrastructure =
          infrastructureSnapshot.exists()
            ? infrastructureSnapshot.data()
            : {};

        setData({
          principalName:
            profile.principalName ||
            "",

          village:
            profile.village || "",

          block:
            profile.block || "",

          district:
            profile.district || "",

          medium:
            profile.medium || "",

          category:
            profile.category || "",

          management:
            profile.management || "",

          lowestClass:
            profile.lowestClass || "",

          highestClass:
            profile.highestClass || "",

          students:
            Number(
              students.totalStudents
            ) || 0,

          boys:
            Number(
              students.totalBoys
            ) || 0,

          girls:
            Number(
              students.totalGirls
            ) || 0,

          teachers:
            Number(
              teachers.totalTeachers
            ) || 0,

          maleTeachers:
            Number(
              teachers.maleTeachers
            ) || 0,

          femaleTeachers:
            Number(
              teachers.femaleTeachers
            ) || 0,

          classrooms:
            Number(
              infrastructure.classrooms
            ) || 0,

          usableClassrooms:
            Number(
              infrastructure.usableClassrooms
            ) || 0,

          facilities:
            infrastructure.facilities ||
            {},
        });
      } catch (err) {
        console.error(
          "Director School Data Error:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, school]);

  if (!school) {
    return (
      <div className="principal-page-loading">
        School not found.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="principal-page-loading">
        Loading School Data...
      </div>
    );
  }

  return (
    <div className="director-management-page">
      <header className="director-management-header">
        <div>
          <Link
            to="/director/schools"
            className="director-back-link"
          >
            <ArrowLeft size={17} />
            Manage Schools
          </Link>

          <span>
            SCHOOL INFORMATION
          </span>

          <h1>
            {school.name}
          </h1>

          <p>
            UDISE: {school.udise}
          </p>
        </div>

        <School size={38} />
      </header>

      <main className="director-management-content">
        <div className="director-school-stat-grid">
          <Stat
            icon={
              <GraduationCap />
            }
            label="Students"
            value={data.students}
            detail={`Boys ${data.boys} · Girls ${data.girls}`}
          />

          <Stat
            icon={<Users />}
            label="Teachers"
            value={data.teachers}
            detail={`Male ${data.maleTeachers} · Female ${data.femaleTeachers}`}
          />

          <Stat
            icon={<Building2 />}
            label="Classrooms"
            value={data.classrooms}
            detail={`Usable ${data.usableClassrooms}`}
          />
        </div>

        <section className="director-data-section">
          <h2>
            School Profile
          </h2>

          <div className="director-profile-grid">
            <Info
              label="Principal"
              value={
                data.principalName
              }
            />

            <Info
              label="Village"
              value={data.village}
            />

            <Info
              label="Block / Taluka"
              value={data.block}
            />

            <Info
              label="District"
              value={data.district}
            />

            <Info
              label="Medium"
              value={data.medium}
            />

            <Info
              label="Category"
              value={data.category}
            />

            <Info
              label="Management"
              value={
                data.management
              }
            />

            <Info
              label="Classes"
              value={
                data.lowestClass &&
                data.highestClass
                  ? `${data.lowestClass} to ${data.highestClass}`
                  : ""
              }
            />
          </div>
        </section>

        <section className="director-data-section">
          <h2>
            Infrastructure
          </h2>

          <div className="director-facility-grid">
            {Object.entries(
              facilityNames
            ).map(
              ([key, label]) => {
                const available =
                  Boolean(
                    data.facilities[
                      key
                    ]
                  );

                return (
                  <div
                    key={key}
                    className={
                      available
                        ? "director-facility available"
                        : "director-facility unavailable"
                    }
                  >
                    {available ? (
                      <CheckCircle2
                        size={17}
                      />
                    ) : (
                      <XCircle
                        size={17}
                      />
                    )}

                    {label}
                  </div>
                );
              }
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="director-school-stat">
      {icon}

      <span>{label}</span>

      <strong>{value}</strong>

      <small>{detail}</small>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="director-info-item">
      <span>{label}</span>

      <strong>
        {value || "--"}
      </strong>
    </div>
  );
}