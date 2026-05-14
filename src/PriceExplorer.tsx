import { useState, useEffect, useRef } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { Form, Spinner } from "react-bootstrap";

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
      .then(setFuentes);
  }, []);

   const getFuente = (marca: string, modelo: string) =>
    fuentes.find(f => f.marca === marca && f.modelo === modelo);


  // 🔹 fetch
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

      // 👇 si no hay más resultados
      if (newCars.length === 0) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // 🔹 cuando cambia el filtro
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchCars(true);
  }, [range]);

  // 🔹 cuando cambia la página
  useEffect(() => {
    if (page === 1) return;
    fetchCars();
  }, [page]);

  // 🔹 observer (scroll infinito)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (first.isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    const current = loaderRef.current;

    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore, loading]);

  // 🔹 inputs
  const handleMinChange = (value: number) => {
    if (value <= range[1]) {
      setRange([value, range[1]]);
    }
  };

  const handleMaxChange = (value: number) => {
    if (value >= range[0]) {
      setRange([range[0], value]);
    }
  };

  return (
    <div className="container mt-4">
      <h4>Filtrar por precio (USD)</h4>

      {/* INPUTS */}
      <div className="d-flex gap-2 mb-3">
        <Form.Control
          type="number"
          value={range[0]}
          onChange={(e) => handleMinChange(Number(e.target.value))}
        />
        <Form.Control
          type="number"
          value={range[1]}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
        />
      </div>

      {/* SLIDER */}
      <Slider
        range
        min={0}
        max={100000}
        step={1000}
        value={range}
        onChange={(value) => setRange(value as number[])}
      />

      <p>
        USD {range[0]} - USD {range[1]}
      </p>

      {/* RESULTADOS */}
      <div className="row mt-4">
        {cars.map((car, i) => (
          <div className="col-md-4" key={i}>

            <div className="card p-2 mb-3">
              <img
                src={`/Modelos/${car.brand}/${car.model}/${car.model}_1.jpg`}
                alt={car.name}
                className="img-fluid mb-2"
                style={{ marginLeft: "25%", width: "50%", height: "100%", objectFit: "cover" }}
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
              {(() => {
                    const f = getFuente(car.brand, car.model);
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
              <h6>
                {car.brand} {car.model}
              </h6>
              <p>
                {car.version}
                <br />
                Año: {car.price_year}
                <br />
                USD {car.price}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* LOADER invisible */}
      <div ref={loaderRef} style={{ height: "50px" }} />

      {/* SPINNER */}
      {loading && (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      )}

      {!hasMore && <p className="text-center">No hay más resultados</p>}
    </div>
  );
}

export default PriceExplorer;