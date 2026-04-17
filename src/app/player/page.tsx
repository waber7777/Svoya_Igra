'use client';
import { useGameState } from '@/hooks/useGameState';
import { useState, useEffect } from 'react';

export default function PlayerPage() {
    const { state, sendAction } = useGameState();
    const [playerId, setPlayerId] = useState('');
    const [name, setName] = useState('');
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        let id = localStorage.getItem('svoyaIgraPlayerId');
        if (!id) {
            id = Math.random().toString(36).substring(7);
            localStorage.setItem('svoyaIgraPlayerId', id);
        }
        setPlayerId(id);
    }, []);

    const joinGame = () => {
        if (!name.trim()) return;
        sendAction('JOIN', { id: playerId, name });
        setJoined(true);
    };

    if (!state) return <div style={{ color: 'white', padding: '2rem', textAlign: 'center', fontSize: '1.5rem', fontFamily: 'sans-serif' }}>Загрузка связи с ведущим...</div>;

    if (!joined) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#000c24', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
                <h1 style={{ marginBottom: '2rem', textShadow: '0 2px 10px rgba(255,215,0,0.5)', color: '#ffd700', fontSize: '3rem' }}>Своя Игра</h1>
                <div style={{ background: '#042c7c', padding: '2rem', borderRadius: '15px', width: '100%', maxWidth: '400px', border: '2px solid #0b45b3', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                    <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Вход в игру</h2>
                    <input
                        placeholder="Введите ваше Имя"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={{ padding: '1rem', fontSize: '1.2rem', width: '100%', marginBottom: '1.5rem', borderRadius: '8px', border: 'none', outline: 'none' }}
                    />
                    <button
                        onClick={joinGame}
                        style={{ padding: '1.2rem', fontSize: '1.3rem', background: '#ffb700', color: '#000', border: 'none', width: '100%', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.1s' }}
                    >
                        ПРИСОЕДИНИТЬСЯ
                    </button>
                </div>
            </div>
        );
    }

    const isBuzzed = state.buzzedPlayerId === playerId;
    const otherBuzzed = state.buzzedPlayerId && state.buzzedPlayerId !== playerId;

    let btnColor = '#1a1a1a';
    let btnText = 'ТИШИНА';
    let shadow = '0 0 10px rgba(0,0,0,0.5)';

    if (state.activeQuestion) {
        if (state.buzzersEnabled) {
            btnColor = '#ff2a2a';
            btnText = 'ЖМИ!';
            shadow = '0 0 50px rgba(255, 42, 42, 0.9), inset 0 0 20px rgba(255,255,255,0.5)';
        } else if (isBuzzed) {
            btnColor = '#00e676';
            btnText = 'ГОВОРИТЕ!';
            shadow = '0 0 50px rgba(0, 230, 118, 0.9)';
        } else if (otherBuzzed) {
            btnColor = '#424242';
            btnText = 'ОТВЕЧАЕТ ДРУГОЙ';
        } else {
            btnColor = '#424242';
            btnText = 'АДМИН ЧИТАЕТ ВОПРОС...';
        }
    }

    const handleBuzz = () => {
        if (state.activeQuestion && state.buzzersEnabled) {
            sendAction('BUZZ', { playerId });
            // Можно добавить звук или вибрацию здесь
            if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(200);
            }
        }
    };

    return (
        <div style={{ background: '#000c24', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
            <div style={{ position: 'absolute', top: '0', width: '100%', background: 'rgba(0,0,0,0.5)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>👤 {state.players[playerId]?.name}</span>
                <span style={{ fontSize: '1.5rem', color: '#ffd700', fontWeight: 'bold' }}>⭐ Очки: {state.players[playerId]?.score || 0}</span>
            </div>

            <button
                onClick={handleBuzz}
                disabled={!state.activeQuestion || !state.buzzersEnabled}
                style={{
                    marginTop: '2rem',
                    width: '280px',
                    height: '280px',
                    borderRadius: '50%',
                    background: btnColor,
                    color: '#fff',
                    fontSize: '2.5rem',
                    fontWeight: '900',
                    border: state.buzzersEnabled ? '8px solid #ffcccc' : '8px solid #333',
                    boxShadow: shadow,
                    cursor: state.buzzersEnabled ? 'pointer' : 'default',
                    transition: 'all 0.1s ease',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                {btnText}
            </button>

            {!state.activeQuestion && <p style={{ marginTop: '4rem', fontSize: '1.5rem', color: '#888', textAlign: 'center', padding: '0 2rem' }}>Смотрите на главный экран телевизора!</p>}
        </div>
    );
}
