import { Router, type IRouter } from "express";

type PostalCodeApiRecord = {
  codigo_postal: string;
  estado: string;
  municipio: string;
  ciudad?: string;
  asentamiento: string;
  tipo_asentamiento?: string;
};

const router: IRouter = Router();

const POSTAL_API_BASE_URL =
  process.env["POSTAL_API_BASE_URL"] || "http://127.0.0.1:3001/api/codigos-postales";

router.get("/postal-codes/:postalCode", async (req, res) => {
  const postalCode = req.params["postalCode"]?.trim();

  if (!postalCode || !/^\d{5}$/.test(postalCode)) {
    res.status(400).json({ error: "El codigo postal debe tener 5 digitos." });
    return;
  }

  try {
    const response = await fetch(`${POSTAL_API_BASE_URL}/${postalCode}`);

    if (!response.ok) {
      res.status(502).json({
        error: "La API local de codigos postales respondio con error.",
        details: { status: response.status, url: `${POSTAL_API_BASE_URL}/${postalCode}` },
      });
      return;
    }

    const records = (await response.json()) as PostalCodeApiRecord[];

    if (!Array.isArray(records) || records.length === 0) {
      res.status(404).json({ error: "No se encontro informacion para ese codigo postal." });
      return;
    }

    const firstRecord = records[0];
    const neighborhoods = Array.from(
      new Map(
        records.map((record) => [
          `${record.asentamiento}|${record.tipo_asentamiento || ""}`,
          {
            name: record.asentamiento,
            type: record.tipo_asentamiento || null,
          },
        ]),
      ).values(),
    );

    res.json({
      postalCode,
      state: firstRecord.estado,
      municipality: firstRecord.municipio,
      city: firstRecord.ciudad || null,
      neighborhoods,
      rawCount: records.length,
      source: POSTAL_API_BASE_URL,
    });
  } catch (error) {
    req.log.error({ error, postalCode }, "Postal code lookup failed");
    res.status(502).json({
      error: "No fue posible conectar con la API local de codigos postales.",
      details: { source: POSTAL_API_BASE_URL },
    });
  }
});

export default router;
