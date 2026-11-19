import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { attachOnlineServer } from "./server/index.js";

function onlineWebSocketPlugin() {
  return {
    name: "hue-online-ws",
    async configureServer(server) {
      if (!server.httpServer) return;
      const online = await attachOnlineServer(server.httpServer);
      server.httpServer.once("close", () => online.close());
    },
    async configurePreviewServer(server) {
      if (!server.httpServer) return;
      const online = await attachOnlineServer(server.httpServer);
      server.httpServer.once("close", () => online.close());
    },
  };
}

export default defineConfig({
  plugins: [onlineWebSocketPlugin()],
  resolve: {
    alias: [
      {
        find: /^.*\/geography\/map\.js$/,
        replacement: fileURLToPath(
          new URL("./src/modules/areas/AreaModel.js", import.meta.url),
        ).replaceAll("\\", "/"),
      },
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) =>
          id.includes("osm-snapshot.json") ? "hue-osm-data" : undefined,
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
    watch: { ignored: ["**/tool/**", "**/dist/**"] },
  },
});
