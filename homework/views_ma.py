from django.views.generic import TemplateView
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache


decorators = [never_cache]


@method_decorator(decorators, name='dispatch')
class HomeworkListMAPage(TemplateView):
    template_name = "ma/homework_list.html"

    def get_settings(self):
        user_groups = [group.name for group in self.request.user.groups.all()]
        tabs = []
        settings = {
            "show_listener": False,
            "show_teacher": False,
            "show_agreement_filter": False
        }
        if "Admin" in user_groups:
            tabs.append({
                "name": "В работе",
                "statuses": [1, 2, 3, 5, 7],
            })
            tabs.append({
                "name": "Принято",
                "statuses": [4],
            })
            settings["show_listener"] = True
            settings["show_teacher"] = True
            settings["show_agreement_filter"] = True
        if "Metodist" in user_groups:
            tabs.append({
                "name": "Согласовать",
                "statuses": [4, 5, 7],
                "need_agreement": True
            })
            tabs.append({
                "name": "Остальные",
                "statuses": [1, 2, 3],
                "need_agreement": False
            })
            settings["show_listener"] = True
            settings["show_teacher"] = True
            settings["show_agreement_filter"] = True
        if "Teacher" in user_groups or "Curator" in user_groups:
            tabs.append({
                "name": "Проверить",
                "statuses": [3]
            })
            tabs.append({
                "name": "Отправлено",
                "statuses": [1, 2, 5, 7]
            })
            tabs.append({
                "name": "Принято",
                "statuses": [4]
            })
            settings["show_listener"] = True
        if "Listener" in user_groups:
            tabs.append({
                "name": "Выполнить",
                "statuses": [2, 5, 7]
            })
            tabs.append({
                "name": "Отправлено",
                "statuses": [3]
            })
            tabs.append({
                "name": "Принято",
                "statuses": [4]
            })
            settings["show_teacher"] = True
        return {"tabs": tabs, "settings": settings}

    def get(self, request, *args, **kwargs):
        settings = self.get_settings()
        context = {
            "title": "Домашние задания",
            "is_authenticated": request.user.is_authenticated,
            "tabs": settings["tabs"],
            "settings": settings["settings"]
        }
        return render(request, self.template_name, context)


@method_decorator(decorators, name='dispatch')
class HomeworkItemMAPage(TemplateView):
    template_name = "ma/homework_item.html"

    def get(self, request, *args, **kwargs):
        context = {
            "title": "Домашнее задание",
            "homework_id": kwargs.get("pk"),
            "homework_info": request.user.groups.filter(
                name__in=["Admin", "Metodist", "Teacher", "Curator"]).exists(),
            "is_authenticated": request.user.is_authenticated,
        }
        return render(request, self.template_name, context)
