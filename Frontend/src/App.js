import React, { useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './styles/global.css';

// Import Context Providers
import { NotificationProvider } from './context/NotificationContext';

// Import Error Boundary
import ErrorBoundary from './components/ErrorBoundary';

// Import Common Components
import Loading from './components/common/Loading';
import ContactHub from './components/ContactHub';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load public pages for performance optimization
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Products = lazy(() => import('./pages/Products'));
const Projects = lazy(() => import('./pages/Projects'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const Team = lazy(() => import('./pages/Team'));
const Careers = lazy(() => import('./pages/Careers'));
const Contact = lazy(() => import('./pages/Contact'));
const ErpComparison = lazy(() => import('./pages/ErpComparison'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Auth pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Client Portal pages (lazy loaded)
const PortalLayout = lazy(() => import('./pages/portal/PortalLayout'));
const Dashboard = lazy(() => import('./pages/portal/Dashboard'));
const Profile = lazy(() => import('./pages/portal/Profile'));
const PortalProjects = lazy(() => import('./pages/portal/Projects'));
const Documents = lazy(() => import('./pages/portal/Documents'));
const Contracts = lazy(() => import('./pages/portal/Contracts'));
const Invoices = lazy(() => import('./pages/portal/Invoices'));
const Payments = lazy(() => import('./pages/portal/Payments'));
const Meetings = lazy(() => import('./pages/portal/Meetings'));
const Support = lazy(() => import('./pages/portal/Support'));
const Settings = lazy(() => import('./pages/portal/Settings'));

// Scroll restoration component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <NotificationProvider>
          <Router>
            <ScrollToTop />
            <Suspense fallback={<Loading fullPage={true} />}>
              <Routes>
                {/* ── Public Pages ── */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/products" element={<Products />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/team" element={<Team />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/erp-comparison" element={<ErpComparison />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />

                {/* ── Auth Pages ── */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* ── Client Portal (Protected) ── */}
                <Route
                  path="/portal"
                  element={
                    <ProtectedRoute>
                      <PortalLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="projects" element={<PortalProjects />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="contracts" element={<Contracts />} />
                  <Route path="invoices" element={<Invoices />} />
                  <Route path="payments" element={<Payments />} />
                  <Route path="meetings" element={<Meetings />} />
                  <Route path="support" element={<Support />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* ── 404 ── */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <ContactHub />
          </Router>
        </NotificationProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;