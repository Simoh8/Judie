from django.contrib.auth.management.commands.createsuperuser import Command as BaseCommand
from django.core.exceptions import ValidationError

class Command(BaseCommand):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.UserModel.username_field = 'email'
    
    def get_user_model(self):
        from django.contrib.auth import get_user_model
        return get_user_model()
