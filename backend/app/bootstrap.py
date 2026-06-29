from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select

from app.core.config import get_settings
from app.core.database import Base, SessionFactory, engine
from app.core.security import hash_password
from app.models.enums import Priority, Status
from app.models.ticket import Ticket
from app.models.user import User

_SAMPLE_TICKETS: list[tuple[str, str | None, Status, Priority]] = [
    (
        "Не печатает сетевой принтер на 4 этаже",
        "Очередь висит, мигает красный",
        Status.NEW,
        Priority.HIGH,
    ),
    ("VPN рвётся каждые 10 минут", "Удалёнка, Windows 11", Status.IN_PROGRESS, Priority.HIGH),
    ("Запрос доступа к 1С", "Новому бухгалтеру", Status.NEW, Priority.NORMAL),
    ("Заменить картридж в МФУ переговорной", None, Status.DONE, Priority.LOW),
    ("Настроить корпоративную почту на iPhone", None, Status.NEW, Priority.NORMAL),
    ("Не работает Wi-Fi у ресепшена", None, Status.IN_PROGRESS, Priority.HIGH),
    ("Поставить Photoshop дизайнеру", None, Status.NEW, Priority.NORMAL),
    ("Сбросить пароль от внутреннего портала", None, Status.DONE, Priority.NORMAL),
    ("Шумит вентилятор в системнике", "Рабочее место 27", Status.NEW, Priority.LOW),
    ("Подключить второй монитор аналитику", None, Status.NEW, Priority.LOW),
    (
        "Ошибка 500 на внутреннем дашборде",
        "Воспроизводится после логина",
        Status.IN_PROGRESS,
        Priority.HIGH,
    ),
    ("Закупить USB-C хабы, 5 шт", None, Status.NEW, Priority.LOW),
    ("Доступ в общую папку отдела продаж", None, Status.NEW, Priority.NORMAL),
    ("Медленно грузится CRM", "Особенно отчёты", Status.NEW, Priority.NORMAL),
    ("Заблокировать учётку уволенного", None, Status.DONE, Priority.HIGH),
    ("Обновить антивирус в бухгалтерии", None, Status.NEW, Priority.NORMAL),
    ("Не открывается смета в Excel", "Похоже, файл побился", Status.NEW, Priority.NORMAL),
    ("Печать с телефонов на общий принтер", None, Status.NEW, Priority.LOW),
    ("Проблема со звуком в Zoom", None, Status.IN_PROGRESS, Priority.NORMAL),
    ("Перенести данные на новый ноут", None, Status.NEW, Priority.NORMAL),
    ("Сертификат сайта истекает через неделю", None, Status.NEW, Priority.HIGH),
    ("Добавить сотрудника в рассылку all@", None, Status.DONE, Priority.LOW),
    ("Не синхронизируется календарь", None, Status.NEW, Priority.LOW),
    ("Бэкап не запускается ночью", "Падает по таймауту", Status.IN_PROGRESS, Priority.HIGH),
]


async def init_models() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def seed_admin() -> None:
    settings = get_settings()
    async with SessionFactory() as session:
        existing = await session.scalar(
            select(User).where(User.username == settings.admin_username)
        )
        if existing is None:
            session.add(
                User(
                    username=settings.admin_username,
                    password_hash=hash_password(settings.admin_password),
                    is_admin=True,
                )
            )
            await session.commit()


async def seed_sample_tickets() -> None:
    if get_settings().is_production:
        return
    async with SessionFactory() as session:
        if await session.scalar(select(func.count()).select_from(Ticket)):
            return
        now = datetime.now(UTC)
        for offset, (title, description, status, priority) in enumerate(_SAMPLE_TICKETS):
            created = now - timedelta(hours=offset * 3)
            session.add(
                Ticket(
                    title=title,
                    description=description,
                    status=status,
                    priority=priority,
                    created_at=created,
                    updated_at=created,
                )
            )
        await session.commit()
