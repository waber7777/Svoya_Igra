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

  const isGameFinished = state.categories.length > 0 && state.categories.every(cat => cat.questions.every(q => q.isPlayed));
  const sortedPlayers = Object.values(state.players).sort((a, b) => b.score - a.score);
  const winner = sortedPlayers.length > 0 ? sortedPlayers[0] : null;

  if (isGameFinished) {
    return (
      <main className={styles.main} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ fontSize: '5rem', color: '#ffd700', textShadow: '0 0 20px rgba(255, 215, 0, 0.8)', marginBottom: '2rem' }}>🎉 ИГРА ОКОНЧЕНА 🎉</h1>
        {winner ? (
          <div style={{ textAlign: 'center', background: '#042c7c', padding: '3rem 5rem', borderRadius: '20px', border: '5px solid #0b45b3', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
            <h2 style={{ fontSize: '3rem', color: 'white', marginBottom: '1rem' }}>АБСОЛЮТНЫЙ ПОБЕДИТЕЛЬ:</h2>
            <div style={{ fontSize: '6rem', fontWeight: 'bold', color: '#ff2a2a', textShadow: '0 0 30px rgba(255, 42, 42, 0.8)' }}>
              {winner.name.toUpperCase()}
            </div>
            <div style={{ fontSize: '3rem', color: '#ffd700', marginTop: '1rem', fontWeight: 'bold' }}>
              Итоговый счет: {winner.score} очков
            </div>
          </div>
        ) : (
          <h2 style={{ fontSize: '3rem', color: 'white' }}>Нет победителя (Никто не присоединился)</h2>
        )}

        {sortedPlayers.length > 1 && (
          <div style={{ marginTop: '4rem', width: '80%', maxWidth: '800px', background: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: '15px' }}>
            <h3 style={{ fontSize: '2rem', color: '#aaa', textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #555', paddingBottom: '1rem' }}>Таблица результатов:</h3>
            {sortedPlayers.map((p, index) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', marginBottom: '1rem', color: index === 0 ? '#ffd700' : 'white' }}>
                <span>{index + 1}. {p.name}</span>
                <span style={{ fontWeight: 'bold' }}>{p.score}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

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
            {state.activeQuestion?.isCat && !state.activeQuestion.isRevealed ? (
              <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                <div style={{ fontSize: '8rem', color: '#ff2a2a', textShadow: '0 0 30px rgba(255,42,42,0.8)' }}>🐾</div>
                <h2 style={{ fontSize: '5rem', color: '#ffed4a', margin: '2rem 0' }}>КОТ В МЕШКЕ!</h2>
                <p style={{ fontSize: '2rem', color: '#fff' }}>Ведущий выставляет цену и отдает вопрос одному из игроков...</p>
              </div>
            ) : (
              <>
                <h2 className={styles.questionPrice}>Вопрос за {state.activeQuestion?.catAssignedPrice || activeQuestion.price}</h2>

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
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
