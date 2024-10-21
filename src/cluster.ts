//cluster.ts
import cluster from "node:cluster";
import os from "node:os";
import { fork } from "node:child_process";
import http from "node:http";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
const numCPUs = os.cpus().length - 1;

if (cluster.isPrimary) {
  let nextWorker = 0;

  const loadBalancer = http.createServer((req, res) => {
    const workerPort = PORT + nextWorker;
    const options = {
      hostname: "localhost",
      port: workerPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxy = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxy.on("error", (err: NodeJS.ErrnoException) => {
      console.error(`Error while proxying to worker on port ${workerPort}:`);
      console.error(`Error code: ${err.code}`);
      console.error(`Error message: ${err.message}`);
      console.error(`Stack trace: ${err.stack}`);
      console.error(`Request method: ${req.method}`);
      console.error(`Request path: ${req.url}`);
      console.error(`Request headers: ${JSON.stringify(req.headers)}`);

      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Internal server error while proxying to worker",
          details: err.message,
        })
      );
    });

    req.pipe(proxy, { end: true });

    nextWorker = (nextWorker + 1) % numCPUs;
  });

  loadBalancer.listen(PORT, () => {
    console.log(`Load balancer is running on http://localhost:${PORT}`);
  });

  for (let i = 0; i < numCPUs; i++) {
    const workerPort = PORT + i + 1;
    console.log(`Starting worker on port ${workerPort}`);
    
    const worker = fork("node_modules/ts-node/dist/bin.js", ["src/index.ts"], {
      env: { PORT: workerPort.toString() }
    });

    worker.on("exit", (code) => {
      console.log(`Worker on port ${workerPort} exited with code ${code}`);
    });

    worker.on("error", (err) => {
      console.error(`Error when starting worker on port ${workerPort}:`, err);
    });
  }
} else {
  (async () => {
    await import("./index");
  })();
}
