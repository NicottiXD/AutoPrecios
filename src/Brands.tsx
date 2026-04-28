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
  const [searchQuery, setSearchQuery] = useState(""); // 👈 movido acá

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
    fetch("https://argautos.com/api/v1/brands")
      .then(res => res.json())
      .then(data => setBrands(data.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedBrandId) {
      setLoading(true);
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
      setLoading(true);
      fetch(`https://argautos.com/api/v1/versions/${selectedVersionId}/valuations?currency=${currency}&format_price=true&relations=version,model,brand`)
        .then(res => res.json())
        .then(data => setValuation(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [selectedVersionId, currency]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (showPrices && valuation?.data) {
    return (
      <div className="container my-5">
        <h4>
          Precios - {valuation?.meta?.brand?.name} {valuation?.meta?.model?.name} {valuation?.meta?.version}
        </h4>
        <div className="row mt-5">
          {valuation.data.map((item: any) => (
            <div key={item.id} className="col-6 col-md-3 mb-3">
              <div className="card p-2 text-center">
                <strong>{item.year}</strong>
                <p>{item.price_formatted}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="my-2 d-flex gap-2">
          <button
            className={`btn ${currency === "USD" ? "btn-primary" : "btn-outline-primary"}`}
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
    );
  }

  if (selectedModel) {
    return (
      <div className="container my-5">
        <h2 className="my-5">Versiones de {selectedModel}</h2>
        <div className="row">
          {versions.map((v: any) => (
            <div key={v.id} className="col-6 col-md-3 mb-3">
              <div
                className="card p-2 text-center"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`?brand=${selectedBrand}&brandId=${selectedBrandId}&model=${selectedModel}&modelId=${selectedModelId}&versionId=${v.id}`)}
              >
                {v.name}
              </div>
            </div>
          ))}
        </div>
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
        onChange={(e) => {setSearchQuery(e.target.value)}}
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
                    src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&h=300&fit=crop"
                    alt={model.name}
                    className="img-fluid mb-2"
                  />
                  {model.name}
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
        onChange={(e) => {setSearchQuery(e.target.value)}}
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
                onClick={() => {
                  navigate(`?brand=${brand.name}&brandId=${brand.id}`);
                  setSearchQuery(""); 
                }}
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