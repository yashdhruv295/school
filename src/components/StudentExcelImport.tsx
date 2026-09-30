import {
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
} from "react";

import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
  X,
} from "lucide-react";

import * as XLSX from "xlsx";

import { db } from "../firebase/firebase";


/* =========================================================
   TYPES
========================================================= */

interface ExcelStudentRow {
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

  valid: boolean;
  error: string;
}


interface StudentExcelImportProps {
  schoolId: string;
  schoolName: string;
  udise: string;

  userId: string;
  userRole: "principal" | "director";

  onImportComplete: () => Promise<void> | void;
}


/* =========================================================
   HELPERS
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

  return Math.max(
    age,
    0
  );
}


/* =========================================================
   NORMALIZE HEADER
========================================================= */

function normalizeHeader(
  value: string
): string {

  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}


/* =========================================================
   FIND VALUE
========================================================= */

function findValue(
  row: Record<string, unknown>,
  possibleHeaders: string[]
): string {

  const normalizedHeaders =
    possibleHeaders.map(
      normalizeHeader
    );

  for (
    const [key, value]
    of Object.entries(row)
  ) {

    if (
      normalizedHeaders.includes(
        normalizeHeader(key)
      )
    ) {

      if (
        value === null ||
        value === undefined
      ) {
        return "";
      }

      return String(value).trim();
    }

  }

  return "";
}


/* =========================================================
   EXCEL DATE -> YYYY-MM-DD
========================================================= */

function normalizeDate(
  value: unknown
): string {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }


  /* Excel serial date */

  if (
    typeof value === "number"
  ) {

    const parsed =
      XLSX.SSF.parse_date_code(
        value
      );

    if (parsed) {

      const year =
        String(parsed.y);

      const month =
        String(parsed.m)
          .padStart(2, "0");

      const day =
        String(parsed.d)
          .padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

  }


  const text =
    String(value).trim();


  /* Already YYYY-MM-DD */

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      text
    )
  ) {
    return text;
  }


  /* DD/MM/YYYY */

  const slashMatch =
    text.match(
      /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/
    );

  if (slashMatch) {

    const day =
      slashMatch[1]
        .padStart(2, "0");

    const month =
      slashMatch[2]
        .padStart(2, "0");

    const year =
      slashMatch[3];

    return `${year}-${month}-${day}`;
  }


  const parsedDate =
    new Date(text);

  if (
    !Number.isNaN(
      parsedDate.getTime()
    )
  ) {

    return parsedDate
      .toISOString()
      .split("T")[0];

  }


  return "";
}


/* =========================================================
   GENDER NORMALIZATION
========================================================= */

function normalizeGender(
  value: string
): string {

  const gender =
    value
      .trim()
      .toLowerCase();

  if (
    gender === "male" ||
    gender === "boy" ||
    gender === "boys" ||
    gender === "m"
  ) {
    return "Male";
  }

  if (
    gender === "female" ||
    gender === "girl" ||
    gender === "girls" ||
    gender === "f"
  ) {
    return "Female";
  }

  if (
    gender === "other" ||
    gender === "o"
  ) {
    return "Other";
  }

  return value.trim();
}


/* =========================================================
   VALIDATE ROW
========================================================= */

function validateRow(
  row: ExcelStudentRow
): string {

  if (
    row.name.trim().length < 2
  ) {
    return "Student Name missing";
  }


  if (!row.dob) {
    return "Date of Birth missing/invalid";
  }


  const dob =
    new Date(row.dob);

  if (
    Number.isNaN(
      dob.getTime()
    )
  ) {
    return "Invalid Date of Birth";
  }


  if (
    dob >
    new Date()
  ) {
    return "DOB cannot be future date";
  }


  if (
    ![
      "Male",
      "Female",
      "Other",
    ].includes(row.gender)
  ) {
    return "Gender must be Male/Female/Other";
  }


  if (
    !row.className ||
    Number(row.className) < 1 ||
    Number(row.className) > 12
  ) {
    return "Class must be 1 to 12";
  }


  if (
    row.mobile &&
    !/^[6-9]\d{9}$/.test(
      row.mobile
    )
  ) {
    return "Invalid mobile number";
  }


  return "";
}


/* =========================================================
   COMPONENT
========================================================= */

