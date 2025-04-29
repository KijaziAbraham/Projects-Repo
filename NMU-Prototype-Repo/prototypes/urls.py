from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PrototypeViewSet, user_profile
from .api_views import register_user, login_user
from .views import (
    UserViewSet, PrototypeViewSet,
    DepartmentViewSet, AdminUserViewSet, BulkUserImportView,UserImportTemplateView,
    change_password,
    prototype_count_view, upload_summary_30_days
)


router = DefaultRouter()
router.register(r'prototypes', PrototypeViewSet, basename="prototype")  
router.register(r'users', UserViewSet) 
router.register(r'departments', DepartmentViewSet) 
router.register('admin/users', AdminUserViewSet, basename='admin-users')


urlpatterns = [
    path('', include(router.urls)),
    path("auth/register/", register_user, name='register'),
    path("auth/login/", login_user, name='login'),
    path("user/profile/", user_profile, name="user-profile"),
    path("user/change-password/", change_password, name="change-password"),
    path("count/", prototype_count_view, name="prototype-count"),
    path("30-day-summary/", upload_summary_30_days, name='upload-summary-30-days'),
    path("admin/import-users/", BulkUserImportView.as_view(), name='bulk-user-import'),
    path("admin/download-users-template/", UserImportTemplateView.as_view(), name='user-import-template'),

]

