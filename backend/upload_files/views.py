# import boto3
import datetime
from django.db.models import Sum, Count
import pandas as pd
# import schedule
from django.shortcuts import HttpResponse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from mysite.models import *
import json
import os


# Create your views here.
def upload_statements(request, text):
    queryset = upload_file_details.objects.all().values("lead_id", "name").annotate(Count("lead_id")).filter(
        lead_id=text)

    data = pd.DataFrame(list(queryset))

    queryset1 = los_did_cid_generation.objects.all().filter(lead_id=text).values("lead_id", "name")
    data1 = pd.DataFrame(list(queryset1))

    queryset2 = upload_file_details.objects.all().filter(lead_id=text).values("file_name", "date")
    print("queryset2 is BELOW")
    print(queryset2)
    data2 = pd.DataFrame(list(queryset2))
    data2['date'] = data2['date'].dt.strftime('%B %d, %Y')
    data2['date'] = data2['date'].astype(str)

    ##trying to convert to dict and send
    data = data.to_dict('split')
    data1 = data1.to_dict('split')
    data2 = data2.to_dict('split')

    pydict = json.dumps([data, data1, data2])
    return HttpResponse(pydict)


def cutFile(f):
    file_name = str(f.name)
    try:
        print('hello1')
        with open(file_name, 'wb') as destination:
            for chunk in f.chunks():
                destination.write(chunk)
        destination.close()
    except Exception as e:
        print(e);
        if e:
            file_name = e

    return file_name


# def uploadBankStatments(request):
#     lead_id = request.POST.get('lead_id')
#     lead_name = request.POST.get('name')
#     bank_count = request.POST.get('lead_id__count')
#     l = len(request.FILES)
#     print("The value of lead_id is :-")
#     print(lead_id)
#     if str(bank_count) == 'null' or str(bank_count) == 'None':
#         bank_count = 0
#     result = ''
#     result_count = ''
#     if (len(request.FILES) > 0):
#         uploaded_file = ''
#         next_count = int(bank_count) + 1
#         for item in range(len(request.FILES)):
#             uploaded_file = request.FILES[str(item)]
#             print(uploaded_file)
#             print('uploaded_file=', uploaded_file)
#             key = cutFile(uploaded_file)
#             print('key =', key)
#             try:
#                 s3_client = boto3.client('s3')
#                 bucket = 'a3bank'
#                 key = cutFile(uploaded_file)
#
#                 # if (key != None and bucket != None and lead_id != None):
#                 s3_client.upload_file(key, bucket, lead_id + '_' + str(next_count) + '_' + key)
#                 result = 'Bank File successfully uploaded.'
#                 next_count += 1
#                 file_name = key
#
#                 u = upload_file_details(lead_id=lead_id, name=lead_name, date=datetime.now(),
#                                         file_name=file_name, type="bank")
#                 u.save()
#
#                 queryset = upload_file_details.objects.all().values("lead_id", "name").annotate(
#                     Count("lead_id")).filter(lead_id=lead_id)
#                 result_count = pd.DataFrame(list(queryset))
#
#             except Exception as e:
#                 result = e
#                 print(result)
#
#         # result_count = result_count.to_dict("split")
#         # pydict = json.dumps([result_count])
#         # return JsonResponse({"result": result, "count": result_count}) ## why sending result
#         return HttpResponse("1")
#     else:
#         print("No files available")

def uploadBankStatments(request):
    lead_id = request.POST.get('lead_id')
    lead_name = request.POST.get('name')
    bank_count = request.POST.get('lead_id__count')
    if str(bank_count) == 'null' or str(bank_count) == 'None':
        bank_count = 0
    result = ''
    result_count = ''
    if len(request.FILES) > 0:
        next_count = int(bank_count) + 1
        for item in range(len(request.FILES)):
            uploaded_file = request.FILES[str(item)]
            key = cutFile(uploaded_file)
            try:
                pdfs = r'C:\Users\Shubham\Desktop\pdf_files' ## pdf storage path
                os.makedirs(pdfs, exist_ok=True)
                file_path = os.path.join(pdfs, f'{lead_id}_{next_count}_{key}')
                with open(file_path, 'wb') as f:
                    for chunk in uploaded_file.chunks():
                        f.write(chunk)
                result = 'Bank File successfully uploaded.'
                next_count += 1
                file_name = key

                u = upload_file_details(lead_id=lead_id, name=lead_name, date=datetime.now(),
                                        file_name=file_name, type="bank")
                u.save()

                queryset = upload_file_details.objects.all().values("lead_id", "name").annotate(
                    Count("lead_id")).filter(lead_id=lead_id)
                result_count = pd.DataFrame(list(queryset))

            except Exception as e:
                result = e
                print(result)

        return HttpResponse("1")
    else:
        print("No files available")