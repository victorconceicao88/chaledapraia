"use client";
import {
  FaInstagram,
  FaWhatsapp,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaBook,
  FaHandshake,
  FaCalendarAlt,
  FaClock
} from "react-icons/fa";
import { RiLeafLine } from "react-icons/ri";

const Footer = () => {
  const handleEmailClick = (subject) => {
    window.location.href = `mailto:Sustentáveleprospero@gmail.com?subject=${encodeURIComponent(subject)}`;
  };

  return (
    <footer
      className="relative text-white overflow-hidden"
      style={{ backgroundColor: "#456c7d" }}
    >
      {/* Elementos decorativos de onda */}
      <div className="absolute top-0 right-0 w-full h-48 z-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute top-0 right-0 w-full h-full"
          viewBox="0 0 1920 300"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,300 C600,300 900,200 1500,200 C1720,200 1820,150 1920,80"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeOpacity="0.2"
          />
          <path
            d="M0,260 C650,260 1000,180 1520,180 C1740,180 1830,130 1920,100"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeOpacity="0.15"
          />
          <path
            d="M0,220 C700,220 1100,160 1540,160 C1760,160 1850,110 1920,120"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeOpacity="0.1"
          />
        </svg>
      </div>

      {/* Elementos decorativos de bolhas */}
      <div className="absolute bottom-10 left-10 opacity-10">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="white" />
        </svg>
      </div>
      <div className="absolute top-20 left-1/4 opacity-5">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="35" fill="white" />
        </svg>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Coluna da esquerda - Branding */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-400 p-2 rounded-lg">
                <RiLeafLine className="text-2xl text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Chalé da Praia
              </h2>
            </div>
            <p className="text-white/90 text-sm leading-relaxed max-w-xs">
              Experiência gastronômica premium à beira-mar. Sabores autênticos com ingredientes locais selecionados e atendimento personalizado.
            </p>

            {/* Redes sociais */}
            <div className="flex space-x-4 pt-4">
              <a
                href="https://www.instagram.com/chaledapraiaquarteira/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-emerald-500 transition-all duration-300 hover:scale-110"
              >
                <FaInstagram className="text-lg" />
              </a>
              <a
                href={`https://wa.me/351961346477?text=Olá! Gostaria de entrar em contato com o Chalé da Praia para mais informações, pedidos ou dúvidas.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-emerald-500 transition-all duration-300 hover:scale-110"
              >
                <FaWhatsapp className="text-lg" />
              </a>
              <a
                href="mailto:Sustentáveleprospero@gmail.com"
                className="bg-white/10 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-emerald-500 transition-all duration-300 hover:scale-110"
              >
                <FaEnvelope className="text-lg" />
              </a>
            </div>
          </div>

          {/* Coluna do meio - Horários */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-400 p-2 rounded-lg">
                <FaClock className="text-lg text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Horário de Funcionamento</h3>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <ul className="space-y-3 text-white/90 text-sm">
                <li className="flex justify-between py-2 border-b border-white/10">
                  <span className="font-medium">Segunda-feira</span>
                  <span className="text-emerald-300">Encerrado</span>
                </li>
                <li className="flex justify-between py-2 border-b border-white/10">
                  <span className="font-medium">Terça-feira</span>
                  <span>12:00 – 23:00</span>
                </li>
                <li className="flex justify-between py-2 border-b border-white/10">
                  <span className="font-medium">Quarta-feira</span>
                  <span>12:00 – 23:00</span>
                </li>
                <li className="flex justify-between py-2 border-b border-white/10">
                  <span className="font-medium">Quinta-feira</span>
                  <span>12:00 – 23:00</span>
                </li>
                <li className="flex justify-between py-2 border-b border-white/10">
                  <span className="font-medium">Sexta-feira</span>
                  <span className="text-emerald-300">12:00 – 02:00</span>
                </li>
                <li className="flex justify-between py-2 border-b border-white/10">
                  <span className="font-medium">Sábado</span>
                  <span className="text-emerald-300">12:00 – 02:00</span>
                </li>
                <li className="flex justify-between py-2">
                  <span className="font-medium">Domingo</span>
                  <span className="text-emerald-300">12:00 – 02:00</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Coluna da direita - Contatos e Informações */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-400 p-2 rounded-lg">
                <FaMapMarkerAlt className="text-lg text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Contactos & Localização</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <FaPhoneAlt className="text-emerald-300 text-lg mt-1 flex-shrink-0" />
                <a href="tel:351961346477" className="hover:text-emerald-200 transition-colors text-white/90">
                  +351 961 346 477
                </a>
              </div>
              
              <div className="flex items-start space-x-4 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <FaMapMarkerAlt className="text-emerald-300 text-lg mt-1 flex-shrink-0" />
                <div className="text-white/90">
                  <p>Avenida Infante de Sagres</p>
                  <p>Edifício Espadarte Loja D</p>
                  <p>8125-160 Quarteira</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3 pt-2">
                <button 
                  onClick={() => handleEmailClick("Proposta de Parceria - Chalé da Praia")}
                  className="flex items-center space-x-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-emerald-500/20 transition-all duration-300 group"
                >
                  <FaHandshake className="text-emerald-300 text-lg group-hover:scale-110 transition-transform" />
                  <span className="text-white/90 group-hover:text-white">Parcerias</span>
                </button>
                
                <button 
                  onClick={() => handleEmailClick("Organização de Evento - Chalé da Praia")}
                  className="flex items-center space-x-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-emerald-500/20 transition-all duration-300 group"
                >
                  <FaCalendarAlt className="text-emerald-300 text-lg group-hover:scale-110 transition-transform" />
                  <span className="text-white/90 group-hover:text-white">Eventos</span>
                </button>
                
                <a 
                  href="https://www.livroreclamacoes.pt/Inicio" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-emerald-500/20 transition-all duration-300 group"
                >
                  <FaBook className="text-emerald-300 text-lg group-hover:scale-110 transition-transform" />
                  <span className="text-white/90 group-hover:text-white">Livro de Reclamações</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé inferior */}
        <div className="mt-16 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center text-sm text-white/80">
          <p>
            © {new Date().getFullYear()} Chalé da Praia. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;