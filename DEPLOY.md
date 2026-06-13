# Інструкція з деплою Bliz на InfinityFree

## Крок 1: Створи MySQL базу на InfinityFree

1. Зайди в панель InfinityFree
2. Перейди в **MySQL Databases**
3. Створи нову базу даних
4. Запиши дані:
   - Database Name (наприклад: `if0_42174149_bliz`)
   - Database User (наприклад: `if0_42174149`)
   - Database Password
   - MySQL Hostname (наприклад: `sql123.infinityfree.com`)

## Крок 2: Оновити config/database.php

Заміни дані підключення на свої з InfinityFree:

```php
define('DB_HOST', 'sql123.infinityfree.com'); // Твій MySQL hostname
define('DB_PORT', '3306');
define('DB_NAME', 'if0_42174149_bliz'); // Твоя база даних
define('DB_USER', 'if0_42174149'); // Твій користувач
define('DB_PASS', 'твій_пароль'); // Твій пароль
```

## Крок 3: Завантажити файли

1. Перейди в **Files** → **File Manager**
2. Відкрий папку `htdocs`
3. Видали всі файли звідти
4. Завантаж всі файли з проекту Bliz в `htdocs`

Структура повинна бути:
```
htdocs/
├── index.html
├── admin/
├── api/
├── assets/
├── config/
└── upload/
```

## Крок 4: Ініціалізація бази даних

1. Відкрий в браузері: `http://database4434343.42web.io/config/init_db.php`
2. Це створить всі таблиці
3. Потім відкрий: `http://database4434343.42web.io/config/seed.php`
4. Це додасть 15 тестових товарів та адмін акаунт

## Крок 5: Готово!

Сайт доступний: `http://database4434343.42web.io`

Адмін панель: `http://database4434343.42web.io/admin/`

**Логін адміна:**
- Email: admin@bliz.ua
- Пароль: admin123

## Примітка

InfinityFree має обмеження:
- Можуть бути затримки (до 72 годин для DNS)
- Обмеження на кількість запитів
- Для продакшна краще використати платний хостинг
