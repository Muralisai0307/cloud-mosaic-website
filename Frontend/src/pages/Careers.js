import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { apiService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { validateEmail } from '../utils/helpers';
import '../styles/Careers.css';

function Careers() {
  const navigate = useNavigate();
  const { success, error, warning } = useNotification();
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  
  // Job Form state
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantCoverLetter, setApplicantCoverLetter] = useState('');
  const [applicantFile, setApplicantFile] = useState(null);

  // Notify Me state
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isNotifying, setIsNotifying] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-in-out'
    });
  }, []);

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!notifyEmail.trim()) {
      warning('Please enter your email address.');
      return;
    }
    if (!validateEmail(notifyEmail)) {
      warning('Please enter a valid email address.');
      return;
    }

    setIsNotifying(true);
    try {
      await apiService.subscribeNewsletter(notifyEmail);
      success(`Thank you! We'll notify you at ${notifyEmail} when more positions open.`);
      setNotifyEmail('');
    } catch (err) {
      error(err.message || 'Subscription failed. Please try again.');
    } finally {
      setIsNotifying(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setApplicantFile(null);
      return;
    }

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      warning('Resume file size must be less than 5MB.');
      e.target.value = '';
      setApplicantFile(null);
      return;
    }

    // Validate extension
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      warning('Only PDF, DOC, and DOCX files are allowed.');
      e.target.value = '';
      setApplicantFile(null);
      return;
    }

    setApplicantFile(file);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();

    if (!applicantName.trim()) {
      warning('Please enter your full name.');
      return;
    }
    if (!applicantEmail.trim() || !validateEmail(applicantEmail)) {
      warning('Please enter a valid email address.');
      return;
    }
    if (!applicantFile) {
      warning('Please upload your resume.');
      return;
    }

    setIsApplying(true);
    try {
      await apiService.submitJobApplication({
        name: applicantName,
        email: applicantEmail,
        coverLetter: applicantCoverLetter,
        file: applicantFile,
        jobTitle: selectedJob.title
      });
      setApplicationSubmitted(true);
    } catch (err) {
      error(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleContactClick = () => {
    navigate('/contact');
  };

  return (
    <>
      <Helmet>
        <title>Careers - CloudMosaic</title>
        <meta name="description" content="Search active positions and explore careers in cloud engineering, full-stack development, and executive HR consulting." />
        <link rel="canonical" href="https://Muralisai0307.github.io/cloudmosaic-react/#/careers" />
      </Helmet>
      <Header />
      
      <section className="page-header">
        <div className="container">
          <h1 data-aos="fade-up">Join Our Team</h1>
          <p data-aos="fade-up" data-aos-delay="100">Build your career at CloudMosaic</p>
        </div>
      </section>

      <section className="why-join">
        <div className="container">
          <h2 className="section-title text-center" data-aos="fade-up">Why Work With Us?</h2>
          <div className="benefits-grid">
            <div className="benefit-card" data-aos="zoom-in">
              <i className="fas fa-rocket" aria-hidden="true"></i>
              <h3>Innovation First</h3>
              <p>Work with cutting-edge cloud and AI technologies</p>
            </div>
            <div className="benefit-card" data-aos="zoom-in" data-aos-delay="100">
              <i className="fas fa-chart-line" aria-hidden="true"></i>
              <h3>Growth Opportunities</h3>
              <p>Continuous learning and career advancement</p>
            </div>
            <div className="benefit-card" data-aos="zoom-in" data-aos-delay="200">
              <i className="fas fa-home" aria-hidden="true"></i>
              <h3>Remote First</h3>
              <p>Work from anywhere with flexible hours</p>
            </div>
            <div className="benefit-card" data-aos="zoom-in" data-aos-delay="300">
              <i className="fas fa-heart" aria-hidden="true"></i>
              <h3>Great Benefits</h3>
              <p>Competitive salary, health, and wellness perks</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== OPEN POSITIONS - COMING SOON ===== */}
      <section className="open-positions">
        <div className="container">
          <div className="coming-soon-wrapper" data-aos="fade-up">
            <h2 className="section-title text-center">
              <i className="fas fa-clock" style={{ marginRight: '12px' }} aria-hidden="true"></i>
              Open Positions Coming Soon
            </h2>
            
            <p className="coming-soon-description">
              We're always looking for talented individuals to join our team. Check back soon for exciting career opportunities!
            </p>
            
            <div className="notify-section">
              <p className="notify-label">Want to be notified when positions open?</p>
              
              <form className="notify-form" onSubmit={handleNotifySubmit}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="notify-input"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  aria-label="Email for job notifications"
                  required
                />
                <button type="submit" className="btn-notify" disabled={isNotifying}>
                  {isNotifying ? (
                    <>Loading... <i className="fas fa-spinner fa-pulse" aria-hidden="true"></i></>
                  ) : (
                    <>Notify Me 👇</>
                  )}
                </button>
              </form>
            </div>
            
            <div className="resume-section">
              <p className="resume-text">In the meantime, send us your resume anyway.</p>
              <button className="btn-contact" onClick={handleContactClick}>Contact Us</button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Application Modal */}
      {selectedJob && (
        <div className="schedule-modal" style={{ display: 'flex', zIndex: 1000 }}>
          <div className="schedule-modal-content" style={{ maxWidth: '500px' }}>
            <button className="schedule-modal-close" onClick={() => { setSelectedJob(null); setApplicationSubmitted(false); }} aria-label="Close modal">
              <i className="fas fa-times" aria-hidden="true"></i>
            </button>
            {applicationSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <i className="fas fa-check-circle" style={{ fontSize: '4rem', color: 'var(--success-color)', marginBottom: '1rem' }} aria-hidden="true"></i>
                <h2>Application Submitted!</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '1rem 0', lineHeight: '1.6' }}>
                  Thank you for applying for the <strong>{selectedJob.title}</strong> role at CloudMosaic. Our team will review your profile and get back to you shortly.
                </p>
                <button className="btn-primary" onClick={() => setSelectedJob(null)} style={{ padding: '0.8rem 2rem' }}>
                  Close <i className="fas fa-times-circle" aria-hidden="true"></i>
                </button>
              </div>
            ) : (
              <>
                <h2>Apply for Job</h2>
                <p style={{ color: 'var(--accent-color)', fontWeight: 'bold', margin: '0.5rem 0 1.5rem' }}>{selectedJob.title}</p>
                <form onSubmit={handleApplySubmit} className="schedule-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div className="form-group" style={{ margin: '0' }}>
                    <input 
                      type="text" 
                      placeholder="Full Name *" 
                      required 
                      value={applicantName} 
                      onChange={e => setApplicantName(e.target.value)} 
                      style={{ width: '100%' }} 
                      aria-label="Full Name"
                    />
                  </div>
                  <div className="form-group" style={{ margin: '0' }}>
                    <input 
                      type="email" 
                      placeholder="Email Address *" 
                      required 
                      value={applicantEmail} 
                      onChange={e => setApplicantEmail(e.target.value)} 
                      style={{ width: '100%' }} 
                      aria-label="Email Address"
                    />
                  </div>
                  <div className="form-group" style={{ margin: '0' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block', textAlign: 'left' }}>Upload Resume (.pdf, .doc, .docx) *</label>
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx" 
                      required 
                      onChange={handleFileChange}
                      style={{ width: '100%', padding: '0.5rem', background: 'var(--input-bg)', color: 'var(--input-text)', border: '2px solid var(--input-border)', borderRadius: '10px' }} 
                      aria-label="Upload Resume"
                    />
                  </div>
                  <div className="form-group" style={{ margin: '0' }}>
                    <textarea 
                      placeholder="Cover Letter / Introduce Yourself (Optional)" 
                      rows="3" 
                      value={applicantCoverLetter} 
                      onChange={e => setApplicantCoverLetter(e.target.value)} 
                      style={{ width: '100%' }} 
                      aria-label="Cover Letter"
                    />
                  </div>
                  <button type="submit" className="btn-schedule" disabled={isApplying} style={{ width: '100%', border: 'none', cursor: 'pointer' }}>
                    {isApplying ? (
                      <><i className="fas fa-spinner fa-pulse" aria-hidden="true"></i> Submitting...</>
                    ) : (
                      <>Submit Application <i className="fas fa-paper-plane" aria-hidden="true"></i></>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Careers;