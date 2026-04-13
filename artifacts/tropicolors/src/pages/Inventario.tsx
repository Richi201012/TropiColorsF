import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileBlock } from "@/components/MobileBlock";
import { ScannerCam } from "@/components/ScannerCam";
import { ProductoCard } from "@/components/ProductoCard";
import { MovimientoList } from "@/components/MovimientoList";

import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  LogOut,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  ScanLine,
} from "lucide-react";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  barcode?: string;
}

interface Movimiento {
  id: string;
  producto_id: string;
  nombre: string;
  tipo: "entrada" | "salida";
  cantidad: number;
  fecha: any;
}

type ToastType = "success" | "error";

interface ToastState {
  show: boolean;
  type: ToastType;
  message: string;
}

export default function Inventario() {
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [scannerActive, setScannerActive] = useState(true);

  const [producto, setProducto] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState<string>("1");
  const [buscando, setBuscando] = useState(false);
  const [productoNoEncontrado, setProductoNoEncontrado] = useState(false);

  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(true);

  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: "success",
    message: "",
  });
  const [guardando, setGuardando] = useState(false);

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ show: true, type, message });
    setTimeout(
      () => setToast({ show: false, type: "success", message: "" }),
      3000,
    );
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        sessionStorage.setItem("fromInventario", "true");
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [setLocation]);

  const cargarMovimientos = useCallback(async () => {
    if (!user) return;

    setLoadingMovimientos(true);
    try {
      const movimientosRef = collection(db, "movimientos");
      const q = query(movimientosRef);
      const snapshot = await getDocs(q);

      const movs: Movimiento[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Movimiento[];

      setMovimientos(movs);
    } catch (err) {
      console.error("Error cargando movimientos:", err);
    } finally {
      setLoadingMovimientos(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      cargarMovimientos();
    }
  }, [user, cargarMovimientos]);

  const buscarProducto = useCallback(
    async (code: string) => {
      setBuscando(true);
      setProductoNoEncontrado(false);
      setProducto(null);
      setScannerActive(false);

      try {
        const productosRef = collection(db, "productos");
        console.log("Buscando código:", code);

        // Get all products to search by name
        const allProducts = await getDocs(productosRef);

        // Try to find by barcode first (if products have barcode field)
        let foundDoc = allProducts.docs.find(
          (doc) => doc.data().barcode === code,
        );

        // If not found by barcode, search by name (partial match)
        if (!foundDoc) {
          foundDoc = allProducts.docs.find((doc) => {
            const name = (doc.data().name || "").toLowerCase().trim();
            const searchTerm = code.toLowerCase().trim();
            return name.includes(searchTerm) || searchTerm.includes(name);
          });
        }

        if (foundDoc) {
          console.log(
            "Producto encontrado:",
            foundDoc.id,
            foundDoc.data().name,
          );
          const docData = foundDoc.data();
          setProducto({
            id: foundDoc.id,
            nombre: docData.name || docData.nombre || "Producto",
            precio: Number(docData.prices?.[125]?.[0] || docData.price || 0),
            stock: Number(docData.stock || 0),
            barcode: docData.barcode,
          });
        } else {
          console.log("Producto no encontrado para:", code);
          setProductoNoEncontrado(true);
          setTimeout(() => {
            setScannerActive(true);
            setProductoNoEncontrado(false);
          }, 2000);
        }
      } catch (err) {
        console.error("Error buscando producto:", err);
        showToast("error", "Error al buscar producto");
        setTimeout(() => setScannerActive(true), 1500);
      } finally {
        setBuscando(false);
      }
    },
    [showToast],
  );

  const registrarMovimiento = useCallback(
    async (tipo: "entrada" | "salida") => {
      if (!producto || !user) return;

      const cantidadNum = parseInt(cantidad);
      if (isNaN(cantidadNum) || cantidadNum <= 0) {
        showToast("error", "Ingresa una cantidad válida");
        return;
      }

      if (tipo === "salida" && cantidadNum > producto.stock) {
        showToast("error", `Stock insuficiente. Disponible: ${producto.stock}`);
        return;
      }

      setGuardando(true);

      try {
        const nuevoStock =
          tipo === "entrada"
            ? producto.stock + cantidadNum
            : producto.stock - cantidadNum;

        const productoRef = doc(db, "productos", producto.id);
        await updateDoc(productoRef, { stock: nuevoStock });

        await addDoc(collection(db, "movimientos"), {
          producto_id: producto.id,
          nombre: producto.nombre,
          tipo,
          cantidad: cantidadNum,
          fecha: serverTimestamp(),
        });

        setProducto((prev) => (prev ? { ...prev, stock: nuevoStock } : null));

        showToast(
          "success",
          `${tipo === "entrada" ? "Entrada" : "Salida"} registrada: ${cantidadNum} unidades`,
        );

        setCantidad("1");

        setTimeout(() => {
          setProducto(null);
          setScannerActive(true);
          cargarMovimientos();
        }, 1500);
      } catch (err) {
        console.error("Error guardando:", err);
        showToast("error", "Error al registrar movimiento");
      } finally {
        setGuardando(false);
      }
    },
    [producto, user, cantidad, showToast, cargarMovimientos],
  );

  const handleLogout = useCallback(async () => {
    try {
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
      setLocation("/login");
    } catch (err) {
      console.error("Error logout:", err);
    }
  }, [setLocation]);

  const limpiarProducto = useCallback(() => {
    setProducto(null);
    setCantidad("1");
    setScannerActive(true);
    setProductoNoEncontrado(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Inventario</h1>
          <p className="text-slate-400 text-sm mb-6">
            Inicia sesión para acceder al inventario
          </p>
          <button
            onClick={() => setLocation("/login")}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  if (!isMobile) {
    return <MobileBlock />;
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-6">
      <div className="bg-slate-800/50 border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Inventario</h1>
              <p className="text-xs text-slate-400">Control de stock</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2.5 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {producto ? (
          <div className="space-y-4">
            <div className="relative">
              <button
                onClick={limpiarProducto}
                className="absolute -top-2 -right-2 z-10 p-2 bg-slate-700 hover:bg-slate-600 rounded-full shadow-lg"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <ProductoCard
                nombre={producto.nombre}
                precio={producto.precio}
                stock={producto.stock}
                barcode={producto.barcode}
              />
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white text-center text-xl font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => registrarMovimiento("entrada")}
                disabled={guardando}
                className="flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 text-white rounded-2xl font-bold text-lg transition-colors active:scale-95"
              >
                {guardando ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowDownToLine className="w-5 h-5" />
                )}
                Entrada
              </button>

              <button
                onClick={() => registrarMovimiento("salida")}
                disabled={guardando}
                className="flex items-center justify-center gap-2 py-4 bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white rounded-2xl font-bold text-lg transition-colors active:scale-95"
              >
                {guardando ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowUpFromLine className="w-5 h-5" />
                )}
                Salida
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {buscando ? (
              <div className="bg-slate-800/50 rounded-3xl p-8 text-center border border-slate-700/30">
                <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
                <p className="text-slate-300 font-medium">
                  Buscando producto...
                </p>
              </div>
            ) : productoNoEncontrado ? (
              <div className="bg-slate-800/50 rounded-3xl p-8 text-center border border-red-500/30">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <p className="text-slate-300 font-medium">
                  Producto no encontrado
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  El código no está registrado
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <ScanLine className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-slate-300">
                    Escanea un producto
                  </span>
                </div>
                <ScannerCam onScan={buscarProducto} isActive={scannerActive} />
              </div>
            )}
          </div>
        )}

        <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">
              Últimos movimientos
            </span>
          </div>

          {loadingMovimientos ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
            </div>
          ) : (
            <MovimientoList movimientos={movimientos} limit={5} />
          )}
        </div>
      </div>

      {toast.show && (
        <div
          className={`fixed bottom-6 left-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl animate-in slide-in-from-bottom-4 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-white shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-white shrink-0" />
          )}
          <p className="text-white text-sm font-medium">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
