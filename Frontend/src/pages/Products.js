import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNotification } from '../context/NotificationContext';
import '../styles/Products.css';

function Products() {
  const { info } = useNotification();

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-in-out'
    });
  }, []);

  const handleQuickView = (productName) => {
    info(`Quick view for: ${productName}. Enterprise modules are active.`);
  };

  const productsList = [
    {
      id: 1,
      badge: 'New',
      badgeClass: '',
      name: 'Brainzyx',
      category: 'AI-Powered Digital SAT® Prep',
      description: 'Advanced AI-powered preparation platform tailored for mastering the Digital SAT, integrating cognitive training and algorithmic mastery.',
      features: ['Algorithmic Mastery', 'Cognitive Training', 'AI Analytics'],
      price: 'Subscription Based',
      link: 'https://www.brainzyx.com',
      image: 'https://cloudmosaic.ai/Images/brainzyx.jpg',
      isExternal: true
    }
  ];

  return (
    <>
      <Helmet>
        <title>Our Products - CloudMosaic</title>
        <meta name="description" content="Discover CloudMosaic's proprietary products built to drive speed and compliance, featuring the Force ERP suite." />
        <link rel="canonical" href="https://Muralisai0307.github.io/cloudmosaic-react/#/products" />
        <meta property="og:title" content="Our Products - CloudMosaic" />
        <meta property="og:description" content="Discover CloudMosaic's proprietary products built to drive speed and compliance, featuring the Force ERP suite." />
        <meta property="og:url" content="https://Muralisai0307.github.io/cloudmosaic-react/#/products" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Header />
      
      <section className="page-header">
        <div className="container">
          <h1 data-aos="fade-up">Our Products</h1>
          <p data-aos="fade-up" data-aos-delay="100"></p>
        </div>
      </section>

      <section className="products-section">
        <div className="container">
          <div className="products-grid-full" id="productsGrid">
            {productsList.map((product, index) => (
              <div key={product.id} className="product-card-full" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>
                <div className={`product-badge ${product.badgeClass}`}>{product.badge}</div>
                <div className="product-image">
                  <img src={product.image} alt={product.name} loading="lazy" />
                  <div className="product-overlay">
                    <button className="product-quick-view" style={{ border: 'none', cursor: 'pointer' }} onClick={() => handleQuickView(product.name)} aria-label={`Quick view ${product.name}`}>
                      Quick View
                    </button>
                  </div>
                </div>
                <div className="product-details">
                  <h3>{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  <p className="product-description">{product.description}</p>
                  <div className="product-features">
                    {product.features.map((feature, fIdx) => (
                      <span key={fIdx}><i className="fas fa-check" aria-hidden="true"></i> {feature}</span>
                    ))}
                  </div>
                  <div className="product-footer">
                    <span className="product-price">{product.price}</span>
                    {product.isExternal ? (
                      <a href={product.link} target="_blank" rel="noopener noreferrer" className="btn-product">
                        Get Started <i className="fas fa-arrow-right" aria-hidden="true"></i>
                      </a>
                    ) : (
                      <Link to={product.link} className="btn-product">
                        Learn More <i className="fas fa-arrow-right" aria-hidden="true"></i>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Looking for a Custom Solution?</h2>
          <p>Let's discuss how our products can be tailored to your specific business needs.</p>
          <Link to="/contact" className="btn-large" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Schedule a Demo <i className="fas fa-calendar-alt"></i>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Products;