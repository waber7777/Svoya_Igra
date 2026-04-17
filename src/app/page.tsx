'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { useGameState } from '@/hooks/useGameState';

const playSheepSound = () => {
  try {
    const sounds = [
      "40a2fc37a6c6ef7.mp3", "72df0556a033e9b.mp3", "88dbbdd68ad525b.mp3",
      "meeeeee-mayimbu.mp3", "sheep-baaa.mp3", "sheepbaa.mp3"
    ];
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    const audio = new Audio(`/Beee/${randomSound}`);
    audio.play().catch(e => console.error("Audio error:", e));
  } catch (e) {
    console.error("Audio error:", e);
  }
};

export default function Home() {
  const { state, sendAction } = useGameState();
  const [lastBuzzedId, setLastBuzzedId] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (state?.buzzedPlayerId && state.buzzedPlayerId !== lastBuzzedId) {
      if (isStarted) {
        playSheepSound();
      }
      setLastBuzzedId(state.buzzedPlayerId);
    } else if (!state?.buzzedPlayerId && lastBuzzedId) {
      setLastBuzzedId(null);
    }
  }, [state?.buzzedPlayerId, lastBuzzedId, isStarted]);

  if (!isStarted) {
    return (
      <main className={styles.main} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ fontSize: '4rem', color: '#ffd700', marginBottom: '3rem', textAlign: 'center', textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>Игра готова! Экран зрителя</h1>
        <button onClick={() => { playSheepSound(); setIsStarted(true); }} style={{ padding: '2rem 4rem', fontSize: '3rem', background: '#4caf50', color: 'white', borderRadius: '15px', border: '5px solid #2e7d32', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          ▶️ СТАРТ (Включить звук)
        </button>
      </main>
    );
  }

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
                <h2 className={styles.questionPrice} style={{ marginBottom: activeQuestion.imageUrl ? '0.5rem' : '2rem' }}>
                  Вопрос за {state.activeQuestion?.catAssignedPrice || activeQuestion.price}
                </h2>

                {activeQuestion.imageUrl && (
                  <div className={styles.mediaContainer} style={{ textAlign: 'center', marginBottom: '0.2rem' }}>
                    <img src={activeQuestion.imageUrl} alt="Изображение к вопросу" style={{ maxWidth: '100%', maxHeight: '35vh', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', border: '2px solid #fff' }} />
                  </div>
                )}

                {activeQuestion.audioUrl && (
                  <div className={styles.mediaContainer} style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <audio src={activeQuestion.audioUrl} controls autoPlay style={{ width: '100%', maxWidth: '400px' }} />
                  </div>
                )}

                <p className={styles.questionText} style={activeQuestion.imageUrl ? { fontSize: '1.8rem', lineHeight: '1.2', margin: '0.5rem 0' } : {}}>
                  {activeQuestion.text}
                </p>

                <div style={{ marginTop: activeQuestion.imageUrl ? '1rem' : '3rem', fontSize: activeQuestion.imageUrl ? '1.5rem' : '2rem', padding: activeQuestion.imageUrl ? '1rem' : '2rem', borderRadius: '15px', background: state.buzzersEnabled ? '#4caf50' : (state.buzzedPlayerId ? '#ff9800' : '#424242'), color: '#fff', fontWeight: 'bold', textShadow: '0 2px 5px rgba(0,0,0,0.5)', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                  {state.buzzersEnabled
                    ? "⏳ ТАЙМЕР ИДЕТ! ИГРОКИ, ЖМИТЕ!"
                    : state.buzzedPlayerId
                      ? `🔔 ВНИМАНИЕ: ОТВЕЧАЕТ ${state.players[state.buzzedPlayerId]?.name.toUpperCase()}`
                      : "ВЕДУЩИЙ ЧИТАЕТ ВОПРОС..."}
                </div>

                {state.activeQuestion?.showAnswer && (
                  <div style={{ marginTop: activeQuestion.imageUrl ? '0.5rem' : '2rem', fontSize: activeQuestion.imageUrl ? '1.8rem' : '2.5rem', color: '#fff', padding: activeQuestion.imageUrl ? '0.8rem' : '1.5rem', border: '3px solid #ffed4a', borderRadius: '15px', background: '#e65100', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', fontWeight: 'bold' }}>
                    👑 ОТВЕТ: {activeQuestion.answer}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
