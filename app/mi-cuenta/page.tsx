"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import { auth, db } from "@/lib/firebase";

interface DatosUsuario {
  uid: string;
  nombre: string;
  email: string;
  telefono?: string;
  cumpleanos?: string;
  sellos: number;
  recompensasDisponibles: number;
  rol: string;
}

export default function MiCuentaPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<DatosUsuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelarFirestore: (() => void) | null = null;

    const cancelarAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/ingresar");
        return;
      }

      // Escuchamos en tiempo real los datos del cliente en Firestore
      const docRef = doc(db, "usuarios", user.uid);
      cancelarFirestore = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          setUsuario(snapshot.data() as DatosUsuario);
        }
        setCargando(false);
      });
    });

    return () => {
      cancelarAuth();
      if (cancelarFirestore) cancelarFirestore();
    };
  }, [router]);

  const cerrarSesion = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#F5EBDD] text-[#704A37] flex items-center justify-center">
        <p className="text-sm tracking-[0.2em] uppercase animate-pulse">
          Preparando tu tarjeta del club...
        </p>
      </div>
    );
  }

  if (!usuario) return null;

  const sellosActuales = Math.min(usuario.sellos || 0, 8);
  const porcentaje = (sellosActuales / 8) * 100;
  const codigoSocio = usuario.uid.slice(0, 6).toUpperCase();

  // Verificamos si es su mes de cumpleaños
  const mesActual = new Date().getMonth() + 1;
  const mesCumple = usuario.cumpleanos
    ? parseInt(usuario.cumpleanos.split("-")[1], 10)
    : null;
  const esMesCumpleanos = mesCumple === mesActual;

  return (
    <div className="min-h-screen bg-[#F5EBDD] text-[#704A37] flex flex-col justify-between">
      {/* ENCABEZADO */}
      <header className="flex items-center justify-between px-6 py-6 md:px-16">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          buen bocado<span className="text-[#C69B72]">.</span>
        </Link>

        <div className="flex items-center gap-4">
          {usuario.rol === "admin" && (
            <Link
              href="/admin"
              className="rounded-full bg-[#C69B72] px-4 py-2 text-xs font-medium text-[#704A37] transition hover:opacity-90"
            >
              Panel Admin
            </Link>
          )}
          <button
            onClick={cerrarSesion}
            className="text-xs tracking-[0.15em] uppercase text-[#806B5B] hover:text-[#704A37]"
          >
            Salir
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="px-6 py-8 md:px-16">
        <div className="mx-auto max-w-5xl">
          {/* SALUDO PERSONAL */}
          <div className="mb-10">
            <p className="mb-2 text-xs tracking-[0.25em] uppercase text-[#C69B72]">
              SOCIO #{codigoSocio}
            </p>
            <h1 className="text-4xl font-serif md:text-5xl">
              Hola, {usuario.nombre.split(" ")[0]}.
            </h1>
            <p className="mt-2 text-sm text-[#806B5B]">
              Mostrá tu código QR en cada compra para sumar sellos y desbloquear
              recompensas.
            </p>
          </div>

          {/* ALERTA DE CUMPLEAÑOS SI CORRESPONDE */}
          {esMesCumpleanos && (
            <div className="mb-8 rounded-2xl border border-[#C69B72] bg-[#EFE2D0] p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-[#C69B72]">
                  BENEFICIO DE CUMPLEAÑOS
                </p>
                <p className="mt-1 font-serif text-lg">
                  ¡Es tu mes especial! Tenés un mimo de cumpleaños esperándote en
                  el local.
                </p>
              </div>
              <span className="text-3xl">🎂</span>
            </div>
          )}

          {/* TARJETA DE SELLOS + QR PERSONAL */}
          <div className="grid gap-8 md:grid-cols-5">
            {/* TARJETA DIGITAL (3 columnas) */}
            <div className="md:col-span-3 rounded-3xl bg-[#704A37] p-7 text-[#F5EBDD] shadow-xl md:p-10 flex flex-col justify-between">
              <div>
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <p className="text-xs tracking-[0.2em] text-[#D9B99A]">
                      BUEN BOCADO
                    </p>
                    <h2 className="mt-1 text-2xl font-serif">Club Card.</h2>
                  </div>
                  <span className="text-3xl">☕</span>
                </div>

                <p className="mb-1 text-xs tracking-widest text-[#D9B99A]">
                  TU PRÓXIMA RECOMPENSA
                </p>
                <p className="mb-7 text-2xl font-serif md:text-3xl">
                  {sellosActuales === 8
                    ? "¡Recompensa lista para canjear!"
                    : "Un mimo artesanal para vos."}
                </p>

                {/* GRILLA DE 8 SELLOS REALES */}
                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex aspect-square items-center justify-center rounded-full border text-lg transition-all ${
                        i < sellosActuales
                          ? "border-[#C69B72] bg-[#C69B72] text-[#704A37] font-bold"
                          : "border-[#C69B72]/40 text-[#C69B72]/60"
                      }`}
                    >
                      {i < sellosActuales ? "✓" : "♡"}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#D9B99A]">Tu progreso</p>
                  <p className="text-sm font-semibold">
                    {sellosActuales} de 8 sellos
                  </p>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#F5EBDD]/20">
                  <div
                    className="h-full rounded-full bg-[#C69B72] transition-all duration-500"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>

                <p className="mt-6 text-xs tracking-widest text-[#D9B99A]">
                  TITULAR: {usuario.nombre.toUpperCase()}
                </p>
              </div>
            </div>

            {/* TARJETA DE QR Y PREMIOS (2 columnas) */}
            <div className="md:col-span-2 flex flex-col justify-between gap-6">
              {/* QR PERSONAL */}
              <div className="rounded-3xl bg-[#EFE2D0] p-7 text-center shadow-sm">
                <p className="mb-4 text-xs tracking-[0.2em] uppercase text-[#806B5B]">
                  TU PASE QR PERSONAL
                </p>

                <div className="mx-auto inline-block rounded-2xl bg-white p-4 shadow-inner">
                  <QRCodeSVG
                    value={usuario.uid}
                    size={165}
                    fgColor="#704A37"
                    bgColor="#FFFFFF"
                    level="M"
                  />
                </div>

                <p className="mt-4 font-mono text-xs tracking-widest text-[#704A37]">
                  ID: {codigoSocio}
                </p>
                <p className="mt-1 text-xs text-[#806B5B]">
                  Presentalo en caja antes de abonar
                </p>
              </div>

              {/* RECOMPENSAS DISPONIBLES */}
              <div className="rounded-3xl bg-[#EFE2D0] p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-[#806B5B]">
                    PREMIOS DISPONIBLES
                  </p>
                  <p className="mt-1 text-3xl font-serif">
                    {usuario.recompensasDisponibles || 0}{" "}
                    <span className="text-base font-sans text-[#806B5B]">
                      {usuario.recompensasDisponibles === 1
                        ? "premio listo"
                        : "premios listos"}
                    </span>
                  </p>
                </div>
                <span className="text-3xl">🎁</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* PIE DE PÁGINA */}
      <footer className="mt-12 py-8 text-center text-xs text-[#9B806A]">
        © 2026 BUEN BOCADO CLUB · HECHO CON AMOR
      </footer>
    </div>
  );
}
