import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, User } from 'lucide-react';

// --- CONFIGURAÇÕES ---
const TEMPO_PARA_BOTAO_APARECER = 410; // 406s do vídeo + 4s de margem
const LINK_DO_CHECKOUT = "https://pay.hotmart.com/N103569021R?off=s3u1zz2j"; 
const VAGAS_INICIAIS = 19;
const LIMITE_MINIMO_VAGAS = 2; 

// Intervalos da Prova Social
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
  const [mostrarOferta, setMostrarOferta] = useState(false); // Mudamos o nome para ficar mais claro
  const [notificacaoAtual, setNotificacaoAtual] = useState(null);
  
  const timeoutRef = useRef(null);

  // --- 1. CARREGAR VTURB ---
  useEffect(() => {
    if (document.getElementById('vturb-script')) return;
    const script = document.createElement("script");
    script.src = "https://scripts.converteai.net/b6a53cb5-aa1a-47b3-af2b-b93c7fe8b86c/players/6954a9d9a1bd76c80af63b83/v4/player.js";
    script.async = true;
    script.id = 'vturb-script';
    document.head.appendChild(script);
  }, []);

  // --- 2. MOTOR DE NOTIFICAÇÕES ---
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

  // --- 3. TIMER DA REVELAÇÃO (PITCH) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarOferta(true);
    }, TEMPO_PARA_BOTAO_APARECER * 1000);
    return () => clearTimeout(timer);
  }, []);

  // Rastreamento
  const handleCompraClick = () => {
    if (window.fbq) window.fbq('track', 'InitiateCheckout');
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 font-sans bg-gray-100 text-gray-800">
      
      {/* VÍDEO (SEMPRE VISÍVEL) - Ajustado para 3:4 Mobile */}
      <div className="w-full max-w-sm mx-auto bg-transparent rounded-xl overflow-hidden mb-6 relative z-10 aspect-[3/4]">
        <vturb-smartplayer
          id="vid-6954a9d9a1bd76c80af63b83"
          style={{ width: '100%', height: '100%', display: 'block' }}
        ></vturb-smartplayer>
      </div>

      {/* --- BLOCO DA OFERTA (Só aparece depois do Pitch) --- */}
      {mostrarOferta && (
        <div className="w-full max-w-2xl flex flex-col items-center animate-fade-in">
          
          {/* 1. TEXTO DE ESCASSEZ */}
          <div className="text-center space-y-2 mb-6">
            <p className="text-lg md:text-xl font-medium text-gray-700">
              Cupos disponibles: solo quedan <span className="text-red-600 font-bold text-2xl animate-pulse">{vagas}</span> con precio promocional
            </p>
            <p className="text-sm text-gray-500">
              De <span className="line-through">US$ 250.00</span> por solo <span className="font-bold text-green-600 text-lg">US$ 9.90</span>
            </p>
          </div>

          {/* 2. BOTÃO DE CHECKOUT */}
          <div className="animate-bounce flex flex-col items-center gap-2 mb-8 w-full">
            <a 
              href={LINK_DO_CHECKOUT}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCompraClick}
              className="w-full max-w-md bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-full text-xl shadow-xl transition-transform hover:scale-105 uppercase text-center cursor-pointer flex flex-col items-center justify-center leading-tight"
            >
              <span>¡QUIERO ASEGURAR MI CUPO!</span>
              <span className="text-xs font-normal opacity-90 mt-1">Oferta por tiempo limitado</span>
            </a>
            
            <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide mt-2">
              <ShieldCheck size={14} className="text-green-500" />
              <span>Sitio Blindado y 100% Seguro</span>
            </div>
          </div>

          {/* 3. NOTIFICAÇÃO (AGORA FIXA EMBAIXO DO BOTÃO) */}
          <div className="h-20 w-full max-w-md flex justify-center items-start">
            {notificacaoAtual ? (
              <div className="bg-white border border-gray-200 shadow-md rounded-lg p-3 flex items-center gap-3 w-full animate-slide-up">
                <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                  <User size={20} className="text-green-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800 leading-none mb-1">
                    {vagas <= LIMITE_MINIMO_VAGAS ? "¡Casi se agota!" : "¡Nuevo Alumno!"}
                  </p>
                  <p className="text-xs text-gray-600 leading-tight">{notificacaoAtual}</p>
                </div>
              </div>
            ) : (
              // Espaço vazio para o layout não pular quando não tem notificação
              <div className="text-xs text-gray-300 italic">...</div>
            )}
          </div>

        </div>
      )}

      {/* Animações CSS */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>

    </div>
  );
}

export default App;