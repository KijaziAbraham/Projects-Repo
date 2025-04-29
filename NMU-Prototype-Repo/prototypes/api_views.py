from django.contrib.auth import get_user_model, authenticate
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def get_tokens_for_user(user):
    """Generate JWT access and refresh tokens for a user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new general user with approval pending."""
    email = request.data.get("email")
    password = request.data.get("password")
    full_name = request.data.get("full_name")
    phone = request.data.get("phone")

    if not all([email, password, full_name, phone]):
        return Response({"error": "All fields (email, password, full_name, phone) are required."},
                        status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"error": "User with this email already exists."},
                        status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        full_name=full_name,
        phone=phone,
        role='general_user',
        is_approved=False  # Approval pending
    )

    return Response({
        "message": "Account created. Please wait for admin approval before logging in."
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Login user. General users must be approved (is_approved=True).
    """
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=email, password=password)

    if user is None:
        return Response({"error": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)

    # Check is_active and is_approved
    if not user.is_active or not getattr(user, "is_approved", True):
        return Response({"error": "Account not yet approved by admin."}, status=status.HTTP_403_FORBIDDEN)

    tokens = get_tokens_for_user(user)
    return Response({"message": "Login successful", "tokens": tokens, "email": user.email,"role": user.role,}, status=status.HTTP_200_OK)
