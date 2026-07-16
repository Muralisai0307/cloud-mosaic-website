// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill window.scrollTo and HTMLElement.prototype.scrollIntoView for JSDOM
window.scrollTo = () => {};
if (typeof window.HTMLElement !== 'undefined') {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}

// Mock react-helmet-async to avoid React 19 context issues in tests
jest.mock('react-helmet-async', () => {
  const React = require('react');
  return {
    HelmetProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    Helmet: ({ children }) => React.createElement(React.Fragment, null, children || null),
  };
});


