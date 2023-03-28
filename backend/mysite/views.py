# import statements here
import json
import numpy as np
from datetime import timedelta, datetime
import CONSTANT
import os
from itertools import count
from logging import exception

# import boto3
from django.db.models import Sum
from pip._internal.utils.filesystem import find_files

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")

import django

django.setup()

from django.core.management import call_command

from django.http import HttpResponse, JsonResponse, Http404
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from .decorators import unauthenticated_users
from django.db.models import Q, Count
# from pan.models import Pan
# from aadhaar.models import Aadhaar
# from itrv.models import Itrv
# from form16.models import Info
# from form26as.models import AsseseeDetails
# from bank.models import Bank, Bank_master
# from salary.models import Salary
# from datetime import datetime, timedelta
# from .models import Los_details, Customer_details, Customer_address, Processed_document_details, Unprocessed_document_details, Document_type_master, District_master, State_master
# from common.scripts import normalize_date
# from .models import Uploaded_itrv_form16_form26as_details, Uploaded_bank_statements_details
# import numpy as np
# import mysql.connector
import pandas as pd
# from django.db import connection
# from python_codes import constants
from .models import *

from django.contrib import messages

from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from utilities.CheckLogin.checklogin import CheckLogin


## List Of APIs


# @unauthenticated_users
def login_page(request):
    print("Hello")
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

    pydict = {"login_page": False}
    if (CheckLogin(request, username, password)):
        pydict = {"login_page": True}

    return HttpResponse(json.dumps(pydict))


# @unauthenticated_users
# def login_page(request):
#     # print(request.POST)
#     if request.method == "POST":
#         uname = request.POST.get("username")
#         upwd = request.POST.get("password")
#
#         user = authenticate(request, username=uname, password=upwd)
#
#         if user is not None:
#             login(request, user)
#             # return redirect("search")
#             return HttpResponse(json.dumps({"login_page": True}))
#
#     pydict = json.dumps({"login_page": False})
#     return HttpResponse(pydict)


def home_page(request):
    # import boto3
    print("Okay")
    # bucket = 'digitizedfiles'
    # s3 = boto3.resource('s3')
    # objects_files = s3.Bucket(bucket).objects.all()
    # print(objects_files)
    global customer_detail
    global cust

    # def status_all():
    #
    #     digitized_file_status.objects.all().delete()
    #
    #     for obj in objects_files:
    #         file_name = obj.key
    #         lid = obj.key.split('_')[0]
    #         if obj.key.split('_')[-1] == 'b.csv':
    #             file_type = 'bank'
    #         if obj.key.split('_')[-1] == 'i.csv':
    #             file_type = 'itr'
    #
    #         if obj.key.split('_')[-1] != 'i.csv' and obj.key.split('_')[-1] != 'b.csv':
    #             file_type = 'others'
    #
    #         p = digitized_file_status(lead_id=lid, file_name=file_name, type=file_type)
    #         p.save()

    # status_all()

    text = request.GET.get("search")
    request.session["stext"] = text

    try:
        queryset = upload_file_details.objects.all().values("lead_id")
        bank_lead = pd.DataFrame(list(queryset))
    except:
        pass

    try:
        queryset = downloaded_file_details.objects.all().values("lead_id")
        bank_download = pd.DataFrame(list(queryset))
    except:
        pass
    try:
        queryset = los_did_cid_generation.object.all().values("lead_id", "customer_id").order_by()
        get_cust_id = pd.DataFrame(list(queryset))
    except Exception as e:
        print("The Main Error is ")
        print(e)
        pass

    try:
        queryset = los_did_cid_generation.objects.all().values("lead_id", "deal_id", "customer_id")
        customer_detail = pd.DataFrame(list(queryset))
    except:
        pass

    try:
        queryset = los_did_cid_generation.objects.all().values("lead_id", "creation_time").order_by()
        creation_time = pd.DataFrame(list(queryset))
    except:
        pass

    try:
        queryset = digitized_file_status.objects.all().values("lead_id").order_by()
        bank_download_ready = pd.DataFrame(list(queryset))
    except:
        pass

    try:
        queryset = los_did_cid_generation.objects.all().values("lead_id", "name", "customer_id",
                                                               "creation_time").order_by()
        bureau_updated = pd.DataFrame(list(queryset))
        bureau_updated.rename(columns={'creation_time': 'bureau_creation_time'}, inplace=True)

    except:
        pass
