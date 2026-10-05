FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libjpeg62-turbo-dev zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn==21.2.0

COPY . .

EXPOSE 8000

# seed_demo_users : crée/met à jour les 4 comptes démo (idempotent) à chaque
# démarrage — désactivable en posant SEED_DEMO_USERS=false dans Dokploy.
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py seed_demo && ( [ \"$SEED_DEMO_USERS\" = \"false\" ] || python manage.py seed_demo_users ) && python manage.py collectstatic --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 60"]
