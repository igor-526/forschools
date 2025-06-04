from django.contrib.auth import login
from rest_framework.views import APIView
from profile_management.models import Telegram
from rest_framework.response import Response
from rest_framework import status


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