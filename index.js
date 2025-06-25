
const express = require("express");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require("cors");
const path = require("path");

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const apikey = "ptlc_tTtb3KgixTyHdnUH7Ep9hhV6hg9i9H0vjkcw4xjcs2h";
const capikey = "ptla_EERL051rZFfpVmtkqyfMIz7b8krQTkNOYKapBtGOe29";
const domain = "https://izanhost.storedigital.web.id";
const nestid = "5";
const egg = "15";
const loc = "1";

app.post("/create", async (req, res) => {
  const { username, email, ram } = req.body;
  const password = username + Math.floor(Math.random() * 10000);
  const name = username + "-server";

  try {
    // Buat user
    const userRes = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apikey}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        username,
        first_name: username,
        last_name: "User",
        password,
        language: "en",
      }),
    });

    const userData = await userRes.json();
    if (userData.errors) return res.json({ error: userData.errors[0] });

    const userId = userData.attributes.id;

    // Ambil startup
    const eggData = await fetch(`${domain}/api/application/nests/${nestid}/eggs/${egg}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apikey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const eggJson = await eggData.json();
    const startup = eggJson.attributes.startup;

    // Buat server
    const serverRes = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apikey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        user: userId,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
        startup,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: ram,
          swap: 0,
          disk: 1000,
          io: 500,
          cpu: 100,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 5,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });

    const serverData = await serverRes.json();
    if (serverData.errors) return res.json({ error: serverData.errors[0] });

    res.json({
      username,
      password,
      email,
      domain,
      panel_url: `${domain}`,
      server_id: serverData.attributes.id,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", detail: err.message });
  }
});

// Endpoint untuk GET request (info API)
app.get("/", (req, res) => {
  res.json({
    message: "Panel API is running",
    endpoints: {
      "POST /create": "Create new pterodactyl server",
      "GET /": "API information"
    },
    status: "online"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`Panel API ready at :${PORT}`));
