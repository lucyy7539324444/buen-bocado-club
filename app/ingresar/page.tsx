"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function IngresarPage() {
  const router = useRouter();
  const [esRegistro, setEsRegistro] = useState(false);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cumpleanos, setCumpleanos] = useState("");
  const [telefono, setTelefono] = useState("");

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      if (esRegistro) {
        if (!nombre.trim()) {
          setError("Por favor, ingresá tu nombre y apellido.");
          setCargando(false);
          return;
        }
        if (!cumpleanos) {
          setError("Ingresá tu fecha de cumpleaños para recibir tu regalo.");
          setCargando(false);
          return;
        }

        // 1. Creamos el usuario en Firebase Authentication
        const credencial = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const uid = credencial.user.uid;

        // 2. Guardamos su ficha inicial en Cloud Firestore
        await setDoc(doc(db, "usuarios", uid), {
          uid,
          nombre: nombre.trim(),
          email: email.toLowerCase().trim(),
          telefono: telefono.trim(),
          cumpleanos,
          sellos: 0,
          recompensasDisponibles: 0,
          rol: "cliente",
          creadoEn: serverTimestamp(),
        });

        router.push("/mi-cuenta");
      } else {
        // Iniciar sesión con cuenta existente
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/mi-cuenta");
      }
    } catch (err: unknown) {
      const codigo = (err as { code?: string })?.code || "";
      if (codigo === "auth/email-already-in-use") {
        setError("Este correo ya está registrado. Probá iniciar sesión.");
      } else if (
        codigo === "auth/invalid-credential" ||
        codigo === "auth/wrong-password" ||
        codigo === "auth/user-not-found"
      ) {
        setError("Correo o contraseña incorrectos.");
      } else if (codigo === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else {
        setError("Ocurrió un error al conectar. Intentá nuevamente.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EBDD] text-[#704A37] flex flex-col justify-between">
      {/* ENCABEZADO */}
      <header className="flex items-center justify-between px-6 py-6 md:px-16">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          buen bocado<span className="text-[#C69B72]">.</span>
        </Link>

        <Link
          href="/"
          className="text-xs tracking-[0.2em] uppercase text-[#806B5B] hover:text-[#704A37]"
        >
          ← Volver al inicio
        </Link>
      </header>

      {/* FORMULARIO CENTRAL */}
      <main className="px-6 py-10">
        <div className="mx-auto max-w-md rounded-3xl bg-[#EFE2D0] p-8 shadow-sm md:p-10">
          <p className="mb-2 text-xs tracking-[0.25em] uppercase text-[#C69B72]">
            {esRegistro ? "SUMATE AL CLUB" : "BIENVENIDO DE NUEVO"}
          </p>

          <h1 className="mb-6 text-3xl font-serif">
            {esRegistro ? "Creá tu cuenta." : "Ingresá a tu club."}
          </h1>

          {/* SELECTOR DE PESTAÑA */}
          <div className="mb-6 grid grid-cols-2 rounded-full bg-[#E5D2BB] p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setEsRegistro(false);
                setError("");
              }}
              className={`rounded-full py-2.5 transition ${
                !esRegistro
                  ? "bg-[#704A37] text-[#F5EBDD]"
                  : "text-[#704A37] hover:opacity-80"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setEsRegistro(true);
                setError("");
              }}
              className={`rounded-full py-2.5 transition ${
                esRegistro
                  ? "bg-[#704A37] text-[#F5EBDD]"
                  : "text-[#704A37] hover:opacity-80"
              }`}
            >
              Registrarme
            </button>
          </div>

          <form onSubmit={manejarEnvio} className="space-y-4">
            {esRegistro && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#806B5B]">
                    Nombre y apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Sofía Martínez"
                    className="w-full rounded-xl border border-[#C69B72]/40 bg-[#F5EBDD] px-4 py-3 text-sm outline-none focus:border-[#704A37]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#806B5B]">
                      Cumpleaños *
                    </label>
                    <input
                      type="date"
                      required
                      value={cumpleanos}
                      onChange={(e) => setCumpleanos(e.target.value)}
                      className="w-full rounded-xl border border-[#C69B72]/40 bg-[#F5EBDD] px-4 py-3 text-sm outline-none focus:border-[#704A37]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#806B5B]">
                      WhatsApp (opcional)
                    </label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="11 1234-5678"
                      className="w-full rounded-xl border border-[#C69B72]/40 bg-[#F5EBDD] px-4 py-3 text-sm outline-none focus:border-[#704A37]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#806B5B]">
                Correo electrónico *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-xl border border-[#C69B72]/40 bg-[#F5EBDD] px-4 py-3 text-sm outline-none focus:border-[#704A37]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#806B5B]">
                Contraseña *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-xl border border-[#C69B72]/40 bg-[#F5EBDD] px-4 py-3 text-sm outline-none focus:border-[#704A37]"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-900/10 px-4 py-3 text-xs text-red-900">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="mt-2 w-full rounded-full bg-[#704A37] py-4 text-sm font-medium text-[#F5EBDD] transition hover:bg-[#533626] disabled:opacity-50"
            >
              {cargando
                ? "Procesando..."
                : esRegistro
                ? "Crear mi cuenta en el Club →"
                : "Ingresar a mi cuenta →"}
            </button>
          </form>
        </div>
      </main>

      {/* PIE DE PÁGINA */}
      <footer className="py-8 text-center text-xs text-[#9B806A]">
        © 2026 BUEN BOCADO CLUB · HECHO CON AMOR
      </footer>
    </div>
  );
}
