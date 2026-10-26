from django.conf import settings
from django.core.mail import send_mail


def send_welcome_email(user):
    if not user.email:
        return

    send_mail(
        subject='Bienvenue chez AutoLink Pro',
        message=(
            f"Bonjour {user.first_name or user.username},\n\n"
            "Bienvenue chez AutoLink Pro. Votre compte est prêt : vous pouvez "
            "découvrir les véhicules et gérer vos réservations depuis votre espace.\n\n"
            "À bientôt,\nL'équipe AutoLink Pro"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )


def send_login_notification(user):
    if not user.email:
        return

    send_mail(
        subject='Nouvelle connexion à votre compte AutoLink Pro',
        message=(
            f"Bonjour {user.first_name or user.username},\n\n"
            "Une connexion à votre compte AutoLink Pro vient d'être effectuée. "
            "Si vous n'êtes pas à l'origine de cette connexion, contactez notre "
            "équipe dès que possible.\n\n"
            "L'équipe AutoLink Pro"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )
