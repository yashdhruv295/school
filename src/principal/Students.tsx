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
  CalendarDays,
  Edit3,
  GraduationCap,
  Plus,
  RefreshCw,
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
import { getSession } from "../utils/session";


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

  createdBy: string;
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

const initialForm: StudentForm = {
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
   CLASS OPTIONS
========================================================= */

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
   AGE CALCULATION
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


  if (
    Number.isNaN(
      birthDate.getTime()
    )
  ) {
    return 0;
  }


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


  return Math.max(
    age,
    0
  );
}


/* =========================================================
   COMPONENT
========================================================= */

export default function Students() {

  const navigate =
    useNavigate();


  const session =
    getSession();


  /* =======================================================
     STATE
  ======================================================= */

  const [
    students,
    setStudents,
  ] = useState<Student[]>([]);


  const [
    form,
    setForm,
  ] = useState<StudentForm>(
    initialForm
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    showForm,
    setShowForm,
  ] = useState(false);


  const [
    editingId,
    setEditingId,
  ] = useState<string | null>(
    null
  );


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    messageType,
    setMessageType,
  ] = useState<
    "success" | "error"
  >("success");


  /* =======================================================
     PRINCIPAL AUTH CHECK
  ======================================================= */

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


  /* =======================================================
     LOAD STUDENTS
  ======================================================= */

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

        setMessage("");


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
                    data.age || 0
                  ),

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
                    data.admissionNumber ||
                    ""
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

                createdBy:
                  String(
                    data.createdBy || ""
                  ),

              };

            }
          );


        /*
          Sort by Class and
          Roll Number
        */

        records.sort(
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
              classA !== classB
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
              rollA !== rollB
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


        setStudents(
          records
        );

      }

      catch (error) {

        console.error(
          "Student loading error:",
          error
        );


        setMessageType(
          "error"
        );

        setMessage(
          "Student records load nahi ho sake."
        );

      }

      finally {

        setLoading(false);

      }

    };


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {

    if (
      session?.role ===
        "principal" &&
      session?.schoolId
    ) {

      loadStudents();

    }

  }, [
    session?.id,
    session?.role,
    session?.schoolId,
  ]);


  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  const handleChange = (
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


  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {

    setForm(
      initialForm
    );

    setEditingId(
      null
    );

    setShowForm(
      false
    );

  };


  /* =======================================================
     ADD STUDENT
  ======================================================= */

  const openAddStudent =
    () => {

      setMessage("");

      setEditingId(
        null
      );

      setForm(
        initialForm
      );

      setShowForm(
        true
      );

    };


  /* =======================================================
     EDIT STUDENT
  ======================================================= */

  const handleEdit = (
    student: Student
  ) => {

    /*
      Extra safety check:
      Principal should edit
      only own school student.
    */

    if (
      String(
        student.schoolId
      ) !==
      String(
        session?.schoolId
      )
    ) {

      setMessageType(
        "error"
      );

      setMessage(
        "You cannot edit another school's student."
      );

      return;

    }


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

    setShowForm(
      true
    );


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm =
    (): string | null => {

      if (
        form.name.trim().length <
        2
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


      const today =
        new Date();


      if (
        selectedDOB >
        today
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


      if (!form.className) {

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
     SAVE STUDENT
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
          "principal" ||
        !session.schoolId
      ) {

        setMessageType(
          "error"
        );

        setMessage(
          "Principal session not found."
        );

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


        const age =
          calculateAge(
            form.dob
          );


        const studentData = {

          schoolId:
            String(
              session.schoolId
            ),

          schoolName:
            session.schoolName ||
            "",

          udise:
            session.udise ||
            "",


          name:
            form.name.trim(),

          dob:
            form.dob,

          age,

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


        /* ===============================================
           UPDATE
        =============================================== */

        if (
          editingId
        ) {

          /*
            Make sure record being edited
            belongs to current Principal's
            school.
          */

          const currentStudent =
            students.find(
              (student) =>
                student.id ===
                editingId
            );


          if (
            !currentStudent ||
            String(
              currentStudent.schoolId
            ) !==
            String(
              session.schoolId
            )
          ) {

            throw new Error(
              "Unauthorized student update."
            );

          }


          await updateDoc(

            doc(
              db,
              "students",
              editingId
            ),

            studentData

          );


          setMessageType(
            "success"
          );

          setMessage(
            "Student information successfully updated."
          );

        }

        /* ===============================================
           CREATE
        =============================================== */

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


          setMessageType(
            "success"
          );

          setMessage(
            "Student successfully added."
          );

        }


        /*
          Close form
        */

        setForm(
          initialForm
        );

        setEditingId(
          null
        );

        setShowForm(
          false
        );


        /*
          Refresh records
        */

        await loadStudents();

      }

      catch (error) {

        console.error(
          "Student save error:",
          error
        );


        setMessageType(
          "error"
        );

        setMessage(
          "Student information save nahi ho saki."
        );

      }

      finally {

        setSaving(false);

      }

    };


  /* =======================================================
     DELETE STUDENT
  ======================================================= */

  const handleDelete =
    async (
      student: Student
    ) => {

      if (
        !session ||
        session.role !==
          "principal" ||
        !session.schoolId
      ) {

        return;

      }


      /*
        Principal must not delete
        another school's record.
      */

      if (
        String(
          student.schoolId
        ) !==
        String(
          session.schoolId
        )
      ) {

        setMessageType(
          "error"
        );

        setMessage(
          "You cannot delete another school's student."
        );

        return;

      }


      const confirmed =
        window.confirm(

          `Delete student?\n\nName: ${student.name}\nClass: ${student.className}\n\nThis action cannot be undone.`

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


        setStudents(
          (previous) =>

            previous.filter(
              (item) =>
                item.id !==
                student.id
            )
        );


        setMessageType(
          "success"
        );

        setMessage(
          `${student.name} ka student record delete ho gaya.`
        );

      }

      catch (error) {

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
     SEARCH FILTER
  ======================================================= */

  const filteredStudents =
    useMemo(
      () => {

        const value =
          search
            .trim()
            .toLowerCase();


        if (!value) {

          return students;

        }


        return students.filter(
          (student) => {

            return (

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

          }
        );

      },
      [
        students,
        search,
      ]
    );


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
          gender === "male" ||
          gender === "boy" ||
          gender === "boys"
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
          gender === "female" ||
          gender === "girl" ||
          gender === "girls"
        );

      }
    ).length;


  /* =======================================================
     SECURITY
  ======================================================= */

  if (
    !session ||
    session.role !==
      "principal" ||
    !session.schoolId
  ) {

    return null;

  }


  /* =======================================================
     UI
  ======================================================= */

  return (

    <div className="private-students-page">


      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="private-students-header">


        <div>

          <Link
            to="/principal"
            className="private-back-button"
          >

            <ArrowLeft
              size={17}
            />

            Dashboard

          </Link>


          <span>
            PRINCIPAL PANEL
          </span>


          <h1>
            Student Records
          </h1>


          <p>

            {session.schoolName ||
              "Assigned School"}

          </p>


          {session.udise && (

            <small>
              UDISE:{" "}
              {session.udise}
            </small>

          )}

        </div>



        <button
          type="button"
          className="private-add-button"
          onClick={
            openAddStudent
          }
        >

          <Plus
            size={18}
          />

          Add Student

        </button>


      </header>



      {/* ===================================================
          CONTENT
      =================================================== */}

      <main className="private-students-content">


        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="private-student-summary">


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
              School
            </span>

            <strong
              style={{
                fontSize: "14px",
              }}
            >

              {session.schoolId}

            </strong>

          </article>


        </section>



        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (

          <div
            className={
              messageType ===
              "success"

                ? "private-message success"

                : "private-message error"
            }
          >

            {message}

          </div>

        )}



        {/* =================================================
            ADD / EDIT FORM
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
                  resetForm
                }
                title="Close"
              >

                <X
                  size={20}
                />

              </button>

            </div>



            <form
              className="private-student-form"
              onSubmit={
                handleSubmit
              }
            >


              {/* STUDENT NAME */}

              <div className="private-full-field">

                <label>
                  Student Full Name *
                </label>

                <input
                  type="text"
                  placeholder="Enter student full name"
                  value={
                    form.name
                  }
                  onChange={(event) =>
                    handleChange(
                      "name",
                      event.target.value
                    )
                  }
                  required
                />

              </div>



              {/* DOB */}

              <div>

                <label>
                  Date of Birth *
                </label>

                <input
                  type="date"
                  value={
                    form.dob
                  }
                  max={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={(event) =>
                    handleChange(
                      "dob",
                      event.target.value
                    )
                  }
                  required
                />

              </div>



              {/* AGE */}

              <div>

                <label>
                  Age
                </label>

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

              </div>



              {/* GENDER */}

              <div>

                <label>
                  Gender *
                </label>

                <select
                  value={
                    form.gender
                  }
                  onChange={(event) =>
                    handleChange(
                      "gender",
                      event.target.value
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

              </div>



              {/* CLASS */}

              <div>

                <label>
                  Class *
                </label>

                <select
                  value={
                    form.className
                  }
                  onChange={(event) =>
                    handleChange(
                      "className",
                      event.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    Select Class
                  </option>


                  {classOptions.map(
                    (className) => (

                      <option
                        key={
                          className
                        }
                        value={
                          className
                        }
                      >

                        Class{" "}
                        {className}

                      </option>

                    )
                  )}

                </select>

              </div>



              {/* ROLL */}

              <div>

                <label>
                  Roll Number
                </label>

                <input
                  type="text"
                  placeholder="Example: 12"
                  value={
                    form.rollNumber
                  }
                  onChange={(event) =>
                    handleChange(
                      "rollNumber",
                      event.target.value
                    )
                  }
                />

              </div>



              {/* ADMISSION */}

              <div>

                <label>
                  Admission Number
                </label>

                <input
                  type="text"
                  placeholder="Admission number"
                  value={
                    form.admissionNumber
                  }
                  onChange={(event) =>
                    handleChange(
                      "admissionNumber",
                      event.target.value
                    )
                  }
                />

              </div>



              {/* PARENT */}

              <div>

                <label>
                  Parent / Guardian Name
                </label>

                <input
                  type="text"
                  placeholder="Parent or guardian name"
                  value={
                    form.parentName
                  }
                  onChange={(event) =>
                    handleChange(
                      "parentName",
                      event.target.value
                    )
                  }
                />

              </div>



              {/* MOBILE */}

              <div>

                <label>
                  Parent Mobile Number
                </label>

                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10 digit mobile number"
                  value={
                    form.mobile
                  }
                  onChange={(event) => {

                    const value =
                      event.target.value
                        .replace(
                          /\D/g,
                          ""
                        )
                        .slice(
                          0,
                          10
                        );


                    handleChange(
                      "mobile",
                      value
                    );

                  }}
                />

              </div>



              {/* ADDRESS */}

              <div className="private-full-field">

                <label>
                  Address
                </label>

                <textarea
                  rows={3}
                  placeholder="Student address"
                  value={
                    form.address
                  }
                  onChange={(event) =>
                    handleChange(
                      "address",
                      event.target.value
                    )
                  }
                />

              </div>



              {/* ACTIONS */}

              <div className="private-form-actions">


                <button
                  type="button"
                  className="private-cancel-button"
                  onClick={
                    resetForm
                  }
                  disabled={
                    saving
                  }
                >

                  <X
                    size={16}
                  />

                  Cancel

                </button>



                <button
                  type="submit"
                  className="private-save-button"
                  disabled={
                    saving
                  }
                >

                  <Save
                    size={16}
                  />


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

            <Search
              size={18}
            />

            <input
              type="search"
              placeholder="Search by name, class, roll no., admission no., parent or mobile..."
              value={
                search
              }
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>



          <button
            type="button"
            onClick={
              loadStudents
            }
            disabled={
              loading
            }
          >

            <RefreshCw
              size={17}
            />

            Refresh

          </button>


        </section>



        {/* =================================================
            TABLE
        ================================================= */}

        <section className="private-student-table-card">


          <div className="private-table-title">

            <div>

              <span>
                PRIVATE SCHOOL DATA
              </span>

              <h2>
                Student List
              </h2>

            </div>


            <strong>

              {
                filteredStudents.length
              }{" "}

              Records

            </strong>

          </div>



          {loading ? (

            <div className="private-empty">

              <RefreshCw
                size={35}
              />

              <h3>
                Loading Students...
              </h3>

            </div>

          ) : filteredStudents.length ===
            0 ? (

            <div className="private-empty">

              <GraduationCap
                size={45}
              />

              <h3>
                No Student Found
              </h3>

              <p>

                {search
                  ? "Search ke according koi student nahi mila."
                  : "Abhi is school me individual student records add nahi kiye gaye hain."}

              </p>


              {!search && (

                <button
                  type="button"
                  onClick={
                    openAddStudent
                  }
                >

                  <Plus
                    size={16}
                  />

                  Add First Student

                </button>

              )}

            </div>

          ) : (

            <div className="private-table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      #
                    </th>

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
                      Admission No.
                    </th>

                    <th>
                      Parent
                    </th>

                    <th>
                      Mobile
                    </th>

                    <th>
                      Address
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredStudents.map(
                    (
                      student,
                      index
                    ) => (

                      <tr
                        key={
                          student.id
                        }
                      >


                        {/* SERIAL */}

                        <td>
                          {index + 1}
                        </td>



                        {/* NAME */}

                        <td>

                          <div className="principal-person">

                            <div className="principal-avatar">

                              {student.name
                                .charAt(0)
                                .toUpperCase() ||
                                "S"}

                            </div>


                            <div>

                              <strong>

                                {
                                  student.name
                                }

                              </strong>

                              <small>
                                Student
                              </small>

                            </div>

                          </div>

                        </td>



                        {/* CLASS */}

                        <td>

                          <strong>

                            Class{" "}
                            {
                              student.className
                            }

                          </strong>

                        </td>



                        {/* ROLL */}

                        <td>

                          {student.rollNumber ||
                            "-"}

                        </td>



                        {/* GENDER */}

                        <td>

                          {
                            student.gender ||
                            "-"
                          }

                        </td>



                        {/* DOB */}

                        <td>

                          <span
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: "5px",
                            }}
                          >

                            <CalendarDays
                              size={13}
                            />

                            {student.dob ||
                              "-"}

                          </span>

                        </td>



                        {/* AGE */}

                        <td>

                          {
                            student.age
                          }{" "}

                          Years

                        </td>



                        {/* ADMISSION */}

                        <td>

                          {student.admissionNumber ||
                            "-"}

                        </td>



                        {/* PARENT */}

                        <td>

                          {student.parentName ||
                            "-"}

                        </td>



                        {/* MOBILE */}

                        <td>

                          {student.mobile ||
                            "-"}

                        </td>



                        {/* ADDRESS */}

                        <td>

                          {student.address ||
                            "-"}

                        </td>



                        {/* ACTIONS */}

                        <td>

                          <div className="private-table-actions">


                            <button
                              type="button"
                              className="edit"
                              title="Edit Student"
                              onClick={() =>
                                handleEdit(
                                  student
                                )
                              }
                            >

                              <Edit3
                                size={15}
                              />

                              Edit

                            </button>



                            <button
                              type="button"
                              className="delete"
                              title="Delete Student"
                              onClick={() =>
                                handleDelete(
                                  student
                                )
                              }
                            >

                              <Trash2
                                size={15}
                              />

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


      </main>


    </div>

  );
}