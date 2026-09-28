import {
  Download,
  File,
  FileText,
  FolderDown,
} from "lucide-react";

const downloads = [
  {
    title: "Academic Documents",
    description:
      "शैक्षणिक नियोजन आणि शाळांसाठी आवश्यक दस्तऐवज.",
    type: "PDF",
  },
  {
    title: "Teacher Resources",
    description:
      "शिक्षकांसाठी प्रशिक्षण आणि अध्यापन संबंधित साहित्य.",
    type: "PDF",
  },
  {
    title: "School Forms",
    description:
      "शाळा व्यवस्थापनासाठी आवश्यक नमुना फॉर्म.",
    type: "FORM",
  },
  {
    title: "Official Guidelines",
    description:
      "शाळांसाठी आवश्यक सूचना आणि मार्गदर्शक दस्तऐवज.",
    type: "PDF",
  },
];

export default function Downloads() {
  return (
    <div className="portal-page">

      <section className="portal-page-hero">

        <div className="portal-page-hero-content">

          <div className="portal-page-icon">
            <FolderDown size={32} />
          </div>

          <div>
            <span>DOCUMENT CENTRE</span>

            <h1>डाउनलोड</h1>

            <p>
              शैक्षणिक दस्तऐवज, फॉर्म आणि आवश्यक
              संसाधने डाउनलोड करण्यासाठी विभाग.
            </p>
          </div>

        </div>

      </section>

      <section className="portal-content">

        <div className="portal-section-heading">

          <span>DOWNLOAD CENTRE</span>

          <h2>
            Important Documents
          </h2>

          <p>
            शाळा आणि शिक्षकांसाठी आवश्यक
            दस्तऐवज एका ठिकाणी.
          </p>

        </div>

        <div className="download-list">

          {downloads.map(
            (item, index) => (
              <article
                className="download-card"
                key={index}
              >

                <div className="download-file-icon">

                  {item.type === "PDF" ? (
                    <FileText size={25} />
                  ) : (
                    <File size={25} />
                  )}

                </div>

                <div className="download-info">

                  <span>
                    {item.type}
                  </span>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.description}
                  </p>

                </div>

                <button
                  type="button"
                  className="download-button"
                >
                  <Download size={16} />

                  Download
                </button>

              </article>
            )
          )}

        </div>

        <div className="portal-notice">

          <FileText size={21} />

          <div>
            <strong>
              Document Information
            </strong>

            <p>
              Actual PDF किंवा document files जोडल्यानंतर
              Download buttons त्या files सोबत connect
              करता येतील.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}