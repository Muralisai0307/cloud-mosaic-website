import { render, screen } from '@testing-library/react';
import App from './App';

test('renders App with Suspense loading fallback', () => {
  render(<App />);
  const loadingElement = screen.getByLabelText(/Loading content/i);
  expect(loadingElement).toBeInTheDocument();
});

