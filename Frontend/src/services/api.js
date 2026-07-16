// const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.cloudmosaic.ai';

/**
 * Simulates an API post request with delay and validation.
 */
const mockApiPost = async (endpoint, data) => {
  // In a real application, this would fetch from the backend:
  // const response = await fetch(`${API_BASE_URL}${endpoint}`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data)
  // });
  // if (!response.ok) throw new Error('API Error');
  // return response.json();

  // Simulate network latency (800ms to 1500ms)
  const latency = Math.floor(Math.random() * 700) + 800;
  await new Promise((resolve) => setTimeout(resolve, latency));

  // Simulate validation or server-side checks
  if (endpoint === '/newsletter') {
    if (!data.email || !data.email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
  } else if (endpoint === '/contact') {
    if (!data.name || !data.email || !data.message) {
      throw new Error('Please fill in all required fields.');
    }
  } else if (endpoint === '/schedule') {
    if (!data.name || !data.email || !data.date || !data.time || !data.service) {
      throw new Error('Please fill in all required scheduling fields.');
    }
  } else if (endpoint === '/careers') {
    if (!data.name || !data.email || !data.file) {
      throw new Error('Name, email, and resume are required.');
    }
  } else if (endpoint === '/reviews') {
    if (!data.name || !data.email || !data.rating || !data.comment) {
      throw new Error('Name, email, rating, and review comment are required.');
    }
  }

  // Simulate success
  return {
    success: true,
    message: 'Success',
    timestamp: new Date().toISOString(),
    data
  };
};

export const apiService = {
  submitContactForm: (data) => mockApiPost('/contact', data),
  submitScheduleForm: (data) => mockApiPost('/schedule', data),
  submitJobApplication: (data) => mockApiPost('/careers', data),
  subscribeNewsletter: (email) => mockApiPost('/newsletter', { email }),
  submitReviewForm: (data) => mockApiPost('/reviews', data),
};
