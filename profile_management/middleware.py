import traceback
from support.models import WSGIErrorsLog


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
            except Exception as e:
                params = None
            WSGIErrorsLog.objects.create(
                user=request.user if request.user.is_authenticated else None,
                path_info=request.path_info,
                method=request.method,
                status_code=response.status_code,
                params=params,
            )
        return response

    def process_exception(self, request, exception):
        tb = exception.__traceback__
        traceback_log = traceback.format_exception(type(exception), exception, tb)
        traceback_log = list(filter(lambda s: len(s) != s.count("^")+s.count(" "), traceback_log))
        params = {}
        try:
            if request.method == "GET":
                params = dict(request.GET)
            elif request.method == "POST":
                params = dict(request.POST)
        except Exception as e:
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
