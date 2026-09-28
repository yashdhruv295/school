import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Save,
  School,
} from "lucide-react";

import { db } from "../firebase/firebase";
import { getSession } from "../utils/session";

interface Facility {
  key: string;
  label: string;
  available: boolean;
}

const defaultFacilities: Facility[] = [
  {
    key: "drinkingWater",
    label: "Drinking Water",
    available: false,
  },
  {
    key: "electricity",
    label: "Electricity",
    available: false,
  },
  {
    key: "boysToilet",
    label: "Boys Toilet",
    available: false,
  },
  {
    key: "girlsToilet",
    label: "Girls Toilet",
    available: false,
  },
  {
    key: "library",
    label: "Library",
    available: false,
  },
  {
    key: "computer",
    label: "Computer Facility",
    available: false,
  },
  {
    key: "internet",
    label: "Internet Facility",
    available: false,
  },
  {
    key: "playground",
    label: "Playground",
    available: false,
  },
  {
    key: "digitalClassroom",
    label: "Digital Classroom",
    available: false,
  },
  {
    key: "boundaryWall",
    label: "Boundary Wall",
    available: false,
  },
  {
    key: "ramp",
    label: "Ramp for CWSN",
    available: false,
  },
  {
    key: "handwash",
    label: "Hand Wash Facility",
    available: false,
  },
];

export default function Infrastructure() {
  const navigate = useNavigate();

  const [schoolId, setSchoolId] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [udise, setUdise] = useState("");

  const [classrooms, setClassrooms] = useState(0);
  const [usableClassrooms, setUsableClassrooms] =
    useState(0);

  const [facilities, setFacilities] =
    useState<Facility[]>(defaultFacilities);

  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const session = getSession();

      if (!session || session.role !== "principal") {
        navigate("/login");
        return;
      }

      if (!session.schoolId) {
        setError("No school is assigned to this account.");
        setLoading(false);
        return;
      }

      setSchoolId(session.schoolId);
      setSchoolName(session.schoolName || "");
      setUdise(session.udise || "");

      try {
        const snapshot = await getDoc(
          doc(
            db,
            "infrastructureData",
            session.schoolId
          )
        );

        if (snapshot.exists()) {
          const data = snapshot.data();

          setClassrooms(
            Number(data.classrooms) || 0
          );

          setUsableClassrooms(
            Number(data.usableClassrooms) || 0
          );

          setRemarks(data.remarks || "");

          if (data.facilities) {
            setFacilities(
              defaultFacilities.map((facility) => ({
                ...facility,
                available:
                  Boolean(
                    data.facilities[
                      facility.key
                    ]
                  ),
              }))
            );
          }
        }
      } catch (err) {
        console.error(
          "Infrastructure load error:",
          err
        );

        setError(
          "Unable to load infrastructure data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const toggleFacility = (key: string) => {
    setFacilities((current) =>
      current.map((facility) =>
        facility.key === key
          ? {
              ...facility,
              available: !facility.available,
            }
          : facility
      )
    );

    setSuccess("");
  };

  const saveData = async () => {
    if (!schoolId) return;

    const facilityObject =
      facilities.reduce<Record<string, boolean>>(
        (result, facility) => {
          result[facility.key] =
            facility.available;

          return result;
        },
        {}
      );

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await setDoc(
        doc(
          db,
          "infrastructureData",
          schoolId
        ),
        {
          schoolId,
          schoolName,
          udise,

          classrooms,
          usableClassrooms,

          facilities: facilityObject,

          remarks,

          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setSuccess(
        "Infrastructure data saved successfully."
      );
    } catch (err) {
      console.error(
        "Infrastructure save error:",
        err
      );

      setError(
        "Unable to save infrastructure data."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="principal-page-loading">
        Loading Infrastructure...
      </div>
    );
  }

  return (
    <div className="principal-data-page">
      <header className="principal-data-header">
        <div>
          <Link
            to="/principal"
            className="principal-back-link"
          >
            <ArrowLeft size={17} />
            Principal Dashboard
          </Link>

          <span className="principal-page-label">
            SCHOOL MANAGEMENT
          </span>

          <h1>Infrastructure</h1>

          <p>
            Update school building and facility data.
          </p>
        </div>

        <div className="principal-header-icon">
          <Building2 size={31} />
        </div>
      </header>

      <main className="principal-data-container">
        <div className="assigned-school-banner">
          <div>
            <School />
          </div>

          <section>
            <span>ASSIGNED SCHOOL</span>
            <strong>{schoolName}</strong>
            <small>UDISE: {udise}</small>
          </section>
        </div>

        {error && (
          <div className="principal-form-error">
            {error}
          </div>
        )}

        {success && (
          <div className="principal-form-success">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        <section className="principal-form-section">
          <div className="principal-form-section-title">
            <div>
              <Building2 />
            </div>

            <section>
              <h2>Building Information</h2>
              <p>
                Enter classroom and facility information.
              </p>
            </section>
          </div>

          <div className="principal-form-grid">
            <div className="principal-field">
              <label>Total Classrooms</label>

              <input
                type="number"
                min="0"
                value={classrooms}
                onChange={(e) =>
                  setClassrooms(
                    Math.max(
                      0,
                      Number(e.target.value) || 0
                    )
                  )
                }
              />
            </div>

            <div className="principal-field">
              <label>Usable Classrooms</label>

              <input
                type="number"
                min="0"
                value={usableClassrooms}
                onChange={(e) =>
                  setUsableClassrooms(
                    Math.max(
                      0,
                      Number(e.target.value) || 0
                    )
                  )
                }
              />
            </div>
          </div>
        </section>

        <section className="principal-form-section">
          <div className="principal-form-section-title">
            <div>
              <School />
            </div>

            <section>
              <h2>School Facilities</h2>
              <p>
                Select all facilities available at the school.
              </p>
            </section>
          </div>

          <div className="facility-grid">
            {facilities.map((facility) => (
              <button
                key={facility.key}
                type="button"
                className={
                  facility.available
                    ? "facility-option selected"
                    : "facility-option"
                }
                onClick={() =>
                  toggleFacility(facility.key)
                }
              >
                <span className="facility-check">
                  {facility.available ? "✓" : ""}
                </span>

                {facility.label}
              </button>
            ))}
          </div>
        </section>

        <section className="principal-form-section">
          <div className="principal-field">
            <label>Infrastructure Remarks</label>

            <textarea
              rows={5}
              value={remarks}
              placeholder="Enter additional infrastructure information..."
              onChange={(e) =>
                setRemarks(e.target.value)
              }
            />
          </div>
        </section>

        <div className="principal-save-area">
          <button
            type="button"
            disabled={saving}
            onClick={saveData}
          >
            <Save size={18} />

            {saving
              ? "Saving..."
              : "Save Infrastructure"}
          </button>
        </div>
      </main>
    </div>
  );
}