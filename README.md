# Lumière Beauty Clinic

Сайт косметологической клиники: главная, услуги и контакты с 3D-сценой на Three.js.

## Структура проекта

```
cosmetology/
├── index.html          # Главная страница
├── services.html       # Услуги и фильтр категорий
├── contacts.html       # Контакты, форма и 3D-сцена
├── main.js             # Навигация, слайдер, фильтр, форма
├── three-handler.js    # Three.js сцена (страница контактов)
├── style.css           # Стили
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── package.json
└── vite.config.js
```

## Локальная разработка

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

Готовые файлы появятся в папке `dist/`.

## GitHub Pages

Сайт публикуется автоматически при push в ветку `main` через GitHub Actions.

Адрес: **https://tuhtaevsalmon.github.io/cosmetology/**
