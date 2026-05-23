import React, { createContext, useState } from 'react';

export type Personaje = {
  id: number;
  nombre: string;
  edad: string;
  poder: string;
  anime: string;
  imagen1: string;
  imagen2: string;
  imagen3: string;
  imagen4: string;
};

export type PersonajeUsuario = {
  id: number;
  nombre: string;
  edad: string;
  poder: string;
  imagen1: string;
  imagen2: string;
  imagen3: string;
  imagen4: string;
  categoria_id: number;
  categoria_nombre: string;
  categoria_color: string;
  categoria_emoji: string;
};

type AnimeContextType = {
  ultimosChainsawMan: Personaje | null;
  ultimosDanDaDan:    Personaje | null;
  ultimosCastlevania: Personaje | null;
  setUltimoChainsawMan: (p: Personaje) => void;
  setUltimoDanDaDan:    (p: Personaje) => void;
  setUltimoCastlevania: (p: Personaje) => void;
  ultimosPorCategoria: Record<number, PersonajeUsuario>;
  setUltimoCategoria:  (p: PersonajeUsuario) => void;
};

export const AnimeContext = createContext<AnimeContextType>({
  ultimosChainsawMan: null,
  ultimosDanDaDan:    null,
  ultimosCastlevania: null,
  setUltimoChainsawMan: () => {},
  setUltimoDanDaDan:    () => {},
  setUltimoCastlevania: () => {},
  ultimosPorCategoria:  {},
  setUltimoCategoria:   () => {},
});

export function AnimeProvider({ children }: { children: React.ReactNode }) {
  const [ultimosChainsawMan, setUltimoChainsawMan] = useState<Personaje | null>(null);
  const [ultimosDanDaDan,    setUltimoDanDaDan]    = useState<Personaje | null>(null);
  const [ultimosCastlevania, setUltimoCastlevania] = useState<Personaje | null>(null);
  const [ultimosPorCategoria, setUltimosPorCategoria] = useState<Record<number, PersonajeUsuario>>({});

  const setUltimoCategoria = (p: PersonajeUsuario) => {
    setUltimosPorCategoria(prev => ({ ...prev, [p.categoria_id]: p }));
  };

  return (
    <AnimeContext.Provider value={{
      ultimosChainsawMan, setUltimoChainsawMan,
      ultimosDanDaDan,    setUltimoDanDaDan,
      ultimosCastlevania, setUltimoCastlevania,
      ultimosPorCategoria, setUltimoCategoria,
    }}>
      {children}
    </AnimeContext.Provider>
  );
}
