import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link } from 'react-router-dom'
import './index.css'
import Brands from './Brands';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <BrowserRouter>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">AutoPrecios</Navbar.Brand>
          <Form.Control
            type="text"
            placeholder="Buscar marca o modelo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: "300px" }}
          />
        </Container>
      </Navbar>

      <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
        <div className="flex-grow-1">
          <Brands searchQuery={searchQuery} onNavigate={() => setSearchQuery("")} />
        </div>
        <footer>
          <p>
            Todas las marcas y logotipos pertenecen a sus respectivos dueños.
            Este sitio es solo para fines demostrativos.
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)