# Одуванчик и ветер

Локальная стратегическая игра для двух игроков за одним экраном.

## Запуск

```bash
npm install
npm run dev
```

Откройте `http://localhost:3000`, выберите размер квадратного поля и начните игру.

## Проверка

```bash
npm run build
npm run lint
node --test --test-isolation=none tests/rendered-html.test.mjs
```
