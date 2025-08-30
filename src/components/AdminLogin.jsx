// components/AdminLogin.jsx
"use client";
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { 
  FiUser, 
  FiLock, 
  FiMail, 
  FiEye, 
  FiEyeOff, 
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiShield
} from 'react-icons/fi';

const AdminLogin = ({ onLoginSuccess, language = 'pt' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isCreatingPassword, setIsCreatingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);

  // Verificar se já existe um administrador registrado
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const adminRef = ref(db, 'admin');
        const snapshot = await get(adminRef);
        if (snapshot.exists()) {
          setAdminExists(true);
        }
      } catch (error) {
        console.error("Erro ao verificar administrador:", error);
      }
    };

    checkAdminExists();
  }, []);


const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    setSuccess('Login realizado com sucesso!');
    
    // Redirecionar para /admin após login bem-sucedido
    setTimeout(() => {
      window.location.href = '/admin';
    }, 1000);
    
  } catch (error) {
    console.error("Erro no login:", error);
    setError(getErrorMessage(error.code));
  } finally {
    setLoading(false);
  }
};

const handleCreatePassword = async (e) => {
  e.preventDefault();
  setError('');
  
  if (password !== confirmPassword) {
    setError('As palavras-passe não coincidem');
    return;
  }
  
  if (password.length < 6) {
    setError('A palavra-passe deve ter pelo menos 6 caracteres');
    return;
  }
  
  setLoading(true);
  
  try {
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Salvar informações do admin no Realtime Database
    const adminRef = ref(db, 'admin');
    await set(adminRef, {
      email: email,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });
    
    // Também criar registro do usuário na tabela users com role de admin
    const userRef = ref(db, `users/${userCredential.user.uid}`);
    await set(userRef, {
      email: email,
      role: 'admin',
      name: 'Administrador',
      createdAt: new Date().toISOString()
    });
    
    setSuccess('Conta de administrador criada com sucesso!');
    
    // Redirecionar para /admin após 1 segundo
    setTimeout(() => {
      window.location.href = '/admin';
    }, 1000);
    
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    setError(getErrorMessage(error.code));
  } finally {
    setLoading(false);
  }
};

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
      setIsForgotPassword(false);
    } catch (error) {
      console.error("Erro ao enviar email de recuperação:", error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Esta conta foi desativada',
      'auth/user-not-found': 'Nenhuma conta encontrada com este email',
      'auth/wrong-password': 'Palavra-passe incorreta',
      'auth/email-already-in-use': 'Este email já está em uso',
      'auth/weak-password': 'A palavra-passe é muito fraca',
      'auth/operation-not-allowed': 'Operação não permitida',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    };
    
    return errorMessages[errorCode] || 'Ocorreu um erro. Tente novamente.';
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1]"
            placeholder="seu@email.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Palavra-passe
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1]"
            placeholder="Sua palavra-passe"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-[#4ba7b1] focus:ring-[#4ba7b1] border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Lembrar-me
          </label>
        </div>

        <div className="text-sm">
          <button
            type="button"
            onClick={() => setIsForgotPassword(true)}
            className="font-medium text-[#4ba7b1] hover:text-[#2f4a55]"
          >
            Esqueceu a palavra-passe?
          </button>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#2f4a55] to-[#4ba7b1] hover:from-[#253c45] hover:to-[#3f959e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ba7b1] disabled:opacity-50"
        >
          {loading ? 'A processar...' : 'Entrar'}
        </button>
      </div>
      
      {!adminExists && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsCreatingPassword(true)}
            className="text-sm font-medium text-[#4ba7b1] hover:text-[#2f4a55]"
          >
            Primeiro acesso? Criar palavra-passe de administrador
          </button>
        </div>
      )}
    </form>
  );

  const renderCreatePasswordForm = () => (
    <form onSubmit={handleCreatePassword} className="space-y-6">
      <div>
        <label htmlFor="create-email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="create-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1]"
            placeholder="seu@email.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="create-password" className="block text-sm font-medium text-gray-700">
          Nova palavra-passe
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="create-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1]"
            placeholder="Mínimo 6 caracteres"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
          Confirmar palavra-passe
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="confirm-password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1]"
            placeholder="Repita a palavra-passe"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => setIsCreatingPassword(false)}
          className="w-1/3 flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ba7b1]"
        >
          <FiArrowLeft className="h-5 w-5 mr-1" /> Voltar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-2/3 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#2f4a55] to-[#4ba7b1] hover:from-[#253c45] hover:to-[#3f959e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ba7b1] disabled:opacity-50"
        >
          {loading ? 'A processar...' : 'Criar palavra-passe'}
        </button>
      </div>
    </form>
  );

  const renderForgotPasswordForm = () => (
    <form onSubmit={handlePasswordReset} className="space-y-6">
      <p className="text-sm text-gray-600">
        Digite seu email abaixo e enviaremos instruções para redefinir sua palavra-passe.
      </p>

      <div>
        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="reset-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ba7b1] focus:border-[#4ba7b1]"
            placeholder="seu@email.com"
          />
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => setIsForgotPassword(false)}
          className="w-1/3 flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ba7b1]"
        >
          <FiArrowLeft className="h-5 w-5 mr-1" /> Voltar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-2/3 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#2f4a55] to-[#4ba7b1] hover:from-[#253c45] hover:to-[#3f959e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ba7b1] disabled:opacity-50"
        >
          {loading ? 'A processar...' : 'Enviar instruções'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-[#2f4a55]">
            <FiShield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isForgotPassword 
              ? 'Recuperar Acesso' 
              : isCreatingPassword 
                ? 'Criar Palavra-passe' 
                : 'Área de Administração'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isForgotPassword 
              ? 'Vamos ajudar a recuperar o seu acesso' 
              : isCreatingPassword 
                ? 'Defina a sua palavra-passe de administrador' 
                : 'Entre com as suas credenciais'}
          </p>
        </div>

        {/* Mensagens de erro/sucesso */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiCheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{success}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Formulário atual */}
        {isForgotPassword 
          ? renderForgotPasswordForm() 
          : isCreatingPassword 
            ? renderCreatePasswordForm() 
            : renderLoginForm()}
      </div>
    </div>
  );
};

export default AdminLogin;