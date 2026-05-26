import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './src/App';

(global as any).localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

try {
  const html = renderToString(React.createElement(App));
  console.log("INITIAL RENDER SUCCESS");
} catch (err) {
  console.log("INITIAL RENDER ERROR:", err);
}

