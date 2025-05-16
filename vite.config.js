import path from 'node:path';
import react from '@vitejs/plugin-react';
import { createLogger, defineConfig } from 'vite';

// Runtime Error Handler
const configHorizonsRuntimeErrorHandler = `
window.onerror = (message, source, lineno, colno, errorObj) => {
  const errorDetails = errorObj ? JSON.stringify({
    name: errorObj.name,
    message: errorObj.message,
    stack: errorObj.stack,
    source,
    lineno,
    colno,
  }) : null;

  window.parent.postMessage({
    type: 'horizons-runtime-error',
    message,
    error: errorDetails
  }, '*');
};
`;

// Vite Error Overlay Handler
const configHorizonsViteErrorHandler = `
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const addedNode of mutation.addedNodes) {
      if (
        addedNode.nodeType === Node.ELEMENT_NODE &&
        (
          addedNode.tagName?.toLowerCase() === 'vite-error-overlay' ||
          addedNode.classList?.contains('backdrop')
        )
      ) {
        handleViteOverlay(addedNode);
      }
    }
  }
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

function handleViteOverlay(node) {
  if (!node.shadowRoot) return;

  const backdrop = node.shadowRoot.querySelector('.backdrop');
  if (backdrop) {
    const overlayHtml = backdrop.outerHTML;
    const parser = new DOMParser();
    const doc = parser.parseFromString(overlayHtml, 'text/html');
    const messageBodyElement = doc.querySelector('.message-body');
    const fileElement = doc.querySelector('.file');
    const messageText = messageBodyElement ? messageBodyElement.textContent.trim() : '';
    const fileText = fileElement ? fileElement.textContent.trim() : '';
    const error = messageText + (fileText ? ' File:' + fileText : '');

    window.parent.postMessage({
      type: 'horizons-vite-error',
      error,
    }, '*');
  }
}
`;

// Console Error Interceptor
const configHorizonsConsoleErrorHandler = `
const originalConsoleError = console.error;
console.error = function(...args) {
  originalConsoleError.apply(console, args);

  let errorString = '';
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg instanceof Error) {
      errorString = arg.stack || \`\${arg.name}: \${arg.message}\`;
      break;
    }
  }

  if (!errorString) {
    errorString = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
  }

  window.parent.postMessage({
    type: 'horizons-console-error',
    error: errorString
  }, '*');
};
`;

// Fetch Interceptor
const configWindowFetchMonkeyPatch = `
const originalFetch = window.fetch;

window.fetch = function(...args) {
  const url = args[0] instanceof Request ? args[0].url : args[0];

  if (url.startsWith('ws:') || url.startsWith('wss:')) {
    return originalFetch.apply(this, args);
  }

  return originalFetch.apply(this, args)
    .then(async response => {
      const contentType = response.headers.get('Content-Type') || '';
      const isDocumentResponse =
        contentType.includes('text/html') ||
        contentType.includes('application/xhtml+xml');

      if (!response.ok && !isDocumentResponse) {
        const responseClone = response.clone();
        const errorFromRes = await responseClone.text();
        console.error(\`Fetch error from \${response.url}: \${errorFromRes}\`);
      }

      return response;
    })
    .catch(error => {
      if (!url.match(/\\.html?$/i)) {
        console.error(error);
      }
      throw error;
    });
};
`;

// HTML Injection Plugin
const addTransformIndexHtml = {
  name: 'add-transform-index-html',
  transformIndexHtml(html) {
    return {
      html,
      tags: [
        {
          tag: 'script',
          attrs: { type: 'module' },
          children: configHorizonsRuntimeErrorHandler,
          injectTo: 'head',
        },
        {
          tag: 'script',
          attrs: { type: 'module' },
          children: configHorizonsViteErrorHandler,
          injectTo: 'head',
        },
        {
          tag: 'script',
          attrs: { type: 'module' },
          children: configHorizonsConsoleErrorHandler,
          injectTo: 'head',
        },
        {
          tag: 'script',
          attrs: { type: 'module' },
          children: configWindowFetchMonkeyPatch,
          injectTo: 'head',
        },
      ],
    };
  },
};

// Disable console.warn (optional)
console.warn = () => {};

// Setup custom logger
const logger = createLogger();
const loggerError = logger.error;
logger.error = (msg, options) => {
  if (options?.error?.toString().includes('CssSyntaxError: [postcss]')) {
    return;
  }
  loggerError(msg, options);
};

// ✅ Final unified export
export default defineConfig({
  base: '/Geofencify/', // Set for GitHub Pages
  plugins: [react(), addTransformIndexHtml],
  customLogger: logger,
  server: {
    cors: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
    allowedHosts: true,
  },
  resolve: {
    extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
