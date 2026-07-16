import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Team.css';

function Team() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-in-out'
    });
  }, []);

  const teamMembers = [
    {
      name: 'Sumanth Singidi',
      title: 'Advisor',
      linkedin: 'https://www.linkedin.com/in/sumanth-singidi/',
      twitter: 'https://twitter.com/sumanth_singidi'
    },
    {
      name: 'Sarah Johnson',
      title: 'President, HR Consulting',
      linkedin: 'https://linkedin.com/company/cloudmosaic',
      twitter: 'https://twitter.com/cloudmosaic'
    },
    {
      name: 'David Kim',
      title: 'CTO',
      linkedin: 'https://linkedin.com/company/cloudmosaic',
      twitter: 'https://twitter.com/cloudmosaic'
    },
    {
      name: 'Emily Rodriguez',
      title: 'Head of Web Development',
      linkedin: 'https://linkedin.com/company/cloudmosaic',
      twitter: 'https://twitter.com/cloudmosaic'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Our Team & Leadership - CloudMosaic</title>
        <meta name="description" content="Meet our leadership and staff of certified cloud solutions architects, developers, and consultants." />
        <link rel="canonical" href="https://Muralisai0307.github.io/cloudmosaic-react/#/team" />
        <meta property="og:title" content="Our Team & Leadership - CloudMosaic" />
        <meta property="og:description" content="Meet our leadership and staff of certified cloud solutions architects, developers, and consultants." />
        <meta property="og:url" content="https://Muralisai0307.github.io/cloudmosaic-react/#/team" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Header />

      <section className="page-header">
        <div className="container">
          <h1 data-aos="fade-up">Our Team & Approach</h1>
          <p data-aos="fade-up" data-aos-delay="100">Experts in cloud, security & HR</p>
        </div>
      </section>

      <section className="team-section">
        <div className="container">
          <h2 className="section-title text-center" data-aos="fade-up">Leadership Team</h2>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member-card" data-aos="zoom-in" data-aos-delay={index * 100}>
                <div className="team-placeholder-icon">
                  <i className="fas fa-user-circle" style={{ fontSize: '120px', color: 'var(--accent-color)' }}></i>
                </div>
                <h3>{member.name}</h3>
                <p className="member-title">{member.title}</p>
                <div className="member-social">
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a>
                  <a href={member.twitter} target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="approach-section">
        <div className="container">
          <h2 className="section-title text-center" data-aos="fade-up">Our Approach</h2>
          <div className="process-timeline">
            <div className="process-step" data-aos="fade-up">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Discovery</h4>
                <p>Understanding your business needs and goals through in-depth consultation.</p>
              </div>
            </div>
            <div className="process-step" data-aos="fade-up" data-aos-delay="100">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Strategy</h4>
                <p>Custom solution design and planning with clear milestones.</p>
              </div>
            </div>
            <div className="process-step" data-aos="fade-up" data-aos-delay="200">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Implementation</h4>
                <p>Agile development and deployment with continuous communication.</p>
              </div>
            </div>
            <div className="process-step" data-aos="fade-up" data-aos-delay="300">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Support</h4>
                <p>24/7 monitoring and continuous improvement.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="expertise-section">
        <div className="container">
          <h2 className="section-title text-center" data-aos="fade-up">Areas of Expertise</h2>
          <div className="expertise-grid">
            <div className="expertise-item"><i className="fas fa-cloud"></i> Cloud Architects</div>
            <div className="expertise-item"><i className="fas fa-lock"></i> Security Experts</div>
            <div className="expertise-item"><i className="fas fa-database"></i> Data Engineers</div>
            <div className="expertise-item"><i className="fas fa-users"></i> HR Specialists</div>
            <div className="expertise-item"><i className="fas fa-network-wired"></i> Network Specialists</div>
            <div className="expertise-item"><i className="fas fa-brain"></i> AI/ML Engineers</div>
            <div className="expertise-item"><i className="fas fa-chart-line"></i> Business Analysts</div>
            <div className="expertise-item"><i className="fas fa-mobile-alt"></i> UI/UX Designers</div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Team;