#add try and catch !!!!
    try:
        queryset = bureau.objects.all().values("Customer_Id")
        bureau_updated_data = pd.DataFrame(list(queryset))
    except:
        pass

    ## now making ammendments in dataframes
    try:

        bank_lead['lead_id'] = bank_lead['lead_id'].astype(str)
        customer_detail = customer_detail.merge(bank_lead, on="lead_id", how="left")  ## no need of this line
        cust = pd.DataFrame(customer_detail.groupby('lead_id').size().reset_index(name="bank_uploaded"))
        customer_detail = customer_detail.merge(cust, on="lead_id", how="left")

        if (bank_download_ready.empty == False):
            customer_detail = customer_detail.merge(bank_download_ready, on="lead_id", how="left")

        customer_detail = customer_detail.drop_duplicates().reset_index()
        customer_detail = customer_detail.drop(['index'], axis=1)

        # customer_detail = customer_detail.groupby(lead_id)
        # customer_detail['bank_uploaded']=customer_detail.count()['lead_id']
        # customer_detail['bank_uploaded']=customer_detail.count('lead_id')
        # cust = customer_detail["lead_id"].groupby('lead_id').value_counts("lead_id")

        ## group by customer_detail and get sum of leadid

    except Exception as e:
        print("1")
        print(e)
    try:
        bank_download = bank_download.groupby('lead_id').size().reset_index(name="bank_download")
        customer_detail = customer_detail.merge(bank_download, on="lead_id", how="left")

        print(customer_detail.info())

        customer_detail["bank_download"] = customer_detail["bank_download"].fillna(0).astype(np.int64)
        customer_detail["bank_download"] = customer_detail["bank_download"].astype(np.int64)

        # customer_detail = customer_detail.groupby('lead_id').size().reset_index(name="bank_download")

        print(customer_detail.info())
        print(customer_detail)

        # customer_detail = customer_detail.astype({bank_download: int})

    except Exception as e:
        print("2")
        print(e)
    # print(customer_detail)

    try:
        customer_detail = customer_detail.merge(creation_time, on="lead_id", how="left")
    except Exception as e:
        print("3")
        print(e)
    try:
        bureau_updated = bureau_updated.sort_values('lead_id', ascending=False)
    except Exception as e:
        print("4")
        print(e)

    try:
        customer_detail = customer_detail.merge(get_cust_id, on="lead_id", how="left")
    except Exception as e:
        print("new vaale me dikkat hai")
        print(e)

    try:
        customer_detail = customer_detail.merge(bureau_updated, on=['customer_id', 'lead_id'], how='left')
    except Exception as e:
        print("5")
        print(e)
    try:
        customer_detail['bureau_updated'] = customer_detail['bureau_updated'].fillna('No')
    except Exception as e:
        print("6")
        print(e)
    try:
        customer_detail = customer_detail.fillna(0)
    except Exception as e:
        print("7")
        print(e)

    try:
        customer_detail['bank_uploaded'] = customer_detail['bank_uploaded'].astype('int64')
    except Exception as e:
        print("8")
        print(e)

    try:
        customer_detail['bank_download'] = customer_detail['bank_download'].astype('int64')
    except Exception as e:
        print("9")
        print(e)

    try:
        customer_detail['bank_download_ready'] = customer_detail['bank_download_ready'].astype('int64')
    except:
        pass

    customer_detail = customer_detail.drop_duplicates().reset_index(drop=True)

    customer_detail = customer_detail.sort_values('lead_id')

    if 'bank_download_ready' not in customer_detail:
        customer_detail['bank_download_ready'] = 0

    ##below lambda and loop statements need some bug fixing
    customer_detail['bank_download_ready'] = customer_detail['bank_download_ready'].apply(
        lambda x: int(x) if pd.notnull(x) else 0)
    customer_detail['bank_uploaded'] = customer_detail['bank_uploaded'].apply(lambda x: int(x) if pd.notnull(x) else 0)
    customer_detail['bank_download'] = customer_detail['bank_download'].apply(lambda x: int(x) if pd.notnull(x) else 0)

    customer_detail = customer_detail.sort_values(['creation_time'], ascending=[False])
    customer_detail['creation_time'] = customer_detail['creation_time'].dt.strftime('%B %d, %Y, %r')
    customer_detail['bureau_creation_time'] = customer_detail['bureau_creation_time'].dt.strftime('%B %d, %Y, %r')

    customer_detail['bureau_updated'] = ''
    i = 0
    for x in bureau_updated_data['Customer_Id']:
        for i in range(len(customer_detail)):
            if x == customer_detail['customer_id'][i]:
                customer_detail['bureau_updated'][i] = "Yes"

    ## did this to pass some dummy data as of now
    # customer_detail['bureau_updated'] = "Yes"
    # customer_detail['bank_download'] = "1"
    # customer_detail['bank_download_ready'] = "0"

    #######Adding to get correct time#######
    # customer_detail['creation_time'] = customer_detail['creation_time'] + timedelta(hours=5, minutes=30)

    customer_detail = customer_detail.T.drop_duplicates().T
    json_records = customer_detail.to_json(orient='records')
    customer_detail = json.loads(json_records)

    pydict = json.dumps({'customer_detail': customer_detail})
    print(pydict)
    return HttpResponse(pydict)


