
export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5EBDD] text-[#704A37]">

      {/* ENCABEZADO */}
      <header className="flex items-center justify-between px-6 py-6 md:px-16">
        <a href="#" className="text-2xl font-bold tracking-tight">
          buen bocado<span className="text-[#C69B72]">.</span>
        </a>

        <span className="text-xs tracking-[0.2em] uppercase">
          Artisan bakery club
        </span>
      </header>

      {/* PORTADA */}
      <main>
        <section className="px-6 py-16 md:px-16 md:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">

            <div>
              <p className="mb-5 text-xs tracking-[0.3em] uppercase text-[#C69B72]">
                Bienvenido a
              </p>

              <h1 className="mb-6 text-5xl font-serif leading-tight md:text-7xl">
                Buen Bocado
                <br />
                <span className="italic">Club.</span>
              </h1>

              <p className="mb-5 text-lg">
                Los buenos momentos tienen recompensa.
              </p>

              <p className="mb-9 max-w-md text-sm leading-7 text-[#806B5B]">
                Disfrutá tus productos favoritos y acumulá
                beneficios con cada compra. Un club pensado
                para quienes aman los pequeños placeres.
              </p>

              <a
                href="/ingresar"
                className="inline-block rounded-full bg-[#704A37] px-9 py-4 text-sm text-white transition hover:bg-[#533626]"
              >
                Ingresar a mi cuenta →
              </a>

              <p className="mt-5 text-xs text-[#9B806A]">
                Un mundo de beneficios te espera.
              </p>
            </div>

            {/* TARJETA VISUAL */}
            <div id="mi-club" className="rounded-3xl bg-[#704A37] p-7 text-[#F5EBDD] shadow-xl md:p-10">

              <div className="mb-10 flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-[0.2em] text-[#D9B99A]">
                    BUEN BOCADO
                  </p>
                  <h2 className="mt-2 text-2xl font-serif">
                    Club Card.
                  </h2>
                </div>

                <span className="text-3xl">☕</span>
              </div>

              <p className="mb-2 text-sm text-[#D9B99A]">
                TU PRÓXIMA RECOMPENSA
              </p>

              <p className="mb-7 text-3xl font-serif">
                Un mimo para vos.
              </p>

              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex aspect-square items-center justify-center rounded-full border ${
                      i < 5
                        ? "border-[#C69B72] bg-[#C69B72] text-[#704A37]"
                        : "border-[#C69B72]/50 text-[#C69B72]"
                    }`}
                  >
                    {i < 5 ? "✓" : "♡"}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <p className="text-sm text-[#D9B99A]">
                  Tu progreso
                </p>
                <p className="text-sm font-semibold">
                  5 de 8 sellos
                </p>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#F5EBDD]/20">
                <div className="h-full w-[62.5%] rounded-full bg-[#C69B72]" />
              </div>

              <p className="mt-8 text-xs tracking-widest text-[#D9B99A]">
                HECHO CON AMOR · BUEN BOCADO
              </p>
            </div>

          </div>
        </section>

        {/* BENEFICIOS */}
        <section className="bg-[#EFE2D0] px-6 py-20 md:px-16">
          <div className="mx-auto max-w-6xl text-center">
            <p className="mb-4 text-xs tracking-[0.3em] text-[#C69B72]">
              UN CLUB ESPECIAL
            </p>

            <h2 className="mb-14 text-4xl font-serif">
              Cada compra tiene su magia.
            </h2>

            <div className="grid gap-12 md:grid-cols-3">

              <div>
                <span className="text-4xl">♡</span>
                <h3 className="mt-5 mb-3 text-xl font-serif">
                  Sumá sellos
                </h3>
                <p className="text-sm leading-7 text-[#806B5B]">
                  Con cada compra, avanzás hacia nuevas recompensas.
                </p>
              </div>

              <div>
                <span className="text-4xl">🎁</span>
                <h3 className="mt-5 mb-3 text-xl font-serif">
                  Recibí premios
                </h3>
                <p className="text-sm leading-7 text-[#806B5B]">
                  Desbloqueá regalos y beneficios exclusivos.
                </p>
              </div>

              <div>
                <span className="text-4xl">☕</span>
                <h3 className="mt-5 mb-3 text-xl font-serif">
                  Disfrutá más
                </h3>
                <p className="text-sm leading-7 text-[#806B5B]">
                  Ser parte del club tiene sus pequeños placeres.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* CATÁLOGO */}
        <section className="px-6 py-20 md:px-16">
          <div className="mx-auto max-w-6xl">

            <p className="mb-4 text-xs tracking-[0.3em] text-[#C69B72]">
              RECIÉN SALIDOS DEL HORNO
            </p>

            <h2 className="mb-12 text-4xl font-serif">
              Pequeños grandes placeres.
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">

              <div className="rounded-2xl bg-[#EFE2D0] p-8">
                <div className="mb-6 flex aspect-square items-center justify-center rounded-xl bg-[#E5D2BB] text-7xl">
                  🍪
                </div>
                <h3 className="text-xl font-serif">Cookies</h3>
                <p className="mt-2 text-sm text-[#806B5B]">
                  Galletitas artesanales llenas de sabor.
                </p>
              </div>

              <div className="rounded-2xl bg-[#EFE2D0] p-8">
                <div className="mb-6 flex aspect-square items-center justify-center rounded-xl bg-[#E5D2BB] text-7xl">
                  🍰
                </div>
                <h3 className="text-xl font-serif">Budines</h3>
                <p className="mt-2 text-sm text-[#806B5B]">
                  Preparados con ingredientes seleccionados.
                </p>
              </div>

              <div className="rounded-2xl bg-[#EFE2D0] p-8">
                <div className="mb-6 flex aspect-square items-center justify-center rounded-xl bg-[#E5D2BB] text-7xl">
                  🍫
                </div>
                <h3 className="text-xl font-serif">Brownies</h3>
                <p className="mt-2 text-sm text-[#806B5B]">
                  Intensos, húmedos y chocolatosos.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* PIE DE PÁGINA */}
      <footer className="bg-[#704A37] px-6 py-12 text-center text-[#F5EBDD]">
        <p className="mb-3 text-2xl font-bold">
          buen bocado.
        </p>
        <p className="text-xs tracking-[0.25em]">
          HECHO CON AMOR.
        </p>
        <p className="mt-8 text-xs text-[#D9B99A]">
          © 2026 BUEN BOCADO CLUB
        </p>
      </footer>

    </div>
  );
}
