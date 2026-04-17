---
description: Развертывание (Деплой) проекта на Vercel
---
Инструкция для публикации проекта "Своя Игра" в интернет.

1. Инициализируйте Git и закоммитьте код:
```bash
git init
git add .
git commit -m "Initial commit for Svoya Igra web prototype"
```
2. Опубликуйте репозиторий в вашем GitHub аккаунте. Если у вас установлен GitHub CLI:
```bash
gh repo create svoya-igra --public --source=. --remote=origin
git push -u origin main
```
3. Разверните проект в Vercel:
```bash
npx vercel --prod
```
Или просто зайдите на vercel.com, нажмите "Add New Project", выберите созданный GitHub-репозиторий и нажмите "Deploy". Все настройки (Next.js) будут определены платформой автоматически.
