# Кабинет геоприсутствия — «Истинный интеллект»

Клиенты смотрят просмотры карточек, переходы на сайт, звонки, маршруты, рейтинг и отзывы по своим филиалам. Администратор видит все компании.

Стек в ТЗ допускал замену NestJS. Здесь **Bun + Elysia 2**: те же REST и PostgreSQL, типы ответов на фронт идут из `export type App`, без второй модели.

## Что нужно

- [Docker](https://docs.docker.com/get-docker/)
- Для разработки без контейнеров API/веба ещё [Bun](https://bun.sh)

## Запуск в Docker (два образа: backend и frontend)

Из корня репозитория:

```bash
docker compose up --build
```

- интерфейс: http://localhost:3000
- API: http://localhost:3001/health
- Postgres: localhost:5433 (внутри сети контейнеров — порт 5432)

Миграции и тестовые данные поднимаются вместе с API (`SEED_ON_START=true`).

Собрать и выложить образы отдельно:

```bash
docker build -f apps/api/Dockerfile -t ghcr.io/<org>/istinny-api:latest .
docker build -f apps/web/Dockerfile -t ghcr.io/<org>/istinny-web:latest .
docker push ghcr.io/<org>/istinny-api:latest
docker push ghcr.io/<org>/istinny-web:latest
```

Веб на сборке ходит в API по `http://api:3001` (имя сервиса в compose). С хоста браузер открывает только порт 3000; cookie сессии ставит Next, запросы к API проксирует `/api-proxy/*`.

## Запуск без контейнеров API и веба

Postgres всё равно из compose:

```bash
docker compose up -d db
cp .env.example .env
bun install
bun run db:migrate
bun run db:seed
bun run test
bun run dev
```

На Windows вместо `cp` — `copy .env.example .env`.

Проверки:

```bash
bun run lint
bun run fmt:check
bun run typecheck
bun run test
```

Перед коммитом husky гоняет oxfmt и oxlint по staged-файлам.

## Учётки (вымышленные)

| Роль   | Email                   | Пароль        | Данные                               |
| ------ | ----------------------- | ------------- | ------------------------------------ |
| Клиент | `marina@sever.example`  | `client-demo` | компания «Северный берег», 2 филиала |
| Админ  | `admin@istinny.example` | `admin-demo`  | обе компании, 3 филиала              |

Чужой филиал через прямой запрос к API даёт 403. Это покрыто тестом `apps/api/test/isolation.test.ts`.

## Архитектура

- `apps/web` — Next.js App Router. Страницы грузят данные на сервере. Фильтры — query string.
- `apps/api` — Elysia. Слушает порт только `src/index.ts`. Сборка приложения и `type App` — в `src/app.ts`.
- PostgreSQL: компании, пользователи, филиалы, ежедневные метрики, отзывы. SQL-миграция в `apps/api/drizzle/`.
- Права проверяются на каждом маршруте: клиент ограничен своим `companyId`, списки режутся в сервисе.

Дополнительное задание: модуль отзывов — фильтр по оценке и статусу (`new` / `processing` / `done`), смена статуса.

## Ограничения

- Секрет cookie и пароли только для демо. Нет сброса пароля и 2FA.
- Цифры на дашборде из сида, живого геосервиса нет.
- Отзывы без пагинации.
- Один инстанс API, без очереди.

## Как масштабировать до 500+ компаний и тысяч филиалов

1. Партиции `daily_metrics` по месяцу, уникальность `(branch_id, day)`.
2. Сводку не считать на каждый запрос: ночной снимок + инкремент за сегодня.
3. Индексы: `branches(company_id)`, `daily_metrics(branch_id, day)`, `reviews(branch_id, status, published_at)`. RLS в Postgres как второй слой после проверки в сервисе.
4. Списки филиалов и отзывов — курсор, не полная выборка.
5. Сессии в Redis или таблице с TTL; несколько API за reverse proxy.
6. Чтение дашборда с replica, запись отзывов на primary.
