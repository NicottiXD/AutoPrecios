import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const apiCache = new Map<string, any>();

async function cachedFetch(url: string, { retries = 2, retryDelayMs = 1500 } = {}) {
  if (apiCache.has(url)) return apiCache.get(url);

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, retryDelayMs * (attempt + 1)));
        continue;
      }
      throw new Error("429");
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    apiCache.set(url, data);
    return data;
  }
  throw new Error("429");
}

type Brand = { id: number; name: string };
type Model = { id: number; name: string };

function Brands() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedBrand = searchParams.get("brand");
  const selectedBrandId = searchParams.get("brandId");
  const selectedModel = searchParams.get("model");
  const selectedModelId = searchParams.get("modelId");
  const selectedVersionId = searchParams.get("versionId") ? Number(searchParams.get("versionId")) : null;
  const showPrices = selectedVersionId !== null;

  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [valuation, setValuation] = useState<any>(null);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [dolarData, setDolarData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [brandsError, setBrandsError] = useState<string | null>(null);
  const [valuationError, setValuationError] = useState<string | null>(null);
  const valuationRef = useRef<HTMLDivElement>(null);

  const [fuentes, setFuentes] = useState<any[]>([]);

  useEffect(() => {
    fetch("/fuentes.json")
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => setFuentes(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error(err);
        setFuentes([]);
      });
  }, []);

  const getFuente = (marca: string, modelo: string) =>
    fuentes.find(f => f.marca === marca && f.modelo === modelo);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (currency === "ARS" && showPrices) {
      fetch("https://api.bluelytics.com.ar/v2/latest")
        .then(res => res.json())
        .then(data => setDolarData(data))
        .catch(err => console.error(err));
    }
  }, [currency, showPrices]);

  useEffect(() => {
    setSearchQuery("");
    cachedFetch("https://argautos.com/api/v1/brands")
      .then(data => {
        setBrands(Array.isArray(data?.data) ? data.data : []);
        setBrandsError(null);
      })
      .catch(err => {
        console.error(err);
        setBrands([]);
        setBrandsError(
          err.message?.includes("429")
            ? "El servidor está limitando las solicitudes (429). Probá de nuevo en un momento."
            : "No se pudieron cargar las marcas. Intentá nuevamente."
        );
      });
  }, []);

  useEffect(() => {
    if (selectedBrandId) {
      setLoading(true);
      setSearchQuery("");
      cachedFetch(`https://argautos.com/api/v1/brands/${selectedBrandId}/models`)
        .then(data => setModels(Array.isArray(data?.data) ? data.data : []))
        .catch(err => {
          console.error(err);
          setModels([]);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedBrandId]);

  useEffect(() => {
    if (selectedModelId) {
      setLoading(true);
      cachedFetch(`https://argautos.com/api/v1/models/${selectedModelId}/versions`)
        .then(data => setVersions(Array.isArray(data?.data) ? data.data : []))
        .catch(err => {
          console.error(err);
          setVersions([]);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedModelId]);

  useEffect(() => {
    if (selectedVersionId) {
      setLoading(true);
      cachedFetch(`https://argautos.com/api/v1/versions/${selectedVersionId}/valuations`)
        .then(data => {
          setValuation(data);
          setValuationError(null);
        })
        .catch(err => {
          console.error(err);
          setValuation(null);
          setValuationError(
            err.message?.includes("429")
              ? "El servidor está limitando las solicitudes (429). Esperá unos segundos y volvé a clickear la versión."
              : "No se pudieron cargar los precios para esta versión."
          );
        })
        .finally(() => setLoading(false));
    }
  }, [selectedVersionId]); // currency se excluye: la conversión es client-side, no necesita re-fetch

  useEffect(() => {
    if (valuation?.data && valuationRef.current) {
      valuationRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [valuation]);

  if (loading) {
    return (
      <div className="ap-spinner-wrap">
        <div className="ap-spinner" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  /* ── Versions page ── */
  if (selectedModel) {
    return (
      <div className="container ap-page">
        {/* Breadcrumb */}
        <p className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
          <span
            style={{ cursor: "pointer", color: "var(--ap-accent)" }}
            onClick={() => navigate("/")}
          >
            Marcas
          </span>
          {" › "}
          <span
            style={{ cursor: "pointer", color: "var(--ap-accent)" }}
            onClick={() => navigate(`?brand=${selectedBrand}&brandId=${selectedBrandId}`)}
          >
            {selectedBrand}
          </span>
          {" › "}
          {selectedModel}
        </p>

        <h2 className="ap-section-title">
          {selectedBrand} {selectedModel}
        </h2>

        <img
          src={`/Modelos/${selectedBrand}/${selectedModel}/${selectedModel}_1.jpg`}
          alt={selectedModel}
          className="ap-model-hero"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            const base = `/Modelos/${selectedBrand}/${selectedModel}/${selectedModel}_1`;
            if (img.src.endsWith(".jpg")) {
              img.src = base + ".png";
            } else if (img.src.endsWith(".png")) {
              img.src = base + ".webp";
            } else {
              img.src = "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&h=300&fit=crop";
            }
          }}
        />

        <p className="ap-empty mb-3" style={{ fontSize: "0.8rem" }}>
          Seleccioná una versión para ver los precios
        </p>

        <div className="row g-2">
          {versions.map((v: any) => (
            <div key={v.id} className="col-6 col-md-3">
              <div
                className={`ap-version-btn${selectedVersionId === v.id ? " ap-version-active" : ""}`}
                onClick={() =>
                  navigate(
                    `?brand=${selectedBrand}&brandId=${selectedBrandId}&model=${selectedModel}&modelId=${selectedModelId}&versionId=${v.id}`
                  )
                }
              >
                {v.name}
              </div>
            </div>
          ))}
        </div>

        {showPrices && valuationError && (
          <div className="alert alert-warning mt-4">{valuationError}</div>
        )}

        {showPrices && valuation?.data && (
          <div ref={valuationRef}>
            <h4 className="ap-prices-title">
              Precios — {versions.find((v: any) => v.id === selectedVersionId)?.name}
            </h4>

            <div className="row g-2 mt-1">
              {valuation.data.map((item: any) => {
                const rawPrice = Number(item.price);
                const displayPrice =
                  currency === "ARS" && dolarData
                    ? rawPrice * dolarData.blue.value_avg
                    : rawPrice;
                return (
                  <div key={item.id} className="col-6 col-md-3">
                    <div className="ap-price-card">
                      <span className="ap-price-year">
                        {item.year === 0 ? "0km" : item.year}
                      </span>
                      <p className="ap-price-value">
                        {currency === "ARS" ? "$" : "US$"}{" "}
                        {displayPrice.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="ap-currency-row">
              <button
                className={`ap-currency-btn${currency === "USD" ? " ap-usd-active" : ""}`}
                onClick={() => setCurrency("USD")}
              >
                USD
              </button>
              <button
                className={`ap-currency-btn${currency === "ARS" ? " ap-ars-active" : ""}`}
                onClick={() => setCurrency("ARS")}
              >
                ARS
              </button>
            </div>

            {currency === "ARS" && dolarData && (
              <div className="ap-dolar-alert">
                <strong>Cotización del {new Date(dolarData.last_update).toLocaleDateString("es-AR")}:</strong>{" "}
                Oficial: ${dolarData.oficial.value_avg.toLocaleString("es-AR")} |{" "}
                Blue: ${dolarData.blue.value_avg.toLocaleString("es-AR")}
              </div>
            )}
            {currency === "ARS" && !dolarData && (
              <div className="ap-dolar-alert">Cargando cotización del dólar...</div>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ── Models page ── */
  if (selectedBrand) {
    return (
      <div className="container ap-page">
        <p className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
          <span
            style={{ cursor: "pointer", color: "var(--ap-accent)" }}
            onClick={() => navigate("/")}
          >
            Marcas
          </span>
          {" › "}
          {selectedBrand}
        </p>

        <h2 className="ap-section-title">Modelos de {selectedBrand}</h2>

        <input
          type="text"
          placeholder="Buscar modelo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ap-search mb-4"
        />

        <div className="row g-3">
          {filteredModels.length === 0 ? (
            <p className="ap-empty">No se encontraron modelos.</p>
          ) : (
            filteredModels.map((model) => {
              const f = getFuente(selectedBrand, model.name);
              return (
                <div key={model.id} className="col-6 col-md-3">
                  <div
                    className="ap-model-card"
                    onClick={() =>
                      navigate(`?brand=${selectedBrand}&brandId=${selectedBrandId}&model=${model.name}&modelId=${model.id}`)
                    }
                  >
                    <img
                      src={`/Modelos/${selectedBrand}/${model.name}/${model.name}_1.jpg`}
                      alt={model.name}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        const base = `/Modelos/${selectedBrand}/${model.name}/${model.name}_1`;
                        if (img.src.endsWith(".jpg")) {
                          img.src = base + ".png";
                        } else if (img.src.endsWith(".png")) {
                          img.src = base + ".webp";
                        } else {
                          img.src = "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&h=300&fit=crop";
                        }
                      }}
                    />
                    <div className="ap-model-label">{model.name}</div>
                    {f && (
                      <div className="ap-photo-credit">
                        Foto:{" "}
                        <a
                          href={f.url_fuente}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {new URL(f.url_fuente).hostname}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  /* ── Brands page ── */
  return (
    <div className="container ap-page">
      <input
        type="text"
        placeholder="Buscar marca..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="ap-search mb-4"
      />

      <div className="row g-3">
        {brandsError ? (
          <p className="text-danger">{brandsError}</p>
        ) : filteredBrands.length === 0 ? (
          <p className="ap-empty">No se encontraron marcas.</p>
        ) : (
          filteredBrands.map((brand) => (
            <div key={brand.id} className="col-6 col-md-4 col-lg-3">
              <div
                className="ap-brand-card"
                onClick={() => navigate(`?brand=${brand.name}&brandId=${brand.id}`)}
              >
                <div className="ap-brand-logo-wrap">
                  <img
                    src={`/Marcas/${brand.name}.png`}
                    alt={brand.name}
                    style={{ objectFit: "contain", height: "72px", maxWidth: "110px" }}
                  />
                </div>
                <span className="ap-brand-name">{brand.name}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Brands;