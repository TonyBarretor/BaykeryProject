export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="container py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-serif text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
            Baykery
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Panadería artesanal en Lima, Perú. Productos frescos horneados con amor.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/productos"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Ver Productos
            </a>
            <a
              href="/nosotros"
              className="text-sm font-semibold leading-6 text-foreground hover:text-primary"
            >
              Sobre Nosotros <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-24">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="mt-2 text-sm text-muted-foreground">Artesanal</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">Frescos</div>
              <div className="mt-2 text-sm text-muted-foreground">Cada Fin de Semana</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">Lima</div>
              <div className="mt-2 text-sm text-muted-foreground">Entrega Local</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