export default function StudentExcelImport({
  schoolId,
  schoolName,
  udise,
  userId,
  userRole,
  onImportComplete,
}: StudentExcelImportProps) {

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );


  const [
    rows,
    setRows,
  ] =
    useState<ExcelStudentRow[]>([]);


  const [
    fileName,
    setFileName,
  ] =
    useState("");


  const [
    importing,
    setImporting,
  ] =
    useState(false);


  const [
    progress,
    setProgress,
  ] =
    useState(0);


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
      "error" |
      "info"
    >("info");


  /* =======================================================
     DOWNLOAD TEMPLATE
  ======================================================= */

  const downloadTemplate =
    () => {

      const templateData = [

        {
          "Student Name":
            "Rahul Patle",

          "Date of Birth":
            "2013-05-12",

          "Gender":
            "Male",

          "Class":
            "8",

          "Roll Number":
            "1",

          "Admission Number":
            "ADM001",

          "Parent Name":
            "Ramesh Patle",

          "Mobile":
            "9876543210",

          "Address":
            "Kattipar",
        },

        {
          "Student Name":
            "Priya Meshram",

          "Date of Birth":
            "2013-08-21",

          "Gender":
            "Female",

          "Class":
            "8",

          "Roll Number":
            "2",

          "Admission Number":
            "ADM002",

          "Parent Name":
            "Suresh Meshram",

          "Mobile":
            "9876543211",

          "Address":
            "Kattipar",
        },

      ];


      const worksheet =
        XLSX.utils.json_to_sheet(
          templateData
        );


      worksheet["!cols"] = [

        { wch: 25 },
        { wch: 16 },
        { wch: 12 },
        { wch: 10 },
        { wch: 14 },
        { wch: 20 },
        { wch: 25 },
        { wch: 16 },
        { wch: 35 },

      ];


      const workbook =
        XLSX.utils.book_new();


      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Students"
      );


      XLSX.writeFile(
        workbook,
        `student-import-template-${schoolId}.xlsx`
      );

    };


  /* =======================================================
     READ EXCEL
  ======================================================= */

  const handleFile =
    async (
      event:
        ChangeEvent<HTMLInputElement>
    ) => {

      const file =
        event.target.files?.[0];


      if (!file) {
        return;
      }


      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase();


      if (
        extension !== "xlsx" &&
        extension !== "xls"
      ) {

        setMessageType("error");

        setMessage(
          "Please select only .xlsx or .xls Excel file."
        );

        return;
      }


      try {

        setMessage("");

        setRows([]);

        setFileName(
          file.name
        );


        const buffer =
          await file.arrayBuffer();


        const workbook =
          XLSX.read(
            buffer,
            {
              type: "array",
              cellDates: false,
            }
          );


        const firstSheetName =
          workbook.SheetNames[0];


        if (!firstSheetName) {

          throw new Error(
            "Excel sheet not found."
          );

        }


        const worksheet =
          workbook.Sheets[
            firstSheetName
          ];


        const rawRows =
          XLSX.utils.sheet_to_json<
            Record<string, unknown>
          >(
            worksheet,
            {
              defval: "",
              raw: true,
            }
          );


        if (
          rawRows.length === 0
        ) {

          setMessageType(
            "error"
          );

          setMessage(
            "Excel file me student records nahi mile."
          );

          return;
        }


        const parsedRows:
          ExcelStudentRow[] =
          rawRows.map(
            (rawRow) => {

              /* DOB can be raw number */

              let dobValue:
                unknown = "";


              for (
                const [key, value]
                of Object.entries(
                  rawRow
                )
              ) {

                const normalized =
                  normalizeHeader(key);


                if (
                  [
                    "dateofbirth",
                    "dob",
                    "birthdate",
                  ].includes(
                    normalized
                  )
                ) {

                  dobValue =
                    value;

                  break;
                }

              }


              const mobile =
                findValue(
                  rawRow,
                  [
                    "Mobile",
                    "Mobile Number",
                    "Parent Mobile",
                    "Parent Mobile Number",
                    "Phone",
                  ]
                )
                  .replace(/\D/g, "")
                  .slice(-10);


              const row:
                ExcelStudentRow = {

                name:
                  findValue(
                    rawRow,
                    [
                      "Student Name",
                      "Name",
                      "Student Full Name",
                    ]
                  ),

                dob:
                  normalizeDate(
                    dobValue
                  ),

                age: 0,

                gender:
                  normalizeGender(
                    findValue(
                      rawRow,
                      [
                        "Gender",
                        "Sex",
                      ]
                    )
                  ),

                className:
                  findValue(
                    rawRow,
                    [
                      "Class",
                      "Class Name",
                      "Standard",
                      "Std",
                    ]
                  )
                    .replace(
                      /class/gi,
                      ""
                    )
                    .trim(),

                rollNumber:
                  findValue(
                    rawRow,
                    [
                      "Roll Number",
                      "Roll No",
                      "Roll",
                    ]
                  ),

                admissionNumber:
                  findValue(
                    rawRow,
                    [
                      "Admission Number",
                      "Admission No",
                      "Admission ID",
                    ]
                  ),

                parentName:
                  findValue(
                    rawRow,
                    [
                      "Parent Name",
                      "Parent",
                      "Guardian Name",
                      "Father Name",
                    ]
                  ),

                mobile,

                address:
                  findValue(
                    rawRow,
                    [
                      "Address",
                      "Student Address",
                    ]
                  ),

                valid: true,

                error: "",

              };


              row.age =
                calculateAge(
                  row.dob
                );


              const error =
                validateRow(
                  row
                );


              row.error =
                error;


              row.valid =
                !error;


              return row;

            }
          );


        /* ===============================================
           DUPLICATE INSIDE EXCEL
        =============================================== */

        const admissionMap =
          new Map<
            string,
            number
          >();


        parsedRows.forEach(
          (row) => {

            const admission =
              row.admissionNumber
                .trim()
                .toLowerCase();


            if (!admission) {
              return;
            }


            admissionMap.set(
              admission,
              (
                admissionMap.get(
                  admission
                ) || 0
              ) + 1
            );

          }
        );


        parsedRows.forEach(
          (row) => {

            const admission =
              row.admissionNumber
                .trim()
                .toLowerCase();


            if (
              admission &&
              (
                admissionMap.get(
                  admission
                ) || 0
              ) > 1
            ) {

              row.valid = false;

              row.error =
                "Duplicate Admission Number in Excel";

            }

          }
        );


        setRows(
          parsedRows
        );


        const validCount =
          parsedRows.filter(
            (row) =>
              row.valid
          ).length;


        const invalidCount =
          parsedRows.length -
          validCount;


        setMessageType(
          invalidCount > 0
            ? "info"
            : "success"
        );


        setMessage(
          `${parsedRows.length} rows loaded. ${validCount} valid, ${invalidCount} invalid.`
        );

      } catch (error) {

        console.error(
          "Excel reading error:",
          error
        );


        setRows([]);


        setMessageType(
          "error"
        );


        setMessage(
          "Excel file read nahi ho saki. Template download karke us format me file use karo."
        );

      } finally {

        if (
          fileInputRef.current
        ) {

          fileInputRef.current.value =
            "";

        }

      }

    };


  /* =======================================================
     IMPORT
  ======================================================= */

  const importStudents =
    async () => {

      const validRows =
        rows.filter(
          (row) =>
            row.valid
        );


      if (
        validRows.length === 0
      ) {

        setMessageType(
          "error"
        );

        setMessage(
          "Import ke liye koi valid student record nahi hai."
        );

        return;
      }


      try {

        setImporting(true);

        setProgress(0);

        setMessage("");


        /* ===============================================
           LOAD EXISTING STUDENTS
        =============================================== */

        const existingQuery =
          query(

            collection(
              db,
              "students"
            ),

            where(
              "schoolId",
              "==",
              String(
                schoolId
              )
            )

          );


        const existingSnapshot =
          await getDocs(
            existingQuery
          );


        const existingAdmissions =
          new Set<string>();


        existingSnapshot.docs.forEach(
          (studentDocument) => {

            const data =
              studentDocument.data();


            const admission =
              String(
                data.admissionNumber ||
                ""
              )
                .trim()
                .toLowerCase();


            if (admission) {

              existingAdmissions.add(
                admission
              );

            }

          }
        );


        /* ===============================================
           REMOVE DATABASE DUPLICATES
        =============================================== */

        const rowsToImport =
          validRows.filter(
            (row) => {

              const admission =
                row.admissionNumber
                  .trim()
                  .toLowerCase();


              if (
                admission &&
                existingAdmissions.has(
                  admission
                )
              ) {

                return false;

              }


              return true;

            }
          );


        const duplicateCount =
          validRows.length -
          rowsToImport.length;


        if (
          rowsToImport.length === 0
        ) {

          setMessageType(
            "error"
          );

          setMessage(
            "All valid records already exist. Admission Number duplicate mila."
          );

          return;
        }


        /* ===============================================
           FIRESTORE BATCHES
           Keep comfortably below Firestore batch limit
        =============================================== */

        const batchSize =
          400;


        let imported =
          0;


        for (
          let start = 0;
          start <
          rowsToImport.length;
          start += batchSize
        ) {

          const chunk =
            rowsToImport.slice(
              start,
              start + batchSize
            );


          const batch =
            writeBatch(db);


          chunk.forEach(
            (row) => {

              const studentRef =
                doc(
                  collection(
                    db,
                    "students"
                  )
                );


              batch.set(
                studentRef,
                {

                  schoolId:
                    String(
                      schoolId
                    ),

                  schoolName,

                  udise,

                  name:
                    row.name.trim(),

                  dob:
                    row.dob,

                  age:
                    row.age,

                  gender:
                    row.gender,

                  className:
                    row.className,

                  rollNumber:
                    row.rollNumber.trim(),

                  admissionNumber:
                    row.admissionNumber.trim(),

                  parentName:
                    row.parentName.trim(),

                  mobile:
                    row.mobile.trim(),

                  address:
                    row.address.trim(),

                  createdBy:
                    userId,

                  createdByRole:
                    userRole,

                  importSource:
                    "excel",

                  createdAt:
                    serverTimestamp(),

                  updatedAt:
                    serverTimestamp(),

                }
              );

            }
          );


          await batch.commit();


          imported +=
            chunk.length;


          setProgress(
            Math.round(
              (
                imported /
                rowsToImport.length
              ) * 100
            )
          );

        }


        /* ===============================================
           RELOAD ALL SCHOOL STUDENTS
           TO BUILD SUMMARY
        =============================================== */

        const refreshedSnapshot =
          await getDocs(
            query(
              collection(
                db,
                "students"
              ),
              where(
                "schoolId",
                "==",
                String(
                  schoolId
                )
              )
            )
          );


        const allStudents =
          refreshedSnapshot.docs.map(
            (studentDocument) =>
              studentDocument.data()
          );


        /* ===============================================
           CLASS SUMMARY
        =============================================== */

        const classes =
          Array.from(
            {
              length: 12,
            },
            (_, index) => {

              const className =
                String(
                  index + 1
                );


              const classStudents =
                allStudents.filter(
                  (student) =>
                    String(
                      student.className ||
                      ""
                    ) ===
                    className
                );


              const boys =
                classStudents.filter(
                  (student) => {

                    const gender =
                      String(
                        student.gender ||
                        ""
                      )
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


              const girls =
                classStudents.filter(
                  (student) => {

                    const gender =
                      String(
                        student.gender ||
                        ""
                      )
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


              return {

                className,

                boys,

                girls,

              };

            }
          );


        const totalBoys =
          allStudents.filter(
            (student) => {

              const gender =
                String(
                  student.gender ||
                  ""
                )
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
          allStudents.filter(
            (student) => {

              const gender =
                String(
                  student.gender ||
                  ""
                )
                  .trim()
                  .toLowerCase();


              return (
                gender === "female" ||
                gender === "girl" ||
                gender === "girls"
              );

            }
          ).length;


        /* ===============================================
           UPDATE STUDENT SUMMARY
        =============================================== */

        await setDoc(

          doc(
            db,
            "studentData",
            String(
              schoolId
            )
          ),

          {

            schoolId:
              String(
                schoolId
              ),

            schoolName,

            udise,

            totalStudents:
              allStudents.length,

            totalBoys,

            totalGirls,

            classes,

            updatedBy:
              userId,

            updatedByRole:
              userRole,

            updatedAt:
              serverTimestamp(),

          },

          {
            merge: true,
          }

        );


        await onImportComplete();


        setMessageType(
          "success"
        );


        setMessage(
          `${imported} students successfully imported.${
            duplicateCount > 0
              ? ` ${duplicateCount} duplicate Admission Number records skipped.`
              : ""
          }`
        );


        setRows([]);

        setFileName("");

        setProgress(100);

      } catch (error) {

        console.error(
          "Student Excel import error:",
          error
        );


        setMessageType(
          "error"
        );


        setMessage(
          "Student import failed. Firestore permissions aur Excel data check karo."
        );

      } finally {

        setImporting(false);

      }

    };


  /* =======================================================
     CLEAR
  ======================================================= */

  const clearImport =
    () => {

      if (importing) {
        return;
      }

      setRows([]);

      setFileName("");

      setMessage("");

      setProgress(0);

    };


  const validCount =
    rows.filter(
      (row) =>
        row.valid
    ).length;


  const invalidCount =
    rows.length -
    validCount;


  /* =======================================================
     UI
  ======================================================= */

  return (

    <section className="student-excel-import">


      <div className="student-excel-header">


        <div>

          <div className="student-excel-title-icon">

            <FileSpreadsheet
              size={24}
            />

          </div>


          <div>

            <span>
              BULK STUDENT IMPORT
            </span>

            <h2>
              Import Students from Excel
            </h2>

            <p>
              Upload multiple student records at once.
            </p>

          </div>

        </div>


        <button
          type="button"
          className="excel-template-button"
          onClick={
            downloadTemplate
          }
        >

          <Download size={17} />

          Download Template

        </button>


      </div>


      <div className="student-excel-school">

        <strong>
          {schoolName}
        </strong>

        <span>
          UDISE: {udise || "-"}
        </span>

      </div>


      <div className="student-excel-upload">


        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={
            handleFile
          }
          hidden
        />


        <div className="student-excel-upload-icon">

          <Upload size={30} />

        </div>


        <h3>
          Select Excel File
        </h3>


        <p>
          Supported formats:
          .xlsx and .xls
        </p>


        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          disabled={importing}
        >

          <FileSpreadsheet
            size={17}
          />

          Choose Excel File

        </button>


        {fileName && (

          <strong className="student-excel-file-name">

            {fileName}

          </strong>

        )}


      </div>


      {message && (

        <div
          className={
            `student-excel-message ${messageType}`
          }
        >

          {messageType ===
          "success" ? (

            <CheckCircle2
              size={18}
            />

          ) : (

            <AlertCircle
              size={18}
            />

          )}

          <span>
            {message}
          </span>

        </div>

      )}


      {rows.length > 0 && (

        <>

          <div className="student-excel-summary">

            <article>

              <span>
                Excel Rows
              </span>

              <strong>
                {rows.length}
              </strong>

            </article>


            <article className="valid">

              <span>
                Valid
              </span>

              <strong>
                {validCount}
              </strong>

            </article>


            <article className="invalid">

              <span>
                Invalid
              </span>

              <strong>
                {invalidCount}
              </strong>

            </article>

          </div>


          <div className="student-excel-preview-heading">

            <div>

              <h3>
                Excel Preview
              </h3>

              <p>
                Import se pehle records check karo.
              </p>

            </div>


            <button
              type="button"
              onClick={
                clearImport
              }
              disabled={importing}
            >

              <X size={16} />

              Clear

            </button>

          </div>


          <div className="student-excel-table-wrapper">

            <table className="student-excel-table">

              <thead>

                <tr>

                  <th>Status</th>

                  <th>Name</th>

                  <th>DOB</th>

                  <th>Gender</th>

                  <th>Class</th>

                  <th>Roll</th>

                  <th>Admission</th>

                  <th>Parent</th>

                  <th>Mobile</th>

                  <th>Error</th>

                </tr>

              </thead>


              <tbody>

                {rows.map(
                  (
                    row,
                    index
                  ) => (

                    <tr
                      key={
                        `${row.admissionNumber}-${index}`
                      }
                      className={
                        row.valid
                          ? ""
                          : "invalid-row"
                      }
                    >

                      <td>

                        {row.valid ? (

                          <span className="excel-valid-status">

                            <CheckCircle2
                              size={15}
                            />

                            Valid

                          </span>

                        ) : (

                          <span className="excel-invalid-status">

                            <AlertCircle
                              size={15}
                            />

                            Invalid

                          </span>

                        )}

                      </td>


                      <td>
                        {row.name || "-"}
                      </td>


                      <td>
                        {row.dob || "-"}
                      </td>


                      <td>
                        {row.gender || "-"}
                      </td>


                      <td>
                        {row.className || "-"}
                      </td>


                      <td>
                        {row.rollNumber || "-"}
                      </td>


                      <td>
                        {row.admissionNumber || "-"}
                      </td>


                      <td>
                        {row.parentName || "-"}
                      </td>


                      <td>
                        {row.mobile || "-"}
                      </td>


                      <td>
                        {row.error || "-"}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>


          {importing && (

            <div className="student-import-progress">

              <div>

                <span>
                  Importing students...
                </span>

                <strong>
                  {progress}%
                </strong>

              </div>


              <div className="student-import-progress-track">

                <div
                  style={{
                    width:
                      `${progress}%`,
                  }}
                />

              </div>

            </div>

          )}


          <button
            type="button"
            className="student-import-main-button"
            onClick={
              importStudents
            }
            disabled={
              importing ||
              validCount === 0
            }
          >

            <Upload size={18} />

            {importing
              ? `Importing ${progress}%`
              : `Import ${validCount} Students`
            }

          </button>

        </>

      )}


    </section>

  );

}