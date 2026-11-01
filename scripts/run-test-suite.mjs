import { spawn } from "child_process";
import http from "http";

function waitForServer(port = 3000, timeout = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(`http://localhost:${port}/`, (res) => {
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - start > timeout) {
          reject(new Error("Timeout waiting for Next.js server"));
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
}

async function main() {
  console.log("Starting Next.js production server for verification on port 3000...");
  const server = spawn("node", ["./node_modules/next/dist/bin/next", "start", "-p", "3000"], {
    stdio: "inherit",
    shell: true,
  });

  try {
    await waitForServer(3000, 30000);
    console.log("Server ready! Running test suite...\n");

    const { default: runVerification } = await import("./verify-all.mjs");
  } catch (err) {
    console.error("Error during test run:", err);
  } finally {
    console.log("\nStopping Next.js server...");
    server.kill("SIGINT");
    setTimeout(() => {
      try {
        process.kill(server.pid);
      } catch (e) {}
      process.exit(0);
    }, 1000);
  }
}

main();

