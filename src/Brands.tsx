import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Form from 'react-bootstrap/Form';


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

  // --- Historial ---
 /*const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any>(null);
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");
  const [historySource, setHistorySource] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);*/

  const [fuentes, setFuentes] = useState<any[]>([]);

  useEffect(() => {
    fetch("/fuentes.json")
      .then(r => r.json())
      .then(setFuentes);
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
    fetch("https://argautos.com/api/v1/brands")
      .then(res => res.json())
      .then(data => setBrands(data.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedBrandId) {
      setLoading(true);
      setSearchQuery("");
      fetch(`https://argautos.com/api/v1/brands/${selectedBrandId}/models`)
        .then(res => res.json())
        .then(data => setModels(data.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [selectedBrandId]);

  useEffect(() => {
    if (selectedModelId) {
      setLoading(true);
      fetch(`https://argautos.com/api/v1/models/${selectedModelId}/versions`)
        .then(res => res.json())
        .then(data => setVersions(data.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [selectedModelId]);

  useEffect(() => {
    if (selectedVersionId) {
     
      fetch(`https://argautos.com/api/v1/versions/${selectedVersionId}/valuations?currency=${currency}&format_price=true&relations=version,model,brand`)
        .then(res => res.json())
        .then(data => setValuation(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [selectedVersionId, currency]);

  // Fetch historial
  /*useEffect(() => {
    if (selectedVersionId && showHistory) {
      setHistoryLoading(true);
      const params = new URLSearchParams({
        history: "true",
        currency,
        format_price: "true",
        relations: "version,model,brand",
        ...(historyFrom && { from: historyFrom }),
        ...(historyTo && { to: historyTo }),
        ...(historySource && { source: historySource }),
      });
      fetch(`https://argautos.com/api/v1/versions/${selectedVersionId}/valuations?${params}`)
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(err => console.error(err))
        .finally(() => setHistoryLoading(false));
    }
  }, [selectedVersionId, showHistory, currency, historyFrom, historyTo, historySource]);*/

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Vista historial
  /*if (showPrices && showHistory) {
    return (
      <div className="container my-5">
        <div className="d-flex align-items-center gap-3 mb-4">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowHistory(false)}>
            ← Volver a precios
          </button>
          <h4 className="mb-0">
            Historial — {valuation?.meta?.brand?.name} {valuation?.meta?.model?.name} {valuation?.meta?.version}
          </h4>
        </div>

        }
        <div className="row g-2 mb-4">
          <div className="col-6 col-md-3">
            <label className="form-label small">Desde</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={historyFrom}
              onChange={e => setHistoryFrom(e.target.value)}
            />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label small">Hasta</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={historyTo}
              onChange={e => setHistoryTo(e.target.value)}
            />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label small">Fuente</label>
            <select
              className="form-select form-select-sm"
              value={historySource}
              onChange={e => setHistorySource(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="acara">ACARA</option>
              <option value="infoauto">Infoauto</option>
              <option value="cca">CCA</option>
            </select>
          </div>
        </div>

       }
        <div className="mb-3 d-flex gap-2">
          <button
            className={`btn btn-sm ${currency === "USD" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setCurrency("USD")}
          >
            USD
          </button>
          <button
            className={`btn btn-sm ${currency === "ARS" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setCurrency("ARS")}
          >
            ARS
          </button>
        </div>

        {historyLoading ? (
          <div className="d-flex justify-content-center my-4">
            <div className="spinner-border spinner-border-sm" role="status" />
          </div>
        ) : history?.data?.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-sm table-hover">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Año</th>
                  <th>Precio</th>
                  <th>Fuente</th>
                </tr>
              </thead>
              <tbody>
                {history.data.map((item: any, i: number) => (
                  <tr key={i}>
                    <td>{new Date(item.date).toLocaleDateString("es-AR")}</td>
                    <td>{item.year === 0 ? "0km" : item.year}</td>
                    <td>{item.price_formatted}</td>
                    <td><span className="badge bg-secondary">{item.source}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted">No hay datos para los filtros seleccionados.</p>
        )}

        {currency === "ARS" && dolarData && (
          <div className="alert alert-secondary mt-3 small">
            <strong>Cotización del {new Date(dolarData.last_update).toLocaleDateString("es-AR")}:</strong>{" "}
            Oficial: ${dolarData.oficial.value_avg.toLocaleString("es-AR")} |{" "}
            Blue: ${dolarData.blue.value_avg.toLocaleString("es-AR")}
          </div>
        )}
      </div>
    );
  }*/

  // Vista precios actuales
  

  if (selectedModel) {
  return (
    <div className="container my-5">
      <h2 className="my-5">Versiones de {selectedBrand+" "+selectedModel}</h2>
      <div className="row">
        {versions.map((v: any) => (
          <div key={v.id} className="col-6 col-md-3 mb-3">
            <div
              className={`btn ${selectedVersionId === v.id ? "btn-dark" : "btn-outline-dark"}`}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`?brand=${selectedBrand}&brandId=${selectedBrandId}&model=${selectedModel}&modelId=${selectedModelId}&versionId=${v.id}`)}
            >
              {v.name}
            </div>
          </div>
        ))}
      </div>

     
      {showPrices && valuation?.data && (
        <div>
          <h4 className="mt-5">
            Precios - {valuation?.meta?.brand?.name} {valuation?.meta?.model?.name} {valuation?.meta?.version}
          </h4>
          <div className="row mt-3">
            {valuation.data.map((item: any) => (
              <div key={item.id} className="col-6 col-md-3 mb-3">
                <div className="card p-2 text-center">
                  <strong>{item.year === 0 ? "0km" : item.year}</strong>
                  <p>{item.price_formatted}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="my-2 d-flex gap-2 flex-wrap">
            <button
              className={`btn ${currency === "USD" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setCurrency("USD")}
            >
              USD
            </button>
            <button
              className={`btn ${currency === "ARS" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setCurrency("ARS")}
            >
              ARS
            </button>
          </div>
          {currency === "ARS" && dolarData && (
            <div className="alert alert-secondary mt-3 small">
              <strong>Cotización del {new Date(dolarData.last_update).toLocaleDateString("es-AR")}:</strong>{" "}
              Oficial: ${dolarData.oficial.value_avg.toLocaleString("es-AR")} |{" "}
              Blue: ${dolarData.blue.value_avg.toLocaleString("es-AR")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

  if (selectedBrand) {
    return (
      <div className="container my-5">
        <Form.Control
          type="text"
          placeholder="Buscar modelo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
          style={{ maxWidth: "300px" }}
        />
        <h2 className="my-5">Modelos de {selectedBrand}</h2>
        <div className="row">
          {filteredModels.length === 0 ? (
            <p className="text-muted">No se encontraron modelos.</p>
          ) : (
            filteredModels.map((model) => (
              <div key={model.id} className="col-6 col-md-3 mb-3">
                <div
                  className="card p-2 text-center"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`?brand=${selectedBrand}&brandId=${selectedBrandId}&model=${model.name}&modelId=${model.id}`)}
                >
                  <img
                    src={`/Modelos/${selectedBrand}/${model.name}/${model.name}_1.jpg`}
                    alt={model.name}
                    className="img-fluid mb-2"
                    style={{ width: "100%", height: "200px", objectFit: "cover" }}
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
                  {model.name}
                  {(() => {
                    const f = getFuente(selectedBrand, model.name);
                    return f ? (
                      <div style={{ fontSize: "0.65rem", color: "#999", marginTop: "4px" }}>
                        Foto:{" "}
                        <a href={f.url_fuente} target="_blank" rel="noopener noreferrer"
                          style={{ color: "#999" }}
                          onClick={e => e.stopPropagation()}>
                          {new URL(f.url_fuente).hostname}
                        </a>
                      </div>
                    ) : null;
                  })()}

                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <Form.Control
        type="text"
        placeholder="Buscar marca..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
        style={{ maxWidth: "300px" }}
      />
      <div className="row">
        {filteredBrands.length === 0 ? (
          <p className="text-muted">No se encontraron marcas.</p>
        ) : (
          filteredBrands.map((brand) => (
            <div key={brand.id} className="col-6 col-md-4 col-lg-3 mb-3">
              <div
                className="card p-2 text-center"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`?brand=${brand.name}&brandId=${brand.id}`)}
              >
                <div className="card p-3 d-flex flex-column align-items-center">
                  <img
                    src={`/Marcas/${brand.name}.png`}
                    alt={brand.name}
                    className="img-fluid"
                    style={{ objectFit: "contain", height: "80px", maxWidth: "100px" }}
                  />
                </div>
                {brand.name}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Brands;