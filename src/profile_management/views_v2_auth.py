from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from datetime import datetime
from rest_framework.views import APIView


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')
            response.set_cookie(
                key=settings.SIMPLE_JWT['REFRESH_COOKIE_NAME'],
                value=refresh_token,
                expires=datetime.now() + settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax'
            )
            response.data = {'access': access_token}
        return response


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['REFRESH_COOKIE_NAME'])

        if not refresh_token:
            return Response(
                {'detail': 'Refresh token is missing'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        request.data['refresh'] = refresh_token
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            access_token = response.data.get('access')
            new_refresh_token = response.data.get('refresh')

            if new_refresh_token:
                response.set_cookie(
                    key=settings.SIMPLE_JWT['REFRESH_COOKIE_NAME'],
                    value=new_refresh_token,
                    expires=datetime.now() + settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
                    httponly=True,
                    secure=not settings.DEBUG,
                    samesite='Lax'
                )

            response.data = {'access': access_token}

        return response


class LogoutView(APIView):
    def post(self, request):
        response = Response({'detail': 'Successfully logged out'})
        response.delete_cookie(
            key=settings.SIMPLE_JWT['REFRESH_COOKIE_NAME'],
            samesite='Lax'
        )
        return response