import {
  BookOpen,
  Mail,
  MapPin,
  Phone,
  School,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-about">
          <div className="footer-logo">
            <School size={34} />

            <div>
              <h3>समूह साधन केंद्र कट्टीपार</h3>
              <span>School Information Portal</span>
            </div>
          </div>

          <p>
            केंद्रांतर्गत शाळांची विद्यार्थी, शिक्षक, पायाभूत सुविधा
            व शैक्षणिक माहिती एकाच डिजिटल प्रणालीमध्ये उपलब्ध करून
            देण्यासाठी विकसित पोर्टल.
          </p>
        </div>

        <div>
          <h4>महत्त्वाचे दुवे</h4>

          <Link to="/">मुख्यपृष्ठ</Link>
          <Link to="/about">केंद्र परिचय</Link>
          <Link to="/schools">शाळांची Directory</Link>
          <Link to="/calendar">शैक्षणिक कॅलेंडर</Link>
          <Link to="/downloads">Downloads</Link>
        </div>

        <div>
          <h4>संसाधने</h4>

          <Link to="/resources">
            <BookOpen size={15} />
            प्रशिक्षण व संसाधने
          </Link>

          <Link to="/best-practices">
            उत्कृष्ट उपक्रम
          </Link>

          <Link to="/gallery">फोटो गॅलरी</Link>

          <Link to="/login">
            अधिकृत लॉगिन
          </Link>
        </div>

        <div>
          <h4>संपर्क</h4>

          <p className="footer-contact">
            <MapPin size={17} />
            समूह साधन केंद्र कट्टीपार,
            <br />
            जि. गोंदिया, महाराष्ट्र
          </p>

          <p className="footer-contact">
            <Phone size={17} />
            +91 XXXXX XXXXX
          </p>

          <p className="footer-contact">
            <Mail size={17} />
            example@gmail.com
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © 2026 समूह साधन केंद्र कट्टीपार. सर्व हक्क राखीव.
        </p>

        <p>
          शैक्षणिक वर्ष 2026-27
        </p>
      </div>
    </footer>
  );
}