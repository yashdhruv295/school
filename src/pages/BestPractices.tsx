import {
  Award,
  BookOpen,
  Lightbulb,
  School,
  Sparkles,
  Users,
} from "lucide-react";

const practices = [
  {
    title: "Innovative Teaching",
    description:
      "विद्यार्थ्यांना प्रभावी पद्धतीने शिकवण्यासाठी नाविन्यपूर्ण अध्यापन पद्धतींचा वापर.",
    icon: <Lightbulb size={26} />,
  },
  {
    title: "Student Activities",
    description:
      "विद्यार्थ्यांच्या सर्वांगीण विकासासाठी शैक्षणिक आणि सहशालेय उपक्रम.",
    icon: <Users size={26} />,
  },
  {
    title: "Digital Learning",
    description:
      "डिजिटल साधनांचा वापर करून अध्ययन-अध्यापन प्रक्रिया अधिक प्रभावी बनवणे.",
    icon: <BookOpen size={26} />,
  },
  {
    title: "School Development",
    description:
      "शाळेच्या शैक्षणिक आणि मूलभूत सुविधा विकासासाठी प्रभावी उपक्रम.",
    icon: <School size={26} />,
  },
];

export default function BestPractices() {
  return (
    <div className="portal-page">

      <section className="portal-page-hero">
        <div className="portal-page-hero-content">

          <div className="portal-page-icon">
            <Award size={32} />
          </div>

          <div>
            <span>INNOVATION & EXCELLENCE</span>

            <h1>उत्कृष्ट उपक्रम</h1>

            <p>
              केंद्रांतर्गत शाळांमधील शैक्षणिक
              नवकल्पना आणि उत्कृष्ट उपक्रम.
            </p>
          </div>

        </div>
      </section>

      <section className="portal-content">

        <div className="portal-section-heading">
          <span>BEST PRACTICES</span>

          <h2>उत्कृष्ट शैक्षणिक उपक्रम</h2>

          <p>
            शाळांमध्ये राबविण्यात येणाऱ्या प्रभावी
            शैक्षणिक उपक्रमांसाठी स्वतंत्र विभाग.
          </p>
        </div>

        <div className="portal-card-grid">

          {practices.map((practice, index) => (
            <article
              className="portal-feature-card"
              key={index}
            >
              <div className="portal-card-icon">
                {practice.icon}
              </div>

              <h3>{practice.title}</h3>

              <p>{practice.description}</p>

              <div className="practice-tag">
                <Sparkles size={13} />
                Best Practice
              </div>
            </article>
          ))}

        </div>

        <div className="portal-info-banner">

          <Award size={25} />

          <div>
            <strong>
              Showcase School Achievements
            </strong>

            <p>
              Director/Admin भविष्यात या विभागात
              शाळांचे उत्कृष्ट उपक्रम, उपलब्धी आणि
              छायाचित्रे जोडू शकतील.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}