@unauthenticated_users
def searchsession(request, text):
    request.session['lead_session'] = text
    print(request.session)
    # try:
    #     del request.session['customer_id']
    #     del request.session['deal_id']
    #     del request.session['name']
    #
    # except:
    #     pass
    pydict = json.dumps({"result": text})
    return HttpResponse(pydict)


# @login_required
def upload_statements(request, text):
    queryset = upload_file_details.objects.all().values("lead_id", "name").annotate(Count("lead_id")).filter(
        lead_id=text)

    data = pd.DataFrame(list(queryset))

    queryset1 = los_did_cid_generation.objects.all().filter(lead_id=text).values("lead_id", "name")
    data1 = pd.DataFrame(list(queryset1))

    queryset2 = upload_file_details.objects.all().filter(lead_id=text).values("file_name", "date")
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
                pdfs = r'C:\Users\shubhamraj\Downloads\temp' ## pdf storage path
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

##Below are the APIs for download page
def update_cust_id_if_c_gr_0(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest' and request.method == "POST":
        lead_id = request.POST.get('id')
        print(lead_id)

        queryset = los_did_cid_generation.objects.all().values("lead_id", "name", "customer_id").filter(lead_id=lead_id)
        cust_details = pd.DataFrame(list(queryset))

        queryset = bank_bank.objects.all().values("customer_id", "bank_name", "account_name", "account_number").filter(
            deal_id=lead_id).group_by("account_number")

        bank_updated_result = pd.DataFrame(queryset)
        bank_updated_result.rename(
            columns={'bank_name': 'sub_type', 'account_name': 'name', 'account_number': 'identifier'}, inplace=True)
        #
        # queryset = form16_challans.objects.all().values("customer_id", "pan_of_the_employee").filter(
        #     lid=lead_id).group_by("pan_of_the_employee")
        # form16_challans_updated_result = pd.DataFrame(queryset)
        # form16_challans_updated_result.rename(columns={'pan_of_the_employee': 'identifier'})

        list1 = []
        if len(bank_updated_result) > 0:
            for obj in bank_updated_result:
                obj["doc_type"] = "BANK"
                list1.append(obj)

        return_data = list1

    return JsonResponse({"afterdownload": return_data, "cust_details": cust_details})


def download_files_by_lead(request):
    print("Hello1")
    if request.headers.get('x-requested-with') == 'XMLHttpRequest' and request.method == "POST":
        print("Hello2")
        lead_id = request.POST.get('id')
        bucket = 'digitizedfiles'
        s3 = boto3.resource('s3')
        objects_bank = s3.Bucket(bucket).objects.filter(Prefix=lead_id)
        result = ''
        for obj in objects_bank:
            try:
                file_name = obj.key
                s3.Bucket(bucket).download_file(obj.key, CONSTANT.OUTPUT_PATH.format(obj.key))
                s3.Object(bucket, obj.key).delete()
                result = 'Successfuly download files!'
                d = downloaded_file_details(lead_id=lead_id, file_name=file_name, date=datetime.now())
                d.save()

            except Exception as e:
                result = e
        queryset = downloaded_file_details.objects.all().values("lead_id").annotate(Count("lead_id")).filter(
            lead_id=lead_id)
        result_count = pd.DataFrame(list(queryset))

        # return_data = addindatabasefromcsv(request)  this is mainly for itr so can be ignore

        queryset = los_did_cid_generation.objects.all().values("lead_id", "name", "customer_id").filter(lead_id=lead_id)
        cust_details = pd.DataFrame(list(queryset))

    return JsonResponse(
        {"result": result, "count": result_count, "cust_details": cust_details})


def customer_session(request, text, text1):
    request.session["customer_id"] = text
    request.session["deal_id"] = text1
    name = ""

    queryset = customer_allocation.objects.all().values("cid", "name").distinct().filter(cid=text)
    name = pd.DataFrame(list(name))

    request.session["name"] = name[0]['name']
    return JsonResponse({"result": text})


def update_after_download(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest' and request.method == "POST":
        lid = request.POST.get('lid')
        cid = request.POST.get('cid')
        identifier = request.POST.get('identifier')
        sub_type = request.POST.get('sub_type')
        print(sub_type)
        result = ''
        print(lid, cid, identifier, sub_type)
        identifier = identifier.replace("'", '')

        obj = bank_bank.object.get(deal_id=lid, account_number=identifier)
        obj.customer_id = cid
        obj.save

        queryset = los_did_cid_generation.objects.all().values("deal_id", "name").distinct().filter(customer_id=cid)
        data1 = pd.DataFrame(list(queryset))
        name1 = data1[0]['name']

        data_allocation_table = "";

        queryset = customer_allocation.objects.all().values("deal_id", "name").distinct().filter(identifier=identifier,
                                                                                                 lid=lid)
        data_allocation_table = pd.DataFrame(list(queryset))

        if len(data_allocation_table) > 0:
            print("XXXX")
            obj = customer_allocation.object.get(lid=lid, identifier=identifier)
            obj.cid = cid
            obj.name = name1
            obj.save
        else:
            ca = customer_allocation()

            ca.lid = lid
            ca.did = data1[0]['deal_id']
            ca.cid = cid
            ca.name = data1[0]['name']
            ca.identifier = identifier

            ca.save()

    return JsonResponse({"result": result, "cid": cid, "identifier": identifier, "sub_type": sub_type})


## Below are the APIs for bureau


def bureau_page(request):
    status = {}
    if "deal_id" not in request.session or "customer_id" not in request.session:
        status["type"] = "deal"
        status["message"] = "Please select a deal first!"
    else:
        customer_id = request.session["customer_id"]
        deal_id = request.session["deal_id"]

    payload = {"bureau_page": True, "status": status if status else None}
    return render(request, "bureau.html", payload)


def bureau_data_by_condition(request):
    # customer_id = request.session["customer_id"]
    # deal_id=request.session["deal_id"]
    option = request.POST['select']
    index = request.POST['index']
    data = ''
    selected = ''

    queryset = bureau.objects.all().filter(index=index)
    data = pd.DataFrame(list(queryset))

    ### updating valuetype in the bureau table
    obj = bureau.object.get(index=index)
    obj.valuetype = option
    obj.save

    selected = option  ## won't this line will replace the lines below?
    # if option == 'bureau':
    #     selected = 'bureau'
    # if option == 'edited':
    #     selected = 'edited'
    # if option == 'recommended':
    #     selected = 'recommended'

    status = {}
    status["type"] = "success"
    status["message"] = "Data reset successful"
    return JsonResponse({"bureau_page": True, "status": status, "data": data, "selected": selected})


@login_required
def selected_bureau_data(request):
    selected_data = (json.loads(request.body)).get('selected')
    unselected_data = (json.loads(request.body)).get('unselected')
    loan = {"01": "Auto Loan (Personal)",
            "02": "Housing Loan",
            "03": "Property Loan",
            "04": "Loan Against Shares/Securities",
            "05": "Personal Loan",
            "06": "Consumer Loan",
            "07": "Gold Loan",
            "08": "Education Loan",
            "09": "Loan to Professional",
            "10": "Credit Card",
            "11": "Leasing",
            "12": "Overdraft",
            "13": "Two-wheeler Loan",
            "14": "Non-Funded Credit Facility",
            "15": "Loan Against Bank Deposits",
            "16": "Fleet Card",
            "17": "Commercial Vehicle Loan",
            "18": "Telco – Wireless",
            "19": "Telco – Broadband",
            "20": "Telco – Landline",
            "31": "Secured Credit Card",
            "32": "Used Car Loan",
            "33": "Construction Equipment Loan",
            "34": "Tractor Loan",
            "35": "Corporate Credit Card",
            "36": "Kisan Credit Card",
            "37": "Loan on Credit Card",
            "38": "Prime Minister Jaan Dhan Yojana - Overdraft",
            "39": "Mudra Loans - Shishu/Kishor/Tarun",
            "40": "Microfinance – Business Loan",
            "41": "Microfinance – Personal Loan",
            "42": "Microfinance – Housing Loan",
            "43": "Microfinance – Other",
            "44": "Pradhan Mantri Awas Yojana - Credit Linked Subsidy Scheme MAYCLSS",
            "45": "Other",
            "51": "Business Loan – General",
            "52": "Business Loan – Priority Sector – Small Business",
            "53": "Business Loan – Priority Sector – Agriculture",
            "54": "Business Loan – Priority Sector – Others",
            "55": "Business Non-Funded Credit Facility – General",
            "56": "Business Non-Funded Credit Facility – Priority Sector – Small Business",
            "57": "Business Non-Funded Credit Facility – Priority Sector – Agriculture",
            "58": "Business Non-Funded Credit Facility – Priority Sector - Others",
            "59": "Business Loan Against Bank Deposits",
            "61": "Business Loan - Unsecured",
            "00": "Other"
            }

    if unselected_data:
        DATE_CLOSED = ''
        for i in unselected_data:

            cid = request.session["customer_id"]
            loan_type = i.get('loan_type')
            loan_status = i.get('loan_status')
            DATE_CLOSED = loan_status
            disbursal_date = i.get('disbursal_date')
            disbursal_amount = i.get('disbursal_amount').replace(',', '').replace('₹', '')

            source = i.get('source')

            obj = bureau.object.get(Customer_Id=cid, Loan_type=loan_type, Loan_status=loan_status,
                                    Disbursal_date=disbursal_date, Disbursed_amount=disbursal_amount, Source=source)
            obj.final_selected = 0
            obj.save()

            try:
                account_type = (list(loan.keys())[list(loan.values()).index(loan_type)])
            except Exception as e:
                account_type = '00'
            if loan_status == 'Active':
                DATE_CLOSED = ''
                obj = bureau_account_segment_tl.object.get(CUSTOMER_ID=cid, DATE_AC_DISBURSED=disbursal_date,
                                                           HIGH_CREDIT_AMOUNT=disbursal_amount, source=source,
                                                           ACCOUNT_TYPE=account_type, DATE_CLOSED=None or '')
                obj.final_selected = 0
                obj.save()

            else:
                obj = bureau_account_segment_tl.object.get(CUSTOMER_ID=cid,  ##DATE_CLOSED is not '',
                                                           DATE_AC_DISBURSED=disbursal_date,
                                                           HIGH_CREDIT_AMOUNT=disbursal_amount, source=source,
                                                           ACCOUNT_TYPE=account_type)
                obj.final_selected = 0
                obj.save()

    if selected_data:
        DATE_CLOSED = ''
        for j in selected_data:

            cid = request.session["customer_id"]
            loan_type = j.get('loan_type')
            loan_status = j.get('loan_status')
            disbursal_date = j.get('disbursal_date')
            disbursal_amount = j.get('disbursal_amount').replace(',', '').replace('₹', '')
            source = j.get('source')

            obj = bureau.object.get(Customer_Id=cid, Loan_type=loan_type, Loan_status=loan_status,
                                    Disbursal_date=disbursal_date, Disbursed_amount=disbursal_amount, Source=source)
            obj.final_selected = 1
            obj.save()

            try:
                account_type = (list(loan.keys())[list(loan.values()).index(loan_type)])
            except Exception as e:
                account_type = '00'
            if loan_status == 'Active':
                DATE_CLOSED = ''
                obj = bureau_account_segment_tl.object.get(CUSTOMER_ID=cid, DATE_AC_DISBURSED=disbursal_date,
                                                           HIGH_CREDIT_AMOUNT=disbursal_amount, source=source,
                                                           ACCOUNT_TYPE=account_type,
                                                           DATE_CLOSED=None)  # other condition will add later
                obj.final_selected = 1
                obj.save()
            else:

                obj = bureau_account_segment_tl.object.get(CUSTOMER_ID=cid,  # DATE_CLOSED != '',
                                                           DATE_AC_DISBURSED=disbursal_date,
                                                           HIGH_CREDIT_AMOUNT=disbursal_amount, source=source,
                                                           ACCOUNT_TYPE=account_type)
                obj.final_selected = 1
                obj.save()

    result = 'Done!'
    return JsonResponse({'result': result})


# @login_required
def get_bureau_data(request):
    # print("Getting bureau data.")
    if "deal_id" not in request.session or "customer_id" not in request.session:
        # status["type"] = "deal"
        # status["message"] = "Please select a deal first!"
        return JsonResponse({"status": "failed"})

    else:
        customer_id = request.session["customer_id"]
        deal_id = request.session["deal_id"]
        queryset = bureau.objects.all().filter(customer_id=customer_id)
        data = pd.DataFrame(list(queryset))
        for x in data:
            x['Overdue_amount'] = x['Overdue amount']

            if (x['DPD'] == None):
                x['DPD'] = 0

        return HttpResponse(json.dumps(data), safe=False)
        # return JsonResponse(data)


@login_required
def update_bureau_data(request):
    datatemp = json.loads(request.POST['data'])
    selectedoptionsinarow = datatemp.pop('data')

    data = datatemp
    customer_id = request.session["customer_id"]
    deal_id = request.session["deal_id"]

    for x in selectedoptionsinarow:
        index = x['index'] + 1
        selectedoption = x['selectedoption']
        # with connection.cursor() as cursor:
        #     cursor.execute(f"UPDATE bureau SET valuetype = '{selectedoption}' WHERE `index` = '{index}';")
        obj = bureau.object.get(index=index)
        obj.valuetype = selectedoption
        obj.save()

        for row_index in data:
            row_data = data[row_index]
            for column in row_data:
                # print("row data: ", row_data[column])
                if type(row_data[column]) == str:
                    # print("data type string.")
                    # sql_query_1 = "update bureau set " + column + "_edited = '" + row_data[
                    #     column] + "' where `index` = " + row_index + ";"
                    string = column + "_edited"
                    obj = bureau.object.get(index=row_index)
                    obj[string] = row_data[column]
                    obj.save()
                    obj = bureau.object.get

                elif type(row_data[column]) == int:
                    # print("data type integer.")
                    # sql_query_1 = "update bureau set " + column + "_edited = '" + str(
                    #     row_data[column]) + "' where `index` = " + row_index + ";"

                    string = column + "_edited"
                    obj = bureau.object.get(index=row_index)
                    obj[string] = str(row_data[column])
                    obj.save()

                if row_data[column] == '0' or row_data[column] == '' or row_data[column] == ' ' or row_data[
                    column] == None:
                    # sql_query_2 = "update bureau set " + column + "_user_edited = 1 where `index` = " + row_index + ";"
                    string = column + "_user_edited"
                    obj = bureau.object.get(index=row_index)
                    obj[string] = str(row_data[column])
                    obj.save()

                # print(sql_query_2)

    status = {}
    status["type"] = "success"
    status["message"] = "Data has been updated successfully."
    return HttpResponse(json.dumps({"bureau_page": True, "status": status}))
