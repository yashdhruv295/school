import {
  Building2,
  Pencil,
  Plus,
  Save,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  useNavigate,
} from "react-router-dom";

import {
  db,
} from "../firebase/firebase";

import {
  getSession,
} from "../utils/session";


/* =========================================================
   TYPES
========================================================= */

interface TeacherSummary {
  headTeacherName: string;
  maleTeachers: number;
  femaleTeachers: number;
  permanentTeachers: number;
  contractTeachers: number;
}

interface TeacherRecord {
  id: string;

  teacherName: string;
  role: string;

  schoolId: string;
  schoolName: string;
  udise: string;

  mobileNumber: string;
  joiningDate: string;

  teachingClasses: string[];

  subject: string;
}

interface TeacherForm {
  teacherName: string;
  role: string;

  mobileNumber: string;
  joiningDate: string;

  teachingClasses: string[];

  subject: string;
}


/* =========================================================
   DEFAULT DATA
========================================================= */

const initialSummary: TeacherSummary = {
  headTeacherName: "",
  maleTeachers: 0,
  femaleTeachers: 0,
  permanentTeachers: 0,
  contractTeachers: 0,
};

const emptyTeacherForm: TeacherForm = {
  teacherName: "",
  role: "",
  mobileNumber: "",
  joiningDate: "",
  teachingClasses: [],
  subject: "",
};

const availableClasses = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];


/* =========================================================
   COMPONENT
========================================================= */

