/**
 * Shared utility functions for CloudMosaic application.
 */

/**
 * Validates email address format using standard regex.
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validates US/International phone numbers.
 */
export const validatePhone = (phone) => {
  if (!phone) return true; // Optional field
  // Simple check for numbers, spaces, parentheses, dashes, plus
  const re = /^[\d\s()+-]{7,20}$/;
  return re.test(phone);
};

/**
 * Format currency helper
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * ROI Calculator calculations.
 * Returns { currentTotal, newTotal, monthlySavings, annualSavings, savingsPercentage }
 */
export const calculateRoi = (cloudSpend, employees, itCost, services) => {
  const currentTotal = cloudSpend + itCost;
  const savingsRate = 0.40;
  const serviceMultiplier = 1 + (services * 0.02);
  const sizeMultiplier = 1 + (Math.min(employees, 1000) / 1000) * 0.2;
  const effectiveSavingsRate = savingsRate * serviceMultiplier * sizeMultiplier;
  const newTotal = Math.round(currentTotal * (1 - Math.min(effectiveSavingsRate, 0.6)));
  const monthlySavings = currentTotal - newTotal;
  const annualSavings = monthlySavings * 12;
  const savingsPercentage = currentTotal > 0 ? ((currentTotal - newTotal) / currentTotal * 100).toFixed(1) : '0.0';

  return {
    currentTotal,
    newTotal,
    monthlySavings,
    annualSavings,
    savingsPercentage
  };
};

/**
 * Recommender recommendation generator.
 * Returns array of recommendation objects.
 */
export const generateRecommendations = (quizAnswers) => {
  const recs = [];
  const challenge = quizAnswers.q1;
  const companySize = quizAnswers.q2;
  const timeline = quizAnswers.q3;
  const support = quizAnswers.q5;

  if (challenge === 'cloud') {
    recs.push({
      title: '☁️ Cloud Migration Package',
      description: 'Complete cloud migration solution with 24/7 monitoring',
      features: [
        'AWS/Azure/GCP certified experts',
        'Zero downtime migration',
        '40% average cost reduction',
        'Security compliance included'
      ],
      cta: 'Get Cloud Quote',
      badge: '🔥 Top Pick'
    });

    if (companySize === 'enterprise' || companySize === 'medium') {
      recs.push({
        title: '🏢 Enterprise Cloud Suite',
        description: 'Scalable cloud infrastructure for large organizations',
        features: [
          'Multi-cloud management',
          'Auto-scaling capabilities',
          'Disaster recovery',
          'Dedicated account manager'
        ],
        cta: 'Explore Enterprise',
        badge: '⭐ Recommended'
      });
    } else {
      recs.push({
        title: '🚀 Startup Cloud Boost',
        description: 'Affordable cloud solutions for growing businesses',
        features: [
          'Pay-as-you-go pricing',
          'Quick deployment',
          'Basic monitoring',
          'Email support'
        ],
        cta: 'Start Free Trial',
        badge: '💰 Budget Friendly'
      });
    }
  } else if (challenge === 'security') {
    recs.push({
      title: '🔒 Security & Compliance Suite',
      description: 'Enterprise-grade security with compliance automation',
      features: [
        'Security audits & assessments',
        'GDPR/HIPAA/SOC2 compliance',
        'Penetration testing',
        '24/7 threat monitoring'
      ],
      cta: 'Secure Your Business',
      badge: '🛡️ Top Rated'
    });

    if (support === 'yes') {
      recs.push({
        title: '🔄 Managed Security Services',
        description: 'Ongoing security management and incident response',
        features: [
          '24/7 security operations center',
          'Real-time threat detection',
          'Incident response team',
          'Monthly security reports'
        ],
        cta: 'Get Protected',
        badge: '🔔 24/7 Support'
      });
    }
  } else if (challenge === 'hr') {
    recs.push({
      title: '👥 HR Consulting Package',
      description: 'End-to-end HR solutions for modern businesses',
      features: [
        'Talent acquisition & headhunting',
        'HRMS implementation',
        'Performance management',
        'Employee engagement programs'
      ],
      cta: 'Transform HR',
      badge: '📊 Popular'
    });
  } else if (challenge === 'web') {
    recs.push({
      title: '💻 Web Development Services',
      description: 'Custom web applications with modern tech stack',
      features: [
        'React/Node.js/Python development',
        'Cloud-native architecture',
        'Progressive Web Apps (PWA)',
        'API integration'
      ],
      cta: 'Start Project',
      badge: '✨ Trending'
    });
  } else if (challenge === 'ai') {
    recs.push({
      title: '🤖 AI & Automation Platform',
      description: 'Intelligent automation for business processes',
      features: [
        'RPA implementation',
        'Predictive analytics',
        'Custom ML models',
        'Business intelligence'
      ],
      cta: 'Explore AI',
      badge: '⚡ Cutting Edge'
    });
  } else if (challenge === 'consulting') {
    recs.push({
      title: '📈 IT Consulting Services',
      description: 'Expert guidance for digital transformation',
      features: [
        'Digital strategy & roadmap',
        'Technology architecture review',
        'Vendor selection',
        'Digital transformation'
      ],
      cta: 'Get Advice',
      badge: '🎯 Strategic'
    });
  }

  if (recs.length < 3) {
    if (timeline === 'immediate') {
      recs.push({
        title: '⚡ Rapid Deployment Package',
        description: 'Fast-track implementation for urgent needs',
        features: [
          'Expedited setup (under 2 weeks)',
          'Priority support',
          'Quick start templates',
          'Training included'
        ],
        cta: 'Start Now',
        badge: '🚀 Express'
      });
    } else if (timeline === 'long') {
      recs.push({
        title: '🎯 Strategic Partnership',
        description: 'Long-term digital transformation roadmap',
        features: [
          'Multi-phase implementation',
          'Quarterly strategy reviews',
          'Custom development',
          'Dedicated team'
        ],
        cta: 'Plan Future',
        badge: '🤝 Partnership'
      });
    }
  }
  return recs;
};
