import { Bell } from "lucide-react";

export default function Announcement() {
  return (
    <div className="announcement">
      <div className="announcement-inner">
        <div className="announcement-title">
          <Bell size={17} />
          सूचना
        </div>

        <div className="announcement-text">
          <div className="announcement-scroll">
            समूह साधन केंद्र कट्टीपार अंतर्गत सर्व शाळांनी शैक्षणिक वर्ष
            2026-27 ची विद्यार्थी, शिक्षक व शाळा माहिती अद्ययावत करावी.
            &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;
            मुख्याध्यापकांनी आपल्या अधिकृत लॉगिनद्वारे माहिती भरावी.
          </div>
        </div>
      </div>
    </div>
  );
}