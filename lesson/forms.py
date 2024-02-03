from .models import Lesson
from django import forms


class LessonForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'lesson_field'

    class Meta:
        model = Lesson
        fields = ('name',
                  'start',
                  'end',
                  'teacher',
                  'listener',
                  'materials',
                  'homework',
                  'zoom_url',
                  )
