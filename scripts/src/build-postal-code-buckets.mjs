import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");
const outputDir = path.join(
  rootDir,
  "artifacts",
  "tropicolors",
  "public",
  "data",
  "postal-codes",
);

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function getFirstValue(row, keys) {
  for (const key of keys) {
    const value = normalizeText(row[key]);
    if (value) {
      return value;
    }
  }

  return "";
}

function addRowToMap(grouped, row) {
  const codigoPostal = getFirstValue(row, ["codigo_postal", "cp", "d_codigo"]);
  if (!codigoPostal) {
    return;
  }

  if (!grouped.has(codigoPostal)) {
    grouped.set(codigoPostal, {
      codigo_postal: codigoPostal,
      estado: getFirstValue(row, ["estado", "d_estado"]),
      municipio: getFirstValue(row, ["municipio", "D_mnpio"]),
      ciudad: getFirstValue(row, ["ciudad", "d_ciudad"]),
      colonias: [],
    });
  }

  const current = grouped.get(codigoPostal);
  const colonia = getFirstValue(row, ["colonia", "d_asenta"]);
  const tipo = getFirstValue(row, ["tipo_asentamiento", "d_tipo_asenta"]) || null;

  if (!colonia) {
    return;
  }

  const exists = current.colonias.some(
    (item) => item.nombre === colonia && item.tipo === tipo,
  );

  if (!exists) {
    current.colonias.push({
      nombre: colonia,
      tipo,
    });
  }
}

function readWorkbookRows(filename) {
  const workbook = XLSX.readFile(filename, { cellDates: false });
  const rows = [];

  for (const sheetName of workbook.SheetNames) {
    if (sheetName === "Nota") {
      continue;
    }

    const worksheet = workbook.Sheets[sheetName];
    const sheetRows = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
      raw: false,
    });

    console.log(`Leyendo hoja: ${sheetName} (${sheetRows.length} filas)`);

    for (const row of sheetRows) {
      rows.push(row);
    }
  }

  return rows;
}

async function run() {
  const cliArgs = process.argv.slice(2).filter((arg) => arg !== "--");
  const inputArg = cliArgs[0];

  if (!inputArg) {
    throw new Error("Debes indicar la ruta del archivo .xls, .xlsx, .csv o .json.");
  }

  const inputPath = path.resolve(process.cwd(), inputArg);

  if (!fs.existsSync(inputPath)) {
    throw new Error(`No se encontro el archivo de entrada: ${inputPath}`);
  }

  const rows = readWorkbookRows(inputPath);
  const grouped = new Map();

  for (const row of rows) {
    addRowToMap(grouped, row);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const buckets = new Map();

  for (const [codigoPostal, data] of grouped.entries()) {
    const prefix = codigoPostal.slice(0, 2);

    if (!buckets.has(prefix)) {
      buckets.set(prefix, {});
    }

    buckets.get(prefix)[codigoPostal] = data;
  }

  for (const [prefix, bucketData] of buckets.entries()) {
    const bucketPath = path.join(outputDir, `${prefix}.json`);
    fs.writeFileSync(bucketPath, JSON.stringify(bucketData));
    console.log(`Bucket ${prefix}.json generado`);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    totalPostalCodes: grouped.size,
    totalBuckets: buckets.size,
    buckets: Array.from(buckets.keys()).sort(),
  };

  fs.writeFileSync(
    path.join(outputDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  console.log(`Catalogo local generado en ${outputDir}`);
  console.log(`Codigos postales totales: ${grouped.size}`);
  console.log(`Buckets generados: ${buckets.size}`);
}

run().catch((error) => {
  console.error("Error al generar buckets locales de codigos postales:", error);
  process.exitCode = 1;
});
