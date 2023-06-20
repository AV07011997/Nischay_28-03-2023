from django.contrib import admin
from django.urls import path
from . import views as upload_files_views

# import mysite.views

urlpatterns = [

    path('upload_data/<str:text>/', upload_files_views.upload_statements, name="upload_statements"),
    path('bankstatements/', upload_files_views.uploadBankStatments, name="uploadBankStatments"),
    path('delete_files/', upload_files_views.delete_file, name="delete_file"),

]
