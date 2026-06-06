"use client";
import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { usePathname } from "next/navigation";

export function TourGuide() {
  const pathname = usePathname();
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Only run on client and once
    if (typeof window === "undefined" || hasRunRef.current) return;

    const tourCompleted = localStorage.getItem("cdd_tour_completed");
    if (tourCompleted === "true") return;

    // Only start the tour on the main dashboard or entorno page
    if (pathname === "/" || pathname === "/entorno") {
      hasRunRef.current = true;
      
      const tourDriver = driver({
        showProgress: true,
        allowClose: true,
        doneBtnText: "¡Entendido!",
        nextBtnText: "Siguiente",
        prevBtnText: "⬅ Anterior",
        popoverClass: "driverjs-theme",
        onDestroyed: () => {
          localStorage.setItem("cdd_tour_completed", "true");
        },
        steps: [
          {
            element: "body",
            popover: {
              title: "¡Bienvenido a tu Cuaderno Digital Docente!",
              description: "Te haremos un breve recorrido de 4 pasos para que le saques el máximo provecho. Puedes saltarlo o cerrarlo en cualquier momento.",
              align: "center"
            }
          },
          {
            element: "aside",
            popover: {
              title: "Navegación principal",
              description: "Aquí tienes todas las herramientas: Configuración, Módulo, Alumnado y Evaluación.",
              side: "right",
              align: "start"
            }
          },
          {
            element: "header button:has(svg:first-of-type)", // The save button
            popover: {
              title: "Guardar y Deshacer",
              description: "Puedes guardar manualmente aquí, aunque hay autoguardado. También tienes flechas para Deshacer/Rehacer o puedes usar Ctrl+S y Ctrl+Z.",
              side: "bottom",
              align: "end"
            }
          },
          {
            element: "[href='/entorno']", // Entorno tab
            popover: {
              title: "Pestaña de Entorno",
              description: "Para empezar, ve a Entorno y selecciona 'Datos Ficticios' para explorar sin miedo.",
              side: "right",
              align: "center"
            }
          }
        ]
      });

      // Give it a tiny delay to allow the layout to render
      setTimeout(() => {
        tourDriver.drive();
      }, 500);
    }
  }, [pathname]);

  return null;
}
