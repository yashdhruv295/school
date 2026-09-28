import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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
  MapPin,
  Save,
  School,
  User,
} from "lucide-react";

import { db } from "../firebase/firebase";
import { getSession } from "../utils/session";

interface SchoolProfileForm {
  schoolName: string;
  udise: string;

  principalName: string;

  village: string;
  cluster: string;
  block: string;
  district: string;
  state: string;

  schoolType: string;
  management: string;
  category: string;
  medium: string;

  lowestClass: string;
  highestClass: string;

  establishmentYear: string;

  address: string;
  pinCode: string;

  phone: string;
  email: string;
}

const initialForm: SchoolProfileForm = {
  schoolName: "",
  udise: "",

  principalName: "",

  village: "",
  cluster: "Kattipar",
  block: "",
  district: "Gondia",
  state: "Maharashtra",

  schoolType: "",
  management: "",
  category: "",
  medium: "",

  lowestClass: "",
  highestClass: "",

  establishmentYear: "",

  address: "",
  pinCode: "",

  phone: "",
  email: "",
};

export default function SchoolProfile() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState<SchoolProfileForm>(initialForm);

  const [schoolId, setSchoolId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const session = getSession();

      if (
        !session ||
        session.role !== "principal"
      ) {
        navigate("/login");
        return;
      }

      if (!session.schoolId) {
        setError(
          "No school is assigned to this Principal account."
        );

        setLoading(false);
        return;
      }

      setSchoolId(session.schoolId);

      try {
        const profileRef = doc(
          db,
          "schoolProfiles",
          session.schoolId
        );

        const snapshot =
          await getDoc(profileRef);

        if (snapshot.exists()) {
          const data = snapshot.data();

          setForm({
            schoolName:
              data.schoolName ||
              session.schoolName ||
              "",

            udise:
              data.udise ||
              session.udise ||
              "",

            principalName:
              data.principalName ||
              session.name ||
              "",

            village:
              data.village || "",

            cluster:
              data.cluster ||
              "Kattipar",

            block:
              data.block || "",

            district:
              data.district ||
              "Gondia",

            state:
              data.state ||
              "Maharashtra",

            schoolType:
              data.schoolType || "",

            management:
              data.management || "",

            category:
              data.category || "",

            medium:
              data.medium || "",

            lowestClass:
              data.lowestClass || "",

            highestClass:
              data.highestClass || "",

            establishmentYear:
              data.establishmentYear || "",

            address:
              data.address || "",

            pinCode:
              data.pinCode || "",

            phone:
              data.phone || "",

            email:
              data.email || "",
          });
        } else {
          setForm((current) => ({
            ...current,

            schoolName:
              session.schoolName || "",

            udise:
              session.udise || "",

            principalName:
              session.name || "",
          }));
        }
      } catch (err) {
        console.error(
          "Load School Profile Error:",
          err
        );

        setError(
          "Unable to load school profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccess("");
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!schoolId) {
      setError(
        "School ID is missing."
      );

      return;
    }

    if (!form.schoolName.trim()) {
      setError(
        "School name is required."
      );

      return;
    }

    if (!form.udise.trim()) {
      setError(
        "UDISE code is required."
      );

      return;
    }

    if (!form.principalName.trim()) {
      setError(
        "Principal name is required."
      );

      return;
    }

    if (
      form.pinCode &&
      !/^\d{6}$/.test(
        form.pinCode
      )
    ) {
      setError(
        "PIN code must contain 6 digits."
      );

      return;
    }

    if (
      form.phone &&
      !/^[6-9]\d{9}$/.test(
        form.phone
      )
    ) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );

      return;
    }

    try {
      setSaving(true);

      await setDoc(
        doc(
          db,
          "schoolProfiles",
          schoolId
        ),
        {
          schoolId,

          ...form,

          updatedAt:
            serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setSuccess(
        "School profile saved successfully."
      );
    } catch (err) {
      console.error(
        "Save School Profile Error:",
        err
      );

      setError(
        "Unable to save school profile. Please check Firestore."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="principal-page-loading">
        Loading School Profile...
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

          <h1>
            School Profile
          </h1>

          <p>
            Update basic information
            for your assigned school.
          </p>

        </div>

        <div className="principal-header-icon">
          <School size={31} />
        </div>

      </header>

      <main className="principal-data-container">

        <div className="assigned-school-banner">

          <div>
            <School />
          </div>

          <section>
            <span>
              ASSIGNED SCHOOL
            </span>

            <strong>
              {form.schoolName ||
                "School"}
            </strong>

            <small>
              UDISE:{" "}
              {form.udise || "--"}
            </small>
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

        <form
          onSubmit={handleSubmit}
          className="school-profile-form"
        >

          {/* BASIC INFORMATION */}

          <section className="principal-form-section">

            <div className="principal-form-section-title">

              <div>
                <Building2 />
              </div>

              <section>
                <h2>
                  Basic Information
                </h2>

                <p>
                  Primary identification
                  information of the school.
                </p>
              </section>

            </div>

            <div className="principal-form-grid">

              <div className="principal-field">

                <label>
                  School Name
                </label>

                <input
                  type="text"
                  name="schoolName"
                  value={form.schoolName}
                  readOnly
                />

              </div>

              <div className="principal-field">

                <label>
                  UDISE Code
                </label>

                <input
                  type="text"
                  name="udise"
                  value={form.udise}
                  readOnly
                />

              </div>

              <div className="principal-field">

                <label>
                  Principal Name
                </label>

                <div className="field-with-icon">

                  <User size={17} />

                  <input
                    type="text"
                    name="principalName"
                    value={
                      form.principalName
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>

              <div className="principal-field">

                <label>
                  Establishment Year
                </label>

                <input
                  type="number"
                  name="establishmentYear"
                  placeholder="Example: 1995"
                  min="1800"
                  max="2100"
                  value={
                    form.establishmentYear
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

          </section>

          {/* LOCATION */}

          <section className="principal-form-section">

            <div className="principal-form-section-title">

              <div>
                <MapPin />
              </div>

              <section>
                <h2>
                  Location Information
                </h2>

                <p>
                  School location and
                  administrative area.
                </p>
              </section>

            </div>

            <div className="principal-form-grid">

              <div className="principal-field">

                <label>
                  Village
                </label>

                <input
                  type="text"
                  name="village"
                  placeholder="Enter village"
                  value={form.village}
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="principal-field">

                <label>
                  Cluster / Centre
                </label>

                <input
                  type="text"
                  name="cluster"
                  value={form.cluster}
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="principal-field">

                <label>
                  Block / Taluka
                </label>

                <input
                  type="text"
                  name="block"
                  placeholder="Enter block/taluka"
                  value={form.block}
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="principal-field">

                <label>
                  District
                </label>

                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="principal-field">

                <label>
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="principal-field">

                <label>
                  PIN Code
                </label>

                <input
                  type="text"
                  name="pinCode"
                  maxLength={6}
                  placeholder="6 digit PIN"
                  value={form.pinCode}
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="principal-field principal-field-full">

                <label>
                  Complete Address
                </label>

                <textarea
                  name="address"
                  rows={4}
                  placeholder="Enter complete school address"
                  value={form.address}
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

          </section>

          {/* ACADEMIC INFORMATION */}

          <section className="principal-form-section">

            <div className="principal-form-section-title">

              <div>
                <School />
              </div>

              <section>
                <h2>
                  School Classification
                </h2>

                <p>
                  Enter academic and
                  management information.
                </p>
              </section>

            </div>

            <div className="principal-form-grid">

              <div className="principal-field">

                <label>
                  School Type
                </label>

                <select
                  name="schoolType"
                  value={form.schoolType}
                  onChange={
                    handleChange
                  }
                >
                  <option value="">
                    Select
                  </option>

                  <option value="Co-Educational">
                    Co-Educational
                  </option>

                  <option value="Boys">
                    Boys
                  </option>

                  <option value="Girls">
                    Girls
                  </option>
                </select>

              </div>

              <div className="principal-field">

                <label>
                  Management
                </label>

                <select
                  name="management"
                  value={form.management}
                  onChange={
                    handleChange
                  }
                >
                  <option value="">
                    Select
                  </option>

                  <option value="Government">
                    Government
                  </option>

                  <option value="Local Body">
                    Local Body
                  </option>

                  <option value="Government Aided">
                    Government Aided
                  </option>

                  <option value="Private Unaided">
                    Private Unaided
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>

              </div>

              <div className="principal-field">

                <label>
                  School Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={
                    handleChange
                  }
                >
                  <option value="">
                    Select
                  </option>

                  <option value="Primary">
                    Primary
                  </option>

                  <option value="Upper Primary">
                    Upper Primary
                  </option>

                  <option value="Secondary">
                    Secondary
                  </option>

                  <option value="Higher Secondary">
                    Higher Secondary
                  </option>
                </select>

              </div>

              <div className="principal-field">

                <label>
                  Medium
                </label>

                <select
                  name="medium"
                  value={form.medium}
                  onChange={
                    handleChange
                  }
                >
                  <option value="">
                    Select
                  </option>

                  <option value="Marathi">
                    Marathi
                  </option>

                  <option value="Hindi">
                    Hindi
                  </option>

                  <option value="English">
                    English
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>

              </div>

              <div className="principal-field">

                <label>
                  Lowest Class
                </label>

                <select
                  name="lowestClass"
                  value={
                    form.lowestClass
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option value="">
                    Select
                  </option>

                  {Array.from(
                    { length: 12 },
                    (_, index) =>
                      index + 1
                  ).map((classNo) => (
                    <option
                      key={classNo}
                      value={classNo}
                    >
                      Class {classNo}
                    </option>
                  ))}

                </select>

              </div>

              <div className="principal-field">

                <label>
                  Highest Class
                </label>

                <select
                  name="highestClass"
                  value={
                    form.highestClass
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option value="">
                    Select
                  </option>

                  {Array.from(
                    { length: 12 },
                    (_, index) =>
                      index + 1
                  ).map((classNo) => (
                    <option
                      key={classNo}
                      value={classNo}
                    >
                      Class {classNo}
                    </option>
                  ))}

                </select>

              </div>

            </div>

          </section>

          {/* CONTACT */}

          <section className="principal-form-section">

            <div className="principal-form-section-title">

              <div>
                <User />
              </div>

              <section>
                <h2>
                  Contact Information
                </h2>

                <p>
                  Official school contact
                  information.
                </p>
              </section>

            </div>

            <div className="principal-form-grid">

              <div className="principal-field">

                <label>
                  Mobile Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  maxLength={10}
                  placeholder="10 digit mobile number"
                  value={form.phone}
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="principal-field">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="School email"
                  value={form.email}
                  onChange={
                    handleChange
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
                : "Save School Profile"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}