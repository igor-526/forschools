from django.core.mail import send_mail
from dls.settings import EMAIL_HOST_USER


def send_email_message(email: str, message: str, subject: str = "Без темы"):
    send_mail(subject, message,
              EMAIL_HOST_USER,
              [email],
              fail_silently=True)
