import { useEffect, useMemo, useState } from "react";
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
  GraduationCap,
  Save,
  School,
} from "lucide-react";

import { db } from "../firebase/firebase";
import { getSession } from "../utils/session";

interface ClassData {
  className: string;
  boys: number;
  girls: number;
}

const defaultClasses: ClassData[] = Array.from(
  { length: 12 },
  (_, index) => ({
    className: String(index + 1),
    boys: 0,
    girls: 0,
  })
);

export default function StudentData() {
  const navigate = useNavigate();

  const [schoolId, setSchoolId] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [udise, setUdise] = useState("");

  const [classes, setClasses] =
    useState<ClassData[]>(defaultClasses);

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
          doc(db, "studentData", session.schoolId)
        );

        if (snapshot.exists()) {
          const data = snapshot.data();

          if (Array.isArray(data.classes)) {
            const savedClasses = data.classes as ClassData[];

            setClasses(
              defaultClasses.map((defaultItem) => {
                const saved = savedClasses.find(
                  (item) =>
                    String(item.className) ===
                    defaultItem.className
                );

                return saved
                  ? {
                      className: defaultItem.className,
                      boys: Number(saved.boys) || 0,
                      girls: Number(saved.girls) || 0,
                    }
                  : defaultItem;
              })
            );
          }
        }
      } catch (err) {
        console.error("Load Student Data Error:", err);
        setError("Unable to load student data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const totals = useMemo(() => {
    const boys = classes.reduce(
      (sum, item) => sum + Number(item.boys || 0),
      0
    );

    const girls = classes.reduce(
      (sum, item) => sum + Number(item.girls || 0),
      0
    );

    return {
      boys,
      girls,
      students: boys + girls,
    };
  }, [classes]);

  const updateCount = (
    index: number,
    field: "boys" | "girls",
    value: string
  ) => {
    const numberValue = Math.max(0, Number(value) || 0);

    setClasses((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: numberValue,
            }
          : item
      )
    );

    setSuccess("");
  };

  const saveData = async () => {
    if (!schoolId) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await setDoc(
        doc(db, "studentData", schoolId),
        {
          schoolId,
          schoolName,
          udise,

          classes,

          totalBoys: totals.boys,
          totalGirls: totals.girls,
          totalStudents: totals.students,

          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setSuccess("Student data saved successfully.");
    } catch (err) {
      console.error("Save Student Data Error:", err);

      setError(
        "Unable to save student data. Please check Firestore."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="principal-page-loading">
        Loading Student Data...
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

          <h1>Student Data</h1>

          <p>
            Enter class-wise boys and girls enrollment.
          </p>
        </div>

        <div className="principal-header-icon">
          <GraduationCap size={31} />
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
            <span>Total Boys</span>
            <strong>{totals.boys}</strong>
          </div>

          <div>
            <span>Total Girls</span>
            <strong>{totals.girls}</strong>
          </div>

          <div>
            <span>Total Students</span>
            <strong>{totals.students}</strong>
          </div>
        </div>

        <section className="principal-form-section">
          <div className="principal-form-section-title">
            <div>
              <GraduationCap />
            </div>

            <section>
              <h2>Class-wise Enrollment</h2>
              <p>
                Enter the current number of boys and girls.
              </p>
            </section>
          </div>

          <div className="student-table-wrapper">
            <table className="student-data-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Boys</th>
                  <th>Girls</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {classes.map((item, index) => (
                  <tr key={item.className}>
                    <td>
                      <strong>Class {item.className}</strong>
                    </td>

                    <td>
                      <input
                        type="number"
                        min="0"
                        value={item.boys}
                        onChange={(e) =>
                          updateCount(
                            index,
                            "boys",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        min="0"
                        value={item.girls}
                        onChange={(e) =>
                          updateCount(
                            index,
                            "girls",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <strong>
                        {item.boys + item.girls}
                      </strong>
                    </td>
                  </tr>
                ))}

                <tr className="student-total-row">
                  <td>
                    <strong>Total</strong>
                  </td>

                  <td>
                    <strong>{totals.boys}</strong>
                  </td>

                  <td>
                    <strong>{totals.girls}</strong>
                  </td>

                  <td>
                    <strong>{totals.students}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
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
              : "Save Student Data"}
          </button>
        </div>
      </main>
    </div>
  );
}