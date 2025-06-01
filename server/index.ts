import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { Server } from "http";

// Global reference to the HTTP server
let httpServer: Server | null = null;

// Global error handlers for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  // Keep the process alive but log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  // Keep the process alive but log the error
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log('Starting server initialization...');
    const server = await registerRoutes(app);
    // Store global reference to the server
    httpServer = server;
    console.log('Routes registered successfully');

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    console.log('Setting up Vite for development...');
    await setupVite(app, server);
    console.log('Vite setup complete');
  } else {
    console.log('Setting up static file serving for production...');
    serveStatic(app);
    console.log('Static file serving setup complete');
  }

  // Try to use port 3000 first (common development port)
  // If port 3000 is in use, try alternative ports
  const tryPort = (port: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log(`Attempting to start server on port ${port}...`);
      const serverInstance = server.listen(port)
        .on('listening', () => {
          log(`serving on port ${port}`);
          console.log(`Server successfully started and listening on port ${port}`);
          resolve();
        })
        .on('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            log(`Port ${port} is already in use, trying next port...`);
            serverInstance.close();
            // Try next port
            tryPort(port + 1)
              .then(resolve)
              .catch(reject);
          } else {
            reject(err);
          }
        });
    });
  };

  // Start with port 3000
  // Add general error handler to the server instance
  server.on('error', (error) => {
    console.error('SERVER ERROR:', error);
  });

  // Start with port 3000
  tryPort(3000).catch(err => {
    console.error(`Failed to start server: ${err.message}`, err);
    log(`Failed to start server: ${err.message}`);
    process.exit(1);
  });
  } catch (error) {
    console.error('FATAL ERROR during server initialization:', error);
    process.exit(1);
  }
  
  // Add signal handlers for graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal. Starting graceful shutdown...');
    if (httpServer) {
      httpServer.close(() => {
        console.log('Server closed gracefully');
        process.exit(0);
      });
    }
  });

  process.on('SIGINT', () => {
    console.log('Received SIGINT signal. Starting graceful shutdown...');
    if (httpServer) {
      httpServer.close(() => {
        console.log('Server closed gracefully');
        process.exit(0);
      });
    }
  });

  // Keep the process alive
  process.stdin.resume();
})();
