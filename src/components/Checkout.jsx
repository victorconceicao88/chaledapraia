"use client";
import { useContext, useState, useEffect } from 'react';
import { 
  FiShoppingCart, FiPlus, FiMinus, FiX, FiCreditCard, 
  FiSmartphone, FiHome, FiTruck, FiUser, FiPhone, 
  FiMapPin, FiMail, FiFileText, FiEdit2, FiCheck,
  FiArrowLeft, FiInfo, FiTrash2, FiClock
} from 'react-icons/fi';
import { FaCcVisa, FaCcMastercard, FaMobileAlt, FaReceipt } from 'react-icons/fa';
import { CartContext } from '../contexts/CartContext';

const Checkout = ({ language, onClose, totalItems, totalAmount, onSubmit, isSubmitting , user }) => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const [currentStep, setCurrentStep] = useState(0);
  const [orderType, setOrderType] = useState('');
  const [needsInvoice, setNeedsInvoice] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderNumber] = useState(`#${Math.floor(1000 + Math.random() * 9000)}`);
  const [showNIF, setShowNIF] = useState(false);
  const [changeFor, setChangeFor] = useState('');
  const [mbwayNumber, setMbwayNumber] = useState('');
  
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    postalCode: '',
    city: '',
    nif: ''
  });

    useEffect(() => {
    if (user) {
      setClientData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        postalCode: user.postalCode || '',
        city: user.city || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (needsInvoice && clientData.nif) {
      setShowNIF(true);
    }
  }, [needsInvoice, clientData.nif]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientData(prev => ({ ...prev, [name]: value }));
  };



  const handleSubmitOrder = async () => {
    const deliveryFee = orderType === 'delivery' ? 2.5 : 0;
    const finalTotal = totalAmount + deliveryFee;

    const orderData = {
      ...clientData,
      orderType,
      paymentMethod,
      paymentDetails: paymentMethod === 'mbway' ? { mbwayNumber } : null,
      needsInvoice,
      orderNotes,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        options: item.options || {}
      })),
      total: finalTotal,
      deliveryFee,
      status: "pendente",
      createdAt: new Date().toISOString(),
      orderNumber,
      ...(paymentMethod === 'cash' && changeFor && { 
        changeFor: parseFloat(changeFor),
        changeAmount: (parseFloat(changeFor) - finalTotal).toFixed(2)
      })
    };

    onSubmit(orderData);
  };

  const deliveryFee = orderType === 'delivery' ? 2.5 : 0;
  const finalTotal = totalAmount + deliveryFee;

  const getProgressPercentage = () => {
    switch(currentStep) {
      case 0: return 0;
      case 1: return 25;
      case 2: return 50;
      case 3: return 75;
      case 4: return 100;
      default: return 0;
    }
  };

  // Função para atualizar quantidade considerando opções
  const handleUpdateQuantity = (item, newQuantity) => {
    updateQuantity(item.id, newQuantity, item.options);
  };

  // Função para remover item considerando opções
  const handleRemoveFromCart = (item) => {
    removeFromCart(item.id, item.options);
  };

  // Função auxiliar para obter texto de forma segura
  const getText = (key, defaultValue) => {
    const value = language?.[key];
    return typeof value === 'string' ? value : defaultValue;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50 flex justify-center items-start pt-4 sm:pt-10 md:pt-20 px-2 sm:px-0">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto mb-10 relative" 
           style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <button 
          onClick={onClose} 
          className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-50"
          aria-label="Fechar"
        >
          <FiX size={24} />
        </button>

        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
              <FiShoppingCart className="mr-2" />
              {getText('cart', "Carrinho")}
            </h2>
            <div className="bg-blue-100 text-blue-800 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
              {totalItems} {totalItems === 1 ? getText('item', 'item') : getText('items', 'itens')}
            </div>
          </div>

          {currentStep < 4 && (
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  {currentStep === 0 && getText('orderSummary', 'Resumo do Pedido')}
                  {currentStep === 1 && getText('deliveryType', 'Tipo de Entrega')}
                  {currentStep === 2 && getText('yourData', 'Seus Dados')}
                  {currentStep === 3 && getText('payment', 'Pagamento')}
                </span>
                <span className="text-xs sm:text-sm font-medium text-blue-600">
                  {getText('step', 'Passo')} {Math.max(currentStep, 1)} {getText('of', 'de')} 4
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                <div 
                  className="bg-blue-600 h-2 sm:h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Step 0: Order Summary */}
          {currentStep === 0 && (
            <div className="mb-6 sm:mb-8 animate-fadeIn">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">
                {getText('orderSummary', "Resumo do Seu Pedido")}
              </h3>
              
              <div className="border rounded-lg overflow-hidden mb-4 sm:mb-6">
                {cart.map((item, index) => (
                  <div key={index} className="border-b last:border-b-0">
                    <div className="flex justify-between items-center p-3 sm:p-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate">{item.name.split('(')[0].trim()}</h4>
                        <p className="text-gray-600 text-xs sm:text-sm">
                          €{item.price.toFixed(2)} {getText('each', "cada")}
                        </p>
                        {/* No Checkout component, dentro do map que exibe os itens do carrinho */}
                        {item.options && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.options.meatPoint && (
                              <div className="mb-1">
                                <strong>{getText('meatPoint', "Ponto")}:</strong> {item.options.meatPoint === 'malPassada' ? 'Mal Passada' : item.options.meatPoint === 'bemPassada' ? 'Bem Passada' : item.options.meatPoint === 'media' ? 'Média' : item.options.meatPoint === 'indiferente' ? 'Indiferente' : item.options.meatPoint}
                              </div>
                            )}
                            {item.options.sides && item.options.sides.length > 0 && (
                              <div>
                                <strong>{getText('sides', "Acompanhamentos")}:</strong>{" "}
                                {item.options.sides.map(side => {
                                  const sideNames = {
                                    rice: "Arroz",
                                    beans: "Feijão", 
                                    potato: "Batata",
                                    salad: "Salada"
                                  };
                                  return sideNames[side] || side;
                                }).join(', ')}
                              </div>
                            )}
                          </div>
                        )}


                      </div>
                      
                      <div className="flex items-center space-x-2 sm:space-x-3 ml-2">
                        <button 
                          onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          aria-label={getText('decreaseQuantity', "Reduzir quantidade")}
                        >
                          <FiMinus size={12} className="sm:w-4" />
                        </button>
                        
                        <span className="font-medium w-4 sm:w-6 text-center text-sm sm:text-base">{item.quantity}</span>
                        
                        <button 
                          onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          aria-label={getText('increaseQuantity', "Aumentar quantidade")}
                        >
                          <FiPlus size={12} className="sm:w-4" />
                        </button>
                        
                        <button 
                          onClick={() => handleRemoveFromCart(item)}
                          className="ml-2 sm:ml-4 text-red-500 hover:text-red-700 transition-colors"
                          aria-label={getText('removeItem', "Remover item")}
                        >
                          <FiTrash2 size={16} className="sm:w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-500">{getText('subtotal', "Subtotal")}</span>
                      <span className="font-medium text-sm sm:text-base">€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 text-sm sm:text-base">{getText('subtotal', "Subtotal")}</span>
                  <span className="font-medium text-sm sm:text-base">€{totalAmount.toFixed(2)}</span>
                </div>
                
                {orderType && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 text-sm sm:text-base">
                      {orderType === 'delivery' 
                        ? getText('deliveryFee', 'Taxa de Entrega') 
                        : getText('pickup', 'Retirada')}
                    </span>
                    <span className="font-medium text-sm sm:text-base">
                      {orderType === 'delivery' ? '€2.50' : getText('free', 'Grátis')}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between pt-3 border-t border-gray-200 mt-2">
                  <span className="font-bold text-sm sm:text-base">{getText('total', "Total")}</span>
                  <span className="font-bold text-base sm:text-lg">
                    €{orderType ? finalTotal.toFixed(2) : totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                >
                  {getText('continue', "Continuar")}
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Order Type */}
          {currentStep === 1 && (
            <div className="mb-6 sm:mb-8 animate-fadeIn">
              <div className="flex items-center mb-4 sm:mb-6">
                <button
                  onClick={() => setCurrentStep(0)}
                  className="mr-3 sm:mr-4 p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label={getText('back', "Voltar")}
                >
                  <FiArrowLeft className="text-gray-600" size={20} />
                </button>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {getText('howToReceive', "Como deseja receber seu pedido?")}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <button
                  onClick={() => setOrderType('delivery')}
                  className={`p-4 sm:p-6 rounded-xl border-2 transition-all flex flex-col items-center text-center hover:shadow-md group ${
                    orderType === 'delivery' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-400'
                  }`}
                  aria-label={getText('homeDelivery', "Entrega em casa")}
                >
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-3 transition-colors ${
                    orderType === 'delivery' ? 'bg-blue-200' : 'bg-blue-100 group-hover:bg-blue-200'
                  }`}>
                    <FiTruck className="text-2xl sm:text-3xl text-blue-600" />
                  </div>
                  <span className="font-bold text-gray-800 text-sm sm:text-base">{getText('delivery', "Entrega")}</span>
                  <span className="text-xs sm:text-sm text-gray-500 mt-1">+ €2.50 {getText('deliveryFee', "Taxa de entrega")}</span>
                  {orderType === 'delivery' && (
                    <span className="mt-1 sm:mt-2 text-xs text-blue-600 font-medium">{getText('selected', "Selecionado")}</span>
                  )}
                </button>
                
                <button
                  onClick={() => setOrderType('pickup')}
                  className={`p-4 sm:p-6 rounded-xl border-2 transition-all flex flex-col items-center text-center hover:shadow-md group ${
                    orderType === 'pickup' 
                      ? 'border-green-500 bg-green-50 shadow-md' 
                      : 'border-gray-200 hover:border-green-400'
                  }`}
                  aria-label={getText('pickupLocation', "Retirar no local")}
                >
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-3 transition-colors ${
                    orderType === 'pickup' ? 'bg-green-200' : 'bg-green-100 group-hover:bg-green-200'
                  }`}>
                    <FiHome className="text-2xl sm:text-3xl text-green-600" />
                  </div>
                  <span className="font-bold text-gray-800 text-sm sm:text-base">{getText('pickup', "Retirada")}</span>
                  <span className="text-xs sm:text-sm text-gray-500 mt-1">{getText('noDeliveryFee', "Sem taxa de entrega")}</span>
                  {orderType === 'pickup' && (
                    <span className="mt-1 sm:mt-2 text-xs text-green-600 font-medium">{getText('selected', "Selecionado")}</span>
                  )}
                </button>
              </div>
              
              <div className="flex justify-between pt-3 sm:pt-4">
                <button
                  onClick={() => setCurrentStep(0)}
                  className="px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                >
                  {getText('back', "Voltar")}
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!orderType}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
                >
                  {getText('continue', "Continuar")}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Client Information */}
          {currentStep === 2 && (
            <div className="mb-6 sm:mb-8 animate-fadeIn">
              <div className="flex items-center mb-4 sm:mb-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="mr-3 sm:mr-4 p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label={getText('back', "Voltar")}
                >
                  <FiArrowLeft className="text-gray-600" size={20} />
                </button>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {getText('yourData', "Seus Dados")}
                </h3>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {getText('fullName', "Nome Completo")}*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-3">
                      <FiUser className="text-gray-400" size={16} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={clientData.name}
                      onChange={handleInputChange}
                      className="pl-10 w-full p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder={getText('fullNamePlaceholder', "Seu nome completo")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {getText('phone', "Telefone")}*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-3">
                      <FiPhone className="text-gray-400" size={16} />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={clientData.phone}
                      onChange={handleInputChange}
                      className="pl-10 w-full p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder={getText('phonePlaceholder', "912 345 678")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {getText('email', "Email")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-3">
                      <FiMail className="text-gray-400" size={16} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={clientData.email}
                      onChange={handleInputChange}
                      className="pl-10 w-full p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={getText('emailPlaceholder', "exemplo@email.com")}
                    />
                  </div>
                </div>

                {orderType === 'delivery' && (
                  <>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        {getText('address', "Endereço")}*
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-3">
                          <FiMapPin className="text-gray-400" size={16} />
                        </div>
                        <input
                          type="text"
                          name="address"
                          value={clientData.address}
                          onChange={handleInputChange}
                          className="pl-10 w-full p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          placeholder={getText('addressPlaceholder', "Rua, número, andar")}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          {getText('postalCode', "Código Postal")}*
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-3">
                            <FiMapPin className="text-gray-400" size={16} />
                          </div>
                          <input
                            type="text"
                            name="postalCode"
                            value={clientData.postalCode}
                            onChange={handleInputChange}
                            className="pl-10 w-full p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                            placeholder={getText('postalCodePlaceholder', "0000-000")}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          {getText('city', "Cidade")}*
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={clientData.city}
                          onChange={handleInputChange}
                          className="w-full p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          placeholder={getText('cityPlaceholder', "Sua cidade")}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {getText('orderNotes', "Observações do Pedido")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-3">
                      <FiEdit2 className="text-gray-400" size={16} />
                    </div>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="pl-10 w-full p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder={getText('orderNotesPlaceholder', "Alguma observação importante sobre o pedido?")}
                    ></textarea>
                  </div>
                </div>

                <div className="pt-3 sm:pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="needsInvoice"
                        checked={needsInvoice}
                        onChange={(e) => {
                          setNeedsInvoice(e.target.checked);
                          if (!e.target.checked) setShowNIF(false);
                        }}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="needsInvoice" className="ml-2 block text-xs sm:text-sm text-gray-700 flex items-center">
                        <FaReceipt className="mr-2" size={14} /> 
                        {getText('needsInvoice', "Necessita de fatura avec NIF?")}
                      </label>
                    </div>
                    
                    {needsInvoice && !showNIF && (
                      <button
                        onClick={() => setShowNIF(true)}
                        className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {getText('addNIF', "Adicionar NIF")}
                      </button>
                    )}
                  </div>
                  
                  {showNIF && (
                    <div className="mt-3 sm:mt-4 animate-fadeIn">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        {getText('taxNumber', "Número de Contribuinte (NIF)")}*
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-3">
                          <FiFileText className="text-gray-400" size={16} />
                        </div>
                        <input
                          type="text"
                          name="nif"
                          value={clientData.nif}
                          onChange={handleInputChange}
                          className="pl-10 w-full p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required={needsInvoice}
                          placeholder={getText('nifPlaceholder', "Digite seu NIF")}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 flex items-center">
                        <FiInfo className="mr-1" size={12} /> {getText('nifRequired', "O NIF é obrigatório para emissão de fatura.")}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4 sm:pt-6">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                  >
                    {getText('back', "Voltar")}
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    disabled={
                      !clientData.name || 
                      !clientData.phone || 
                      (orderType === 'delivery' && (!clientData.address || !clientData.postalCode || !clientData.city)) ||
                      (needsInvoice && showNIF && !clientData.nif)
                    }
                    className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
                  >
                    {getText('continueToPayment', "Continuar para Pagamento")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment Method */}
          {currentStep === 3 && (
            <div className="mb-6 sm:mb-8 animate-fadeIn">
              <div className="flex items-center mb-4 sm:mb-6">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="mr-3 sm:mr-4 p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label={getText('back', "Voltar")}
                >
                  <FiArrowLeft className="text-gray-600" size={20} />
                </button>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {getText('paymentMethod', "Método de Pagamento")}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <button
                  onClick={() => setPaymentMethod('mbway')}
                  className={`p-3 sm:p-5 rounded-xl border-2 transition-all flex items-center ${
                    paymentMethod === 'mbway' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  aria-label={getText('payWithMBWAY', "Pagar com MB WAY")}
                >
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-3 transition-colors ${
                    paymentMethod === 'mbway' ? 'bg-blue-100' : 'bg-blue-100 group-hover:bg-blue-200'
                  }`}>
                    <FaMobileAlt className={`text-xl sm:text-2xl ${
                      paymentMethod === 'mbway' ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="text-left">
                    <span className="font-bold block text-sm sm:text-base">MB WAY</span>
                    <span className="text-xs text-gray-500">{getText('mbwayPayment', "Pagamento por MB WAY")}</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('creditCard')}
                  className={`p-3 sm:p-5 rounded-xl border-2 transition-all flex items-center ${
                    paymentMethod === 'creditCard' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  aria-label={getText('payWithCard', "Pagar com Cartão")}
                >
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-3 transition-colors ${
                    paymentMethod === 'creditCard' ? 'bg-blue-100' : 'bg-blue-100 group-hover:bg-blue-200'
                  }`}>
                    <div className="flex">
                      <FaCcVisa className={`text-xl sm:text-2xl ${
                        paymentMethod === 'creditCard' ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                      <FaCcMastercard className={`text-xl sm:text-2xl ${
                        paymentMethod === 'creditCard' ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="font-bold block text-sm sm:text-base">{getText('card', "Cartão")}</span>
                    <span className="text-xs text-gray-500">Visa, Mastercard</span>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 sm:p-5 rounded-xl border-2 transition-all flex items-center ${
                    paymentMethod === 'cash' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  aria-label={getText('payWithCash', "Pagar em Dinheiro")}
                >
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-3 transition-colors ${
                    paymentMethod === 'cash' ? 'bg-blue-100' : 'bg-blue-100 group-hover:bg-blue-200'
                  }`}>
                    <FiCreditCard className={`text-xl sm:text-2xl ${
                      paymentMethod === 'cash' ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="text-left">
                    <span className="font-bold block text-sm sm:text-base">{getText('cash', "Dinheiro")}</span>
                    <span className="text-xs text-gray-500">{getText('cashPayment', "Pagamento na entrega")}</span>
                  </div>
                </button>
              </div>

              {paymentMethod === 'mbway' && (
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {getText('mbwayNumberQuestion', "Qual o número associado à sua conta MB WAY?")}*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-3">
                      <FaMobileAlt className="text-gray-400" size={16} />
                    </div>
                    <input
                      type="tel"
                      value={mbwayNumber}
                      onChange={(e) => setMbwayNumber(e.target.value)}
                      className="pl-10 w-full p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder={getText('mbwayPlaceholder', "Digite o número do seu MB WAY")}
                    />
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500">
                    {getText('mbwayNotification', "Enviaremos uma notificação para este número via MB WAY para confirmar o pagamento.")}
                  </p>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {getText('changeFor', "Precisa de troco para quanto?")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-3">
                      <span className="text-gray-400">€</span>
                    </div>
                    <input
                      type="number"
                      value={changeFor}
                      onChange={(e) => setChangeFor(e.target.value)}
                      className="pl-10 w-full p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min={finalTotal}
                      step="0.01"
                      placeholder={`${getText('example', "Ex")}: ${(finalTotal + 5).toFixed(2)}`}
                    />
                  </div>
                  {changeFor && parseFloat(changeFor) > 0 && (
                    <p className="mt-2 text-xs sm:text-sm text-gray-500">
                      {getText('change', "Troco")}: €{(parseFloat(changeFor) - finalTotal).toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-4 sm:mt-6">
                <h4 className="font-bold text-base sm:text-lg mb-2 sm:mb-3">{getText('orderSummary', "Resumo do Pedido")}</h4>
                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center max-w-[70%]">
                        <span className="font-medium text-sm sm:text-base truncate">{item.name}</span>
                        <span className="text-xs text-gray-500 ml-1 sm:ml-2">x {item.quantity}</span>
                      </div>
                      <span className="font-medium text-sm sm:text-base">€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between border-t border-gray-200 pt-2 sm:pt-3 text-sm sm:text-base">
                    <span>{getText('deliveryFee', "Taxa de Entrega")}</span>
                    <span>€2.50</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg sm:text-xl mt-3 sm:mt-4 pt-3 border-t border-gray-200">
                  <span>{getText('total', "Total")}</span>
                  <span>€{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 sm:mt-8">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                >
                  {getText('back', "Voltar")}
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={!paymentMethod || (paymentMethod === 'mbway' && !mbwayNumber) || isSubmitting}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm sm:text-base flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {getText('processing', "Processando...")}
                    </>
                  ) : (
                    getText('finishOrder', 'Finalizar Pedido')
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="py-6 sm:py-8 animate-fadeIn">
              <div className="text-center max-w-md mx-auto px-2 sm:px-0">
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-50 mb-6">
                  <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  {getText('orderConfirmed', "Pedido Confirmado!")}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  {getText('thanksOrder', "Obrigado pelo seu pedido! Já estamos preparando tudo para você.")}
                </p>
                
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <FiShoppingCart className="text-blue-600" size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-base">{getText('orderNumber', "Número do Pedido")}</h4>
                        <p className="text-sm text-gray-500">{orderNumber}</p>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                      {getText('confirmed', "Confirmado")}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">{getText('deliveryMethod', "Método de Entrega")}</span>
                      <span className="font-medium">
                        {orderType === 'delivery' ? (
                          <span className="flex items-center">
                            <FiTruck className="mr-2" size={14} /> {getText('delivery', "Entrega")}
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <FiHome className="mr-2" size={14} /> {getText('pickup', "Retirada")}
                          </span>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">{getText('paymentMethod', "Forma de Pagamento")}</span>
                      <span className="font-medium">
                      {paymentMethod === 'creditCard' && (
                        <span className="flex items-center">
                          <FaCcVisa className="mr-2" size={14} /> {getText('card', "Cartão")}
                        </span>
                      )}
                      {paymentMethod === 'cash' && (
                        <span className="flex items-center">
                          <FiCreditCard className="mr-2" size={14} /> {getText('cash', "Dinheiro")}
                          {changeFor && ` (${getText('changeFor', "Troco para")} €${parseFloat(changeFor).toFixed(2)})`}
                        </span>
                      )}
                      {paymentMethod === 'mbway' && (
                        <span className="flex items-center">
                          <FaMobileAlt className="mr-2" size={14} /> {getText('mbway', "MB WAY")} ({mbwayNumber})
                        </span>
                      )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">{language.deliveryEstimate || "Previsão de Entrega"}</span>
                      <span className="font-medium flex items-center">
                        <FiClock className="mr-2" size={14} />
                        {orderType === 'delivery' ? '30-45 minutos' : '15-20 minutos'}
                      </span>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex justify-between font-bold text-lg">
                        <span>{language.total || "Total"}</span>
                        <span>€{finalTotal.toFixed(2)}</span>
                    </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={onClose}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md text-sm sm:text-base"
                  >
                    {language.backToMenu || "Voltar ao Menu"}
                  </button>
                  <button className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-lg transition-colors text-sm sm:text-base">
                    {language.trackOrder || "Acompanhar Pedido"}
                  </button>
                </div>
                
                <div className="mt-8 text-center text-sm text-gray-500">
                  <p>{language.contactUs || "Em caso de dúvidas, entre em contato conosco:"}</p>
                  <p className="font-medium mt-1">{clientData.phone}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;