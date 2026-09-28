import { useState } from "react";
import type { FormEvent } from "react";

import {
  Building2,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";

export default function Contact() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !mobile.trim() ||
      !subject.trim() ||
      !message.trim()
    ) {
      setSuccess("कृपया आवश्यक माहिती भरा.");
      return;
    }

    setSuccess(
      "आपला संदेश यशस्वीरित्या तयार झाला आहे."
    );

    setName("");
    setMobile("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="portal-page contact-page">

      {/* ================= HERO ================= */}

      <section className="portal-page-hero">
        <div className="portal-page-hero-content">

          <div className="portal-page-icon">
            <HelpCircle size={32} />
          </div>

          <div>
            <span>CONTACT & SUPPORT</span>

            <h1>संपर्क / Help Desk</h1>

            <p>
              समूह साधन केंद्र कट्टीपार संबंधित माहिती,
              मदत आणि प्रश्नांसाठी आमच्याशी संपर्क साधा.
            </p>
          </div>

        </div>
      </section>


      {/* ================= CONTENT ================= */}

      <section className="portal-content">

        <div className="portal-section-heading">
          <span>GET IN TOUCH</span>

          <h2>संपर्क साधा</h2>

          <p>
            शाळा माहिती, पोर्टल वापर, लॉगिन किंवा इतर
            सहाय्यासाठी Help Desk शी संपर्क साधा.
          </p>
        </div>


        <div className="contact-layout">

          {/* ================= LEFT ================= */}

          <div className="contact-information">

            <div className="contact-info-header">
              <span>CONTACT INFORMATION</span>

              <h2>
                समूह साधन केंद्र कट्टीपार
              </h2>

              <p>
                शाळा व्यवस्थापन आणि शैक्षणिक माहिती
                संबंधित मदतीसाठी खालील संपर्क पर्यायांचा
                वापर करा.
              </p>
            </div>


            <div className="contact-info-list">

              <div className="contact-info-item">

                <div className="contact-info-icon">
                  <Building2 size={21} />
                </div>

                <div>
                  <span>Centre</span>

                  <strong>
                    Samuh Sadhan Kendra Kattipar
                  </strong>
                </div>

              </div>


              <div className="contact-info-item">

                <div className="contact-info-icon">
                  <MapPin size={21} />
                </div>

                <div>
                  <span>Location</span>

                  <strong>
                    Kattipar, Maharashtra
                  </strong>

                  <small>
                    Complete official address can be
                    added here.
                  </small>
                </div>

              </div>


              <div className="contact-info-item">

                <div className="contact-info-icon">
                  <Phone size={21} />
                </div>

                <div>
                  <span>Phone</span>

                  <strong>
                    Contact number not added
                  </strong>

                  <small>
                    Add the official centre contact
                    number here.
                  </small>
                </div>

              </div>


              <div className="contact-info-item">

                <div className="contact-info-icon">
                  <Mail size={21} />
                </div>

                <div>
                  <span>Email</span>

                  <strong>
                    Official email not added
                  </strong>

                  <small>
                    Add the official centre email
                    address here.
                  </small>
                </div>

              </div>


              <div className="contact-info-item">

                <div className="contact-info-icon">
                  <Clock size={21} />
                </div>

                <div>
                  <span>Help Desk</span>

                  <strong>
                    Working Hours
                  </strong>

                  <small>
                    Official working hours can be
                    added here.
                  </small>
                </div>

              </div>

            </div>


            {/* HELP BOX */}

            <div className="contact-help-box">

              <HelpCircle size={25} />

              <div>
                <strong>
                  Need Portal Support?
                </strong>

                <p>
                  Principal login, school information,
                  student data, teacher data किंवा
                  infrastructure data संबंधित समस्यांसाठी
                  Help Desk शी संपर्क साधा.
                </p>
              </div>

            </div>

          </div>


          {/* ================= RIGHT FORM ================= */}

          <div className="contact-form-card">

            <div className="contact-form-heading">

              <div className="contact-form-icon">
                <MessageSquare size={25} />
              </div>

              <div>
                <span>HELP DESK</span>

                <h2>
                  Send Your Message
                </h2>

                <p>
                  खालील फॉर्म भरून आपला प्रश्न किंवा
                  संदेश पाठवा.
                </p>
              </div>

            </div>


            {success && (
              <div
                className={
                  success.includes("यशस्वीरित्या")
                    ? "contact-message success"
                    : "contact-message error"
                }
              >
                {success}
              </div>
            )}


            <form
              className="contact-form"
              onSubmit={handleSubmit}
            >

              <div className="contact-form-row">

                <div className="contact-field">
                  <label>
                    Full Name
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                  />
                </div>


                <div className="contact-field">
                  <label>
                    Mobile Number
                    <span>*</span>
                  </label>

                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    value={mobile}
                    maxLength={10}
                    onChange={(e) =>
                      setMobile(
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                  />
                </div>

              </div>


              <div className="contact-field">
                <label>Email Address</label>

                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />
              </div>


              <div className="contact-field">
                <label>
                  Subject
                  <span>*</span>
                </label>

                <select
                  value={subject}
                  onChange={(e) =>
                    setSubject(e.target.value)
                  }
                >
                  <option value="">
                    Select subject
                  </option>

                  <option value="School Information">
                    School Information
                  </option>

                  <option value="Principal Login">
                    Principal Login
                  </option>

                  <option value="Student Data">
                    Student Data
                  </option>

                  <option value="Teacher Data">
                    Teacher Data
                  </option>

                  <option value="Infrastructure">
                    Infrastructure
                  </option>

                  <option value="Technical Support">
                    Technical Support
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>


              <div className="contact-field">
                <label>
                  Message
                  <span>*</span>
                </label>

                <textarea
                  rows={6}
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                />
              </div>


              <button
                type="submit"
                className="contact-submit"
              >
                <Send size={17} />

                Send Message
              </button>

            </form>

          </div>

        </div>

      </section>

    </div>
  );
}