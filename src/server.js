require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const HOST = process.env.BIND_HOST || "127.0.0.1";
// console.log("DB_HOST =", process.env.DB_HOST);
// console.log("DB_USER =", process.env.DB_USER);
// console.log("DB_NAME =", process.env.DB_NAME);
// console.log("API_KEY =", process.env.API_KEY ? "(set)" : "(missing)");


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Földrengések API",
      version: "1.0.0",
      description: "Vizsgafeladat – Node.js + MariaDB + API key",
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
        },
      },
    },
  },
  apis: ["./src/server.js"],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


function requireApiKey(req, res, next) {
  const key = req.header("X-API-Key");
  if (!key || key !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized (missing/invalid API key)" });
  }
  next();
}

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "up" });
  } catch (e) {
    res.status(500).json({ ok: false, db: "down", error: e.message });
  }
});


/**
 * @openapi
 * /telepulesek:
 *   get:
 *     summary: Települések listázása
 *     description: Visszaadja a településeket (id, nev, varmegye) név szerint rendezve.
 *     responses:
 *       200:
 *         description: Települések listája
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nev:
 *                     type: string
 *                   varmegye:
 *                     type: string
 */

app.get("/telepulesek", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nev, varmegye FROM telepules ORDER BY nev"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


/**
 * @openapi
 * /telepulesek:
 *   post:
 *     summary: Új település létrehozása
 *     description: Új települést vesz fel (API key szükséges).
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nev
 *               - varmegye
 *             properties:
 *               nev:
 *                 type: string
 *               varmegye:
 *                 type: string
 *     responses:
 *       201:
 *         description: Létrehozott település
 *       400:
 *         description: Hibás bemenet
 *       401:
 *         description: Nincs vagy hibás API key
 */

app.post("/telepulesek", requireApiKey, async (req, res) => {
  try {
    const { nev, varmegye } = req.body;
    if (!nev || !varmegye) {
      return res.status(400).json({ error: "nev és varmegye kötelező" });
    }

    const [result] = await pool.query(
      "INSERT INTO telepules (nev, varmegye) VALUES (?, ?)",
      [nev, varmegye]
    );

    res.status(201).json({ id: result.insertId, nev, varmegye });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


/**
 * @openapi
 * /telepulesek/{id}:
 *   put:
 *     summary: Település módosítása
 *     description: Meglévő települést módosít (API key szükséges).
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: A település azonosítója
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nev
 *               - varmegye
 *             properties:
 *               nev:
 *                 type: string
 *               varmegye:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sikeres módosítás
 *       400:
 *         description: Hibás id vagy hibás bemenet
 *       401:
 *         description: Nincs vagy hibás API key
 *       404:
 *         description: Nincs ilyen település
 */
app.put("/telepulesek/:id", requireApiKey, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nev, varmegye } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "hibás id" });
    }
    if (!nev || !varmegye) {
      return res.status(400).json({ error: "nev és varmegye kötelező" });
    }

    const [result] = await pool.query(
      "UPDATE telepules SET nev = ?, varmegye = ? WHERE id = ?",
      [nev, varmegye, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "nincs ilyen telepules" });
    }

    res.json({ ok: true, id, nev, varmegye });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /telepulesek/{id}:
 *   delete:
 *     summary: Település törlése
 *     description: Település törlése azonosító alapján (API key szükséges).
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: A település azonosítója
 *     responses:
 *       200:
 *         description: Sikeres törlés
 *       400:
 *         description: Hibás id
 *       401:
 *         description: Nincs vagy hibás API key
 *       404:
 *         description: Nincs ilyen település
 */
app.delete("/telepulesek/:id", requireApiKey, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "hibás id" });
    }

    const [result] = await pool.query("DELETE FROM telepules WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "nincs ilyen telepules" });
    }

    res.json({ ok: true, id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


/**
 * @openapi
 * /telepulesek/somogy:
 *   get:
 *     summary: Somogy vármegye települései név szerint
 *     description: Ábécérendben visszaadja a Somogy vármegyében szereplő települések nevét (csak név).
 *     responses:
 *       200:
 *         description: Településnevek listája
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
app.get("/telepulesek/somogy", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT nev FROM telepules WHERE varmegye = ? ORDER BY nev",
      ["Somogy"]
    );
    res.json(rows.map(r => r.nev));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


/**
 * @openapi
 * /statisztika/varmegye:
 *   get:
 *     summary: Földrengések száma vármegyénként
 *     description: Megadja, hogy az egyes vármegyékhez hány feljegyzett földrengés tartozik, darabszám szerint csökkenő sorrendben.
 *     responses:
 *       200:
 *         description: Vármegyénkénti földrengésszám
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   varmegye:
 *                     type: string
 *                   db:
 *                     type: integer
 */
app.get("/statisztika/varmegye", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.varmegye, COUNT(n.id) AS db
       FROM naplo n
       JOIN telepules t ON t.id = n.telepid
       GROUP BY t.varmegye
       ORDER BY db DESC, t.varmegye ASC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /naplo/maxmagnitudo:
 *   get:
 *     summary: Legnagyobb magnitúdójú földrengés
 *     description: Kiírja a legnagyobb magnitúdójú földrengés településének nevét, dátumát, időpontját és magnitúdóját. Ha több ilyen van, mindet megjeleníti.
 *     responses:
 *       200:
 *         description: Legnagyobb magnitúdójú földrengés(ek)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nev:
 *                     type: string
 *                   datum:
 *                     type: string
 *                     format: date
 *                   ido:
 *                     type: string
 *                   magnitudo:
 *                     type: string
 */
app.get("/naplo/maxmagnitudo", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.nev, n.datum, n.ido, n.magnitudo
       FROM naplo n
       JOIN telepules t ON t.id = n.telepid
       WHERE n.magnitudo = (SELECT MAX(magnitudo) FROM naplo)
       ORDER BY n.datum DESC, n.ido DESC`
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "nincs naplo adat" });
    }

    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.post("/admin/ping", requireApiKey, (req, res) => {
  res.json({ ok: true, message: "API key accepted" });
});


app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});