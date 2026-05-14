"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

type Degree = {
  id: number;
  name: string;
  level: string;
};

type Family = {
  id: number;
  code: string;
  name: string;
  icon_url: string;
  color_hex: string;
  degrees: Degree[];
};

export default function FamiliasPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/families")
      .then(res => res.json())
      .then(json => {
        if (json.status === "success") {
          const sortedFamilies = json.data.map((f: Family) => {
            const levelOrder: Record<string, number> = {
              "BASICA": 1,
              "MEDIO": 2,
              "SUPERIOR": 3,
              "ESPECIALIZACION": 4
            };
            return {
              ...f,
              degrees: f.degrees.sort((a, b) => (levelOrder[a.level] || 99) - (levelOrder[b.level] || 99))
            };
          });
          setFamilies(sortedFamilies);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching families:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0b1120]">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        
        <div className="flex-1 p-8 pt-4 overflow-y-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 mb-2">
                  <span className="text-3xl">🗂️</span> Familias Profesionales
                </h1>
                <p className="text-gray-400">Catálogo oficial de Aragón con sus respectivos Ciclos Formativos (Grado Medio, Superior, Especialización).</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {families.map(family => (
                  <div key={family.id} className="glass-card overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                    <div 
                      className="p-6 flex flex-col items-center text-center relative border-b border-white/5"
                      style={{ background: `linear-gradient(to bottom, ${family.color_hex}15, transparent)` }}
                    >
                      {/* Borde superior de color */}
                      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: family.color_hex }} />
                      
                      {/* Icono */}
                      <div 
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg p-3"
                        style={{ backgroundColor: `${family.color_hex}20`, border: `1px solid ${family.color_hex}40` }}
                      >
                        {family.icon_url.startsWith('fas fa-') ? (
                          <i className={`${family.icon_url} text-4xl`} style={{ color: family.color_hex }}></i>
                        ) : (
                          <img src={family.icon_url} alt={family.code} className="w-full h-full object-contain filter drop-shadow-md" />
                        )}
                      </div>
                      
                      <div className="text-xs font-bold px-2 py-1 rounded-md mb-2" style={{ backgroundColor: `${family.color_hex}30`, color: family.color_hex }}>
                        {family.code}
                      </div>
                      <h2 className="text-lg font-bold text-white leading-tight">
                        {family.name}
                      </h2>
                    </div>

                    <div className="p-5 bg-black/20">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ciclos Formativos ({family.degrees.length})</h3>
                      {family.degrees.length > 0 ? (
                        <div className="space-y-2">
                          {family.degrees.map(degree => {
                            const badgeMap: Record<string, string> = {
                              "BASICA": "GB",
                              "MEDIO": "GM",
                              "SUPERIOR": "GS",
                              "ESPECIALIZACION": "CE"
                            };
                            const badge = badgeMap[degree.level] || degree.level;

                            return (
                              <div key={degree.id} className="text-sm bg-white/5 rounded-lg p-2.5 border border-white/10 hover:border-white/20 transition-colors flex items-center justify-between gap-3">
                                <div className="text-gray-300 font-medium leading-tight flex-1">{degree.name}</div>
                                <div className="text-[10px] font-bold text-white bg-black/40 border border-white/10 px-2 py-1 rounded shadow-inner tracking-wider">
                                  {badge}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic text-center py-4">
                          No hay ciclos formativos registrados.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}
