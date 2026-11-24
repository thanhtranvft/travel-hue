import { defineConfig } from "vite";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { attachOnlineServer } from "./server/index.js";

const areaModelPath = fileURLToPath(
  new URL("./src/modules/areas/AreaModel.js", import.meta.url),
).replaceAll("\\", "/");
const fallbackMapPath = fileURLToPath(
  new URL("./src/core/shared/geography/map.js", import.meta.url),
).replaceAll("\\", "/");

function aliasFallbackMapPlugin() {
  return {
    name: "hue-alias-fallback-map",
    enforce: "pre",
    resolveId(source, importer) {
      const cleanSource = source.split("?")[0].replaceAll("\\", "/");
      if (
        cleanSource === fallbackMapPath ||
        cleanSource.endsWith("/geography/map.js")
      ) {
        return areaModelPath;
      }
      if (importer && cleanSource.startsWith(".")) {
        const cleanImporter = importer.split("?")[0];
        const candidate = resolvePath(
          dirname(cleanImporter),
          cleanSource,
        ).replaceAll("\\", "/");
        if (candidate === fallbackMapPath) {
          return areaModelPath;
        }
      }
      return null;
    },
  };
}

function onlineWebSocketPlugin() {
  const mountHealth = (server, online) => {
    server.middlewares.use("/health", (req, res) => {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify(online.room.summary()));
    });
  };
  return {
    name: "hue-online-ws",
    async configureServer(server) {
      if (!server.httpServer) return;
      const online = await attachOnlineServer(server.httpServer);
      mountHealth(server, online);
      server.httpServer.once("close", () => online.close());
    },
    async configurePreviewServer(server) {
      if (!server.httpServer) return;
      const online = await attachOnlineServer(server.httpServer);
      mountHealth(server, online);
      server.httpServer.once("close", () => online.close());
    },
  };
}

export default defineConfig({
  plugins: [aliasFallbackMapPlugin(), onlineWebSocketPlugin()],
  resolve: {
    alias: [
      {
        find: /^.*\/geography\/map\.js$/,
        replacement: areaModelPath,
      },
    ],
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
    watch: { ignored: ["**/tool/**", "**/dist/**"] },
  },
});
