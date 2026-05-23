import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { ChevronLeft, Bike, Car, Timer } from "lucide-react";
import { motion } from "motion/react";

// Example center if nothing is loaded: Sao Paulo
const DEFAULT_CENTER = { lat: -23.5505, lng: -46.6333 };

export function CustomerTrackingView({ onClose }: { onClose: () => void }) {
  // Hardcoded tracking courier id for demo purposes (should match CourierView default)
  const COURIER_ID = "entregador_1";

  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    vehicle: string;
    name: string;
  } | null>(null);
  const [viewState, setViewState] = useState({
    longitude: DEFAULT_CENTER.lng,
    latitude: DEFAULT_CENTER.lat,
    zoom: 14,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const { data, error } = await supabase
          .from("localizacao_entregadores")
          .select("*")
          .eq("id", COURIER_ID)
          .single();

        if (error) {
          console.warn("Nenhuma localização ainda para", COURIER_ID);
        } else if (data) {
          setLocation({
            lat: data.lat,
            lng: data.lng,
            vehicle: data.vehicle,
            name: data.name,
          });
          setViewState((prev) => ({
            ...prev,
            latitude: data.lat,
            longitude: data.lng,
            zoom: 15,
          }));
        }
      } catch (err: any) {
        // setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitial();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "localizacao_entregadores",
          filter: `id=eq.${COURIER_ID}`,
        },
        (payload) => {
          const newData = payload.new as any;
          if (newData && newData.lat && newData.lng) {
            setLocation((prev) => ({
              lat: newData.lat,
              lng: newData.lng,
              vehicle: newData.vehicle || prev?.vehicle || "moto",
              name: newData.name || prev?.name || "Entregador",
            }));
            // Smoothly pan camera to the new location
            setViewState((prev) => ({
              ...prev,
              latitude: newData.lat,
              longitude: newData.lng,
            }));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col relative overflow-hidden">
      {/* Header back button */}
      <button
        onClick={onClose}
        className="absolute top-6 left-6 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-neutral-100 text-neutral-800 hover:scale-105 transition-transform"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Mapbox Map */}
      <div className="flex-1 bg-neutral-200 w-full h-full">
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        >
          {location && (
            <Marker longitude={location.lng} latitude={location.lat}>
              <div
                className="w-12 h-12 bg-neutral-900 border-4 border-white rounded-full flex items-center justify-center shadow-2xl relative"
                style={{
                  transition: "all 1000ms ease-in-out", // Smooth translation
                }}
              >
                {location.vehicle === "carro" ? (
                  <Car className="w-6 h-6 text-yellow-400" />
                ) : (
                  <Bike className="w-6 h-6 text-yellow-400" />
                )}
                {/* Ping animation */}
                <div className="absolute inset-0 border-2 border-neutral-900 rounded-full animate-ping opacity-50" />
              </div>
            </Marker>
          )}
        </Map>
      </div>

      {/* Floating Info Card */}
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute bottom-6 inset-x-4 sm:max-w-md sm:mx-auto bg-white rounded-3xl shadow-2xl p-6 border border-neutral-100"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <p className="font-bold text-neutral-800 uppercase text-sm tracking-wide">
            Saiu para entrega
          </p>
        </div>

        <div className="flex items-center gap-4 border-b border-neutral-100 pb-4 mb-4">
          <div className="w-14 h-14 bg-neutral-100 rounded-full overflow-hidden border-2 border-neutral-200 flex-shrink-0">
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=f3f4f6"
              alt="Driver"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-xl text-neutral-900">
              {location?.name || "Entregador"}
            </h3>
            <p className="text-sm font-medium text-neutral-500 capitalize">
              {location?.vehicle || "Moto"}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
          <div className="flex items-center gap-3">
            <Timer className="w-6 h-6 text-neutral-500" />
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Chegada em
              </p>
              <p className="font-black text-2xl text-neutral-900">~8 min</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
