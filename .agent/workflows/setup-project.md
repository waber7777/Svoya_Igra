---
description: Инициализация нового проекта Своя Игра на Next.js
---
Этот workflow предназначен для базовой инициализации прототипа игры с использованием Next.js.
// turbo-all
1. Создайте основу приложения Next.js
```bash
npx -y create-next-app@latest ./ --typescript --tailwind=false --eslint --app --src-dir --import-alias "@/*" --use-npm
```
2. Установите Zustand для управления состоянием:
```bash
npm install zustand
```
3. Установите библиотеку для иконок, например lucide-react:
```bash
npm install lucide-react
```
4. Удалите стандартный код из `src/app/page.tsx` и `src/app/globals.css`.
