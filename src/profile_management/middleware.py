import logging
import traceback

from support.models import WSGIErrorsLog

logger = logging.getLogger('wsgi')
logger.setLevel(logging.DEBUG)
log_format = logging.Formatter('[%(asctime)s WSGI] %(message)s',
                               datefmt='%H:%M:%S')
file_handler = logging.FileHandler('logs/wsgi_platform.log',
                                   'a')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(log_format)
logger.addHandler(file_handler)


class LastActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            request.user.update_last_activity()
        response = self.get_response(request)
        return response


class ErrorLogsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if response.status_code in [400, 403, 404]:
            try:
                if request.method == "GET":
                    params = dict(request.GET)
                elif request.method == "POST":
                    params = dict(request.POST)
                else:
                    params = {}
            except Exception:
                params = None
            try:
                if request.method in ["POST", "PATCH"]:
                    data = response.data
                else:
                    data = None
            except Exception:
                data = None
            if response.status_code != 404 and request.user is not None:
                WSGIErrorsLog.objects.create(
                    user=request.user if request.user.is_authenticated
                    else None,
                    path_info=request.path_info,
                    method=request.method,
                    status_code=response.status_code,
                    params=params,
                    response=data,
                )
        return response

    def process_exception(self, request, exception):
        if not request.user.is_authenticated:
            return None
        tb = exception.__traceback__
        traceback_log = traceback.format_exception(type(exception),
                                                   exception,
                                                   tb)
        traceback_log = list(filter(
            lambda s: len(s) != s.count("^")+s.count(" "), traceback_log
        ))
        params = {}
        try:
            if request.method == "GET":
                params = dict(request.GET)
            elif request.method == "POST":
                params = dict(request.POST)
        except Exception:
            params = None
        WSGIErrorsLog.objects.create(
            user=request.user if request.user.is_authenticated else None,
            exception=str(exception),
            path_info=request.path_info,
            method=request.method,
            status_code=500,
            traceback_log=traceback_log,
            params=params,
        )
        return None
