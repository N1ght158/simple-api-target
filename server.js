import express from "express";
import cors from "cors";
import session from "express-session";
import crypto from "node:crypto";

const app = express();
const port = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";

function ensureCsrfToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(16).toString("hex");
  }
  return req.session.csrfToken;
}

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  session({
    secret: "local-demo-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 30,
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
    },
  })
);

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "not logged in" });
  }
  next();
}

function requireCsrf(req, res, next) {
  const sessionToken = ensureCsrfToken(req);
  const requestToken = req.get("x-csrf-token");
  if (!requestToken || requestToken !== sessionToken) {
    return res.status(403).json({ error: "invalid csrf token" });
  }
  next();
}

app.get("/api/session", (req, res) => {
  const csrfToken = ensureCsrfToken(req);
  req.session.user = { id: "u-1", email: "demo@example.com" };
  res.json({ user: req.session.user, csrfToken });
});

app.post("/api/account/email", requireLogin, requireCsrf, (req, res) => {
  const nextEmail = String(req.body.email || "").trim();
  if (!nextEmail) {
    return res.status(400).json({ error: "email is required" });
  }

  req.session.user.email = nextEmail;
  res.json({ email: nextEmail });
});

app.listen(port, () => {
  console.log(`Simple API target listening on http://localhost:${port}`);
});
