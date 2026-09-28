import {
  Camera,
  Image as ImageIcon,
} from "lucide-react";

const galleryImages = [
  {
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
    title: "Classroom Activities",
  },
  {
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
    title: "Student Learning",
  },
  {
    image:
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=900&q=80",
    title: "Educational Activities",
  },
  {
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
    title: "School Education",
  },
  {
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
    title: "Student Activities",
  },
  {
    image:
      "https://images.unsplash.com/photo-1501349800519-48093d60bde0?auto=format&fit=crop&w=900&q=80",
    title: "Learning Environment",
  },
];

export default function Gallery() {
  return (
    <div className="portal-page">

      <section className="portal-page-hero">

        <div className="portal-page-hero-content">

          <div className="portal-page-icon">
            <Camera size={32} />
          </div>

          <div>
            <span>SCHOOL MEMORIES</span>

            <h1>फोटो गॅलरी</h1>

            <p>
              शाळांमधील शैक्षणिक उपक्रम आणि
              कार्यक्रमांची छायाचित्रे.
            </p>
          </div>

        </div>

      </section>

      <section className="portal-content">

        <div className="portal-section-heading">

          <span>PHOTO GALLERY</span>

          <h2>
            School Activities
          </h2>

          <p>
            केंद्रांतर्गत शाळांमधील विविध शैक्षणिक
            आणि सहशालेय उपक्रम.
          </p>

        </div>

        <div className="gallery-grid">

          {galleryImages.map(
            (item, index) => (
              <article
                className="gallery-card"
                key={index}
              >

                <div className="gallery-image">

                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                  />

                  <div className="gallery-overlay">

                    <ImageIcon
                      size={25}
                    />

                  </div>

                </div>

                <div className="gallery-caption">

                  <h3>
                    {item.title}
                  </h3>

                </div>

              </article>
            )
          )}

        </div>

        <div className="portal-notice">

          <Camera size={21} />

          <div>
            <strong>
              Gallery Information
            </strong>

            <p>
              सध्या demo images वापरल्या आहेत.
              नंतर आपल्या शाळांच्या वास्तविक
              कार्यक्रमांची छायाचित्रे येथे जोडता येतील.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}