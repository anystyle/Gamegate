import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';
  const isVercelBuild = process.env.VERCEL === '1' || command === 'build';

  if (isVercelBuild) {
    // Vercel-specific configuration
    return {
      plugins: [
        require('@vitejs/plugin-legacy')({
          targets: ['defaults', 'not IE 11'],
          additionalLegacyPolyfills: ['whatwg-fetch']
        })
      ],
      build: {
        target: 'es2015',
        minify: 'terser',
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['express', 'cors', 'helmet'],
              common: ['buffer', 'stream', 'util', 'url', 'querystring']
            }
          }
        }
      },
      resolve: {
        alias: {
          // Keep Node.js polyfills for development
          'buffer': 'buffer',
          'stream': 'stream',
          'util': 'util',
          'url': 'url',
          'querystring': 'querystring'
        },
        // No polyfills for production to avoid conflicts
        browserField: false,
        mainFields: ['browser', 'module', 'main']
      },
      optimizeDeps: {
        include: ['express', 'cors', 'helmet']
      },
      server: {
        fs: {
          strict: false
        },
        preTransformRequests: {
          // Don't transform Node.js modules
          transform: (request) => {
            if (request.url.includes('/node_modules/')) {
              return null; // Skip transformation for Node.js modules
            }
          }
        }
      },
      esbuild: {
        target: 'es2015',
        platform: 'node'
      }
    };
  }

  // Local development configuration
  return {
    plugins: [
      require('@vitejs/plugin-legacy')({
        targets: ['defaults', 'not IE 11']
      })
    ],
    build: {
      target: 'es2015',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['express', 'cors', 'helmet', 'compression', 'express-rate-limit', 'node-cache'],
            common: ['buffer', 'stream', 'util', 'url', 'querystring']
          }
        }
      }
    },
    resolve: {
      alias: {
        // Node.js polyfills for development
        'buffer': 'buffer',
        'stream': 'stream',
        'util': 'util',
        'url': 'url',
        'querystring': 'querystring'
      }
    },
    optimizeDeps: {
      include: ['express', 'cors', 'helmet']
    },
    server: {
      fs: {
        strict: false
      }
    },
    esbuild: {
      target: 'es2015',
      platform: 'node'
    },
    define: {
      // Environment variables
      'process.env.NODE_ENV': JSON.stringify(mode || 'development')
    }
  };
});