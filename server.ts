import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "./backend/db.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;
  const JWT_SECRET = process.env.JWT_SECRET || "queue-master-secret-2024";

  app.use(express.json());
  app.use(cors());

  // Socket.io Connection
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    
    socket.on("join-room", (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // API Routes
  
  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
    
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });

  // Token Generation
  app.post("/api/tokens/generate", (req, res) => {
    try {
      const { location } = req.body;
      const lastToken = db.prepare("SELECT token_number FROM tokens ORDER BY id DESC LIMIT 1").get() as any;
      let nextNumber = 1;

      if (lastToken && lastToken.token_number) {
        const match = lastToken.token_number.match(/\d+/);
        if (match) {
          const num = parseInt(match[0]);
          if (!isNaN(num)) {
            nextNumber = num + 1;
          }
        }
      }
      
      const tokenNumber = `A${String(nextNumber).padStart(3, '0')}`;
      const result = db.prepare("INSERT INTO tokens (token_number, location) VALUES (?, ?)").run(tokenNumber, location || "Unknown Device");
      
      const newToken = db.prepare("SELECT * FROM tokens WHERE id = ?").get(result.lastInsertRowid);
      
      io.emit("queue-updated");
      res.json(newToken);
    } catch (err) {
      console.error("Token generation error:", err);
      res.status(500).json({ error: "System encountered an error generating your token. Please refresh." });
    }
  });

  app.get("/api/tokens/:id", (req, res) => {
    try {
      const token = db.prepare("SELECT * FROM tokens WHERE id = ?").get(req.params.id);
      if (!token) return res.status(404).json({ error: "Token not found" });
      res.json(token);
    } catch (err) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Get Queue Stats
  app.get("/api/queue/stats", (req, res) => {
    const waiting = db.prepare("SELECT COUNT(*) as count FROM tokens WHERE status = 'waiting'").get() as any;
    const completed = db.prepare("SELECT COUNT(*) as count FROM tokens WHERE status = 'completed'").get() as any;
    const currentlyCalling = db.prepare(`
      SELECT t.*, c.name as counter_name 
      FROM tokens t 
      JOIN counters c ON t.counter_id = c.id 
      WHERE t.status = 'calling'
      ORDER BY t.called_at DESC
    `).all();

    // Get location breakdown
    const locations = db.prepare(`
      SELECT location, COUNT(*) as count 
      FROM tokens 
      WHERE location IS NOT NULL AND location != 'Unknown'
      GROUP BY location 
      ORDER BY count DESC 
      LIMIT 10
    `).all();
    
    res.json({
      waiting: waiting.count,
      completed: completed.count,
      currentlyCalling,
      locations
    });
  });

  // Counter Actions
  app.get("/api/counters", (req, res) => {
    const counters = db.prepare("SELECT * FROM counters").all();
    res.json(counters);
  });

  app.post("/api/counters/:id/call-next", (req, res) => {
    const counterId = req.params.id;
    
    // 1. Complete current token for this counter if any
    db.prepare("UPDATE tokens SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE counter_id = ? AND status = 'calling'").run(counterId);
    
    // 2. Get next waiting token
    const nextToken = db.prepare("SELECT * FROM tokens WHERE status = 'waiting' ORDER BY id ASC LIMIT 1").get() as any;
    
    if (!nextToken) {
      db.prepare("UPDATE counters SET status = 'open', current_token_id = NULL WHERE id = ?").run(counterId);
      io.emit("queue-updated");
      return res.json({ message: "No more tokens in queue" });
    }
    
    // 3. Update token and counter
    db.prepare("UPDATE tokens SET status = 'calling', called_at = CURRENT_TIMESTAMP, counter_id = ? WHERE id = ?").run(counterId, nextToken.id);
    db.prepare("UPDATE counters SET status = 'open', current_token_id = ? WHERE id = ?").run(nextToken.id, counterId);
    
    const tokenWithCounter = db.prepare(`
      SELECT t.*, c.name as counter_name 
      FROM tokens t 
      JOIN counters c ON t.counter_id = c.id 
      WHERE t.id = ?
    `).get(nextToken.id);

    io.emit("token-called", tokenWithCounter);
    io.emit("queue-updated");
    
    res.json(tokenWithCounter);
  });

  app.post("/api/counters/:id/status", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE counters SET status = ? WHERE id = ?").run(status, req.params.id);
    io.emit("queue-updated");
    res.json({ success: true });
  });

  // Admin: Clear Queue
  app.post("/api/admin/clear-queue", (req, res) => {
    db.prepare("DELETE FROM tokens").run();
    db.prepare("UPDATE counters SET current_token_id = NULL, status = 'closed'").run();
    io.emit("queue-updated");
    res.json({ success: true });
  });

  // API 404 Handler - MUST be before Vite/Static middleware
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.originalUrl}` });
  });

  // Error Handler for API
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith("/api")) {
      console.error("API error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    next(err);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
