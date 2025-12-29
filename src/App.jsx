import { useState, useEffect } from 'react';
import { ShieldCheck, User } from 'lucide-react';

// --- CONFIGURAÇÕES DE ELITE ---
const TEMPO_PARA_BOTAO_APARECER = 410; // 406s do vídeo + 4s margem
const LINK_DO_CHECKOUT = "https://pay.hotmart.com/N103569021R?off=s3u1zz2j"; 
const VAGAS_INICIAIS = 19;
const LIMITE_MINIMO_VAGAS = 2; 
const VELOCIDADE_DO_SISTEMA = 40000; // 40 segundos (Ritmo Cardíaco da Página)

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

  // --- O "GAME LOOP" (CORAÇÃO DO SISTEMA) ---
  // Um único intervalo controla TUDO para garantir sincronia perfeita.
  useEffect(() => {
    const gameLoop = setInterval(() => {
      
      // PASSO 1: Decidir se baixa a vaga ou mantém
      let vagaAtualizada;
      setVagas((vagasAtuais) => {
        // Se já está no limite (2), mantém. Se não, baixa 1.
        if (vagasAtuais <= LIMITE_MINIMO_VAGAS) {
          vagaAtualizada = LIMITE_MINIMO_VAGAS;
          return LIMITE_MINIMO_VAGAS;
        } else {
          vagaAtualizada = vagasAtuais - 1;
          return vagasAtuais - 1;
        }
      });

      // PASSO 2: Gerar a notificação baseada na decisão da vaga
      // Usamos um setTimeout minúsculo (100ms) só para garantir que o React processou o estado
      setTimeout(() => {
        const nomeRandom = NOMES_LATAM_MASCULINOS[Math.floor(Math.random() * NOMES_LATAM_MASCULINOS.length)];
        const letraRandom = gerarLetraAleatoria();
        let acaoRandom;

        // SE o sistema travou em 2 vagas -> Mostra gente no Checkout
        // SE o sistema ainda tem vagas caindo -> Mostra gente Comprando
        // Usamos a variável 'vagas' direta do estado ou a lógica de limite
        setVagas((vagasNoMomento) => {
           if (vagasNoMomento <= LIMITE_MINIMO_VAGAS) {
              acaoRandom = ACOES_CHECKOUT[Math.floor(Math.random() * ACOES_CHECKOUT.length)];
           } else {
              acaoRandom = ACOES_COMPRA[Math.floor(Math.random() * ACOES_COMPRA.length)];
           }
           
           const mensagemFinal = `${nomeRandom} ${letraRandom}. ${acaoRandom}`;
           setNotificacaoAtual(mensagemFinal);
           return vagasNoMomento; // Retorna o mesmo valor só pra ler o estado
        });

        // Esconde a notificação depois de 6 segundos
        setTimeout(() => setNotificacaoAtual(null), 6000);

      }, 100);

    }, VELOCIDADE_DO_SISTEMA); // Roda a cada 40s

    return () => clearInterval(gameLoop);
  }, []);

  // Timer separado APENAS para o Botão (pois ele só roda uma vez e para)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarBotao(true);
    }, TEMPO_PARA_BOTAO_APARECER * 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 font-sans bg-gray-100 text-gray-800">
      
      <div className="w-full max-w-4xl bg-black rounded-xl shadow-2xl overflow-hidden mb-6 aspect-video relative group">
        <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
           {/* MANTENHA O CÓDIGO DO VTURB AQUI */}
           <p className="text-gray-400">Video Player (VTurb)</p>
        </div>
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
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-full text-xl shadow-xl transition-transform hover:scale-105 uppercase text-center"
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