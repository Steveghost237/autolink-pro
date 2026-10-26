from django.conf import settings
from django.core.mail import send_mail


SUPPORTED_LANGUAGES = {'fr', 'en'}


def get_request_language(request):
    header = request.headers.get('Accept-Language', '') if request else ''
    for candidate in header.split(','):
        language = candidate.split(';', 1)[0].strip().split('-', 1)[0].lower()
        if language in SUPPORTED_LANGUAGES:
            return language
    return 'fr'


def get_user_language(user):
    language = getattr(user, 'language', 'fr')
    return language if language in SUPPORTED_LANGUAGES else 'fr'


def contact_acknowledgement(first_name, language='fr'):
    if language == 'en':
        return (
            'AutoLink Pro — We received your message',
            f"Hello {first_name},\n\n"
            "We have received your message and will get back to you as soon as possible.\n\n"
            "The AutoLink Pro team",
        )
    return (
        'AutoLink Pro — Demande bien reçue',
        f"Bonjour {first_name},\n\n"
        "Nous avons bien reçu votre message et vous répondrons "
        "dans les meilleurs délais.\n\nL'équipe AutoLink Pro",
    )


def send_welcome_email(user):
    if not user.email:
        return

    if get_user_language(user) == 'en':
        subject = 'Welcome to AutoLink Pro'
        message = (
            f"Hello {user.first_name or user.username},\n\n"
            "Welcome to AutoLink Pro. Your account is ready: explore vehicles "
            "and manage your bookings from your account.\n\n"
            "See you soon,\nThe AutoLink Pro team"
        )
    else:
        subject = 'Bienvenue chez AutoLink Pro'
        message = (
            f"Bonjour {user.first_name or user.username},\n\n"
            "Bienvenue chez AutoLink Pro. Votre compte est prêt : vous pouvez "
            "découvrir les véhicules et gérer vos réservations depuis votre espace.\n\n"
            "À bientôt,\nL'équipe AutoLink Pro"
        )

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )


def send_login_notification(user):
    if not user.email:
        return

    if get_user_language(user) == 'en':
        subject = 'New sign-in to your AutoLink Pro account'
        message = (
            f"Hello {user.first_name or user.username},\n\n"
            "A sign-in to your AutoLink Pro account has just taken place. "
            "If you did not sign in, please contact our team as soon as possible.\n\n"
            "The AutoLink Pro team"
        )
    else:
        subject = 'Nouvelle connexion à votre compte AutoLink Pro'
        message = (
            f"Bonjour {user.first_name or user.username},\n\n"
            "Une connexion à votre compte AutoLink Pro vient d'être effectuée. "
            "Si vous n'êtes pas à l'origine de cette connexion, contactez notre "
            "équipe dès que possible.\n\n"
            "L'équipe AutoLink Pro"
        )

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )
