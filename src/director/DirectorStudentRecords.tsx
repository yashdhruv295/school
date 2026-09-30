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
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  ArrowLeft,
  Edit3,
  GraduationCap,
  Plus,
  Save,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { db }
  from "../firebase/firebase";

import { schools }
  from "../data/schools";

import { getSession }
  from "../utils/session";

import StudentExcelImport
  from "../components/StudentExcelImport";


/* =========================================================
   TYPES
========================================================= */

interface StudentRecord {
  id: string;

  name: string;
  dob: string;
  age: string;

  gender: string;
  className: string;

  rollNumber: string;
  admissionNumber: string;

  parentName: string;
  mobile: string;
  address: string;
}


interface StudentForm {
  name: string;
  dob: string;
  gender: string;
  className: string;

  rollNumber: string;
  admissionNumber: string;

  parentName: string;
  mobile: string;
  address: string;
}


/* =========================================================
   DEFAULT FORM
========================================================= */

const emptyForm: StudentForm = {
  name: "",
  dob: "",
  gender: "",
  className: "",
  rollNumber: "",
  admissionNumber: "",
  parentName: "",
  mobile: "",
  address: "",
};


const classOptions = [
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
   AGE
========================================================= */

function calculateAge(
  dob: string
): number {
  if (!dob) {
    return 0;
  }

  const birthDate =
    new Date(dob);

  if (
    Number.isNaN(
      birthDate.getTime()
    )
  ) {
    return 0;
  }

  const today =
    new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() <
        birthDate.getDate()
    )
  ) {
    age--;
  }

  return Math.max(age, 0);
}


/* =========================================================
   COMPONENT
========================================================= */

