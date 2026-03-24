import { Button } from "@/components/ui/button";
import { CheckCircle, ScanLine, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useQRScanner } from "../qr-code/useQRScanner";

interface QRData {
  company?: string;
  batch?: string;
  box?: string;
  mfg?: string;
  exp?: string;
  qty?: number;
}

function tryParseQR(raw: string): QRData | null {
  try {
    const d = JSON.parse(raw);
    if (d && (d.company || d.batch || d.box)) return d as QRData;
    return null;
  } catch {
    return null;
  }
}

export default function QRScanner() {
  const [scannedRaw, setScannedRaw] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<QRData | null>(null);
  const [_isUnknown, setIsUnknown] = useState(false);

  const {
    qrResults,
    isScanning,
    isActive,
    isSupported,
    error,
    isLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    clearResults,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: "environment",
    scanInterval: 150,
    maxResults: 1,
  });

  useEffect(() => {
    if (qrResults.length > 0) {
      const raw = qrResults[0].data;
      setScannedRaw(raw);
      const parsed = tryParseQR(raw);
      setScannedData(parsed);
      setIsUnknown(!parsed);
      stopScanning();
    }
  }, [qrResults, stopScanning]);

  const handleScanAgain = () => {
    setScannedRaw(null);
    setScannedData(null);
    setIsUnknown(false);
    clearResults();
    startScanning();
  };

  if (isSupported === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ScanLine className="w-12 h-12 text-tertiary" />
        <p className="text-muted-custom text-sm">
          Camera not supported on this device/browser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">QR Scanner</h1>
        <p className="text-xs text-muted-custom mt-0.5">
          Scan batch QR codes to view details
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden card-glow relative"
        style={{
          background: "oklch(0.10 0.012 240)",
          border: "1px solid oklch(0.75 0.13 188 / 0.3)",
        }}
      >
        {/* Camera preview */}
        <div
          className="relative"
          style={{ minHeight: 300, background: "#000" }}
        >
          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: 300,
              objectFit: "cover",
              display: "block",
            }}
            playsInline
            muted
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Scanning overlay */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Corner brackets */}
              <div className="relative w-48 h-48">
                <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon rounded-tl" />
                <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-neon rounded-tr" />
                <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-neon rounded-bl" />
                <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon rounded-br" />
                {/* Animated scan line */}
                <div
                  className="absolute left-1 right-1 h-0.5"
                  style={{
                    background: "oklch(0.75 0.13 188 / 0.8)",
                    boxShadow: "0 0 8px oklch(0.75 0.13 188)",
                    animation: "scanLine 1.8s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
          )}

          {!isActive && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center space-y-3">
                <ScanLine className="w-10 h-10 text-neon mx-auto" />
                <p className="text-sm text-muted-custom">Camera inactive</p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <p className="text-sm text-neon animate-pulse">
                Starting camera...
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 flex gap-3 justify-center">
          {!isActive ? (
            <Button
              onClick={() => startScanning()}
              disabled={!canStartScanning || isLoading}
              style={{
                background: "oklch(0.75 0.13 188 / 0.2)",
                border: "1px solid oklch(0.75 0.13 188 / 0.5)",
                color: "oklch(0.75 0.13 188)",
              }}
            >
              <ScanLine className="w-4 h-4 mr-2" /> Start Scanning
            </Button>
          ) : (
            <Button
              onClick={() => stopScanning()}
              disabled={isLoading}
              variant="outline"
              className="border-white/10 text-muted-custom"
            >
              Stop
            </Button>
          )}
        </div>
      </motion.div>

      {error && (
        <div
          className="rounded-xl p-4"
          style={{
            background: "oklch(0.6 0.22 25 / 0.1)",
            border: "1px solid oklch(0.6 0.22 25 / 0.3)",
          }}
        >
          <p className="text-sm" style={{ color: "oklch(0.6 0.22 25)" }}>
            Camera error: {error.message}
          </p>
        </div>
      )}

      {/* Scanned Result */}
      {scannedRaw && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 card-glow"
          style={{
            background: scannedData
              ? "linear-gradient(135deg, oklch(0.13 0.015 240), oklch(0.73 0.17 150 / 0.08))"
              : "linear-gradient(135deg, oklch(0.13 0.015 240), oklch(0.6 0.22 25 / 0.08))",
            border: scannedData
              ? "1px solid oklch(0.73 0.17 150 / 0.4)"
              : "1px solid oklch(0.6 0.22 25 / 0.4)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            {scannedData ? (
              <CheckCircle
                className="w-6 h-6"
                style={{ color: "oklch(0.73 0.17 150)" }}
              />
            ) : (
              <XCircle
                className="w-6 h-6"
                style={{ color: "oklch(0.6 0.22 25)" }}
              />
            )}
            <span className="font-bold text-foreground">
              {scannedData ? "Valid Sidhivinayak QR" : "Unknown QR Code"}
            </span>
          </div>

          {scannedData ? (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Company", value: scannedData.company },
                { label: "Batch", value: scannedData.batch },
                { label: "Box No.", value: scannedData.box },
                { label: "MFG Date", value: scannedData.mfg },
                { label: "EXP Date", value: scannedData.exp },
                {
                  label: "Quantity",
                  value:
                    scannedData.qty !== undefined
                      ? `${scannedData.qty} units`
                      : undefined,
                },
              ].map((f) =>
                f.value !== undefined ? (
                  <div
                    key={f.label}
                    className="rounded-lg p-3"
                    style={{ background: "oklch(0.10 0.012 240)" }}
                  >
                    <p className="text-[10px] text-tertiary mb-0.5">
                      {f.label}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {f.value}
                    </p>
                  </div>
                ) : null,
              )}
            </div>
          ) : (
            <div
              className="rounded-lg p-3"
              style={{ background: "oklch(0.10 0.012 240)" }}
            >
              <p className="text-[10px] text-tertiary mb-1">Raw Data</p>
              <p className="text-xs text-foreground font-mono break-all">
                {scannedRaw}
              </p>
            </div>
          )}

          <Button
            onClick={handleScanAgain}
            className="mt-4 w-full"
            style={{
              background: "oklch(0.75 0.13 188 / 0.15)",
              border: "1px solid oklch(0.75 0.13 188 / 0.4)",
              color: "oklch(0.75 0.13 188)",
            }}
          >
            <ScanLine className="w-4 h-4 mr-2" /> Scan Again
          </Button>
        </motion.div>
      )}

      <style>{`
        @keyframes scanLine {
          0% { top: 4px; }
          50% { top: calc(100% - 4px); }
          100% { top: 4px; }
        }
      `}</style>
    </div>
  );
}
