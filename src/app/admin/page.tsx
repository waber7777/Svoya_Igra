'use client';
import { QRCodeSVG } from 'qrcode.react';
import { useGameState } from '@/hooks/useGameState';
import { useState, useEffect } from 'react';

export default function AdminPage() {
    const { state, sendAction } = useGameState();
    const [playerUrl, setPlayerUrl] = useState('');

    useEffect(() => {
        setPlayerUrl(window.location.origin + '/player');
    }, []);

    if (!state) return <div style={{ padding: '2rem' }}>Загрузка административной панели...</div>;

    const handleReset = () => { if (confirm("ВЫ УВЕРЕНЫ ЧТО ХОТИТЕ СБРОСИТЬ ВСЮ ИГРУ? (Счет и вопросы обнулятся)")) sendAction('RESET_GAME'); };

    return (
        <div style={{ padding: '2rem', background: '#f5f5f5', color: '#111', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <h1>Своя Игра - Панель Администратора</h1>

            <div style={{ display: 'flex', gap: '3rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                <div style={{ background: '#fff', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h3>QR код для подключения Игроков к Зумеру:</h3>
                    {playerUrl && <div style={{ marginTop: '2rem' }}><QRCodeSVG value={playerUrl} size={250} /></div>}
                    <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}><a href={playerUrl} target="_blank">{playerUrl}</a></p>
                </div>

                <div style={{ background: '#fff', padding: '2rem', borderRadius: '10px', minWidth: '350px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h3>Подключенные игроки:</h3>
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', fontSize: '1.2rem' }}>
                        {Object.values(state.players).length === 0 && <p style={{ color: '#888' }}>Пока никто не подключился...</p>}
                        {Object.values(state.players).map(p => (
                            <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '0.8rem 0' }}>
                                <strong>{p.name}</strong>
                                <span style={{ color: '#005bb5', fontWeight: 'bold' }}>{p.score} очков</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {state.activeQuestion ? (
                <div style={{ background: '#e3f2fd', border: '2px solid #2196f3', borderRadius: '10px', padding: '2rem', marginTop: '3rem' }}>
                    <h2 style={{ fontSize: '2rem', color: '#1976d2' }}>Внимание: Идет игра, открыт вопрос за {state.categories[state.activeQuestion.cIndex].questions[state.activeQuestion.qIndex].price} баллов</h2>
                    <p style={{ fontSize: '1.5rem', margin: '1rem 0' }}><strong>Текст вопроса:</strong> {state.categories[state.activeQuestion.cIndex].questions[state.activeQuestion.qIndex].text}</p>
                    <p style={{ fontSize: '1.5rem', color: '#2e7d32', marginBottom: '3rem' }}><strong>Правильный Ответ:</strong> {state.categories[state.activeQuestion.cIndex].questions[state.activeQuestion.qIndex].answer}</p>

                    {!state.buzzersEnabled && !state.buzzedPlayerId && (
                        <button onClick={() => sendAction('ENABLE_BUZZERS')} style={{ padding: '1.5rem 3rem', background: '#2196f3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold', width: '100%', boxShadow: '0 4px 10px rgba(33, 150, 243, 0.4)' }}>
                            РАЗБЛОКИРОВАТЬ КНОПКИ ДЛЯ ИГРОКОВ (После зачитывания вопроса)
                        </button>
                    )}

                    {state.buzzersEnabled && !state.buzzedPlayerId && (
                        <div style={{ fontSize: '2rem', color: '#d32f2f', fontWeight: 'bold', textAlign: 'center', padding: '2rem', border: '2px dashed #d32f2f', borderRadius: '10px' }}>
                            ⏳ Ждем нажатия кнопки от игроков...
                        </div>
                    )}

                    {state.buzzedPlayerId && (
                        <div style={{ marginTop: '1rem', background: '#fff9c4', padding: '2rem', borderRadius: '10px', border: '3px solid #fbc02d', textAlign: 'center' }}>
                            <h3 style={{ color: '#d32f2f', fontSize: '2.5rem', margin: '0 0 2rem 0' }}>🔔 ИГРОК "{state.players[state.buzzedPlayerId]?.name}" ОТВЕЧАЕТ!</h3>
                            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                                <button onClick={() => sendAction('AWARD_POINTS', { playerId: state.buzzedPlayerId, points: state.categories[state.activeQuestion!.cIndex].questions[state.activeQuestion!.qIndex].price })} style={{ background: '#4caf50', color: '#fff', padding: '1.5rem 3rem', border: 'none', borderRadius: '10px', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(76, 175, 80, 0.5)' }}>ВЕРНО (+ очки)</button>
                                <button onClick={() => sendAction('AWARD_POINTS', { playerId: state.buzzedPlayerId, points: -state.categories[state.activeQuestion!.cIndex].questions[state.activeQuestion!.qIndex].price })} style={{ background: '#f44336', color: '#fff', padding: '1.5rem 3rem', border: 'none', borderRadius: '10px', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(244, 67, 54, 0.5)' }}>НЕВЕРНО (- очки)</button>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '3rem', borderTop: '2px dashed #ccc', paddingTop: '2rem', textAlign: 'center' }}>
                        <button onClick={() => sendAction('CLOSE_QUESTION')} style={{ padding: '1rem 2rem', background: '#757575', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.2rem' }}>Закрыть вопрос без начисления очков (И вернуть в табло)</button>
                    </div>
                </div>
            ) : (
                <div style={{ background: '#fff', padding: '3rem', borderRadius: '10px', marginTop: '3rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <h2 style={{ color: '#666' }}>Нет активного вопроса. На Главном экране необходимо выбрать категорию и стоимость.</h2>
                </div>
            )}

            <button onClick={handleReset} style={{ marginTop: '5rem', background: 'transparent', color: 'red', border: '2px solid red', padding: '1rem 2rem', cursor: 'pointer', borderRadius: '5px', fontSize: '1.2rem', fontWeight: 'bold' }}>Сбросить всю игру (Опасно)</button>
        </div>
    )
}
