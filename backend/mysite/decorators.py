from django.shortcuts import redirect
from django.http import HttpResponse


def unauthenticated_users(view_func):

	def wrapper_func(request, *args, **kwargs):
		if request.user.is_authenticated:
			return redirect("/")
		else:
			return view_func(request, *args, **kwargs)

	return wrapper_func
