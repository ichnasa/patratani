import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { mockDefaultHandover } from "../data/mockData";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import {
  Camera,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  ShieldCheck,
  Check,
  ArrowLeft,
  Store,
  X,
  FileCheck2,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

export default function HandoverPage({ onBack, onComplete }) {
  const navigate = useNavigate();
  const { activeTransaction, completeHandover, fileDispute } = useApp();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraStatus, setCameraStatus] = useState("INITIALIZING");
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);
  const [isPhotoCaptured, setIsPhotoCaptured] = useState(false);
  const [actualWeight, setActualWeight] = useState(
    activeTransaction?.actualWeightKg
      ? String(activeTransaction.actualWeightKg)
      : "25.2"
  );
  const [checklist, setChecklist] = useState({
    freshness: true,
    aroma: true,
    sorting: true,
    packaging: true,
  });
  const [isReleasing, setIsReleasing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(
    activeTransaction?.status === "COMPLETED" || false
  );
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [isDisputed, setIsDisputed] = useState(
    activeTransaction?.status === "DISPUTED" || false
  );

  const handoverData = activeTransaction || mockDefaultHandover;

  const [gpsData, setGpsData] = useState({
    latitude: handoverData.geotag?.latitude || "-6.860451° S",
    longitude: handoverData.geotag?.longitude || "107.589923° E",
    accuracy: handoverData.geotag?.accuracy || "4 meter",
    isLive: false,
  });

  useEffect(() => {
    let activeStream = null;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        })
        .then((stream) => {
          activeStream = stream;
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setCameraStatus("STREAMING");
        })
        .catch(() => {
          setCameraStatus("DENIED");
        });
    } else {
      setCameraStatus("UNAVAILABLE");
    }

    if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          const acc = `${Math.round(position.coords.accuracy)} meter`;
          setGpsData({
            latitude: `${lat}°`,
            longitude: `${lng}°`,
            accuracy: acc,
            isLive: true,
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const targetQty = handoverData.targetQuantityKg || handoverData.quantityKg || 25;
  const parsedActualWeight = parseFloat(actualWeight) || targetQty;
  const weightDiff = (parsedActualWeight - targetQty).toFixed(1);
  const isWeightValid = parsedActualWeight >= targetQty;

  const allChecklistPassed =
    checklist.freshness &&
    checklist.aroma &&
    checklist.sorting &&
    checklist.packaging &&
    isWeightValid;

  const toggleChecklist = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCapturePhoto = () => {
    if (isPhotoCaptured) {
      setCapturedPhotoUrl(null);
      setIsPhotoCaptured(false);
      if (cameraStatus === "STREAMING" && videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
      return;
    }

    if (cameraStatus === "STREAMING" && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setCapturedPhotoUrl(dataUrl);
      setIsPhotoCaptured(true);
    } else {
      setCapturedPhotoUrl(
        handoverData.samplePhoto ||
          handoverData.image ||
          "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80"
      );
      setIsPhotoCaptured(true);
    }
  };

  const handleReleaseFunds = () => {
    setIsReleasing(true);
    setTimeout(() => {
      setIsReleasing(false);
      setIsCompleted(true);
      if (completeHandover) {
        completeHandover(parsedActualWeight);
      }
      if (onComplete) {
        onComplete();
      }
    }, 1000);
  };

  const handleFileDispute = (e) => {
    e.preventDefault();
    setIsDisputeModalOpen(false);
    setIsDisputed(true);
    if (fileDispute) {
      fileDispute(disputeReason);
    }
  };

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col justify-between selection:bg-primary-50 selection:text-primary">
      <Navbar activeNav="transaksi" />

      <main className="w-full flex-1">
        <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-8 md:py-10 space-y-8 pb-28 md:pb-14">
          <div>
            <button
              type="button"
              onClick={() => (onBack ? onBack() : navigate(-1))}
              className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-primary transition-colors cursor-pointer select-none mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Transaksi</span>
            </button>

            <section className="bg-surface rounded-2xl p-6 sm:p-7 border border-border shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-status-handover/15 text-status-handover">
                      {handoverData.tenderId}
                    </span>
                    <span className="text-xs text-ink-muted">•</span>
                    <span className="text-xs text-ink-secondary">
                      Serah-Terima Fisik &amp; Verifikasi Geotag
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                    {handoverData.title}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={
                      isCompleted
                        ? "COMPLETED"
                        : isDisputed
                        ? "DISPUTED"
                        : "HANDOVER"
                    }
                    size="md"
                    showIcon
                    showDot
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#EFEEE7] border border-border">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={handoverData.farmer?.avatar}
                      alt={handoverData.farmer?.name}
                      className="w-8 h-8 rounded-full object-cover border border-border"
                    />
                    <div>
                      <p className="font-bold text-ink leading-tight">
                        {handoverData.farmer?.name}
                      </p>
                      <p className="text-[10px] text-ink-muted">
                        Petani • {handoverData.farmer?.farmName}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-[#DCFCE7] text-[#166534] font-bold text-[10px] flex items-center gap-1 border border-[#BBF7D0]">
                    <CheckCircle2 className="w-3 h-3" />
                    Telah Tiba di Lokasi
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#EFEEE7] border border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-surface-green text-primary flex items-center justify-center">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-ink leading-tight">
                        {handoverData.buyer?.businessName}
                      </p>
                      <p className="text-[10px] text-ink-muted">
                        Penerima: {handoverData.buyer?.contactPerson}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-[#FEF3C7] text-[#B45309] font-bold text-[10px] flex items-center gap-1 border border-[#FDE68A]">
                    <Clock className="w-3 h-3" />
                    Pemeriksaan Fisik
                  </span>
                </div>
              </div>
            </section>
          </div>

          {isCompleted ? (
            <section className="bg-surface rounded-2xl p-8 sm:p-10 border border-[#BBF7D0] bg-[#DCFCE7]/30 text-center space-y-6 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#16A34A] text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="max-w-xl mx-auto space-y-2">
                <span className="text-xs font-bold text-[#166534] uppercase tracking-wider bg-[#DCFCE7] px-3 py-1 rounded-full border border-[#BBF7D0]">
                  Status Transaksi: COMPLETED
                </span>
                <h2 className="text-2xl font-bold text-ink">
                  Serah-Terima Selesai &amp; Dana Escrow Berhasil Dicairkan!
                </h2>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Verifikasi geotag dan timbangan dinyatakan sah ({parsedActualWeight} Kg). Dana sebesar <strong>Rp {(handoverData.netFarmerPayment || 562600).toLocaleString("id-ID")}</strong> telah diteruskan ke rekening {handoverData.farmer?.name}.
                </p>
              </div>

              <div className="p-5 max-w-lg mx-auto rounded-xl bg-[#EFEEE7] border border-border text-left space-y-2 text-xs">
                <div className="flex items-center justify-between font-medium text-ink">
                  <span>Waktu Penyelesaian:</span>
                  <span className="font-bold">{handoverData.timestamp}</span>
                </div>
                <div className="flex items-center justify-between font-medium text-ink">
                  <span>Lokasi Terverifikasi:</span>
                  <span>{handoverData.geotag?.address}</span>
                </div>
                <div className="flex items-center justify-between font-medium text-ink">
                  <span>Kode Verifikasi Digital:</span>
                  <span className="font-mono text-primary font-bold">{handoverData.hash}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  icon={ChevronRight}
                  iconPosition="right"
                  onClick={() => navigate("/completed")}
                >
                  Lihat Rincian Pencairan &amp; Beri Ulasan
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate("/")}
                >
                  Kembali ke Beranda
                </Button>
              </div>
            </section>
          ) : isDisputed ? (
            <section className="bg-surface rounded-2xl p-8 sm:p-10 border border-[#FECACA] bg-[#FEE2E2]/30 text-center space-y-5 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#DC2626] text-white flex items-center justify-center mx-auto shadow-md">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div className="max-w-xl mx-auto space-y-2">
                <span className="text-xs font-bold text-[#991B1B] uppercase tracking-wider bg-[#FEE2E2] px-3 py-1 rounded-full border border-[#FECACA]">
                  Status: DISPUTED (Sengketa Aktif)
                </span>
                <h2 className="text-2xl font-bold text-ink">
                  Laporan Ketidaksesuaian Diterima Admin
                </h2>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Pencairan dana escrow ditahan sementara oleh sistem. Tim admin Patra Tani akan meninjau bukti foto dan koordinat geotag dalam waktu 1x24 jam untuk mediasi penyesuaian kuota atau penggantian komoditas.
                </p>
              </div>

              <div className="p-4 max-w-md mx-auto rounded-xl bg-[#EFEEE7] border border-border text-left text-xs space-y-1">
                <span className="font-bold text-ink block">Alasan Sengketa yang Dilaporkan:</span>
                <p className="text-ink-secondary italic">"{disputeReason || "Kualitas komoditas atau timbangan tidak memenuhi standar kesepakatan awal."}"</p>
              </div>

              <div className="flex justify-center pt-2">
                <Button variant="outline" size="md" onClick={() => setIsDisputed(false)}>
                  Batal &amp; Coba Verifikasi Ulang
                </Button>
              </div>
            </section>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                <section className="bg-[#1A1A1A] rounded-2xl border border-border/40 shadow-lg text-[#E6E4DA] relative overflow-hidden">
                  <canvas ref={canvasRef} className="hidden" />

                  <div className="p-4 bg-black/40 backdrop-blur-md flex items-center justify-between border-b border-white/10 z-10 relative">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${cameraStatus === "STREAMING" ? "bg-[#22C55E] animate-pulse" : "bg-[#DC2626]"}`} />
                      <span className="text-xs font-bold tracking-wider uppercase text-white">
                        {cameraStatus === "STREAMING" ? "Live Camera Viewfinder" : "Simulasi Kamera Viewfinder"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#D5D8CC]">
                        {cameraStatus === "STREAMING" ? "LIVE STREAM" : "1080p • 60 FPS"}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${gpsData.isLive ? "bg-[#16A34A] text-white" : "bg-[#F59E0B] text-black"}`}>
                        {gpsData.isLive ? "GPS REALTIME" : "GPS LOCKED"}
                      </span>
                    </div>
                  </div>

                  {cameraStatus === "DENIED" && (
                    <div className="px-4 py-2 bg-[#F59E0B]/20 border-b border-[#F59E0B]/30 flex items-center gap-2 text-xs text-[#FDE68A]">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Akses kamera dibatasi perangkat. Mode simulasi foto inspeksi otomatis aktif.</span>
                    </div>
                  )}

                  <div className="relative aspect-[4/3] w-full bg-[#262626] flex items-center justify-center overflow-hidden">
                    {isPhotoCaptured && capturedPhotoUrl ? (
                      <img
                        src={capturedPhotoUrl}
                        alt="Hasil Jepretan Bukti Serah Terima"
                        className="w-full h-full object-cover brightness-95 contrast-105"
                      />
                    ) : cameraStatus === "STREAMING" ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={handoverData.samplePhoto || handoverData.image || "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80"}
                        alt="Pratinjau Serah Terima Kamera"
                        className="w-full h-full object-cover brightness-75 blur-[0.5px]"
                      />
                    )}

                    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="w-8 h-8 border-t-2 border-l-2 border-white/80" />
                        <div className="w-8 h-8 border-t-2 border-r-2 border-white/80" />
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="w-8 h-8 border-b-2 border-l-2 border-white/80" />
                        <div className="w-8 h-8 border-b-2 border-r-2 border-white/80" />
                      </div>
                    </div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-12 h-12 border border-white/40 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-full shadow-xs" />
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md rounded-xl p-3 border border-white/15 text-[11px] font-mono space-y-1 shadow-md">
                      <div className="flex items-center justify-between text-white/70 text-[10px]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#FBBF24]" />
                          {handoverData.timestamp}
                        </span>
                        <span>HASH: {handoverData.hash}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-white">
                        <MapPin className="w-3.5 h-3.5 text-[#60A5FA] shrink-0" />
                        <span className="truncate">
                          {gpsData.latitude}, {gpsData.longitude} ({gpsData.accuracy})
                        </span>
                      </div>

                      <div className="text-[10px] text-white/60 truncate pt-0.5 border-t border-white/10">
                        {handoverData.geotag?.address}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#141414] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-[#D5D8CC]">
                      {isPhotoCaptured ? (
                        <span className="text-[#4ADE80] font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Foto bukti dan stempel GPS berhasil disimpan.
                        </span>
                      ) : (
                        <span>Arahkan kamera ke komoditas &amp; timbangan untuk mengambil bukti.</span>
                      )}
                    </div>

                    <Button
                      variant={isPhotoCaptured ? "outline" : "primary"}
                      size="sm"
                      icon={Camera}
                      onClick={handleCapturePhoto}
                    >
                      {isPhotoCaptured ? "Ambil Ulang Foto" : "Bidikan Foto Geotag"}
                    </Button>
                  </div>
                </section>

                <section className="bg-surface rounded-2xl p-6 sm:p-7 border border-border space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border/80">
                    <div className="flex items-center gap-2">
                      <Scale className="w-5 h-5 text-primary" />
                      <h3 className="text-base font-bold text-ink">
                        Pemeriksaan Timbangan Aktual
                      </h3>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E6E4DA] text-ink">
                      Target: {targetQty} Kg
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ink uppercase tracking-wider block">
                        Input Timbangan Aktual (Kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={actualWeight}
                        onChange={(e) => setActualWeight(e.target.value)}
                        className={`w-full rounded-xl px-4 py-2.5 text-base font-bold bg-[#EFEEE7] border focus:outline-none transition-all ${
                          isWeightValid
                            ? "border-border text-ink focus:border-primary focus:ring-2 focus:ring-primary/20"
                            : "border-[#DC2626] text-[#DC2626] focus:border-[#DC2626]"
                        }`}
                      />
                      <p className="text-[11px] text-ink-muted">
                        Angka riil hasil timbangan di depan kurir &amp; pembeli
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#EFEEE7] border border-border flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                        Status Selisih Kuota
                      </span>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span
                            className={`text-xl font-extrabold ${
                              isWeightValid ? "text-[#16A34A]" : "text-[#DC2626]"
                            }`}
                          >
                            {weightDiff > 0 ? `+${weightDiff}` : weightDiff} Kg
                          </span>
                          <span className="text-xs text-ink-secondary">
                            {isWeightValid ? "(Memenuhi Kuota)" : "(Kurang dari Target)"}
                          </span>
                        </div>
                        <p className="text-[10px] text-ink-muted mt-0.5">
                          {isWeightValid
                            ? "Sesuai dengan kesepakatan pesanan."
                            : "Berat kurang dari target! Ajukan penyesuaian/sengketa."}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                <section className="bg-surface rounded-2xl p-6 sm:p-7 border border-border shadow-xs space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-border/80">
                    <FileCheck2 className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-bold text-ink">
                      Persetujuan &amp; Pelepasan Escrow
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#EFEEE7] border border-border">
                      <span className="text-ink-secondary">Status Petani Mitra:</span>
                      <span className="font-bold text-[#16A34A] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Dikonfirmasi ({handoverData.farmer?.confirmedTime || "11:45 WIB"})
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#EFEEE7] border border-border">
                      <span className="text-ink-secondary">Total Nilai Escrow Tertahan:</span>
                      <span className="font-bold text-primary text-sm">
                        Rp {(handoverData.escrowAmount || handoverData.totalPayment || 800000).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-xs font-bold text-ink uppercase tracking-wider block">
                      Checklist Kesegaran &amp; Mutu Panen
                    </span>

                    {[
                      {
                        id: "freshness",
                        label: "Tekstur umbi padat, kering, bebas bonyok lembek",
                      },
                      {
                        id: "aroma",
                        label: "Aroma tajam segar khas panen baru (bebas bau busuk)",
                      },
                      {
                        id: "sorting",
                        label: "Sortasi Grade A bersih tanpa jamur hitam atau ulat",
                      },
                      {
                        id: "packaging",
                        label: "Penimbangan disaksikan langsung oleh kedua pihak",
                      },
                    ].map((item) => (
                      <label
                        key={item.id}
                        onClick={() => toggleChecklist(item.id)}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          checklist[item.id]
                            ? "bg-surface-green/60 border-primary/40 text-ink"
                            : "bg-surface border-border text-ink-muted hover:bg-surface/80"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                            checklist[item.id]
                              ? "bg-primary border-primary text-[#E6E4DA]"
                              : "border-border bg-surface"
                          }`}
                        >
                          {checklist[item.id] && <Check className="w-3 h-3" />}
                        </div>
                        <span className="leading-tight">{item.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="pt-2 space-y-3">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      icon={ShieldCheck}
                      isLoading={isReleasing}
                      disabled={!allChecklistPassed || !isPhotoCaptured}
                      onClick={handleReleaseFunds}
                    >
                      Verifikasi &amp; Lepaskan Dana Escrow
                    </Button>

                    {!isPhotoCaptured && (
                      <p className="text-[11px] text-[#D97706] text-center font-medium">
                        * Silakan ambil foto bukti melalui kamera di sebelah kiri terlebih dahulu.
                      </p>
                    )}

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setIsDisputeModalOpen(true)}
                        className="text-xs font-semibold text-[#DC2626] hover:text-[#991B1B] hover:underline flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Laporkan Sengketa (Komoditas Bermasalah)</span>
                      </button>
                    </div>
                  </div>
                </section>

                <div className="bg-surface rounded-2xl p-5 border border-border space-y-3 text-xs text-ink-secondary">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Kebijakan Pencairan Dana Otomatis</span>
                  </div>
                  <p className="leading-relaxed">
                    Ketika Anda menekan tombol "Verifikasi &amp; Lepaskan Dana", simulasi smart contract escrow akan otomatis mentransfer Rp {(handoverData.netFarmerPayment || 772000).toLocaleString("id-ID")} ke dompet petani tanpa penundaan.
                  </p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      {isDisputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs"
            onClick={() => setIsDisputeModalOpen(false)}
          />

          <div className="relative bg-surface rounded-3xl p-6 sm:p-7 border border-border max-w-lg w-full space-y-5 z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-[#DC2626]">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-ink">
                  Ajukan Laporan Sengketa Transaksi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDisputeModalOpen(false)}
                className="p-1 rounded-full text-ink-muted hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-ink-secondary leading-relaxed">
              Jika komoditas tidak sesuai spesifikasi, rusak saat transit, atau kuota timbangan kurang dan petani tidak bersedia menyesuaikan, dana escrow akan ditahan hingga admin meninjau.
            </p>

            <form onSubmit={handleFileDispute} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink block">
                  Detail Masalah / Keluhan
                </label>
                <textarea
                  rows="4"
                  required
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Jelaskan kondisi komoditas, cacat fisik, atau kekurangan timbangan aktual..."
                  className="w-full rounded-xl p-3.5 text-xs text-ink bg-[#EFEEE7] border border-border focus:border-[#DC2626] focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[11px] text-[#991B1B] space-y-1">
                <strong className="block font-bold">Catatan Investigasi:</strong>
                <p>Foto kamera dengan stempel GPS dan riwayat berat timbangan akan dilampirkan otomatis sebagai barang bukti sah.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDisputeModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  icon={AlertTriangle}
                >
                  Kirim Laporan Sengketa
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
