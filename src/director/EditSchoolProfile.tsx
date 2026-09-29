import {
  ArrowLeft,
  Save,
  School,
} from "lucide-react";

import {
  useEffect,
  useState,
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

import {
  db,
} from "../firebase/firebase";

import {
  schools,
} from "../data/schools";

import {
  getSession,
} from "../utils/session";


interface SchoolProfileForm {

  principalName: string;

  village: string;

  address: string;

  phone: string;

  email: string;

  establishedYear: string;

  classes: string;

  medium: string;

}


const emptyForm: SchoolProfileForm = {

  principalName: "",

  village: "",

  address: "",

  phone: "",

  email: "",

  establishedYear: "",

  classes: "",

  medium: "",

};


export default function EditSchoolProfile() {

  const navigate =
    useNavigate();


  const {
    schoolId,
  } = useParams();


  const session =
    getSession();


  const [
    form,
    setForm,
  ] = useState<SchoolProfileForm>(
    emptyForm
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
    message,
    setMessage,
  ] = useState("");


  const school =
    schools.find(
      (item) =>
        String(item.id) ===
        String(schoolId)
    );


  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  useEffect(() => {

    if (
      !session ||
      session.role !== "director" ||
      !schoolId
    ) {

      navigate(
        "/login",
        {
          replace: true,
        }
      );

      return;

    }


    const loadProfile =
      async () => {

        try {

          setLoading(true);


          const snapshot =
            await getDoc(

              doc(
                db,
                "schoolProfiles",
                String(schoolId)
              )

            );


          if (
            snapshot.exists()
          ) {

            const data =
              snapshot.data();


            setForm({

              principalName:
                String(
                  data.principalName ??
                  ""
                ),

              village:
                String(
                  data.village ??
                  ""
                ),

              address:
                String(
                  data.address ??
                  ""
                ),

              phone:
                String(
                  data.phone ??
                  ""
                ),

              email:
                String(
                  data.email ??
                  ""
                ),

              establishedYear:
                String(
                  data.establishedYear ??
                  ""
                ),

              classes:
                String(
                  data.classes ??
                  ""
                ),

              medium:
                String(
                  data.medium ??
                  ""
                ),

            });

          }

        }

        catch (error) {

          console.error(
            "School profile load error:",
            error
          );


          setMessage(
            "Unable to load school profile."
          );

        }

        finally {

          setLoading(false);

        }

      };


    loadProfile();

  }, [
    navigate,
    schoolId,
    session?.id,
    session?.role,
  ]);


  /* =======================================================
     INPUT
  ======================================================= */

  const updateField = (
    field: keyof SchoolProfileForm,
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
     SAVE
  ======================================================= */

  const handleSave =
    async (
      event:
        React.FormEvent<HTMLFormElement>
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
            "schoolProfiles",
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
          "School profile saved successfully."
        );

      }

      catch (error) {

        console.error(
          "School profile save error:",
          error
        );


        setMessage(
          "Unable to save school profile."
        );

      }

      finally {

        setSaving(false);

      }

    };


  if (!school) {

    return (

      <div className="director-editor-page">

        <h2>
          School not found.
        </h2>

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
            SCHOOL PROFILE
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

          Loading school profile...

        </div>

      ) : (

        <form
          className="director-editor-form"
          onSubmit={
            handleSave
          }
        >


          <div className="director-editor-form-heading">

            <School size={26} />

            <div>

              <h2>
                School Information
              </h2>

              <p>
                Enter or update the
                selected school's information.
              </p>

            </div>

          </div>


          <div className="director-editor-grid">


            <label>

              Principal Name

              <input
                type="text"
                value={
                  form.principalName
                }
                onChange={(event) =>
                  updateField(
                    "principalName",
                    event.target.value
                  )
                }
              />

            </label>


            <label>

              Village

              <input
                type="text"
                value={
                  form.village
                }
                onChange={(event) =>
                  updateField(
                    "village",
                    event.target.value
                  )
                }
              />

            </label>


            <label>

              Phone Number

              <input
                type="tel"
                value={
                  form.phone
                }
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value
                  )
                }
              />

            </label>


            <label>

              Email

              <input
                type="email"
                value={
                  form.email
                }
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
              />

            </label>


            <label>

              Established Year

              <input
                type="number"
                value={
                  form.establishedYear
                }
                onChange={(event) =>
                  updateField(
                    "establishedYear",
                    event.target.value
                  )
                }
              />

            </label>


            <label>

              Classes

              <input
                type="text"
                placeholder="Example: 1 to 5"
                value={
                  form.classes
                }
                onChange={(event) =>
                  updateField(
                    "classes",
                    event.target.value
                  )
                }
              />

            </label>


            <label>

              Medium

              <input
                type="text"
                placeholder="Marathi / English"
                value={
                  form.medium
                }
                onChange={(event) =>
                  updateField(
                    "medium",
                    event.target.value
                  )
                }
              />

            </label>


            <label className="director-editor-full">

              Address

              <textarea
                rows={4}
                value={
                  form.address
                }
                onChange={(event) =>
                  updateField(
                    "address",
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
            disabled={
              saving
            }
          >

            <Save size={18} />

            {saving
              ? "Saving..."
              : "Save School Profile"}

          </button>


        </form>

      )}


    </div>

  );

}