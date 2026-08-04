from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        # This allows automatically connecting a social account to an existing local account
        # with the same email address, preventing the "error occurred" on duplicate email.
        user = sociallogin.user
        if user.id:
            return
        if not user.email:
            return
            
        try:
            # Check if a user with this email already exists
            existing_user = User.objects.get(email=user.email)
            
            # If exists, connect the social account to this user
            sociallogin.connect(request, existing_user)
        except User.DoesNotExist:
            pass
