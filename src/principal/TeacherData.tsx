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
  CheckCircle2,
  Save,
  School,
  Users,
} from "lucide-react";

import { db } from "../firebase/firebase";
import { getSession } from "../utils/session";

export default function TeacherData() {
  const navigate = useNavigate();

  const [schoolId, setSchoolId] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [udise, setUdise] = useState("");

  const [maleTeachers, setMaleTeachers] = useState(0);
  const [femaleTeachers, setFemaleTeachers] = useState(0);

  const [permanentTeachers, setPermanentTeachers] =
    useState(0);

  const [contractTeachers, setContractTeachers] =
    useState(0);

  const [headTeacherName, setHeadTeacherName] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalTeachers =
    maleTeachers + femaleTeachers;

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
      setHeadTeacherName(session.name || "");

      try {
        const snapshot = await getDoc(
          doc(db, "teacherData", session.schoolId)
        );

        if (snapshot.exists()) {
          const data = snapshot.data();

          setMaleTeachers(
            Number(data.maleTeachers) || 0
          );

          setFemaleTeachers(
            Number(data.femaleTeachers) || 0
          );

          setPermanentTeachers(
            Number(data.permanentTeachers) || 0
          );

          setContractTeachers(
            Number(data.contractTeachers) || 0
          );

          setHeadTeacherName(
            data.headTeacherName ||
              session.name ||
              ""
          );
        }
      } catch (err) {
        console.error("Teacher load error:", err);
        setError("Unable to load teacher data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const saveData = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!schoolId) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await setDoc(
        doc(db, "teacherData", schoolId),
        {
          schoolId,
          schoolName,
          udise,

          headTeacherName,

          maleTeachers,
          femaleTeachers,
          totalTeachers,

          permanentTeachers,
          contractTeachers,

          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setSuccess("Teacher data saved successfully.");
    } catch (err) {
      console.error("Teacher save error:", err);

      setError(
        "Unable to save teacher data. Please check Firestore."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="principal-page-loading">
        Loading Teacher Data...
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

          <h1>Teacher Data</h1>

          <p>
            Update teaching staff information.
          </p>
        </div>

        <div className="principal-header-icon">
          <Users size={31} />
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

        <div className="data-summary-grid">
          <div>
            <span>Male Teachers</span>
            <strong>{maleTeachers}</strong>
          </div>

          <div>
            <span>Female Teachers</span>
            <strong>{femaleTeachers}</strong>
          </div>

          <div>
            <span>Total Teachers</span>
            <strong>{totalTeachers}</strong>
          </div>
        </div>

        <form onSubmit={saveData}>
          <section className="principal-form-section">
            <div className="principal-form-section-title">
              <div>
                <Users />
              </div>

              <section>
                <h2>Teaching Staff</h2>
                <p>
                  Enter teacher information for the school.
                </p>
              </section>
            </div>

            <div className="principal-form-grid">
              <div className="principal-field principal-field-full">
                <label>
                  Principal / Head Teacher Name
                </label>

                <input
                  type="text"
                  value={headTeacherName}
                  onChange={(e) =>
                    setHeadTeacherName(e.target.value)
                  }
                />
              </div>

              <div className="principal-field">
                <label>Male Teachers</label>

                <input
                  type="number"
                  min="0"
                  value={maleTeachers}
                  onChange={(e) =>
                    setMaleTeachers(
                      Math.max(
                        0,
                        Number(e.target.value) || 0
                      )
                    )
                  }
                />
              </div>

              <div className="principal-field">
                <label>Female Teachers</label>

                <input
                  type="number"
                  min="0"
                  value={femaleTeachers}
                  onChange={(e) =>
                    setFemaleTeachers(
                      Math.max(
                        0,
                        Number(e.target.value) || 0
                      )
                    )
                  }
                />
              </div>

              <div className="principal-field">
                <label>Permanent Teachers</label>

                <input
                  type="number"
                  min="0"
                  value={permanentTeachers}
                  onChange={(e) =>
                    setPermanentTeachers(
                      Math.max(
                        0,
                        Number(e.target.value) || 0
                      )
                    )
                  }
                />
              </div>

              <div className="principal-field">
                <label>
                  Contract / Temporary Teachers
                </label>

                <input
                  type="number"
                  min="0"
                  value={contractTeachers}
                  onChange={(e) =>
                    setContractTeachers(
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

          <div className="principal-save-area">
            <button
              type="submit"
              disabled={saving}
            >
              <Save size={18} />

              {saving
                ? "Saving..."
                : "Save Teacher Data"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}