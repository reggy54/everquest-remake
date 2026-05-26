import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './src/App.patched6';

(global as any).localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

try {
  const html = renderToString(React.createElement(App));
  console.log("RENDER SUCCESS, HTML length:", html.length);
} catch (err: any) {
  console.log("RENDER ERROR:", err.message);
  console.log(err.stack);
}
