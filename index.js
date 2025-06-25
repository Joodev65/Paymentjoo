
const express = require("express");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Environment variables with fallback values
const domain = process.env.DOMAIN || "https://izanhost.storedigital.web.id";
const apikey = process.env.API_KEY || "ptlc_tTtb3KgixTyHdnUH7Ep9hhV6hg9i9H0vjkcw4xjcs2h";
const capikey = process.env.CLIENT_KEY || "ptla_EERL051rZFfpVmtkqyfMIz7b8krQTkNOYKapBtGOe29";
const egg = process.env.EGG_ID || "15";
const nestid = process.env.NEST_ID || "5";
const loc = process.env.LOCATION_ID || "1";

app.get("/", (req, res) => {
  res.json({
    message: "Joocode Panel API is running",
    endpoints: {
      "POST /create": "Create new pterodactyl server"
    },
    status: "online"
  });
});

app.post("/create", async (req, res) => {
  const { username, email, size } = req.body;
  if (!username || !email || !size) return res.status(400).json({ error: "Data tidak lengkap" });

  const sizeMap = {
    "1gb": { ram: "1000", disk: "1000", cpu: "40" },
    "2gb": { ram: "2000", disk: "1000", cpu: "60" },
    "3gb": { ram: "3000", disk: "2000", cpu: "80" },
    "4gb": { ram: "4000", disk: "2000", cpu: "100" },
    "5gb": { ram: "5000", disk: "3000", cpu: "120" },
    "6gb": { ram: "6000", disk: "3000", cpu: "140" },
    "7gb": { ram: "7000", disk: "4000", cpu: "160" },
    "8gb": { ram: "8000", disk: "4000", cpu: "180" },
    "9gb": { ram: "9000", disk: "5000", cpu: "200" },
    "10gb": { ram: "10000", disk: "5000", cpu: "220" },
    "unlimited": { ram: "0", disk: "0", cpu: "0" }
  };

  const resource = sizeMap[size];
  if (!resource) return res.status(400).json({ error: "Ukuran tidak valid" });

  const password = username + Math.floor(Math.random() * 10000);
  const name = username + "-server";

  try {
    const userRes = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apikey}`,
        Accept: "application/json"
      },
      body: JSON.stringify({
        email,
        username,
        first_name: username,
        last_name: "User",
        password,
        language: "en"
      })
    });

    const userData = await userRes.json();
    if (userData.errors) return res.status(400).json({ error: userData.errors[0].detail });

    const userId = userData.attributes.id;

    const eggRes = await fetch(`${domain}/api/application/nests/${nestid}/eggs/${egg}`, {
      headers: {
        Authorization: `Bearer ${apikey}`,
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });

    const eggJson = await eggRes.json();
    const startup = eggJson.attributes.startup;

    const serverRes = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apikey}`,
        Accept: "application/json",
        "Content-Type": "application/json"
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
          CMD_RUN: "npm start"
        },
        limits: {
          memory: parseInt(resource.ram),
          swap: 0,
          disk: parseInt(resource.disk),
          io: 500,
          cpu: parseInt(resource.cpu)
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 5
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: []
        }
      })
    });

    const serverData = await serverRes.json();
    if (serverData.errors) return res.status(400).json({ error: serverData.errors[0].detail });

    res.json({
      username,
      password,
      email,
      panel_url: domain,
      server_id: serverData.attributes.id,
      ram: resource.ram + "MB",
      disk: resource.disk + "MB",
      cpu: resource.cpu + "%"
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", detail: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`Joocode Panel API aktif di port ${PORT}`));
