"use client";
import { useEffect, useState, useRef} from 'react';
import { db, storage, auth } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AdminLogin from './AdminLogin';
import { 
  FiTruck, FiHome, FiClock, FiCheckCircle, 
  FiXCircle, FiUser, FiPhone, FiMapPin,
  FiMail, FiFileText, FiEdit2, FiDollarSign,
  FiImage, FiUpload, FiTrash2, FiArrowLeft,
  FiAlertCircle, FiInfo, FiShoppingBag, FiBell,
  FiPrinter, FiBluetooth, FiCoffee, FiMeh,
  FiFolder, FiGrid, FiSettings, FiLogOut
} from 'react-icons/fi';
import { FaMobileAlt, FaCcVisa } from 'react-icons/fa';

const AdminPanel = ({ language }) => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('pendentes');
  const [imagemEvento, setImagemEvento] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [arquivoImagem, setArquivoImagem] = useState(null);
  const [previewImagem, setPreviewImagem] = useState('');
  const [novoPedidoAlerta, setNovoPedidoAlerta] = useState(false);
  const [ultimoPedidoId, setUltimoPedidoId] = useState(null);
  const [novosPedidosCount, setNovosPedidosCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [imprimindo, setImprimindo] = useState(false);
  const [impressoraConectada, setImpressoraConectada] = useState(false);
  const [impressoraDispositivo, setImpressoraDispositivo] = useState(null);
  const [buscandoImpressora, setBuscandoImpressora] = useState(false);
  const [statusImpressora, setStatusImpressora] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);
  const notificationRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

