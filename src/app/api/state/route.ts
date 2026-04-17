import { NextResponse } from 'next/server';
import { createClient } from 'redis';

export interface Question { price: number; text: string; answer: string; isPlayed?: boolean; imageUrl?: string; audioUrl?: string; isCat?: boolean; }
export interface Category { categoryName: string; questions: Question[]; }
export interface Player { id: string; name: string; score: number; }

export interface GameState {
    categories: Category[];
    players: Record<string, Player>;
    activeQuestion: { cIndex: number; qIndex: number; isCat?: boolean; isRevealed?: boolean; assignedPlayerId?: string; catAssignedPrice?: number; showAnswer?: boolean } | null;
    buzzedPlayerId: string | null;
    buzzersEnabled: boolean;
}

const generateQuestions = (count: number = 5): Question[] => {
    return Array.from({ length: count }).map((_, i) => ({ price: (i + 1) * 100, text: `Текст вопроса за ${(i + 1) * 100}...`, answer: "Правильный ответ", isPlayed: false, isCat: false }));
};

const initCategories = () => {
    const defaultPlaceholder = (text: string, answer: string, price: number) => ({ price, text, answer, isPlayed: false, isCat: false });

    const categories = [
        {
            categoryName: "География", questions: [
                defaultPlaceholder("Цветок-символ Калмыкии, цветущий в степи весной", "Тюльпан", 100),
                defaultPlaceholder("Какое озеро называют жемчужиной Тянь-Шаня?", "Иссык-Куль", 200),
                defaultPlaceholder("В каком городе родился Зураб Церетели?", "Тбилиси", 300),
                defaultPlaceholder("Какой знаменитый царь после взятия Казани в 1552 году начал присоединять Марийский Край к Российскому государству?", "Иван Грозный", 400),
                defaultPlaceholder("Кто архитектор центра Гейдара Алиева в Баку?", "Заха Хадид", 500)
            ]
        },
        {
            categoryName: "Панда", questions: [
                defaultPlaceholder("Сколько должно стоить помолвочное кольцо?", "Три зарплаты", 100),
                defaultPlaceholder("Выберите лишнее: выть, спорт, батониться", "Спорт", 200),
                defaultPlaceholder("Как хотели назвать Риту?", "Лера", 300),
                defaultPlaceholder("Какие кости Рита сломала на шашлыках в 2023 году?", "Таранную и фалангу пальца", 400),
                defaultPlaceholder("Какой Ритин любимый музей?", "Музей естественной истории в Лондоне", 500)
            ]
        },
        {
            categoryName: "Фильмы", questions: [
                { price: 100, text: "Угадайте, из какого фильма этот кадр", answer: "Гарри Поттер", imageUrl: "/movie100.jpg", isPlayed: false, isCat: false },
                { price: 200, text: "Угадайте, из какого фильма этот кадр", answer: "Ирония судьбы, или С легким паром", imageUrl: "/movie200.jpg", isPlayed: false, isCat: false },
                { price: 300, text: "Угадайте, из какого фильма этот кадр", answer: "Кавказская пленница", imageUrl: "/movie300.jpg", isPlayed: false, isCat: false },
                { price: 400, text: "Угадайте, из какого фильма этот кадр", answer: "Как я встретил вашу маму", imageUrl: "/movie400.jpg", isPlayed: false, isCat: false },
                { price: 500, text: "Угадайте, из какого фильма этот кадр", answer: "Москва слезам не верит", imageUrl: "/movie500.jpg", isPlayed: false, isCat: false }
            ]
        },
        {
            categoryName: "Хачи", questions: [
                { price: 100, text: "О ком из кардиоцентра этот мем?", answer: "Зураб", imageUrl: "/hachi100.jpg", isPlayed: false, isCat: false },
                defaultPlaceholder("Кто из здесь присутствующих дрался с таксистом-хачом?", "Вася", 200),
                defaultPlaceholder("Если пить чай, то с какой добавкой?", "Чабрец", 300),
                defaultPlaceholder("Какому количеству хачей ваш покорный слуга писала диссертацию?", "Двум", 400),
                defaultPlaceholder("Выберите лишнее: Дубай, Япония, Стамбул, Саудовская Аравия, Норвегия", "Норвегия", 500)
            ]
        },
        {
            categoryName: "Даренский", questions: [
                defaultPlaceholder("Продолжите фразу: мда…", "Так и знал", 100),
                defaultPlaceholder("Какая любимая социальная сеть у Дмитрий Ивановича?", "ВКонтакте", 200),
                defaultPlaceholder("Выберите лишнее: трипликсам, брилинта, эликвис", "Брилинта", 300),
                defaultPlaceholder("О каком предмете идет речь? Новый, большой, складной…", "Мат", 400),
                defaultPlaceholder("Про кого была сказана фраза «О! Я вот как знал, где вас искать, там, где еда и диван»", "Про Сашу", 500)
            ]
        },
        {
            categoryName: "Пиво", questions: [
                defaultPlaceholder("Какой мой любимый вид пива?", "Светлое нефильтрованное", 100),
                defaultPlaceholder("Какая страна считается мировым лидером по потреблению пива на душу населения?", "Чехия", 200),
                defaultPlaceholder("В какой европейской столице находится музей пива «Heineken Experience»?", "Амстердам", 300),
                defaultPlaceholder("Предположите, сколько градусов в самом крепком пиве, которое внесено в книгу рекордов Гиннеса?", "67,5% - это пиво Snake Venom", 400),
                defaultPlaceholder("Какие учреждения/заведения были ключевыми в истории европейского пивоварения?", "Монастыри (правило Ora et labora)", 500)
            ]
        },
        {
            categoryName: "Угадай мелодию", questions: [
                { price: 100, text: "Угадайте мелодию:", answer: "La isla bonita", audioUrl: "/placeholder-song.mp3", isPlayed: false, isCat: false },
                { price: 200, text: "Угадайте мелодию:", answer: "Иностранец", audioUrl: "/placeholder-song.mp3", isPlayed: false, isCat: false },
                { price: 300, text: "Угадайте мелодию:", answer: "Яхта парус", audioUrl: "/placeholder-song.mp3", isPlayed: false, isCat: false },
                { price: 400, text: "Угадайте мелодию:", answer: "Big in Japan (Альфавилль)", audioUrl: "/placeholder-song.mp3", isPlayed: false, isCat: false },
                { price: 500, text: "Угадайте мелодию:", answer: "До скорой встречи", audioUrl: "/placeholder-song.mp3", isPlayed: false, isCat: false }
            ]
        }
    ];

    const totalCats = 2;
    let placedCats = 0;
    while (placedCats < totalCats) {
        const randomCIndex = Math.floor(Math.random() * categories.length);
        const randomQIndex = Math.floor(Math.random() * 5);
        if (!categories[randomCIndex].questions[randomQIndex].isCat) {
            categories[randomCIndex].questions[randomQIndex].isCat = true;
            placedCats++;
        }
    }
    return categories;
};

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
                return data;
            }
            const initialState = {
                categories: initCategories(), players: {}, activeQuestion: null, buzzedPlayerId: null, buzzersEnabled: false
            };
            await redis.set(KV_KEY, JSON.stringify(initialState));
            return initialState;
        } catch (err) {
            console.error("[redis-get] ОШИБКА чтения из Redis:", err);
        }
    }
    return fallbackState;
}

