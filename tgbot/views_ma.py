from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.contrib.auth import login
from django.views.generic import TemplateView
from rest_framework.views import APIView
from profile_management.models import Telegram
from rest_framework.response import Response
from rest_framework import status


class ErrorPageMATemplateView(TemplateView):
    template_name = "errorpage_ma.html"

    def get(self, request, *args, **kwargs):
        errors = {
            "login_not_tg_id": "На эту страницу необходимо заходить из бота Telegram",
            "login_not_tg_note": "Для продолжения работы необходимо привязать Telegram",
        }
        if kwargs.get("err") and errors.get(kwargs.get("err")):
            error_text = errors.get(kwargs.get("err"))
        else:
            error_text = "Произошла ошибка"
        context = {
            "error": error_text,
        }
        return render(request, self.template_name, context)


class UserLoginMAAPIView(APIView):
    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return Response(request.POST.get('redirect_url') if request.POST.get('redirect_url') else '/ma/',
                            status=status.HTTP_302_FOUND)
        if request.POST:
            tg_id = request.POST.get('tg_id')
            if not tg_id:
                return Response("/ma/error/login_not_tg_id/", status=status.HTTP_302_FOUND)
            try:
                tg_note = Telegram.objects.get(tg_id=tg_id)
                login(request, tg_note.user)
                return Response(request.POST.get('redirect_url') if request.POST.get('redirect_url') else '/ma/',
                                status=status.HTTP_302_FOUND)
            except Telegram.DoesNotExist:
                return Response("/ma/error/login_not_tg_note/", status=status.HTTP_302_FOUND)