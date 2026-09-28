import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  addDoc,
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
  Plus,
  Save,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { db } from "../firebase/firebase";

import {
  getSession,
} from "../utils/session";


/* =========================================================
   TYPES
========================================================= */

interface Student {
  id: string;

  schoolId: string;
  schoolName: string;
  udise: string;

  name: string;
  dob: string;
  age: number;

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


/* =========================================================
   AGE CALCULATOR
========================================================= */

function calculateAge(
  dob: string
): number {

  if (!dob) {
    return 0;
  }

  const birthDate =
    new Date(dob);

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

export default function Students() {

  const navigate =
    useNavigate();

  const session =
    getSession();


  const [students, setStudents] =
    useState<Student[]>([]);

  const [form, setForm] =
    useState<StudentForm>(
      emptyForm
    );

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [message, setMessage] =
    useState("");


  /* =========================================================
     AUTHORIZATION
  ========================================================= */

  useEffect(() => {

    if (
      !session ||
      session.role !== "principal" ||
      !session.schoolId
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
    session?.id,
    session?.role,
    session?.schoolId,
  ]);


  /* =========================================================
     LOAD ONLY PRINCIPAL'S SCHOOL
  ========================================================= */

  const loadStudents =
    async () => {

      if (
        !session ||
        session.role !== "principal" ||
        !session.schoolId
      ) {
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
              String(
                session.schoolId
              )
            )
          );


        const snapshot =
          await getDocs(
            studentQuery
          );


        const records: Student[] =
          snapshot.docs.map(
            (studentDocument) => {

              const data =
                studentDocument.data();

              return {

                id:
                  studentDocument.id,

                schoolId:
                  String(
                    data.schoolId || ""
                  ),

                schoolName:
                  String(
                    data.schoolName || ""
                  ),

                udise:
                  String(
                    data.udise || ""
                  ),

                name:
                  String(
                    data.name || ""
                  ),

                dob:
                  String(
                    data.dob || ""
                  ),

                age:
                  Number(
                    data.age
                  ) || 0,

                gender:
                  String(
                    data.gender || ""
                  ),

                className:
                  String(
                    data.className || ""
                  ),

                rollNumber:
                  String(
                    data.rollNumber || ""
                  ),

                admissionNumber:
                  String(
                    data.admissionNumber || ""
                  ),

                parentName:
                  String(
                    data.parentName || ""
                  ),

                mobile:
                  String(
                    data.mobile || ""
                  ),

                address:
                  String(
                    data.address || ""
                  ),

              };

            }
          );


        records.sort(
          (a, b) => {

            const classDifference =
              Number(a.className) -
              Number(b.className);

            if (classDifference !== 0) {
              return classDifference;
            }

            return (
              Number(a.rollNumber) -
              Number(b.rollNumber)
            );

          }
        );


        setStudents(
          records
        );

      }

      catch (error) {

        console.error(
          "Student loading error:",
          error
        );

        setMessage(
          "Student data load nahi ho saka."
        );

      }

      finally {

        setLoading(false);

      }

    };


  useEffect(() => {

    loadStudents();

  }, [
    session?.schoolId,
  ]);


  /* =========================================================
     INPUT
  ========================================================= */

  const handleInput =
    (
      field: keyof StudentForm,
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
     SAVE STUDENT
  ========================================================= */

  const handleSubmit =
    async (
      event: FormEvent
    ) => {

      event.preventDefault();


      if (
        !session ||
        session.role !== "principal" ||
        !session.schoolId
      ) {
        return;
      }


      if (
        !form.name.trim() ||
        !form.dob ||
        !form.gender ||
        !form.className
      ) {

        setMessage(
          "Name, DOB, Gender aur Class required hai."
        );

        return;
      }


      if (
        form.mobile &&
        !/^[6-9]\d{9}$/.test(
          form.mobile
        )
      ) {

        setMessage(
          "Valid 10 digit mobile number enter karein."
        );

        return;
      }


      try {

        setSaving(true);
        setMessage("");


        const studentData = {

          schoolId:
            String(
              session.schoolId
            ),

          schoolName:
            session.schoolName || "",

          udise:
            session.udise || "",

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
            form.rollNumber.trim(),

          admissionNumber:
            form.admissionNumber.trim(),

          parentName:
            form.parentName.trim(),

          mobile:
            form.mobile.trim(),

          address:
            form.address.trim(),

          updatedAt:
            serverTimestamp(),

        };


        /* UPDATE */

        if (editingId) {

          await updateDoc(
            doc(
              db,
              "students",
              editingId
            ),
            studentData
          );


          setMessage(
            "Student information updated successfully."
          );

        }

        /* CREATE */

        else {

          await addDoc(
            collection(
              db,
              "students"
            ),
            {

              ...studentData,

              createdBy:
                session.id,

              createdAt:
                serverTimestamp(),

            }
          );


          setMessage(
            "Student added successfully."
          );

        }


        setForm(
          emptyForm
        );

        setEditingId(
          null
        );

        setShowForm(
          false
        );


        await loadStudents();

      }

      catch (error) {

        console.error(
          "Student save error:",
          error
        );

        setMessage(
          "Student save nahi ho saka."
        );

      }

      finally {

        setSaving(false);

      }

    };


  /* =========================================================
     EDIT
  ========================================================= */

  const handleEdit =
    (
      student: Student
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


      setShowForm(
        true
      );


      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    };


  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete =
    async (
      student: Student
    ) => {

      /*
        Important UI authorization check
      */

      if (
        !session ||
        session.role !== "principal" ||
        String(session.schoolId) !==
          String(student.schoolId)
      ) {

        setMessage(
          "You are not authorized to delete this student."
        );

        return;
      }


      const confirmed =
        window.confirm(
          `${student.name} cha record delete karaycha aahe ka?`
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


        setMessage(
          "Student deleted successfully."
        );


        await loadStudents();

      }

      catch (error) {

        console.error(
          "Delete error:",
          error
        );

        setMessage(
          "Student delete nahi ho saka."
        );

      }

    };


  /* =========================================================
     CANCEL FORM
  ========================================================= */

  const cancelForm = () => {

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


  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredStudents =
    useMemo(
      () => {

        const searchValue =
          search
            .trim()
            .toLowerCase();


        if (!searchValue) {
          return students;
        }


        return students.filter(
          (student) => {

            return (

              student.name
                .toLowerCase()
                .includes(
                  searchValue
                ) ||

              student.className
                .toLowerCase()
                .includes(
                  searchValue
                ) ||

              student.rollNumber
                .toLowerCase()
                .includes(
                  searchValue
                ) ||

              student.admissionNumber
                .toLowerCase()
                .includes(
                  searchValue
                )

            );

          }
        );

      },
      [
        students,
        search,
      ]
    );


  /* =========================================================
     SECURITY
  ========================================================= */

  if (
    !session ||
    session.role !== "principal" ||
    !session.schoolId
  ) {
    return null;
  }


  /* =========================================================
     UI
  ========================================================= */

  return (

    <div className="private-students-page">


      {/* HEADER */}

      <header className="private-students-header">

        <div>

          <Link
            to="/principal"
            className="private-back-button"
          >

            <ArrowLeft size={17} />

            Dashboard

          </Link>


          <span>
            PRIVATE SCHOOL DATA
          </span>


          <h1>
            Student Management
          </h1>


          <p>
            {session.schoolName}
          </p>


          <small>
            UDISE:{" "}
            {session.udise || "-"}
          </small>

        </div>


        <button
          type="button"
          className="private-add-button"
          onClick={() => {

            setForm(
              emptyForm
            );

            setEditingId(
              null
            );

            setShowForm(
              true
            );

          }}
        >

          <Plus size={18} />

          Add Student

        </button>

      </header>



      <main className="private-students-content">


        {/* SUMMARY */}

        <section className="private-student-summary">

          <div>

            <Users size={24} />

            <span>
              Total Students
            </span>

            <strong>
              {students.length}
            </strong>

          </div>


          <div>

            <UserRound size={24} />

            <span>
              Boys
            </span>

            <strong>

              {
                students.filter(
                  (student) =>
                    student.gender ===
                    "Male"
                ).length
              }

            </strong>

          </div>


          <div>

            <UserRound size={24} />

            <span>
              Girls
            </span>

            <strong>

              {
                students.filter(
                  (student) =>
                    student.gender ===
                    "Female"
                ).length
              }

            </strong>

          </div>

        </section>



        {/* MESSAGE */}

        {message && (

          <div className="private-message">
            {message}
          </div>

        )}



        {/* =================================================
            FORM
        ================================================= */}

        {showForm && (

          <section className="private-student-form-card">

            <div className="private-form-heading">

              <div>

                <span>
                  STUDENT INFORMATION
                </span>

                <h2>

                  {editingId
                    ? "Edit Student"
                    : "Add New Student"}

                </h2>

              </div>


              <button
                type="button"
                onClick={
                  cancelForm
                }
              >

                <X size={20} />

              </button>

            </div>


            <form
              onSubmit={
                handleSubmit
              }
              className="private-student-form"
            >


              {/* NAME */}

              <label>

                <span>
                  Student Name *
                </span>

                <input
                  type="text"
                  value={
                    form.name
                  }
                  onChange={(e) =>
                    handleInput(
                      "name",
                      e.target.value
                    )
                  }
                  placeholder="Full student name"
                  required
                />

              </label>



              {/* DOB */}

              <label>

                <span>
                  Date of Birth *
                </span>

                <input
                  type="date"
                  value={
                    form.dob
                  }
                  onChange={(e) =>
                    handleInput(
                      "dob",
                      e.target.value
                    )
                  }
                  required
                />

              </label>



              {/* AGE */}

              <label>

                <span>
                  Age
                </span>

                <input
                  type="text"
                  value={
                    form.dob
                      ? `${calculateAge(
                          form.dob
                        )} Years`
                      : ""
                  }
                  placeholder="Auto calculated"
                  disabled
                />

              </label>



              {/* GENDER */}

              <label>

                <span>
                  Gender *
                </span>

                <select
                  value={
                    form.gender
                  }
                  onChange={(e) =>
                    handleInput(
                      "gender",
                      e.target.value
                    )
                  }
                  required
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



              {/* CLASS */}

              <label>

                <span>
                  Class *
                </span>

                <select
                  value={
                    form.className
                  }
                  onChange={(e) =>
                    handleInput(
                      "className",
                      e.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    Select Class
                  </option>

                  {Array.from(
                    {
                      length: 12,
                    },
                    (_, index) =>
                      index + 1
                  ).map(
                    (classNumber) => (

                      <option
                        key={
                          classNumber
                        }
                        value={
                          String(
                            classNumber
                          )
                        }
                      >

                        Class{" "}
                        {classNumber}

                      </option>

                    )
                  )}

                </select>

              </label>



              {/* ROLL NUMBER */}

              <label>

                <span>
                  Roll Number
                </span>

                <input
                  type="text"
                  value={
                    form.rollNumber
                  }
                  onChange={(e) =>
                    handleInput(
                      "rollNumber",
                      e.target.value
                    )
                  }
                  placeholder="Example: 12"
                />

              </label>



              {/* ADMISSION NUMBER */}

              <label>

                <span>
                  Admission Number
                </span>

                <input
                  type="text"
                  value={
                    form.admissionNumber
                  }
                  onChange={(e) =>
                    handleInput(
                      "admissionNumber",
                      e.target.value
                    )
                  }
                  placeholder="Example: ADM001"
                />

              </label>



              {/* PARENT */}

              <label>

                <span>
                  Parent / Guardian Name
                </span>

                <input
                  type="text"
                  value={
                    form.parentName
                  }
                  onChange={(e) =>
                    handleInput(
                      "parentName",
                      e.target.value
                    )
                  }
                  placeholder="Parent name"
                />

              </label>



              {/* MOBILE */}

              <label>

                <span>
                  Parent Mobile
                </span>

                <input
                  type="tel"
                  maxLength={10}
                  value={
                    form.mobile
                  }
                  onChange={(e) =>
                    handleInput(
                      "mobile",
                      e.target.value
                        .replace(
                          /\D/g,
                          ""
                        )
                        .slice(
                          0,
                          10
                        )
                    )
                  }
                  placeholder="10 digit mobile"
                />

              </label>



              {/* ADDRESS */}

              <label className="private-full-field">

                <span>
                  Address
                </span>

                <textarea
                  rows={3}
                  value={
                    form.address
                  }
                  onChange={(e) =>
                    handleInput(
                      "address",
                      e.target.value
                    )
                  }
                  placeholder="Student address"
                />

              </label>



              {/* BUTTONS */}

              <div className="private-form-actions">

                <button
                  type="button"
                  className="private-cancel-button"
                  onClick={
                    cancelForm
                  }
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="private-save-button"
                  disabled={
                    saving
                  }
                >

                  <Save size={17} />

                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Student"
                    : "Save Student"}

                </button>

              </div>

            </form>

          </section>

        )}



        {/* =================================================
            SEARCH
        ================================================= */}

        <section className="private-student-toolbar">

          <div className="private-search">

            <Search size={18} />

            <input
              type="search"
              placeholder="Search name, class, roll number or admission number..."
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

        </section>



        {/* =================================================
            STUDENT TABLE
        ================================================= */}

        <section className="private-student-table-card">

          <div className="private-table-title">

            <div>

              <span>
                STUDENT RECORDS
              </span>

              <h2>
                {session.schoolName}
              </h2>

            </div>


            <strong>
              {
                filteredStudents.length
              }{" "}
              Students
            </strong>

          </div>


          {loading ? (

            <div className="private-empty">
              Loading student records...
            </div>

          ) : filteredStudents.length === 0 ? (

            <div className="private-empty">

              <Users size={40} />

              <h3>
                No Student Records
              </h3>

              <p>
                Is school ke liye abhi
                student information add
                nahi ki gayi hai.
              </p>

            </div>

          ) : (

            <div className="private-table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      Student
                    </th>

                    <th>
                      Class
                    </th>

                    <th>
                      Roll No.
                    </th>

                    <th>
                      Gender
                    </th>

                    <th>
                      DOB
                    </th>

                    <th>
                      Age
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
                    (student) => (

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

                          <small>
                            {
                              student.admissionNumber ||
                              "No Admission No."
                            }
                          </small>

                        </td>


                        <td>
                          Class{" "}
                          {
                            student.className
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
                            student.gender
                          }
                        </td>


                        <td>
                          {
                            student.dob
                          }
                        </td>


                        <td>
                          {
                            student.age
                          }
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

                          <div className="private-table-actions">

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  student
                                )
                              }
                              title="Edit"
                            >

                              <Edit3
                                size={16}
                              />

                            </button>


                            <button
                              type="button"
                              className="delete"
                              onClick={() =>
                                handleDelete(
                                  student
                                )
                              }
                              title="Delete"
                            >

                              <Trash2
                                size={16}
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

      </main>

    </div>

  );

}