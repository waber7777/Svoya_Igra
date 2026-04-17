import { create } from 'zustand';

export interface Question {
    price: number;
    text: string;
    answer: string;
    isPlayed?: boolean;
    imageUrl?: string;
    audioUrl?: string;
}

export interface Category {
    categoryName: string;
    questions: Question[];
}

interface GameState {
    score: number;
    addScore: (points: number) => void;
    subtractScore: (points: number) => void;
    playQuestion: (categoryId: number, questionIndex: number) => void;
    categories: Category[];
}

// Помощник для генерации пустых вопросов
const generateQuestions = (count: number = 5): Question[] => {
    return Array.from({ length: count }).map((_, i) => ({
        price: (i + 1) * 100,
        text: `Текст вопроса за ${(i + 1) * 100}...`,
        answer: "Правильный ответ",
        isPlayed: false,
    }));
};

export const useGameStore = create<GameState>((set) => ({
    score: 0,
    addScore: (points) => set((state) => ({ score: state.score + points })),
    subtractScore: (points) => set((state) => ({ score: state.score - points })),
    categories: [
        { categoryName: "География", questions: generateQuestions() },
        { categoryName: "Панда", questions: generateQuestions() },
        {
            categoryName: "Фильмы",
            // В этой категории для всех требуются картинки
            questions: generateQuestions().map(q => ({ ...q, imageUrl: "/placeholder-movie.jpg" }))
        },
        {
            categoryName: "Хачи",
            // В этой категории только для одного вопроса указано, что будет картинка
            questions: generateQuestions().map((q, i) => i === 0 ? { ...q, imageUrl: "/placeholder-hachi.jpg" } : q)
        },
        { categoryName: "Даренский", questions: generateQuestions() },
        { categoryName: "Пиво", questions: generateQuestions() },
        {
            categoryName: "Угадай мелодию",
            // В этой категории требуются аудио файлы (песни)
            questions: generateQuestions().map(q => ({ ...q, audioUrl: "/placeholder-song.mp3" }))
        }
    ],
    playQuestion: (categoryId, questionIndex) => set((state) => {
        const newCategories = [...state.categories];
        const question = { ...newCategories[categoryId].questions[questionIndex] };
        question.isPlayed = true;
        newCategories[categoryId].questions[questionIndex] = question;
        return { categories: newCategories };
    })
}));
