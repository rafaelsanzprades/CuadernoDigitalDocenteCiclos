import { navGroups } from "@/config/navigation";
import { demoSeed } from "@/services/demo-ele203-0237ictve-curso202526";

export interface SearchResult {
  type: 'page' | 'alumno' | 'modulo' | 'curso';
  title: string;
  subtitle?: string;
  href?: string;
  icon?: string;
  score: number;
}

export function searchGlobal(query: string): SearchResult[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  // 1. Buscar en páginas de navegación
  navGroups.forEach(group => {
    group.items.forEach(item => {
      const titleMatch = item.label.toLowerCase().includes(normalizedQuery);
      const descMatch = item.description?.toLowerCase().includes(normalizedQuery);
      
      if (titleMatch || descMatch) {
        results.push({
          type: 'page',
          title: item.label,
          subtitle: item.description,
          href: item.href,
          score: titleMatch ? 100 : 80
        });
      }
    });
  });

  // 2. Buscar en datos DEMO (alumnos)
  const cursoId = "0237-ictve-curso-2025-26";
  const curso = demoSeed[cursoId];
  if (curso?.df_al) {
    curso.df_al.forEach((alumno: any) => {
      const nombreCompleto = `${alumno.Apellidos} ${alumno.Nombre}`.toLowerCase();
      const nombreSolo = alumno.Nombre.toLowerCase();
      const apellidos = alumno.Apellidos.toLowerCase();
      const email = alumno.email?.toLowerCase() || '';
      
      if (nombreCompleto.includes(normalizedQuery) || 
          nombreSolo.includes(normalizedQuery) ||
          apellidos.includes(normalizedQuery) ||
          email.includes(normalizedQuery)) {
        results.push({
          type: 'alumno',
          title: `${alumno.Apellidos}, ${alumno.Nombre}`,
          subtitle: `ID: ${alumno.ID} | Email: ${alumno.email}`,
          href: '/alumnado',
          score: nombreCompleto.includes(normalizedQuery) ? 90 : 70
        });
      }
    });
  }

  // 3. Buscar en módulos del curso (solo si existe la propiedad)
  if (curso && 'modulo' in curso && curso.modulo) {
    const modulo = curso.modulo as any;
    const moduloSearch = [
      { title: modulo.nombre || 'Módulo', subtitle: 'Configuración del módulo', href: '/modulo' },
      { title: modulo.objetivos || 'Objetivos', subtitle: 'Objetivos del módulo', href: '/modulo' },
    ];
    
    moduloSearch.forEach(item => {
      if (item.title.toLowerCase().includes(normalizedQuery)) {
        results.push({
          type: 'modulo',
          title: item.title,
          subtitle: item.subtitle,
          href: item.href,
          score: 60
        });
      }
    });
  }

  // Ordenar por relevancia (score descendente)
  results.sort((a, b) => b.score - a.score);

  // Limitar a 10 resultados
  return results.slice(0, 10);
}
