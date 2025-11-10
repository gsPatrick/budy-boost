'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ResultsHero from '../../components/ResultsHero/ResultsHero';
import OurPicks from '../../components/OurPicks/OurPicks'; // 1. Importe
import VetEndorsement from '../../components/VetEndorsement/VetEndorsement'; // 2. Importe

function ResultsContent() {
  const searchParams = useSearchParams();
  const dogName = searchParams.get('dogName') || 'seu filhote';

  return (
    <>
      <ResultsHero dogName={dogName} />
      <OurPicks dogName={dogName} /> {/* 3. Adicione aqui */}
      <VetEndorsement /> {/* 4. E aqui */}
    </>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Carregando resultados...</div>}>
      <ResultsContent />
    </Suspense>
  );
}