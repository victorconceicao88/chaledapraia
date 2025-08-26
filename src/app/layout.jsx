import './globals.css';
import { CartProvider } from '../contexts/CartContext';
import Header from '../components/Header';

export const metadata = {
  title: 'Chalé da Praia',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>
        <CartProvider>
          <Header />
          {children}
          {/* Footer foi removido aqui e deve ser colocado nos componentes individuais */}
        </CartProvider>
      </body>
    </html>
  );
}