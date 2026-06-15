import type { CursoData } from "@/types";

export const SIRL_DEMO: CursoData = {
  id: "sirl-demo-202526",
  nombre: "1º STI - SIRL - Curso 2025/26",
  curso_academico: "2025/26",
  familia: "Informática y Comunicaciones",
  nivel: "Grado Superior",
  
  alumnado: [
    { id: "1", nombre: "Ana García López", dni: "12345678A", email: "ana.garcia@educa.aragon.es", telefono: "612345678", fecha_nacimiento: "2005-01-15", direccion: "Calle Mayor 1, Zaragoza", grupo: "A" },
    { id: "2", nombre: "Carlos Martínez Sánchez", dni: "23456789B", email: "carlos.martinez@educa.aragon.es", telefono: "623456789", fecha_nacimiento: "2005-03-22", direccion: "Calle Secunda 2, Zaragoza", grupo: "A" },
    { id: "3", nombre: "Laura Rodríguez Pérez", dni: "34567890C", email: "laura.rodriguez@educa.aragon.es", telefono: "634567890", fecha_nacimiento: "2005-05-10", direccion: "Calle Tercera 3, Zaragoza", grupo: "A" },
    { id: "4", nombre: "Miguel Sánchez García", dni: "45678901D", email: "miguel.sanchez@educa.aragon.es", telefono: "645678901", fecha_nacimiento: "2005-07-05", direccion: "Calle Cuarta 4, Zaragoza", grupo: "A" },
    { id: "5", nombre: "Sofía Torres Ruiz", dni: "56789012E", email: "sofia.torres@educa.aragon.es", telefono: "656789012", fecha_nacimiento: "2005-09-18", direccion: "Calle Quinta 5, Zaragoza", grupo: "A" },
    { id: "6", nombre: "Daniel López Martínez", dni: "67890123F", email: "daniel.lopez@educa.aragon.es", telefono: "667890123", fecha_nacimiento: "2005-11-30", direccion: "Calle Sexta 6, Zaragoza", grupo: "A" },
    { id: "7", nombre: "Paula Fernández Gómez", dni: "78901234G", email: "paula.fernandez@educa.aragon.es", telefono: "678901234", fecha_nacimiento: "2005-02-14", direccion: "Calle Séptima 7, Zaragoza", grupo: "A" },
    { id: "8", nombre: "Alejandro Jiménez Hernández", dni: "89012345H", email: "alejandro.jimenez@educa.aragon.es", telefono: "689012345", fecha_nacimiento: "2005-04-25", direccion: "Calle Octava 8, Zaragoza", grupo: "A" },
    { id: "9", nombre: "Carmen Ruiz Moreno", dni: "90123456I", email: "carmen.ruiz@educa.aragon.es", telefono: "690123456", fecha_nacimiento: "2005-06-12", direccion: "Calle Novena 9, Zaragoza", grupo: "A" },
    { id: "10", nombre: "Javier González Díaz", dni: "01234567J", email: "javier.gonzalez@educa.aragon.es", telefono: "601234567", fecha_nacimiento: "2005-08-20", direccion: "Calle Décima 10, Zaragoza", grupo: "A" }
  ],

  modulo: {
    id: "sirl-202526",
    codigo: "SIRL",
    nombre: "Sistemas Informáticos y Redes Locales",
    horas_totales: 2000,
    curso_academico: "2025/26",
    familia: "Informática y Comunicaciones",
    nivel: "Grado Superior"
  },

  programacion: {
    id: "prog-sirl-202526",
    modulo_id: "sirl-202526",
    curso_id: "sirl-demo-202526",
    nombre: "Programación SIRL 2025/26",
    curso_academico: "2025/26",
    fecha_inicio: "2025-09-01",
    fecha_fin: "2026-06-30"
  },

  seguimiento: []
};