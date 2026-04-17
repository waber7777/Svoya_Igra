import useSWR from 'swr';
import { GameState } from '@/app/api/state/route';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useGameState() {
    const { data, mutate } = useSWR<GameState>('/api/state', fetcher, {
        refreshInterval: 1000,
    });

    const sendAction = async (action: string, payload: any = {}) => {
        await fetch('/api/state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, payload })
        });
        mutate();
    };

    return { state: data, sendAction };
}
