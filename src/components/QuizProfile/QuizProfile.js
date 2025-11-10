'use client';

import { useState } from 'react';
import { FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';
import styles from './QuizProfile.module.css';
import breedsData from '../../utils/dogBreeds.json'; // Importa o arquivo JSON com as raças

// --- PROCESSAMENTO DA LISTA DE RAÇAS ---
// Função para transformar o objeto JSON em uma lista de strings legíveis e ordenadas
const processBreeds = (data) => {
  const breedList = Object.entries(data.message).flatMap(([breed, subBreeds]) => {
    const mainBreed = breed.replace(/-/g, ' ');
    if (subBreeds.length === 0) {
      return [mainBreed];
    }
    return subBreeds.map(subBreed => `${mainBreed} ${subBreed}`);
  });
  const formattedBreeds = breedList.map(breed => 
    breed.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  );
  return formattedBreeds.sort();
};

// Executa a função uma vez para ter a lista pronta para uso no componente
const allBreeds = processBreeds(breedsData);

// --- DADOS DO CALENDÁRIO ---
// Gerados uma vez para otimizar a performance
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = [
  { value: 1, name: 'Janeiro' }, { value: 2, name: 'Fevereiro' }, { value: 3, name: 'Março' },
  { value: 4, name: 'Abril' }, { value: 5, name: 'Maio' }, { value: 6, name: 'Junho' },
  { value: 7, name: 'Julho' }, { value: 8, name: 'Agosto' }, { value: 9, name: 'Setembro' },
  { value: 10, name: 'Outubro' }, { value: 11, name: 'Novembro' }, { value: 12, name: 'Dezembro' },
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 25 }, (_, i) => currentYear - i);

