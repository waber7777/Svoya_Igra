import { NextResponse } from 'next/server';

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

let globalState: GameState = {
    categories: initCategories(),
    players: {},
    activeQuestion: null,
    buzzedPlayerId: null,
    buzzersEnabled: false
};

export async function POST(req: Request) {
    try {
        const { action, payload } = await req.json();

        switch (action) {
            case 'JOIN':
                if (!globalState.players[payload.id]) {
                    globalState.players[payload.id] = { id: payload.id, name: payload.name, score: 0 };
                }
                break;
            case 'OPEN_QUESTION':
                globalState.activeQuestion = { cIndex: payload.cIndex, qIndex: payload.qIndex };
                globalState.categories[payload.cIndex].questions[payload.qIndex].isPlayed = true;
                globalState.buzzedPlayerId = null;
                globalState.buzzersEnabled = false;
                break;
            case 'ENABLE_BUZZERS':
                globalState.buzzersEnabled = true;
                globalState.buzzedPlayerId = null;
                break;
            case 'BUZZ':
                if (globalState.buzzersEnabled && !globalState.buzzedPlayerId) {
                    globalState.buzzedPlayerId = payload.playerId;
                    globalState.buzzersEnabled = false;
                }
                break;
            case 'AWARD_POINTS':
                if (globalState.players[payload.playerId]) {
                    globalState.players[payload.playerId].score += payload.points;
                }
                globalState.buzzedPlayerId = null;
                globalState.buzzersEnabled = true;
                break;
            case 'CLOSE_QUESTION':
                globalState.activeQuestion = null;
                globalState.buzzedPlayerId = null;
                globalState.buzzersEnabled = false;
                break;
            case 'RESET_GAME':
                globalState.categories = initCategories();
                globalState.players = {};
                globalState.activeQuestion = null;
                globalState.buzzedPlayerId = null;
                globalState.buzzersEnabled = false;
                break;
        }
        return NextResponse.json(globalState);
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json(globalState);
}
