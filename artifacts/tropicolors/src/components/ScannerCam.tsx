import { useEffect, useRef, useState, useCallback } from "react";
import {
  CameraOff,
  ScanLine,
  Camera,
  RotateCcw,
  QrCode,
  Keyboard,
  Barcode,
} from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface ScannerCamProps {
  onScan: (code: string) => void;
  isActive?: boolean;
}

export function ScannerCam({ onScan, isActive = true }: ScannerCamProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<string>("");
  const scanCooldownRef = useRef<boolean>(false);
  const isStartedRef = useRef<boolean>(false);

  const [hasCamera, setHasCamera] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scanMode, setScanMode] = useState<"all" | "barcode" | "qr">("all");

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isStartedRef.current) {
      try {
        await scannerRef.current.stop();
        isStartedRef.current = false;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setScanning(false);
  }, []);

  const startScanner = useCallback(
    async (mode: "all" | "barcode" | "qr" = "all") => {
      if (!isActive) return;

      try {
        setError(null);
        await stopScanner();

        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) {
          setHasCamera(false);
          setError("No se encontraron cámaras");
          return;
        }

        setCameras(devices.map((d) => ({ id: d.id, label: d.label })));

        const backCamera = devices.find(
          (d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("environment") ||
            d.label.toLowerCase().includes("rear") ||
            d.label.toLowerCase().includes("trasera"),
        );

        const cameraId = backCamera?.id || devices[0].id;

        let formats: Html5QrcodeSupportedFormats[] = [];

        if (mode === "all" || mode === "barcode") {
          formats = [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.DATA_MATRIX,
          ];
        } else if (mode === "qr") {
          formats = [Html5QrcodeSupportedFormats.QR_CODE];
        }

        const scanner = new Html5Qrcode("scanner-reader", {
          formatsToSupport: formats,
          verbose: false,
        });
        scannerRef.current = scanner;

        await scanner.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 320, height: 200 },
            aspectRatio: 1.333333,
          },
          (decodedText, result) => {
            console.log(
              "Detectado:",
              decodedText,
              "formato:",
              result ? "detectado" : "desconocido",
            );

            if (scanCooldownRef.current) return;

            lastScanRef.current = decodedText;
            scanCooldownRef.current = true;

            onScan(decodedText);

            setTimeout(() => {
              scanCooldownRef.current = false;
            }, 3000);
          },
          () => {},
        );

        isStartedRef.current = true;
        setScanning(true);
        setScanMode(mode);
      } catch (err: any) {
        console.error("Scanner error:", err);
        if (
          err?.message?.includes("NotAllowedError") ||
          err?.name === "NotAllowedError"
        ) {
          setError("Permiso de cámara denegado");
        } else if (
          err?.message?.includes("NotFoundError") ||
          err?.name === "NotFoundError"
        ) {
          setError("No se encontró la cámara");
        } else {
          setError("Error al iniciar la cámara");
        }
        setHasCamera(false);
        setScanning(false);
      }
    },
    [isActive, onScan, stopScanner],
  );

  useEffect(() => {
    if (isActive && hasCamera) {
      startScanner("all");
    }

    return () => {
      stopScanner();
    };
  }, [isActive, hasCamera]);

  const handleRestart = async (mode: "all" | "barcode" | "qr" = "all") => {
    lastScanRef.current = "";
    scanCooldownRef.current = false;
    await stopScanner();
    setTimeout(() => startScanner(mode), 300);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode("");
      setShowManualInput(false);
    }
  };

  const toggleMode = () => {
    const modes: ("all" | "barcode" | "qr")[] = ["all", "barcode", "qr"];
    const currentIdx = modes.indexOf(scanMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    handleRestart(nextMode);
  };

  const getModeLabel = () => {
    switch (scanMode) {
      case "all":
        return "Todo";
      case "barcode":
        return "Códigos";
      case "qr":
        return "QR";
    }
  };

  if (!hasCamera || error) {
    return (
      <div className="bg-slate-800 rounded-3xl p-6 text-center">
        <CameraOff className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400 text-sm mb-4">
          {error || "Cámara no disponible"}
        </p>
        <button
          onClick={() => handleRestart("all")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl overflow-hidden bg-slate-900">
      <div id="scanner-reader" className="w-full aspect-[4/3]"></div>

      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full">
          <ScanLine
            className={`w-4 h-4 ${scanning ? "text-green-400 animate-pulse" : "text-slate-400"}`}
          />
          <span className="text-xs text-white font-medium">
            {scanning ? getModeLabel() : "Iniciando..."}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMode}
            className="p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors"
            title="Cambiar modo"
          >
            {scanMode === "barcode" ? (
              <Barcode className="w-4 h-4 text-white" />
            ) : scanMode === "qr" ? (
              <QrCode className="w-4 h-4 text-white" />
            ) : (
              <ScanLine className="w-4 h-4 text-white" />
            )}
          </button>

          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors"
            title="Ingresar manualmente"
          >
            <Keyboard className="w-4 h-4 text-white" />
          </button>

          {cameras.length > 1 && (
            <button
              onClick={() => handleRestart(scanMode)}
              className="p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors"
              title="Cambiar cámara"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {showManualInput && (
        <div className="absolute inset-0 z-20 bg-slate-900/95 flex items-center justify-center p-4">
          <form onSubmit={handleManualSubmit} className="w-full max-w-xs">
            <p className="text-white text-sm font-medium mb-3 text-center">
              Ingresa el código o nombre
            </p>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ej: Amarillo Huevo 250"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white text-center focus:outline-none focus:border-primary mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowManualInput(false)}
                className="flex-1 py-3 bg-slate-700 text-white rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-primary text-white rounded-xl font-medium"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="text-center space-y-1">
          <p className="text-white/80 text-sm font-medium">
            {scanMode === "all"
              ? "Escanea QR o código de barras"
              : scanMode === "barcode"
                ? "Escanea código de barras"
                : "Escanea código QR"}
          </p>
          <p className="text-white/50 text-xs">
            Toca el ícono para cambiar modo • Usa teclado para manual
          </p>
        </div>
      </div>
    </div>
  );
}
