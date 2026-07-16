import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/About.css';

function AnimatedCounter({ target, suffix = '+' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(target, 10);
    if (start === end) return;

    const totalDuration = 1500;
    const incrementTime = Math.max(Math.floor(totalDuration / end), 20);

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) {
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target]);

  return <>{count}{suffix}</>;
}

function About() {
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
        <title>About Us - CloudMosaic | Innovation-Driven Tech Company</title>
        <meta name="description" content="Learn about CloudMosaic's core mission, values, leadership, and our path to technology innovation." />
        <link rel="canonical" href="https://Muralisai0307.github.io/cloudmosaic-react/#/about" />
        <meta property="og:title" content="About Us - CloudMosaic" />
        <meta property="og:description" content="Learn about CloudMosaic's core mission, values, leadership, and our path to technology innovation." />
        <meta property="og:url" content="https://Muralisai0307.github.io/cloudmosaic-react/#/about" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Header />

      <section className="page-header">
        <div className="container">
          <h1 data-aos="fade-up">About CloudMosaic</h1>
          <p data-aos="fade-up" data-aos-delay="100">Innovation-driven technology solutions from the ground up</p>
        </div>
      </section>

      <section className="about-main">
        <div className="container">
          <div className="about-grid">
            <div className="about-content-left" data-aos="fade-right">
              <h2 className="section-title">Our Story</h2>
              <p className="lead-text">Founded in 2025 by two passionate technologists, CloudMosaic is on a mission to deliver cutting-edge cloud and HR solutions.</p>
              <p>CloudMosaic started with a simple yet ambitious vision: to help businesses navigate the complex world of cloud computing while building high-performance teams. What began as a conversation between two friends with complementary expertise in cloud architecture and HR technology has quickly grown into a dynamic team of 45+ professionals.</p>
              <p>In just over a year, we've helped 25+ clients across various industries transform their operations through innovative cloud solutions and strategic HR consulting. Our rapid growth is a testament to our commitment to excellence, technical expertise, and client-focused approach.</p>

              <div className="milestones">
                <div className="milestone-item">
                  <span className="milestone-year">2025</span>
                  <p>Company founded by two passionate tech entrepreneurs</p>
                </div>
                <div className="milestone-item">
                  <span className="milestone-year">2025</span>
                  <p>First cloud migration project successfully delivered</p>
                </div>
                <div className="milestone-item">
                  <span className="milestone-year">2025</span>
                  <p>Expanded team to 10+ professionals</p>
                </div>
                <div className="milestone-item">
                  <span className="milestone-year">2026</span>
                  <p>Grown to 45+ team members</p>
                </div>
              </div>
            </div>

            <div className="about-content-right" data-aos="fade-left">
              <div className="mission-card">
                <i className="fas fa-bullseye"></i>
                <h3>Our Mission</h3>
                <p>Empower businesses with innovative and reliable IT and HR solutions. We believe in delivering cutting-edge technologies and human capital strategies that help our clients stay ahead of the competition while maximizing their ROI.</p>
              </div>

              <div className="values-card">
                <h3>Core Values</h3>
                <ul>
                  <li><i className="fas fa-check-circle"></i> Innovation First</li>
                  <li><i className="fas fa-check-circle"></i> Client Success</li>
                  <li><i className="fas fa-check-circle"></i> Integrity & Transparency</li>
                  <li><i className="fas fa-check-circle"></i> Continuous Learning</li>
                  <li><i className="fas fa-check-circle"></i> Collaborative Spirit</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOUNDERS SECTION - ONLY TEXT CHANGED ===== */}
      <section className="founders-section">
        <div className="container">
          <h2 className="section-title text-center" data-aos="fade-up">Meet Our Founders</h2>
          <p className="section-subtitle text-center" data-aos="fade-up" data-aos-delay="100">Two visionaries with a shared passion for technology and innovation</p>

          <div className="founders-grid">
            <div className="founder-card" data-aos="zoom-in" style={{ minHeight: '400px' }}></div>
            <div className="founder-card" data-aos="zoom-in" data-aos-delay="100" style={{ minHeight: '400px' }}></div>
            <div className="founder-card" data-aos="zoom-in" data-aos-delay="200" style={{ minHeight: '400px' }}></div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="why-choose">
        <div className="container">
          <h2 className="section-title text-center" data-aos="fade-up">Why Choose CloudMosaic?</h2>
          <div className="benefits-grid">
            <div className="benefit-card" data-aos="zoom-in">
              <i className="fas fa-certificate"></i>
              <h3>Certified Experts</h3>
              <p>AWS, Azure, Google Cloud, and Workday certified professionals</p>
            </div>
            <div className="benefit-card" data-aos="zoom-in" data-aos-delay="100">
              <i className="fas fa-clock"></i>
              <h3>24/7 Support</h3>
              <p>Round-the-clock monitoring and rapid response</p>
            </div>
            <div className="benefit-card" data-aos="zoom-in" data-aos-delay="200">
              <i className="fas fa-chart-line"></i>
              <h3>Proven ROI</h3>
              <p>Average 40% cost reduction for our clients</p>
            </div>
            <div className="benefit-card" data-aos="zoom-in" data-aos-delay="300">
              <i className="fas fa-handshake"></i>
              <h3>Partnership Approach</h3>
              <p>We work as an extension of your team</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY IMPACT */}
      <section className="impact-section">
        <div className="container">
          <div className="impact-content" data-aos="fade-right">
            <h2 className="section-title">Community Impact</h2>
            <p className="lead-text">Giving back is part of our DNA</p>
            <p>At CloudMosaic, we believe in using our success to lift others. We're committed to supporting STEM education and creating opportunities for the next generation of technologists.</p>

            <div className="impact-stats">
              <div className="impact-stat">
                <span className="impact-number"><AnimatedCounter target={100} /></span>
                <span className="impact-label">Students mentored</span>
              </div>
              <div className="impact-stat">
                <span className="impact-number"><AnimatedCounter target={10} suffix="" /></span>
                <span className="impact-label">Tech workshops</span>
              </div>
              <div className="impact-stat">
                <span className="impact-number"><AnimatedCounter target={5} suffix="" /></span>
                <span className="impact-label">University partnerships</span>
              </div>
            </div>

            <div className="impact-partners">
              <h4>Our Partners:</h4>
              <div className="partner-logos">
                <span>TechBridge</span>
                <span>Code2040</span>
                <span>Year Up</span>
                <span>Local Tech Councils</span>
              </div>
            </div>
          </div>
          <div className="impact-image" data-aos="fade-left">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="Tech mentorship class program" loading="lazy" />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default About;