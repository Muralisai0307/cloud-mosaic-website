import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNotification } from '../context/NotificationContext';
import '../styles/Projects.css';

function Projects() {
  const { info } = useNotification();
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      info('Enterprise portfolio loaded. No further archived items found.');
    }, 1500);
  };

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-in-out'
    });
  }, []);

  const projects = [
    {
      id: 1,
      category: 'cloud',
      title: 'AWS Cloud Migration',
      client: 'TechCorp International',
      year: '2024',
      duration: '3 months',
      description: 'Migrated 200+ servers to AWS with zero downtime, resulting in 40% cost reduction and 99.99% availability.',
      tech: ['AWS', 'Docker', 'Terraform'],
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 2,
      category: 'hr',
      title: 'HR Digital Transformation',
      client: 'HealthNet Systems',
      year: '2024',
      duration: '6 months',
      description: 'Implemented cloud-based HRMS and automated recruitment process for 500+ employees, reducing hiring time by 45%.',
      tech: ['Workday', 'AI Recruitment', 'Payroll'],
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 3,
      category: 'web',
      title: 'E-commerce Platform',
      client: 'RetailPro Solutions',
      year: '2023',
      duration: '4 months',
      description: 'Built scalable e-commerce platform handling 50K+ daily users with 99.9% uptime and 2x faster load times.',
      tech: ['React', 'Node.js', 'MongoDB'],
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 4,
      category: 'security',
      title: 'GDPR Compliance Suite',
      client: 'FinTech Solutions',
      year: '2024',
      duration: '2 months',
      description: 'Implemented comprehensive security framework achieving GDPR and HIPAA compliance for financial data.',
      tech: ['Encryption', 'IAM', 'SIEM'],
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 5,
      category: 'cloud',
      title: 'Azure Infrastructure',
      client: 'EduTech Institute',
      year: '2023',
      duration: '3 months',
      description: 'Designed and deployed scalable Azure infrastructure for online learning platform serving 100K+ students.',
      tech: ['Azure', 'Kubernetes', 'DevOps'],
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 6,
      category: 'hr',
      title: 'Talent Acquisition Program',
      client: 'Tech Startups Inc.',
      year: '2024',
      duration: 'Ongoing',
      description: 'End-to-end recruitment for 75+ tech positions including developers, HR managers, and C-level executives.',
      tech: ['ATS', 'AI Screening', 'Onboarding'],
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    }
  ];

  const filteredProjects = activeFilter === 'all' ? projects : projects.filter(p => p.category === activeFilter);

  return (
    <>
      <Helmet>
        <title>Our Recent Projects - CloudMosaic</title>
        <meta name="description" content="Review our portfolio of enterprise digital transitions and successful multi-cloud migration cases." />
        <link rel="canonical" href="https://Muralisai0307.github.io/cloudmosaic-react/#/projects" />
        <meta property="og:title" content="Our Recent Projects - CloudMosaic" />
        <meta property="og:description" content="Review our portfolio of enterprise digital transitions and successful multi-cloud migration cases." />
        <meta property="og:url" content="https://Muralisai0307.github.io/cloudmosaic-react/#/projects" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Header />
      
      <section className="page-header">
        <div className="container">
          <h1 data-aos="fade-up">Our Recent Projects</h1>
          <p data-aos="fade-up" data-aos-delay="100">Real solutions delivered to real clients</p>
        </div>
      </section>

      <section className="projects-section">
        <div className="container">
          <div className="project-filters" data-aos="fade-up" data-aos-delay="200">
            <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All Projects</button>
            <button className={`filter-btn ${activeFilter === 'cloud' ? 'active' : ''}`} onClick={() => setActiveFilter('cloud')}>Cloud</button>
            <button className={`filter-btn ${activeFilter === 'hr' ? 'active' : ''}`} onClick={() => setActiveFilter('hr')}>HR Consulting</button>
            <button className={`filter-btn ${activeFilter === 'web' ? 'active' : ''}`} onClick={() => setActiveFilter('web')}>Web Development</button>
            <button className={`filter-btn ${activeFilter === 'security' ? 'active' : ''}`} onClick={() => setActiveFilter('security')}>Security</button>
          </div>
          
          <div className="project-grid-full">
            {filteredProjects.map(project => (
              <div key={project.id} className="project-card-full" data-aos="zoom-in">
                <div className="project-image">
                  <img src={project.image} alt={project.title} loading="lazy" />
                  <div className="project-category-badge">{project.category === 'hr' ? 'HR Consulting' : project.category === 'web' ? 'Web Development' : project.category.charAt(0).toUpperCase() + project.category.slice(1)}</div>
                </div>
                <div className="project-details">
                  <h3>{project.title}</h3>
                  <p className="client-name">{project.client}</p>
                  <div className="project-meta">
                    <span><i className="fas fa-calendar"></i> {project.year}</span>
                    <span><i className="fas fa-clock"></i> {project.duration}</span>
                  </div>
                  <p className="project-description">{project.description}</p>
                  <div className="project-tech">
                    {project.tech.map((tech, index) => (
                      <span key={index}>{tech}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="load-more-container" data-aos="fade-up" style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button className="load-more-btn" id="loadMoreProjects" onClick={handleLoadMore} disabled={loading}>
              {loading ? (
                <>Loading... <i className="fas fa-spinner fa-pulse"></i></>
              ) : (
                <>Load More Projects <i className="fas fa-arrow-down"></i></>
              )}
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Projects;