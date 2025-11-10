import QuizProfile from '../../../components/QuizProfile/QuizProfile'; // Nome atualizado
import styles from './page.module.css';
import Image from 'next/image';

import poodleImage from '../../../../public/poodle.png';
import spitzImage from '../../../../public/spitz.png';


export default function Step1Page() {
  return (
    <div className={styles.pageContainer}>
      <Image 
        src={poodleImage} 
        alt="Poodle" 
        className={`${styles.dogImage} ${styles.poodle}`} 
        priority
      />
      <QuizProfile /> {/* Nome atualizado */}
      <Image 
        src={spitzImage} 
        alt="Spitz" 
        className={`${styles.dogImage} ${styles.spitz}`} 
        priority
      />
    </div>
  );
}