import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Terms() {
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
        <title>Terms of Service - CloudMosaic</title>
        <meta name="description" content="Review CloudMosaic's terms of service and usage regulations for our digital and consulting products." />
        <link rel="canonical" href="https://Muralisai0307.github.io/cloudmosaic-react/#/terms" />
      </Helmet>
      <Header />

      <section className="page-header">
        <div className="container">
          <h1 data-aos="fade-up">Terms of Service</h1>
          <p data-aos="fade-up" data-aos-delay="100">Last updated: July 16, 2026</p>
        </div>
      </section>

      <section className="about-main" style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="values-card" data-aos="fade-up" style={{ padding: '3rem 2rem', marginTop: '0' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>1. Acceptance of Terms</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
              By accessing and using this website, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the website.
            </p>

            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)', marginTop: '2rem' }}>2. Use License</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
              Permission is granted to temporarily browse materials on CloudMosaic's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', marginBottom: '1.5rem', lineHeight: '1.7' }}>
              <li>Modify or copy the materials;</li>
              <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>Attempt to decompile or reverse engineer any software contained on CloudMosaic's website;</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>

            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)', marginTop: '2rem' }}>3. Disclaimer</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
              The materials on CloudMosaic's website are provided on an 'as is' basis. CloudMosaic makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
            </p>

            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)', marginTop: '2rem' }}>4. Limitations of Liability</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
              In no event shall CloudMosaic or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on CloudMosaic's website, even if CloudMosaic has been notified of the possibility of such damage.
            </p>

            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)', marginTop: '2rem' }}>5. Revisions and Errata</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
              The materials appearing on CloudMosaic's website could include technical, typographical, or photographic errors. CloudMosaic does not warrant that any of the materials on its website are accurate, complete or current. CloudMosaic may make changes to the materials contained on its website at any time without notice.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Terms;
