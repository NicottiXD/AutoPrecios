import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Routes, Route, NavLink } from 'react-router-dom'
import './index.css'
import Brands from './Brands';
import PriceExplorer from './PriceExplorer.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';


function App() {
  return (
    <BrowserRouter>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">AutoPrecios</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="me-auto ms-3">
              <Nav.Link as={NavLink} to="/" end>Marcas</Nav.Link>
              <Nav.Link as={NavLink} to="/explorador">Explorador por precio</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
        <div className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Brands />} />
            <Route path="/explorador" element={<PriceExplorer />} />
          </Routes>
        </div>
        <footer>
          <p>Todas las marcas y logotipos pertenecen a sus respectivos dueños. Este sitio es solo para fines demostrativos.</p>
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