from rest_framework import serializers
from .models import CustomUser, Prototype, PrototypeAttachment, Department , PrototypeComment

from django.contrib.auth.password_validation import validate_password
from .models import CustomUser
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    password = serializers.CharField(write_only=True, required=True)
    password_confirmation = serializers.CharField(write_only=True, required=True)
    department = DepartmentSerializer()

    class Meta:
        model = CustomUser
        fields = [
            "id", "email", "username", "level", "role_display",
            "level_display", "is_staff", "is_active",
            "role", "is_approved", "full_name",
            "department", "phone", "institution_id",'password', 'password_confirmation'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirmation': {'write_only': True}

        }

    def validate(self, data):
        if data['password'] != data['password_confirmation']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirmation')  # Remove confirmation field
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)


class PrototypeAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrototypeAttachment
        fields = ['report', 'source_code']
class PrototypeSerializer(serializers.ModelSerializer):
    research_group = serializers.CharField(source='get_research_group_display', read_only=True)
    attachment = PrototypeAttachmentSerializer(required=True)
    student = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='student'),
        required=False,
        error_messages={
            'does_not_exist': 'Specified user is not a student',
            'incorrect_type': 'Invalid student ID'
        }
    )
    department = DepartmentSerializer(read_only=True)
    supervisors = UserSerializer(many=True, read_only=True)
    supervisor_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.all(), write_only=True, source='supervisors'
    )
    reviewer = UserSerializer(required=False)
    # project_link = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    #research_group = serializers.CharField(choices=RESEARCH_GROUP_CHOICES, required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Prototype
        fields = [
            'id', 'student', 'title', 'abstract', 'department','supervisor_ids',
            'academic_year', 'supervisors', 'submission_date',
            'status', 'has_physical_prototype', 'barcode',
            'storage_location', 'feedback', 'reviewer', 'attachment', 'research_group','project_link',
        ]
        read_only_fields = ['id', 'submission_date', 'status', 'barcode', 'department']

    def validate(self, data):
        request = self.context.get('request')
        
        # Handle student assignment
        if 'student' not in data and request and request.user.is_authenticated:
            if request.user.role == 'student':
                data['student'] = request.user
            elif request.user.role == 'admin':
                raise serializers.ValidationError(
                    {'student': 'Student field is required for admin submissions'}
                )
        
        student = data.get('student')
        if not student:
            raise serializers.ValidationError({'student': 'Student is required'})
            
        if not hasattr(student, 'department') or not student.department:
            raise serializers.ValidationError(
                {'student': f'Student {student.username} has no department assigned'}
            )
            
        return data

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        # Convert student ID to nested representation
        if instance.student:
            representation['student'] = UserSerializer(instance.student).data
        
        # Convert supervisor IDs to nested representation
        if instance.supervisors.exists():
            representation['supervisors'] = UserSerializer(instance.supervisors.all(), many=True).data
        
        # Convert reviewer to nested representation
        if instance.reviewer:
            representation['reviewer'] = UserSerializer(instance.reviewer).data

        return representation


    def create(self, validated_data):
        attachment_data = validated_data.pop('attachment')
        student = validated_data['student']
        supervisors = validated_data.pop('supervisors', [])

        if supervisors and len(supervisors) > 5:
            raise serializers.ValidationError({"supervisors": "You can assign up to 5 supervisors only."})

        # Set department from student
        validated_data['department'] = student.department

        prototype = Prototype.objects.create(**validated_data)

        if supervisors:
            prototype.supervisors.set(supervisors)

        PrototypeAttachment.objects.create(prototype=prototype, **attachment_data)
        return prototype


    def update(self, instance, validated_data):
        """Handle updating prototype along with its attachments"""
        attachment_data = validated_data.pop('attachment', None)
        supervisors = validated_data.pop('supervisors', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if supervisors is not None:
            instance.supervisors.set(supervisors)

        if attachment_data:
            attachment, _ = PrototypeAttachment.objects.get_or_create(prototype=instance)
            for attr, value in attachment_data.items():
                setattr(attachment, attr, value)
            attachment.save()

        return instance

   
  
class PrototypeReviewSerializer(serializers.Serializer):
    """
    Serializer for prototype review submission.
    """
    feedback = serializers.CharField(required=True)
    status = serializers.ChoiceField(choices=[
        ('submitted_not_reviewed', 'Submitted (Not Reviewed)'),
        ('submitted_reviewed', 'Submitted (Reviewed)'),
    ])

    def update(self, instance, validated_data):
        # Update the prototype's status and feedback
        instance.status = validated_data.get('status', instance.status)
        instance.feedback = validated_data.get('feedback', instance.feedback)
        instance.save()
        return instance

class GeneralUserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'password', 'phone']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            phone=validated_data.get('phone', ''),
            role='general_user',
            is_approved=False,
        )
        user.set_password(validated_data['password'])
        user.save()
        return user



class PrototypeCommentSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = PrototypeComment
        fields = ['id', 'prototype', 'user', 'full_name', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']