export default function TeacherData() {

  const navigate = useNavigate();

  const session = getSession();

  const schoolId =
    String(session?.schoolId ?? "");

  const schoolName =
    String(session?.schoolName ?? "");

  const udise =
    String(session?.udise ?? "");


  /* =======================================================
     STATES
  ======================================================= */

  const [
    summary,
    setSummary,
  ] = useState<TeacherSummary>(
    initialSummary
  );

  const [
    teachers,
    setTeachers,
  ] = useState<TeacherRecord[]>([]);

  const [
    teacherForm,
    setTeacherForm,
  ] = useState<TeacherForm>(
    emptyTeacherForm
  );

  const [
    editingTeacherId,
    setEditingTeacherId,
  ] = useState<string | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    savingSummary,
    setSavingSummary,
  ] = useState(false);

  const [
    savingTeacher,
    setSavingTeacher,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    teacherMessage,
    setTeacherMessage,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");


  /* =======================================================
     AUTH CHECK
  ======================================================= */

  useEffect(() => {

    if (
      !session ||
      session.role !== "principal" ||
      !schoolId
    ) {

      navigate(
        "/login",
        {
          replace: true,
        }
      );

    }

  }, [
    navigate,
    schoolId,
    session,
  ]);


  /* =======================================================
     TOTAL TEACHERS
  ======================================================= */

  const totalTeachers =
    useMemo(
      () =>
        Number(summary.maleTeachers) +
        Number(summary.femaleTeachers),
      [
        summary.maleTeachers,
        summary.femaleTeachers,
      ]
    );


  /* =======================================================
     LOAD SUMMARY
  ======================================================= */

  const loadSummary =
    async () => {

      if (!schoolId) {
        return;
      }

      try {

        const snapshot =
          await getDoc(
            doc(
              db,
              "teacherData",
              schoolId
            )
          );

        if (snapshot.exists()) {

          const data =
            snapshot.data();

          setSummary({
            headTeacherName:
              String(
                data.headTeacherName ?? ""
              ),

            maleTeachers:
              Number(
                data.maleTeachers
              ) || 0,

            femaleTeachers:
              Number(
                data.femaleTeachers
              ) || 0,

            permanentTeachers:
              Number(
                data.permanentTeachers
              ) || 0,

            contractTeachers:
              Number(
                data.contractTeachers
              ) || 0,
          });

        }

      } catch (error) {

        console.error(
          "Teacher summary load error:",
          error
        );

      }

    };


  /* =======================================================
     LOAD INDIVIDUAL TEACHERS
  ======================================================= */

  const loadTeachers =
    async () => {

      if (!schoolId) {
        return;
      }

      try {

        const teacherQuery =
          query(
            collection(
              db,
              "teachers"
            ),

            where(
              "schoolId",
              "==",
              schoolId
            )
          );

        const snapshot =
          await getDocs(
            teacherQuery
          );

        const list: TeacherRecord[] =
          snapshot.docs.map(
            (teacherDocument) => {

              const data =
                teacherDocument.data();

              /*
                BACKWARD COMPATIBILITY:

                Old:
                teachingClass: "5"

                New:
                teachingClasses: ["5","6","7"]
              */

              const teachingClasses =
                Array.isArray(
                  data.teachingClasses
                )
                  ? data.teachingClasses.map(
                      String
                    )
                  : data.teachingClass
                    ? [
                        String(
                          data.teachingClass
                        ),
                      ]
                    : [];

              return {
                id:
                  teacherDocument.id,

                teacherName:
                  String(
                    data.teacherName ?? ""
                  ),

                role:
                  String(
                    data.role ?? ""
                  ),

                schoolId:
                  String(
                    data.schoolId ?? ""
                  ),

                schoolName:
                  String(
                    data.schoolName ?? ""
                  ),

                udise:
                  String(
                    data.udise ?? ""
                  ),

                mobileNumber:
                  String(
                    data.mobileNumber ?? ""
                  ),

                joiningDate:
                  String(
                    data.joiningDate ?? ""
                  ),

                teachingClasses,

                subject:
                  String(
                    data.subject ?? ""
                  ),
              };

            }
          );

        list.sort(
          (a, b) =>
            a.teacherName.localeCompare(
              b.teacherName
            )
        );

        setTeachers(list);

      } catch (error) {

        console.error(
          "Teachers load error:",
          error
        );

      }

    };


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {

    if (
      !session ||
      session.role !== "principal" ||
      !schoolId
    ) {
      return;
    }

    const loadPage =
      async () => {

        setLoading(true);

        await Promise.all([
          loadSummary(),
          loadTeachers(),
        ]);

        setLoading(false);

      };

    loadPage();

  }, [schoolId]);


  /* =======================================================
     SUMMARY INPUTS
  ======================================================= */

  const updateSummaryText = (
    field: keyof TeacherSummary,
    value: string
  ) => {

    setSummary(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );

  };


  const updateSummaryNumber = (
    field: keyof TeacherSummary,
    value: string
  ) => {

    setSummary(
      (previous) => ({
        ...previous,

        [field]:
          Math.max(
            0,
            Number(value) || 0
          ),
      })
    );

  };


  /* =======================================================
     SAVE SUMMARY
  ======================================================= */

  const saveSummary =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();

      if (!schoolId) {
        return;
      }

      try {

        setSavingSummary(true);
        setMessage("");

        await setDoc(
          doc(
            db,
            "teacherData",
            schoolId
          ),
          {
            ...summary,

            totalTeachers,

            schoolId,
            schoolName,
            udise,

            updatedBy:
              session?.id ?? "",

            updatedByRole:
              "principal",

            updatedAt:
              serverTimestamp(),
          },
          {
            merge: true,
          }
        );

        setMessage(
          "Teacher summary saved successfully."
        );

      } catch (error) {

        console.error(
          "Teacher summary save error:",
          error
        );

        setMessage(
          "Teacher summary could not be saved."
        );

      } finally {

        setSavingSummary(false);

      }

    };


  /* =======================================================
     NORMAL FORM FIELD
  ======================================================= */

  const updateTeacherField = (
    field:
      "teacherName" |
      "role" |
      "mobileNumber" |
      "joiningDate" |
      "subject",
    value: string
  ) => {

    setTeacherForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );

  };


  /* =======================================================
     MULTIPLE CLASS SELECTION
  ======================================================= */

  const toggleTeachingClass = (
    className: string
  ) => {

    setTeacherForm(
      (previous) => {

        const alreadySelected =
          previous.teachingClasses.includes(
            className
          );

        let updatedClasses: string[];

        if (alreadySelected) {

          updatedClasses =
            previous.teachingClasses.filter(
              (item) =>
                item !== className
            );

        } else {

          updatedClasses = [
            ...previous.teachingClasses,
            className,
          ];

        }

        updatedClasses.sort(
          (a, b) =>
            Number(a) - Number(b)
        );

        return {
          ...previous,
          teachingClasses:
            updatedClasses,
        };

      }
    );

  };


  /* =======================================================
     SELECT ALL
  ======================================================= */

  const selectAllClasses = () => {

    setTeacherForm(
      (previous) => ({
        ...previous,
        teachingClasses:
          [...availableClasses],
      })
    );

  };


  /* =======================================================
     CLEAR CLASSES
  ======================================================= */

  const clearClasses = () => {

    setTeacherForm(
      (previous) => ({
        ...previous,
        teachingClasses: [],
      })
    );

  };


  /* =======================================================
     SAVE TEACHER
  ======================================================= */

  const saveTeacher =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();

      if (
        !schoolId ||
        !teacherForm.teacherName.trim()
      ) {

        setTeacherMessage(
          "Teacher name is required."
        );

        return;

      }

      if (
        teacherForm.mobileNumber &&
        !/^[6-9]\d{9}$/.test(
          teacherForm.mobileNumber
        )
      ) {

        setTeacherMessage(
          "Enter a valid 10 digit mobile number."
        );

        return;

      }

      if (
        teacherForm.teachingClasses.length === 0
      ) {

        setTeacherMessage(
          "Please select at least one teaching class."
        );

        return;

      }

      try {

        setSavingTeacher(true);
        setTeacherMessage("");

        const payload = {

          teacherName:
            teacherForm.teacherName.trim(),

          role:
            teacherForm.role.trim(),

          mobileNumber:
            teacherForm.mobileNumber.trim(),

          joiningDate:
            teacherForm.joiningDate,

          teachingClasses:
            teacherForm.teachingClasses,

          subject:
            teacherForm.subject.trim(),

          schoolId,
          schoolName,
          udise,

          updatedBy:
            session?.id ?? "",

          updatedByRole:
            "principal",

          updatedAt:
            serverTimestamp(),
        };

        if (editingTeacherId) {

          await updateDoc(
            doc(
              db,
              "teachers",
              editingTeacherId
            ),
            payload
          );

          setTeacherMessage(
            "Teacher updated successfully."
          );

        } else {

          await addDoc(
            collection(
              db,
              "teachers"
            ),
            {
              ...payload,

              createdBy:
                session?.id ?? "",

              createdByRole:
                "principal",

              createdAt:
                serverTimestamp(),
            }
          );

          setTeacherMessage(
            "Teacher added successfully."
          );

        }

        setTeacherForm(
          emptyTeacherForm
        );

        setEditingTeacherId(
          null
        );

        await loadTeachers();

      } catch (error) {

        console.error(
          "Teacher save error:",
          error
        );

        setTeacherMessage(
          "Teacher record could not be saved."
        );

      } finally {

        setSavingTeacher(false);

      }

    };


  /* =======================================================
     EDIT
  ======================================================= */

  const editTeacher = (
    teacher: TeacherRecord
  ) => {

    setEditingTeacherId(
      teacher.id
    );

    setTeacherForm({
      teacherName:
        teacher.teacherName,

      role:
        teacher.role,

      mobileNumber:
        teacher.mobileNumber,

      joiningDate:
        teacher.joiningDate,

      teachingClasses:
        [...teacher.teachingClasses],

      subject:
        teacher.subject,
    });

    setTeacherMessage("");

    document
      .getElementById(
        "teacher-record-form"
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

  };


  /* =======================================================
     CANCEL EDIT
  ======================================================= */

  const cancelEdit = () => {

    setEditingTeacherId(null);

    setTeacherForm(
      emptyTeacherForm
    );

    setTeacherMessage("");

  };


  /* =======================================================
     DELETE
  ======================================================= */

  const removeTeacher =
    async (
      teacher: TeacherRecord
    ) => {

      const confirmed =
        window.confirm(
          `Delete teacher "${teacher.teacherName}"?`
        );

      if (!confirmed) {
        return;
      }

      try {

        await deleteDoc(
          doc(
            db,
            "teachers",
            teacher.id
          )
        );

        if (
          editingTeacherId ===
          teacher.id
        ) {
          cancelEdit();
        }

        await loadTeachers();

      } catch (error) {

        console.error(
          "Teacher delete error:",
          error
        );

        window.alert(
          "Teacher could not be deleted."
        );

      }

    };


  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredTeachers =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return teachers;
      }

      return teachers.filter(
        (teacher) => {

          const classes =
            teacher.teachingClasses
              .map(
                (item) =>
                  `class ${item}`
              )
              .join(" ")
              .toLowerCase();

          return (
            teacher.teacherName
              .toLowerCase()
              .includes(value) ||

            teacher.role
              .toLowerCase()
              .includes(value) ||

            teacher.subject
              .toLowerCase()
              .includes(value) ||

            classes.includes(value)
          );

        }
      );

    }, [
      teachers,
      search,
    ]);


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <div className="teacher-page">

        <div className="teacher-loading">
          Loading teacher data...
        </div>

      </div>

    );

  }


  /* =======================================================
     UI
  ======================================================= */

  return (

    <div className="teacher-page">


      {/* ASSIGNED SCHOOL */}

      <section className="teacher-school-card">

        <div className="teacher-school-icon">

          <Building2 size={28} />

        </div>

        <div>

          <span>
            ASSIGNED SCHOOL
          </span>

          <h2>
            {schoolName ||
              "Assigned School"}
          </h2>

          <p>
            UDISE: {udise || "-"}
          </p>

        </div>

      </section>


      {/* SUMMARY CARDS */}

      <section className="teacher-summary-grid">

        <article>

          <span>
            Male Teachers
          </span>

          <strong>
            {summary.maleTeachers}
          </strong>

        </article>

        <article>

          <span>
            Female Teachers
          </span>

          <strong>
            {summary.femaleTeachers}
          </strong>

        </article>

        <article>

          <span>
            Total Teachers
          </span>

          <strong>
            {totalTeachers}
          </strong>

        </article>

      </section>


      {/* TEACHING STAFF SUMMARY */}

      <form
        className="teacher-main-card"
        onSubmit={saveSummary}
      >

        <div className="teacher-section-heading">

          <div className="teacher-heading-icon">
            <Users size={27} />
          </div>

          <div>

            <h2>
              Teaching Staff
            </h2>

            <p>
              Enter teacher information
              for the school.
            </p>

          </div>

        </div>

        <div className="teacher-divider" />

        <div className="teacher-form-grid">

          <label className="teacher-full">

            Principal / Head Teacher Name

            <input
              type="text"
              value={
                summary.headTeacherName
              }
              onChange={(event) =>
                updateSummaryText(
                  "headTeacherName",
                  event.target.value
                )
              }
            />

          </label>

          <label>

            Male Teachers

            <input
              type="number"
              min="0"
              value={
                summary.maleTeachers
              }
              onChange={(event) =>
                updateSummaryNumber(
                  "maleTeachers",
                  event.target.value
                )
              }
            />

          </label>

          <label>

            Female Teachers

            <input
              type="number"
              min="0"
              value={
                summary.femaleTeachers
              }
              onChange={(event) =>
                updateSummaryNumber(
                  "femaleTeachers",
                  event.target.value
                )
              }
            />

          </label>

          <label>

            Permanent Teachers

            <input
              type="number"
              min="0"
              value={
                summary.permanentTeachers
              }
              onChange={(event) =>
                updateSummaryNumber(
                  "permanentTeachers",
                  event.target.value
                )
              }
            />

          </label>

          <label>

            Contract / Temporary Teachers

            <input
              type="number"
              min="0"
              value={
                summary.contractTeachers
              }
              onChange={(event) =>
                updateSummaryNumber(
                  "contractTeachers",
                  event.target.value
                )
              }
            />

          </label>

        </div>

        {message && (

          <div className="teacher-message">
            {message}
          </div>

        )}

        <button
          type="submit"
          className="teacher-save-button"
          disabled={savingSummary}
        >

          <Save size={17} />

          {savingSummary
            ? "Saving..."
            : "Save Teaching Staff"}

        </button>

      </form>


      {/* INDIVIDUAL TEACHER FORM */}

      <form
        id="teacher-record-form"
        className="teacher-main-card"
        onSubmit={saveTeacher}
      >

        <div className="teacher-section-heading">

          <div className="teacher-heading-icon">
            <UserRound size={27} />
          </div>

          <div>

            <h2>
              {editingTeacherId
                ? "Update Teacher Record"
                : "Add Teacher Record"}
            </h2>

            <p>
              Add complete individual
              teacher information.
            </p>

          </div>

        </div>

        <div className="teacher-divider" />

        <div className="teacher-form-grid">

          <label>

            Teacher Name *

            <input
              type="text"
              required
              placeholder="Enter teacher name"
              value={
                teacherForm.teacherName
              }
              onChange={(event) =>
                updateTeacherField(
                  "teacherName",
                  event.target.value
                )
              }
            />

          </label>


          <label>

            Role / Designation

            <select
              value={
                teacherForm.role
              }
              onChange={(event) =>
                updateTeacherField(
                  "role",
                  event.target.value
                )
              }
            >

              <option value="">
                Select Role
              </option>

              <option value="Principal">
                Principal
              </option>

              <option value="Head Teacher">
                Head Teacher
              </option>

              <option value="Assistant Teacher">
                Assistant Teacher
              </option>

              <option value="Subject Teacher">
                Subject Teacher
              </option>

              <option value="Contract Teacher">
                Contract Teacher
              </option>

              <option value="Temporary Teacher">
                Temporary Teacher
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </label>


          <label>

            School Name

            <input
              type="text"
              value={schoolName}
              readOnly
            />

          </label>


          <label>

            Mobile Number

            <input
              type="tel"
              maxLength={10}
              placeholder="10 digit mobile number"
              value={
                teacherForm.mobileNumber
              }
              onChange={(event) =>
                updateTeacherField(
                  "mobileNumber",
                  event.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
            />

          </label>


          <label>

            Date of Starting Job

            <input
              type="date"
              value={
                teacherForm.joiningDate
              }
              onChange={(event) =>
                updateTeacherField(
                  "joiningDate",
                  event.target.value
                )
              }
            />

          </label>


          <label>

            Subject

            <input
              type="text"
              placeholder="Example: Mathematics"
              value={
                teacherForm.subject
              }
              onChange={(event) =>
                updateTeacherField(
                  "subject",
                  event.target.value
                )
              }
            />

          </label>


          {/* MULTIPLE CLASSES */}

          <div className="teacher-full">

            <div className="teacher-multi-class-header">

              <div>

                <div className="teacher-multi-class-label">
                  Teach Classes *
                </div>

                <p className="teacher-multi-class-help">
                  Select all classes taught
                  by this teacher.
                </p>

              </div>


              <div className="teacher-class-quick-actions">

                <button
                  type="button"
                  onClick={selectAllClasses}
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={clearClasses}
                >
                  Clear
                </button>

              </div>

            </div>


            <div className="teacher-class-selector">

              {availableClasses.map(
                (className) => {

                  const selected =
                    teacherForm
                      .teachingClasses
                      .includes(
                        className
                      );

                  return (

                    <button
                      key={className}
                      type="button"
                      className={
                        selected
                          ? "teacher-class-option selected"
                          : "teacher-class-option"
                      }
                      onClick={() =>
                        toggleTeachingClass(
                          className
                        )
                      }
                    >

                      <span className="teacher-class-checkbox">

                        {selected
                          ? "✓"
                          : ""}

                      </span>

                      Class {className}

                    </button>

                  );

                }
              )}

            </div>


            {teacherForm
              .teachingClasses
              .length > 0 && (

              <div className="teacher-selected-classes">

                <strong>
                  Selected Classes:
                </strong>

                <div className="teacher-selected-tags">

                  {teacherForm
                    .teachingClasses
                    .map(
                      (className) => (

                        <span
                          key={
                            className
                          }
                        >
                          Class {className}
                        </span>

                      )
                    )}

                </div>

              </div>

            )}

          </div>

        </div>


        {teacherMessage && (

          <div className="teacher-message">
            {teacherMessage}
          </div>

        )}


        <div className="teacher-form-actions">

          <button
            type="submit"
            className="teacher-save-button"
            disabled={savingTeacher}
          >

            {editingTeacherId
              ? <Save size={17} />
              : <Plus size={17} />}

            {savingTeacher
              ? "Saving..."
              : editingTeacherId
                ? "Update Teacher"
                : "Add Teacher"}

          </button>


          {editingTeacherId && (

            <button
              type="button"
              className="teacher-cancel-button"
              onClick={cancelEdit}
            >

              <X size={17} />

              Cancel

            </button>

          )}

        </div>

      </form>


      {/* TEACHER LIST */}

      <section className="teacher-main-card">

        <div className="teacher-record-header">

          <div>

            <h2>
              Teacher Records
            </h2>

            <p>
              {teachers.length} teacher
              record
              {teachers.length === 1
                ? ""
                : "s"}
            </p>

          </div>

          <input
            type="search"
            placeholder="Search teacher..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>


        {filteredTeachers.length === 0 ? (

          <div className="teacher-empty">

            <UserRound size={38} />

            <strong>
              No teacher records found
            </strong>

            <span>
              Add the first teacher
              using the form above.
            </span>

          </div>

        ) : (

          <div className="teacher-table-wrapper">

            <table className="teacher-record-table">

              <thead>

                <tr>
                  <th>Teacher</th>
                  <th>Role</th>
                  <th>Mobile</th>
                  <th>Joining Date</th>
                  <th>Classes</th>
                  <th>Subject</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredTeachers.map(
                  (teacher) => (

                    <tr key={teacher.id}>

                      <td>

                        <strong>
                          {teacher.teacherName}
                        </strong>

                        <small>
                          {teacher.schoolName}
                        </small>

                      </td>

                      <td>
                        {teacher.role || "-"}
                      </td>

                      <td>
                        {teacher.mobileNumber || "-"}
                      </td>

                      <td>
                        {teacher.joiningDate || "-"}
                      </td>

                      <td>

                        {teacher
                          .teachingClasses
                          .length > 0 ? (

                          <div className="teacher-class-tags">

                            {teacher
                              .teachingClasses
                              .map(
                                (
                                  className
                                ) => (

                                  <span
                                    key={
                                      className
                                    }
                                  >
                                    Class{" "}
                                    {className}
                                  </span>

                                )
                              )}

                          </div>

                        ) : (
                          "-"
                        )}

                      </td>

                      <td>
                        {teacher.subject || "-"}
                      </td>

                      <td>

                        <div className="teacher-table-actions">

                          <button
                            type="button"
                            className="teacher-edit-button"
                            onClick={() =>
                              editTeacher(
                                teacher
                              )
                            }
                          >

                            <Pencil size={15} />

                            Edit

                          </button>

                          <button
                            type="button"
                            className="teacher-delete-button"
                            onClick={() =>
                              removeTeacher(
                                teacher
                              )
                            }
                          >

                            <Trash2 size={15} />

                            Delete

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>

  );

}