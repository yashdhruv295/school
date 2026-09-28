import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import {
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  KeyRound,
  School,
  UserPlus,
} from "lucide-react";

import { db } from "../firebase/firebase";
import { schools } from "../data/schools";
import { getSession } from "../utils/session";
import { hashPassword } from "../utils/password";

interface PrincipalAccount {
  schoolId?: string;
  active?: boolean;
}

interface Credentials {
  name: string;
  username: string;
  password: string;
  schoolName: string;
  udise: string;
}

export default function CreatePrincipal() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [schoolId, setSchoolId] = useState("");

  const [assignedSchoolIds, setAssignedSchoolIds] =
    useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [credentials, setCredentials] =
    useState<Credentials | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      const session = getSession();

      if (!session || session.role !== "director") {
        navigate("/login");
        return;
      }

      try {
        const principalQuery = query(
          collection(db, "users"),
          where("role", "==", "principal")
        );

        const snapshot = await getDocs(principalQuery);

        const ids: string[] = [];

        snapshot.forEach((document) => {
          const data =
            document.data() as PrincipalAccount;

          if (data.schoolId) {
            ids.push(String(data.schoolId));
          }
        });

        setAssignedSchoolIds(ids);
      } catch (err) {
        console.error(
          "Load principal assignments error:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [navigate]);

  const availableSchools = useMemo(
    () =>
      schools.filter(
        (school) =>
          !assignedSchoolIds.includes(
            String(school.id)
          )
      ),
    [assignedSchoolIds]
  );

  const selectedSchool = schools.find(
    (school) =>
      String(school.id) === schoolId
  );

  const createPrincipal = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setCredentials(null);

    const cleanName = name.trim();
    const cleanUsername =
      username.trim().toLowerCase();

    if (!cleanName) {
      setError("Principal name is required.");
      return;
    }

    if (!cleanUsername) {
      setError("Username is required.");
      return;
    }

    if (
      !/^[a-z0-9._-]{4,30}$/.test(
        cleanUsername
      )
    ) {
      setError(
        "Username must be 4-30 characters and can contain letters, numbers, dot, underscore or hyphen."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (!selectedSchool) {
      setError("Please select a school.");
      return;
    }

    try {
      setSaving(true);

      // Check duplicate username
      const usernameQuery = query(
        collection(db, "users"),
        where(
          "username",
          "==",
          cleanUsername
        )
      );

      const usernameSnapshot =
        await getDocs(usernameQuery);

      if (!usernameSnapshot.empty) {
        setError(
          "This username is already being used."
        );
        return;
      }

      // Avoid composite-index requirement:
      // fetch principals and check school assignment locally.
      const principalsQuery = query(
        collection(db, "users"),
        where("role", "==", "principal")
      );

      const principalsSnapshot =
        await getDocs(principalsQuery);

      let schoolAlreadyAssigned = false;

      principalsSnapshot.forEach(
        (document) => {
          const data = document.data();

          if (
            String(data.schoolId) ===
            String(selectedSchool.id)
          ) {
            schoolAlreadyAssigned = true;
          }
        }
      );

      if (schoolAlreadyAssigned) {
        setError(
          "A Principal is already assigned to this school."
        );
        return;
      }

      const passwordHash =
        await hashPassword(password);

      await addDoc(
        collection(db, "users"),
        {
          name: cleanName,
          username: cleanUsername,
          passwordHash,

          role: "principal",

          schoolId: String(
            selectedSchool.id
          ),

          schoolName:
            selectedSchool.name,

          udise:
            selectedSchool.udise,

          active: true,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      setCredentials({
        name: cleanName,
        username: cleanUsername,
        password,
        schoolName:
          selectedSchool.name,
        udise:
          selectedSchool.udise,
      });

      setAssignedSchoolIds(
        (current) => [
          ...current,
          String(selectedSchool.id),
        ]
      );

      setName("");
      setUsername("");
      setPassword("");
      setSchoolId("");
    } catch (err) {
      console.error(
        "Create Principal Error:",
        err
      );

      setError(
        "Unable to create Principal account. Check Firestore and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const copyCredentials = async () => {
    if (!credentials) return;

    const text = `
Principal Login Details

Principal: ${credentials.name}
School: ${credentials.schoolName}
UDISE: ${credentials.udise}
Username: ${credentials.username}
Temporary Password: ${credentials.password}
`.trim();

    try {
      await navigator.clipboard.writeText(
        text
      );
    } catch {
      alert(
        "Unable to copy automatically."
      );
    }
  };

  if (loading) {
    return (
      <div className="principal-page-loading">
        Loading...
      </div>
    );
  }

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

          <span>ACCOUNT MANAGEMENT</span>

          <h1>Appoint Principal</h1>

          <p>
            Create a login account and
            assign one school to the Principal.
          </p>
        </div>

        <UserPlus size={38} />
      </header>

      <main className="director-management-content">
        <div className="director-info-banner">
          <School />

          <div>
            <strong>
              School Assignment
            </strong>

            <p>
              Each school can have one
              Principal account.
            </p>
          </div>
        </div>

        {error && (
          <div className="principal-form-error">
            {error}
          </div>
        )}

        <form
          className="director-form-card"
          onSubmit={createPrincipal}
        >
          <div className="director-form-title">
            <UserPlus />

            <div>
              <h2>
                Principal Information
              </h2>

              <p>
                Enter Principal login
                information.
              </p>
            </div>
          </div>

          <div className="principal-form-grid">
            <div className="principal-field">
              <label>
                Principal Name *
              </label>

              <input
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </div>

            <div className="principal-field">
              <label>
                Username *
              </label>

              <input
                type="text"
                placeholder="Example: kattipar_principal"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
              />
            </div>

            <div className="principal-field">
              <label>
                Password *
              </label>

              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />
            </div>

            <div className="principal-field">
              <label>
                Assign School *
              </label>

              <select
                value={schoolId}
                onChange={(e) =>
                  setSchoolId(e.target.value)
                }
              >
                <option value="">
                  Select School
                </option>

                {availableSchools.map(
                  (school) => (
                    <option
                      key={school.id}
                      value={school.id}
                    >
                      {school.name} -{" "}
                      {school.udise}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {selectedSchool && (
            <div className="selected-school-box">
              <School />

              <div>
                <span>
                  SELECTED SCHOOL
                </span>

                <strong>
                  {selectedSchool.name}
                </strong>

                <small>
                  UDISE:{" "}
                  {selectedSchool.udise}
                </small>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="director-primary-button"
            disabled={saving}
          >
            <KeyRound size={18} />

            {saving
              ? "Creating Account..."
              : "Create Principal Account"}
          </button>
        </form>

        {credentials && (
          <section className="credential-card">
            <div className="credential-success">
              <CheckCircle2 />

              <div>
                <h2>
                  Principal Account Created
                </h2>

                <p>
                  Give these credentials to
                  the appointed Principal.
                </p>
              </div>
            </div>

            <div className="credential-details">
              <CredentialRow
                label="Principal"
                value={credentials.name}
              />

              <CredentialRow
                label="School"
                value={
                  credentials.schoolName
                }
              />

              <CredentialRow
                label="UDISE"
                value={credentials.udise}
              />

              <CredentialRow
                label="Username"
                value={
                  credentials.username
                }
              />

              <CredentialRow
                label="Temporary Password"
                value={
                  credentials.password
                }
              />
            </div>

            <button
              type="button"
              onClick={copyCredentials}
              className="copy-credentials-button"
            >
              <Clipboard size={17} />
              Copy Credentials
            </button>

            <p className="credential-warning">
              The password above is shown
              only from the current form.
              Firestore stores its hash,
              not this plain-text value.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

function CredentialRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="credential-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}