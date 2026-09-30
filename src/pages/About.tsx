import {
  BookOpen,
  Building2,
  GraduationCap,
  School,
  Target,
  Users,
} from "lucide-react";

export default function About() {
  return (
    <div className="about-page">

      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-label">
            ABOUT OUR CENTRE
          </span>

          <h1>समूह साधन केंद्र कट्टीपार</h1>

          <p>
            School Information & Management Portal
          </p>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="about-section">
        <div className="about-container">

          <div className="about-heading">
            <span>OUR CENTRE</span>

            <h2>केंद्र परिचय</h2>

            <p>
              समूह साधन केंद्र कट्टीपार अंतर्गत शाळांची
              शैक्षणिक माहिती, विद्यार्थी माहिती, शिक्षक
              माहिती आणि शैक्षणिक संसाधनांचे व्यवस्थापन
              करण्यासाठी हे डिजिटल पोर्टल तयार करण्यात आले आहे.
            </p>
          </div>

          <div className="about-intro-grid">

            <div className="about-intro-card">
              <div className="about-icon">
                <School size={28} />
              </div>

              <h3>School Management</h3>

              <p>
                केंद्रांतर्गत शाळांची माहिती एकाच
                डिजिटल प्रणालीमध्ये व्यवस्थित ठेवण्याची सुविधा.
              </p>
            </div>

            <div className="about-intro-card">
              <div className="about-icon">
                <Users size={28} />
              </div>

              <h3>Student & Teacher Data</h3>

              <p>
                विद्यार्थी आणि शिक्षकांची शाळानिहाय माहिती
                व्यवस्थित पाहण्यासाठी आणि व्यवस्थापित
                करण्यासाठी केंद्रीकृत प्रणाली.
              </p>
            </div>

            <div className="about-intro-card">
              <div className="about-icon">
                <BookOpen size={28} />
              </div>

              <h3>Educational Resources</h3>

              <p>
                शिक्षक आणि शाळांसाठी आवश्यक शैक्षणिक
                संसाधने व प्रशिक्षण साहित्य उपलब्ध
                करून देण्यासाठी स्वतंत्र विभाग.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="about-mission-section">
        <div className="about-container">

          <div className="about-mission-grid">

            <div className="about-mission-content">
              <span>OUR PURPOSE</span>

              <h2>Our Mission</h2>

              <p>
                शाळा व्यवस्थापन अधिक सुलभ, पारदर्शक आणि
                डिजिटल बनवणे तसेच शाळांशी संबंधित आवश्यक
                माहिती एका केंद्रीकृत प्लॅटफॉर्मवर उपलब्ध
                करून देणे हे या पोर्टलचे मुख्य उद्दिष्ट आहे.
              </p>

              <div className="about-mission-point">
                <Target size={20} />

                <div>
                  <strong>
                    Centralized Information
                  </strong>

                  <p>
                    सर्व शाळांची आवश्यक माहिती एका
                    ठिकाणी उपलब्ध करणे.
                  </p>
                </div>
              </div>

              <div className="about-mission-point">
                <GraduationCap size={20} />

                <div>
                  <strong>
                    Educational Development
                  </strong>

                  <p>
                    विद्यार्थी आणि शिक्षकांसाठी
                    शैक्षणिक व्यवस्थापन अधिक प्रभावी बनवणे.
                  </p>
                </div>
              </div>

              <div className="about-mission-point">
                <Building2 size={20} />

                <div>
                  <strong>
                    Infrastructure Monitoring
                  </strong>

                  <p>
                    शाळांमधील उपलब्ध मूलभूत सुविधांची
                    माहिती डिजिटल स्वरूपात व्यवस्थापित करणे.
                  </p>
                </div>
              </div>
            </div>

            <div className="about-stat-box">
              <School size={45} />

              <strong>17</strong>

              <span>
                Total Schools
              </span>

              <p>
                Under Samuh Sadhan Kendra Kattipar
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}