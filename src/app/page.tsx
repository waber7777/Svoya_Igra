'use client';

import styles from './page.module.css';
import { useGameState } from '@/hooks/useGameState';

export default function Home() {
  const { state, sendAction } = useGameState();

  if (!state) return <div style={{ color: 'white', padding: '2rem', textAlign: 'center', fontSize: '2rem' }}>Загрузка состояния игры...</div>;

  const handleCardClick = (cIndex: number, qIndex: number) => {
    const q = state.categories[cIndex].questions[qIndex];
    if (q.isPlayed) return;

    if (state.activeQuestion) {
      alert("Сначала закройте текущий вопрос в панели администратора!");
      return;
    }

    sendAction('OPEN_QUESTION', { cIndex, qIndex });
  };

  const activeQuestion = state.activeQuestion ? state.categories[state.activeQuestion.cIndex].questions[state.activeQuestion.qIndex] : null;

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Своя Игра</h1>
        <p className={styles.subtitle}>Главный экран (Табло)</p>
      </div>

      <div className={styles.board}>
        {state.categories.map((cat, cIndex) => (
          <div key={cat.categoryName} className={styles.row}>
            <div className={styles.categoryInfo}>{cat.categoryName}</div>
            {cat.questions.map((q, qIndex) => (
              <div
                key={qIndex}
                className={`${styles.card} ${q.isPlayed ? styles.played : ''}`}
                onClick={() => handleCardClick(cIndex, qIndex)}
              >
                {!q.isPlayed && q.price}
              </div>
            ))}
          </div>
        ))}
      </div>

      {Object.values(state.players).length > 0 && (
        <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {Object.values(state.players).map(p => (
            <div key={p.id} style={{ background: '#042c7c', padding: '1rem 2rem', borderRadius: '15px', color: 'white', border: '3px solid #0b45b3', fontSize: '2rem', textAlign: 'center', minWidth: '150px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
              <div style={{ fontWeight: 'bold' }}>{p.name}</div>
              <div style={{ color: '#ffd700', fontSize: '2.5rem', fontWeight: '900', marginTop: '0.5rem' }}>{p.score}</div>
            </div>
          ))}
        </div>
      )}

      {activeQuestion && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.questionPrice}>Вопрос за {activeQuestion.price}</h2>

            {activeQuestion.imageUrl && (
              <div className={styles.mediaContainer}>
                <div>🖼️ Показ изображения ({activeQuestion.imageUrl})</div>
              </div>
            )}

            {activeQuestion.audioUrl && (
              <div className={styles.mediaContainer}>
                <div>🎵 Воспроизведение трека ({activeQuestion.audioUrl})</div>
              </div>
            )}

            <p className={styles.questionText}>{activeQuestion.text}</p>

            <div style={{ marginTop: '3rem', fontSize: '2rem', padding: '2rem', borderRadius: '15px', background: state.buzzersEnabled ? '#4caf50' : (state.buzzedPlayerId ? '#ff9800' : '#424242'), color: '#fff', fontWeight: 'bold', textShadow: '0 2px 5px rgba(0,0,0,0.5)', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
              {state.buzzersEnabled
                ? "⏳ ТАЙМЕР ИДЕТ! ИГРОКИ, ЖМИТЕ!"
                : state.buzzedPlayerId
                  ? `🔔 ВНИМАНИЕ: ОТВЕЧАЕТ ${state.players[state.buzzedPlayerId]?.name.toUpperCase()}`
                  : "ВЕДУЩИЙ ЧИТАЕТ ВОПРОС..."}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
