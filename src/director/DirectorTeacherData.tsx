import {
  ArrowLeft,
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
  useParams,
} from "react-router-dom";

import {
  db,
} from "../firebase/firebase";

import {
  schools,
} from "../data/schools";

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

  mobileNumber: string;
  joiningDate: string;

  teachingClasses: string[];

  subject: string;
  schoolName: string;
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

const emptyForm: TeacherForm = {
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

export default function DirectorTeacherData() {

  const navigate = useNavigate();

  const { schoolId } =
    useParams();

  const session =
    getSession();

  const school =
    schools.find(
      (item) =>
        String(item.id) ===
        String(schoolId)
    );


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
    form,
    setForm,
  ] = useState<TeacherForm>(
    emptyForm
  );

  const [
    editingId,
    setEditingId,
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


  /* =========================================================
     TOTAL
  ========================================================= */

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


  /* =========================================================
     AUTH
  ========================================================= */

  useEffect(() => {

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

    }

  }, [
    navigate,
    session,
  ]);


  /* =========================================================
     LOAD SUMMARY
  ========================================================= */

  const loadSummary =
    async () => {

      if (!schoolId) {
        return;
      }

      const snapshot =
        await getDoc(
          doc(
            db,
            "teacherData",
            String(schoolId)
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

    };


  /* =========================================================
     LOAD TEACHER RECORDS
  ========================================================= */

  const loadTeachers =
    async () => {

      if (!schoolId) {
        return;
      }

      const teacherQuery =
        query(
          collection(
            db,
            "teachers"
          ),

          where(
            "schoolId",
            "==",
            String(schoolId)
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

              schoolName:
                String(
                  data.schoolName ??
                  school?.name ??
                  ""
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

    };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    if (
      !session ||
      session.role !== "director" ||
      !schoolId
    ) {
      return;
    }

    const load =
      async () => {

        try {

          setLoading(true);

          await Promise.all([
            loadSummary(),
            loadTeachers(),
          ]);

        } catch (error) {

          console.error(
            "Director teacher load error:",
            error
          );

        } finally {

          setLoading(false);

        }

      };

    load();

  }, [schoolId]);


  /* =========================================================
     SUMMARY INPUT
  ========================================================= */

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


  /* =========================================================
     SAVE SUMMARY
  ========================================================= */

  const saveSummary =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();

      if (
        !school ||
        !schoolId
      ) {
        return;
      }

      try {

        setSavingSummary(true);
        setMessage("");

        await setDoc(
          doc(
            db,
            "teacherData",
            String(schoolId)
          ),
          {
            ...summary,

            totalTeachers,

            schoolId:
              String(school.id),

            schoolName:
              school.name,

            udise:
              school.udise,

            updatedBy:
              session?.id ?? "",

            updatedByRole:
              "director",

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
          "Summary save error:",
          error
        );

        setMessage(
          "Teacher summary could not be saved."
        );

      } finally {

        setSavingSummary(false);

      }

    };


  /* =========================================================
     NORMAL FORM INPUT
  ========================================================= */

  const updateField = (
    field:
      "teacherName" |
      "role" |
      "mobileNumber" |
      "joiningDate" |
      "subject",
    value: string
  ) => {

    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );

  };


  /* =========================================================
     MULTIPLE CLASS SELECTION
  ========================================================= */

  const toggleTeachingClass = (
    className: string
  ) => {

    setForm(
      (previous) => {

        const selected =
          previous.teachingClasses.includes(
            className
          );

        let updatedClasses: string[];

        if (selected) {

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


  const selectAllClasses = () => {

    setForm(
      (previous) => ({
        ...previous,

        teachingClasses:
          [...availableClasses],
      })
    );

  };


  const clearClasses = () => {

    setForm(
      (previous) => ({
        ...previous,
        teachingClasses: [],
      })
    );

  };


  /* =========================================================
     SAVE TEACHER
  ========================================================= */

  const saveTeacher =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();

      if (
        !school ||
        !schoolId ||
        !form.teacherName.trim()
      ) {

        setTeacherMessage(
          "Teacher name is required."
        );

        return;

      }

      if (
        form.mobileNumber &&
        !/^[6-9]\d{9}$/.test(
          form.mobileNumber
        )
      ) {

        setTeacherMessage(
          "Enter a valid 10 digit mobile number."
        );

        return;

      }

      if (
        form.teachingClasses.length === 0
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
            form.teacherName.trim(),

          role:
            form.role.trim(),

          mobileNumber:
            form.mobileNumber.trim(),

          joiningDate:
            form.joiningDate,

          teachingClasses:
            form.teachingClasses,

          subject:
            form.subject.trim(),

          schoolId:
            String(school.id),

          schoolName:
            school.name,

          udise:
            school.udise,

          updatedBy:
            session?.id ?? "",

          updatedByRole:
            "director",

          updatedAt:
            serverTimestamp(),
        };

        if (editingId) {

          await updateDoc(
            doc(
              db,
              "teachers",
              editingId
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
                "director",

              createdAt:
                serverTimestamp(),
            }
          );

          setTeacherMessage(
            "Teacher added successfully."
          );

        }

        setForm(emptyForm);

        setEditingId(null);

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


  /* =========================================================
     EDIT
  ========================================================= */

  const editTeacher = (
    teacher: TeacherRecord
  ) => {

    setEditingId(
      teacher.id
    );

    setForm({
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
        "director-teacher-form"
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

  };


  /* =========================================================
     CANCEL
  ========================================================= */

  const cancelEdit = () => {

    setEditingId(null);

    setForm(emptyForm);

    setTeacherMessage("");

  };


  /* =========================================================
     DELETE
  ========================================================= */

  const removeTeacher =
    async (
      teacher: TeacherRecord
    ) => {

      if (
        !window.confirm(
          `Delete "${teacher.teacherName}"?`
        )
      ) {
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
          editingId === teacher.id
        ) {
          cancelEdit();
        }

        await loadTeachers();

      } catch (error) {

        console.error(
          "Delete teacher error:",
          error
        );

        window.alert(
          "Teacher could not be deleted."
        );

      }

    };


  /* =========================================================
     SEARCH
  ========================================================= */

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


  /* =========================================================
     SCHOOL NOT FOUND
  ========================================================= */

  if (!school) {

    return (

      <div className="director-editor-page">

        <h2>
          School not found.
        </h2>

      </div>

    );

  }


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (

      <div className="director-editor-page">

        <div className="teacher-loading">
          Loading teacher data...
        </div>

      </div>

    );

  }


  /* =========================================================
     UI
  ========================================================= */

  return (

    <div className="director-editor-page">


      {/* TOP */}

      <div className="director-editor-top">

        <button
          type="button"
          onClick={() =>
            navigate(
              `/director/manage-data/${school.id}`
            )
          }
        >

          <ArrowLeft size={18} />

          Back

        </button>


        <div>

          <span>
            TEACHER DATA
          </span>

          <h1>
            {school.name}
          </h1>

          <p>
            UDISE: {school.udise}
          </p>

        </div>

      </div>


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


      {/* SUMMARY FORM */}

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
              Edit teaching staff summary
              for this school.
            </p>

          </div>

        </div>

        <div className="teacher-divider" />

        <div className="teacher-form-grid">

          <label className="teacher-full">

            Principal / Head Teacher Name

            <input
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


      {/* INDIVIDUAL TEACHER */}

      <form
        id="director-teacher-form"
        className="teacher-main-card"
        onSubmit={saveTeacher}
      >

        <div className="teacher-section-heading">

          <div className="teacher-heading-icon">
            <UserRound size={27} />
          </div>

          <div>

            <h2>
              {editingId
                ? "Update Teacher Record"
                : "Add Teacher Record"}
            </h2>

            <p>
              Director can manage
              individual teacher records.
            </p>

          </div>

        </div>

        <div className="teacher-divider" />

        <div className="teacher-form-grid">

          <label>

            Teacher Name *

            <input
              required
              value={
                form.teacherName
              }
              onChange={(event) =>
                updateField(
                  "teacherName",
                  event.target.value
                )
              }
            />

          </label>


          <label>

            Role / Designation

            <select
              value={form.role}
              onChange={(event) =>
                updateField(
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
              value={school.name}
              readOnly
            />

          </label>


          <label>

            Mobile Number

            <input
              type="tel"
              maxLength={10}
              value={
                form.mobileNumber
              }
              onChange={(event) =>
                updateField(
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
                form.joiningDate
              }
              onChange={(event) =>
                updateField(
                  "joiningDate",
                  event.target.value
                )
              }
            />

          </label>


          <label>

            Subject

            <input
              value={form.subject}
              placeholder="Example: Mathematics"
              onChange={(event) =>
                updateField(
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
                  Select one or more classes
                  taught by this teacher.
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
                    form
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


            {form.teachingClasses.length >
              0 && (

              <div className="teacher-selected-classes">

                <strong>
                  Selected Classes:
                </strong>

                <div className="teacher-selected-tags">

                  {form
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

            {editingId
              ? <Save size={17} />
              : <Plus size={17} />}

            {savingTeacher
              ? "Saving..."
              : editingId
                ? "Update Teacher"
                : "Add Teacher"}

          </button>

          {editingId && (

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


      {/* RECORD LIST */}

      <section className="teacher-main-card">

        <div className="teacher-record-header">

          <div>

            <h2>
              Teacher Records
            </h2>

            <p>
              {teachers.length} records
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

          </div>

        ) : (

          <div className="teacher-table-wrapper">

            <table className="teacher-record-table">

              <thead>

                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>School</th>
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

                      </td>

                      <td>
                        {teacher.role || "-"}
                      </td>

                      <td>
                        {school.name}
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

                            <Pencil size={14} />
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

                            <Trash2 size={14} />
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