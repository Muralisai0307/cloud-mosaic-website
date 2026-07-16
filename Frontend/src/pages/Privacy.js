import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Privacy() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-in-out'
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Privacy Policy - CloudMosaic</title>
        <meta name="description" content="Read CloudMosaic's privacy guidelines to understand how we secure and manage customer data." />
        <link rel="canonical" href="https://Muralisai0307.github.io/cloudmosaic-react/#/privacy" />
      </Helmet>
      <Header />

      <section className="page-header">
        <div className="container">
          <h1 data-aos="fade-up">Privacy Policy</h1>
          <p data-aos="fade-up" data-aos-delay="100">Last updated: July 16, 2026</p>
        </div>
      </section>

      <section className="about-main" style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="values-card" data-aos="fade-up" style={{ padding: '3rem 2rem', marginTop: '0' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>1. Information We Collect</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
              We collect information that you provide directly to us when filling out forms on our website, scheduling demos, or subscribing to our newsletters. This may include your name, email address, phone number, and company name.
            </p>

            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)', marginTop: '2rem' }}>2. How We Use Your Information</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
              We use the collected information to:
            </p>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', marginBottom: '1.5rem', lineHeight: '1.7' }}>
              <li>Provide and improve our products and services.</li>
              <li>Respond to inquiries, messages, and demo requests.</li>
              <li>Send newsletters, tech insights, and marketing communications.</li>
              <li>Ensure legal and security compliance of our systems.</li>
            </ul>

            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)', marginTop: '2rem' }}>3. Data Security & Storage</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
              We implement industry-standard security measures (including SSL encryption and access controls) to prevent unauthorized access, loss, or misuse of your personal data. We are GDPR compliant and ensure that your data is stored securely.
            </p>

            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)', marginTop: '2rem' }}>4. Sharing Your Information</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
              We do not sell, trade, or transfer your personal data to outside parties. This does not include trusted third parties who assist us in operating our website or servicing your requests, as long as those parties agree to keep this information confidential.
            </p>

            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)', marginTop: '2rem' }}>5. Contact Us</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: '1.7' }}>
              If you have any questions regarding this Privacy Policy, you may contact us at <a href="mailto:support@cloudmosaic.ai" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>support@cloudmosaic.ai</a>.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Privacy;
