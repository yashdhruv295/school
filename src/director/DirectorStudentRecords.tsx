import {
  ArrowLeft,
  Users,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  schools,
} from "../data/schools";

import {
  getSession,
} from "../utils/session";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  addDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  db,
} from "../firebase/firebase";


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
  age: string;
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
  age: "",
  gender: "",
  className: "",
  rollNumber: "",
  admissionNumber: "",
  parentName: "",
  mobile: "",
  address: "",
};


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


  const [students, setStudents] =
    useState<StudentRecord[]>([]);

  const [form, setForm] =
    useState<StudentForm>(
      emptyForm
    );

  const [editingId, setEditingId] =
    useState<string | null>(
      null
    );

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  const loadStudents = async () => {

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


      const list =
        snapshot.docs.map(
          (studentDocument) => {

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
                  data.gender ?? ""
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
                  data.mobile ?? ""
                ),

              address:
                String(
                  data.address ?? ""
                ),
            };

          }
        );


      setStudents(list);

    }

    catch (error) {

      console.error(
        "Student records load error:",
        error
      );

    }

    finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    if (
      !session ||
      session.role !== "director"
    ) {

      navigate(
        "/login",
        { replace: true }
      );

      return;

    }


    loadStudents();

  }, [
    schoolId,
  ]);


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

          student.admissionNumber
            .toLowerCase()
            .includes(value)
      );

    }, [
      students,
      search,
    ]);


  const updateField = (
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


  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();


    if (
      !school ||
      !schoolId ||
      !form.name.trim()
    ) {
      return;
    }


    try {

      setSaving(true);


      const payload = {
        ...form,

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
            "students",
            editingId
          ),
          payload
        );

      }

      else {

        await addDoc(
          collection(
            db,
            "students"
          ),
          {
            ...payload,

            createdBy:
              session?.id ?? "",

            createdAt:
              serverTimestamp(),
          }
        );

      }


      setForm(emptyForm);

      setEditingId(null);

      await loadStudents();

    }

    catch (error) {

      console.error(
        "Student record save error:",
        error
      );

    }

    finally {

      setSaving(false);

    }

  };


  const editStudent = (
    student: StudentRecord
  ) => {

    setEditingId(
      student.id
    );


    setForm({
      name:
        student.name,

      dob:
        student.dob,

      age:
        student.age,

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


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  const removeStudent =
    async (
      student: StudentRecord
    ) => {

      const confirmed =
        window.confirm(
          `Delete ${student.name}?`
        );


      if (!confirmed) {
        return;
      }


      await deleteDoc(
        doc(
          db,
          "students",
          student.id
        )
      );


      await loadStudents();

    };


  if (!school) {

    return (
      <div className="director-editor-page">
        <h2>School not found.</h2>
      </div>
    );

  }


  return (

    <div className="director-editor-page">

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
            STUDENT RECORDS
          </span>

          <h1>
            {school.name}
          </h1>

          <p>
            UDISE: {school.udise}
          </p>

        </div>

      </div>


      <form
        className="director-editor-form"
        onSubmit={handleSubmit}
      >

        <div className="director-editor-form-heading">

          <Users size={26} />

          <div>

            <h2>
              {editingId
                ? "Edit Student"
                : "Add Student"}
            </h2>

            <p>
              Individual student record
            </p>

          </div>

        </div>


        <div className="director-editor-grid">

          <label>
            Student Name
            <input
              required
              value={form.name}
              onChange={(e) =>
                updateField(
                  "name",
                  e.target.value
                )
              }
            />
          </label>


          <label>
            Date of Birth
            <input
              type="date"
              value={form.dob}
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
              type="number"
              min="0"
              value={form.age}
              onChange={(e) =>
                updateField(
                  "age",
                  e.target.value
                )
              }
            />
          </label>


          <label>
            Gender

            <select
              value={form.gender}
              onChange={(e) =>
                updateField(
                  "gender",
                  e.target.value
                )
              }
            >
              <option value="">
                Select
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
            Class

            <select
              value={form.className}
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

              {Array.from(
                { length: 12 },
                (_, index) => (
                  <option
                    key={index + 1}
                    value={
                      String(index + 1)
                    }
                  >
                    Class {index + 1}
                  </option>
                )
              )}

            </select>

          </label>


          <label>
            Roll Number
            <input
              value={form.rollNumber}
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
            Parent Name
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
            Mobile
            <input
              value={form.mobile}
              onChange={(e) =>
                updateField(
                  "mobile",
                  e.target.value
                )
              }
            />
          </label>


          <label className="director-editor-full">
            Address
            <textarea
              rows={3}
              value={form.address}
              onChange={(e) =>
                updateField(
                  "address",
                  e.target.value
                )
              }
            />
          </label>

        </div>


        <button
          type="submit"
          className="director-editor-save"
          disabled={saving}
        >

          {saving
            ? "Saving..."
            : editingId
              ? "Update Student"
              : "Add Student"}

        </button>

      </form>


      <section className="director-record-list">

        <div className="director-record-list-header">

          <div>
            <h2>
              Students
            </h2>

            <span>
              {students.length} records
            </span>
          </div>


          <input
            placeholder="Search student..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>


        {loading ? (

          <p>
            Loading students...
          </p>

        ) : filteredStudents.length === 0 ? (

          <p>
            No student records found.
          </p>

        ) : (

          <div className="director-record-table-wrapper">

            <table className="director-record-table">

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Gender</th>
                  <th>Roll</th>
                  <th>Admission</th>
                  <th>Actions</th>
                </tr>
              </thead>


              <tbody>

                {filteredStudents.map(
                  (student) => (

                    <tr key={student.id}>

                      <td>
                        {student.name}
                      </td>

                      <td>
                        {student.className}
                      </td>

                      <td>
                        {student.gender}
                      </td>

                      <td>
                        {student.rollNumber}
                      </td>

                      <td>
                        {student.admissionNumber}
                      </td>

                      <td>

                        <button
                          type="button"
                          onClick={() =>
                            editStudent(
                              student
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeStudent(
                              student
                            )
                          }
                        >
                          Delete
                        </button>

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