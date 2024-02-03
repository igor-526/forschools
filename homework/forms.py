from .models import Homework
from django import forms


class HomeworkForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'hw_field'

    class Meta:
        model = Homework
        fields = ('name',
                  'teacher',
                  'listener',
                  'materials',
                  'files',
                  'description',
                  'deadline'
                  )
