import {
  ArrowLeft,
  Save,
  Users,
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
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { db } from "../firebase/firebase";
import { schools } from "../data/schools";
import { getSession } from "../utils/session";


interface TeacherForm {
  headTeacherName: string;
  maleTeachers: number;
  femaleTeachers: number;
  permanentTeachers: number;
  contractTeachers: number;
}


const initialForm: TeacherForm = {
  headTeacherName: "",
  maleTeachers: 0,
  femaleTeachers: 0,
  permanentTeachers: 0,
  contractTeachers: 0,
};


export default function DirectorTeacherData() {

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


  const [form, setForm] =
    useState<TeacherForm>(
      initialForm
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");


  const totalTeachers =
    useMemo(
      () =>
        Number(
          form.maleTeachers
        ) +
        Number(
          form.femaleTeachers
        ),
      [
        form.maleTeachers,
        form.femaleTeachers,
      ]
    );


  useEffect(() => {

    if (
      !session ||
      session.role !== "director" ||
      !schoolId
    ) {

      navigate(
        "/login",
        { replace: true }
      );

      return;

    }


    const loadData = async () => {

      try {

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


          setForm({
            headTeacherName:
              String(
                data.headTeacherName ??
                ""
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

      }

      catch (error) {

        console.error(
          "Teacher load error:",
          error
        );

        setMessage(
          "Teacher data could not be loaded."
        );

      }

      finally {

        setLoading(false);

      }

    };


    loadData();

  }, [
    navigate,
    schoolId,
  ]);


  const updateText = (
    field: keyof TeacherForm,
    value: string
  ) => {

    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );

  };


  const updateNumber = (
    field: keyof TeacherForm,
    value: string
  ) => {

    setForm(
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


  const handleSave = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();


    if (
      !school ||
      !schoolId
    ) {
      return;
    }


    try {

      setSaving(true);
      setMessage("");


      await setDoc(
        doc(
          db,
          "teacherData",
          String(schoolId)
        ),
        {
          ...form,

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
        "Teacher data saved successfully."
      );

    }

    catch (error) {

      console.error(
        "Teacher save error:",
        error
      );

      setMessage(
        "Teacher data could not be saved."
      );

    }

    finally {

      setSaving(false);

    }

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


      {loading ? (

        <div className="director-editor-loading">
          Loading teacher data...
        </div>

      ) : (

        <form
          className="director-editor-form"
          onSubmit={handleSave}
        >

          <div className="director-editor-form-heading">

            <Users size={27} />

            <div>

              <h2>
                Teacher Information
              </h2>

              <p>
                Enter teacher details
                for this school.
              </p>

            </div>

          </div>


          <div className="director-student-total-grid">

            <article>
              <span>Male</span>
              <strong>
                {form.maleTeachers}
              </strong>
            </article>

            <article>
              <span>Female</span>
              <strong>
                {form.femaleTeachers}
              </strong>
            </article>

            <article>
              <span>Total</span>
              <strong>
                {totalTeachers}
              </strong>
            </article>

          </div>


          <div className="director-editor-grid">

            <label className="director-editor-full">

              Head Teacher / Principal Name

              <input
                type="text"
                value={
                  form.headTeacherName
                }
                onChange={(event) =>
                  updateText(
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
                  form.maleTeachers
                }
                onChange={(event) =>
                  updateNumber(
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
                  form.femaleTeachers
                }
                onChange={(event) =>
                  updateNumber(
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
                  form.permanentTeachers
                }
                onChange={(event) =>
                  updateNumber(
                    "permanentTeachers",
                    event.target.value
                  )
                }
              />

            </label>


            <label>

              Contract Teachers

              <input
                type="number"
                min="0"
                value={
                  form.contractTeachers
                }
                onChange={(event) =>
                  updateNumber(
                    "contractTeachers",
                    event.target.value
                  )
                }
              />

            </label>

          </div>


          {message && (

            <div className="director-editor-message">
              {message}
            </div>

          )}


          <button
            type="submit"
            className="director-editor-save"
            disabled={saving}
          >

            <Save size={18} />

            {saving
              ? "Saving..."
              : "Save Teacher Data"}

          </button>

        </form>

      )}

    </div>

  );

}