import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './src/App.patched2';

(global as any).localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

try {
  const html = renderToString(React.createElement(App));
  console.log(html);
} catch (err) {
  console.log("RENDER ERROR:", err);
}
