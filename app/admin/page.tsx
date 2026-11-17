"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  increment,
} from "firebase/firestore";
import { Html5Qrcode } from "html5-qrcode";
import { auth, db } from "@/lib/firebase";

interface Cliente {
  uid: string;
  nombre: string;
  email: string;
  telefono?: string;
  cumpleanos?: string;
  sellos: number;
  recompensasDisponibles: number;
  rol: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [cargando, setCargando] = useState(true);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState(false);

  // Estados del escáner QR
  const [escaneando, setEscaneando] = useState(false);
  const escanerRef = useRef<Html5Qrcode | null>(null);

  // 1. Verificar que quien entra sea realmente "admin"
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/ingresar");
        return;
      }

      const snap = await getDoc(doc(db, "usuarios", user.uid));
      if (!snap.exists() || snap.data()?.rol !== "admin") {
        router.push("/mi-cuenta");
        return;
      }

      setAutorizado(true);
      setCargando(false);
    });

    return () => unsubAuth();
  }, [router]);

  // 2. Escuchar en tiempo real todos los socios del club
  useEffect(() => {
    if (!autorizado) return;

    const unsubClientes = onSnapshot(collection(db, "usuarios"), (snapshot) => {
      const lista: Cliente[] = [];
      snapshot.forEach((docSnap) => {
        lista.push(docSnap.data() as Cliente);
      });
      setClientes(lista);

      // Si hay un cliente abierto en la ficha, lo mantenemos actualizado
      setClienteSeleccionado((prev) => {
        if (!prev) return null;
        return lista.find((c) => c.uid === prev.uid) || prev;
      });
    });

    return () => unsubClientes();
  }, [autorizado]);

  // 3. Limpiar cámara al salir o detener escaneo
  const detenerEscaner = async () => {
    if (escanerRef.current) {
      try {
        if (escanerRef.current.isScanning) {
          await escanerRef.current.stop();
        }
        escanerRef.current.clear();
      } catch {
        // Ignorar errores de cierre de cámara
      }
      escanerRef.current = null;
    }
    setEscaneando(false);
  };

  useEffect(() => {
    return () => {
      detenerEscaner();
    };
  }, []);

  const iniciarEscaner = async () => {
    setMensaje("");
    setEscaneando(true);

    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("lector-qr");
        escanerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          async (textoLeido) => {
            const uidLimpio = textoLeido.trim();
            const encontrado = clientes.find((c) => c.uid === uidLimpio);

            if (encontrado) {
              setClienteSeleccionado(encontrado);
              setMensaje(`QR leído: ${encontrado.nombre}`);
            } else {
              setMensaje("No se encontró ningún socio con ese código QR.");
            }
            await detenerEscaner();
          },
          () => {
            // Frame sin QR detectado aún
          }
        );
      } catch {
        setMensaje(
          "No se pudo acceder a la cámara. Revisá los permisos del navegador o buscá al cliente manualmente."
        );
        setEscaneando(false);
      }
    }, 100);
  };

  // 4. Acciones de sellos y premios
  const sumarSellos = async (cantidad: number) => {
    if (!clienteSeleccionado || procesando) return;
    setProcesando(true);
    setMensaje("");

    try {
      const totalNuevo = (clienteSeleccionado.sellos || 0) + cantidad;
      const premiosGanados = Math.floor(totalNuevo / 8);
      const sellosRestantes = totalNuevo % 8;

      await updateDoc(doc(db, "usuarios", clienteSeleccionado.uid), {
        sellos: sellosRestantes,
        recompensasDisponibles: increment(premiosGanados),
      });

      if (premiosGanados > 0) {
        setMensaje(
          `¡Tarjeta completada! Se acreditó ${premiosGanados} premio(s) a ${clienteSeleccionado.nombre}.`
        );
      } else {
        setMensaje(
          `+${cantidad} sello(s) acreditado(s) a ${clienteSeleccionado.nombre}.`
        );
      }
    } catch {
      setMensaje("Error al actualizar los sellos.");
    } finally {
      setProcesando(false);
    }
  };

  const canjearPremio = async () => {
    if (
      !clienteSeleccionado ||
      procesando ||
      (clienteSeleccionado.recompensasDisponibles || 0) <= 0
    )
      return;

    setProcesando(true);
    setMensaje("");

    try {
      await updateDoc(doc(db, "usuarios", clienteSeleccionado.uid), {
        recompensasDisponibles: increment(-1),
      });
      setMensaje(`¡Premio canjeado con éxito para ${clienteSeleccionado.nombre}!`);
    } catch {
      setMensaje("Error al canjear el premio.");
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#F5EBDD] text-[#704A37] flex items-center justify-center">
        <p className="text-sm tracking-[0.2em] uppercase animate-pulse">
          Verificando acceso de administración...
        </p>
      </div>
    );
  }

  if (!autorizado) return null;

  // Filtrado de búsqueda
  const clientesFiltrados = clientes.filter((c) => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    const codigoCorto = c.uid.slice(0, 6).toLowerCase();
    return (
      c.nombre?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      codigoCorto.includes(q)
    );
  });

  // Cumpleañeros del mes actual
  const mesActual = new Date().getMonth() + 1;
  const cumpleanerosMes = clientes.filter((c) => {
    if (!c.cumpleanos) return false;
    return parseInt(c.cumpleanos.split("-")[1], 10) === mesActual;
  });

  return (
    <div className="min-h-screen bg-[#F5EBDD] text-[#704A37] flex flex-col justify-between">
      {/* ENCABEZADO */}
      <header className="flex items-center justify-between px-6 py-6 md:px-16">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          buen bocado<span className="text-[#C69B72]">.</span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block rounded-full bg-[#704A37] px-3 py-1 text-[10px] tracking-[0.2em] uppercase text-[#F5EBDD]">
            Modo Local / Admin
          </span>
          <Link
            href="/mi-cuenta"
            className="text-xs tracking-[0.15em] uppercase text-[#806B5B] hover:text-[#704A37]"
          >
            ← Mi tarjeta
          </Link>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="px-6 py-6 md:px-16">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* MÉTRICAS RÁPIDAS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#EFE2D0] p-6">
              <p className="text-xs tracking-[0.2em] uppercase text-[#806B5B]">
                TOTAL SOCIOS
              </p>
              <p className="mt-2 text-3xl font-serif">{clientes.length}</p>
            </div>
            <div className="rounded-2xl bg-[#EFE2D0] p-6">
              <p className="text-xs tracking-[0.2em] uppercase text-[#806B5B]">
                PREMIOS POR ENTREGAR
              </p>
              <p className="mt-2 text-3xl font-serif">
                {clientes.reduce(
                  (acc, c) => acc + (c.recompensasDisponibles || 0),
                  0
                )}
              </p>
            </div>
            <div className="rounded-2xl bg-[#EFE2D0] p-6">
              <p className="text-xs tracking-[0.2em] uppercase text-[#806B5B]">
                CUMPLES ESTE MES
              </p>
              <p className="mt-2 text-3xl font-serif">
                {cumpleanerosMes.length} 🎂
              </p>
            </div>
          </div>

          {/* MENSAJE DE CONFIRMACIÓN */}
          {mensaje && (
            <div className="rounded-2xl border border-[#C69B72] bg-[#EFE2D0] px-5 py-4 text-sm font-medium text-[#704A37]">
              {mensaje}
            </div>
          )}

          {/* ZONA DE OPERACIÓN: ESCÁNER/BUSCADOR + FICHA DEL CLIENTE */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* COLUMNA IZQUIERDA: ESCÁNER QR Y BÚSQUEDA */}
            <div className="rounded-3xl bg-[#EFE2D0] p-7 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-[#C69B72]">
                    IDENTIFICAR SOCIO
                  </p>
                  <h2 className="mt-1 text-2xl font-serif">
                    Escanear o buscar.
                  </h2>
                </div>

                {!escaneando ? (
                  <button
                    type="button"
                    onClick={iniciarEscaner}
                    className="rounded-full bg-[#704A37] px-5 py-2.5 text-xs font-medium text-[#F5EBDD] transition hover:bg-[#533626]"
                  >
                    📷 Escanear QR
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={detenerEscaner}
                    className="rounded-full bg-red-900 px-5 py-2.5 text-xs font-medium text-white"
                  >
                    Cerrar cámara
                  </button>
                )}
              </div>

              {/* VISOR DE CÁMARA QR */}
              {escaneando && (
                <div className="overflow-hidden rounded-2xl border-2 border-[#704A37] bg-black">
                  <div id="lector-qr" className="w-full" />
                </div>
              )}

              {/* BUSCADOR MANUAL */}
              <div>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, email o ID de 6 letras..."
                  className="w-full rounded-xl border border-[#C69B72]/40 bg-[#F5EBDD] px-4 py-3 text-sm outline-none focus:border-[#704A37]"
                />
              </div>

              {/* LISTA DE SOCIOS */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {clientesFiltrados.map((c) => {
                  const activo = clienteSeleccionado?.uid === c.uid;
                  return (
                    <button
                      key={c.uid}
                      type="button"
                      onClick={() => {
                        setClienteSeleccionado(c);
                        setMensaje("");
                      }}
                      className={`w-full rounded-2xl p-4 text-left transition flex items-center justify-between ${
                        activo
                          ? "bg-[#704A37] text-[#F5EBDD]"
                          : "bg-[#F5EBDD] hover:bg-[#E5D2BB]"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-sm">{c.nombre}</p>
                        <p
                          className={`text-xs ${
                            activo ? "text-[#D9B99A]" : "text-[#806B5B]"
                          }`}
                        >
                          ID: {c.uid.slice(0, 6).toUpperCase()} · {c.email}
                        </p>
                      </div>
                      <div className="text-right text-xs font-semibold">
                        <p>{c.sellos || 0}/8 sellos</p>
                        {(c.recompensasDisponibles || 0) > 0 && (
                          <p className="text-[#C69B72]">
                            🎁 {c.recompensasDisponibles} premio(s)
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* COLUMNA DERECHA: FICHA ACTIVA PARA SUMAR SELLOS */}
            <div className="rounded-3xl bg-[#704A37] p-7 text-[#F5EBDD] flex flex-col justify-between">
              {!clienteSeleccionado ? (
                <div className="my-auto py-16 text-center space-y-3">
                  <span className="text-4xl">☕</span>
                  <h3 className="text-2xl font-serif">
                    Seleccioná o escaneá un cliente
                  </h3>
                  <p className="mx-auto max-w-xs text-sm text-[#D9B99A]">
                    Escaneá su código QR en caja o elegilo de la lista para
                    acreditar sellos o canjear recompensas.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start justify-between border-b border-[#F5EBDD]/15 pb-5">
                    <div>
                      <p className="text-xs tracking-[0.2em] uppercase text-[#D9B99A]">
                        SOCIO #{clienteSeleccionado.uid.slice(0, 6).toUpperCase()}
                      </p>
                      <h3 className="mt-1 text-3xl font-serif">
                        {clienteSeleccionado.nombre}
                      </h3>
                      <p className="mt-1 text-xs text-[#D9B99A]">
                        {clienteSeleccionado.email}
                        {clienteSeleccionado.cumpleanos
                          ? ` · Cumple: ${clienteSeleccionado.cumpleanos}`
                          : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setClienteSeleccionado(null)}
                      className="text-xs text-[#D9B99A] hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {/* ESTADO ACTUAL DE SELLOS */}
                  <div>
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="text-[#D9B99A]">Tarjeta actual</span>
                      <span className="font-semibold">
                        {clienteSeleccionado.sellos || 0} de 8 sellos
                      </span>
                    </div>

                    <div className="grid grid-cols-8 gap-2">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className={`flex aspect-square items-center justify-center rounded-full border text-xs ${
                            i < (clienteSeleccionado.sellos || 0)
                              ? "border-[#C69B72] bg-[#C69B72] text-[#704A37] font-bold"
                              : "border-[#C69B72]/40 text-[#C69B72]/50"
                          }`}
                        >
                          {i < (clienteSeleccionado.sellos || 0) ? "✓" : "♡"}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BOTONES PARA ACREDITAR SELLOS */}
                  <div className="space-y-2 pt-2">
                    <p className="text-xs tracking-[0.2em] uppercase text-[#D9B99A]">
                      ACREDITAR COMPRA
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        disabled={procesando}
                        onClick={() => sumarSellos(1)}
                        className="rounded-2xl bg-[#C69B72] py-3.5 text-sm font-semibold text-[#704A37] transition hover:opacity-90 disabled:opacity-50"
                      >
                        +1 Sello
                      </button>
                      <button
                        type="button"
                        disabled={procesando}
                        onClick={() => sumarSellos(2)}
                        className="rounded-2xl bg-[#C69B72] py-3.5 text-sm font-semibold text-[#704A37] transition hover:opacity-90 disabled:opacity-50"
                      >
                        +2 Sellos
                      </button>
                      <button
                        type="button"
                        disabled={procesando}
                        onClick={() => sumarSellos(3)}
                        className="rounded-2xl bg-[#C69B72] py-3.5 text-sm font-semibold text-[#704A37] transition hover:opacity-90 disabled:opacity-50"
                      >
                        +3 Sellos
                      </button>
                    </div>
                  </div>

                  {/* BLOQUE DE CANJE DE RECOMPENSA */}
                  <div className="rounded-2xl bg-[#533626] p-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs tracking-[0.15em] uppercase text-[#D9B99A]">
                        PREMIOS ACUMULADOS
                      </p>
                      <p className="mt-1 text-2xl font-serif">
                        {clienteSeleccionado.recompensasDisponibles || 0}{" "}
                        disponible(s)
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        procesando ||
                        (clienteSeleccionado.recompensasDisponibles || 0) <= 0
                      }
                      onClick={canjearPremio}
                      className="rounded-full bg-[#F5EBDD] px-5 py-3 text-xs font-semibold text-[#704A37] transition hover:bg-white disabled:opacity-30"
                    >
                      🎁 Canjear 1 premio
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* PIE DE PÁGINA */}
      <footer className="mt-12 py-8 text-center text-xs text-[#9B806A]">
        © 2026 BUEN BOCADO CLUB · PANEL DE ADMINISTRACIÓN
      </footer>
    </div>
  );
}
