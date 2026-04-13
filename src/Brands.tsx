import { useEffect, useState } from "react";

type Brand = {
  id: number;
  name: string;
};

type Model = {
  id: number;
  name: string;
};

function Brands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [valuation, setValuation] = useState<any>(null);
  const [showPrices, setShowPrices] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://argautos.com/api/v1/brands")
      .then(res => res.json())
      .then(data => setBrands(data.data))
      .catch(err => console.error(err));
  }, []);

  const getModels = async (brandId: number, brandName: string) => {
    try {
      const res = await fetch(
        `https://argautos.com/api/v1/brands/${brandId}/models`
      );
      const data = await res.json();
      setModels(data.data);
      setSelectedBrand(brandName);

    } catch (error) {
      console.error(error);
    }
  };

  const getVersions = async (modelId: number, modelName: string) => {
    try {
      const res = await fetch(
        `https://argautos.com/api/v1/models/${modelId}/versions`
      );
      const data = await res.json();
      setVersions(data.data);
      setSelectedModel(modelName);
    } catch (error) {
      console.error(error);
    }
  };

  const getValuation = async (versionId: number, currencyType = "USD") => {
    try {
      const res = await fetch(
        `https://argautos.com/api/v1/versions/${versionId}/valuations?currency=${currencyType}&format_price=true&relations=version,model,brand`
      );

      const data = await res.json();
      setValuation(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (selectedModel) {
    return (
      <div className="container">


        <button
          className="btn btn-secondary mb-3"
          onClick={() => {
            if (showPrices) {
              setShowPrices(false); // vuelve a versiones
              setValuation(null);
            } else {
              setSelectedModel(null); // vuelve a modelos
              setVersions([]);
            }
          }}
        >
          ← Volver
        </button>


        {showPrices && valuation?.data && (
          <div className="mt-4">
            <h4>
              Precios - {valuation?.meta?.brand?.name}{" "}
              {valuation?.meta?.model?.name}{" "}{valuation?.meta?.version}
            </h4>

            <div className="mb-3 d-flex gap-2">
              <button className={`btn ${currency === "USD" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => {
                  setCurrency("USD")
                  if (selectedVersionId) getValuation(selectedVersionId, "USD");
                }}
              >
                USD
              </button>

              <button className={`btn ${currency === "ARS" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => {
                  setCurrency("ARS")
                  if (selectedVersionId) getValuation(selectedVersionId, "ARS");
                }}
              >
                ARS
              </button>             
            </div>

            <div className="row">
              {valuation.data.map((item: any) => (
                <div key={item.id} className="col-6 col-md-3 mb-3">
                  <div className="card p-2 text-center">
                    <strong>{item.year}</strong>
                    <p>{item.price_formatted}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {!showPrices && (
          <>
            <h2>Versiones de {selectedModel}</h2>

            <div className="row">
              {versions.map((v: any) => (
                <div key={v.id} className="col-6 col-md-3 mb-3">
                  <div
                    className="card p-2 text-center"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSelectedVersionId(v.id);
                      getValuation(v.id, currency);
                      setShowPrices(true);
                    }}
                  >
                    {v.name}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (selectedBrand) {

    return (
      <div className="container">
        <button
          className="btn btn-secondary mb-3"
          onClick={() => {
            setSelectedBrand(null);
            setModels([]);
          }}
        >
          ← Volver
        </button>

        <h2>Modelos de {selectedBrand}</h2>

        <div className="row">
          {models.map((model) => (

            <div key={model.id} className="col-6 col-md-3 mb-3">
              <div className="card p-2 text-center"
                style={{ cursor: "pointer" }}
                onClick={() => getVersions(model.id, model.name)}
              >
                <img
                  src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&h=300&fit=crop"
                  alt={model.name}
                  className="img-fluid mb-2"
                />
                {model.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="container">
      <h2 className="mb-4">Marcas</h2>

      <div className="row">
        {brands.map((brand) => (
          <div key={brand.id} className="col-6 col-md-4 col-lg-3 mb-3">
            <div
              className="card p-2 text-center"
              style={{ cursor: "pointer" }}
              onClick={() => getModels(brand.id, brand.name)}
            >
              <img
                src={`/Marcas/${brand.name}.png`}
                alt={brand.name}
                className="img-fluid"
                style={{ maxHeight: "100px" }}
              />
              {brand.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Brands;