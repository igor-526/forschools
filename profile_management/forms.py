from django.contrib.auth.forms import UserCreationForm
from .models import NewUser


class SignUpForm(UserCreationForm):

    class Meta:
        model = NewUser
        fields = ('username', 'password1', 'password2', 'first_name',
                  'last_name', 'email', 'patronymic')
