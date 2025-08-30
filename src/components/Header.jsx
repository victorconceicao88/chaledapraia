"use client";
import { useState, useContext, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiUser, FiGlobe, FiChevronDown, FiShoppingCart, FiLogOut, FiClock, FiEdit,FiLogIn, FiUserPlus  } from 'react-icons/fi';
import { CartContext } from '../contexts/CartContext';


const Header = ({ 
  language = 'pt', 
  setLanguage = () => {}, 
  onCartClick = () => {}, 
  user = null, 
  onLoginClick = () => {}, 
  onLogoutClick = () => {}, 
  onHistoryClick = () => {}, 
  onProfileClick = () => {} 
}) => {
  const { totalItems = 0 } = useContext(CartContext) || {};
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const languageRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => setIsLanguageOpen(!isLanguageOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg py-2' : 'bg-white shadow-md py-3'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* LOGO + NOME */}
          <div className="flex items-center space-x-3">
            <div className="block sm:block">
              <h1 className="text-xl sm:text-3xl font-signature text-[#2f4a55] leading-none">Chalé da Praia</h1>
              <p className="text-xs font-brewery text-[#4ba7b1] uppercase tracking-widest leading-none">BEACH BAR</p>
            </div>
          </div>

          {/* AÇÕES */}
          <div className="flex items-center space-x-3 sm:space-x-4">

            {/* LÍNGUAS */}
            <div className="relative" ref={languageRef}>
              <button
                onClick={toggleLanguage}
                className="flex items-center px-2 py-1.5 rounded hover:bg-gray-100 transition"
                aria-label="Selecionar idioma"
              >
                <FiGlobe className="text-gray-600" />
                <span className="ml-1 text-sm text-gray-600">{(language?.code || 'pt').toUpperCase()}</span>
                <FiChevronDown className={`ml-1 transform transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-md z-50">
                  {['pt', 'en', 'es'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setIsLanguageOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        (language === lang || language?.code === lang) ? 'bg-[#e6f4f6] text-[#2f4a55] font-medium' : ''
                      }`}
                    >
                      {lang === 'pt' && '🇧🇷 Português'}
                      {lang === 'en' && '🇺🇸 English'}
                      {lang === 'es' && '🇪🇸 Español'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* USUÁRIO */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={toggleUserMenu}
                className="p-2 rounded-full hover:bg-gray-100 transition flex items-center"
                aria-label="Conta do usuário"
              >
                <FiUser className="text-gray-600 text-lg" />
                {user && (
                  <span className="ml-1 text-xs text-gray-600 hidden sm:block">
                    Olá, {user.name?.split(' ')[0]}
                  </span>
                )}
              </button>

              {isUserMenuOpen && (
  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-md z-50 py-1">
    {user ? (
      <>
        <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
          Logado como <span className="font-medium text-[#2f4a55]">{user.name}</span>
        </div>
        <button
          onClick={() => {
            onProfileClick();
            setIsUserMenuOpen(false);
          }}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center"
        >
          <FiEdit className="mr-2" size={14} />
          Meu Perfil
        </button>
        <button
          onClick={() => {
            onHistoryClick();
            setIsUserMenuOpen(false);
          }}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center"
        >
          <FiClock className="mr-2" size={14} />
          Histórico de Pedidos
        </button>
        <button
          onClick={() => {
            onLogoutClick();
            setIsUserMenuOpen(false);
          }}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center text-red-600"
        >
          <FiLogOut className="mr-2" size={14} />
          Sair
        </button>
      </>
    ) : (
      <button
        onClick={() => {
          onLoginClick();
          setIsUserMenuOpen(false);
        }}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-[#2f4a55] font-medium"
      >
        Fazer Login / Cadastrar
      </button>
    )}
  </div>
)}
            </div>

            {/* CARRINHO */}
            <div className="relative">
              <button
                onClick={onCartClick}
                className="p-2 rounded-full hover:bg-[#2f4a55] transition relative group"
                aria-label="Carrinho de compras"
              >
                <FiShoppingCart className="text-gray-600 text-lg group-hover:text-white" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#2f4a55] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;