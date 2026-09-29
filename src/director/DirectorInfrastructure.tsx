import {
  ArrowLeft,
  Building2,
  Save,
} from "lucide-react";

import {
  useEffect,
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


interface FacilityData {
  drinkingWater: boolean;
  electricity: boolean;
  boysToilet: boolean;
  girlsToilet: boolean;
  library: boolean;
  computer: boolean;
  playground: boolean;
}


interface InfrastructureForm {
  classrooms: number;
  usableClassrooms: number;
  remarks: string;
  facilities: FacilityData;
}


const initialForm: InfrastructureForm = {
  classrooms: 0,
  usableClassrooms: 0,
  remarks: "",

  facilities: {
    drinkingWater: false,
    electricity: false,
    boysToilet: false,
    girlsToilet: false,
    library: false,
    computer: false,
    playground: false,
  },
};


export default function DirectorInfrastructure() {

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
    useState<InfrastructureForm>(
      initialForm
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");


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
              "infrastructureData",
              String(schoolId)
            )
          );


        if (snapshot.exists()) {

          const data =
            snapshot.data();


          setForm({
            classrooms:
              Number(
                data.classrooms
              ) || 0,

            usableClassrooms:
              Number(
                data.usableClassrooms
              ) || 0,

            remarks:
              String(
                data.remarks ??
                ""
              ),

            facilities: {
              drinkingWater:
                Boolean(
                  data.facilities
                    ?.drinkingWater
                ),

              electricity:
                Boolean(
                  data.facilities
                    ?.electricity
                ),

              boysToilet:
                Boolean(
                  data.facilities
                    ?.boysToilet
                ),

              girlsToilet:
                Boolean(
                  data.facilities
                    ?.girlsToilet
                ),

              library:
                Boolean(
                  data.facilities
                    ?.library
                ),

              computer:
                Boolean(
                  data.facilities
                    ?.computer
                ),

              playground:
                Boolean(
                  data.facilities
                    ?.playground
                ),
            },
          });

        }

      }

      catch (error) {

        console.error(
          "Infrastructure load error:",
          error
        );

        setMessage(
          "Infrastructure data could not be loaded."
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


  const updateFacility = (
    field: keyof FacilityData
  ) => {

    setForm(
      (previous) => ({
        ...previous,

        facilities: {
          ...previous.facilities,

          [field]:
            !previous.facilities[
              field
            ],
        },
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
          "infrastructureData",
          String(schoolId)
        ),
        {
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
        },
        {
          merge: true,
        }
      );


      setMessage(
        "Infrastructure data saved successfully."
      );

    }

    catch (error) {

      console.error(
        "Infrastructure save error:",
        error
      );

      setMessage(
        "Infrastructure data could not be saved."
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
            INFRASTRUCTURE
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
          Loading infrastructure...
        </div>

      ) : (

        <form
          className="director-editor-form"
          onSubmit={handleSave}
        >

          <div className="director-editor-form-heading">

            <Building2 size={27} />

            <div>

              <h2>
                Infrastructure
              </h2>

              <p>
                Enter classrooms and
                available facilities.
              </p>

            </div>

          </div>


          <div className="director-editor-grid">

            <label>

              Total Classrooms

              <input
                type="number"
                min="0"
                value={
                  form.classrooms
                }
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,

                      classrooms:
                        Math.max(
                          0,
                          Number(
                            event.target.value
                          ) || 0
                        ),
                    })
                  )
                }
              />

            </label>


            <label>

              Usable Classrooms

              <input
                type="number"
                min="0"
                value={
                  form.usableClassrooms
                }
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,

                      usableClassrooms:
                        Math.max(
                          0,
                          Number(
                            event.target.value
                          ) || 0
                        ),
                    })
                  )
                }
              />

            </label>

          </div>


          <h3 className="director-facility-heading">
            Available Facilities
          </h3>


          <div className="director-facility-grid">

            <Facility
              label="Drinking Water"
              checked={
                form.facilities
                  .drinkingWater
              }
              onChange={() =>
                updateFacility(
                  "drinkingWater"
                )
              }
            />

            <Facility
              label="Electricity"
              checked={
                form.facilities
                  .electricity
              }
              onChange={() =>
                updateFacility(
                  "electricity"
                )
              }
            />

            <Facility
              label="Boys Toilet"
              checked={
                form.facilities
                  .boysToilet
              }
              onChange={() =>
                updateFacility(
                  "boysToilet"
                )
              }
            />

            <Facility
              label="Girls Toilet"
              checked={
                form.facilities
                  .girlsToilet
              }
              onChange={() =>
                updateFacility(
                  "girlsToilet"
                )
              }
            />

            <Facility
              label="Library"
              checked={
                form.facilities
                  .library
              }
              onChange={() =>
                updateFacility(
                  "library"
                )
              }
            />

            <Facility
              label="Computer"
              checked={
                form.facilities
                  .computer
              }
              onChange={() =>
                updateFacility(
                  "computer"
                )
              }
            />

            <Facility
              label="Playground"
              checked={
                form.facilities
                  .playground
              }
              onChange={() =>
                updateFacility(
                  "playground"
                )
              }
            />

          </div>


          <div
            className="director-editor-grid"
            style={{
              marginTop: "20px",
            }}
          >

            <label className="director-editor-full">

              Remarks

              <textarea
                rows={4}
                value={
                  form.remarks
                }
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      remarks:
                        event.target.value,
                    })
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
              : "Save Infrastructure"}

          </button>

        </form>

      )}

    </div>

  );

}


/* =========================================================
   FACILITY
========================================================= */

interface FacilityProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}


function Facility({
  label,
  checked,
  onChange,
}: FacilityProps) {

  return (

    <label className="director-facility-item">

      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />

      <span>
        {label}
      </span>

    </label>

  );

}