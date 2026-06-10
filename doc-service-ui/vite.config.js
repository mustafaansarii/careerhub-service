import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:5001';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/careerhub': {
          target: backendUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/careerhub/, ''),
        },
      },
    },
  };
});
