import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { validateEmail, validatePhone } from '../utils/helpers';
import './ContactHub.css';

function ContactHub() {
  const { success, error, warning, info } = useNotification();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isBackToTopVisible, setIsBackToTopVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { text: '👋 Hello! How can we help you today?', sender: 'bot' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatInput, setChatInput] = useState('');
  
  // Schedule Form State
  const [scheduleService, setScheduleService] = useState('');
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [schedulePhone, setSchedulePhone] = useState('');
  const [scheduleCompany, setScheduleCompany] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  // Handle scroll events (back to top visibility and closing menu)
  useEffect(() => {
    const handleScroll = () => {
      setIsBackToTopVisible(window.scrollY > 500);
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen]);

  // Keyboard shortcuts (Ctrl+K and Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setIsMenuOpen(prev => !prev);
        info('Contact menu toggled (Ctrl+K)');
      }
      if (e.key === 'Escape') {
        setIsChatOpen(false);
        setIsMenuOpen(false);
        setIsScheduleOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [info]);

  // Show keyboard hint on load
  useEffect(() => {
    const hintShown = sessionStorage.getItem('keyboardHintShown');
    if (!hintShown) {
      const timer = setTimeout(() => {
        info('💡 Tip: Press Ctrl + K to open contact menu', 5000);
        sessionStorage.setItem('keyboardHintShown', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [info]);

  // Show secondary bot welcome message on first open
  useEffect(() => {
    if (isChatOpen && chatMessages.length === 1) {
      const timer = setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          { text: 'How can I help you today? You can ask about our services, pricing, or schedule a demo!', sender: 'bot' }
        ]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isChatOpen, chatMessages]);

  const toggleMenu = (e) => {
    e.preventDefault();
    setIsMenuOpen(prev => !prev);
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pricing') || lowerMessage.includes('how much')) {
      return "💰 Our pricing is customized based on your specific needs. Would you like to schedule a free consultation to discuss your requirements and get a detailed quote?";
    } 
    else if (lowerMessage.includes('demo') || lowerMessage.includes('schedule') || lowerMessage.includes('book')) {
      return "📅 You can schedule a demo by clicking the 'Schedule Demo' option in our contact menu! Or you can email us at sales@cloudmosaic.ai with your preferred time.";
    } 
    else if (lowerMessage.includes('cloud') || lowerMessage.includes('migration') || lowerMessage.includes('aws') || lowerMessage.includes('azure')) {
      return "☁️ We specialize in cloud migration! Our certified architects have successfully migrated 200+ clients to AWS, Azure, and GCP with 40% average cost savings. What specific cloud service are you interested in?";
    } 
    else if (lowerMessage.includes('hr') || lowerMessage.includes('consulting') || lowerMessage.includes('recruitment') || lowerMessage.includes('talent')) {
      return "👥 Our HR consulting team has placed 500+ professionals and helped companies reduce turnover by 25%. We can help with recruitment, HRMS implementation, and employee engagement. Would you like to speak with an HR expert?";
    } 
    else if (lowerMessage.includes('security') || lowerMessage.includes('compliance') || lowerMessage.includes('gdpr') || lowerMessage.includes('hipaa')) {
      return "🔒 Our security experts provide comprehensive audits, compliance management, and 24/7 threat monitoring. We help achieve SOC2, GDPR, and HIPAA certifications. Interested in a security assessment?";
    } 
    else if (lowerMessage.includes('web') || lowerMessage.includes('development') || lowerMessage.includes('app') || lowerMessage.includes('website')) {
      return "💻 We build modern web applications using React, Node.js, and cloud-native architecture. Our solutions handle millions of users with sub-second response times. Tell us about your project!";
    } 
    else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "👋 Hello! Thanks for reaching out to CloudMosaic. How can I assist you today? You can ask about our services, pricing, or schedule a demo with our team!";
    } 
    else if (lowerMessage.includes('contact') || lowerMessage.includes('call') || lowerMessage.includes('phone')) {
      return "📞 You can reach us at +1 (720) 221-7062. Our support team is available 24/7. Or you can email us at support@cloudmosaic.ai";
    } 
    else if (lowerMessage.includes('thank')) {
      return "🙏 You're welcome! Is there anything else I can help you with today?";
    } 
    else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      return "👋 Thank you for chatting with us! Feel free to reach out anytime. Have a great day!";
    } 
    else {
      return "✅ Thank you for your message! Our team will get back to you within 24 hours. For immediate assistance, please call us at +1 (720) 221-7062 or email support@cloudmosaic.ai";
    }
  };

  const handleSendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    
    // Add user message
    setChatMessages(prev => [...prev, { text, sender: 'user' }]);
    setChatInput('');
    setIsTyping(true);

    // Reply after delay
    setTimeout(() => {
      setIsTyping(false);
      const response = getBotResponse(text);
      setChatMessages(prev => [...prev, { text: response, sender: 'bot' }]);
    }, 1500);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!scheduleService) {
      warning('Please select a service.');
      return;
    }
    if (!scheduleName.trim()) {
      warning('Please enter your full name.');
      return;
    }
    if (!scheduleEmail.trim() || !validateEmail(scheduleEmail)) {
      warning('Please enter a valid email address.');
      return;
    }
    if (schedulePhone && !validatePhone(schedulePhone)) {
      warning('Please enter a valid phone number.');
      return;
    }
    if (!scheduleDate) {
      warning('Please select a date.');
      return;
    }
    if (!scheduleTime) {
      warning('Please select a time.');
      return;
    }

    // Verify date is in the future
    const selectedDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    if (selectedDateTime <= new Date()) {
      warning('Please schedule a demo date and time in the future.');
      return;
    }

    setIsBooking(true);
    try {
      await apiService.submitScheduleForm({
        service: scheduleService,
        name: scheduleName,
        email: scheduleEmail,
        phone: schedulePhone,
        company: scheduleCompany,
        date: scheduleDate,
        time: scheduleTime,
        notes: scheduleNotes
      });
      success(`✅ Demo scheduled successfully! We've sent a confirmation to ${scheduleEmail}`);
      setIsScheduleOpen(false);
      
      // Reset form
      setScheduleService('');
      setScheduleName('');
      setScheduleEmail('');
      setSchedulePhone('');
      setScheduleCompany('');
      setScheduleDate('');
      setScheduleTime('');
      setScheduleNotes('');
    } catch (err) {
      error(err.message || 'Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const openScheduler = (e) => {
    e.preventDefault();
    setIsMenuOpen(false);
    setIsScheduleOpen(true);
  };

  const openChat = (e) => {
    e.preventDefault();
    setIsMenuOpen(false);
    setIsChatOpen(true);
  };

  return (
    <>
      {/* Floating Contact Hub Button & Menu */}
      <div className="contact-hub">
        <button 
          className="contact-hub-button" 
          id="contactHubBtn"
          onClick={toggleMenu}
          aria-label="Toggle contact menu"
          aria-expanded={isMenuOpen}
        >
          <i className="fas fa-phone-alt" style={{ transition: 'transform 0.3s', transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} aria-hidden="true"></i>
          <span>Contact</span>
        </button>
        <div className={`contact-hub-menu ${isMenuOpen ? 'active' : ''}`} id="contactHubMenu">
          <a href="tel:+17202217062" className="hub-item">
            <i className="fas fa-phone" aria-hidden="true"></i>
            <div className="hub-item-content">
              <span className="hub-label">Call Us</span>
              <span className="hub-value">+1 (720) 221-7062</span>
            </div>
          </a>
          <a href="mailto:sales@cloudmosaic.ai" className="hub-item">
            <i className="fas fa-envelope" aria-hidden="true"></i>
            <div className="hub-item-content">
              <span className="hub-label">Email</span>
              <span className="hub-value">sales@cloudmosaic.ai</span>
            </div>
          </a>
          <a href="https://wa.me/17202217062" className="hub-item" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-whatsapp" aria-hidden="true"></i>
            <div className="hub-item-content">
              <span className="hub-label">WhatsApp</span>
              <span className="hub-value">Chat with us</span>
            </div>
          </a>
          <a href="#schedule" className="hub-item schedule-demo" onClick={openScheduler}>
            <i className="fas fa-calendar-alt" aria-hidden="true"></i>
            <div className="hub-item-content">
              <span className="hub-label">Schedule</span>
              <span className="hub-value">Free Demo</span>
            </div>
          </a>
          <div className="hub-item chatbot-trigger" id="chatbotTrigger" onClick={openChat} style={{ cursor: 'pointer' }}>
            <i className="fas fa-comment-dots" aria-hidden="true"></i>
            <div className="hub-item-content">
              <span className="hub-label">Live Chat</span>
              <span className="hub-value">Quick support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Chat Widget */}
      <div className={`chat-widget ${isChatOpen ? 'active' : ''}`} id="chatWidget" role="dialog" aria-label="Support Chat Window">
        <div className="chat-header">
          <h4>CloudMosaic Support</h4>
          <button className="chat-close" onClick={() => setIsChatOpen(false)} aria-label="Close chat window">
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div className="chat-messages" id="chatMessages">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`}>
              <div className="message-content">{msg.text}</div>
            </div>
          ))}
          {isTyping && (
            <div className="message bot typing-container" id="typingIndicator">
              <div className="typing-indicator" aria-label="Bot is typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-area">
          <input 
            type="text" 
            placeholder="Type your message..." 
            id="chatInput"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendChat();
              }
            }}
            aria-label="Type support message"
          />
          <button id="sendMessage" onClick={handleSendChat} aria-label="Send message">
            <i className="fas fa-paper-plane" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      {/* Schedule Demo Modal */}
      {isScheduleOpen && (
        <div className="schedule-modal" id="scheduleModal" style={{ display: 'flex' }} role="dialog" aria-modal="true" aria-labelledby="scheduleModalTitle">
          <div className="schedule-modal-content">
            <button className="schedule-modal-close" onClick={() => setIsScheduleOpen(false)} aria-label="Close modal">
              <i className="fas fa-times" aria-hidden="true"></i>
            </button>
            <h2 id="scheduleModalTitle">Schedule a Free Demo</h2>
            <p>Choose a service and preferred time for your personalized demo</p>
            <form id="scheduleForm" className="schedule-form" onSubmit={handleScheduleSubmit}>
              <div className="form-group">
                <select 
                  id="serviceSelect" 
                  required 
                  value={scheduleService} 
                  onChange={(e) => setScheduleService(e.target.value)}
                  aria-label="Select Service"
                >
                  <option value="">Select Service *</option>
                  <option value="cloud">Cloud Migration</option>
                  <option value="security">Security & Compliance</option>
                  <option value="hr">HR Consulting</option>
                  <option value="web">Web Development</option>
                  <option value="ai">AI & Automation</option>
                  <option value="managed">Managed IT Services</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input 
                    type="text" 
                    id="nameInput" 
                    placeholder="Your Full Name *" 
                    required 
                    value={scheduleName}
                    onChange={(e) => setScheduleName(e.target.value)}
                    aria-label="Your Full Name"
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="email" 
                    id="emailInput" 
                    placeholder="Your Email *" 
                    required 
                    value={scheduleEmail}
                    onChange={(e) => setScheduleEmail(e.target.value)}
                    aria-label="Your Email"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input 
                    type="tel" 
                    id="phoneInput" 
                    placeholder="Phone Number" 
                    value={schedulePhone}
                    onChange={(e) => setSchedulePhone(e.target.value)}
                    aria-label="Phone Number"
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    id="companyInput" 
                    placeholder="Company Name" 
                    value={scheduleCompany}
                    onChange={(e) => setScheduleCompany(e.target.value)}
                    aria-label="Company Name"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input 
                    type="date" 
                    id="dateInput" 
                    required 
                    min={new Date().toISOString().split('T')[0]}
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    aria-label="Preferred Date"
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="time" 
                    id="timeInput" 
                    required 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    aria-label="Preferred Time"
                  />
                </div>
              </div>
              <div className="form-group">
                <textarea 
                  id="notesInput" 
                  placeholder="Additional Notes or Questions (Optional)" 
                  rows="3"
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  aria-label="Additional Notes"
                />
              </div>
              <button type="submit" className="btn-schedule" id="submitSchedule" disabled={isBooking}>
                {isBooking ? (
                  <>
                    <i className="fas fa-spinner fa-pulse" aria-hidden="true"></i> Booking...
                  </>
                ) : (
                  <>
                    <i className="fas fa-calendar-check" aria-hidden="true"></i> Confirm Booking
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Back to Top Button */}
      <button 
        id="back-to-top" 
        className={isBackToTopVisible ? 'visible' : ''}
        onClick={handleBackToTop}
        aria-label="Back to top"
        style={{ display: isBackToTopVisible ? 'flex' : 'none' }}
      >
        <i className="fas fa-arrow-up" aria-hidden="true"></i>
      </button>
    </>
  );
}

export default ContactHub;
