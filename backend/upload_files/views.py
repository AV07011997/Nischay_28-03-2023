


import boto3
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
from CONSTANT import path_pdf_files_folder


from django.db import connection
from datetime import datetime


# Create your views here.
def upload_statements(request, text):
    # queryset = upload_file_details.objects.all().values("lead_id", "name").annotate(Count("lead_id")).filter(
    #     lead_id=text)
    # queryset3 = upload_file_details.objects.all().values("lead_id", "file_name", "name","status")
    # if (queryset):
    #     data = pd.DataFrame(list(queryset))
    #     data3 = pd.DataFrame(list(queryset3))
    #
    #     queryset1 = los_did_cid_generation.objects.all().filter(lead_id=text).values("lead_id", "name")
    #     data1 = pd.DataFrame(list(queryset1))

        # queryset2 = upload_file_details.objects.all().filter(lead_id=text).values("file_name", "date_of_action","status")
        # data2 = pd.DataFrame(list(queryset2))
        # data2['date'] = data2['date'].dt.strftime('%B %d, %Y')
        # data2['date'] = data2['date'].astype(str)

        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM a5_kit.mysite_upload_file_details")

            data = dictfetchall(cursor)

            data = pd.DataFrame(data)

            lead_id=int(text)



            filtered_data=data[data['lead_id']==lead_id]
            filtered_data['date_of_action'] = pd.to_datetime(filtered_data['date_of_action'])
            filtered_data['date_of_action'] = filtered_data['date_of_action'].dt.strftime('%Y-%m-%d %H:%M:%S')
            json_records = filtered_data.to_json(orient='records')
            data = json.loads(json_records)
            # data3 = data.to_dict('split')
            pydict = json.dumps([data])

            # filtered_data=data[data['lead_id']== text]

        ##trying to convert to dict and send
    #     data = data.to_dict('split')
    #     data1 = data1.to_dict('split')
    #     data2 = data2.to_dict('split')
    #     data3 = data3.to_dict('split')
    #
    #     # pydict = json.dumps([data, data1, data2,data3])
    #     pydict = json.dumps([data3, data2])
    #
    #     return HttpResponse(pydict)
    # else:
    #     data3 = pd.DataFrame(list(queryset3))
    #     data3 = data3.to_dict('split')
    #     pydict = json.dumps([data3])

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
    if str(bank_count) == 'undefined' or str(bank_count) == 'None':
        bank_count = 0
    result = ''
    result_count = ''
    if len(request.FILES) > 0:
        next_count = int(bank_count) + 1
        for item in range(len(request.FILES)):
            uploaded_file = request.FILES[str(item)]
            key = cutFile(uploaded_file)
            try:
                pdfs = r''+path_pdf_files_folder  ## pdf storage path

                # pdfs = r'C:\Users\Abhishek\Desktop\pdf_files'  ## pdf storage path
                os.makedirs(pdfs, exist_ok=True)
                file_path = os.path.join(pdfs, f'{lead_id}&{next_count}&{lead_name}&{key}')
                with open(file_path, 'wb') as f:
                    for chunk in uploaded_file.chunks():
                        f.write(chunk)
                result = 'Bank File successfully uploaded.'
                next_count += 1
                file_name = key

                # u = upload_file_details(lead_id=lead_id, name=lead_name, date=datetime.now(),
                #                         file_name=file_name, type="bank")
                # u.save()
                #
                # queryset = upload_file_details.objects.all().values("lead_id", "name").annotate(
                #     Count("lead_id")).filter(lead_id=lead_id)
                # result_count = pd.DataFrame(list(queryset))
                current_datetime = datetime.now()
                formatted_datetime = current_datetime.strftime('%m/%d/%Y %H:%M:%S')
                formatted_datetime_str = str(current_datetime)

                with connection.cursor() as cursor:
                    sql_query = "INSERT INTO a5_kit.mysite_upload_file_details (lead_id, name, date, file_name, type, status, date_of_action) VALUES (%s, %s, %s, %s, %s, %s, %s);"
                    cursor.execute(sql_query, (
                    lead_id, lead_name, formatted_datetime_str, file_name, 'bank', 'In Progress',
                    formatted_datetime_str))



            except Exception as e:
                result = e
                print(result)

        return HttpResponse("1")
    else:
        print("No files available")


def delete_file(request):
    current_datetime = datetime.now()
    formatted_datetime = current_datetime.strftime('%m/%d/%Y %H:%M:%S')
    formatted_datetime_str = str(current_datetime)
    key1 = request.POST.get('data')
    leadID=request.POST.get('leadId')
    name=request.POST.get('name')

    # Convert the JSON data into a list of dictionaries
    data_list = json.loads(key1)

    # Convert the list of dictionaries to a DataFrame
    df = pd.DataFrame(data_list)

    for fileName in df['file_name']:
        str(fileName)
        fileName = fileName[:-4]
        # Perform operations on each value
        with connection.cursor() as cursor:
            # Perform the delete operation
            query = "DELETE FROM `a5_kit`.`mysite_bank_bank` WHERE file_name LIKE %s;"
            pattern = '%'+fileName+'%'  # Replace 'substring' with your desired pattern
            cursor.execute(query, [pattern])

        with connection.cursor() as cursor:
            # Perform the update operation
            # query = "UPDATE a5_kit.mysite_upload_file_details SET status = 'Deleted' WHERE file_name LIKE %s;"
            query = "UPDATE a5_kit.mysite_upload_file_details SET status = 'Deleted' WHERE file_name LIKE %s AND (lead_id = %s AND name = %s);"

            pattern = '%' + fileName + '%'  # Replace 'substring' with your desired pattern
            # cursor.execute(query, [pattern])
            cursor.execute(query, [ pattern, leadID, name])


        with connection.cursor() as cursor:
            # Perform the update operation
            query = "UPDATE a5_kit.mysite_upload_file_details SET date_of_action = %s WHERE file_name LIKE %s AND (lead_id = %s AND name = %s);"
            pattern = '%' + fileName + '%'  # Replace 'fileName' with your desired pattern
            cursor.execute(query, [formatted_datetime_str, pattern, leadID, name])

            # connection.commit()

        with connection.cursor() as cursor:
            # Perform the delete operation
            query = "DELETE FROM `a5_kit`.`mysite_downloaded_file_details` WHERE file_name LIKE %s AND (lead_id = %s AND name = %s);"
            pattern = '%'+fileName+'%'  # Replace 'substring' with your desired pattern
            cursor.execute(query, [ pattern, leadID, name])



        print(fileName)

    # with connection.cursor() as cursor:
    #     cursor.execute(
    #         "SELECT account_number, bank_name, min(txn_date) as from_date, max(txn_date) as to_date  FROM a5_kit.mysite_bank_bank WHERE lead_id = " + str(
    #             lead_id) + " GROUP BY account_number" + ";")

    return HttpResponse("1")

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    all_data = []
    for row in cursor.fetchall():
        data_row = dict(zip(columns, row))
        all_data.append(data_row)

    return all_data