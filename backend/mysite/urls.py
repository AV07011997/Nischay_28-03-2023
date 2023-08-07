"""mysite URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from . import views as mysite_views

# from bureau import views as bureau_views

# import mysite.views

urlpatterns = {
    path('admin/', admin.site.urls),
    # path('', mysite_views.home_page, name="mysite_home"),
    path('login/', mysite_views.login_page, name="login_page"),
    path('home/', mysite_views.home_page, name="home_page"),
    path('update_upload_list/', mysite_views.update_upload_list,
         name="update_upload_list"),
    # path('upload_files/', include('upload_files.urls')),
    path('search/searchsession/<str:text>/',
         mysite_views.searchsession, name="search_session"),

    # path('shubham/<str:text>/', mysite_views.upload_statements, name="upload_statements"),
    # path('bankstatements/', mysite_views.uploadBankStatments, name='bankstatements'),
    path('upload_file/', include('upload_files.urls')),
    path('analyze/', include('analyze.urls')),
    # path('bureau/', include('bureau.urls')),
    # Below are the urls for bureau
    path('', mysite_views.bureau_page, name="bureau"),
    path('get_bureau_data/', mysite_views.get_bureau_data, name="get_bureau_data"),
    path('update_bureau_data/', mysite_views.update_bureau_data,
         name="update_bureau_data"),
    # path('reset_bureau_data/', mysite_views.reset_bureau_data, name="reset_bureau_data"),
    path('selected_bureau_data/', mysite_views.selected_bureau_data,
         name="selected_bureau_data"),
    # path('final_selected_data/', mysite_views.some, name="final_selected_bureau_data"),
    # path('update_bureau_tenure_dpd/', mysite_views.updateBureauAccountSegmentTl,
    #      name="update_bureau_account_segment_tl_Tenure and DPD"),
    path('bureau_data_by_condition/', mysite_views.bureau_data_by_condition,
         name="bureau_data_by_condition"),

}
