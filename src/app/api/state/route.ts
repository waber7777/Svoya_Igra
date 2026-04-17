import { NextResponse } from 'next/server';
import { createClient } from 'redis';

export interface Question { price: number; text: string; answer: string; isPlayed?: boolean; imageUrl?: string; audioUrl?: string; }
export interface Category { categoryName: string; questions: Question[]; }
export interface Player { id: string; name: string; score: number; }

export interface GameState {
    categories: Category[];
    players: Record<string, Player>;
    activeQuestion: { cIndex: number; qIndex: number } | null;
    buzzedPlayerId: string | null;
    buzzersEnabled: boolean;
}

const generateQuestions = (count: number = 5): Question[] => {
    return Array.from({ length: count }).map((_, i) => ({ price: (i + 1) * 100, text: `Текст вопроса за ${(i + 1) * 100}...`, answer: "Правильный ответ", isPlayed: false, }));
};

const initCategories = () => [
    { categoryName: "География", questions: generateQuestions() },
    { categoryName: "Панда", questions: generateQuestions() },
    { categoryName: "Фильмы", questions: generateQuestions().map(q => ({ ...q, imageUrl: "/placeholder-movie.jpg" })) },
    { categoryName: "Хачи", questions: generateQuestions().map((q, i) => i === 0 ? { ...q, imageUrl: "/placeholder-hachi.jpg" } : q) },
    { categoryName: "Даренский", questions: generateQuestions() },
    { categoryName: "Пиво", questions: generateQuestions() },
    { categoryName: "Угадай мелодию", questions: generateQuestions().map(q => ({ ...q, audioUrl: "/placeholder-song.mp3" })) }
];

let fallbackState: GameState = {
    categories: initCategories(),
    players: {},
    activeQuestion: null,
    buzzedPlayerId: null,
    buzzersEnabled: false
};

const KV_KEY = 'svoya_igra_state';

let redisClient: any = null;

async function getRedis() {
    if (!process.env.KV_REDIS_URL) return null;
    if (!redisClient) {
        redisClient = createClient({ url: process.env.KV_REDIS_URL });
        redisClient.on('error', (err: any) => console.error('Redis Client Error', err));
        await redisClient.connect();
    }
    return redisClient;
}

async function getState(): Promise<GameState> {
    const redis = await getRedis();
    if (redis) {
        try {
            const dataStr = await redis.get(KV_KEY);
            if (dataStr) {
                const data = JSON.parse(dataStr) as GameState;
                console.log(`[redis-get] Успешно загружено. Игроков: ${Object.keys(data.players).length}`);
                return data;
            }
            console.log("[redis-get] Redis пуст! Создаю начальный стейт...");
            const initialState = {
                categories: initCategories(), players: {}, activeQuestion: null, buzzedPlayerId: null, buzzersEnabled: false
            };
            await redis.set(KV_KEY, JSON.stringify(initialState));
            return initialState;
        } catch (err) {
            console.error("[redis-get] ОШИБКА чтения из Redis:", err);
        }
    } else {
        console.error("[redis-get] ОШИБКА: Ключ KV_REDIS_URL не найден в переменных окружения!");
    }
    return fallbackState;
}

async function saveState(state: GameState) {
    const redis = await getRedis();
    if (redis) {
        try {
            await redis.set(KV_KEY, JSON.stringify(state));
            console.log(`[redis-set] Сохранено. Игроков: ${Object.keys(state.players).length}`);
        } catch (err) {
            console.error("[redis-set] ОШИБКА записи в Redis:", err);
        }
    } else {
        fallbackState = state;
    }
}

export async function POST(req: Request) {
    try {
        const { action, payload } = await req.json();
        const currentState = await getState();

        switch (action) {
            case 'JOIN':
                if (!currentState.players[payload.id]) {
                    currentState.players[payload.id] = { id: payload.id, name: payload.name, score: 0 };
                }
                break;
            case 'OPEN_QUESTION':
                currentState.activeQuestion = { cIndex: payload.cIndex, qIndex: payload.qIndex };
                currentState.categories[payload.cIndex].questions[payload.qIndex].isPlayed = true;
                currentState.buzzedPlayerId = null;
                currentState.buzzersEnabled = false;
                break;
            case 'ENABLE_BUZZERS':
                currentState.buzzersEnabled = true;
                currentState.buzzedPlayerId = null;
                break;
            case 'BUZZ':
                if (currentState.buzzersEnabled && !currentState.buzzedPlayerId) {
                    currentState.buzzedPlayerId = payload.playerId;
                    currentState.buzzersEnabled = false;
                }
                break;
            case 'AWARD_POINTS':
                if (currentState.players[payload.playerId]) {
                    currentState.players[payload.playerId].score += payload.points;
                }
                if (payload.points > 0) {
                    currentState.activeQuestion = null;
                    currentState.buzzedPlayerId = null;
                    currentState.buzzersEnabled = false;
                } else {
                    currentState.buzzedPlayerId = null;
                    currentState.buzzersEnabled = true;
                }
                break;
            case 'CLOSE_QUESTION':
                currentState.activeQuestion = null;
                currentState.buzzedPlayerId = null;
                currentState.buzzersEnabled = false;
                break;
            case 'RESET_GAME':
                currentState.categories = initCategories();
                currentState.players = {};
                currentState.activeQuestion = null;
                currentState.buzzedPlayerId = null;
                currentState.buzzersEnabled = false;
                break;
        }

        await saveState(currentState);
        return NextResponse.json(currentState);
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function GET() {
    const currentState = await getState();
    return NextResponse.json(currentState);
}