export default function DirectorStudentRecords() {
  const navigate =
    useNavigate();

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
    students,
    setStudents,
  ] =
    useState<StudentRecord[]>([]);


  const [
    form,
    setForm,
  ] =
    useState<StudentForm>(
      emptyForm
    );


  const [
    editingId,
    setEditingId,
  ] =
    useState<string | null>(
      null
    );


  const [
    showForm,
    setShowForm,
  ] =
    useState(false);


  const [
    search,
    setSearch,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    saving,
    setSaving,
  ] =
    useState(false);


  const [
    message,
    setMessage,
  ] =
    useState("");


  const [
    messageType,
    setMessageType,
  ] =
    useState<
      "success" |
      "error"
    >("success");


  /* =======================================================
     LOAD
  ======================================================= */

  const loadStudents =
    async () => {
      if (!schoolId) {
        return;
      }

      try {
        setLoading(true);

        const studentQuery =
          query(
            collection(
              db,
              "students"
            ),

            where(
              "schoolId",
              "==",
              String(schoolId)
            )
          );


        const snapshot =
          await getDocs(
            studentQuery
          );


        const list:
          StudentRecord[] =
          snapshot.docs.map(
            (
              studentDocument
            ) => {
              const data =
                studentDocument.data();

              return {
                id:
                  studentDocument.id,

                name:
                  String(
                    data.name ?? ""
                  ),

                dob:
                  String(
                    data.dob ?? ""
                  ),

                age:
                  String(
                    data.age ?? ""
                  ),

                gender:
                  String(
                    data.gender ??
                    ""
                  ),

                className:
                  String(
                    data.className ??
                    ""
                  ),

                rollNumber:
                  String(
                    data.rollNumber ??
                    ""
                  ),

                admissionNumber:
                  String(
                    data.admissionNumber ??
                    ""
                  ),

                parentName:
                  String(
                    data.parentName ??
                    ""
                  ),

                mobile:
                  String(
                    data.mobile ??
                    ""
                  ),

                address:
                  String(
                    data.address ??
                    ""
                  ),
              };
            }
          );


        list.sort(
          (a, b) => {
            const classA =
              Number(
                a.className
              ) || 0;

            const classB =
              Number(
                b.className
              ) || 0;

            if (
              classA !==
              classB
            ) {
              return (
                classA -
                classB
              );
            }

            const rollA =
              Number(
                a.rollNumber
              ) || 0;

            const rollB =
              Number(
                b.rollNumber
              ) || 0;

            if (
              rollA !==
              rollB
            ) {
              return (
                rollA -
                rollB
              );
            }

            return (
              a.name.localeCompare(
                b.name
              )
            );
          }
        );


        setStudents(list);
      } catch (error) {
        console.error(
          "Student records load error:",
          error
        );

        setMessageType(
          "error"
        );

        setMessage(
          "Student records load nahi ho sake."
        );
      } finally {
        setLoading(false);
      }
    };


  /* =======================================================
     AUTH
  ======================================================= */

  useEffect(() => {
    if (
      !session ||
      session.role !==
        "director"
    ) {
      navigate(
        "/login",
        {
          replace: true,
        }
      );

      return;
    }

    loadStudents();
  }, [
    schoolId,
    session?.id,
    session?.role,
    navigate,
  ]);


  /* =======================================================
     FORM HELPERS
  ======================================================= */

  const updateField = (
    field:
      keyof StudentForm,

    value:
      string
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  };


  const openAddStudent =
    () => {
      setForm(
        emptyForm
      );

      setEditingId(
        null
      );

      setMessage("");

      setShowForm(
        true
      );

      window.scrollTo({
        top: 250,
        behavior: "smooth",
      });
    };


  const closeForm =
    () => {
      setForm(
        emptyForm
      );

      setEditingId(
        null
      );

      setShowForm(
        false
      );
    };


  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm =
    (): string | null => {
      if (
        form.name
          .trim()
          .length < 2
      ) {
        return (
          "Student name enter karo."
        );
      }

      if (!form.dob) {
        return (
          "Date of Birth select karo."
        );
      }

      const selectedDOB =
        new Date(
          form.dob
        );

      if (
        selectedDOB >
        new Date()
      ) {
        return (
          "Date of Birth future date nahi ho sakti."
        );
      }

      if (!form.gender) {
        return (
          "Gender select karo."
        );
      }

      if (
        !form.className
      ) {
        return (
          "Class select karo."
        );
      }

      if (
        form.mobile.trim() &&
        !/^[6-9]\d{9}$/.test(
          form.mobile.trim()
        )
      ) {
        return (
          "Valid 10 digit mobile number enter karo."
        );
      }

      return null;
    };


  /* =======================================================
     SAVE
  ======================================================= */

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (
        !session ||
        session.role !==
          "director"
      ) {
        setMessageType(
          "error"
        );

        setMessage(
          "Director session not found."
        );

        return;
      }

      if (
        !school ||
        !schoolId
      ) {
        return;
      }

      const validationError =
        validateForm();

      if (
        validationError
      ) {
        setMessageType(
          "error"
        );

        setMessage(
          validationError
        );

        return;
      }

      try {
        setSaving(true);
        setMessage("");

        const payload = {
          name:
            form.name.trim(),

          dob:
            form.dob,

          age:
            calculateAge(
              form.dob
            ),

          gender:
            form.gender,

          className:
            form.className,

          rollNumber:
            form.rollNumber
              .trim(),

          admissionNumber:
            form.admissionNumber
              .trim(),

          parentName:
            form.parentName
              .trim(),

          mobile:
            form.mobile
              .trim(),

          address:
            form.address
              .trim(),

          schoolId:
            String(
              school.id
            ),

          schoolName:
            school.name,

          udise:
            school.udise,

          updatedBy:
            session.id,

          updatedByRole:
            "director",

          updatedAt:
            serverTimestamp(),
        };


        if (editingId) {
          await updateDoc(
            doc(
              db,
              "students",
              editingId
            ),

            payload
          );

          setMessageType(
            "success"
          );

          setMessage(
            "Student successfully updated."
          );
        } else {
          await addDoc(
            collection(
              db,
              "students"
            ),

            {
              ...payload,

              createdBy:
                session.id,

              createdByRole:
                "director",

              createdAt:
                serverTimestamp(),
            }
          );

          setMessageType(
            "success"
          );

          setMessage(
            "Student successfully added."
          );
        }


        closeForm();

        await loadStudents();
      } catch (error) {
        console.error(
          "Student record save error:",
          error
        );

        setMessageType(
          "error"
        );

        setMessage(
          "Student record save nahi ho saka."
        );
      } finally {
        setSaving(false);
      }
    };


  /* =======================================================
     EDIT
  ======================================================= */

  const editStudent = (
    student:
      StudentRecord
  ) => {
    setEditingId(
      student.id
    );

    setForm({
      name:
        student.name,

      dob:
        student.dob,

      gender:
        student.gender,

      className:
        student.className,

      rollNumber:
        student.rollNumber,

      admissionNumber:
        student.admissionNumber,

      parentName:
        student.parentName,

      mobile:
        student.mobile,

      address:
        student.address,
    });

    setMessage("");

    setShowForm(true);

    window.scrollTo({
      top: 250,
      behavior: "smooth",
    });
  };


  /* =======================================================
     DELETE
  ======================================================= */

  const removeStudent =
    async (
      student:
        StudentRecord
    ) => {
      const confirmed =
        window.confirm(
          `Delete student?\n\n${student.name}\nClass: ${student.className}`
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteDoc(
          doc(
            db,
            "students",
            student.id
          )
        );

        setMessageType(
          "success"
        );

        setMessage(
          `${student.name} ka record delete ho gaya.`
        );

        await loadStudents();
      } catch (error) {
        console.error(
          "Student delete error:",
          error
        );

        setMessageType(
          "error"
        );

        setMessage(
          "Student record delete nahi ho saka."
        );
      }
    };


  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredStudents =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return students;
      }

      return students.filter(
        (student) =>
          student.name
            .toLowerCase()
            .includes(value) ||

          student.className
            .toLowerCase()
            .includes(value) ||

          student.rollNumber
            .toLowerCase()
            .includes(value) ||

          student.admissionNumber
            .toLowerCase()
            .includes(value) ||

          student.parentName
            .toLowerCase()
            .includes(value) ||

          student.mobile
            .toLowerCase()
            .includes(value)
      );
    }, [
      students,
      search,
    ]);


  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalStudents =
    students.length;


  const totalBoys =
    students.filter(
      (student) => {
        const gender =
          student.gender
            .trim()
            .toLowerCase();

        return (
          gender ===
            "male" ||
          gender ===
            "boy" ||
          gender ===
            "boys"
        );
      }
    ).length;


  const totalGirls =
    students.filter(
      (student) => {
        const gender =
          student.gender
            .trim()
            .toLowerCase();

        return (
          gender ===
            "female" ||
          gender ===
            "girl" ||
          gender ===
            "girls"
        );
      }
    ).length;


  /* =======================================================
     SCHOOL CHECK
  ======================================================= */

  if (!school) {
    return (
      <div className="director-editor-page">
        <h2>
          School not found.
        </h2>
      </div>
    );
  }


  if (
    !session ||
    session.role !==
      "director"
  ) {
    return null;
  }


  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="director-editor-page">

      {/* HEADER */}

      <div className="director-editor-top">

        <button
          type="button"
          onClick={() =>
            navigate(
              `/director/manage-data/${school.id}`
            )
          }
        >
          <ArrowLeft
            size={18}
          />

          Back
        </button>


        <div>
          <span>
            STUDENT RECORDS
          </span>

          <h1>
            {school.name}
          </h1>

          <p>
            UDISE:{" "}
            {school.udise}
          </p>
        </div>


        <button
          type="button"
          className="director-editor-save"
          onClick={
            openAddStudent
          }
        >
          <Plus
            size={17}
          />

          Add Student
        </button>

      </div>


      {/* SUMMARY */}

      <section
        className="private-student-summary"
        style={{
          marginBottom:
            "24px",
        }}
      >

        <article>
          <div>
            <Users
              size={22}
            />
          </div>

          <span>
            Total Students
          </span>

          <strong>
            {totalStudents}
          </strong>
        </article>


        <article>
          <div>
            <UserRound
              size={22}
            />
          </div>

          <span>
            Boys
          </span>

          <strong>
            {totalBoys}
          </strong>
        </article>


        <article>
          <div>
            <UserRound
              size={22}
            />
          </div>

          <span>
            Girls
          </span>

          <strong>
            {totalGirls}
          </strong>
        </article>


        <article>
          <div>
            <GraduationCap
              size={22}
            />
          </div>

          <span>
            School ID
          </span>

          <strong>
            {school.id}
          </strong>
        </article>

      </section>


      {/* ===============================================
          EXCEL IMPORT
      =============================================== */}

      <StudentExcelImport
        schoolId={
          String(
            school.id
          )
        }
        schoolName={
          school.name
        }
        udise={
          school.udise
        }
        userId={
          session.id
        }
        userRole="director"
        onImportComplete={
          loadStudents
        }
      />


      {/* MESSAGE */}

      {message && (
        <div
          className={
            messageType ===
            "success"
              ? "private-message success"
              : "private-message error"
          }
          style={{
            margin:
              "18px 0",
          }}
        >
          {message}
        </div>
      )}


      {/* MANUAL FORM */}

      {showForm && (
        <form
          className="director-editor-form"
          onSubmit={
            handleSubmit
          }
        >

          <div className="director-editor-form-heading">

            <Users
              size={26}
            />

            <div>
              <h2>
                {editingId
                  ? "Edit Student"
                  : "Add Student"}
              </h2>

              <p>
                Individual student
                record
              </p>
            </div>

            <button
              type="button"
              onClick={
                closeForm
              }
              style={{
                marginLeft:
                  "auto",
              }}
            >
              <X
                size={18}
              />
            </button>

          </div>


          <div className="director-editor-grid">

            <label>
              Student Name *

              <input
                required
                value={
                  form.name
                }
                onChange={(e) =>
                  updateField(
                    "name",
                    e.target.value
                  )
                }
              />
            </label>


            <label>
              Date of Birth *

              <input
                type="date"
                required
                max={
                  new Date()
                    .toISOString()
                    .split(
                      "T"
                    )[0]
                }
                value={
                  form.dob
                }
                onChange={(e) =>
                  updateField(
                    "dob",
                    e.target.value
                  )
                }
              />
            </label>


            <label>
              Age

              <input
                value={
                  form.dob
                    ? `${calculateAge(
                        form.dob
                      )} Years`
                    : ""
                }
                disabled
                placeholder="Auto calculated"
              />
            </label>


            <label>
              Gender *

              <select
                required
                value={
                  form.gender
                }
                onChange={(e) =>
                  updateField(
                    "gender",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </label>


            <label>
              Class *

              <select
                required
                value={
                  form.className
                }
                onChange={(e) =>
                  updateField(
                    "className",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Class
                </option>

                {classOptions.map(
                  (
                    className
                  ) => (
                    <option
                      key={
                        className
                      }
                      value={
                        className
                      }
                    >
                      Class{" "}
                      {
                        className
                      }
                    </option>
                  )
                )}
              </select>
            </label>


            <label>
              Roll Number

              <input
                value={
                  form.rollNumber
                }
                onChange={(e) =>
                  updateField(
                    "rollNumber",
                    e.target.value
                  )
                }
              />
            </label>


            <label>
              Admission Number

              <input
                value={
                  form.admissionNumber
                }
                onChange={(e) =>
                  updateField(
                    "admissionNumber",
                    e.target.value
                  )
                }
              />
            </label>


            <label>
              Parent / Guardian Name

              <input
                value={
                  form.parentName
                }
                onChange={(e) =>
                  updateField(
                    "parentName",
                    e.target.value
                  )
                }
              />
            </label>


            <label>
              Parent Mobile Number

              <input
                type="tel"
                maxLength={10}
                value={
                  form.mobile
                }
                onChange={(e) => {
                  const value =
                    e.target.value
                      .replace(
                        /\D/g,
                        ""
                      )
                      .slice(
                        0,
                        10
                      );

                  updateField(
                    "mobile",
                    value
                  );
                }}
              />
            </label>


            <label className="director-editor-full">
              Address

              <textarea
                rows={3}
                value={
                  form.address
                }
                onChange={(e) =>
                  updateField(
                    "address",
                    e.target.value
                  )
                }
              />
            </label>

          </div>


          <div
            style={{
              display:
                "flex",
              gap: "10px",
              flexWrap:
                "wrap",
            }}
          >
            <button
              type="submit"
              className="director-editor-save"
              disabled={
                saving
              }
            >
              <Save
                size={17}
              />

              {saving
                ? "Saving..."
                : editingId
                  ? "Update Student"
                  : "Add Student"}
            </button>


            <button
              type="button"
              onClick={
                closeForm
              }
              disabled={
                saving
              }
            >
              <X
                size={17}
              />

              Cancel
            </button>
          </div>

        </form>
      )}


      {/* SEARCH + RECORD LIST */}

      <section className="director-record-list">

        <div className="director-record-list-header">

          <div>
            <h2>
              Students
            </h2>

            <span>
              {
                filteredStudents.length
              }{" "}
              records
            </span>
          </div>


          <div
            style={{
              position:
                "relative",
            }}
          >
            <Search
              size={16}
              style={{
                position:
                  "absolute",
                left:
                  "11px",
                top:
                  "50%",
                transform:
                  "translateY(-50%)",
                color:
                  "#78909c",
              }}
            />

            <input
              style={{
                paddingLeft:
                  "36px",
              }}
              placeholder="Search student..."
              value={
                search
              }
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />
          </div>

        </div>


        {loading ? (
          <p>
            Loading students...
          </p>
        ) : filteredStudents.length ===
          0 ? (
          <div
            style={{
              padding:
                "45px 20px",
              textAlign:
                "center",
            }}
          >
            <GraduationCap
              size={45}
              style={{
                opacity:
                  0.35,
              }}
            />

            <h3>
              No Student Found
            </h3>

            <p>
              Is school me
              student records
              available nahi hain.
            </p>

            <button
              type="button"
              className="director-editor-save"
              onClick={
                openAddStudent
              }
            >
              <Plus
                size={16}
              />

              Add Student
            </button>
          </div>
        ) : (
          <div className="director-record-table-wrapper">

            <table className="director-record-table">

              <thead>
                <tr>
                  <th>
                    Name
                  </th>

                  <th>
                    Class
                  </th>

                  <th>
                    Gender
                  </th>

                  <th>
                    Roll
                  </th>

                  <th>
                    Admission
                  </th>

                  <th>
                    DOB / Age
                  </th>

                  <th>
                    Parent
                  </th>

                  <th>
                    Mobile
                  </th>

                  <th>
                    Actions
                  </th>
                </tr>
              </thead>


              <tbody>
                {filteredStudents.map(
                  (
                    student
                  ) => (
                    <tr
                      key={
                        student.id
                      }
                    >

                      <td>
                        <strong>
                          {
                            student.name
                          }
                        </strong>
                      </td>


                      <td>
                        Class{" "}
                        {
                          student.className
                        }
                      </td>


                      <td>
                        {
                          student.gender ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          student.rollNumber ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          student.admissionNumber ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          student.dob ||
                          "-"
                        }

                        <br />

                        <small>
                          {
                            student.age ||
                            "0"
                          }{" "}
                          Years
                        </small>
                      </td>


                      <td>
                        {
                          student.parentName ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          student.mobile ||
                          "-"
                        }
                      </td>


                      <td>
                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "7px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              editStudent(
                                student
                              )
                            }
                            title="Edit"
                          >
                            <Edit3
                              size={
                                15
                              }
                            />
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              removeStudent(
                                student
                              )
                            }
                            title="Delete"
                          >
                            <Trash2
                              size={
                                15
                              }
                            />
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