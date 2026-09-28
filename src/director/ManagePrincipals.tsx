import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import {
  ArrowLeft,
  CheckCircle2,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  XCircle,
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

interface Principal {
  id: string;

  name: string;
  username: string;

  schoolId: string;
  schoolName: string;
  udise: string;

  active: boolean;
}


/* =========================================================
   COMPONENT
========================================================= */

export default function ManagePrincipals() {

  const navigate =
    useNavigate();

  const session =
    getSession();


  const [principals, setPrincipals] =
    useState<Principal[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState<"success" | "error">(
      "success"
    );

  const [processingId, setProcessingId] =
    useState<string | null>(null);


  /* =========================================================
     DIRECTOR AUTH CHECK
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
    session?.id,
    session?.role,
  ]);


  /* =========================================================
     LOAD PRINCIPALS
  ========================================================= */

  const loadPrincipals =
    async () => {

      try {

        setLoading(true);

        setMessage("");


        const snapshot =
          await getDocs(
            collection(
              db,
              "users"
            )
          );


        const records: Principal[] =
          [];


        snapshot.forEach(
          (userDocument) => {

            const data =
              userDocument.data();


            const role =
              String(
                data.role || ""
              )
                .trim()
                .toLowerCase();


            /*
              Only Principal accounts
            */

            if (
              role !== "principal"
            ) {
              return;
            }


            records.push({

              id:
                userDocument.id,

              name:
                String(
                  data.name || ""
                ),

              username:
                String(
                  data.username || ""
                ),

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

              active:
                data.active !== false,

            });

          }
        );


        /*
          Sort by school ID
        */

        records.sort(
          (a, b) => {

            const aNumber =
              Number(
                a.schoolId
              );

            const bNumber =
              Number(
                b.schoolId
              );


            if (
              Number.isFinite(aNumber) &&
              Number.isFinite(bNumber)
            ) {

              return (
                aNumber -
                bNumber
              );

            }


            return (
              a.schoolName.localeCompare(
                b.schoolName
              )
            );

          }
        );


        setPrincipals(
          records
        );

      }

      catch (error) {

        console.error(
          "Principal loading error:",
          error
        );


        setMessageType(
          "error"
        );

        setMessage(
          "Principal accounts load nahi ho sake."
        );

      }

      finally {

        setLoading(false);

      }

    };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    if (
      session?.role ===
      "director"
    ) {

      loadPrincipals();

    }

  }, [
    session?.id,
    session?.role,
  ]);


  /* =========================================================
     ENABLE / DISABLE PRINCIPAL
  ========================================================= */

  const handleStatusChange =
    async (
      principal: Principal
    ) => {

      if (
        !session ||
        session.role !==
          "director"
      ) {

        return;

      }


      const newStatus =
        !principal.active;


      const action =
        newStatus
          ? "activate"
          : "deactivate";


      const confirmed =
        window.confirm(

          `Are you sure you want to ${action} ${principal.name}?`

        );


      if (!confirmed) {
        return;
      }


      try {

        setProcessingId(
          principal.id
        );

        setMessage("");


        await updateDoc(
          doc(
            db,
            "users",
            principal.id
          ),
          {
            active:
              newStatus,
          }
        );


        /*
          Update UI without
          reloading whole page
        */

        setPrincipals(
          (previous) =>

            previous.map(
              (item) =>

                item.id ===
                principal.id

                  ? {
                      ...item,

                      active:
                        newStatus,
                    }

                  : item
            )
        );


        setMessageType(
          "success"
        );


        setMessage(

          newStatus

            ? `${principal.name} account activated successfully.`

            : `${principal.name} account deactivated successfully.`

        );

      }

      catch (error) {

        console.error(
          "Principal status error:",
          error
        );


        setMessageType(
          "error"
        );

        setMessage(
          "Principal status update nahi ho saka."
        );

      }

      finally {

        setProcessingId(
          null
        );

      }

    };


  /* =========================================================
     DELETE PRINCIPAL
  ========================================================= */

  const handleDeletePrincipal =
    async (
      principal: Principal
    ) => {

      /*
        Extra UI authorization
      */

      if (
        !session ||
        session.role !==
          "director"
      ) {

        setMessageType(
          "error"
        );

        setMessage(
          "Only Director can delete Principal accounts."
        );

        return;

      }


      /*
        First confirmation
      */

      const confirmed =
        window.confirm(

          `Delete Principal account?\n\nPrincipal: ${principal.name}\nSchool: ${principal.schoolName}\nUsername: ${principal.username}\n\nOnly the Principal login account will be deleted. School and student data will remain saved.`

        );


      if (!confirmed) {
        return;
      }


      /*
        Second confirmation because
        delete is permanent
      */

      const finalConfirmed =
        window.confirm(

          `This action cannot be undone.\n\nAre you sure you want to permanently delete ${principal.name}?`

        );


      if (!finalConfirmed) {
        return;
      }


      try {

        setProcessingId(
          principal.id
        );

        setMessage("");


        /*
          IMPORTANT

          Only users/{principalId}
          gets deleted.

          We are NOT deleting:

          students
          studentData
          teacherData
          schoolProfiles
          infrastructureData
        */

        await deleteDoc(
          doc(
            db,
            "users",
            principal.id
          )
        );


        /*
          Remove deleted principal
          immediately from UI
        */

        setPrincipals(
          (previous) =>

            previous.filter(
              (item) =>
                item.id !==
                principal.id
            )
        );


        setMessageType(
          "success"
        );


        setMessage(

          `${principal.name} ka Principal account successfully delete ho gaya. School data safe hai.`

        );

      }

      catch (error) {

        console.error(
          "Principal delete error:",
          error
        );


        setMessageType(
          "error"
        );

        setMessage(
          "Principal account delete nahi ho saka."
        );

      }

      finally {

        setProcessingId(
          null
        );

      }

    };


  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredPrincipals =
    useMemo(
      () => {

        const value =
          search
            .trim()
            .toLowerCase();


        if (!value) {

          return principals;

        }


        return principals.filter(
          (principal) => {

            return (

              principal.name
                .toLowerCase()
                .includes(
                  value
                ) ||

              principal.username
                .toLowerCase()
                .includes(
                  value
                ) ||

              principal.schoolName
                .toLowerCase()
                .includes(
                  value
                ) ||

              principal.udise
                .toLowerCase()
                .includes(
                  value
                )

            );

          }
        );

      },
      [
        principals,
        search,
      ]
    );


  /* =========================================================
     COUNTS
  ========================================================= */

  const activePrincipals =
    principals.filter(
      (principal) =>
        principal.active
    ).length;


  const inactivePrincipals =
    principals.length -
    activePrincipals;


  /* =========================================================
     SECURITY
  ========================================================= */

  if (
    !session ||
    session.role !== "director"
  ) {

    return null;

  }


  /* =========================================================
     UI
  ========================================================= */

  return (

    <div className="manage-principals-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="manage-principals-header">


        <div>

          <Link
            to="/director"
            className="manage-principals-back"
          >

            <ArrowLeft
              size={17}
            />

            Director Dashboard

          </Link>


          <span>
            DIRECTOR CONTROL PANEL
          </span>


          <h1>
            Manage Principals
          </h1>


          <p>
            View, activate, deactivate
            and delete appointed
            Principal accounts.
          </p>

        </div>



        <Link
          to="/director/create-principal"
          className="manage-principals-add"
        >

          <UserPlus
            size={18}
          />

          Appoint Principal

        </Link>


      </header>



      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="manage-principals-content">


        {/* ===================================================
            SUMMARY
        =================================================== */}

        <section className="principal-summary-grid">


          {/* TOTAL */}

          <article>

            <div className="principal-summary-icon">

              <Users
                size={23}
              />

            </div>


            <div>

              <span>
                Total Principals
              </span>

              <strong>
                {principals.length}
              </strong>

            </div>

          </article>



          {/* ACTIVE */}

          <article>

            <div className="principal-summary-icon active">

              <CheckCircle2
                size={23}
              />

            </div>


            <div>

              <span>
                Active
              </span>

              <strong>
                {activePrincipals}
              </strong>

            </div>

          </article>



          {/* INACTIVE */}

          <article>

            <div className="principal-summary-icon inactive">

              <XCircle
                size={23}
              />

            </div>


            <div>

              <span>
                Inactive
              </span>

              <strong>
                {inactivePrincipals}
              </strong>

            </div>

          </article>


        </section>



        {/* ===================================================
            MESSAGE
        =================================================== */}

        {message && (

          <div
            className={
              messageType ===
              "success"

                ? "principal-message success"

                : "principal-message error"
            }
          >

            {message}

          </div>

        )}



        {/* ===================================================
            TOOLBAR
        =================================================== */}

        <section className="principal-toolbar">


          <div className="principal-search">

            <Search
              size={18}
            />


            <input

              type="search"

              placeholder="Search Principal, username, school or UDISE..."

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
            className="principal-refresh-button"
            onClick={
              loadPrincipals
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



        {/* ===================================================
            TABLE CARD
        =================================================== */}

        <section className="principal-table-card">


          <div className="principal-table-heading">

            <div>

              <span>
                PRINCIPAL ACCOUNTS
              </span>

              <h2>
                Appointed Principals
              </h2>

            </div>


            <strong>

              {
                filteredPrincipals.length
              }{" "}

              Records

            </strong>

          </div>



          {/* LOADING */}

          {loading ? (

            <div className="principal-empty">

              <RefreshCw
                size={35}
              />

              <h3>
                Loading Principals...
              </h3>

            </div>

          ) : filteredPrincipals.length === 0 ? (

            /* EMPTY */

            <div className="principal-empty">

              <Users
                size={42}
              />

              <h3>
                No Principal Found
              </h3>

              <p>
                Abhi koi matching
                Principal account nahi hai.
              </p>


              <Link
                to="/director/create-principal"
              >

                Appoint Principal

              </Link>

            </div>

          ) : (

            /* TABLE */

            <div className="principal-table-wrapper">

              <table>


                <thead>

                  <tr>

                    <th>
                      Principal
                    </th>

                    <th>
                      Username
                    </th>

                    <th>
                      School
                    </th>

                    <th>
                      UDISE
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>



                <tbody>

                  {filteredPrincipals.map(
                    (principal) => {

                      const processing =
                        processingId ===
                        principal.id;


                      return (

                        <tr
                          key={
                            principal.id
                          }
                        >


                          {/* PRINCIPAL */}

                          <td>

                            <div className="principal-person">

                              <div className="principal-avatar">

                                {principal.name
                                  ?.charAt(0)
                                  .toUpperCase() ||
                                  "P"}

                              </div>


                              <div>

                                <strong>

                                  {principal.name ||
                                    "Principal"}

                                </strong>

                                <small>
                                  Principal
                                </small>

                              </div>

                            </div>

                          </td>



                          {/* USERNAME */}

                          <td>

                            <span className="principal-username">

                              {
                                principal.username ||
                                "-"
                              }

                            </span>

                          </td>



                          {/* SCHOOL */}

                          <td>

                            <div className="principal-school">

                              <strong>

                                {principal.schoolName ||
                                  "School not assigned"}

                              </strong>


                              <small>

                                School ID:{" "}

                                {principal.schoolId ||
                                  "-"}

                              </small>

                            </div>

                          </td>



                          {/* UDISE */}

                          <td>

                            {principal.udise ||
                              "-"}

                          </td>



                          {/* STATUS */}

                          <td>

                            <span
                              className={
                                principal.active

                                  ? "principal-status active"

                                  : "principal-status inactive"
                              }
                            >

                              {principal.active
                                ? "Active"
                                : "Inactive"}

                            </span>

                          </td>



                          {/* ACTIONS */}

                          <td>

                            <div className="principal-actions">


                              {/* ACTIVATE / DEACTIVATE */}

                              <button
                                type="button"
                                className={
                                  principal.active

                                    ? "principal-status-button deactivate"

                                    : "principal-status-button activate"
                                }
                                disabled={
                                  processing
                                }
                                onClick={() =>
                                  handleStatusChange(
                                    principal
                                  )
                                }
                                title={
                                  principal.active

                                    ? "Deactivate Principal"

                                    : "Activate Principal"
                                }
                              >

                                <Power
                                  size={15}
                                />


                                {processing

                                  ? "Please wait..."

                                  : principal.active

                                  ? "Deactivate"

                                  : "Activate"}

                              </button>



                              {/* DELETE */}

                              <button
                                type="button"
                                className="principal-delete-button"
                                disabled={
                                  processing
                                }
                                onClick={() =>
                                  handleDeletePrincipal(
                                    principal
                                  )
                                }
                                title="Delete Principal"
                              >

                                <Trash2
                                  size={15}
                                />

                                Delete

                              </button>


                            </div>

                          </td>


                        </tr>

                      );

                    }
                  )}

                </tbody>


              </table>

            </div>

          )}


        </section>



        {/* ===================================================
            SECURITY NOTE
        =================================================== */}

        <section className="principal-security-note">

          <ShieldCheck
            size={21}
          />

          <div>

            <strong>
              Account Management
            </strong>

            <p>
              Deleting a Principal
              removes only that Principal
              login account. School,
              student, teacher and
              infrastructure information
              remains stored.
            </p>

          </div>

        </section>


      </main>


    </div>

  );

}