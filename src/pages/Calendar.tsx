import {
  CalendarDays,
  Clock,
  GraduationCap,
  Megaphone,
  BookOpen,
} from "lucide-react";

const events = [
  {
    date: "June 2026",
    title: "Academic Session Begins",
    description:
      "New academic session and school-level academic planning.",
    icon: <GraduationCap size={22} />,
  },
  {
    date: "July 2026",
    title: "Academic Activities",
    description:
      "Regular teaching, classroom activities and student assessment.",
    icon: <BookOpen size={22} />,
  },
  {
    date: "August 2026",
    title: "School Activities",
    description:
      "Educational, cultural and school-level development activities.",
    icon: <Megaphone size={22} />,
  },
  {
    date: "September 2026",
    title: "Progress Review",
    description:
      "Review of academic progress and school information.",
    icon: <CalendarDays size={22} />,
  },
];

export default function Calendar() {
  return (
    <div className="portal-page">

      <section className="portal-page-hero">
        <div className="portal-page-hero-content">
          <div className="portal-page-icon">
            <CalendarDays size={32} />
          </div>

          <div>
            <span>ACADEMIC PLANNING</span>
            <h1>शैक्षणिक कॅलेंडर</h1>
            <p>
              शैक्षणिक वर्षातील महत्त्वाच्या उपक्रमांची
              आणि नियोजनाची माहिती.
            </p>
          </div>
        </div>
      </section>

      <section className="portal-content">
        <div className="portal-section-heading">
          <span>ACADEMIC YEAR 2026-27</span>
          <h2>Academic Calendar</h2>
          <p>
            केंद्रांतर्गत शाळांसाठी शैक्षणिक उपक्रम आणि
            महत्त्वाच्या कालावधीची माहिती.
          </p>
        </div>

        <div className="calendar-grid">
          {events.map((event, index) => (
            <article
              className="calendar-card"
              key={index}
            >
              <div className="portal-card-icon">
                {event.icon}
              </div>

              <div className="calendar-card-content">
                <div className="calendar-date">
                  <Clock size={14} />
                  {event.date}
                </div>

                <h3>{event.title}</h3>

                <p>{event.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="portal-notice">
          <Megaphone size={21} />

          <div>
            <strong>Important Note</strong>
            <p>
              अधिकृत शैक्षणिक कार्यक्रम आणि तारखा
              उपलब्ध झाल्यानंतर या कॅलेंडरमध्ये अपडेट
              केल्या जाऊ शकतात.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}