async function saveState(state: GameState) {
    const redis = await getRedis();
    if (redis) {
        try {
            await redis.set(KV_KEY, JSON.stringify(state));
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
                const qInfo = currentState.categories[payload.cIndex].questions[payload.qIndex];
                currentState.activeQuestion = {
                    cIndex: payload.cIndex,
                    qIndex: payload.qIndex,
                    isCat: !!qInfo.isCat,
                    isRevealed: !qInfo.isCat
                };
                currentState.categories[payload.cIndex].questions[payload.qIndex].isPlayed = true;
                currentState.buzzedPlayerId = null;
                currentState.buzzersEnabled = false;
                break;
            case 'ASSIGN_CAT':
                if (currentState.activeQuestion && currentState.activeQuestion.isCat) {
                    currentState.activeQuestion.assignedPlayerId = payload.playerId;
                    currentState.activeQuestion.catAssignedPrice = payload.price;
                    currentState.activeQuestion.isRevealed = true;
                    currentState.buzzedPlayerId = payload.playerId;
                    currentState.buzzersEnabled = false;
                }
                break;
            case 'SHOW_ANSWER':
                if (currentState.activeQuestion) {
                    currentState.activeQuestion.showAnswer = true;
                    // Очищаем текущего отвечающего, так как играем просто ответ
                    currentState.buzzedPlayerId = null;
                    currentState.buzzersEnabled = false;
                }
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
                    // При правильном ответе открываем ответ на экране всем, а не закрываем вопрос
                    if (currentState.activeQuestion) {
                        currentState.activeQuestion.showAnswer = true;
                    }
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
