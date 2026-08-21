// vite.config.js
import { defineConfig } from "file:///D:/Shopidoo/shopidoo_sellerfrontend/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Shopidoo/shopidoo_sellerfrontend/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            if (err.code === "ECONNREFUSED") {
              console.warn("[vite proxy] Backend (127.0.0.1:5001) is starting up or offline.");
            }
          });
        }
      },
      "/uploads": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            if (err.code === "ECONNREFUSED") {
              console.warn("[vite proxy] Backend (127.0.0.1:5001) is starting up or offline.");
            }
          });
        }
      },
      "/mock": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            if (err.code === "ECONNREFUSED") {
              console.warn("[vite proxy] Backend (127.0.0.1:5001) is starting up or offline.");
            }
          });
        }
      }
    }
  },
  resolve: { alias: { "@": "/src" } },
  build: {
    chunkSizeWarningLimit: 1e3
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxTaG9waWRvb1xcXFxzaG9waWRvb19zZWxsZXJmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcU2hvcGlkb29cXFxcc2hvcGlkb29fc2VsbGVyZnJvbnRlbmRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1Nob3BpZG9vL3Nob3BpZG9vX3NlbGxlcmZyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIHBvcnQ6IDUxNzQsXHJcbiAgICBwcm94eToge1xyXG4gICAgICAnL2FwaSc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTI3LjAuMC4xOjUwMDEnLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmU6IChwcm94eSkgPT4ge1xyXG4gICAgICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVycikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXJyLmNvZGUgPT09ICdFQ09OTlJFRlVTRUQnKSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbdml0ZSBwcm94eV0gQmFja2VuZCAoMTI3LjAuMC4xOjUwMDEpIGlzIHN0YXJ0aW5nIHVwIG9yIG9mZmxpbmUuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgICcvdXBsb2Fkcyc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTI3LjAuMC4xOjUwMDEnLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmU6IChwcm94eSkgPT4ge1xyXG4gICAgICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVycikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXJyLmNvZGUgPT09ICdFQ09OTlJFRlVTRUQnKSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbdml0ZSBwcm94eV0gQmFja2VuZCAoMTI3LjAuMC4xOjUwMDEpIGlzIHN0YXJ0aW5nIHVwIG9yIG9mZmxpbmUuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgICcvbW9jayc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTI3LjAuMC4xOjUwMDEnLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICBjb25maWd1cmU6IChwcm94eSkgPT4ge1xyXG4gICAgICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVycikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXJyLmNvZGUgPT09ICdFQ09OTlJFRlVTRUQnKSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbdml0ZSBwcm94eV0gQmFja2VuZCAoMTI3LjAuMC4xOjUwMDEpIGlzIHN0YXJ0aW5nIHVwIG9yIG9mZmxpbmUuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcmVzb2x2ZTogeyBhbGlhczogeyAnQCc6ICcvc3JjJyB9IH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcclxuICB9XHJcbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBaVMsU0FBUyxvQkFBb0I7QUFDOVQsT0FBTyxXQUFXO0FBRWxCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxXQUFXLENBQUMsVUFBVTtBQUNwQixnQkFBTSxHQUFHLFNBQVMsQ0FBQyxRQUFRO0FBQ3pCLGdCQUFJLElBQUksU0FBUyxnQkFBZ0I7QUFDL0Isc0JBQVEsS0FBSyxrRUFBa0U7QUFBQSxZQUNqRjtBQUFBLFVBQ0YsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsTUFDQSxZQUFZO0FBQUEsUUFDVixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxXQUFXLENBQUMsVUFBVTtBQUNwQixnQkFBTSxHQUFHLFNBQVMsQ0FBQyxRQUFRO0FBQ3pCLGdCQUFJLElBQUksU0FBUyxnQkFBZ0I7QUFDL0Isc0JBQVEsS0FBSyxrRUFBa0U7QUFBQSxZQUNqRjtBQUFBLFVBQ0YsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxXQUFXLENBQUMsVUFBVTtBQUNwQixnQkFBTSxHQUFHLFNBQVMsQ0FBQyxRQUFRO0FBQ3pCLGdCQUFJLElBQUksU0FBUyxnQkFBZ0I7QUFDL0Isc0JBQVEsS0FBSyxrRUFBa0U7QUFBQSxZQUNqRjtBQUFBLFVBQ0YsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVMsRUFBRSxPQUFPLEVBQUUsS0FBSyxPQUFPLEVBQUU7QUFBQSxFQUNsQyxPQUFPO0FBQUEsSUFDTCx1QkFBdUI7QUFBQSxFQUN6QjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
