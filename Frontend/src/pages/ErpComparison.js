import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/ErpComparison.css';

function ErpComparison() {
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
        <title>Force ERP vs Traditional ERPs | CloudMosaic</title>
        <meta name="description" content="Compare deployment speeds, UI user experiences, and licensing TCO between Force ERP and legacy systems like SAP or Oracle." />
        <link rel="canonical" href="https://Muralisai0307.github.io/cloudmosaic-react/#/erp-comparison" />
        <meta property="og:title" content="Force ERP vs Traditional ERPs | CloudMosaic" />
        <meta property="og:description" content="Compare deployment speeds, UI user experiences, and licensing TCO between Force ERP and legacy systems like SAP or Oracle." />
        <meta property="og:url" content="https://Muralisai0307.github.io/cloudmosaic-react/#/erp-comparison" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Header />

      {/* HERO SECTION */}
      <section className="comparison-hero">
        <div className="container" data-aos="fade-up">
          <h1>Why Force ERP is the Future</h1>
          <p>Traditional ERP systems are notoriously slow, difficult to use, and expensive to maintain. Force ERP revolutionizes business management by offering a modern, cloud-native experience tailored for speed, usability, and effortless scalability.</p>
        </div>
      </section>

      {/* COMPARISON SECTION */}
      <section className="comparison-section">
        <div className="container">
          <h2 className="section-title text-center" data-aos="fade-up" style={{ display: 'block', marginBottom: '3rem', textAlign: 'center' }}>
            Head-to-Head Comparison
          </h2>
          
          <div className="feature-table-wrapper" data-aos="fade-up" data-aos-delay="100">
            <table className="feature-table">
              <thead>
                <tr>
                  <th>Feature Category</th>
                  <th>Legacy Systems (SAP, NetSuite, Oracle)</th>
                  <th className="brand-col">Force ERP</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Deployment Speed</strong></td>
                  <td>6-18 months of complex on-premise or heavy cloud implementation.</td>
                  <td className="brand-col">Deployed in mere weeks with a highly agile cloud rollout.</td>
                </tr>
                <tr>
                  <td><strong>User Interface (UI/UX)</strong></td>
                  <td>Clunky, outdated, and requires extensive employee training.</td>
                  <td className="brand-col">Modern, intuitive, consumer-grade UX that teams love.</td>
                </tr>
                <tr>
                  <td><strong>Total Cost of Ownership</strong></td>
                  <td>High upfront licensing, hardware costs, and massive IT overhead.</td>
                  <td className="brand-col">Transparent SaaS pricing with zero hidden infrastructure costs.</td>
                </tr>
                <tr>
                  <td><strong>Customization & Integrations</strong></td>
                  <td>Rigid structures that demand expensive, custom coding.</td>
                  <td className="brand-col">API-first architecture for seamless modular extensibility.</td>
                </tr>
                <tr>
                  <td><strong>Mobile Accessibility</strong></td>
                  <td>Often requires clunky third-party apps, limited functionality, or VPNs.</td>
                  <td className="brand-col">Native mobile-first design offering full feature parity on the go.</td>
                </tr>
                <tr>
                  <td><strong>Platform Support</strong></td>
                  <td>Paid premium tiers with long ticketing workflows and slow resolution.</td>
                  <td className="brand-col">24/7 dedicated success manager and lightning-fast live support.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* KEY ADVANTAGES */}
          <div className="advantage-grid">
            <div className="advantage-card" data-aos="fade-up" data-aos-delay="200">
              <i className="fas fa-bolt"></i>
              <h3>Lightning Fast Setup</h3>
              <p>Escape the endless consulting loops. Force ERP gets your operations up and running faster than traditional providers, vastly accelerating your time-to-value.</p>
            </div>
            <div className="advantage-card" data-aos="fade-up" data-aos-delay="300">
              <i className="fas fa-smile-beam"></i>
              <h3>Zero Training Friction</h3>
              <p>Designed like the modern apps your employees already use every day. The superior interface drastically cuts down training time and reduces costly entry errors.</p>
            </div>
            <div className="advantage-card" data-aos="fade-up" data-aos-delay="400">
              <i className="fas fa-cloud"></i>
              <h3>Cloud-Native DNA</h3>
              <p>Never worry about managing servers, applying patches, or scheduled downtime. Force ERP securely updates automatically, keeping your data protected and accessible.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="cta-section" data-aos="fade-up" style={{ background: 'var(--bg-body)', padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '2.5rem' }}>Ready to Upgrade Your Enterprise?</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '20px 0 30px', fontSize: '1.1rem' }}>Speak with an implementation specialist today and discover what Force ERP can do for your business.</p>
        <Link to="/contact" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 3rem', textDecoration: 'none', display: 'inline-block' }}>
          Schedule a Demo <i className="fas fa-arrow-right"></i>
        </Link>
      </section>

      <Footer />
    </>
  );
}

export default ErpComparison;
