"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations, Translations } from "./translations";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isPt: boolean;
  isEn: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Default to pt, will hydrate with browser language on mount
  const [language, setLanguageState] = useState<Language>("pt");

  useEffect(() => {
    // 1. Verifica se o usuário já salvou uma preferência manual no localStorage
    const savedLang = localStorage.getItem("streamsync_lang") as Language | null;
    if (savedLang === "pt" || savedLang === "en") {
      setLanguageState(savedLang);
      return;
    }

    // 2. Se não houver preferência salva, detecta o idioma base do navegador
    if (typeof navigator !== "undefined") {
      const browserLang = (navigator.language || navigator.languages?.[0] || "").toLowerCase();
      if (browserLang.startsWith("pt")) {
        setLanguageState("pt");
      } else {
        setLanguageState("en");
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("streamsync_lang", lang);
    }
  };

  const t = translations[language] || translations.pt;

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isPt: language === "pt",
        isEn: language === "en",
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback seguro caso o componente seja renderizado fora do Provider
    return {
      language: "pt" as Language,
      setLanguage: () => {},
      t: translations.pt,
      isPt: true,
      isEn: false,
    };
  }
  return context;
}
