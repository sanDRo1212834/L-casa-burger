import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { MapPin, Navigation, Pause, Play, Car, Bike } from "lucide-react";
import { motion } from "motion/react";

// Fictional route from point A to point B for simulation
const MOCK_ROUTE = [
  { lat: -23.5505, lng: -46.6333 },
  { lat: -23.551, lng: -46.634 },
  { lat: -23.5515, lng: -46.6348 },
  { lat: -23.552, lng: -46.6355 },
  { lat: -23.5525, lng: -46.636 },
  { lat: -23.553, lng: -46.6365 },
  { lat: -23.5535, lng: -46.637 },
  { lat: -23.554, lng: -46.6375 },
];

export function CourierView() {
  const [courierId, setCourierId] = useState("entregador_1");
  const [courierName, setCourierName] = useState("João Motoboy");
  const [vehicle, setVehicle] = useState<"moto" | "carro">("moto");

  const [isOnline, setIsOnline] = useState(false);
  const [mode, setMode] = useState<"real" | "simulated">("real");
  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");

  const watchIdRef = useRef<number | null>(null);
  const simIntervalRef = useRef<any>(null);
  const simIndexRef = useRef(0);

  const updateLocation = async (lat: number, lng: number) => {
    setCurrentCoords({ lat, lng });
    setSyncStatus("syncing");
    try {
      const { error } = await supabase.from("localizacao_entregadores").upsert({
        id: courierId,
        lat,
        lng,
        name: courierName,
        vehicle,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch (error) {
      console.error("Error updating location:", error);
      setSyncStatus("error");
    }
  };

  const startRealTracking = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada neste navegador.");
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        updateLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("Erro Posição:", error);
        setSyncStatus("error");
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 },
    );
  };

  const stopRealTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const startSimulatedTracking = () => {
    simIndexRef.current = 0;
    updateLocation(MOCK_ROUTE[0].lat, MOCK_ROUTE[0].lng);
    simIntervalRef.current = setInterval(() => {
      simIndexRef.current = (simIndexRef.current + 1) % MOCK_ROUTE.length;
      const point = MOCK_ROUTE[simIndexRef.current];
      updateLocation(point.lat, point.lng);
    }, 5000); // update every 5 seconds
  };

  const stopSimulatedTracking = () => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isOnline) {
      if (mode === "real") {
        startRealTracking();
      } else {
        startSimulatedTracking();
      }
    } else {
      stopRealTracking();
      stopSimulatedTracking();
    }

    return () => {
      stopRealTracking();
      stopSimulatedTracking();
    };
  }, [isOnline, mode]);

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 pb-24">
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="p-6 bg-neutral-900 text-white">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-black italic uppercase">
              Painel do Entregador
            </h1>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${isOnline ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
              />
              {isOnline ? "ONLINE" : "OFFLINE"}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-neutral-400 font-bold mb-1 block">
                Nome do Entregador
              </label>
              <input
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                disabled={isOnline}
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 font-bold mb-1 block">
                Veículo
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setVehicle("moto")}
                  disabled={isOnline}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors ${vehicle === "moto" ? "bg-yellow-400 text-black" : "bg-neutral-800 text-neutral-400"}`}
                >
                  <Bike className="w-5 h-5" /> Moto
                </button>
                <button
                  onClick={() => setVehicle("carro")}
                  disabled={isOnline}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors ${vehicle === "carro" ? "bg-yellow-400 text-black" : "bg-neutral-800 text-neutral-400"}`}
                >
                  <Car className="w-5 h-5" /> Carro
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex p-1 bg-neutral-100 rounded-xl">
            <button
              onClick={() => {
                setMode("real");
                setIsOnline(false);
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${mode === "real" ? "bg-white shadow text-neutral-900" : "text-neutral-500"}`}
            >
              GPS Real
            </button>
            <button
              onClick={() => {
                setMode("simulated");
                setIsOnline(false);
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${mode === "simulated" ? "bg-white shadow text-neutral-900" : "text-neutral-500"}`}
            >
              Simulação (Fictícia)
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`w-full py-4 rounded-full font-black text-xl flex items-center justify-center gap-2 transition-colors ${
                isOnline
                  ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
                  : "bg-green-500 hover:bg-green-600 text-white shadow-xl shadow-green-500/30"
              }`}
            >
              {isOnline ? (
                <>
                  <Pause className="w-6 h-6" /> Ficar Offline
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" /> Ficar Online
                </>
              )}
            </button>
          </div>

          {currentCoords && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 text-center space-y-2">
              <MapPin className="w-8 h-8 text-neutral-400 mx-auto" />
              <h3 className="font-bold text-neutral-700">Coordenadas Atuais</h3>
              <p className="text-xl font-mono text-neutral-900">
                {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
              </p>

              <div className="pt-2 text-sm font-bold">
                {syncStatus === "syncing" && (
                  <span className="text-blue-500 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />{" "}
                    Sincronizando...
                  </span>
                )}
                {syncStatus === "success" && (
                  <span className="text-green-500">
                    Dados Enviados com Sucesso!
                  </span>
                )}
                {syncStatus === "error" && (
                  <span className="text-red-500">Erro ao Sincronizar!</span>
                )}
                {syncStatus === "idle" && (
                  <span className="text-neutral-400">
                    Aguardando atualização de posição
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
