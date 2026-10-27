import React, { createContext, useContext, useState, useEffect } from "react";
import { mockUserProfile } from "../data/mockData";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(mockUserProfile);
  const [toast, setToast] = useState(null);

  const initialTransaction = {
    tenderId: "TND-2026-004",
    title: "Stok Pisang Kepok Kuning Tua 40 Kg",
    commodityName: "Pisang Kepok Kuning Super",
    category: "Buah-buahan",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80",
    grade: "Grade Super",
    quantityKg: 40,
    targetQuantityKg: 40,
    actualWeightKg: 40.2,
    pricePerKg: 14000,
    agreedPricePerKg: 14000,
    subtotal: 560000,
    harvestSubtotal: 560000,
    fulfillmentMethod: "FARMER_DELIVERY",
    deliveryFee: 25000,
    platformFeeRate: 4.0,
    platformFee: 22400,
    netFarmerPayment: 562600,
    totalPayment: 585000,
    escrowAmount: 585000,
    deliveryDate: "2026-10-28",
    status: "AWARDED",
    escrowId: "ESC-20261027-8891",
    timestamp: "27 Okt 2026, 12:00:37 WIB",
    releaseTime: "27 Okt 2026, 12:05:15 WIB",
    handoverTime: "27 Okt 2026, 11:45:00 WIB",
    hash: "GEO-VERIFY-882194",
    samplePhoto: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80",
    geotag: {
      latitude: "-6.860451° S",
      longitude: "107.589923° E",
      coordinates: "-6.860451° S, 107.589923° E",
      accuracy: "4 meter (Presisi Tinggi)",
      address: "Jl. Setiabudi No. 120, Sukasari, Kota Bandung",
    },
    farmer: {
      id: "FARM-04",
      name: "Pak Wayan Sudirga",
      farmName: "Tani Buah Barokah",
      location: "Tagogapu, Padalarang, Bandung Barat",
      distanceKm: 11.5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      rating: 4.7,
      phone: "+62 813-7722-9901",
      bankAccount: "BRI • 4410-01-081299-53",
      verified: true,
      status: "CONFIRMED",
      confirmedTime: "11:45 WIB",
    },
    buyer: {
      id: "BUYER-04",
      businessName: "Pisang Crispy Juara",
      contactPerson: "Bapak Hendra Gunawan",
      businessType: "UMKM Camilan & Gorengan",
      deliveryAddress: "Jl. Setiabudi No. 120, Sukasari, Kota Bandung",
      address: "Jl. Setiabudi No. 120, Sukasari, Kota Bandung",
      phone: "+62 812-3456-7890",
      status: "CHECKING",
    },
  };

  const [activeTransaction, setActiveTransaction] = useState(() => {
    try {
      const saved = sessionStorage.getItem("patratani_active_transaction");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return initialTransaction;
  });

  useEffect(() => {
    try {
      if (activeTransaction) {
        sessionStorage.setItem("patratani_active_transaction", JSON.stringify(activeTransaction));
      }
    } catch (e) {}
  }, [activeTransaction]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const hideToast = () => {
    setToast(null);
  };

  const login = (credentials = {}) => {
    const user = {
      ...mockUserProfile,
      email: credentials.email || mockUserProfile.email,
    };
    setCurrentUser(user);
    showToast("Login Berhasil", "success");
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    showToast("Berhasil Keluar", "info");
  };

  const register = (userData = {}) => {
    const user = {
      ...mockUserProfile,
      name: userData.name || mockUserProfile.name,
      email: userData.email || mockUserProfile.email,
      role: userData.role === "PETANI" ? "Petani Mitra" : "Pembeli UMKM",
    };
    setCurrentUser(user);
    showToast("Pendaftaran Berhasil", "success");
    return user;
  };

  const updateUserProfile = (updatedFields) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...updatedFields,
      };
    });
  };

  const startTransactionFromTender = (tender, offerData = {}) => {
    const qty = Number(offerData.offeredQuantity) || tender.requiredQuantityKg || 20;
    const price = Number(offerData.offeredPrice) || tender.targetPricePerKg || 12000;
    const method = offerData.deliveryMethod || tender.fulfillmentMethod || "SELF_PICKUP";
    const fee = method === "FARMER_DELIVERY" ? (Number(offerData.deliveryFee) || tender.deliveryFee || 15000) : 0;
    const sub = price * qty;
    const platformCommission = Math.round(sub * 0.035);
    const total = sub + fee;
    const netFarmer = sub - platformCommission + fee;

    const newTx = {
      tenderId: tender.id,
      title: tender.title,
      commodityName: tender.commodityName || tender.title,
      category: tender.category || "Sayuran & Buah",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
      grade: "Grade Super",
      quantityKg: qty,
      targetQuantityKg: qty,
      actualWeightKg: qty + 0.2,
      pricePerKg: price,
      agreedPricePerKg: price,
      subtotal: sub,
      harvestSubtotal: sub,
      fulfillmentMethod: method,
      deliveryFee: fee,
      platformFeeRate: 3.5,
      platformFee: platformCommission,
      netFarmerPayment: netFarmer,
      totalPayment: total,
      escrowAmount: total,
      deliveryDate: offerData.harvestDate || tender.deliveryDate || "2026-10-30",
      status: "AWARDED",
      escrowId: `ESC-${Date.now().toString().slice(-8)}`,
      timestamp: "27 Okt 2026, 12:00:37 WIB",
      releaseTime: "27 Okt 2026, 12:05:15 WIB",
      handoverTime: "27 Okt 2026, 11:45:00 WIB",
      hash: `GEO-VERIFY-${Math.floor(100000 + Math.random() * 900000)}`,
      samplePhoto: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80",
      geotag: {
        latitude: "-6.860451° S",
        longitude: "107.589923° E",
        coordinates: "-6.860451° S, 107.589923° E",
        accuracy: "4 meter (Presisi Tinggi)",
        address: tender.buyer?.address || "Jl. Setiabudi No. 120, Sukasari, Kota Bandung",
      },
      farmer: {
        id: "FARM-01",
        name: currentUser?.name || "Pak Mulyono",
        farmName: "Sentra Tani Bina Mitra",
        location: currentUser?.location || "Lembang, Bandung Barat",
        distanceKm: 4.5,
        avatar: currentUser?.avatar || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
        rating: 4.9,
        phone: currentUser?.phone || "+62 812-9988-7711",
        bankAccount: `${currentUser?.bankName || "BRI"} • ${currentUser?.accountNumber || "4410-01-xxxxxx-53"}`,
        verified: true,
        status: "CONFIRMED",
        confirmedTime: "11:45 WIB",
      },
      buyer: tender.buyer || {
        businessName: "Dapur Kuliner Mitra",
        contactPerson: "Bapak Pembeli",
        businessType: "Restoran & UMKM",
        deliveryAddress: "Jl. Dipati Ukur No. 42, Bandung",
        address: "Jl. Dipati Ukur No. 42, Bandung",
        phone: "+62 812-3456-7890",
        status: "CHECKING",
      },
    };

    setActiveTransaction(newTx);
    return newTx;
  };

  const startTransactionFromCommodity = (commodity, requestedQuantity) => {
    const qty = Number(requestedQuantity) || commodity.minOrderKg || 10;
    const price = commodity.pricePerKg || 12000;
    const fee = commodity.logistics?.farmerDelivery?.fixedFee || 15000;
    const sub = price * qty;
    const platformCommission = Math.round(sub * 0.035);
    const total = sub + fee;
    const netFarmer = sub - platformCommission + fee;

    const newTx = {
      tenderId: `ORD-${commodity.id}`,
      title: `Pre-order ${commodity.name} ${qty} Kg`,
      commodityName: commodity.name,
      category: commodity.category,
      image: commodity.image,
      grade: commodity.grade || "Grade A",
      quantityKg: qty,
      targetQuantityKg: qty,
      actualWeightKg: qty + 0.2,
      pricePerKg: price,
      agreedPricePerKg: price,
      subtotal: sub,
      harvestSubtotal: sub,
      fulfillmentMethod: "FARMER_DELIVERY",
      deliveryFee: fee,
      platformFeeRate: 3.5,
      platformFee: platformCommission,
      netFarmerPayment: netFarmer,
      totalPayment: total,
      escrowAmount: total,
      deliveryDate: commodity.harvestDate || "2026-10-28",
      status: "AWARDED",
      escrowId: `ESC-${Date.now().toString().slice(-8)}`,
      timestamp: "27 Okt 2026, 12:00:37 WIB",
      releaseTime: "27 Okt 2026, 12:05:15 WIB",
      handoverTime: "27 Okt 2026, 11:45:00 WIB",
      hash: `GEO-VERIFY-${Math.floor(100000 + Math.random() * 900000)}`,
      samplePhoto: commodity.image,
      geotag: {
        latitude: "-6.860451° S",
        longitude: "107.589923° E",
        coordinates: "-6.860451° S, 107.589923° E",
        accuracy: "4 meter (Presisi Tinggi)",
        address: "Jl. Dipati Ukur No. 42, Coblong, Kota Bandung",
      },
      farmer: {
        ...commodity.farmer,
        phone: "+62 813-8822-1100",
        bankAccount: "BRI • 4410-01-028471-53-2",
        status: "CONFIRMED",
        confirmedTime: "11:45 WIB",
      },
      buyer: {
        businessName: currentUser?.name ? `${currentUser.name} (UMKM)` : "Resto Barokah",
        contactPerson: currentUser?.name || "Rizal",
        businessType: "UMKM Kuliner Mandiri",
        deliveryAddress: "Jl. Gegerkalong Girang No. 34, Bandung",
        address: "Jl. Gegerkalong Girang No. 34, Bandung",
        phone: currentUser?.phone || "+62 812-9988-7711",
        status: "CHECKING",
      },
    };

    setActiveTransaction(newTx);
    return newTx;
  };

  const payEscrow = () => {
    setActiveTransaction((prev) => ({
      ...prev,
      status: "PAID_HELD",
    }));

    setCurrentUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        escrowBalance: prev.escrowBalance + (activeTransaction.totalPayment || 585000),
      };
    });
    showToast("Dana Berhasil Diamankan di Escrow", "success");
  };

  const completeHandover = (actualWeightKg) => {
    const weight = Number(actualWeightKg) || activeTransaction.quantityKg || 25;
    setActiveTransaction((prev) => ({
      ...prev,
      status: "COMPLETED",
      actualWeightKg: weight,
    }));

    setCurrentUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        activeBalance: prev.activeBalance + (activeTransaction.netFarmerPayment || 562600),
        escrowBalance: Math.max(0, prev.escrowBalance - (activeTransaction.totalPayment || 585000)),
      };
    });
    showToast("Dana Escrow Berhasil Dicairkan ke Petani!", "success");
  };

  const fileDispute = (reason) => {
    setActiveTransaction((prev) => ({
      ...prev,
      status: "DISPUTED",
      disputeReason: reason,
    }));
    showToast("Laporan Sengketa Berhasil Dikirim ke Admin", "info");
  };

  const value = {
    currentUser,
    setCurrentUser,
    login,
    logout,
    register,
    updateUserProfile,
    activeTransaction,
    setActiveTransaction,
    startTransactionFromTender,
    startTransactionFromCommodity,
    payEscrow,
    completeHandover,
    fileDispute,
    toast,
    showToast,
    hideToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export const useAppContext = useApp;
export default AppContext;
