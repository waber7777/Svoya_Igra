'use client';
import { QRCodeSVG } from 'qrcode.react';
import { useGameState } from '@/hooks/useGameState';
import { useState, useEffect } from 'react';

export default function AdminPage() {
    const { state, sendAction } = useGameState();
    const [playerUrl, setPlayerUrl] = useState('');
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        setPlayerUrl(window.location.origin + '/player');
    }, []);

    if (!state) return <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка панели...</div>;

    const handleReset = () => { if (confirm("ВЫ УВЕРЕНЫ ЧТО ХОТИТЕ СБРОСИТЬ ИГРУ? (Счет и вопросы обнулятся)")) sendAction('RESET_GAME'); };

    return (
        <div style={{ padding: '1rem', background: '#f5f5f5', color: '#111', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <h1 style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>Панель Администратора</h1>

            <button
                onClick={() => setShowQR(!showQR)}
                style={{ padding: '1rem', background: '#fff', border: '2px solid #2196f3', borderRadius: '10px', width: '100%', fontSize: '1.2rem', marginBottom: '1rem', color: '#2196f3', fontWeight: 'bold', cursor: 'pointer' }}
            >
                {showQR ? 'Скрыть QR Код' : 'Показать QR Код подключения'}
            </button>

            {showQR && (
                <div style={{ background: '#fff', padding: '1.5rem 1rem', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', marginBottom: '1rem' }}>
                    <QRCodeSVG value={playerUrl} size={200} style={{ width: '100%', maxWidth: '250px', height: 'auto' }} />
                    <p style={{ marginTop: '1rem', fontSize: '1.1rem', wordBreak: 'break-all' }}><a href={playerUrl} target="_blank" rel="noreferrer">{playerUrl}</a></p>
                </div>
            )}

            <div style={{ background: '#fff', padding: '1rem', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem' }}>Подключенные игроки ({Object.keys(state.players).length}):</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '1.1rem' }}>
                    {Object.values(state.players).length === 0 && <p style={{ color: '#888', margin: 0 }}>Пока никто не подключился...</p>}
                    {Object.values(state.players).map(p => (
                        <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '0.8rem 0' }}>
                            <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>{p.name}</strong>
                            <span style={{ color: '#005bb5', fontWeight: 'bold', fontSize: '1.2rem' }}>{p.score}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {state.activeQuestion ? (
                <div style={{ background: '#e3f2fd', border: '2px solid #2196f3', borderRadius: '10px', padding: '1rem' }}>
                    {state.activeQuestion.isCat && !state.activeQuestion.isRevealed ? (
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <h2 style={{ fontSize: '2rem', color: '#ff2a2a', marginBottom: '1rem', fontWeight: '900' }}>🐈 КОТ В МЕШКЕ!</h2>
                            <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#111' }}>Тема: <strong>{state.categories[state.activeQuestion.cIndex].categoryName}</strong></p>

                            {Object.keys(state.players).length > 0 ? (
                                <>
                                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#333' }}>Кому передаем кота?</p>
                                    <select id="catPlayerSelect" style={{ padding: '1rem', fontSize: '1.2rem', width: '100%', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid #ccc', background: '#fff', color: '#000' }}>
                                        {Object.values(state.players).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>

                                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#333' }}>Сумма ставки (очков):</p>
                                    <select id="catPriceSelect" style={{ padding: '1rem', fontSize: '1.2rem', width: '100%', marginBottom: '2rem', borderRadius: '8px', border: '1px solid #ccc', background: '#fff', color: '#000' }}>
                                        {[100, 200, 300, 400, 500].map(price => <option key={price} value={price}>{price}</option>)}
                                    </select>

                                    <button onClick={() => {
                                        const playerId = (document.getElementById('catPlayerSelect') as HTMLSelectElement).value;
                                        const price = parseInt((document.getElementById('catPriceSelect') as HTMLSelectElement).value);
                                        sendAction('ASSIGN_CAT', { playerId, price });
                                    }} style={{ background: '#4caf50', padding: '1.2rem', width: '100%', color: 'white', fontSize: '1.2rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px rgba(76, 175, 80, 0.4)' }}>
                                        ОТКРЫТЬ ВОПРОС НА ЭКРАНЕ
                                    </button>
                                </>
                            ) : (
                                <p style={{ color: 'red', fontSize: '1.2rem', fontWeight: 'bold' }}>К игре не подключено ни одного игрока! Дождитесь подключения.</p>
                            )}
                        </div>
                    ) : (
                        <>
                            <h2 style={{ fontSize: '1.4rem', color: '#1976d2', margin: '0 0 1rem 0', textAlign: 'center' }}>Вопрос за {state.activeQuestion.catAssignedPrice || state.categories[state.activeQuestion.cIndex].questions[state.activeQuestion.qIndex].price}</h2>

                            <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                <p style={{ fontSize: '1rem', margin: '0 0 0.5rem 0', color: '#555' }}>Текст вопроса:</p>
                                <p style={{ fontSize: '1.2rem', margin: 0, fontWeight: 'bold' }}>{state.categories[state.activeQuestion.cIndex].questions[state.activeQuestion.qIndex].text}</p>
                            </div>

                            <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #4caf50' }}>
                                <p style={{ fontSize: '1rem', margin: '0 0 0.5rem 0', color: '#2e7d32' }}>Правильный ответ:</p>
                                <p style={{ fontSize: '1.3rem', margin: 0, fontWeight: 'bold', color: '#1b5e20' }}>{state.categories[state.activeQuestion.cIndex].questions[state.activeQuestion.qIndex].answer}</p>
                            </div>

                            {!state.buzzersEnabled && !state.buzzedPlayerId && (
                                <button onClick={() => sendAction('ENABLE_BUZZERS')} style={{ padding: '1.2rem', background: '#2196f3', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', width: '100%', boxShadow: '0 4px 10px rgba(33, 150, 243, 0.4)' }}>
                                    ВКЛЮЧИТЬ КНОПКИ ИГРОКАМ
                                </button>
                            )}

                            {state.buzzersEnabled && !state.buzzedPlayerId && (
                                <div style={{ fontSize: '1.4rem', color: '#d32f2f', fontWeight: 'bold', textAlign: 'center', padding: '1.5rem', border: '2px dashed #d32f2f', borderRadius: '8px', background: '#ffebee' }}>
                                    ⏳ Ждем нажатия от игроков...
                                </div>
                            )}

                            {state.buzzedPlayerId && (
                                <div style={{ background: '#fff9c4', padding: '1rem', borderRadius: '8px', border: '3px solid #fbc02d', textAlign: 'center' }}>
                                    <p style={{ color: '#d32f2f', fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>🔔 ОТВЕЧАЕТ ИГРОК:</p>
                                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.8rem', color: '#000', wordBreak: 'break-all' }}>{state.players[state.buzzedPlayerId]?.name}</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <button onClick={() => sendAction('AWARD_POINTS', { playerId: state.buzzedPlayerId, points: state.activeQuestion?.catAssignedPrice || state.categories[state.activeQuestion!.cIndex].questions[state.activeQuestion!.qIndex].price })} style={{ background: '#4caf50', color: '#fff', padding: '1.2rem', border: 'none', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 8px rgba(76, 175, 80, 0.4)' }}>ВЕРНО (+)</button>
                                        <button onClick={() => sendAction('AWARD_POINTS', { playerId: state.buzzedPlayerId, points: -(state.activeQuestion?.catAssignedPrice || state.categories[state.activeQuestion!.cIndex].questions[state.activeQuestion!.qIndex].price) })} style={{ background: '#f44336', color: '#fff', padding: '1.2rem', border: 'none', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 8px rgba(244, 67, 54, 0.4)' }}>НЕВЕРНО (-)</button>
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {!state.activeQuestion.showAnswer && (
                                    <button onClick={() => sendAction('SHOW_ANSWER')} style={{ padding: '0.8rem 1rem', width: '100%', background: '#9c27b0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(156, 39, 176, 0.4)' }}>
                                        Никто не ответил верно (Показать ответ)
                                    </button>
                                )}
                                <button onClick={() => sendAction('CLOSE_QUESTION')} style={{ padding: '0.8rem 1rem', width: '100%', background: '#757575', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem' }}>
                                    Вернуть вопрос в табло (закрыть)
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div style={{ background: '#fff', padding: '2rem 1rem', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <p style={{ color: '#666', fontSize: '1.1rem', margin: 0 }}>Нет открытого вопроса.<br />(Откройте его с компьютера на "Главном Экране")</p>
                </div>
            )}

            <button onClick={handleReset} style={{ marginTop: '3rem', width: '100%', background: '#ffeeee', color: '#d32f2f', border: '2px solid #d32f2f', padding: '1rem', cursor: 'pointer', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold' }}>Сбросить всю игру (Опасно)</button>
        </div>
    );
}
