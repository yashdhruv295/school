import { ArrowLeft, Save, GraduationCap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

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


interface ClassData {
  className: string;
  boys: number;
  girls: number;
}


const createClasses = (): ClassData[] =>
  Array.from(
    { length: 12 },
    (_, index) => ({
      className: String(index + 1),
      boys: 0,
      girls: 0,
    })
  );


export default function DirectorStudentData() {

  const navigate = useNavigate();

  const { schoolId } = useParams();

  const session = getSession();


  const school = schools.find(
    (item) =>
      String(item.id) ===
      String(schoolId)
  );


  const [classes, setClasses] =
    useState<ClassData[]>(
      createClasses()
    );


  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");


  /* =====================================================
     LOAD DATA
  ===================================================== */

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

        setLoading(true);

        const snapshot =
          await getDoc(
            doc(
              db,
              "studentData",
              String(schoolId)
            )
          );


        if (snapshot.exists()) {

          const data =
            snapshot.data();

          if (
            Array.isArray(data.classes)
          ) {

            const loadedClasses =
              createClasses();


            data.classes.forEach(
              (item: any) => {

                const classNumber =
                  Number(
                    String(
                      item.className ?? ""
                    ).match(/\d+/)?.[0]
                  );


                if (
                  classNumber >= 1 &&
                  classNumber <= 12
                ) {

                  loadedClasses[
                    classNumber - 1
                  ] = {
                    className:
                      String(classNumber),

                    boys:
                      Number(
                        item.boys
                      ) || 0,

                    girls:
                      Number(
                        item.girls
                      ) || 0,
                  };

                }

              }
            );


            setClasses(
              loadedClasses
            );

          }

        }

      }

      catch (error) {

        console.error(
          "Student data load error:",
          error
        );

        setMessage(
          "Student data could not be loaded."
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


  /* =====================================================
     TOTALS
  ===================================================== */

  const totals = useMemo(() => {

    const boys =
      classes.reduce(
        (total, item) =>
          total +
          Number(item.boys || 0),
        0
      );


    const girls =
      classes.reduce(
        (total, item) =>
          total +
          Number(item.girls || 0),
        0
      );


    return {
      boys,
      girls,
      total: boys + girls,
    };

  }, [classes]);


  /* =====================================================
     UPDATE CLASS
  ===================================================== */

  const updateClass = (
    index: number,
    field: "boys" | "girls",
    value: string
  ) => {

    const number =
      Math.max(
        0,
        Number(value) || 0
      );


    setClasses(
      (previous) =>
        previous.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]: number,
                }
              : item
        )
    );

  };


  /* =====================================================
     SAVE
  ===================================================== */

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
          "studentData",
          String(schoolId)
        ),
        {
          schoolId:
            String(school.id),

          schoolName:
            school.name,

          udise:
            school.udise,

          classes,

          totalBoys:
            totals.boys,

          totalGirls:
            totals.girls,

          totalStudents:
            totals.total,

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
        "Student summary saved successfully."
      );

    }

    catch (error) {

      console.error(
        "Student save error:",
        error
      );

      setMessage(
        "Student data could not be saved."
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
            STUDENT SUMMARY
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
          Loading student data...
        </div>

      ) : (

        <form
          className="director-editor-form"
          onSubmit={handleSave}
        >

          <div className="director-editor-form-heading">

            <GraduationCap size={27} />

            <div>

              <h2>
                Class-wise Student Data
              </h2>

              <p>
                Enter boys and girls
                for each class.
              </p>

            </div>

          </div>


          <div className="director-student-total-grid">

            <article>
              <span>Boys</span>
              <strong>
                {totals.boys}
              </strong>
            </article>

            <article>
              <span>Girls</span>
              <strong>
                {totals.girls}
              </strong>
            </article>

            <article>
              <span>Total Students</span>
              <strong>
                {totals.total}
              </strong>
            </article>

          </div>


          <div className="director-class-table-wrapper">

            <table className="director-class-table">

              <thead>

                <tr>
                  <th>Class</th>
                  <th>Boys</th>
                  <th>Girls</th>
                  <th>Total</th>
                </tr>

              </thead>


              <tbody>

                {classes.map(
                  (item, index) => (

                    <tr
                      key={
                        item.className
                      }
                    >

                      <td>
                        Class{" "}
                        {item.className}
                      </td>

                      <td>
                        <input
                          type="number"
                          min="0"
                          value={
                            item.boys
                          }
                          onChange={(event) =>
                            updateClass(
                              index,
                              "boys",
                              event.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          min="0"
                          value={
                            item.girls
                          }
                          onChange={(event) =>
                            updateClass(
                              index,
                              "girls",
                              event.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <strong>
                          {Number(
                            item.boys
                          ) +
                            Number(
                              item.girls
                            )}
                        </strong>
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

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
              : "Save Student Data"}

          </button>

        </form>

      )}

    </div>

  );

}