// CORREÇÃO: Adicionar verificação completa de admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Buscar dados do usuário no banco
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if (userData && userData.role === 'admin') {
            setUser({ ...userData, id: firebaseUser.uid, email: firebaseUser.email });
            localStorage.setItem('adminUser', JSON.stringify({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              role: userData.role,
              name: userData.name
            }));
          } else {
            // Não é admin - redirecionar
            handleLogout();
          }
          setLoadingAuth(false);
        }, { onlyOnce: true });
      } else {
        // Não está logado - redirecionar
        handleLogout();
      }
    });

    return () => unsubscribe();
  }, []);

  // Função de logout COMPLETA
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      // Limpar TODOS os dados de sessão
      localStorage.removeItem('user');
      localStorage.removeItem('adminUser');
      sessionStorage.clear();
      
      // Redirecionar para página inicial com força total
      window.location.href = '/';
      window.location.reload(); // Força recarregamento completo
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Fallback: redirecionar mesmo com erro
      window.location.href = '/';
    }
  };

  // Carregar categorias do banco de dados
  const carregarCategorias = async () => {
    try {
      const categoriasRef = ref(db, 'categories');
      onValue(categoriasRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const categoriasArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value
          }));
          setCategorias(categoriasArray);
        } else {
          // Se não houver categorias no banco, criar as padrões
          const categoriasPadrao = [
            { id: 'mainCourses', name: 'Pratos Principais', image: '' },
            { id: 'otherDishes', name: 'Outros Pratos', image: '' },
            { id: 'Caldos', name: 'Caldos', image: '' },
            { id: 'snacks', name: 'Snacks', image: '' },
            { id: 'salads', name: 'Saladas', image: '' },
            { id: 'couvert', name: 'Couvert', image: '' },
            { id: 'toasts', name: 'Tostas', image: '' },
            { id: 'alcoholicCocktails', name: 'Coquetéis Alcoólicos', image: '' },
            { id: 'nonAlcoholicCocktails', name: 'Coquetéis Não Alcoólicos', image: '' },
            { id: 'wines', name: 'Vinhos', image: '' },
            { id: 'beers', name: 'Cervejas', image: '' },
            { id: 'otherDrinks', name: 'Outras Bebidas', image: '' },
            { id: 'desserts', name: 'Sobremesas', image: '' },
            { id: 'kidsMenu', name: 'Menu Infantil', image: '' },
            { id: 'bebidasQuentes', name: 'Bebidas Quentes', image: '' },
            { id: 'sorvetes', name: 'Sorvetes', image: '' },
            { id: 'sucos', name: 'Sucos', image: '' },
            { id: 'doces', name: 'Doces', image: '' }
          ];
          
          setCategorias(categoriasPadrao);
          
          // Salvar categorias no banco
          categoriasPadrao.forEach(async (categoria) => {
            const categoriaRef = ref(db, `categories/${categoria.id}`);
            await update(categoriaRef, categoria);
          });
        }
      });
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  // Função para tentar reconectar à impressora salva
  const reconectarImpressoraSalva = async () => {
    try {
      const impressoraSalva = localStorage.getItem('impressoraConfig');
      if (impressoraSalva && navigator.bluetooth) {
        const config = JSON.parse(impressoraSalva);
        const devices = await navigator.bluetooth.getDevices();
        const device = devices.find(d => d.id === config.deviceId);
        
        if (device) {
          setStatusImpressora(`Reconectando a ${config.deviceName}...`);
          await conectarDispositivo(device);
        }
      }
    } catch (error) {
      console.log('Não foi possível reconectar à impressora salva:', error);
    }
  };

  const carregarImagemEvento = async () => {
    try {
      const imageRef = storageRef(storage, 'event_images/evento.jpg');
      const url = await getDownloadURL(imageRef);
      setImagemEvento(url);
    } catch (error) {
      console.log("Nenhuma imagem de evento encontrada");
      setImagemEvento(null);
    }
  };

  const carregarImagemCategoria = async (categoriaId) => {
    try {
      const imageRef = storageRef(storage, `category_images/${categoriaId}.jpg`);
      const url = await getDownloadURL(imageRef);
      return url;
    } catch (error) {
      console.log(`Nenhuma imagem encontrada para a categoria ${categoriaId}`);
      return null;
    }
  };

  const handleUploadImagem = async (e) => {
    e.preventDefault();
    if (!arquivoImagem) return;

    setEnviando(true);
    try {
      const fileRef = storageRef(storage, 'event_images/evento.jpg');
      await uploadBytes(fileRef, arquivoImagem);
      const url = await getDownloadURL(fileRef);
      setImagemEvento(url);
      setEnviando(false);
      setArquivoImagem(null);
      setPreviewImagem('');
      alert('Imagem atualizada com sucesso!');
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setEnviando(false);
      alert('Erro ao fazer upload da imagem');
    }
  };

  const handleUploadImagemCategoria = async (categoriaId, arquivo) => {
    setUploadingCategoryImage(true);
    try {
      const fileRef = storageRef(storage, `category_images/${categoriaId}.jpg`);
      await uploadBytes(fileRef, arquivo);
      const url = await getDownloadURL(fileRef);
      
      // Atualizar a URL da imagem no banco de dados
      const categoriaRef = ref(db, `categories/${categoriaId}`);
      await update(categoriaRef, { image: url });
      
      // Atualizar a lista de categorias
      setCategorias(prev => prev.map(cat => 
        cat.id === categoriaId ? { ...cat, image: url } : cat
      ));
      
      alert('Imagem da categoria atualizada com sucesso!');
    } catch (error) {
      console.error("Erro ao fazer upload da imagem da categoria:", error);
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploadingCategoryImage(false);
      setCategoriaSelecionada(null);
    }
  };

  const handleArquivoChange = (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      setArquivoImagem(arquivo);
      setPreviewImagem(URL.createObjectURL(arquivo));
    }
  };

  const handleArquivoCategoriaChange = (e, categoriaId) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      handleUploadImagemCategoria(categoriaId, arquivo);
    }
  };

  const removerImagemEvento = async () => {
    if (confirm('Tem certeza que deseja remover a imagem do evento?')) {
      try {
        const fileRef = storageRef(storage, 'event_images/evento.jpg');
        await deleteObject(fileRef);
        setImagemEvento(null);
        alert('Imagem removida com sucesso!');
      } catch (error) {
      console.error("Erro ao remover imagem:", error);
      alert('Erro ao remover imagem');
      }
    }
  };

  const removerImagemCategoria = async (categoriaId) => {
    if (confirm('Tem certeza que deseja remover a imagem desta categoria?')) {
      try {
        const fileRef = storageRef(storage, `category_images/${categoriaId}.jpg`);
        await deleteObject(fileRef);
        
        // Atualizar a URL da imagem no banco de dados
        const categoriaRef = ref(db, `categories/${categoriaId}`);
        await update(categoriaRef, { image: '' });
        
        // Atualizar a lista de categorias
        setCategorias(prev => prev.map(cat => 
          cat.id === categoriaId ? { ...cat, image: '' } : cat
        ));
        
        alert('Imagem da categoria removida com sucesso!');
      } catch (error) {
        console.error("Erro ao remover imagem da categoria:", error);
        alert('Erro ao remover imagem');
      }
    }
  };

  const atualizarStatusPedido = async (pedidoId, status) => {
    try {
      const pedidoRef = ref(db, `orders/${pedidoId}`);
      await update(pedidoRef, { status: status });
      
      if (pedidoSelecionado && pedidoSelecionado.id === pedidoId) {
        setPedidoSelecionado({ ...pedidoSelecionado, status: status });
      }
      
      setPedidoSelecionado(null);
      
      if (status === 'concluido') {
        setAbaAtiva('concluidos');
      } else if (status === 'cancelado') {
        setAbaAtiva('cancelados');
      }
      
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert('Erro ao atualizar status do pedido');
    }
  };

  const formatarData = (dataString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dataString).toLocaleDateString('pt-BR', options);
  };

  const getCorStatus = (status) => {
    switch(status) {
      case 'concluido': return 'bg-emerald-100 text-emerald-800';
      case 'cancelado': return 'bg-rose-100 text-rose-800';
      case 'pendente': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLabelStatus = (status) => {
    switch(status) {
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      case 'pendente': return 'Pendente';
      default: return status;
    }
  };

  // Função para obter o texto do ponto da carne
  const getPontoCarneText = (ponto) => {
    switch(ponto) {
      case 'bemPassada': return 'Bem Passada';
      case 'media': return 'Média';
      case 'malPassada': return 'Mal Passada';
      case 'indiferente': return 'Indiferente';
      default: return ponto || 'Não especificado';
    }
  };

  // Função para obter o texto dos acompanhamentos
  const getAcompanhamentosText = (acompanhamentos) => {
    if (!acompanhamentos || acompanhamentos.length === 0) return 'Nenhum acompanhamento selecionado';
    
    const nomesAcompanhamentos = {
      rice: 'Arroz',
      beans: 'Feijão',
      potato: 'Batata',
      salad: 'Salada'
    };
    
    return acompanhamentos.map(acomp => nomesAcompanhamentos[acomp] || acomp).join(', ');
  };

  // Função para verificar se um item precisa de ponto da carne
  const precisaPontoCarne = (itemName) => {
    const meatItems = ['picanha', 'maminha', 'picanhaSnack'];
    return meatItems.some(meatItem => itemName.toLowerCase().includes(meatItem.toLowerCase()));
  };

  // Função para extrair opções de um item
  const getItemOptions = (item) => {
    if (!item.options) return null;
    
    const options = [];
    
    if (item.options.meatPoint) {
      options.push(`Ponto: ${getPontoCarneText(item.options.meatPoint)}`);
    }
    
    if (item.options.sides && item.options.sides.length > 0) {
      options.push(`Acomp: ${getAcompanhamentosText(item.options.sides)}`);
    }
    
    return options.length > 0 ? options.join(' | ') : null;
  };

  // Função para limpar o nome do item removendo informações de ponto e acompanhamentos
  const limparNomeItem = (nome) => {
    // Remove informações entre parênteses sobre ponto da carne
    let nomeLimpo = nome.replace(/\(.*?\)/g, '').trim();
    
    // Remove "com" e os acompanhamentos
    nomeLimpo = nomeLimpo.replace(/\s+com\s+.*$/i, '').trim();
    
    return nomeLimpo;
  };

  const filtrarPedidos = () => {
    switch(abaAtiva) {
      case 'pendentes':
        return pedidos.filter(pedido => !pedido.status || pedido.status === 'pendente');
      case 'concluidos':
        return pedidos.filter(pedido => pedido.status === 'concluido');
      case 'cancelados':
        return pedidos.filter(pedido => pedido.status === 'cancelado');
      default:
        return pedidos;
    }
  };

  const handleCloseNotification = () => {
    setNovoPedidoAlerta(false);
    setShowNotification(false);
    setNovosPedidosCount(0);
    
    // Atualiza o último pedido visto para o mais recente
    if (pedidos.length > 0) {
      const pedidosPendentes = pedidos.filter(p => !p.status || p.status === 'pendente');
      if (pedidosPendentes.length > 0) {
        setUltimoPedidoId(pedidosPendentes[0].id);
      }
    }
  };

  const handleAbaClick = (aba) => {
    setAbaAtiva(aba);
    if (aba === 'pendentes') {
      handleCloseNotification();
    }
  };

  // Função para limpar caracteres especiais e acentos
  const limparCaracteresEspeciais = (texto) => {
    if (!texto) return '';
    
    return texto
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\x20-\x7E]/g, '') // Remove caracteres não-ASCII
      .replace(/[^\w\s.,!?@#$%&*()\-+=:;<>]/gi, '') // Mantém apenas caracteres comuns
      .replace(/\s+/g, ' ') // Remove espaços múltiplos
      .trim();
  };

  // Função para formatar itens do pedido com layout profissional
  const formatarItemPedido = (nome, quantidade, preco, opcoes = null, largura = 32) => {
    // Limpar o nome do item
    const nomeLimpo = limparNomeItem(nome);
    
    // Limitar o nome do item para caber na linha
    const nomeLimitado = nomeLimpo.length > 18 ? nomeLimpo.substring(0, 18) + '...' : nomeLimpo;
    const linha = `${quantidade}x ${nomeLimitado}`;
    const precoFormatado = `EUR${preco.toFixed(2)}`;
    
    // Calcular espaços necessários para alinhar o preço à direita
    const espacosNecessarios = largura - linha.length - precoFormatado.length;
    
    let resultado = '';
    
    if (espacosNecessarios > 0) {
      resultado = linha + ' '.repeat(espacosNecessarios) + precoFormatado;
    } else {
      // Se não houver espaço suficiente, quebra a linha
      resultado = `${linha}\n${' '.repeat(largura - precoFormatado.length)}${precoFormatado}`;
    }
    
    // Adicionar opções em linhas separadas se existirem
    if (opcoes) {
      // Separar ponto e acompanhamentos
      const partesOpcoes = opcoes.split(' | ');
      
      partesOpcoes.forEach(parte => {
        resultado += `\n  ${parte}`;
      });
    }
    
    return resultado;
  };

  // Função auxiliar para conectar a um dispositivo
  const conectarDispositivo = async (device) => {
    try {
      if (!device.gatt) {
        throw new Error("Dispositivo não pareado. Pareie a impressora primeiro.");
      }
      
      const server = await device.gatt.connect();
      console.log('Conectado ao servidor GATT');
      setStatusImpressora('Buscando serviços de impressão...');
      
      // Obter serviços
      const services = await server.getPrimaryServices();
      console.log('Serviços disponíveis:', services.map(s => s.uuid));
      
      let characteristic = null;
      
      // Procurar por serviços comuns de impressora
      for (const service of services) {
        try {
          const characteristics = await service.getCharacteristics();
          console.log(`Características do serviço ${service.uuid}:`, characteristics.map(c => c.uuid));
          
          // Procurar por características de escrita
          const writeCharacteristics = characteristics.filter(c => 
            c.properties.write || c.properties.writeWithoutResponse
          );
          
        if (writeCharacteristics.length > 0) {
            characteristic = writeCharacteristics[0];
            console.log('Característica de escrita encontrada:', characteristic.uuid);
            break;
          }
        } catch (error) {
          console.warn(`Erro ao acessar características:`, error);
        }
      }
      
      if (!characteristic) {
        throw new Error('Nenhuma característica de escrita encontrada.');
      }
      
      setImpressoraConectada(true);
      setImpressoraDispositivo({
        device,
        server,
        characteristic
      });
      
      // Salvar configuração da impressora para reconexão automática
      localStorage.setItem('impressoraConfig', JSON.stringify({
        deviceId: device.id,
        deviceName: device.name
      }));
      
      setStatusImpressora(`Conectado a ${device.name || 'Impressora'}`);
      console.log('Impressora conectada com sucesso!');
      
      return characteristic;
      
    } catch (error) {
      console.error('Erro ao conectar dispositivo:', error);
      setStatusImpressora(`Erro: ${error.message}`);
    }
  };

  // Função para conectar à impressora Bluetooth
  const conectarImpressoraBluetooth = async () => {
    setBuscandoImpressora(true);
    setStatusImpressora('Procurando dispositivos Bluetooth...');
    
    try {
      // Verificar se o navegador suporta Bluetooth
      if (!navigator.bluetooth) {
        throw new Error("Bluetooth não é suportado neste navegador. Use Chrome/Edge no Android.");
      }
      
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '0000180a-0000-1000-8000-00805f9b34fb',
          '00001101-0000-1000-8000-00805f9b34fb',
          '0000ff00-0000-1000-8000-00805f9b34fb',
          '0000ff01-0000-1000-8000-00805f9b34fb',
          '0000ff02-0000-1000-8000-00805f9b34fb',
          '0000fee0-0000-1000-8000-00805f9b34fb',
          '0000fee1-0000-1000-8000-00805f9b34fb',
          '0000ffe0-0000-1000-8000-00805f9b34fb',
          '0000ffe5-0000-1000-8000-00805f9b34fb',
          'beb5483e-36e1-4688-b7f5-ea07361b26a8'
        ]
      });
      
      console.log('Dispositivo selecionado:', device.name);
      setStatusImpressora(`Conectando a ${device.name || 'Dispositivo'}...`);
      
      const characteristic = await conectarDispositivo(device);
      return characteristic;
      
    } catch (error) {
      console.error('Erro ao conectar à impressora:', error);
      setStatusImpressora(`Erro: ${error.message}`);
      
      if (error.message.includes('Bluetooth')) {
        alert('Bluetooth não está disponível. Use Chrome ou Edge em dispositivos Android.');
      } else if (error.message.includes('cancel')) {
        alert('Conexão cancelada. Selecione a impressora na lista.');
      } else if (error.message.includes('not found') || error.message.includes('device')) {
        alert('Impressora não encontrada. Verifique se está ligada e pareada.');
      } else {
        alert(`Erro ao conectar: ${error.message}`);
      }
      
      throw error;
    } finally {
      setBuscandoImpressora(false);
    }
  };

  // Função para imprimir pedido via Bluetooth
  const imprimirPedido = async (pedido) => {
    setImprimindo(true);
    setStatusImpressora('Preparando para imprimir...');
    
    try {
      let characteristic;
      
      // Se já temos uma impressora conectada, usar a característica existente
      if (impressoraDispositivo && impressoraDispositivo.characteristic) {
        characteristic = impressoraDispositivo.characteristic;
      } else {
        // Tentar reconectar à impressora salva
        const impressoraSalva = localStorage.getItem('impressoraConfig');
        if (impressoraSalva) {
          try {
            const config = JSON.parse(impressoraSalva);
            const devices = await navigator.bluetooth.getDevices();
            const device = devices.find(d => d.id === config.deviceId);
            
            if (device) {
              characteristic = await conectarDispositivo(device);
            } else {
              throw new Error('Impressora salva não encontrada');
            }
          } catch (error) {
            console.log('Não foi possível reconectar à impressora salva, solicitando nova conexão...');
            characteristic = await conectarImpressoraBluetooth();
          }
        } else {
          // Se não há impressora salva, conectar uma nova
          characteristic = await conectarImpressoraBluetooth();
        }
      }
      
      setStatusImpressora('Enviando dados para impressora...');
      
      // Preparar conteúdo para impressão em formato de comando ESC/POS
      const encoder = new TextEncoder();
      const commands = [];
      
      // Inicializar impressora
      commands.push(new Uint8Array([0x1B, 0x40])); // Reset
      
      // Configurar alinhamento centralizado para cabeçalho
      commands.push(new Uint8Array([0x1B, 0x61, 0x01])); // Centralizar
      
      // Texto grande para cabeçalho
      commands.push(new Uint8Array([0x1D, 0x21, 0x11])); // Tamanho duplo
      
      // Adicionar nome do restaurante
      commands.push(encoder.encode("CHALE DA PRAIA\n"));
      
      // Voltar ao texto normal
      commands.push(new Uint8Array([0x1D, 0x21, 0x00]));
      commands.push(encoder.encode("==============================\n"));
      
      // Informações do pedido
      commands.push(new Uint8Array([0x1B, 0x61, 0x00])); // Alinhamento à esquerda
      commands.push(encoder.encode(`Pedido: ${pedido.orderNumber || `#${pedido.id.slice(-6).toUpperCase()}`}\n`));
      commands.push(encoder.encode(`Data: ${formatarData(pedido.createdAt)}\n`));
      commands.push(encoder.encode("==============================\n\n"));
      
      // Dados específicos baseados no tipo de pedido
      if (pedido.orderType === 'delivery') {
        // PEDIDO DE ENTREGA - Imprimir dados do cliente
        commands.push(new Uint8Array([0x1B, 0x21, 0x08])); // Texto em negrito
        commands.push(encoder.encode("DADOS DO CLIENTE\n"));
        commands.push(new Uint8Array([0x1B, 0x21, 0x00])); // Voltar ao texto normal
        commands.push(encoder.encode(`Nome: ${limparCaracteresEspeciais(pedido.name)}\n`));
        commands.push(encoder.encode(`Telefone: ${pedido.phone}\n`));
        commands.push(encoder.encode(`Endereco: ${limparCaracteresEspeciais(pedido.address)}\n`));
        commands.push(encoder.encode(`Codigo Postal: ${pedido.postalCode}\n`));
        commands.push(encoder.encode(`Cidade: ${limparCaracteresEspeciais(pedido.city)}\n`));
        
        if (pedido.paymentMethod === 'cash' && pedido.changeFor) {
          commands.push(encoder.encode(`Troco para: EUR${pedido.changeFor.toFixed(2)}\n`));
        }
        
        commands.push(encoder.encode("----------------------------\n\n"));
        
        // Itens da cozinha
        commands.push(new Uint8Array([0x1B, 0x21, 0x08])); // Texto em negrito
        commands.push(encoder.encode("ITENS DA COZINHA\n"));
        commands.push(new Uint8Array([0x1B, 0x21, 0x00])); // Voltar ao texto normal
        commands.push(encoder.encode("----------------------------\n"));
        
        // Adicionar cada item formatado profissionalmente
        pedido.items.forEach(item => {
          // Extrair opções do item (ponto da carne e acompanhamentos)
          let opcoesTexto = null;
          if (item.options) {
            const opcoes = [];
            if (item.options.meatPoint) {
              opcoes.push(`Ponto: ${getPontoCarneText(item.options.meatPoint)}`);
            }
            if (item.options.sides && item.options.sides.length > 0) {
              opcoes.push(`Acomp: ${getAcompanhamentosText(item.options.sides)}`);
            }
            if (opcoes.length > 0) {
              opcoesTexto = opcoes.join(' | ');
            }
          }
          
          const linhaItem = formatarItemPedido(
            limparCaracteresEspeciais(item.name), 
            item.quantity, 
            item.price * item.quantity,
            opcoesTexto,
            32
          );
          commands.push(encoder.encode(linhaItem + "\n"));
          
          if (item.notes) {
            commands.push(encoder.encode(`   Obs: ${limparCaracteresEspeciais(item.notes)}\n`));
          }
        });
        
      } else {
        // PEDIDO DE RETIRADA - Imprimir apenas dados essenciais
        commands.push(new Uint8Array([0x1B, 0x21, 0x08])); // Texto em negrito
        commands.push(encoder.encode("RETIRADA NO LOCAL\n"));
        commands.push(new Uint8Array([0x1B, 0x21, 0x00])); // Voltar ao texto normal
        commands.push(encoder.encode(`Cliente: ${limparCaracteresEspeciais(pedido.name)}\n`));
        commands.push(encoder.encode(`Telefone: ${pedido.phone}\n`));
        commands.push(encoder.encode("----------------------------\n\n"));
        
        // Itens do pedido
        commands.push(encoder.encode("----------------------------\n"));
        
        // Adicionar cada item formatado profissionalmente
        pedido.items.forEach(item => {
          // Extrair opções do item (ponto da carne e acompanhamentos)
          let opcoesTexto = null;
          if (item.options) {
            const opcoes = [];
            if (item.options.meatPoint) {
              opcoes.push(`Ponto: ${getPontoCarneText(item.options.meatPoint)}`);
            }
            if (item.options.sides && item.options.sides.length > 0) {
              opcoes.push(`Acomp: ${getAcompanhamentosText(item.options.sides)}`);
            }
            if (opcoes.length > 0) {
              opcoesTexto = opcoes.join(' | ');
            }
          }
          
          const linhaItem = formatarItemPedido(
            limparCaracteresEspeciais(item.name), 
            item.quantity, 
            item.price * item.quantity,
            opcoesTexto,
            32
          );
          commands.push(encoder.encode(linhaItem + "\n"));
          
          if (item.notes) {
            commands.push(encoder.encode(`   Obs: ${limparCaracteresEspeciais(item.notes)}\n`));
          }
        });
      }
      
      // Adicionar totais
      commands.push(encoder.encode("----------------------------\n"));
      
      // Subtotal
      const subtotal = pedido.total - (pedido.deliveryFee || 0);
      const linhaSubtotal = formatarItemPedido("Subtotal", 1, subtotal, null, 32);
      commands.push(encoder.encode(linhaSubtotal + "\n"));
      
      // Taxa de entrega
      if (pedido.deliveryFee && pedido.deliveryFee > 0) {
        const linhaTaxa = formatarItemPedido("Taxa de entrega", 1, pedido.deliveryFee, null, 32);
        commands.push(encoder.encode(linhaTaxa + "\n"));
      }
      
      // Linha separadora antes do total
      commands.push(encoder.encode("==============================\n"));
      
      // Total em negrito
      commands.push(new Uint8Array([0x1B, 0x21, 0x08])); // Texto em negrito
      const linhaTotal = formatarItemPedido("TOTAL", 1, pedido.total, null, 32);
      commands.push(encoder.encode(linhaTotal + "\n"));
      commands.push(new Uint8Array([0x1B, 0x21, 0x00])); // Voltar ao texto normal
      
      // Método de pagamento
      commands.push(encoder.encode("----------------------------\n"));
      commands.push(encoder.encode(`Pagamento: ${pedido.paymentMethod === 'mbway' ? 'MB WAY' : 
        pedido.paymentMethod === 'creditCard' ? 'CARTAO' : 'DINHEIRO'}\n`));
      
      // Informações de pagamento específicas
      if (pedido.paymentMethod === 'cash' && pedido.changeFor) {
        commands.push(encoder.encode(`Troco para: EUR${pedido.changeFor.toFixed(2)}\n`));
      } else if (pedido.paymentMethod === 'mbway' && pedido.paymentDetails?.mbwayNumber) {
        commands.push(encoder.encode(`Numero MB WAY: ${pedido.paymentDetails.mbwayNumber}\n`));
      }
      
      // Número de contribuinte (NIF) se fornecido
      if (pedido.nif) {
        commands.push(encoder.encode("----------------------------\n"));
        commands.push(encoder.encode(`NIF: ${pedido.nif}\n`));
      }
      
      // Observações gerais do pedido
      if (pedido.orderNotes) {
        commands.push(encoder.encode("----------------------------\n"));
        commands.push(encoder.encode("OBSERVACOES:\n"));
        commands.push(encoder.encode(`${limparCaracteresEspeciais(pedido.orderNotes)}\n`));
      }
      
      // Rodapé
      commands.push(encoder.encode("\n\n==============================\n"));
      commands.push(new Uint8Array([0x1B, 0x61, 0x01])); // Centralizar texto
      commands.push(encoder.encode("Obrigado pela preferencia!\n"));
      commands.push(encoder.encode("Volte sempre!\n"));
      commands.push(new Uint8Array([0x1B, 0x61, 0x00])); // Voltar alinhamento à esquerda
      
      // Comandos para avançar papel e cortar (se suportado)
      commands.push(encoder.encode('\n\n\n\n')); // Avançar papel
      commands.push(new Uint8Array([0x1D, 0x56, 0x41, 0x10])); // Cortar papel (comando ESC/POS)
      
      // Enviar todos os comandos para a impressora
      for (const command of commands) {
        try {
          if (characteristic.properties.write) {
            await characteristic.writeValue(command);
          } else if (characteristic.properties.writeWithoutResponse) {
            await characteristic.writeValueWithoutResponse(command);
          }
          // Pequena pausa entre comandos para evitar sobrecarga
          await new Promise(resolve => setTimeout(resolve, 30));
        } catch (writeError) {
          console.error('Erro ao escrever comando:', writeError);
          throw writeError;
        }
      }
      
      setStatusImpressora('Pedido impresso com sucesso!');
      alert('Pedido enviado para impressão com sucesso!');
      
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      setStatusImpressora(`Erro: ${error.message}`);
      
      // Fallback - mostrar conteúdo para impressão manual
      const conteudoTexto = gerarConteudoTexto(pedido);
      alert(`ERRO DE IMPRESSÃO\n\nCopie e cole manualmente na impressora:\n\n${conteudoTexto}`);
    } finally {
      setImprimindo(false);
    }
  };

  // Função para gerar conteúdo de texto para fallback
  const gerarConteudoTexto = (pedido) => {
    let texto = "==============================\n";
    texto += "        CHALE DA PRAIA\n";
    texto += "==============================\n";
    texto += `Pedido: ${pedido.orderNumber || `#${pedido.id.slice(-6).toUpperCase()}`}\n`;
    texto += `Data: ${formatarData(pedido.createdAt)}\n`;
    texto += "==============================\n\n";
    
    if (pedido.orderType === 'delivery') {
      texto += "DADOS DO CLIENTE\n";
      texto += `Nome: ${pedido.name}\n`;
      texto += `Telefone: ${pedido.phone}\n`;
      texto += `Endereco: ${pedido.address}\n`;
      texto += `Codigo Postal: ${pedido.postalCode}\n`;
      texto += `Cidade: ${pedido.city}\n`;
      
      if (pedido.paymentMethod === 'cash' && pedido.changeFor) {
        texto += `Troco para: EUR${pedido.changeFor.toFixed(2)}\n`;
      }
      
      texto += "----------------------------\n\n";
      texto += "ITENS DA COZINHA\n";
    } else {
      texto += "RETIRADA NO LOCAL\n";
      texto += `Cliente: ${pedido.name}\n`;
      texto += `Telefone: ${pedido.phone}\n`;
      texto += "----------------------------\n\n";
      texto += "ITENS DO PEDIDO\n";
    }
    
    texto += "----------------------------\n";
    
    // Adicionar itens formatados com opções
    pedido.items.forEach(item => {
      // Limpar o nome do item
      const nomeLimpo = limparNomeItem(item.name);
      
      // Extrair opções do item (ponto da carne e acompanhamentos)
      let opcoesTexto = null;
      if (item.options) {
        const opcoes = [];
        if (item.options.meatPoint) {
          opcoes.push(`Ponto: ${getPontoCarneText(item.options.meatPoint)}`);
        }
        if (item.options.sides && item.options.sides.length > 0) {
          opcoes.push(`Acomp: ${getAcompanhamentosText(item.options.sides)}`);
        }
        if (opcoes.length > 0) {
          opcoesTexto = opcoes.join(' | ');
        }
      }
      
      const linhaItem = formatarItemPedido(nomeLimpo, item.quantity, item.price * item.quantity, opcoesTexto, 32);
      texto += linhaItem + "\n";
      
      if (item.notes) {
        texto += `   Obs: ${item.notes}\n`;
      }
    });
    
    texto += "----------------------------\n";
    
    // Subtotal
    const subtotal = pedido.total - (pedido.deliveryFee || 0);
    const linhaSubtotal = formatarItemPedido("Subtotal", 1, subtotal, null, 32);
    texto += linhaSubtotal + "\n";
    
    // Taxa de entrega
    if (pedido.deliveryFee && pedido.deliveryFee > 0) {
      const linhaTaxa = formatarItemPedido("Taxa de entrega", 1, pedido.deliveryFee, null, 32);
      texto += linhaTaxa + "\n";
    }
    
    texto += "==============================\n";
    
    // Total
    const linhaTotal = formatarItemPedido("TOTAL", 1, pedido.total, null, 32);
    texto += linhaTotal + "\n";
    
    // Método de pagamento
    texto += "----------------------------\n";
    texto += `Pagamento: ${pedido.paymentMethod === 'mbway' ? 'MB WAY' : 
      pedido.paymentMethod === 'creditCard' ? 'CARTAO' : 'DINHEIRO'}\n`;
    
    // Informações de pagamento específicas
    if (pedido.paymentMethod === 'cash' && pedido.changeFor) {
      texto += `Troco para: EUR${pedido.changeFor.toFixed(2)}\n`;
    } else if (pedido.paymentMethod === 'mbway' && pedido.paymentDetails?.mbwayNumber) {
      texto += `Numero MB WAY: ${pedido.paymentDetails.mbwayNumber}\n`;
    }
    
    // Número de contribuinte (NIF) se fornecido
    if (pedido.nif) {
      texto += "----------------------------\n";
      texto += `NIF: ${pedido.nif}\n`;
    }
    
    // Observações
    if (pedido.orderNotes) {
      texto += "----------------------------\n";
      texto += "OBSERVACOES:\n";
      texto += `${pedido.orderNotes}\n`;
    }
    
    // Rodapé
    texto += "\n\n==============================\n";
    texto += "    Obrigado pela preferencia!\n";
    texto += "          Volte sempre!\n\n\n\n";
    
    return limparCaracteresEspeciais(texto);
  };

  // Efeito principal para carregar pedidos, imagem de evento e categorias
  useEffect(() => {
    if (!user) return;

    const pedidosRef = ref(db, 'orders');
    let timeout;

    const unsubscribe = onValue(pedidosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arrayPedidos = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));

        const pedidosOrdenados = arrayPedidos.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        setPedidos(pedidosOrdenados);

        const pedidosPendentes = pedidosOrdenados.filter(p => !p.status || p.status === 'pendente');

        if (pedidosPendentes.length > 0) {
          const maisRecente = pedidosPendentes[0];

          if (ultimoPedidoId !== maisRecente.id) {
            setUltimoPedidoId(maisRecente.id);

            const novosPedidos = !ultimoPedidoId 
              ? pedidosPendentes 
              : pedidosPendentes.filter(p => 
                  new Date(p.createdAt) > new Date(pedidos.find(ped => ped.id === ultimoPedidoId)?.createdAt)
                );

            setNovosPedidosCount(novosPedidos.length);

            if (abaAtiva !== 'pendentes' && novosPedidos.length > 0) {
              setNovoPedidoAlerta(true);
              setShowNotification(true);

              timeout = setTimeout(() => {
                setShowNotification(false);
              }, 15000);
            }
          }
        } else {
          setNovosPedidosCount(0);
        }
      }
    });

    carregarImagemEvento();
    carregarCategorias();
    reconectarImpressoraSalva();

    return () => {
      unsubscribe();
      if (timeout) clearTimeout(timeout);
    };
  }, [user, ultimoPedidoId, abaAtiva]);

  // Se ainda está carregando a autenticação
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4ba7b1]"></div>
      </div>
    );
  }

  // Se não está autenticado como admin, não mostra nada (já redirecionou)
  if (!user) {
    return null;
  }


  const pedidosFiltrados = filtrarPedidos();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notificação flutuante melhorada */}
      {showNotification && (
        <div 
          ref={notificationRef}
          className="fixed bottom-4 right-4 z-50"
        >
          <div 
            className="bg-gradient-to-r from-red-600 to-red-500 text-white p-4 rounded-lg shadow-xl flex items-center cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => {
              setAbaAtiva('pendentes');
              handleCloseNotification();
            }}
          >
            <div className="relative">
              <div className="absolute -top-2 -right-2 animate-ping h-4 w-4 rounded-full bg-white opacity-75"></div>
              <FiBell className="h-6 w-6 mr-3 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold">Novo Pedido Recebido!</h3>
              <p className="text-sm">
                {novosPedidosCount === 1 
                  ? '1 novo pedido pendente' 
                  : `${novosPedidosCount} novos pedidos pendentes`}
              </p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleCloseNotification();
              }}
              className="ml-4 p-1 rounded-full hover:bg-red-700 transition-colors"
            >
              <FiXCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

     <header className="bg-gradient-to-r from-indigo-600 to-indigo-800 shadow-lg">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
          <FiShoppingBag className="mr-3 hidden md:block" />
          Painel Administrativo
          {novoPedidoAlerta && (
            <span className="ml-3 relative inline-flex">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </h1>
        <p className="mt-1 text-indigo-100 text-sm md:text-base">
          Gerencie pedidos e promoções do seu estabelecimento
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center px-3 py-1 bg-indigo-500 bg-opacity-30 rounded-full">
          <span className="text-white text-sm font-medium">
            {pedidos.filter(p => !p.status || p.status === 'pendente').length} pendentes
          </span>
        </div>
        <button
          onClick={() => {
            signOut(auth);
            localStorage.removeItem('user');
            window.location.href = '/';
          }}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <FiLogOut className="mr-2 h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  </div>
</header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6">
        {/* Navegação por Abas premium */}
        <div className="mb-8">
          <div className="sm:hidden">
            <label htmlFor="abas" className="sr-only">Selecione uma aba</label>
            <select
              id="abas"
              name="abas"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={abaAtiva}
              onChange={(e) => handleAbaClick(e.target.value)}
            >
              <option value="pendentes">
                Pendentes ({pedidos.filter(p => !p.status || p.status === 'pendente').length})
              </option>
              <option value="concluidos">
                Concluídos ({pedidos.filter(p => p.status === 'concluido').length})
              </option>
              <option value="cancelados">
                Cancelados ({pedidos.filter(p => p.status === 'cancelado').length})
              </option>
              <option value="eventos">Evento</option>
              <option value="categorias">Categorias</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => handleAbaClick('pendentes')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${abaAtiva === 'pendentes' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <FiClock className={`mr-2 h-5 w-5 ${abaAtiva === 'pendentes' ? 'text-indigo-500' : 'text-gray-400'}`} />
                  Pendentes
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${abaAtiva === 'pendentes' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'} ${novoPedidoAlerta ? 'animate-pulse' : ''}`}>
                    {pedidos.filter(p => !p.status || p.status === 'pendente').length}
                  </span>
                </button>
                <button
                  onClick={() => handleAbaClick('concluidos')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${abaAtiva === 'concluidos' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <FiCheckCircle className={`mr-2 h-5 w-5 ${abaAtiva === 'concluidos' ? 'text-indigo-500' : 'text-gray-400'}`} />
                  Concluídos
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${abaAtiva === 'concluidos' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                    {pedidos.filter(p => p.status === 'concluido').length}
                  </span>
                </button>
                <button
                  onClick={() => handleAbaClick('cancelados')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${abaAtiva === 'cancelados' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <FiXCircle className={`mr-2 h-5 w-5 ${abaAtiva === 'cancelados' ? 'text-indigo-500' : 'text-gray-400'}`} />
                  Cancelados
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${abaAtiva === 'cancelados' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                    {pedidos.filter(p => p.status === 'cancelado').length}
                  </span>
                </button>
                <button
                  onClick={() => handleAbaClick('eventos')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${abaAtiva === 'eventos' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <FiImage className={`mr-2 h-5 w-5 ${abaAtiva === 'eventos' ? 'text-indigo-500' : 'text-gray-400'}`} />
                  Evento
                </button>
                <button
                  onClick={() => handleAbaClick('categorias')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${abaAtiva === 'categorias' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <FiGrid className={`mr-2 h-5 w-5 ${abaAtiva === 'categorias' ? 'text-indigo-500' : 'text-gray-400'}`} />
                  Categorias
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Área de Conteúdo */}
        {abaAtiva === 'categorias' ? (
          <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
            {/* Cabeçalho do Gerenciamento de Categorias premium */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FiGrid className="mr-2 h-5 w-5 text-indigo-500" />
                Gerenciamento de Categorias
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Gerencie as imagens das categorias do seu cardápio
              </p>
            </div>

            {/* Lista de Categorias */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorias.map((categoria) => (
                  <div key={categoria.id} className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{categoria.name}</h3>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Imagem Atual</h4>
                      {categoria.image ? (
                        <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                          <img 
                            src={categoria.image} 
                            alt={categoria.name}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-2">
                            <button
                              onClick={() => removerImagemCategoria(categoria.id)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                            >
                              <FiTrash2 className="mr-1 h-3 w-3" />
                              Remover
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center bg-white">
                          <FiImage className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-xs text-gray-500">Nenhuma imagem</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alterar Imagem
                      </label>
                      <div className="flex items-center">
                        <label className="flex-1 cursor-pointer">
                          <input 
                            type="file" 
                            className="sr-only"
                            accept="image/jpeg, image/png"
                            onChange={(e) => handleArquivoCategoriaChange(e, categoria.id)}
                            disabled={uploadingCategoryImage}
                          />
                          <span className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <FiUpload className="mr-2 h-4 w-4" />
                            Selecionar Imagem
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : abaAtiva !== 'eventos' ? (
          pedidoSelecionado ? (
            <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
              {/* Cabeçalho do Detalhe do Pedido premium */}
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <button 
                      onClick={() => setPedidoSelecionado(null)}
                      className="mr-4 p-2 rounded-md bg-white shadow-sm hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <FiArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Pedido {pedidoSelecionado.orderNumber || `#${pedidoSelecionado.id.slice(-6).toUpperCase()}`}
                      </h2>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <FiClock className="mr-2 h-4 w-4" />
                        {formatarData(pedidoSelecionado.createdAt)}
                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCorStatus(pedidoSelecionado.status)}`}>
                          {getLabelStatus(pedidoSelecionado.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    {/* Status da Impressora */}
                    <div className="flex items-center mr-4">
                      <div className={`w-3 h-3 rounded-full mr-2 ${impressoraConectada ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-600">
                        {impressoraConectada ? 'Impressora Conectada' : 'Impressora Não Conectada'}
                      </span>
                    </div>
                    
                    {/* Botão de Impressão Premium */}
                    <button
                      onClick={() => imprimirPedido(pedidoSelecionado)}
                      disabled={imprimindo}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${imprimindo ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'}`}
                    >
                      {imprimindo ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Imprimindo...
                        </>
                      ) : (
                        <>
                          <FiPrinter className="-ml-1 mr-2 h-5 w-5" />
                          Imprimir
                        </>
                      )}
                    </button>
                    
                    {pedidoSelecionado.status !== 'cancelado' && (
                      <button
                        onClick={() => atualizarStatusPedido(pedidoSelecionado.id, 'cancelado')}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <FiXCircle className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                        Cancelar
                      </button>
                    )}
                    {pedidoSelecionado.status !== 'concluido' && (
                      <button
                        onClick={() => atualizarStatusPedido(pedidoSelecionado.id, 'concluido')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <FiCheckCircle className="-ml-1 mr-2 h-5 w-5" />
                        Concluir
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Status da Impressora */}
                {statusImpressora && (
                  <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-200">
                    <div className="flex items-center">
                      <FiInfo className="flex-shrink-0 h-5 w-5 text-blue-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-800">{statusImpressora}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Conteúdo do Pedido premium */}
              <div className="px-6 py-6 space-y-6">
                {/* Informações do Cliente e Pedido */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Informações do Cliente */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FiUser className="mr-2 h-5 w-5 text-indigo-500" />
                      Informações do Cliente
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Nome</p>
                          <p className="mt-1 text-sm text-gray-900 font-medium">{pedidoSelecionado.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Telefone</p>
                          <p className="mt-1 text-sm text-gray-900 font-medium flex items-center">
                            <FiPhone className="mr-1 h-4 w-4" />
                            {pedidoSelecionado.phone}
                          </p>
                        </div>
                      </div>
                      
                      {pedidoSelecionado.email && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="mt-1 text-sm text-gray-900 font-medium flex items-center">
                            <FiMail className="mr-1 h-4 w-4" />
                            {pedidoSelecionado.email}
                          </p>
                        </div>
                      )}
                      
                      {pedidoSelecionado.orderType === 'delivery' && (
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500 flex items-center">
                              <FiTruck className="mr-1 h-4 w-4 text-blue-500" />
                              Endereço de Entrega
                            </p>
                            <div className="mt-1 pl-5">
                              <p className="text-sm text-gray-900 font-medium">{pedidoSelecionado.address}</p>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                  <p className="text-xs text-gray-500">Código Postal</p>
                                  <p className="text-sm text-gray-900">{pedidoSelecionado.postalCode}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Cidade</p>
                                  <p className="text-sm text-gray-900">{pedidoSelecionado.city}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {pedidoSelecionado.needsInvoice && pedidoSelecionado.nif && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 flex items-center">
                            <FiFileText className="mr-1 h-4 w-4" />
                            Dados Faturação
                          </p>
                          <p className="mt-1 text-sm text-gray-900 pl-5">
                            NIF: {pedidoSelecionado.nif}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detalhes do Pedido */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FiShoppingBag className="mr-2 h-5 w-5 text-indigo-500" />
                      Detalhes do Pedido
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Tipo</p>
                          <p className="mt-1 text-sm text-gray-900 font-medium flex items-center">
                            {pedidoSelecionado.orderType === 'delivery' ? (
                              <>
                                <FiTruck className="mr-1 h-4 w-4 text-blue-500" />
                                Entrega
                              </>
                            ) : (
                              <>
                                <FiHome className="mr-1 h-4 w-4 text-green-500" />
                                Retirada
                              </>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Pagamento</p>
                          <p className="mt-1 text-sm text-gray-900 font-medium flex items-center">
                            {pedidoSelecionado.paymentMethod === 'mbway' ? (
                              <>
                                <FaMobileAlt className="mr-1 h-4 w-4 text-purple-500" />
                                MB WAY
                                {pedidoSelecionado.paymentDetails?.mbwayNumber && (
                                  <span className="ml-1">({pedidoSelecionado.paymentDetails.mbwayNumber})</span>
                                )}
                              </>
                            ) : 
                            pedidoSelecionado.paymentMethod === 'creditCard' ? (
                              <>
                                <FaCcVisa className="mr-1 h-4 w-4 text-blue-500" />
                                Cartão
                              </>
                            ) : (
                              <>
                                <FiDollarSign className="mr-1 h-4 w-4 text-green-500" />
                                Dinheiro
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      {pedidoSelecionado.paymentMethod === 'cash' && pedidoSelecionado.changeFor && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Troco</p>
                          <p className="mt-1 text-sm text-gray-900 font-medium">
                            EUR{pedidoSelecionado.changeFor.toFixed(2)}
                            {pedidoSelecionado.changeAmount && pedidoSelecionado.changeAmount > 0 ? (
                              <span className="ml-2 text-green-600">
                                (Troco: EUR{Number(pedidoSelecionado.changeAmount).toFixed(2)})
                              </span>
                            ) : null}
                          </p>
                        </div>
                      )}
                      
                      {pedidoSelecionado.orderNotes && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 flex items-center">
                            <FiEdit2 className="mr-1 h-4 w-4" />
                            Observações
                          </p>
                          <p className="mt-1 text-sm text-gray-900 bg-white p-3 rounded-md border border-gray-200">
                            {pedidoSelecionado.orderNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Itens do Pedido</h3>
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Opções
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantidade
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Preço Unitário
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pedidoSelecionado.items.map((item, index) => {
                          // Limpar o nome do item
                          const nomeLimpo = limparNomeItem(item.name);
                          const opcoes = getItemOptions(item);
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {nomeLimpo}
                              </td>
                              <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-xs">
                                {opcoes ? (
                                  <div className="bg-blue-50 p-2 rounded-md border border-blue-100">
                                    {opcoes}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Nenhuma</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                EUR{item.price.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                EUR{(item.price * item.quantity).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="4" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                            Taxa de Entrega:
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-900">
                            EUR{pedidoSelecionado.deliveryFee?.toFixed(2) || '0.00'}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="4" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                            Total:
                          </td>
                          <td className="px-6 py-3 text-sm font-bold text-gray-900">
                            EUR{pedidoSelecionado.total?.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
              {/* Cabeçalho da Lista de Pedidos premium */}
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {abaAtiva === 'pendentes' && 'Pedidos Pendentes'}
                      {abaAtiva === 'concluidos' && 'Pedidos Concluídos'}
                      {abaAtiva === 'cancelados' && 'Pedidos Cancelados'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {pedidosFiltrados.length} {pedidosFiltrados.length === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {abaAtiva === 'pendentes' && novosPedidosCount > 0 && (
                      <button
                        onClick={handleCloseNotification}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Marcar como visto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid de Pedidos premium */}
              {pedidosFiltrados.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pedidosFiltrados.map((pedido) => (
                    <div 
                      key={pedido.id} 
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 cursor-pointer group"
                      onClick={() => {
                        setPedidoSelecionado(pedido);
                        if (novoPedidoAlerta && (!pedido.status || pedido.status === 'pendente')) {
                          handleCloseNotification();
                        }
                      }}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {pedido.orderNumber || `#${pedido.id.slice(-6).toUpperCase()}`}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 flex items-center">
                              <FiClock className="mr-1 h-4 w-4" />
                              {formatarData(pedido.createdAt)}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCorStatus(pedido.status)}`}>
                            {getLabelStatus(pedido.status)}
                          </span>
                        </div>
                        
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center">
                            {pedido.orderType === 'delivery' ? (
                              <FiTruck className="flex-shrink-0 h-5 w-5 text-blue-500" />
                            ) : (
                              <FiHome className="flex-shrink-0 h-5 w-5 text-green-500" />
                            )}
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {pedido.orderType === 'delivery' ? 'Entrega' : 'Retirada'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {pedido.orderType === 'delivery' ? 'Entregar no endereço' : 'Cliente irá retirar'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <FiUser className="flex-shrink-0 h-5 w-5 text-gray-400" />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{pedido.name}</p>
                              <p className="text-sm text-gray-500">{pedido.phone}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            {pedido.paymentMethod === 'mbway' ? (
                              <FaMobileAlt className="flex-shrink-0 h-5 w-5 text-purple-500" />
                            ) : pedido.paymentMethod === 'creditCard' ? (
                              <FaCcVisa className="flex-shrink-0 h-5 w-5 text-blue-500" />
                            ) : (
                              <FiDollarSign className="flex-shrink-0 h-5 w-5 text-green-500" />
                            )}
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {pedido.paymentMethod === 'mbway' ? 'MB WAY' : 
                                 pedido.paymentMethod === 'creditCard' ? 'Cartão de Crédito' : 'Pagamento em Dinheiro'}
                              </p>
                              {pedido.paymentMethod === 'mbway' && pedido.paymentDetails?.mbwayNumber && (
                                <p className="text-sm text-gray-500">{pedido.paymentDetails.mbwayNumber}</p>
                              )}
                              {pedido.paymentMethod === 'cash' && pedido.changeFor && (
                                <p className="text-sm text-gray-500">Troco para EUR{pedido.changeFor.toFixed(2)}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Indicador de opções especiais */}
                        {pedido.items.some(item => item.options && (item.options.meatPoint || item.options.sides)) && (
                          <div className="mt-3 bg-yellow-50 p-2 rounded-md border border-yellow-200">
                            <div className="flex items-center text-yellow-700">
                              <FiAlertCircle className="flex-shrink-0 h-4 w-4 mr-2" />
                              <span className="text-xs font-medium">Contém opções especiais (ponto da carne/acompanhamentos)</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-500">Total de Itens</span>
                            <span className="text-sm font-medium text-gray-900">
                              {pedido.items.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-medium text-gray-500">Valor Total</span>
                            <span className="text-lg font-bold text-gray-900">
                              EUR{pedido.total?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100">
                    <FiShoppingBag className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {abaAtiva === 'pendentes' && 'Nenhum pedido pendente'}
                    {abaAtiva === 'concluidos' && 'Nenhum pedido concluído'}
                    {abaAtiva === 'cancelados' && 'Nenhum pedido cancelado'}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {abaAtiva === 'pendentes' && 'Novos pedidos aparecerão aqui assim que forem realizados.'}
                    {abaAtiva === 'concluidos' && 'Os pedidos concluídos serão exibidos nesta seção.'}
                    {abaAtiva === 'cancelados' && 'Os pedidos cancelados serão exibidos nesta seção.'}
                  </p>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
            {/* Cabeçalho do Gerenciamento de Evento premium */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FiImage className="mr-2 h-5 w-5 text-indigo-500" />
                Gerenciamento de Promoção
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Atualize a imagem promocional exibida no site and aplicativo
              </p>
            </div>

            {/* Conteúdo do Evento premium */}
            <div className="p-6">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Imagem Atual */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Imagem Atual</h3>
                  {imagemEvento ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                      <img 
                        src={imagemEvento} 
                        alt="Promoção Atual" 
                        className="w-full h-auto object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                        <button
                          onClick={removerImagemEvento}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FiTrash2 className="-ml-1 mr-2 h-5 w-5" />
                          Remover Imagem
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center bg-gray-50">
                      <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhima imagem ativa</h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Faça upload de uma imagem para exibir como promoção no site
                      </p>
                    </div>
                  )}
                </div>

                {/* Formulário de Upload premium */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Enviar Nova Imagem</h3>
                  <form onSubmit={handleUploadImagem} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Selecione uma imagem
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl bg-gray-50 transition-colors hover:border-indigo-500 hover:bg-indigo-50/50">
                        <div className="space-y-1 text-center">
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                            >
                              <span>Clique para selecionar</span>
                              <input 
                                id="file-upload" 
                                name="file-upload" 
                                type="file" 
                                className="sr-only"
                                accept="image/jpeg, image/png"
                                onChange={handleArquivoChange}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG ou JPG (máx. 10MB)
                          </p>
                        </div>
                      </div>
                    </div>

                    {previewImagem && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Pré-visualização</h4>
                        <div className="border-2 border-gray-200 rounded-xl p-2 bg-white">
                          <img 
                            src={previewImagem} 
                            alt="Pré-visualização" 
                            className="w-full h-auto max-h-48 object-contain rounded-lg"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-3">
                      {previewImagem && (
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImagem('');
                            setArquivoImagem(null);
                          }}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={!arquivoImagem || enviando}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${enviando || !arquivoImagem ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                      >
                        {enviando ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <FiUpload className="-ml-1 mr-2 h-5 w-5" />
                            Atualizar Imagem
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Diretrizes premium */}
                  <div className="mt-8 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <div className="flex">
                      <FiInfo className="flex-shrink-0 h-5 w-5 text-indigo-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-indigo-800">Recomendações para a Imagem</h3>
                        <div className="mt-2 text-sm text-indigo-700">
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Utilize imagens de alta qualidade (recomendado 800×800 pixels)</li>
                            <li>Formato quadrado (proporção 1:1) para melhor exibição</li>
                            <li>Evite textos muito pequenos que possam ficar ilegíveis</li>
                            <li>A imagem será exibida no popup de boas-vindas e na seção de promoções</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;