// --- COMPONENTE PRINCIPAL ---
const QuizProfile = () => {
  // --- ESTADOS ---
  const [step, setStep] = useState(0); // Controla a pergunta atual
  const [isLoading, setIsLoading] = useState(false); // Controla a tela de loading
  // Perfil
  const [ownerName, setOwnerName] = useState('');
  const [dogName, setDogName] = useState('');
  const [dogGender, setDogGender] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [dogSize, setDogSize] = useState('');
  const [dogBreed, setDogBreed] = useState('');
  // Diagnóstico
  const [healthProblems, setHealthProblems] = useState([]); // Array para seleção múltipla
  const [foodAllergies, setFoodAllergies] = useState('');

  // --- FUNÇÃO PARA SELEÇÃO MÚLTIPLA ---
  const toggleHealthProblem = (problem) => {
    setHealthProblems(prev => {
      if (problem === 'Nenhum') { return prev.includes('Nenhum') ? [] : ['Nenhum']; }
      if (prev.includes('Nenhum')) { return [problem]; }
      return prev.includes(problem) ? prev.filter(p => p !== problem) : [...prev, problem];
    });
  };

  // --- ARRAY COMPLETO DE PERGUNTAS (PERFIL + DIAGNÓSTICO) ---
  const questions = [
    // --- Etapa 1: Perfil (índices 0 a 5) ---
    { title: "Vamos começar com as apresentações!", input: <input type="text" placeholder="Seu primeiro nome" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={styles.input} />, validator: () => ownerName.trim() !== '' },
    { title: <>Olá <strong>{ownerName || 'pessoa'}</strong>! Prazer em te conhecer <br />Qual o nome do seu cão?</>, input: <input type="text" placeholder="Nome do cão" value={dogName} onChange={(e) => setDogName(e.target.value)} className={styles.input} />, validator: () => dogName.trim() !== '' },
    { title: <><strong>{dogName || 'Ele(a)'}</strong> é um menino ou uma menina?</>, input: <div className={styles.choiceContainer}><button type="button" onClick={() => setDogGender('Menino')} className={`${styles.choiceButton} ${dogGender === 'Menino' ? styles.active : ''}`}>Menino</button><button type="button" onClick={() => setDogGender('Menina')} className={`${styles.choiceButton} ${dogGender === 'Menina' ? styles.active : ''}`}>Menina</button></div>, validator: () => dogGender !== '' },
    { title: <>Quando <strong>{dogName || 'seu cão'}</strong> nasceu?</>, input: <div className={styles.dateSelector}><select className={styles.select} value={birthDay} onChange={(e) => setBirthDay(e.target.value)}><option value="" disabled>Dia</option>{days.map(day => <option key={day} value={day}>{day}</option>)}</select><select className={styles.select} value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}><option value="" disabled>Mês</option>{months.map(month => <option key={month.value} value={month.value}>{month.name}</option>)}</select><select className={styles.select} value={birthYear} onChange={(e) => setBirthYear(e.target.value)}><option value="" disabled>Ano</option>{years.map(year => <option key={year} value={year}>{year}</option>)}</select></div>, validator: () => birthDay !== '' && birthMonth !== '' && birthYear !== '' },
    { title: <>Qual o porte de <strong>{dogName || 'seu cão'}</strong>?</>, input: <div className={styles.choiceContainer}><button type="button" onClick={() => setDogSize('Pequeno')} className={`${styles.choiceButton} ${dogSize === 'Pequeno' ? styles.active : ''}`}>Pequeno</button><button type="button" onClick={() => setDogSize('Médio')} className={`${styles.choiceButton} ${dogSize === 'Médio' ? styles.active : ''}`}>Médio</button><button type="button" onClick={() => setDogSize('Grande')} className={`${styles.choiceButton} ${dogSize === 'Grande' ? styles.active : ''}`}>Grande</button></div>, validator: () => dogSize !== '' },
    { title: <>Qual é a raça de <strong>{dogName || 'seu cão'}</strong>?</>, input: <select className={styles.select} value={dogBreed} onChange={(e) => setDogBreed(e.target.value)}><option value="" disabled>Selecione a raça</option>{allBreeds.map(breed => <option key={breed} value={breed}>{breed}</option>)}</select>, validator: () => dogBreed !== '' },
    // --- Etapa 2: Diagnóstico (índices 6 e 7) ---
    { title: <><strong>{dogName || 'Seu cão'}</strong> tem algum problema de saúde?</>, input: <div className={styles.choiceContainer}><button type="button" onClick={() => toggleHealthProblem('Mobilidade')} className={`${styles.choiceButton} ${healthProblems.includes('Mobilidade') ? styles.active : ''}`}>Problemas de mobilidade (rigidez, dificuldade de pular)</button><button type="button" onClick={() => toggleHealthProblem('Pele')} className={`${styles.choiceButton} ${healthProblems.includes('Pele') ? styles.active : ''}`}>Problemas de pele (coceira, pele seca)</button><button type="button" onClick={() => toggleHealthProblem('Digestão')} className={`${styles.choiceButton} ${healthProblems.includes('Digestão') ? styles.active : ''}`}>Problemas digestivos (diarreia, inchaço)</button><button type="button" onClick={() => toggleHealthProblem('Estresse')} className={`${styles.choiceButton} ${healthProblems.includes('Estresse') ? styles.active : ''}`}>Estresse e ansiedade (fogos de artifício, reatividade)</button><button type="button" onClick={() => toggleHealthProblem('Nenhum')} className={`${styles.choiceButton} ${healthProblems.includes('Nenhum') ? styles.active : ''}`}>Nenhum dos anteriores</button></div>, validator: () => healthProblems.length > 0 },
    { title: <><strong>{dogName || 'Seu cão'}</strong> tem alguma alergia alimentar conhecida?</>, input: <div className={styles.choiceContainer}><button type="button" onClick={() => setFoodAllergies('Peixe')} className={`${styles.choiceButton} ${foodAllergies === 'Peixe' ? styles.active : ''}`}>Alergia a Peixe</button><button type="button" onClick={() => setFoodAllergies('Outras')} className={`${styles.choiceButton} ${foodAllergies === 'Outras' ? styles.active : ''}`}>Alergia a Carne, Frango ou Laticínios</button><button type="button" onClick={() => setFoodAllergies('Nenhuma')} className={`${styles.choiceButton} ${foodAllergies === 'Nenhuma' ? styles.active : ''}`}>Nenhuma alergia conhecida</button></div>, validator: () => foodAllergies !== '' },
  ];

  // --- NAVEGAÇÃO ---
  const handleNext = () => {
    if (step === questions.length - 1 && questions[step].validator()) {
       setIsLoading(true);
       setTimeout(() => {
         // Redireciona para a página de resultados, passando o nome do cão na URL
        window.location.href = `/results?dogName=${encodeURIComponent(dogName)}`;
       }, 2000); // Espera 2 segundos
    } else if (questions[step].validator() && step < questions.length - 1) {
      setStep(step + 1);
    }
  };
  const handleBack = () => { if (step > 0) setStep(step - 1); };

  const currentQuestion = questions[step];
  // Define qual etapa principal está ativa (1 para Perfil, 2 para Diagnóstico)
  const majorStep = step < 6 ? 1 : 2;

  // --- RENDERIZAÇÃO CONDICIONAL DO LOADING ---
  if (isLoading) {
    return (
        <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p>Analisando as respostas de <strong>{dogName}</strong>...</p>
        </div>
    );
  }

  // --- RENDERIZAÇÃO PRINCIPAL ---
  return (
    <div className={styles.card}>
      <div className={styles.progressBar}>
        <div className={`${styles.step} ${majorStep === 1 ? styles.active : styles.completed}`}><div className={styles.stepNumber}>{majorStep > 1 ? <FiCheck /> : '1'}</div><div className={styles.stepName}>Perfil</div></div>
        <div className={styles.line}></div>
        <div className={`${styles.step} ${majorStep === 2 ? styles.active : ''}`}><div className={styles.stepNumber}>2</div><div className={styles.stepName}>Diagnóstico</div></div>
        <div className={styles.line}></div>
        <div className={styles.step}><div className={styles.stepNumber}>3</div><div className={styles.stepName}>Resultado</div></div>
      </div>
      
      <h2 className={styles.title}>{currentQuestion.title}</h2>
      <div className={styles.inputWrapper}>{currentQuestion.input}</div>

      <div className={styles.navContainer}>
        {step > 0 ? <button onClick={handleBack} className={styles.backButton}><FiArrowLeft /> Voltar</button> : <div></div>}
        <button onClick={handleNext} disabled={!currentQuestion.validator()} className={styles.nextButton}>Continuar <FiArrowRight /></button>
      </div>
    </div>
  );
};

export default QuizProfile;