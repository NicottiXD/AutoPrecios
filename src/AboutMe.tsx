
function aboutme() {
    return (
        <>
            <div className="container my-5">
                <div className="card shadow-sm border-0 p-4">
                    <h2 className="mb-3">Sobre mí</h2>

                    <p className="text-muted">
                        Hola, soy Nicolás, desarrollador frontend junior y estudiante
                        de Ingeniería en Sistemas en la UTN.
                        Esta aplicación fue desarrollada con React y consume una API
                        de precios de autos para consultar modelos y valores actualizados.
                    </p>

                    <div className="d-flex gap-3 mt-3 flex-wrap">
                        <a
                            href="https://github.com/NicottiXD"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-dark"
                        >
                            GitHub
                        </a>

                        <a
                            href="https://www.linkedin.com/in/nicolas-marchetti/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                        >
                            LinkedIn
                        </a>
                    </div>
                </div>
            </div>
        </>
    )
}

export default aboutme