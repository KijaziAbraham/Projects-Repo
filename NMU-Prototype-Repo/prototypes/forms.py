from django import forms
from django.contrib.auth.forms import UserChangeForm
from .models import CustomUser

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        role = cleaned_data.get('role')
        level = cleaned_data.get('level')

        if role == 'student' and not level:
            self.add_error('level', 'Level is required for students.')
