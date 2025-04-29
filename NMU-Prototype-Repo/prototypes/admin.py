from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .forms import CustomUserChangeForm
from .models import (
    CustomUser, Prototype, 
    PrototypeAttachment, Department,
)

class CustomUserAdmin(UserAdmin):
    form = CustomUserChangeForm
    list_display = ('email', 'username','full_name', 'role', 'level', 'department', 'is_active', 'is_approved')
    list_filter = ('role', 'department', 'level','is_approved')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('username','full_name', 'institution_id', 'phone')}),
        ('Permissions', {
            'fields': ('role', 'department','is_approved','level', 'is_active', 'is_staff', 'is_superuser'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'role', 'level', 'full_name', 'phone', 'institution_id', 'department'),
        }),
    )
    search_fields = ('email', 'username')
    ordering = ('email',)
    actions = ['approve_selected_users']

    def approve_selected_users(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(request, "Selected users have been approved.")
    approve_selected_users.short_description = "Approve selected general users"



class PrototypeAttachmentInline(admin.TabularInline):
    model = PrototypeAttachment
    extra = 0

class PrototypeAdmin(admin.ModelAdmin):
    list_display = ['title', 'barcode', 'submission_date', 'has_physical_prototype']
    inlines = [PrototypeAttachmentInline]



class PrototypeAdmin(admin.ModelAdmin):
    list_display = ('title', 'student', 'status', 'department', 'submission_date')
    list_filter = ('status', 'department', 'academic_year')
    search_fields = ('title', 'student__email', 'barcode')
    raw_id_fields = ('student', 'reviewer')
    readonly_fields = ('submission_date', 'last_modified')
    inlines = [PrototypeAttachmentInline]

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Prototype, PrototypeAdmin)
admin.site.register(PrototypeAttachment)
admin.site.register(Department)
