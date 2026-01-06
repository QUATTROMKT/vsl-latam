import { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, User, CheckCircle, ArrowRight, Brain, Activity, 
  Heart, X, Check, Lock, BookOpen, Smartphone, Award, HelpCircle, ChevronDown, Calendar, Gift, PlayCircle
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// ==========================================
// 1. DADOS E CONFIGURAÇÕES
// ==========================================

const PERGUNTAS_QUIZ = [
  {
    id: 1, 
    titulo: "¿Cuál es tu situación actual?",
    imagem: null,
    opcoes: [
      { texto: "Estoy casado o viviendo en pareja (hace más de 1 año).", icone: "💍" },
      { texto: "Estoy en una relación reciente.", icone: "💑" },
      { texto: "Estoy soltero.", icone: "👱‍♂️" }
    ]
  },
  {
    id: 2, 
    titulo: "¿Cuándo fue la última vez que tu pareja te buscó espontáneamente para tener intimidad (sin que tú lo pidieras)?",
    imagem: null,
    opcoes: [
      { texto: "Hace unas semanas.", icone: "❗" },
      { texto: "Hace meses.", icone: "🚨" },
      { texto: "Ya ni me acuerdo (Parecemos compañeros de casa).", icone: "🆘" },
      { texto: "Solo pasa en fechas especiales (cumpleaños, aniversario).", icone: "☠️" }
    ]
  },
  {
    id: 3, 
    titulo: "Cuando intentas iniciar algo en la cama, ¿cuál es la excusa más común que ella usa?",
    imagem: null,
    opcoes: [
      { texto: "\"Estoy cansada\" o \"Me duele la cabeza\".", icone: "🤕" },
      { texto: "\"Ahora no, los niños pueden escuchar\".", icone: "👶" },
      { texto: "Simplemente cambia de tema o se aleja.", icone: "🤐" },
      { texto: "Lo hacemos, pero siento que lo hace \"por obligación\" (estrella de mar).", icone: "🙄" }
    ]
  },
  {
    id: 4, 
    titulo: "¿Sabías que la neurociencia ha descubierto que el cerebro femenino tiene un 'Interruptor de Deseo' que se apaga automáticamente si no recibe los estímulos correctos?",
    imagem: null,
    opcoes: [
      { texto: "No, no tenía idea. Pensé que ella ya no me quería.", icone: "❌" },
      { texto: "He escuchado algo, pero no sé cómo activarlo.", icone: "🧠" }
    ]
  },
  {
    id: 5, 
    titulo: "Esto explica por qué nada de lo que has intentado hasta ahora ha funcionado:",
    imagem: "/noticia-cnn.png", 
    textoBotao: "Ahora entiendo",
    opcoes: [] 
  },
  {
    id: 6, 
    titulo: "Si existiera un paso a paso para 'resetear' ese interruptor y hacer que ella te desee como cuando eran novios, ¿estarías dispuesto a probarlo hoy mismo?",
    imagem: null,
    opcoes: [
      { texto: "Sí, quiero recuperar mi matrimonio y mi vida íntima.", icone: "✅" },
      { texto: "Quizás más adelante.", icone: "🕒" }
    ]
  }
];

const TEMPO_DE_ANALISE_FAKE = 4000; 

// --- CONFIGURAÇÕES DA VSL ---
const TEMPO_PARA_BOTAO_APARECER = 445; // 410 segundos
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

const trackCustomEvent = (eventName, params = {}) => {
  if (window.fbq) {
    console.log(`📡 Evento Disparado: ${eventName}`, params);
    window.fbq('trackCustom', eventName, params);
  }
};

// ==========================================
// APP PRINCIPAL
// ==========================================
function App() {
  const [faseAtual, setFaseAtual] = useState('intro');
  const [indicePerguntaAtual, setIndicePerguntaAtual] = useState(0);
  const [progressoAnalise, setProgressoAnalise] = useState(0);

  // Estados da VSL
  const [vagas, setVagas] = useState(VAGAS_INICIAIS);
  const [mostrarOferta, setMostrarOferta] = useState(false);
  const [notificacaoAtual, setNotificacaoAtual] = useState(null);
  const timeoutRef = useRef(null);
  
  // REFERÊNCIA PARA O SCROLL AUTOMÁTICO
  const offerSectionRef = useRef(null);

  // --- LÓGICA DE NAVEGAÇÃO DO QUIZ ---
  const iniciarQuiz = () => {
    trackCustomEvent('QuizStart'); 
    setFaseAtual('quiz');
  };

  const irParaProximaEtapa = () => {
    trackCustomEvent(`QuestionAnswered`, { question_number: indicePerguntaAtual + 1 });

    const proxima = indicePerguntaAtual + 1;
    if (proxima < PERGUNTAS_QUIZ.length) {
      setIndicePerguntaAtual(proxima);
      window.scrollTo(0, 0);
    } else {
      trackCustomEvent('QuizFinished'); 
      setFaseAtual('analisando');
    }
  };

  // --- LÓGICA DA ANÁLISE (2 BARRAS) ---
  useEffect(() => {
    if (faseAtual !== 'analisando') return;
    const intervalo = setInterval(() => {
      setProgressoAnalise((old) => (old >= 100 ? 100 : old + 2));
    }, TEMPO_DE_ANALISE_FAKE / 50);

    const timer = setTimeout(() => {
      setFaseAtual('resultado'); 
    }, TEMPO_DE_ANALISE_FAKE + 500);

    return () => { clearInterval(intervalo); clearTimeout(timer); };
  }, [faseAtual]);

  // --- LÓGICA DA VSL (CARREGAMENTO + OTIMIZAÇÃO) ---
  useEffect(() => {
    if (faseAtual !== 'vsl') return;
    trackCustomEvent('VSLLoaded'); 
    
    !function(i,n){i._plt=i._plt||(n&&n.timeOrigin?n.timeOrigin+n.now():Date.now())}(window,performance);

    if (document.getElementById('vturb-script')) return;
    const script = document.createElement("script");
    script.src = "https://scripts.converteai.net/b6a53cb5-aa1a-47b3-af2b-b93c7fe8b86c/players/695c2cb510ea8bb29001aba0/v4/player.js";
    script.async = true;
    script.id = 'vturb-script';
    document.head.appendChild(script);
  }, [faseAtual]);

  // --- LÓGICA DA VSL (TIMER + SCROLL AUTOMÁTICO) ---
  useEffect(() => {
    if (faseAtual !== 'vsl') return;

    // TIMER DO PITCH
    const timer = setTimeout(() => {
        setMostrarOferta(true);
        trackCustomEvent('PitchReveal'); 
        
        // SCROLL SUAVE AUTOMÁTICO PARA A OFERTA
        setTimeout(() => {
          if (offerSectionRef.current) {
            offerSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100); 

    }, TEMPO_PARA_BOTAO_APARECER * 1000);

    // NOTIFICAÇÕES
    const rodarNotificacoes = () => {
      const tempo = Math.floor(Math.random() * (TEMPO_MAXIMO - TEMPO_MINIMO + 1) + TEMPO_MINIMO);
      timeoutRef.current = setTimeout(() => {
        setVagas((v) => {
          const nv = v <= LIMITE_MINIMO_VAGAS ? LIMITE_MINIMO_VAGAS : v - 1;
          const nome = NOMES_LATAM_MASCULINOS[Math.floor(Math.random() * NOMES_LATAM_MASCULINOS.length)];
          const acao = nv <= LIMITE_MINIMO_VAGAS 
            ? ACOES_CHECKOUT[Math.floor(Math.random() * ACOES_CHECKOUT.length)]
            : ACOES_COMPRA[Math.floor(Math.random() * ACOES_COMPRA.length)];
          setNotificacaoAtual(`${nome} ${gerarLetraAleatoria()}. ${acao}`);
          setTimeout(() => setNotificacaoAtual(null), 5000);
          return nv;
        });
        rodarNotificacoes();
      }, tempo);
    };
    rodarNotificacoes();

    return () => { clearTimeout(timer); clearTimeout(timeoutRef.current); };
  }, [faseAtual]);

  const handleCompraClick = () => {
    if (window.fbq) window.fbq('track', 'InitiateCheckout'); 
    if (window.smartplayer && window.smartplayer.instances) {
      window.smartplayer.instances.forEach((i) => i.pause());
    }
  };

  const irParaVSL = () => {
      window.scrollTo(0, 0);
      setFaseAtual('vsl');
  }

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col items-center">
      
      {/* FASE 1: INTRO */}
      {faseAtual === 'intro' && (
        <div className="w-full max-w-md bg-white min-h-screen p-6 flex flex-col justify-center text-center animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
            ¿Es realmente <span className='text-red-600'>'Cansancio'</span> o es un <span className='text-red-600'>Bloqueo Químico?</span>
          </h1>
          <p className="text-gray-600 mb-8 mt-4 text-sm md:text-base">
            Responde a 5 preguntas rápidas para recibir tu <span className="text-green-600 font-bold">diagnóstico confidencial</span>.
          </p>
          <button onClick={iniciarQuiz} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-full text-lg shadow-lg transition-transform hover:scale-105 uppercase">
            COMENZAR DIAGNÓSTICO GRATUITO
          </button>
        </div>
      )}

      {/* FASE 2: QUIZ */}
      {faseAtual === 'quiz' && (
        <div className="w-full max-w-md bg-white min-h-screen flex flex-col animate-fade-in">
          <div className="w-full bg-gray-200 h-2">
            <div className="bg-gray-600 h-2 transition-all duration-300" style={{ width: `${((indicePerguntaAtual + 1) / PERGUNTAS_QUIZ.length) * 100}%` }}></div>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            <h2 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-6 leading-snug">
              <span dangerouslySetInnerHTML={{ __html: PERGUNTAS_QUIZ[indicePerguntaAtual].titulo
                .replace("'Interruptor de Deseo'", "<span class='text-green-600'>'Interruptor de Deseo'</span>")
                .replace("no recibe los estímulos correctos", "<span class='text-red-600'>no recibe los estímulos correctos</span>")
                .replace("nada", "<span class='text-red-600'>nada</span>")
                .replace("explica", "<span class='text-green-600'>explica</span>")
                .replace("paso a paso", "<span class='text-green-600'>paso a paso</span>")
                .replace("'resetear'", "<span class='text-green-600'>'resetear'</span>")
                .replace("ella te desee", "<span class='text-blue-600'>ella te desee</span>")
                .replace("situación actual", "<span class='text-red-600'>situación actual</span>")
                .replace("la última vez", "<span class='text-red-600'>la última vez</span>")
                .replace("espontáneamente", "<span class='text-red-600 italic'>espontáneamente</span>")
                .replace("intimidad", "<span class='text-red-600'>intimidad</span>")
                .replace("en la cama", "<span class='text-red-600'>en la cama</span>")
                .replace("la excusa más común", "<span class='text-red-600'>la excusa más común</span>")
               }} />
            </h2>
            {PERGUNTAS_QUIZ[indicePerguntaAtual].imagem && (
              <img src={PERGUNTAS_QUIZ[indicePerguntaAtual].imagem} alt="Illustration" className="w-full rounded-lg shadow-sm mb-6 border border-gray-100"/>
            )}
            <div className="space-y-3">
              {PERGUNTAS_QUIZ[indicePerguntaAtual].opcoes.length > 0 ? (
                PERGUNTAS_QUIZ[indicePerguntaAtual].opcoes.map((opcao, idx) => (
                  <button key={idx} onClick={irParaProximaEtapa} className="w-full p-4 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl text-left flex items-center gap-4 transition-colors group">
                    <span className="text-2xl flex-shrink-0">{opcao.icone}</span>
                    <span className="font-medium text-gray-800 text-sm md:text-base">{opcao.texto}</span>
                  </button>
                ))
              ) : (
                <button onClick={irParaProximaEtapa} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-full text-lg shadow-lg uppercase mt-4">
                  {PERGUNTAS_QUIZ[indicePerguntaAtual].textoBotao}
                </button>
              )}
            </div>
            {PERGUNTAS_QUIZ[indicePerguntaAtual].imagem && (
              <div className="mt-6 flex justify-center gap-4 opacity-70 grayscale">
                 <span className="font-bold text-gray-400 text-xs tracking-widest">CNN &bull; FORBES &bull; BBC</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FASE 3: ANÁLISE (2 BARRAS) */}
      {faseAtual === 'analisando' && (
        <div className="w-full max-w-md bg-white min-h-screen p-6 flex flex-col justify-center animate-fade-in">
          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-sm font-bold text-gray-800 mb-1">
                <span>Analizando respuestas...</span>
                <span>{Math.min(progressoAnalise + 14, 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="bg-gray-800 h-3 rounded-full transition-all duration-300" style={{ width: `${Math.min(progressoAnalise + 14, 100)}%` }}></div>
              </div>
            </div>
            <p className="text-gray-500 text-sm">Comparando con perfiles de 5,000 hombres...</p>
            <div>
              <div className="flex justify-between text-sm font-bold text-gray-800 mb-1">
                <span>Perfil Identificado.</span>
                <span>{progressoAnalise}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="bg-gray-800 h-3 rounded-full transition-all duration-300" style={{ width: `${progressoAnalise}%` }}></div>
              </div>
            </div>
            <p className="text-center text-gray-500 text-sm animate-pulse pt-4">Comparando con base de datos...</p>
            <button disabled className="w-full py-4 rounded-lg bg-green-800 opacity-50 text-white font-bold text-lg shadow-lg">Procesando...</button>
          </div>
        </div>
      )}

      {/* FASE 4: RESULTADO */}
      {faseAtual === 'resultado' && (
        <div className="w-full max-w-md bg-white min-h-screen p-6 flex flex-col justify-center text-center animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
            Según tus respuestas, <br/>
            <span className="text-green-600">tu esposa NO ha perdido el deseo sexual.</span>
          </h2>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 leading-tight">
            Simplemente está atrapada en el <span className="text-red-600">'Ciclo de Bloqueo de Dopamina'</span>.
          </h3>
          <p className="text-gray-700 text-sm md:text-base mb-8 leading-relaxed">
            Esto es <span className="text-red-500 font-bold">muy común</span> en relaciones de más de 2 años. La buena noticia es: <br/>
            <span className="text-green-600 font-bold text-lg">Es 100% reversible.</span>
          </p>
          <button onClick={irParaVSL} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-full text-lg shadow-lg uppercase">REVERTIR EL BLOQUEO AHORA</button>
        </div>
      )}

      {/* FASE 5: VSL */}
      {faseAtual === 'vsl' && (
        <div className="w-full flex flex-col items-center animate-fade-in">
          
          <div className="w-full bg-black py-4 text-center px-4 mb-2">
            <h1 className="text-red-600 animate-pulse text-lg md:text-2xl font-black uppercase tracking-wide leading-tight">
              Recupera el deseo animal de tu esposa con la ayuda de la ciencia
            </h1>
          </div>

          <div className="w-full max-w-sm mx-auto bg-transparent rounded-xl overflow-hidden mb-6 relative z-10 aspect-[3/4]">
            <vturb-smartplayer 
              id="vid-695c2cb510ea8bb29001aba0" 
              style={{ width: '100%', height: '100%', display: 'block' }}
            ></vturb-smartplayer>
          </div>

          {mostrarOferta && (
            <div ref={offerSectionRef} className="w-full flex flex-col items-center">
              
              {/* BLOCO DE OFERTA */}
              <div className="w-full max-w-2xl flex flex-col items-center animate-fade-in px-4">
                <div className="text-center space-y-2 mb-6">
                  <p className="text-lg md:text-xl font-medium text-gray-700">
                    Cupos disponibles: solo quedan <span className="text-red-600 font-bold text-2xl animate-pulse">{vagas}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    De <span className="line-through">US$ 49.90</span> por solo <span className="font-bold text-green-600 text-lg">US$ 9.90</span>
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3 mb-8 w-full max-w-md">
                  <a href={LINK_DO_CHECKOUT} target="_blank" rel="noopener noreferrer" onClick={handleCompraClick} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg transition-transform hover:scale-105 uppercase text-center cursor-pointer border-2 border-transparent hover:border-gray-700">
                    ASEGURAR MI LUGAR
                  </a>
                  <a href={LINK_DO_CHECKOUT} target="_blank" rel="noopener noreferrer" onClick={handleCompraClick} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-4 rounded-full text-lg shadow-xl transition-transform hover:scale-105 uppercase text-center cursor-pointer flex flex-col items-center justify-center leading-tight animate-pulse">
                    <span>QUIERO RECUPERAR A MI ESPOSA AHORA</span>
                    <span className="text-xs font-normal opacity-90 mt-1">Garantía Blindada de 30 Días</span>
                  </a>
                  <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide mt-2">
                    <ShieldCheck size={14} className="text-green-500" />
                    <span>Sitio Blindado y 100% Seguro</span>
                  </div>
                </div>

                <div className="h-20 w-full max-w-md flex justify-center items-start">
                  {notificacaoAtual ? (
                    <div className="bg-white border border-gray-200 shadow-md rounded-lg p-3 flex items-center gap-3 w-full animate-slide-up">
                      <div className="bg-green-100 p-2 rounded-full flex-shrink-0"><User size={20} className="text-green-700" /></div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800 leading-none mb-1">{vagas <= LIMITE_MINIMO_VAGAS ? "¡Casi se agota!" : "¡Nuevo Alumno!"}</p>
                        <p className="text-xs text-gray-600 leading-tight">{notificacaoAtual}</p>
                      </div>
                    </div>
                  ) : (<div className="text-xs text-gray-300 italic">...</div>)}
                </div>
              </div>

              {/* SALES PAGE HÍBRIDA */}
              <div className="w-full bg-slate-900 text-white py-12 px-4 animate-fade-in mt-8">
                
                {/* 1. SEÇÃO DA ESPECIALISTA */}
                <div className="flex flex-col items-center mb-10 text-center">
                   <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-amber-400 overflow-hidden shadow-2xl mb-4 relative">
                     <img src="/nadiaexpert.png" alt="Dra. Nádia Giménez" className="w-full h-full object-cover"/>
                   </div>
                   <h3 className="text-2xl font-bold text-amber-400">Dra. Nádia Giménez</h3>
                   <p className="text-gray-300 text-sm">Neurocientífica & Sexóloga Clínica</p>
                </div>

                {/* 2. SEÇÃO DE BENEFÍCIOS */}
                <div className="max-w-2xl mx-auto bg-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-700 mb-12">
                  <h3 className="text-xl md:text-2xl font-bold text-center text-white mb-6">
                    ¿Por qué el <span className="text-amber-400">Protocolo Libido Oculta</span> funciona?
                  </h3>
                  <ul className="space-y-4">
                    {[
                      { t: "100% Discreto", d: "Ella jamás sabrá que estás aplicando un método. Pensará que es algo natural." },
                      { t: "Sin Discusiones", d: "No necesitas tener 'charlas largas'. Actúas directo en la biología." },
                      { t: "Científicamente Comprobado", d: "Basado en estudios de la UNAM, no en consejos de gurús." },
                      { t: "Resultados Rápidos", d: "Los primeros cambios de actitud ocurren en las primeras 24 horas." }
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4 items-start">
                        <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={24} />
                        <div>
                          <strong className="text-white block text-lg">{item.t}</strong>
                          <span className="text-gray-300 text-sm leading-relaxed">{item.d}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. SEÇÃO PROVA SOCIAL (AGORA COM MOLDURA BRANCA) */}
                <div className="max-w-2xl mx-auto mb-12">
                  <h3 className="text-2xl font-bold text-center text-white mb-8">
                    Hombres como tú que ya salvaron sus matrimonios:
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Imagem 1 no Box Branco */}
                    <div className="bg-white p-2 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
                      <img src="/prova1.png" alt="Testimonio 1" className="w-full rounded-lg border border-gray-100" />
                    </div>
                    {/* Imagem 2 no Box Branco */}
                    <div className="bg-white p-2 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
                      <img src="/prova2.png" alt="Testimonio 2" className="w-full rounded-lg border border-gray-100" />
                    </div>
                  </div>
                </div>

                {/* 4. SEÇÃO O QUE VOCÊ VAI RECEBER */}
                <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 md:p-8 text-gray-800 shadow-xl mb-12">
                   <h3 className="text-2xl font-extrabold text-center text-slate-900 mb-4 uppercase tracking-wide">
                     Acceso Inmediato al Sistema Completo:
                   </h3>
                   <div className="flex justify-center mb-8">
                      <img src="/nomeproduto.png" alt="Sistema Completo" className="w-full max-w-sm drop-shadow-2xl animate-pulse" />
                   </div>
                   <div className="grid gap-6 md:grid-cols-2">
                      <div className="flex gap-4 items-start"><BookOpen className="text-blue-600 shrink-0" size={24} /><div><h4 className="font-bold">El Manual Principal</h4><p className="text-xs text-gray-600">Paso a paso de 28 días.</p></div></div>
                      <div className="flex gap-4 items-start"><Brain className="text-purple-600 shrink-0" size={24} /><div><h4 className="font-bold">La Ciencia Detrás</h4><p className="text-xs text-gray-600">Activa la testosterona.</p></div></div>
                      <div className="flex gap-4 items-start"><Smartphone className="text-green-600 shrink-0" size={24} /><div><h4 className="font-bold">Acceso Móvil</h4><p className="text-xs text-gray-600">Lee desde tu celular.</p></div></div>
                      <div className="flex gap-4 items-start"><Lock className="text-gray-600 shrink-0" size={24} /><div><h4 className="font-bold">Privacidad Total</h4><p className="text-xs text-gray-600">Cobro discreto.</p></div></div>
                   </div>
                </div>

                {/* 5. SEÇÃO BÔNUS (COM 4 BÔNUS) */}
                <div className="max-w-3xl mx-auto mb-12">
                  <h3 className="text-2xl font-bold text-center text-amber-400 mb-8">
                    ¡Solo HOY! Recibe 4 Regalos Exclusivos GRATIS:
                  </h3>
                  <div className="space-y-6">
                    <div className="bg-slate-800 border-l-4 border-amber-400 p-4 rounded-r-lg flex flex-col md:flex-row gap-4 items-center">
                      <img src="/bonus1.png" alt="Bono 1" className="w-24 h-auto rounded shadow-md"/>
                      <div className="flex-1"><h4 className="font-bold text-white text-lg">Bono 1: Comandos Verbales</h4><p className="text-sm text-gray-400">Frases exactas para decir en la cama.</p></div>
                      <div className="text-right shrink-0"><span className="text-xs text-red-400 line-through block">US$ 29</span><span className="font-bold text-green-400">GRATIS</span></div>
                    </div>
                    <div className="bg-slate-800 border-l-4 border-amber-400 p-4 rounded-r-lg flex flex-col md:flex-row gap-4 items-center">
                      <img src="/bonus2.png" alt="Bono 2" className="w-24 h-auto rounded shadow-md"/>
                      <div className="flex-1"><h4 className="font-bold text-white text-lg">Bono 2: 9 Puntos de Placer</h4><p className="text-sm text-gray-400">Dónde tocarla para activar la respuesta física.</p></div>
                      <div className="text-right shrink-0"><span className="text-xs text-red-400 line-through block">US$ 19</span><span className="font-bold text-green-400">GRATIS</span></div>
                    </div>
                    <div className="bg-slate-800 border-l-4 border-amber-400 p-4 rounded-r-lg flex flex-col md:flex-row gap-4 items-center">
                      <img src="/bonus3.png" alt="Bono 3" className="w-24 h-auto rounded shadow-md"/>
                      <div className="flex-1"><h4 className="font-bold text-white text-lg">Bono 3: Calendario de Blindaje</h4><p className="text-sm text-gray-400">Sabe qué días ella está receptiva.</p></div>
                      <div className="text-right shrink-0"><span className="text-xs text-red-400 line-through block">US$ 15</span><span className="font-bold text-green-400">GRATIS</span></div>
                    </div>
                     <div className="bg-slate-800 border-l-4 border-amber-400 p-4 rounded-r-lg flex flex-col md:flex-row gap-4 items-center">
                      <img src="/bonus4.png" alt="Bono 4" className="w-24 h-auto rounded shadow-md"/>
                      <div className="flex-1"><h4 className="font-bold text-white text-lg">Bono 4: Guía de Rescate Inmediato</h4><p className="text-sm text-gray-400">Qué hacer cuando sientes que la relación peligra.</p></div>
                      <div className="text-right shrink-0"><span className="text-xs text-red-400 line-through block">US$ 25</span><span className="font-bold text-green-400">GRATIS</span></div>
                    </div>
                  </div>
                </div>

                {/* 6. FAQ (VISUAL CARD) */}
                <div className="max-w-2xl mx-auto mb-12">
                  <h3 className="text-2xl font-bold text-center text-white mb-6">Preguntas Frecuentes</h3>
                  <div className="space-y-4">
                    {[
                      { p: "¿Sirve si mi esposa tiene menopausia?", r: "Sí. El método activa la testosterona residual que toda mujer tiene." },
                      { p: "¿Es seguro comprar aquí?", r: "Totalmente. Usamos tecnología de encriptación bancaria SSL." },
                      { p: "¿Cómo recibo el material?", r: "Inmediatamente por correo electrónico. Es 100% digital." },
                      { p: "¿Ella se dará cuenta?", r: "No. El método es sutil y parece un cambio natural." }
                    ].map((faq, i) => (
                      <details key={i} className="group bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 open:bg-slate-800 transition-all duration-300">
                        <summary className="flex justify-between items-center p-5 cursor-pointer font-medium text-white hover:text-amber-400 transition-colors">
                          {faq.p}
                          <ChevronDown className="transition-transform duration-300 group-open:rotate-180 text-gray-400" />
                        </summary>
                        <div className="px-5 pb-5 pt-0 text-gray-300 text-sm leading-relaxed border-t border-slate-700/0 group-open:border-slate-700/50 group-open:pt-4">
                          {faq.r}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>

                {/* 7. GARANTIA FINAL */}
                <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-300 to-amber-500"></div>
                  <Award size={64} className="text-amber-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-4">GARANTÍA DE HIERRO DE 30 DÍAS</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Si no ves cambios en la mirada, el toque y el deseo de tu esposa, te devuelvo el 100% de tu dinero.
                  </p>
                  <a href={LINK_DO_CHECKOUT} target="_blank" rel="noopener noreferrer" onClick={handleCompraClick} className="w-full block bg-green-600 hover:bg-green-700 text-white font-bold py-5 px-6 rounded-full text-lg shadow-xl uppercase transition-transform hover:scale-105">
                    SÍ, QUIERO ACTIVAR SU LIBIDO
                    <span className="block text-xs font-normal opacity-80 mt-1">Oferta por tiempo limitado: US$ 9.90</span>
                  </a>
                </div>

                <div className="text-center mt-12 text-slate-600 text-xs">
                  <p>&copy; 2026 Libido Oculta. Todos los derechos reservados.</p>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;