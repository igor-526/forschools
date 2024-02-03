from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render
from django.urls import reverse_lazy
from django.views.generic import TemplateView
from .forms import MaterialForm, MaterialCategoryForm
from .models import Material


class MaterialPage(LoginRequiredMixin, TemplateView):    # страница матриалов
    template_name = "materials.html"

    def get(self, request, *args, **kwargs):
        data = Material.objects.all()
        context = {'materials': data}
        return render(request, self.template_name, context)


class MaterialAdd(LoginRequiredMixin, TemplateView):
    template_name = "material_add.html"


def material_add_get(request, *args, **kwargs):
    form_mat = MaterialForm()
    form_cat = MaterialCategoryForm()
    return render(request, "material_add.html",
                  {'form_mat': form_mat, 'form_cat': form_cat})


def material_add(request, *args, **kwargs):
    if request.method == "POST":
        form_mat = MaterialForm(request.POST, request.FILES, owner=request.user)
        if form_mat.is_valid():
            mat = form_mat.save(commit=False)
            mat.owner = request.user
            mat.save()
            mat.category.set(request.POST.getlist('category'))
            mat.save()
            return HttpResponseRedirect(reverse_lazy('materials'))
        else:
            return HttpResponse(form_mat.errors)


def category_add(request, *args, **kwargs):
    if request.method == "POST":
        form_cat = MaterialCategoryForm(request.POST)
        if form_cat.is_valid():
            form_cat.save()
            return HttpResponseRedirect(reverse_lazy('materials'))
        else:
            return HttpResponse("Ошибка")
