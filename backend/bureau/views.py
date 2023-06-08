from django.http import JsonResponse
from Tools.scripts.patchcheck import status
from django.shortcuts import render
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
from django.db import connection




# Create your views here.
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


def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    all_data = []
    for row in cursor.fetchall():
        data_row = dict(zip(columns, row))
        all_data.append(data_row)

    return all_data




def get_bureau_data():
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT *  FROM `a5_kit`.`mysite_bureau_table_data`")
        data = dictfetchall(cursor)
        data = pd.DataFrame(data)
    data3 = pd.DataFrame(list([data]))
    data3 = data3.to_dict('split')
    pydict = json.dumps([data3])
    return HttpResponse(pydict)



    # print("Getting bureau data.")
    # if "deal_id" not in request.session or "customer_id" not in request.session:
    #     status["type"] = "deal"
    #     status["message"] = "Please select a deal first!"
    #     return JsonResponse({"status": "failed"})
    #
    # else:
    #     customer_id = request.session["customer_id"]
    #     deal_id = request.session["deal_id"]
    #     queryset = bureau.objects.all().filter(customer_id=customer_id)
    #     data = pd.DataFrame(list(queryset))
    #     for x in data:
    #         x['Overdue_amount'] = x['Overdue amount']
    #
    #         if (x['DPD'] == None):
    #             x['DPD'] = 0
    #
    #     return JsonResponse(data, safe=False)
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
