import Image from 'next/image';
import styles from './Testimonials.module.css';

const testimonialsData = [
  {
    name: 'Oscar',
    age: 7,
    image: '/depoimento-1.png',
    text: '"Os resultados são incríveis! Mesmo aos 7 anos, meu pequeno está em ótima forma. Ele se move com mais facilidade e brinca mais. Recomendo a todos!"',
    author: 'Abby, após 2 meses de tratamento',
  },
  {
    name: 'Bella',
    age: 4,
    image: '/depoimento-2.png',
    text: '"A diferença é incrível! Desde que começou com os probióticos digestivos, os problemas de estômago da Bella desapareceram. Ela está mais energética do que nunca!"',
    author: 'Mark, após 1 mês de tratamento',
  },
  {
    name: 'Max',
    age: 3,
    image: '/depoimento-3.png',
    text: '"Max sempre foi super agitado, especialmente perto de pessoas novas, mas estes calmantes fizeram uma grande diferença. Ele está muito mais relaxado agora. Não poderia estar mais feliz com os resultados!"',
    author: 'Laura, após 2 meses de tratamento',
  },
];

const Testimonials = () => {
  return (
    <section className={styles.testimonialsSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Depoimentos de abanar o rabo</h2>
        <div className={styles.testimonialsGrid}>
          {testimonialsData.map((testimonial) => (
            <div key={testimonial.name} className={styles.testimonialCard}>
              <div className={styles.imageContainer}>
                <Image
                  src={testimonial.image}
                  alt={`Depoimento sobre o cachorro ${testimonial.name}`}
                  width={400}
                  height={300}
                  className={styles.testimonialImage}
                />
              </div>
              <h3 className={styles.cardTitle}>{testimonial.name} - {testimonial.age} anos</h3>
              <p className={styles.cardText}>{testimonial.text}</p>
              <p className={styles.cardAuthor}>- {testimonial.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;