import express from "express";
import cors from "cors";
import session from "express-session";
import csurf from "csurf";

const app = express();
const port = process.env.PORT || 3001;
const csrfProtection = csurf({ cookie: false });

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
      secure: process.env.NODE_ENV === "production",
    },
  })
);

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "not logged in" });
  }
  next();
}

app.get("/api/session", (req, res) => {
  req.session.user = { id: "u-1", email: "demo@example.com" };
  res.json({ user: req.session.user });
});

app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.post("/api/account/email", requireLogin, csrfProtection, (req, res) => {
  const nextEmail = String(req.body.email || "").trim();
  if (!nextEmail) {
    return res.status(400).json({ error: "email is required" });
  }

  req.session.user.email = nextEmail;
  res.json({ email: nextEmail });
});

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ error: "invalid csrf token" });
  }
  next(err);
});

app.listen(port, () => {
  console.log(`Simple API target listening on http://localhost:${port}`);
});
