"use client";
import { useState } from 'react';
import InterfaceCliente from '../components/interfacecliente';
import pt from '../translations/pt';
import en from '../translations/en';
import es from '../translations/es';

const translations = { pt, en, es };

export default function Home() {
  const [language, setLanguage] = useState('pt');

  return (
    <main>
      <InterfaceCliente 
        language={translations[language]} 
        languageCode={language}
        setLanguage={setLanguage} 
      />
    </main>
  );
}