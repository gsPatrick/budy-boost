'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import { FiUpload, FiChevronDown } from 'react-icons/fi';
import styles from './CustomerReviews.module.css';
import ApiService from '../../services/api.service'; // Importa o serviço da API
import { useAuth } from '../../context/AuthContext'; // Importa o contexto de autenticação

// Sub-componentes internos (DisplayStars, InputStars) permanecem os mesmos...
const DisplayStars = ({ rating, className }) => (
  <div className={`${styles.starRating} ${className}`}>
    {Array.from({ length: 5 }, (_, i) => (<FaStar key={i} color={i < rating ? '#1A234B' : '#e4e5e9'} />))}
  </div>
);
const InputStars = ({ rating, setRating }) => {
    const [hover, setHover] = useState(0);
    return (
      <div className={styles.starRatingInput}>
        {Array.from({ length: 5 }, (_, i) => {
          const ratingValue = i + 1;
          return (
            <label key={i}>
              <input type="radio" name="rating" value={ratingValue} onClick={() => setRating(ratingValue)} style={{ display: 'none' }} />
              <FaStar className={styles.star} color={ratingValue <= (hover || rating) ? '#1A234B' : '#e4e5e9'} onMouseEnter={() => setHover(ratingValue)} onMouseLeave={() => setHover(0)} />
            </label>
          );
        })}
      </div>
    );
};


// --- COMPONENTE PRINCIPAL MODIFICADO ---
// Ele agora precisa do ID do produto para buscar as avaliações corretas
const CustomerReviews = ({ productId }) => {
  const { user } = useAuth(); // Pega o usuário logado do contexto
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ overall: 0, total: 0, distribution: [0, 0, 0, 0, 0] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isWritingReview, setIsWritingReview] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Função para buscar dados da API
  const fetchReviews = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      // Busca a lista de avaliações e a média em paralelo
      const [reviewsRes, summaryRes] = await Promise.all([
        ApiService.get(`/avaliacoes/produto/${productId}`),
        ApiService.get(`/avaliacoes/produto/${productId}/media`)
      ]);

      setReviews(reviewsRes.data);
      
      // Calcula a distribuição de estrelas (backend não fornece, então calculamos aqui)
      const distribution = [0, 0, 0, 0, 0];
      reviewsRes.data.forEach(review => {
        distribution[5 - review.nota]++;
      });

      setSummary({
        overall: parseFloat(summaryRes.data.media),
        total: parseInt(summaryRes.data.total, 10),
        distribution: distribution
      });

    } catch (err) {
      console.error("Erro ao buscar avaliações:", err);
      setError("Não foi possível carregar as avaliações.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (formRating === 0) {
      alert("Por favor, selecione uma nota.");
      return;
    }
    setFormSubmitting(true);
    try {
      await ApiService.post('/avaliacoes', {
        produtoId: productId,
        nota: formRating,
        comentario: formComment
      });
      
      alert("Avaliação enviada com sucesso! Ela será exibida após a aprovação.");
      setIsWritingReview(false);
      setFormRating(0);
      setFormComment('');
      // Opcional: Recarregar as avaliações, mas como precisa de aprovação, não é estritamente necessário.
      // await fetchReviews();

    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao enviar avaliação.");
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) return <p>Carregando avaliações...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className={styles.reviewsSection}>
      <div className={styles.container}>
        <h2 className={styles.mainTitle}>Avaliações de Clientes</h2>
        
        <div className={styles.topBox}>
          <div className={styles.summaryContainer}>
            <div className={styles.summaryOverall}>
              <DisplayStars rating={Math.round(summary.overall)} />
              <p className={styles.overallLink}>{summary.overall.toFixed(1)} de 5</p>
              <span>Baseado em {summary.total} avaliações</span>
            </div>
            <div className={styles.summaryBars}>
              {summary.distribution.map((count, index) => (
                <div key={5 - index} className={styles.barRow}>
                  <DisplayStars rating={5 - index} />
                  <div className={styles.progressBar}><div style={{ width: `${summary.total > 0 ? (count / summary.total) * 100 : 0}%` }}></div></div>
                  <span>{count}</span>
                </div>
              ))}
            </div>
            <div className={styles.summaryAction}>
              {user && ( // Só mostra o botão se o usuário estiver logado
                <button onClick={() => setIsWritingReview(!isWritingReview)} className={styles.primaryButton}>
                  {isWritingReview ? 'Cancelar Avaliação' : 'Escrever uma avaliação'}
                </button>
              )}
            </div>
          </div>

          {isWritingReview && user && (
            <form onSubmit={handleReviewSubmit} className={styles.formContainer}>
              <div className={styles.separator}></div>
              <h3 className={styles.formTitle}>Escrever uma avaliação</h3>
              <div className={styles.formField}><label className={styles.formLabel}>Sua Nota</label><InputStars rating={formRating} setRating={setFormRating} /></div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Sua Avaliação</label>
                <textarea placeholder="Conte-nos o que você achou do produto..." className={styles.formTextarea} value={formComment} onChange={(e) => setFormComment(e.target.value)}></textarea>
              </div>
              {/* Upload de imagem será uma feature futura */}
              <div className={styles.formActions}>
                <button type="button" onClick={() => setIsWritingReview(false)} className={styles.secondaryButton}>Cancelar</button>
                <button type="submit" className={styles.primaryButton} disabled={formSubmitting}>{formSubmitting ? 'Enviando...' : 'Enviar Avaliação'}</button>
              </div>
            </form>
          )}
        </div>

        {reviews.length > 0 && (
          <div className={styles.reviewListContainer}>
            <div className={styles.reviewGrid}>
              {reviews.map(review => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <DisplayStars rating={review.nota} />
                    <span>{new Date(review.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className={styles.reviewAuthor}>
                    <span>{review.Usuario.nome}</span>
                    <span className={styles.verifiedBadge}>Comprador Verificado</span>
                  </div>
                  {/* API não tem título, então removemos */}
                  <p className={styles.reviewText}>{review.comentario}</p>
                  {/* Lógica de imagem será adicionada no futuro */}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CustomerReviews;