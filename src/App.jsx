import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, User } from 'lucide-react';

// --- CONFIGURAÇÕES ---
const TEMPO_PARA_BOTAO_APARECER = 410; 
const LINK_DO_CHECKOUT = "https://pay.hotmart.com/N103569021R?off=s3u1zz2j"; 
const VAGAS_INICIAIS = 19;
const LIMITE_MINIMO_VAGAS = 2; 

const TEMPO_MINIMO = 20000; 
const TEMPO_MAXIMO = 50000; 

const NOMES_LATAM_MASCULINOS = [
  "Santiago", "Mateo", "Sebastián", "Miguel", "Felipe", "Alejandro", "Daniel", 
  "Diego", "Nicolás", "Samuel", "Leonardo", "Adrián", "Lucas", "Gabriel", 
  "Joaquín", "Eduardo", "Carlos", "Juan", "Pedro", "Luis", "Jorge", "Fernando", 
  "Ricardo", "Andrés", "Javier", "Manuel", "Roberto", "Francisco", "José"
];

const ACOES_COMPRA = [
  "acaba de asegurar el precio promocional.",
  "garantizó su cupo con descuento.",
  "aprovechó la oferta especial.",
  "completó su inscripción con éxito."
];

const ACOES_CHECKOUT = [
  "está finalizando su compra en el checkout...",
  "está rellenando sus datos de pago...",
  "generó un ticket de pago en efectivo.",
  "está verificando la disponibilidad...",
  "está en la página de pago ahora mismo."
];

const gerarLetraAleatoria = () => {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letras.charAt(Math.floor(Math.random() * letras.length));
};

function App() {
  const [vagas, setVagas] = useState(VAGAS_INICIAIS);
  const [mostrarBotao, setMostrarBotao] = useState(false);
  const [notificacaoAtual, setNotificacaoAtual] = useState(null);
  
  const timeoutRef = useRef(null);

  // --- 1. CARREGAR O VÍDEO DO VTURB (Script Injector) ---
  useEffect(() => {
    // Verifica se o script já existe para não carregar 2 vezes
    if (document.getElementById('vturb-script')) return;

    const script = document.createElement("script");
    // Esse link veio do código Javascript que você me mandou
    script.src = "https://scripts.converteai.net/b6a53cb5-aa1a-47b3-af2b-b93c7fe8b86c/players/6954a9d9a1bd76c80af63b83/v4/player.js";
    script.async = true;
    script.id = 'vturb-script';
    document.head.appendChild(script);
  }, []);

  // --- 2. MOTOR DE ALEATORIEDADE (Notificações) ---
  useEffect(() => {
    const rodarCicloAleatorio = () => {
      const tempoProximaAcao = Math.floor(Math.random() * (TEMPO_MAXIMO - TEMPO_MINIMO + 1) + TEMPO_MINIMO);
      
      timeoutRef.current = setTimeout(() => {
        setVagas((vagasAtuais) => {
          let novaVaga;
          if (vagasAtuais <= LIMITE_MINIMO_VAGAS) {
            novaVaga = LIMITE_MINIMO_VAGAS;
          } else {
            novaVaga = vagasAtuais - 1;
          }

          const nomeRandom = NOMES_LATAM_MASCULINOS[Math.floor(Math.random() * NOMES_LATAM_MASCULINOS.length)];
          const letraRandom = gerarLetraAleatoria();
          let acaoRandom;

          if (novaVaga <= LIMITE_MINIMO_VAGAS) {
             acaoRandom = ACOES_CHECKOUT[Math.floor(Math.random() * ACOES_CHECKOUT.length)];
          } else {
             acaoRandom = ACOES_COMPRA[Math.floor(Math.random() * ACOES_COMPRA.length)];
          }
          
          const mensagemFinal = `${nomeRandom} ${letraRandom}. ${acaoRandom}`;
          setNotificacaoAtual(mensagemFinal);
          
          setTimeout(() => setNotificacaoAtual(null), 5000);

          return novaVaga;
        });

        rodarCicloAleatorio();

      }, tempoProximaAcao);
    };

    rodarCicloAleatorio();
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // Timer do Botão
  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarBotao(true);
    }, TEMPO_PARA_BOTAO_APARECER * 1000);
    return () => clearTimeout(timer);
  }, []);

  // Rastreamento do Clique
  const handleCompraClick = () => {
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 font-sans bg-gray-100 text-gray-800">
      
      {/* --- ÁREA DO VÍDEO (AGORA COM VTURB REAL) --- */}
      <div className="w-full max-w-4xl bg-black rounded-xl shadow-2xl overflow-hidden mb-6 aspect-video relative group z-10">
        {/* A Tag vturb-smartplayer é um elemento customizado do script deles */}
        <vturb-smartplayer
          id="vid-6954a9d9a1bd76c80af63b83"
          style={{ width: '100%', height: '100%', display: 'block' }}
        ></vturb-smartplayer>
      </div>

      <div className="text-center space-y-2 mb-8 max-w-2xl">
        <p className="text-lg md:text-xl font-medium text-gray-700">
          Cupos disponibles: solo quedan <span className="text-red-600 font-bold text-2xl animate-pulse">{vagas}</span> con precio promocional
        </p>
        <p className="text-sm text-gray-500">
          De <span className="line-through">US$ 250.00</span> por solo <span className="font-bold text-green-600 text-lg">US$ 9.90</span>
        </p>
      </div>

      {mostrarBotao && (
        <div className="animate-bounce flex flex-col items-center gap-2">
          <a 
            href={LINK_DO_CHECKOUT}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCompraClick}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-full text-xl shadow-xl transition-transform hover:scale-105 uppercase text-center cursor-pointer"
          >
            ¡QUIERO ASEGURAR MI CUPO AHORA!
          </a>
          <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide mt-2">
            <ShieldCheck size={14} className="text-green-500" />
            <span>Sitio Blindado y 100% Seguro</span>
          </div>
        </div>
      )}

      {notificacaoAtual && (
        <div className="fixed bottom-5 left-5 bg-white border-l-4 border-green-500 shadow-lg rounded-r-lg p-4 flex items-center gap-3 animate-slide-in z-50 max-w-xs">
          <div className="bg-green-100 p-2 rounded-full">
            <User size={18} className="text-green-700" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-800">
              {vagas <= LIMITE_MINIMO_VAGAS ? "¡Casi se agota!" : "¡Nuevo Alumno!"}
            </p>
            <p className="text-xs text-gray-600 leading-tight">{notificacaoAtual}</p>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
        }
      `}</style>

    </div>
  );
}

export default App;