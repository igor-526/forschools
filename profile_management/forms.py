from django.contrib.auth.forms import UserCreationForm
from .models import NewUser


class SignUpForm(UserCreationForm):
    def __init__(self, *args, **kwargs):
        super(SignUpForm, self).__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'reg_input'

    class Meta:
        model = NewUser
        fields = ('username', 'password1', 'password2', 'first_name', 'last_name')
