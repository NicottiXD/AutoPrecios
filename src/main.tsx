import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Routes, Route, NavLink } from 'react-router-dom'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './autoprecios.css';
import Brands from './Brands';
import PriceExplorer from './PriceExplorer.tsx';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Aboutme from './AboutMe.tsx';

function App() {
  return (
    <BrowserRouter>
      <Navbar expand="lg" className="ap-navbar">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Auto<span className="ap-brand-accent">Precios</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="me-auto ms-3">
              <Nav.Link as={NavLink} to="/" end>Marcas</Nav.Link>
              <Nav.Link as={NavLink} to="/explorador">Explorador por precio</Nav.Link>
              <Nav.Link as={NavLink} to="/AcercaDeMi">Acerca de mi</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
        <div className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Brands />} />
            <Route path="/explorador" element={<PriceExplorer />} />
            <Route path="/acercademi" element={<Aboutme />} />
          </Routes>
        </div>
        <footer className="ap-footer">
          <p className="mb-0">
            Todas las marcas y logotipos pertenecen a sus respectivos dueños. Este sitio es solo para fines demostrativos.
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
