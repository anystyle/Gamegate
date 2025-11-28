import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';
  const isVercelBuild = process.env.VERCEL === '1';

  // Base configuration
  const baseConfig = {
    root: '.',
    publicDir: 'public',
    build: {
      outDir: 'dist',
      target: 'es2015',
      minify: 'terser',
      sourcemap: !isProduction,
      rollupOptions: {
        input: {
          'index.html': 'public/index.html',
          'index_en.html': 'public/index_en.html'
        }
      }
    },
    resolve: {
      alias: {
        // Node.js polyfills for development only
        'buffer': 'buffer',
        'stream': 'stream',
        'util': 'util',
        'url': 'url',
        'querystring': 'querystring'
      }
    },
    server: {
      port: 3000,
      open: true
    }
  };

  if (isVercelBuild) {
    // Vercel-specific configuration
    return {
      ...baseConfig,
      build: {
        ...baseConfig.build,
        rollupOptions: {
          ...baseConfig.build.rollupOptions,
          output: {
            manualChunks: {
              vendor: ['express', 'cors', 'helmet'],
              common: ['buffer', 'stream', 'util', 'url', 'querystring']
            }
          }
        }
      },
      resolve: {
        ...baseConfig.resolve,
        // No polyfills for production to avoid conflicts
        browserField: false,
        mainFields: ['browser', 'module', 'main']
      },
      optimizeDeps: {
        include: ['express', 'cors', 'helmet']
      },
      esbuild: {
        target: 'es2015',
        platform: 'browser'
      }
    };
  }

  // Local development configuration
  return {
    ...baseConfig,
    plugins: [
      require('@vitejs/plugin-legacy')({
        targets: ['defaults', 'not IE 11']
      })
    ],
    build: {
      ...baseConfig.build,
      sourcemap: true,
      rollupOptions: {
        ...baseConfig.build.rollupOptions,
        output: {
          manualChunks: {
            vendor: ['express', 'cors', 'helmet', 'compression', 'express-rate-limit', 'node-cache'],
            common: ['buffer', 'stream', 'util', 'url', 'querystring']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['express', 'cors', 'helmet']
    },
    server: {
      ...baseConfig.server,
      fs: {
        strict: false
      }
    },
    esbuild: {
      target: 'es2015',
      platform: 'browser'
    },
    define: {
      // Environment variables
      'process.env.NODE_ENV': JSON.stringify(mode || 'development')
    }
  };
});