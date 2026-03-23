export type PostalCodeLookupResponse = {
  postalCode: string;
  state: string;
  municipality: string;
  city: string | null;
  neighborhoods: Array<{
    name: string;
    type: string | null;
  }>;
  rawCount: number;
  source: string;
};

type PostalCodeNeighborhood = {
  name: string;
  type: string | null;
};

type PostalCodeDocumentShape = {
  codigo_postal?: string;
  postalCode?: string;
  estado?: string;
  Estado?: string;
  state?: string;
  municipio?: string;
  Municipio?: string;
  municipality?: string;
  ciudad?: string | null;
  Ciudad?: string | null;
  city?: string | null;
  colonias?: Array<string | { nombre?: string; name?: string; tipo?: string | null; type?: string | null }>;
  neighborhoods?: Array<string | { nombre?: string; name?: string; tipo?: string | null; type?: string | null }>;
  asentamientos?: Array<string | { nombre?: string; name?: string; tipo?: string | null; type?: string | null }>;
  asentamiento?: string;
  tipo_asentamiento?: string | null;
};

const postalCodeBucketCache = new Map<string, Record<string, PostalCodeDocumentShape>>();
const basePath = import.meta.env.BASE_URL || "/";

function normalizeNeighborhoods(data: PostalCodeDocumentShape): PostalCodeNeighborhood[] {
  const rawNeighborhoods =
    data.colonias ?? data.neighborhoods ?? data.asentamientos ?? [];

  const normalized = rawNeighborhoods
    .map((value) => {
      if (typeof value === "string") {
        return { name: value, type: null };
      }

      return {
        name: value.nombre || value.name || "",
        type: value.tipo || value.type || null,
      };
    })
    .filter((value) => value.name);

  if (normalized.length > 0) {
    return normalized;
  }

  if (data.asentamiento) {
    return [{ name: data.asentamiento, type: data.tipo_asentamiento || null }];
  }

  return [];
}

function normalizePostalCodeDocument(postalCode: string, typedData: PostalCodeDocumentShape): PostalCodeLookupResponse {
  const neighborhoods = normalizeNeighborhoods(typedData);
  const state = (typedData.estado || typedData.Estado || typedData.state || "").trim();
  const municipality = (typedData.municipio || typedData.Municipio || typedData.municipality || "").trim();
  const city = (typedData.ciudad || typedData.Ciudad || typedData.city || "").trim() || null;

  if (!state || !municipality || neighborhoods.length === 0) {
    throw new Error(
      "El catalogo local del codigo postal no tiene el formato esperado.",
    );
  }

  return {
    postalCode: typedData.codigo_postal || typedData.postalCode || postalCode,
    state,
    municipality,
    city,
    neighborhoods,
    rawCount: neighborhoods.length,
    source: "local:postal-code-bucket",
  };
}

async function getPostalCodeBucket(prefix: string): Promise<Record<string, PostalCodeDocumentShape>> {
  if (postalCodeBucketCache.has(prefix)) {
    return postalCodeBucketCache.get(prefix)!;
  }

  const normalizedBasePath = basePath.endsWith("/") ? basePath : `${basePath}/`;
  const response = await fetch(`${normalizedBasePath}data/postal-codes/${prefix}.json`);

  if (!response.ok) {
    throw new Error("No fue posible cargar el catalogo local de codigos postales.");
  }

  const bucket = (await response.json()) as Record<string, PostalCodeDocumentShape>;
  postalCodeBucketCache.set(prefix, bucket);
  return bucket;
}

export async function fetchPostalCodeLookup(postalCode: string): Promise<PostalCodeLookupResponse> {
  const normalizedPostalCode = postalCode.trim();
  const prefix = normalizedPostalCode.slice(0, 2);
  const bucket = await getPostalCodeBucket(prefix);
  const data = bucket[normalizedPostalCode];

  if (!data) {
    throw new Error("No se encontro informacion para ese codigo postal.");
  }

  return normalizePostalCodeDocument(normalizedPostalCode, data);
}
