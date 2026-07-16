import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { apiService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { 
  validateEmail, 
  formatCurrency, 
  calculateRoi, 
  generateRecommendations 
} from '../utils/helpers';
import '../styles/Home.css';

function Home() {
  const { success, error, warning } = useNotification();

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-in-out'
    });
  }, []);

  useEffect(() => {
    const initParticles = () => {
      if (window.particlesJS && document.getElementById('particles')) {
        window.particlesJS('particles', {
          particles: {
            number: { value: 100, density: { enable: true, value_area: 800 } },
            color: { value: '#ffffff' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.2, width: 1 },
            move: { enable: true, speed: 2, direction: 'none', random: true }
          },
          interactivity: {
            events: {
              onhover: { enable: true, mode: 'grab' },
              onclick: { enable: true, mode: 'push' }
            }
          },
          retina_detect: true
        });
      }
    };

    if (window.particlesJS) {
      initParticles();
    } else {
      const interval = setInterval(() => {
        if (window.particlesJS) {
          initParticles();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  // Recommender State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', q4: '', q5: '' });
  const [recommendations, setRecommendations] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // ROI Calculator State
  const [cloudSpend, setCloudSpend] = useState(25000);
  const [employees, setEmployees] = useState(100);
  const [itCost, setItCost] = useState(15000);
  const [services, setServices] = useState(5);
  const [showRoiEmailModal, setShowRoiEmailModal] = useState(false);
  const [roiEmailInput, setRoiEmailInput] = useState('');
  const [isSendingRoi, setIsSendingRoi] = useState(false);

  // Recommender option click handler
  const handleOptionClick = (questionKey, optionValue) => {
    setAnswers(prev => ({ ...prev, [questionKey]: optionValue }));
    setTimeout(() => {
      if (currentStep < 5) {
        setCurrentStep(prev => prev + 1);
      } else {
        const updatedAnswers = { ...answers, [questionKey]: optionValue };
        setRecommendations(generateRecommendations(updatedAnswers));
        setQuizStarted(false);
      }
    }, 300);
  };

  // ROI calculations from helpers
  const {
    currentTotal,
    newTotal,
    monthlySavings,
    annualSavings,
    savingsPercentage
  } = calculateRoi(cloudSpend, employees, itCost, services);

  // Quiz email form submit
  const handleQuizEmailSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      warning('Please enter your email address.');
      return;
    }
    if (!validateEmail(emailInput)) {
      warning('Please enter a valid email address.');
      return;
    }

    setIsSendingEmail(true);
    try {
      await apiService.subscribeNewsletter(emailInput);
      success(`✅ Recommendations simulated and sent to ${emailInput}!`);
      setShowEmailModal(false);
      setEmailInput('');
    } catch (err) {
      error(err.message || 'Failed to send recommendations. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // ROI email form submit
  const handleRoiEmailSubmit = async (e) => {
    e.preventDefault();
    if (!roiEmailInput.trim()) {
      warning('Please enter your email address.');
      return;
    }
    if (!validateEmail(roiEmailInput)) {
      warning('Please enter a valid email address.');
      return;
    }

    setIsSendingRoi(true);
    try {
      await apiService.subscribeNewsletter(roiEmailInput);
      success(`✅ ROI report simulated and sent to ${roiEmailInput}!`);
      setShowRoiEmailModal(false);
      setRoiEmailInput('');
    } catch (err) {
      error(err.message || 'Failed to send ROI report. Please try again.');
    } finally {
      setIsSendingRoi(false);
    }
  };

  // Typing effect
  useEffect(() => {
    const phrases = [
      'Scalable cloud solutions for modern enterprises',
      'Secure, intelligent, and future-ready',
      'Transform your business with cloud innovation',
      'Expert HR consulting and talent acquisition',
      'AWS, Azure, and Google Cloud experts',
      'Innovative products inspired by brainzyx.com'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId;
    const typedElement = document.querySelector('.typed-text');

    function typeEffect() {
      if (!typedElement) return;
      const currentPhrase = phrases[phraseIndex];
      
      if (isDeleting) {
        typedElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typedElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        timeoutId = setTimeout(typeEffect, 2000);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        timeoutId = setTimeout(typeEffect, 500);
      } else {
        timeoutId = setTimeout(typeEffect, isDeleting ? 50 : 100);
      }
    }

    typeEffect();
    return () => clearTimeout(timeoutId);
  }, []);

  // Organization Schema Markup
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CloudMosaic",
    "url": "https://Muralisai0307.github.io/cloudmosaic-react",
    "logo": "https://Muralisai0307.github.io/cloudmosaic-react/images/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-720-221-7062",
      "contactType": "sales",
      "areaServed": "US",
      "availableLanguage": "en"
    },
    "sameAs": [
      "https://www.linkedin.com/company/cloudmosaic",
      "https://twitter.com/cloudmosaic",
      "https://github.com/cloudmosaic"
    ]
  };

  return (
    <>
      <Helmet>
        <title>CloudMosaic | Enterprise Cloud & HR Solutions</title>
        <meta name="description" content="Transforming businesses through cloud innovation and digital transformation. Professional cloud migrations, custom web tools, and enterprise HR consulting." />
        <link rel="canonical" href="https://Muralisai0307.github.io/cloudmosaic-react" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="CloudMosaic | Enterprise Cloud & HR Solutions" />
        <meta property="og:description" content="Transforming businesses through cloud innovation and digital transformation. Professional cloud migrations, custom web tools, and enterprise HR consulting." />
        <meta property="og:image" content="https://Muralisai0307.github.io/cloudmosaic-react/images/logo.png" />
        <meta property="og:url" content="https://Muralisai0307.github.io/cloudmosaic-react" />
        <meta property="og:type" content="website" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="CloudMosaic | Enterprise Cloud & HR Solutions" />
        <meta name="twitter:description" content="Transforming businesses through cloud innovation and digital transformation. Professional cloud migrations, custom web tools, and enterprise HR consulting." />
        <meta name="twitter:image" content="https://Muralisai0307.github.io/cloudmosaic-react/images/logo.png" />

        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      </Helmet>
      <Header />
      
      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="particles" id="particles"></div>
        <div className="hero-content" data-aos="fade-up" data-aos-duration="1000">
          <h1 className="glitch-text" data-text="Transforming Businesses Through Cloud Innovation and Digital Transformation">
            Transforming Businesses Through Cloud Innovation and Digital Transformation
          </h1>
          <p className="typed-text"></p>
          <Link to="/services" className="cta-button">
            Explore Our Services <i className="fas fa-arrow-right" aria-hidden="true"></i>
          </Link>
        </div>
        <div className="hero-scroll-indicator">
          <span>Scroll</span>
          <i className="fas fa-chevron-down" aria-hidden="true"></i>
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="about-preview">
        <div className="container">
          <h2 className="section-title" data-aos="fade-right">Trusted Partner</h2>
          <div className="about-content">
            <div className="about-text" data-aos="fade-right" data-aos-delay="200">
              <p className="lead-text">50+ years of combined experience in cloud migration, security, and human capital.</p>
              <p>CloudMosaic is a team of cloud, ERP, and HR experts dedicated to delivering innovative IT and human resource solutions.</p>
              <Link to="/about" className="btn-outline" style={{ marginTop: '2rem' }}>
                Learn More About Us <i className="fas fa-arrow-right" aria-hidden="true"></i>
              </Link>
            </div>
            <div className="about-mission" data-aos="fade-left" data-aos-delay="300">
              <div className="mission-card floating-element">
                <i className="fas fa-bullseye" aria-hidden="true"></i>
                <h3>Our Mission</h3>
                <p>Empower businesses with innovative IT and HR solutions that maximize ROI and drive digital transformation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="services-preview">
        <div className="container">
          <h2 className="section-title" data-aos="fade-up">Core Services</h2>
          <div className="service-grid-mini">
            <div className="service-mini-card" data-aos="flip-left" data-aos-delay="200">
              <i className="fas fa-cloud-upload-alt" aria-hidden="true"></i>
              <h3>Cloud Migration</h3>
            </div>
            <div className="service-mini-card" data-aos="flip-left" data-aos-delay="300">
              <i className="fas fa-shield-alt" aria-hidden="true"></i>
              <h3>Security & Compliance</h3>
            </div>
            <div className="service-mini-card" data-aos="flip-left" data-aos-delay="400">
              <i className="fas fa-users-cog" aria-hidden="true"></i>
              <h3>HR Consulting</h3>
            </div>
            <div className="service-mini-card" data-aos="flip-left" data-aos-delay="500">
              <i className="fas fa-robot" aria-hidden="true"></i>
              <h3>AI & Automation</h3>
            </div>
          </div>
          <div className="text-center" style={{ marginTop: '3rem' }}>
            <Link to="/services" className="btn-primary">
              View All Services <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ERP RESELLER SECTION */}
      <section className="erp-reseller-section">
        <div className="container">
          <div className="erp-header" data-aos="fade-up">
            <span className="erp-badge">Authorized Reseller</span>
            <h2 className="section-title">Enterprise ERP Solutions</h2>
            <p className="erp-subtitle">We're proud to be an authorized reseller for leading ERP platforms</p>
          </div>
          
          <div className="erp-logos-grid" data-aos="fade-up" data-aos-delay="100" style={{ display: 'flex', justifyContent: 'center' }}>
            <a href="https://www.goldenflitch.com/projects/erpforce" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }} aria-label="Go to Force ERP Project">
              <div className="erp-logo-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '260px', height: '160px', padding: '0', overflow: 'hidden' }}>
                <img src="https://cloudmosaic.ai/Images/Force-ERP.jpeg" alt="Force ERP Logo" style={{ width: '100%', height: '100%', maxWidth: '100%', objectFit: 'cover', margin: '0' }} loading="lazy" />
              </div>
            </a>
          </div>
          
          <div className="erp-features" data-aos="fade-up" data-aos-delay="200">
            <div className="erp-feature">
              <i className="fas fa-check-circle" aria-hidden="true"></i>
              <span>Certified implementation experts</span>
            </div>
            <div className="erp-feature">
              <i className="fas fa-check-circle" aria-hidden="true"></i>
              <span>Custom configuration & integration</span>
            </div>
            <div className="erp-feature">
              <i className="fas fa-check-circle" aria-hidden="true"></i>
              <span>Ongoing support & training</span>
            </div>
            <div className="erp-feature">
              <i className="fas fa-check-circle" aria-hidden="true"></i>
              <span>Competitive pricing through direct partnerships</span>
            </div>
          </div>
          
          <div className="erp-cta" data-aos="fade-up" data-aos-delay="300">
            <p>Compare top ERP solutions side-by-side and see why <strong>Force ERP</strong> is the future.</p>
            <div className="erp-cta-buttons">
              <Link to="/erp-comparison" className="btn-primary">
                <i className="fas fa-external-link-alt" aria-hidden="true"></i> Compare ERP Systems
              </Link>
              <Link to="/contact" className="btn-outline">
                Talk to an ERP Expert <i className="fas fa-arrow-right" aria-hidden="true"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS PREVIEW */}
      <section className="products-preview">
        <div className="container">
          <h2 className="section-title" data-aos="fade-up">Featured Products</h2>
          <div className="products-grid-mini">
            <div className="product-mini-card" data-aos="flip-left" data-aos-delay="200">
              <div className="product-mini-badge">New</div>
              <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80" alt="Core AI Dashboard Mockup" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} loading="lazy" />
              <h3>Core AI</h3>
              <p>AI-powered business intelligence</p>
              <Link to="/products" className="btn-mini">Learn More <i className="fas fa-arrow-right" aria-hidden="true"></i></Link>
            </div>
            <div className="product-mini-card" data-aos="flip-left" data-aos-delay="300">
              <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80" alt="Cloud Manager Dashboard Mockup" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} loading="lazy" />
              <h3>Cloud Manager</h3>
              <p>Multi-cloud management platform</p>
              <Link to="/products" className="btn-mini">Learn More <i className="fas fa-arrow-right" aria-hidden="true"></i></Link>
            </div>
            <div className="product-mini-card" data-aos="flip-left" data-aos-delay="400">
              <div className="product-mini-badge product-mini-badge-popular">Popular</div>
              <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80" alt="HR Suite Workspace" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} loading="lazy" />
              <h3>HR Suite</h3>
              <p>Complete HR management system</p>
              <Link to="/products" className="btn-mini">Learn More <i className="fas fa-arrow-right" aria-hidden="true"></i></Link>
            </div>
            <div className="product-mini-card" data-aos="flip-left" data-aos-delay="500">
              <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80" alt="Security Suite Network Terminal" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} loading="lazy" />
              <h3>Security Suite</h3>
              <p>Enterprise cybersecurity platform</p>
              <Link to="/products" className="btn-mini">Learn More <i className="fas fa-arrow-right" aria-hidden="true"></i></Link>
            </div>
          </div>
          <div className="text-center" style={{ marginTop: '3rem' }}>
            <Link to="/products" className="btn-primary">
              View All Products <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* SMART RECOMMENDER */}
      <section className="recommender-section">
        <div className="container">
          <div className="recommender-header" data-aos="fade-up">
            <span className="recommender-badge">🔥 SMART TOOL</span>
            <h2 className="section-title">Find Your Perfect Solution</h2>
            <p className="recommender-subtitle">Answer 5 quick questions and we'll recommend the best service for your business</p>
          </div>

          <div className="recommender-container" data-aos="fade-up" data-aos-delay="100">
            {!quizStarted && recommendations.length === 0 && (
              <div className="recommender-start" id="recommenderStart">
                <div className="start-illustration">
                  <i className="fas fa-lightbulb" aria-hidden="true"></i>
                  <i className="fas fa-robot" aria-hidden="true"></i>
                  <i className="fas fa-cloud" aria-hidden="true"></i>
                </div>
                <h3>Not sure which service you need?</h3>
                <p>Take our 2-minute quiz and get personalized recommendations based on your business needs.</p>
                <button className="btn-start" id="startRecommenderBtn" onClick={() => { setQuizStarted(true); setCurrentStep(1); setAnswers({ q1: '', q2: '', q3: '', q4: '', q5: '' }); }}>
                  <i className="fas fa-play" aria-hidden="true"></i> Start Quiz
                </button>
              </div>
            )}

            {quizStarted && (
              <div className="quiz-container" id="quizContainer" style={{ display: 'block' }}>
                {/* Progress Bar */}
                <div className="quiz-progress">
                  <div className="progress-bar" id="progressBar" style={{ width: `${(currentStep / 5) * 100}%` }}></div>
                  <div className="progress-steps">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <span key={step} className={`step ${step <= currentStep ? 'active' : ''}`}>{step}</span>
                    ))}
                  </div>
                </div>

                {/* Questions */}
                <div className="questions-container" id="questionsContainer">
                  {currentStep === 1 && (
                    <div className="question-card active">
                      <h3>What's your primary business challenge?</h3>
                      <div className="options-grid">
                        {[
                          { val: 'cloud', icon: 'fa-cloud-upload-alt', label: 'Cloud Migration', desc: 'Move infrastructure to cloud' },
                          { val: 'security', icon: 'fa-shield-alt', label: 'Security & Compliance', desc: 'Protect data and meet regulations' },
                          { val: 'hr', icon: 'fa-users-cog', label: 'HR Management', desc: 'Hire and retain talent' },
                          { val: 'web', icon: 'fa-code', label: 'Web Development', desc: 'Build modern applications' },
                          { val: 'ai', icon: 'fa-robot', label: 'AI & Automation', desc: 'Automate business processes' },
                          { val: 'consulting', icon: 'fa-chart-line', label: 'IT Consulting', desc: 'Strategic technology advice' }
                        ].map((opt) => (
                          <button key={opt.val} className={`option-card ${answers.q1 === opt.val ? 'selected' : ''}`} onClick={() => handleOptionClick('q1', opt.val)} type="button">
                            <i className={`fas ${opt.icon}`} aria-hidden="true"></i>
                            <h4>{opt.label}</h4>
                            <p>{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="question-card active">
                      <h3>What's your company size?</h3>
                      <div className="options-grid size-grid">
                        {[
                          { val: 'startup', icon: 'fa-seedling', label: 'Startup', desc: '1-10 employees' },
                          { val: 'small', icon: 'fa-building', label: 'Small Business', desc: '11-50 employees' },
                          { val: 'medium', icon: 'fa-city', label: 'Mid-Market', desc: '51-200 employees' },
                          { val: 'enterprise', icon: 'fa-globe', label: 'Enterprise', desc: '201+ employees' }
                        ].map((opt) => (
                          <button key={opt.val} className={`option-card ${answers.q2 === opt.val ? 'selected' : ''}`} onClick={() => handleOptionClick('q2', opt.val)} type="button">
                            <i className={`fas ${opt.icon}`} aria-hidden="true"></i>
                            <h4>{opt.label}</h4>
                            <p>{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="question-card active">
                      <h3>What's your timeline for implementation?</h3>
                      <div className="options-grid timeline-grid">
                        {[
                          { val: 'immediate', icon: 'fa-clock', label: 'Immediate', desc: 'Within 1 month' },
                          { val: 'short', icon: 'fa-calendar-week', label: 'Short-term', desc: '1-3 months' },
                          { val: 'medium', icon: 'fa-calendar-alt', label: 'Medium-term', desc: '3-6 months' },
                          { val: 'long', icon: 'fa-calendar-plus', label: 'Long-term', desc: '6+ months' }
                        ].map((opt) => (
                          <button key={opt.val} className={`option-card ${answers.q3 === opt.val ? 'selected' : ''}`} onClick={() => handleOptionClick('q3', opt.val)} type="button">
                            <i className={`fas ${opt.icon}`} aria-hidden="true"></i>
                            <h4>{opt.label}</h4>
                            <p>{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="question-card active">
                      <h3>What's your budget range?</h3>
                      <div className="options-grid budget-grid">
                        {[
                          { val: 'small', icon: 'fa-dollar-sign', label: 'Small', desc: '$5k - $20k' },
                          { val: 'medium', icon: 'fa-dollar-sign', label: 'Medium', desc: '$20k - $50k' },
                          { val: 'large', icon: 'fa-dollar-sign', label: 'Large', desc: '$50k - $100k' },
                          { val: 'enterprise', icon: 'fa-chart-line', label: 'Enterprise', desc: '$100k+' }
                        ].map((opt) => (
                          <button key={opt.val} className={`option-card ${answers.q4 === opt.val ? 'selected' : ''}`} onClick={() => handleOptionClick('q4', opt.val)} type="button">
                            <i className={`fas ${opt.icon}`} aria-hidden="true"></i>
                            <h4>{opt.label}</h4>
                            <p>{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === 5 && (
                    <div className="question-card active">
                      <h3>Do you need ongoing support?</h3>
                      <div className="options-grid support-grid">
                        {[
                          { val: 'yes', icon: 'fa-headset', label: 'Yes, 24/7 Support', desc: 'Managed services & monitoring' },
                          { val: 'sometimes', icon: 'fa-question-circle', label: 'Occasional Support', desc: 'As-needed basis' },
                          { val: 'no', icon: 'fa-tools', label: 'Self-managed', desc: 'Just implementation' }
                        ].map((opt) => (
                          <button key={opt.val} className={`option-card ${answers.q5 === opt.val ? 'selected' : ''}`} onClick={() => handleOptionClick('q5', opt.val)} type="button">
                            <i className={`fas ${opt.icon}`} aria-hidden="true"></i>
                            <h4>{opt.label}</h4>
                            <p>{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="quiz-navigation">
                  <button className="btn-prev" id="prevBtn" disabled={currentStep === 1} onClick={() => setCurrentStep(currentStep - 1)}>
                    <i className="fas fa-arrow-left" aria-hidden="true"></i> Previous
                  </button>
                  <button className="btn-next" id="nextBtn" disabled={!answers[`q${currentStep}`]} onClick={() => {
                    if (currentStep < 5) {
                      setCurrentStep(currentStep + 1);
                    } else {
                      setRecommendations(generateRecommendations(answers));
                      setQuizStarted(false);
                    }
                  }}>
                    {currentStep === 5 ? (
                      <>See Results <i className="fas fa-check-circle" aria-hidden="true"></i></>
                    ) : (
                      <>Next <i className="fas fa-arrow-right" aria-hidden="true"></i></>
                    )}
                  </button>
                </div>
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="results-container" id="resultsContainer" style={{ display: 'block' }}>
                <div className="results-header">
                  <i className="fas fa-check-circle" aria-hidden="true"></i>
                  <h3>Your Personalized Recommendations</h3>
                  <p>Based on your answers, here are the best services for you</p>
                </div>

                <div className="recommendations-grid" id="recommendationsGrid">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="recommendation-card" data-aos="fade-up" data-aos-delay={idx * 100}>
                      <span className="recommendation-badge">{rec.badge || 'Recommended'}</span>
                      <h4>{rec.title}</h4>
                      <p className="recommendation-desc">{rec.description}</p>
                      <ul className="recommendation-features">
                        {rec.features.map((feature, fIdx) => (
                          <li key={fIdx}><i className="fas fa-check-circle" aria-hidden="true"></i> {feature}</li>
                        ))}
                      </ul>
                      <Link to="/contact" className="recommendation-cta">
                        {rec.cta} <i className="fas fa-arrow-right" aria-hidden="true"></i>
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="results-actions">
                  <button className="btn-email-results" id="emailResultsBtn" onClick={() => { setShowEmailModal(true); setEmailInput(''); }}>
                    <i className="fas fa-envelope" aria-hidden="true"></i> Email Results
                  </button>
                  <button className="btn-restart" id="restartBtn" onClick={() => { setRecommendations([]); setQuizStarted(true); setCurrentStep(1); setAnswers({ q1: '', q2: '', q3: '', q4: '', q5: '' }); }}>
                    <i className="fas fa-redo" aria-hidden="true"></i> Take Quiz Again
                  </button>
                  <button className="btn-schedule" id="scheduleConsultation" onClick={() => {
                    const hubMenu = document.getElementById('contactHubMenu');
                    if (hubMenu) hubMenu.classList.remove('active');
                    const scheduleBtn = document.querySelector('.schedule-demo');
                    if (scheduleBtn) {
                      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
                      scheduleBtn.dispatchEvent(event);
                    }
                  }}>
                    <i className="fas fa-calendar-alt" aria-hidden="true"></i> Schedule Consultation
                  </button>
                </div>

                {/* Email Simulation Modal */}
                {showEmailModal && (
                  <div className="email-modal" id="emailModal" style={{ display: 'flex' }} role="dialog" aria-modal="true" aria-labelledby="quizEmailModalTitle">
                    <div className="email-modal-content">
                      <button className="email-modal-close" onClick={() => setShowEmailModal(false)} aria-label="Close modal"><i className="fas fa-times" aria-hidden="true"></i></button>
                      <h4 id="quizEmailModalTitle">Get Results via Email</h4>
                      <form onSubmit={handleQuizEmailSubmit} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <input 
                          type="email" 
                          placeholder="Your email address" 
                          id="emailInput" 
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          aria-label="Email address for quiz results"
                          required
                          style={{ marginBottom: '15px' }}
                        />
                        <button type="submit" className="btn-send-email" id="sendEmailBtn" disabled={isSendingEmail}>
                          {isSendingEmail ? (
                            <><i className="fas fa-spinner fa-pulse" aria-hidden="true"></i> Sending...</>
                          ) : (
                            <><i className="fas fa-paper-plane" aria-hidden="true"></i> Send Recommendations</>
                          )}
                        </button>
                      </form>
                      <p className="email-note">We'll never share your email. This is a demo simulation.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ROI CALCULATOR */}
      <section className="roi-calculator-section">
        <div className="container">
          <div className="roi-header" data-aos="fade-up">
            <span className="roi-badge">💰 CALCULATE SAVINGS</span>
            <h2 className="section-title">See Your Potential ROI</h2>
            <p className="roi-subtitle">Estimate how much you can save with CloudMosaic's cloud solutions</p>
          </div>

          <div className="roi-container" data-aos="fade-up" data-aos-delay="100">
            <div className="calculator-grid">
              <div className="calculator-inputs">
                <h3>Enter Your Current Costs</h3>
                
                <div className="input-group">
                  <label htmlFor="cloudSpendRange"><i className="fas fa-cloud" aria-hidden="true"></i> Monthly Cloud Spend</label>
                  <div className="input-wrapper">
                    <span className="currency">$</span>
                    <input 
                      type="range" 
                      id="cloudSpendRange"
                      min="1000" 
                      max="100000" 
                      step="1000" 
                      value={cloudSpend} 
                      onChange={(e) => setCloudSpend(parseInt(e.target.value) || 0)}
                      aria-label="Monthly Cloud Spend Slider"
                    />
                    <input 
                      type="number" 
                      min="1000" 
                      max="100000" 
                      step="1000" 
                      value={cloudSpend} 
                      onChange={(e) => setCloudSpend(Math.min(100000, Math.max(1000, parseInt(e.target.value) || 0)))}
                      aria-label="Monthly Cloud Spend Number Input"
                    />
                  </div>
                  <div className="input-range-value">${formatCurrency(cloudSpend)}/month</div>
                </div>

                <div className="input-group">
                  <label htmlFor="employeesRange"><i className="fas fa-users" aria-hidden="true"></i> Number of Employees</label>
                  <div className="input-wrapper">
                    <input 
                      type="range" 
                      id="employeesRange"
                      min="10" 
                      max="1000" 
                      step="10" 
                      value={employees} 
                      onChange={(e) => setEmployees(parseInt(e.target.value) || 0)}
                      aria-label="Number of Employees Slider"
                    />
                    <input 
                      type="number" 
                      min="10" 
                      max="1000" 
                      step="10" 
                      value={employees} 
                      onChange={(e) => setEmployees(Math.min(1000, Math.max(10, parseInt(e.target.value) || 0)))}
                      aria-label="Number of Employees Number Input"
                    />
                  </div>
                  <div className="input-range-value">{employees} employees</div>
                </div>

                <div className="input-group">
                  <label htmlFor="itCostRange"><i className="fas fa-server" aria-hidden="true"></i> Monthly IT Operations Cost</label>
                  <div className="input-wrapper">
                    <span className="currency">$</span>
                    <input 
                      type="range" 
                      id="itCostRange"
                      min="1000" 
                      max="50000" 
                      step="500" 
                      value={itCost} 
                      onChange={(e) => setItCost(parseInt(e.target.value) || 0)}
                      aria-label="Monthly IT Operations Cost Slider"
                    />
                    <input 
                      type="number" 
                      min="1000" 
                      max="50000" 
                      step="500" 
                      value={itCost} 
                      onChange={(e) => setItCost(Math.min(50000, Math.max(1000, parseInt(e.target.value) || 0)))}
                      aria-label="Monthly IT Operations Cost Number Input"
                    />
                  </div>
                  <div className="input-range-value">${formatCurrency(itCost)}/month</div>
                </div>

                <div className="input-group">
                  <label htmlFor="servicesRange"><i className="fas fa-tasks" aria-hidden="true"></i> Number of Cloud Services</label>
                  <div className="input-wrapper">
                    <input 
                      type="range" 
                      id="servicesRange"
                      min="1" 
                      max="20" 
                      step="1" 
                      value={services} 
                      onChange={(e) => setServices(parseInt(e.target.value) || 0)}
                      aria-label="Number of Cloud Services Slider"
                    />
                    <input 
                      type="number" 
                      min="1" 
                      max="20" 
                      step="1" 
                      value={services} 
                      onChange={(e) => setServices(Math.min(20, Math.max(1, parseInt(e.target.value) || 0)))}
                      aria-label="Number of Cloud Services Number Input"
                    />
                  </div>
                  <div className="input-range-value">{services} services</div>
                </div>

                <div className="calculator-note">
                  <i className="fas fa-info-circle" aria-hidden="true"></i>
                  <p>Based on average savings of 40% from our clients. Adjust sliders to see your potential savings.</p>
                </div>
              </div>

              <div className="calculator-results">
                <h3>Your Estimated Savings</h3>
                <div className="results-summary">
                  <div className="result-item">
                    <span className="result-label">Current Monthly Cost</span>
                    <span className="result-value" id="currentTotal">${formatCurrency(currentTotal)}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">CloudMosaic Monthly Cost</span>
                    <span className="result-value savings" id="newTotal">${formatCurrency(newTotal)}</span>
                  </div>
                  <div className="result-item highlight">
                    <span className="result-label">Monthly Savings</span>
                    <span className="result-value" id="monthlySavings">${formatCurrency(monthlySavings)}</span>
                  </div>
                  <div className="result-item annual">
                    <span className="result-label">Annual Savings</span>
                    <span className="result-value" id="annualSavings">${formatCurrency(annualSavings)}</span>
                  </div>
                </div>

                <div className="savings-chart">
                  <div className="chart-bar">
                    <div className="chart-label">Current</div>
                    <div className="bar-container">
                      <div className="bar current-bar" id="currentBar" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div className="chart-bar">
                    <div className="chart-label">With CloudMosaic</div>
                    <div className="bar-container">
                      <div className="bar savings-bar" id="savingsBar" style={{ width: `${(newTotal / currentTotal) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="savings-percentage">
                  <div className="percentage-circle" id="percentageCircle">
                    <span className="percentage-value" id="savingsPercentage">{savingsPercentage}%</span>
                    <span className="percentage-label">Savings</span>
                  </div>
                </div>

                <div className="roi-cta">
                  <button className="btn-email-results" onClick={() => { setShowRoiEmailModal(true); setRoiEmailInput(''); }}><i className="fas fa-envelope" aria-hidden="true"></i> Email Results</button>
                  <Link to="/contact" className="btn-schedule"><i className="fas fa-calendar-alt" aria-hidden="true"></i> Get Detailed Quote</Link>
                </div>
              </div>
            </div>

            <div className="roi-benefits" data-aos="fade-up" data-aos-delay="200">
              <h3>What's Included in Your Savings</h3>
              <div className="benefits-grid">
                <div className="benefit-item">
                  <i className="fas fa-check-circle" aria-hidden="true"></i>
                  <div>
                    <h4>Infrastructure Optimization</h4>
                    <p>Right-sizing resources and eliminating waste</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-check-circle" aria-hidden="true"></i>
                  <div>
                    <h4>Automated Management</h4>
                    <p>Reduce manual IT operations costs</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-check-circle" aria-hidden="true"></i>
                  <div>
                    <h4>Reserved Instance Pricing</h4>
                    <p>Volume discounts through our partnerships</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-check-circle" aria-hidden="true"></i>
                  <div>
                    <h4>24/7 Monitoring Included</h4>
                    <p>No additional costs for support</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Modal (for sending ROI results) */}
            {showRoiEmailModal && (
              <div className="email-modal" id="roiEmailModal" style={{ display: 'flex' }} role="dialog" aria-modal="true" aria-labelledby="roiEmailModalTitle">
                <div className="email-modal-content">
                  <button className="email-modal-close" onClick={() => setShowRoiEmailModal(false)} aria-label="Close modal"><i className="fas fa-times" aria-hidden="true"></i></button>
                  <h4 id="roiEmailModalTitle">Get Your ROI Report</h4>
                  <p>We'll send you a detailed breakdown of your savings</p>
                  <form onSubmit={handleRoiEmailSubmit} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <input 
                      type="email" 
                      placeholder="Your email address" 
                      id="roiEmailInput"
                      value={roiEmailInput}
                      onChange={(e) => setRoiEmailInput(e.target.value)}
                      aria-label="Email address for ROI report"
                      required
                      style={{ marginBottom: '15px' }}
                    />
                    <button type="submit" className="btn-send-email" id="sendRoiEmailBtn" disabled={isSendingRoi}>
                      {isSendingRoi ? (
                        <><i className="fas fa-spinner fa-pulse" aria-hidden="true"></i> Sending...</>
                      ) : (
                        <><i className="fas fa-paper-plane" aria-hidden="true"></i> Send Report</>
                      )}
                    </button>
                  </form>
                  <p className="email-note">We'll never share your email. This is a demo simulation.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;