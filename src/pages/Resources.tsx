import {
  BookOpen,
  Download,
  FileText,
  GraduationCap,
  Presentation,
  Users,
} from "lucide-react";

const resources = [
  {
    title: "Teacher Resources",
    description:
      "शिक्षकांसाठी शैक्षणिक साहित्य, मार्गदर्शक आणि अध्यापन संसाधने.",
    icon: <Users size={26} />,
  },
  {
    title: "Learning Material",
    description:
      "विद्यार्थ्यांच्या अध्ययनासाठी आवश्यक शैक्षणिक साहित्य.",
    icon: <BookOpen size={26} />,
  },
  {
    title: "Training Material",
    description:
      "शिक्षक प्रशिक्षण आणि व्यावसायिक विकासासाठी संसाधने.",
    icon: <Presentation size={26} />,
  },
  {
    title: "Guidelines",
    description:
      "शाळा आणि शिक्षकांसाठी आवश्यक सूचना आणि मार्गदर्शक माहिती.",
    icon: <FileText size={26} />,
  },
];

export default function Resources() {
  return (
    <div className="portal-page">

      <section className="portal-page-hero">
        <div className="portal-page-hero-content">

          <div className="portal-page-icon">
            <BookOpen size={32} />
          </div>

          <div>
            <span>LEARNING & DEVELOPMENT</span>

            <h1>प्रशिक्षण व संसाधने</h1>

            <p>
              शिक्षक आणि शाळांसाठी शैक्षणिक व प्रशिक्षण
              संसाधनांचे केंद्रीकृत व्यासपीठ.
            </p>
          </div>

        </div>
      </section>

      <section className="portal-content">

        <div className="portal-section-heading">
          <span>RESOURCE CENTRE</span>

          <h2>Educational Resources</h2>

          <p>
            शैक्षणिक गुणवत्ता वाढवण्यासाठी आवश्यक
            संसाधने आणि प्रशिक्षण साहित्य.
          </p>
        </div>

        <div className="portal-card-grid">

          {resources.map((resource, index) => (
            <article
              className="portal-feature-card"
              key={index}
            >
              <div className="portal-card-icon">
                {resource.icon}
              </div>

              <h3>{resource.title}</h3>

              <p>{resource.description}</p>

              <button
                type="button"
                className="portal-small-button"
              >
                <Download size={15} />
                View Resources
              </button>
            </article>
          ))}

        </div>

        <div className="portal-info-banner">
          <GraduationCap size={25} />

          <div>
            <strong>
              Teacher Development
            </strong>

            <p>
              नवीन प्रशिक्षण साहित्य आणि शैक्षणिक
              संसाधने उपलब्ध झाल्यानंतर या विभागात
              जोडता येतील.
            </p>
          </div>
        </div>

      </section>

    </div>
  );
}