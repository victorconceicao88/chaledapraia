"use client";
import { useState, useContext, useEffect, useRef } from 'react';
import { FiPlus, FiCheck, FiUser, FiClock, FiLogOut, FiLogIn, FiUserPlus, FiX, FiEdit, FiMail, FiMapPin, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import Image from 'next/image';
import { CartContext } from '../contexts/CartContext';
import { menuItems } from '../data/menuItems';
import Header from './Header';
import Footer from './Footer';
import WelcomeModal from './WelcomeModal';
import CarouselCategories from './CarouselCategories';
import Checkout from './Checkout';
import { db } from '../firebase';
import { ref, push, set, onValue, query, orderByChild, equalTo, update } from 'firebase/database';
import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

const auth = getAuth();

// Modal para seleção de opções de carne
const MeatOptionsModal = ({ isOpen, onClose, onConfirm, language }) => {
  const [meatPoint, setMeatPoint] = useState('indiferente');
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-5 text-white text-center">
          <h3 className="text-2xl font-bold">{language?.selectMeatPoint || "Ponto da Carne"}</h3>
          <p className="text-amber-100 mt-1">{language?.selectMeatPointDesc || "Como você prefere sua carne?"}</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div 
              className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                meatPoint === 'bemPassada' 
                  ? 'border-amber-500 bg-amber-50 shadow-md' 
                  : 'border-gray-200 hover:border-amber-300'
              }`}
              onClick={() => setMeatPoint('bemPassada')}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                meatPoint === 'bemPassada' 
                  ? 'border-amber-500 bg-amber-500 text-white' 
                  : 'border-gray-300'
              }`}>
                {meatPoint === 'bemPassada' && <FiCheck size={14} />}
              </div>
              <div>
                <span className="font-medium">{language?.wellDone || "Bem Passada"}</span>
                <p className="text-sm text-gray-500 mt-1">{language?.wellDoneDesc || "Carne totalmente coazida"}</p>
              </div>
            </div>
            
            <div 
              className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                meatPoint === 'media' 
                  ? 'border-amber-500 bg-amber-50 shadow-md' 
                  : 'border-gray-200 hover:border-amber-300'
              }`}
              onClick={() => setMeatPoint('media')}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                meatPoint === 'media' 
                  ? 'border-amber-500 bg-amber-500 text-white' 
                  : 'border-gray-300'
              }`}>
                {meatPoint === 'media' && <FiCheck size={14} />}
              </div>
              <div>
                <span className="font-medium">{language?.medium || "Média"}</span>
                <p className="text-sm text-gray-500 mt-1">{language?.mediumDesc || "Levemente rosada no centro"}</p>
              </div>
            </div>
            
            <div 
              className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                meatPoint === 'malPassada' 
                  ? 'border-amber-500 bg-amber-50 shadow-md' 
                  : 'border-gray-200 hover:border-amber-300'
              }`}
              onClick={() => setMeatPoint('malPassada')}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                meatPoint === 'malPassada' 
                  ? 'border-amber-500 bg-amber-500 text-white' 
                  : 'border-gray-300'
              }`}>
                {meatPoint === 'malPassada' && <FiCheck size={14} />}
              </div>
              <div>
                <span className="font-medium">{language?.rare || "Mal Passada"}</span>
                <p className="text-sm text-gray-500 mt-1">{language?.rareDesc || "Bem vermelha por dentro"}</p>
              </div>
            </div>
            
            <div 
              className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                meatPoint === 'indiferente' 
                  ? 'border-amber-500 bg-amber-50 shadow-md' 
                  : 'border-gray-200 hover:border-amber-300'
              }`}
              onClick={() => setMeatPoint('indiferente')}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                meatPoint === 'indiferente' 
                  ? 'border-amber-500 bg-amber-500 text-white' 
                  : 'border-gray-300'
              }`}>
                {meatPoint === 'indiferente' && <FiCheck size={14} />}
              </div>
              <div>
                <span className="font-medium">{language?.indifferent || "Indiferente"}</span>
                <p className="text-sm text-gray-500 mt-1">{language?.indifferentDesc || "O chef decide o melhor ponto"}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between p-6 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            {language?.cancel || "Cancelar"}
          </button>
          <button 
            onClick={() => onConfirm(meatPoint)}
            className="px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium flex items-center"
          >
            <FiCheck className="mr-2" />
            {language?.confirm || "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal para seleção de acompanhamentos
const SideDishModal = ({ isOpen, onClose, onConfirm, language }) => {
  const [selectedSides, setSelectedSides] = useState([]);
  
  const sideDishes = [
    { id: 'rice', name: "Arroz", icon: "🍚" },
    { id: 'beans', name: "Feijão", icon: "🥘" },
    { id: 'potato', name: "Batata", icon: "🥔" },
    { id: 'salad', name: "Salada", icon: "🥗" }
  ];
  
  const toggleSideDish = (id) => {
    if (selectedSides.includes(id)) {
      setSelectedSides(selectedSides.filter(item => item !== id));
    } else if (selectedSides.length < 3) {
      setSelectedSides([...selectedSides, id]);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-5 text-white text-center">
          <h3 className="text-2xl font-bold">Acompanhamentos</h3>
          <p className="text-green-100 mt-1">
            Máximo 3 seleções
          </p>
          <div className="mt-2 bg-green-400 bg-opacity-30 rounded-full px-3 py-1 inline-block">
            <span className="text-sm font-medium">
              {selectedSides.length}/3 selecionados
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {sideDishes.map(side => {
              const isSelected = selectedSides.includes(side.id);
              const isDisabled = !isSelected && selectedSides.length >= 3;
              
              return (
                <div 
                  key={side.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center ${
                    isSelected 
                      ? 'border-green-500 bg-green-50 shadow-md' 
                      : isDisabled
                        ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
                        : 'border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => !isDisabled && toggleSideDish(side.id)}
                >
                  <span className="text-2xl mb-2">{side.icon}</span>
                  <span className="font-medium text-sm">{side.name}</span>
                  {isSelected && (
                    <div className="mt-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <FiCheck size={12} className="text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {selectedSides.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Sua seleção:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSides.map(sideId => {
                  const side = sideDishes.find(s => s.id === sideId);
                  return (
                    <span key={sideId} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
                      {side.icon} {side.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between p-6 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onConfirm(selectedSides)}
            disabled={selectedSides.length === 0}
            className="px-5 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center"
          >
            <FiCheck className="mr-2" />
            Confirmar Seleção
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de confirmação de pedido
const OrderConfirmationModal = ({ isOpen, onClose, orderNumber, onViewHistory, language }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-5 text-white text-center">
          <h3 className="text-2xl font-bold">🎉 Pedido Confirmado!</h3>
          <p className="text-green-100 mt-1">Seu pedido foi realizado com sucesso</p>
        </div>
        
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-green-600 text-2xl" />
          </div>
          
          <h4 className="text-lg font-bold text-gray-800 mb-2">Número do Pedido</h4>
          <p className="text-2xl font-mono text-green-600 mb-6">{orderNumber}</p>
          
          <p className="text-gray-600 mb-6">
            Seu pedido já está sendo preparado. Você pode acompanhar o status na seção de histórico.
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={onViewHistory}
              className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
            >
              <FiClock className="mr-2" />
              Ver Histórico de Pedidos
            </button>
            <button 
              onClick={onClose}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Continuar Comprando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal de sucesso de criação de conta
const AccountCreatedModal = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-5 text-white text-center">
          <h3 className="text-2xl font-bold">🎉 Conta Criada!</h3>
          <p className="text-green-100 mt-1">Sua conta foi criada com sucesso</p>
        </div>
        
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-green-600 text-2xl" />
          </div>
          
          <p className="text-gray-600 mb-6">
            Sua conta foi criada com sucesso. Agora você pode fazer pedidos e acompanhar seu histórico.
          </p>
          
          <button 
            onClick={onClose}
            className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors font-medium"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal para redefinição de senha
const ForgotPasswordModal = ({ isOpen, onClose, language }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSendResetLink = async () => {
    setIsLoading(true);
    setError('');
    
    if (!email) {
      setError('Por favor, insira seu email');
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Link de redefinição enviado para seu email!');
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      setError(error.message || 'Erro ao enviar email de redefinição');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 text-white text-center">
          <h3 className="text-2xl font-bold">Redefinir Senha</h3>
          <p className="text-blue-100 mt-1">Digite seu email para redefinir sua senha</p>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg mb-4 text-sm">
              {successMessage}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="seu@email.com"
              />
            </div>
            
            <button
              onClick={handleSendResetLink}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                'Enviar Link de Redefinição'
              )}
            </button>
          </div>
        </div>
        
        <div className="flex justify-between p-6 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de autenticação obrigatória para finalizar pedido
const AuthRequiredModal = ({ isOpen, onClose, onRegister, language }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#4ba7b1] to-[#2f4a55] p-5 text-white text-center">
          <h3 className="text-2xl font-bold">Autenticação Necessária</h3>
          <p className="text-blue-100 mt-1">Você precisa estar logado para efetuar um pedido</p>
        </div>
        
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="text-blue-600 text-2xl" />
          </div>
          
          <p className="text-gray-600 mb-6">
            Para finalizar seu pedido e acompanhar seu histórico, é necessário ter uma conta em nosso sistema.
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={onRegister}
              className="w-full bg-[#4ba7b1] text-white py-3 rounded-xl hover:bg-[#3d8e97] transition-colors font-medium flex items-center justify-center"
            >
              <FiUserPlus className="mr-2" />
              Criar Conta
            </button>
            <button 
              onClick={onClose}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Continuar Navegando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal de autenticação
const AuthModal = ({ isOpen, onClose, onLogin, onRegister, language, isLoginMode, setIsLoginMode, authError, onForgotPassword, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        postalCode: '',
        city: '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [isOpen, isLoginMode]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoginMode) {
      onLogin(formData.email, formData.password);
    } else {
      if (formData.password !== formData.confirmPassword) {
        setAuthError("As senhas não coincidem");
        return;
      }
      onRegister(formData);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#4ba7b1] to-[#2f4a55] p-5 text-white text-center">
          <h3 className="text-2xl font-bold">
            {isLoginMode ? 'Entrar na Minha Conta' : 'Criar Nova Conta'}
          </h3>
          <p className="text-blue-100 mt-1">
            {isLoginMode ? 'Acesse seu histórico de pedidos' : 'Cadastre-se em segundos'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {authError}
            </div>
          )}
          
          {!isLoginMode && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required={!isLoginMode}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1]"
                placeholder="Seu nome completo"
              />
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1]"
              placeholder="seu@email.com"
            />
          </div>
          
          {!isLoginMode && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone*</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required={!isLoginMode}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1]"
                  placeholder="912 345 678"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço*</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required={!isLoginMode}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1]"
                  placeholder="Rua, número, andar"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal*</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required={!isLoginMode}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1]"
                    placeholder="0000-000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade*</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required={!isLoginMode}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1]"
                    placeholder="Sua cidade"
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha*</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1] pr-10"
                placeholder="Sua senha"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
          
          {!isLoginMode && (
            <div className="mb-6 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha*</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLoginMode}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1] pr-10"
                  placeholder="Digite novamente sua senha"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
          )}
          
          {isLoginMode && (
            <div className="mb-4 text-right">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-[#4ba7b1] hover:text-[#2f4a55]"
              >
                Esqueceu sua senha?
              </button>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#4ba7b1] text-white py-3 rounded-lg hover:bg-[#3d8e97] transition-colors font-medium mb-4 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLoginMode ? 'Entrando...' : 'Criando conta...'}
              </>
            ) : (
              isLoginMode ? 'Entrar' : 'Criar Conta'
            )}
          </button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-[#4ba7b1] hover:text-[#2f4a55] text-sm"
            >
              {isLoginMode ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
            </button>
          </div>
        </form>
        
        <div className="flex justify-between p-6 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de perfil do usuário
const UserProfileModal = ({ isOpen, onClose, user, onUpdateProfile, language }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    postalCode: user?.postalCode || '',
    city: user?.city || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        postalCode: user.postalCode || '',
        city: user.city || ''
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#4ba7b1] to-[#2f4a55] p-5 text-white text-center">
          <h3 className="text-2xl font-bold">Meu Perfil</h3>
          <p className="text-blue-100 mt-1">Atualize seus dados pessoais</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1]"
              placeholder="Seu nome completo"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="flex items-center p-3 bg-gray-100 rounded-lg">
              <FiMail className="text-gray-500 mr-2" />
              <span className="text-gray-700">{user?.email}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1] pl-10"
                placeholder="912 345 678"
              />
              <FiPhone className="absolute left-3 top-3.5 text-gray-500" />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <div className="relative">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1] pl-10"
                placeholder="Rua, número, andar"
              />
              <FiMapPin className="absolute left-3 top-3.5 text-gray-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1]"
                placeholder="0000-000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1]"
                placeholder="Sua cidade"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#4ba7b1] text-white py-3 rounded-lg hover:bg-[#3d8e97] transition-colors font-medium mb-4"
          >
            <FiCheck className="inline mr-2" />
            Salvar Alterações
          </button>
        </form>
        
        <div className="flex justify-between p-6 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente de histórico de pedidos
const OrderHistory = ({ isOpen, onClose, orders, language, user }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'entregue': return 'bg-green-100 text-green-800';
      case 'preparando': return 'bg-yellow-100 text-yellow-800';
      case 'a caminho': return 'bg-blue-100 text-blue-800';
      case 'pendente': return 'bg-gray-100 text-gray-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-[#4ba7b1] to-[#2f4a55] p-5 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold">Histórico de Pedidos</h3>
              <p className="text-purple-100 mt-1">Olá, {user?.name}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#3d8e97] transition-colors"
            >
              <FiX className="text-white" size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiClock className="text-gray-400 text-3xl" />
              </div>
              <h4 className="text-lg font-semibold text-gray-600 mb-2">Nenhum pedido encontrado</h4>
              <p className="text-gray-500">Seus pedidos aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.orderNumber} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">Pedido {order.orderNumber}</h4>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Itens</h5>
                      <ul className="text-sm text-gray-600">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span>€{(item.price * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Informações</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Total:</strong> €{order.total?.toFixed(2) || '0.00'}</p>
                        <p><strong>Entrega:</strong> {order.orderType === 'delivery' ? 'Delivery' : 'Retirada'}</p>
                        <p><strong>Pagamento:</strong> {order.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                  
                  {order.orderNotes && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Observações</h5>
                      <p className="text-sm text-gray-600">{order.orderNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InterfaceCliente = ({ language = {}, languageCode = 'pt' }) => {
  const [activeCategory, setActiveCategory] = useState(Object.keys(menuItems)[0]);
  const { addToCart, cart, calculateTotal, clearCart, removeFromCart } = useContext(CartContext);
  const [showModal, setShowModal] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [clickedItems, setClickedItems] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMeatOptions, setShowMeatOptions] = useState(false);
  const [showSideDishOptions, setShowSideDishOptions] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [categoryImages, setCategoryImages] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authError, setAuthError] = useState('');
  const [user, setUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showAuthRequired, setShowAuthRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAccountCreated, setShowAccountCreated] = useState(false);

  // Carregar imagens das categorias do Firebase
  useEffect(() => {
    const categoriasRef = ref(db, 'categories');
    const unsubscribe = onValue(categoriasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const imagens = {};
        Object.keys(data).forEach(categoriaId => {
          imagens[categoriaId] = data[categoriaId].image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c`;
        });
        setCategoryImages(imagens);
      }
    });

    return () => unsubscribe();
  }, []);

  // Verificar se usuário está logado ao carregar
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        loadUserOrders(userData.email);
      } catch (e) {
        console.error('Erro ao carregar usuário:', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Carregar pedidos do usuário
  const loadUserOrders = (userEmail) => {
    const ordersRef = ref(db, 'orders');
    const userOrdersQuery = query(ordersRef, orderByChild('email'), equalTo(userEmail));
    
    onValue(userOrdersQuery, (snapshot) => {
      const ordersData = snapshot.val();
      if (ordersData) {
        const ordersArray = Object.keys(ordersData).map(key => ({
          id: key,
          ...ordersData[key]
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setUserOrders(ordersArray);
      } else {
        setUserOrders([]);
      }
    });
  };

  // Funções de autenticação
const handleLogin = async (email, password) => {
  setIsLoading(true);
  setAuthError('');
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Buscar dados adicionais do usuário no Realtime Database
    const userRef = ref(db, `users/${user.uid}`);
    onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        const completeUser = { ...userData, id: user.uid, email: user.email };
        setUser(completeUser);
        localStorage.setItem('user', JSON.stringify(completeUser));
        loadUserOrders(user.email);
      }
    }, { onlyOnce: true });
    
    setShowAuthModal(false);
  } catch (error) {
    setAuthError(getAuthErrorMessage(error.code));
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  import('firebase/auth').then(({ getAuth, onAuthStateChanged }) => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if (userData) {
            const completeUser = { ...userData, id: user.uid, email: user.email };
            setUser(completeUser);
            localStorage.setItem('user', JSON.stringify(completeUser));
            loadUserOrders(user.email);
          }
        });
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    });
    return () => unsubscribe();
  });
}, []);

const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/user-not-found': 'Usuário não encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/email-already-in-use': 'Email já está em uso',
    'auth/invalid-email': 'Email inválido',
    'auth/weak-password': 'Senha muito fraca',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.'
  };
  
  return errorMessages[errorCode] || 'Erro de autenticação';
};

const handleRegister = async (userData) => {
  setIsLoading(true);
  setAuthError('');
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const user = userCredential.user;
    
    // Salvar dados adicionais no Realtime Database
    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, {
      name: userData.name,
      phone: userData.phone,
      address: userData.address,
      postalCode: userData.postalCode,
      city: userData.city,
      createdAt: new Date().toISOString()
    });
    
    const newUser = {
      id: user.uid,
      email: user.email,
      ...userData
    };
    
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setShowAccountCreated(true);
    loadUserOrders(user.email);
  } catch (error) {
    setAuthError(getAuthErrorMessage(error.code));
  } finally {
    setIsLoading(false);
  }
};

  const handleUpdateProfile = async (profileData) => {
    try {
      if (!user || !user.id) return;
      
      const userRef = ref(db, `users/${user.id}`);
      await update(userRef, {
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        postalCode: profileData.postalCode,
        city: profileData.city
      });
      
      const updatedUser = {
        ...user,
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        postalCode: profileData.postalCode,
        city: profileData.city
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShowUserProfile(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUserOrders([]);
    localStorage.removeItem('user');
  };

  const handleForgotPassword = () => {
    setShowAuthModal(false);
    setShowForgotPassword(true);
  };

  // Identificar pratos que precisam de seleção de ponto da carne
  const meatItems = ['picanha', 'maminha', 'picanhaSnack'];

  // Função auxiliar para verificar se é um item de massa
  const isPastaItem = (item) => {
    return item.id.includes('massa') || 
           item.name.toLowerCase().includes('massa') ||
           item.id.includes('pasta') || 
           item.name.toLowerCase().includes('pasta') ||
           item.id.includes('spaghetti') || 
           item.name.toLowerCase().includes('spaghetti') ||
           item.id.includes('lasanha') || 
           item.name.toLowerCase().includes('lasanha') ||
           item.id.includes('macarrao') || 
           item.name.toLowerCase().includes('macarrao');
  };

  const handleAddToCart = (item) => {
    setCurrentItem(item);
    
    // Verificar se é um prato que precisa de seleção de ponto da carne
    if (meatItems.includes(item.id)) {
      setShowMeatOptions(true);
      return;
    }
    
    // Verificar se é um prato principal que precisa de seleção de acompanhamentos
    if (activeCategory === 'mainCourses' && !item.noSides && !isPastaItem(item)) {
      setShowSideDishOptions(true);
      return;
    }
    
    // Se não precisa de opções especiais, adiciona diretamente ao carrinho
    addToCart(item.id, 1, item.name, item.price);
    setClickedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => setClickedItems(prev => ({ ...prev, [item.id]: false })), 1000);
  };

  const handleMeatPointConfirm = (meatPoint) => {
    if (!currentItem) return;
    
    setCurrentItem({
      ...currentItem,
      options: { meatPoint }
    });
    
    setShowMeatOptions(false);
    
    // Para pratos principais, mostrar opções de acompanhamento apenas se não tiver noSides
    if (activeCategory === 'mainCourses' && !currentItem.noSides) {
      setShowSideDishOptions(true);
      return;
    }
    
    // Se não precisa de acompanhamentos, adicionar ao carrinho agora
    addToCart(
      currentItem.id, 
      1, 
      `${currentItem.name} (${meatPoint})`, 
      currentItem.price,
      { meatPoint }
    );
    setClickedItems(prev => ({ ...prev, [currentItem.id]: true }));
    setTimeout(() => setClickedItems(prev => ({ ...prev, [currentItem.id]: false })), 1000);
    setCurrentItem(null);
  };

  const handleSideDishConfirm = (selectedSides) => {
    if (!currentItem) {
      console.error("Item atual não definido");
      setShowSideDishOptions(false);
      return;
    }

    const sidesText = selectedSides.map(side => {
      const sideNames = {
        rice: "Arroz",
        beans: "Feijão",
        potato: "Batata",
        salad: "Salada"
      };
      return sideNames[side] || side;
    }).join(', ');

    // Adicionar o item completo com TODAS as opções
    addToCart(
      currentItem.id, 
      1, 
      `${currentItem.name} (${currentItem.options?.meatPoint || 'indiferente'}) com ${sidesText}`, 
      currentItem.price,
      { 
        ...(currentItem.options || {}),
        sides: selectedSides 
      }
    );
    
    setClickedItems(prev => ({ ...prev, [currentItem.id]: true }));
    setTimeout(() => setClickedItems(prev => ({ ...prev, [currentItem.id]: false })), 1000);
    setShowSideDishOptions(false);
    setCurrentItem(null);
  };

  const submitOrder = async (orderData) => {
    // Verificar se o usuário está logado
    if (!user) {
      setShowCheckout(false);
      setShowAuthRequired(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const ordersRef = ref(db, 'orders');
      const newOrderRef = push(ordersRef);
      const orderNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;
      
      const orderWithUser = {
        ...orderData,
        userId: user?.id,
        userEmail: user?.email,
        userName: user?.name,
        userPhone: user?.phone,
        userAddress: user?.address,
        userPostalCode: user?.postalCode,
        userCity: user?.city,
        createdAt: new Date().toISOString(),
        status: 'pendente',
        orderNumber
      };
      
      await set(newOrderRef, orderWithUser);
      clearCart();
      setShowCheckout(false);
      setLastOrderNumber(orderNumber);
      setShowConfirmationModal(true);
      
      // Recarregar pedidos do usuário
      if (user?.email) {
        loadUserOrders(user.email);
      }
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      alert(language?.orderError || 'Erro ao enviar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = calculateTotal();

  // CORREÇÃO: Verificar if menuItems[activeCategory] é um array antes de mapear
  const currentMenuItems = menuItems[activeCategory];
  const isArray = Array.isArray(currentMenuItems);

  // Função auxiliar para extrair o nome do item de forma segura
  const getItemName = (item) => {
    const itemTranslation = language?.items?.[item.id];
    if (typeof itemTranslation === 'string') return itemTranslation;
    if (itemTranslation && typeof itemTranslation === 'object' && 'name' in itemTranslation) {
      return itemTranslation.name;
    }
    if (itemTranslation && typeof itemTranslation === 'object' && 'text' in itemTranslation) {
      return itemTranslation.text;
    }
    if (itemTranslation && typeof itemTranslation === 'object' && 'title' in itemTranslation) {
      return itemTranslation.title;
    }
    return item.name || "Item sem nome";
  };

  // Função auxiliar para extrair a descrição do item de forma segura
  const getItemDescription = (item) => {
    const itemDescTranslation = language?.items?.[`${item.id}Desc`];
    if (typeof itemDescTranslation === 'string') return itemDescTranslation;
    if (itemDescTranslation && typeof itemDescTranslation === 'object' && 'description' in itemDescTranslation) {
      return itemDescTranslation.description;
    }
    if (itemDescTranslation && typeof itemDescTranslation === 'object' && 'desc' in itemDescTranslation) {
      return itemDescTranslation.desc;
    }
    if (itemDescTranslation && typeof itemDescTranslation === 'object' && 'text' in itemDescTranslation) {
      return itemDescTranslation.text;
    }
    return item.description || "";
  };

  // Função segura para obter nome da categoria
  const getCategoryName = (category) => {
    const categoryName = language?.menu?.[category];
    return typeof categoryName === 'string' ? categoryName : category;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header 
        language={language} 
        onCartClick={() => {
          if (cart.length === 0) return;
          setShowCheckout(true);
        }}
        user={user}
        onLoginClick={() => {
          setShowAuthModal(true);
          setIsLoginMode(true);
        }}
        onLogoutClick={handleLogout}
        onHistoryClick={() => {
          if (!user) {
            setShowAuthRequired(true);
            return;
          }
          setShowOrderHistory(true);
        }}
        onProfileClick={() => {
          if (!user) {
            setShowAuthRequired(true);
            return;
          }
          setShowUserProfile(true);
        }}
      />
      
      <main className="flex-grow w-full mx-auto px-0 pb-20 md:pb-24 mt-20">
        {showCheckout && (
          <Checkout 
            language={language} 
            onClose={() => setShowCheckout(false)} 
            onSubmit={submitOrder}
            totalItems={totalItems}
            totalAmount={totalAmount}
            isSubmitting={isSubmitting}
            user={user}
          />
        )}

        <MeatOptionsModal
          isOpen={showMeatOptions}
          onClose={() => {
            setShowMeatOptions(false);
            setCurrentItem(null);
          }}
          onConfirm={handleMeatPointConfirm}
          language={language}
        />

        <SideDishModal
          isOpen={showSideDishOptions}
          onClose={() => {
            setShowSideDishOptions(false);
            setCurrentItem(null);
          }}
          onConfirm={handleSideDishConfirm}
          language={language}
        />

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            setAuthError('');
          }}
          onLogin={handleLogin}
          onRegister={handleRegister}
          language={language}
          isLoginMode={isLoginMode}
          setIsLoginMode={setIsLoginMode}
          authError={authError}
          onForgotPassword={handleForgotPassword}
          isLoading={isLoading}
        />

        <AccountCreatedModal
          isOpen={showAccountCreated}
          onClose={() => setShowAccountCreated(false)}
          language={language}
        />

        <AuthRequiredModal
          isOpen={showAuthRequired}
          onClose={() => setShowAuthRequired(false)}
          onRegister={() => {
            setShowAuthRequired(false);
            setShowAuthModal(true);
            setIsLoginMode(false);
          }}
          language={language}
        />

        <ForgotPasswordModal
          isOpen={showForgotPassword}
          onClose={() => {
            setShowForgotPassword(false);
            setShowAuthModal(true);
          }}
          language={language}
        />

        <UserProfileModal
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          user={user}
          onUpdateProfile={handleUpdateProfile}
          language={language}
        />

        <OrderHistory
          isOpen={showOrderHistory}
          onClose={() => setShowOrderHistory(false)}
          orders={userOrders}
          language={language}
          user={user}
        />

        <OrderConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onViewHistory={() => {
            setShowConfirmationModal(false);
            setShowOrderHistory(true);
          }}
          orderNumber={lastOrderNumber}
          language={language}
        />

        <div className="mb-3 w-full overflow-hidden px-0">
          <CarouselCategories 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory} 
            language={language}
            categories={Object.keys(menuItems)}
          />
        </div>

        <div className="relative w-full h-48 md:h-64 lg:h-80 mb-6 bg-gray-200">
          {categoryImages[activeCategory] ? (
            <Image
              src={categoryImages[activeCategory]}
              alt={getCategoryName(activeCategory)}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-300 animate-pulse flex items-center justify-center">
              <span className="text-gray-500">Carregando imagem...</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
              {getCategoryName(activeCategory)}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {isArray ? (
            currentMenuItems.map((item) => {
              const itemName = getItemName(item);
              const itemDescription = getItemDescription(item);

              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl border border-[#4ba7b1] shadow-sm hover:shadow-md transition-all duration-200 hover:translate-y-[-2px] p-4"
                  style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {item.icon || '🍽️'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 break-words">
                          {itemName}
                        </h3>
                        {itemDescription && (
                          <p className="text-sm text-gray-500 mt-1 leading-snug">
                            {itemDescription}
                          </p>
                        )}
                       {(activeCategory === 'mainCourses' || activeCategory === 'otherDishes') && 
                          !item.noSides && 
                          !isPastaItem(item) && (
                            <p className="text-xs text-green-600 mt-1">
                              {typeof language?.includesSides === "string"
                                ? language.includesSides
                                : "Acompanha arroz, feijão, batata e salada"}
                            </p>
                          )}
                        {meatItems.includes(item.id) && (
                          <p className="text-xs text-amber-600 mt-1 flex items-center">
                            <span className="inline-flex mr-1">🥩</span>
                            {typeof language?.selectMeatPointOption === "string"
                              ? language.selectMeatPointOption
                              : "Selecionar ponto da carne"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-base font-bold text-green-600">
                        {item.price.toFixed(2)}€
                      </span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`flex items-center gap-2 ${
                          clickedItems[item.id] ? 'bg-[#52be87]' : 'bg-[#bbd3d8] hover:bg-[#a8c6d1]'
                        } text-white font-semibold px-4 py-2 rounded-full border border-[#4ba7b1] transition-all duration-200`}
                      >
                        {clickedItems[item.id] ? (
                          <FiCheck size={16} className="animate-pulse" />
                        ) : (
                          <FiPlus size={16} />
                        )}
                        {typeof language?.addToCart === "string"
                          ? language.addToCart
                          : "Adicionar"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">
                {typeof language?.noItems === "string"
                  ? language.noItems
                  : "Nenhum item disponível nesta categoria."}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer language={language} />
      {showModal && <WelcomeModal language={language} onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default InterfaceCliente;