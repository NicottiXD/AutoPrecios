import { useState, useEffect, useRef } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

function PriceExplorer() {
  const [range, setRange] = useState([10000, 50000]);
  const [cars, setCars] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const [fuentes, setFuentes] = useState<any[]>([]);

  useEffect(() => {
    fetch("/fuentes.json")
      .then(r => r.json())
      .then(setFuentes)
      .catch(() => setFuentes([]));
  }, []);

  const getFuente = (marca: string, modelo: string) =>
    fuentes.find(f => f.marca === marca && f.modelo === modelo);

  const fetchCars = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://argautos.com/api/v1/price-explorer?page=${page}&min_price=${range[0]}&max_price=${range[1]}`
      );
      const data = await res.json();
      const newCars = data.data || [];
      if (reset) {
        setCars(newCars);
      } else {
        setCars((prev) => [...prev, ...newCars]);
      }
      if (newCars.length === 0) setHasMore(false);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchCars(true);
  }, [range]);

  useEffect(() => {
    if (page === 1) return;
    fetchCars();
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );
    const current = loaderRef.current;
    if (current) observer.observe(current);
    return () => { if (current) observer.unobserve(current); };
  }, [hasMore, loading]);

  const handleMinChange = (value: number) => {
    if (value <= range[1]) setRange([value, range[1]]);
  };

  const handleMaxChange = (value: number) => {
    if (value >= range[0]) setRange([range[0], value]);
  };

  return (
    <div className="container ap-page">
      {/* Filter panel */}
      <div className="ap-filter-panel">
        <p className="ap-filter-eyebrow">Filtrar por precio (USD)</p>

        <div className="ap-range-inputs">
          <input
            type="number"
            value={range[0]}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            className="ap-range-input form-control"
            placeholder="Mínimo"
          />
          <span className="ap-range-sep">—</span>
          <input
            type="number"
            value={range[1]}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            className="ap-range-input form-control"
            placeholder="Máximo"
          />
        </div>

        <Slider
          range
          min={0}
          max={100000}
          step={1000}
          value={range}
          onChange={(value) => setRange(value as number[])}
        />

        <p className="ap-range-label">
          US$ {range[0].toLocaleString("es-AR")} — US$ {range[1].toLocaleString("es-AR")}
        </p>
      </div>

      {/* Results */}
      <div className="row g-3">
        {cars.map((car, i) => {
          const f = getFuente(car.brand, car.model);
          return (
            <div className="col-md-4 col-sm-6" key={i}>
              <div className="ap-explorer-card">
                <img
                  src={`/Modelos/${car.brand}/${car.model}/${car.model}_1.jpg`}
                  alt={car.name}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    const base = `/Modelos/${car.brand}/${car.model}/${car.model}_1`;
                    if (img.src.endsWith(".jpg")) {
                      img.src = base + ".png";
                    } else if (img.src.endsWith(".png")) {
                      img.src = base + ".webp";
                    } else {
                      img.src = "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&h=300&fit=crop";
                    }
                  }}
                />
                {f && (
                  <div className="ap-photo-credit" style={{ padding: "0.3rem 1rem 0" }}>
                    Foto:{" "}
                    <a href={f.url_fuente} target="_blank" rel="noopener noreferrer">
                      {new URL(f.url_fuente).hostname}
                    </a>
                  </div>
                )}
                <div className="ap-explorer-body">
                  <div className="ap-car-name">{car.brand} {car.model}</div>
                  <div className="ap-car-version">{car.version}</div>
                  <div className="ap-car-meta">
                    <span className="ap-car-year">Año {car.price_year}</span>
                    <span className="ap-car-price">US$ {Number(car.price).toLocaleString("es-AR")}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={loaderRef} style={{ height: "50px" }} />

      {loading && (
        <div className="ap-spinner-wrap" style={{ minHeight: "80px" }}>
          <div className="ap-spinner" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      {!hasMore && cars.length > 0 && (
        <p className="text-center ap-empty mt-2">No hay más resultados</p>
      )}

      {!hasMore && cars.length === 0 && (
        <p className="text-center ap-empty mt-4">
          No se encontraron autos en ese rango de precio.
        </p>
      )}
    </div>
  );
}

export default PriceExplorer;
