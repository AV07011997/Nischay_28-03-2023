from pandas import DataFrame
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse, Http404
from django.db import connection
from decimal import Decimal
from datetime import date
import json
import decimal
from django.core.serializers.json import DjangoJSONEncoder
# from bank.models import Bank, Bank_master
from .bank_customer_monthly_kpi.bcmk import KPIs
import pandas as pd
from django.views.decorators.csrf import csrf_protect
from .bank_customer_kpi.a3_bank_kpi import bck
from .bank_customer_monthly_kpi.bcmk_kpi_charts import bcmk_charts
from babel.numbers import format_currency
import os
from django.conf import settings
import datetime as dt
from .bank_entity_kpi.bank_entity_kpi import bek
from .bureau_customer_kpi.bureau_kpi_code import bureau_cust_kpi
from .bureau_customer_monthly_kpi.bureau_customer_month_kpi import bureau_c_m_k
# from .itrbank.itr_display_1 import itr_display5
from .itrbank.itr_table_3_4_5 import itr_display345
from .itrbank.itr_table_2 import itr2
from .itrbank.itr_table_1 import itr_display1
import numpy as np
from django.views.generic import TemplateView
from datetime import datetime
import plotly
# import pandas as pd
import plotly.figure_factory as ff
import plotly.graph_objs as go
from django.db.models import Min, Max
import chart_studio
import chart_studio.plotly as py
import chart_studio.tools as tls
from mysite.models import bank_bank
from django.core import serializers
from CONSTANT import path_digitized_folder, path_pdf_files_folder, path_static_files


def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    all_data = []
    for row in cursor.fetchall():
        data_row = dict(zip(columns, row))
        all_data.append(data_row)

    return all_data


@login_required
def analyze_page(request):
    status = {}
    if "deal_id" not in request.session or "customer_id" not in request.session:
        status["type"] = "deal"
        status["message"] = "Please select a deal first!"
    else:
        customer_id = request.session["customer_id"]
        deal_id = request.session["deal_id"]

    payload = {"analyze_page": True, "status": status if status else None}
    return render(request, "summary.html", payload)


@login_required
def loan_kpi(request):
    status = {}

    if "deal_id" not in request.session or "customer_id" not in request.session:
        status["type"] = "deal"
        status["message"] = "Please select a deal first!"
    else:
        customer_id = request.session["customer_id"]
        deal_id = request.session["deal_id"]

    payload = {"loan_kpi": True, "status": status if status else None}
    return render(request, "kpi_loan.html", payload)


def bank_customer_month_kpi(request):
    try:
        path = os.path.join(path_static_files, 'bcmk_fig.png')
        os.remove(path)
    except:
        pass

    try:
        path = os.path.join(path_static_files, 'bcmk_fig_1.png')

        os.remove(path)
    except:
        pass
    # try:
    #     os.remove(settings.STATICFILES_DIRS[0] + '/assets/images/saved_figure_2.png')
    # except:
    #     pass

    status = {}
    n2 = ''
    p1 = ''
    # print("Getting analyze data.")
    # if "deal_id" not in request.session or "customer_id" not in request.session:
    #     status["type"] = "deal"
    #     status["message"] = "Please select a deal first!"
    #     # return JsonResponse({"status": "failed"})

    if request.POST.getlist('leadID'):

        lead_id = ''
        lead_id = lead_id.join(request.POST.getlist('leadID'))
        lead_id = lead_id.rstrip()

        # deal_id=request.session["deal_id"]
        # with connection.cursor() as cursor:
        #     cursor.execute("SELECT account_number, bank_name, min(txn_date) as from_date, max(txn_date) as to_date  FROM bank_bank WHERE customer_id = " + customer_id  + " GROUP BY account_number" + ";")
        #     data = dictfetchall(cursor)
        data = bank_bank.objects.filter(lead_id=lead_id).values('account_number', 'bank_name').annotate(
            from_date=Min('txn_date'), to_date=Max('txn_date'))

        for date in data:
            date['from_date'] = date['from_date'].strftime('%d/%m/%Y')
            date['to_date'] = date['to_date'].strftime('%d/%m/%Y')

        if request.POST.getlist('optbank'):
            n = ''
            n = n.join(request.POST.getlist('optbank'))
            n = n.rstrip()
            # n = request.POST.get('optbank')
            # print (n)
            n2 = n
            if n is not None:
                n1 = "'%" + n[1:-1] + "%'"
                n = n1
                # print(n)

                p1 = 'q'

                # cursor.execute("SELECT txn_date, credit, debit, balance, account_number, account_name, mode, sub_mode, entity, source_of_trans, description FROM bank_bank WHERE account_number like " + n  +";")
                # data1 = dictfetchall(cursor)
                data1 = bank_bank.objects.filter(account_number__contains=n2).values(
                    'txn_date',
                    'credit',
                    'debit',
                    'balance',
                    'account_number',
                    'account_name',
                    'mode',
                    'sub_mode',
                    'entity',
                    'source_of_trans',
                    'description',
                    'lead_id'
                )

                data1 = pd.DataFrame(data1)
                data1 = data1[data1['lead_id'] == lead_id]
                # print(data1)
                KPI = KPIs(data1)
                # print(KPI)
                KPI = KPI.transpose()

                KPI_charts = bcmk_charts(data1)

                KPI['Max_Credit_Amount_Org'] = KPI['Max_credit_Amount']
                KPI['Max_Debit_Amount_Org'] = KPI['Max_debit_Amount']

                KPI['Non_cash_credits_Count'] = KPI['Non_cash_credits_Count'].astype(
                    'int64')
                KPI['Cash_debits_Count'] = KPI['Cash_debits_Count'].astype(
                    'int64')
                KPI['Cash_credits_Count'] = KPI['Cash_credits_Count'].astype(
                    'int64')
                KPI['Auto_debits_Count'] = KPI['Auto_debits_Count'].astype(
                    'int64')
                KPI['Total_credits_Count'] = KPI['Total_credits_Count'].astype(
                    'int64')
                KPI['Total_debits_Count'] = KPI['Total_debits_Count'].astype(
                    'int64')
                KPI['Non_cash_debits_Count'] = KPI['Non_cash_debits_Count'].astype(
                    'int64')

                KPI['Non_cash_credits_Value'] = KPI['Non_cash_credits_Value'].apply(
                    lambda x: x if pd.notnull(x) else 0)
                KPI['Non_cash_credits_Value'] = KPI['Non_cash_credits_Value'].apply(
                    lambda x: round(x))
                KPI['Non_cash_credits_Value'] = KPI['Non_cash_credits_Value'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                KPI['Non_cash_credits_Value'] = KPI['Non_cash_credits_Value'].apply(
                    lambda x: str(x).replace('₹', ''))
                KPI['Non_cash_credits_Value'] = KPI['Non_cash_credits_Value'].apply(
                    lambda x: str(x).split('.')[0])
                ########################################################

                KPI['Min_Balance'] = KPI['Min_Balance'].apply(
                    lambda x: x if pd.notnull(x) else 0)
                KPI['Min_Balance'] = KPI['Min_Balance'].apply(
                    lambda x: round(x))
                KPI['Min_Balance'] = KPI['Min_Balance'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                KPI['Min_Balance'] = KPI['Min_Balance'].apply(
                    lambda x: str(x).replace('₹', ''))
                KPI['Min_Balance'] = KPI['Min_Balance'].apply(
                    lambda x: str(x).split('.')[0])

                ###################################################

                KPI['Max_Balance'] = KPI['Max_Balance'].apply(
                    lambda x: x if pd.notnull(x) else 0)
                KPI['Max_Balance'] = KPI['Max_Balance'].apply(
                    lambda x: round(x))
                KPI['Max_Balance'] = KPI['Max_Balance'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                KPI['Max_Balance'] = KPI['Max_Balance'].apply(
                    lambda x: str(x).replace('₹', ''))
                KPI['Max_Balance'] = KPI['Max_Balance'].apply(
                    lambda x: str(x).split('.')[0])

                # KPI['Non_cash_credits_Value'] = KPI['Non_cash_credits_Value'].apply(lambda x: (round(x)))
                # KPI['Non_cash_credits_Value'] = KPI['Non_cash_credits_Value'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                # KPI['Non_cash_credits_Value'] = KPI['Non_cash_credits_Value'].apply(lambda x: str(x).split('.')[0])

                KPI['Cash_credits_Value'] = KPI['Cash_credits_Value'].apply(
                    lambda x: x if pd.notnull(x) else 0)
                KPI['Cash_credits_Value'] = KPI['Cash_credits_Value'].apply(
                    lambda x: round(x))
                KPI['Cash_credits_Value'] = KPI['Cash_credits_Value'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                KPI['Cash_credits_Value'] = KPI['Cash_credits_Value'].apply(
                    lambda x: str(x).replace('₹', ''))
                KPI['Cash_credits_Value'] = KPI['Cash_credits_Value'].apply(
                    lambda x: str(x).split('.')[0])

                # KPI['Cash_credits_Value'] = KPI['Cash_credits_Value'].apply(lambda x: (round(x)))
                # KPI['Cash_credits_Value'] = KPI['Cash_credits_Value'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                # KPI['Cash_credits_Value'] = KPI['Cash_credits_Value'].apply(lambda x: str(x).split('.')[0])

                KPI['Total_credits_Value'] = KPI['Total_credits_Value'].apply(
                    lambda x: x if pd.notnull(x) else 0)
                KPI['Total_credits_Value'] = KPI['Total_credits_Value'].apply(
                    lambda x: round(x))
                KPI['Total_credits_Value'] = KPI['Total_credits_Value'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                KPI['Total_credits_Value'] = KPI['Total_credits_Value'].apply(
                    lambda x: str(x).split('.')[0])

                # KPI['Total_credits_Value'] = KPI['Total_credits_Value'].apply(lambda x: (round(x)))
                # KPI['Total_credits_Value'] = KPI['Total_credits_Value'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                # KPI['Total_credits_Value'] = KPI['Total_credits_Value'].apply(lambda x: str(x).split('.')[0])

                KPI['Non_cash_debits_Value'] = KPI['Non_cash_debits_Value'].apply(
                    lambda x: x if pd.notnull(x) else 0)
                KPI['Non_cash_debits_Value'] = KPI['Non_cash_debits_Value'].apply(
                    lambda x: round(x))
                KPI['Non_cash_debits_Value'] = KPI['Non_cash_debits_Value'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                KPI['Non_cash_debits_Value'] = KPI['Non_cash_debits_Value'].apply(
                    lambda x: str(x).split('.')[0])

                # KPI['Non_cash_debits_Value'] = KPI['Non_cash_debits_Value'].apply(lambda x: (round(x)))
                # KPI['Non_cash_debits_Value'] = KPI['Non_cash_debits_Value'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                # KPI['Non_cash_debits_Value'] = KPI['Non_cash_debits_Value'].apply(lambda x: str(x).split('.')[0])

                KPI['Cash_debits_Value'] = KPI['Cash_debits_Value'].apply(
                    lambda x: x if pd.notnull(x) else 0)
                KPI['Cash_debits_Value'] = KPI['Cash_debits_Value'].apply(
                    lambda x: round(x))
                KPI['Cash_debits_Value'] = KPI['Cash_debits_Value'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                KPI['Cash_debits_Value'] = KPI['Cash_debits_Value'].apply(
                    lambda x: str(x).split('.')[0])

                # KPI['Cash_debits_Value'] = KPI['Cash_debits_Value'].apply(lambda x: (round(x)))
                # KPI['Cash_debits_Value'] = KPI['Cash_debits_Value'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                # KPI['Cash_debits_Value'] = KPI['Cash_debits_Value'].apply(lambda x: str(x).split('.')[0])

                # KPI['Total_debits_Value'] = KPI['Total_debits_Value'].apply(lambda x: (round(x)))
                # KPI['Total_debits_Value'] = KPI['Total_debits_Value'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                # KPI['Total_debits_Value'] = KPI['Total_debits_Value'].apply(lambda x: str(x).split('.')[0])

                KPI['Total_debits_Value'] = KPI['Total_debits_Value'].apply(
                    lambda x: x if pd.notnull(x) else 0)
                KPI['Total_debits_Value'] = KPI['Total_debits_Value'].apply(
                    lambda x: round(x))
                KPI['Total_debits_Value'] = KPI['Total_debits_Value'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                KPI['Total_debits_Value'] = KPI['Total_debits_Value'].apply(
                    lambda x: str(x).split('.')[0])

                KPI['Auto_debits_Value'] = KPI['Auto_debits_Value'].apply(
                    lambda x: x if pd.notnull(x) else 0)
                KPI['Auto_debits_Value'] = KPI['Auto_debits_Value'].apply(
                    lambda x: round(x))
                KPI['Auto_debits_Value'] = KPI['Auto_debits_Value'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                KPI['Auto_debits_Value'] = KPI['Auto_debits_Value'].apply(
                    lambda x: str(x).split('.')[0])

                # KPI['Auto_Debits_Value'] = KPI['Auto_Debits_Value'].apply(lambda x: (round(x)))
                # KPI['Auto_Debits_Value'] = KPI['Auto_Debits_Value'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                # KPI['Auto_Debits_Value'] = KPI['Auto_Debits_Value'].apply(lambda x: str(x).split('.')[0])

                # KPI['Max_Credit_Amount'] = KPI['Max_Credit_Amount'].apply(lambda x: (round(x)))
                # KPI['Max_Credit_Amount'] = KPI['Max_Credit_Amount'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                # KPI['Max_Credit_Amount'] = KPI['Max_Credit_Amount'].apply(lambda x: str(x).split('.')[0])

                KPI['Max_credit_Amount'] = KPI['Max_credit_Amount'].apply(
                    lambda x: x if pd.notnull(x) else 0)
                KPI['Max_credit_Amount'] = KPI['Max_credit_Amount'].apply(
                    lambda x: round(x))
                KPI['Max_credit_Amount'] = KPI['Max_credit_Amount'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                KPI['Max_credit_Amount'] = KPI['Max_credit_Amount'].apply(
                    lambda x: str(x).split('.')[0])

                KPI['Max_debit_Amount'] = KPI['Max_debit_Amount'].apply(
                    lambda x: x if pd.notnull(x) else 0)
                KPI['Max_debit_Amount'] = KPI['Max_debit_Amount'].apply(
                    lambda x: round(x))
                KPI['Max_debit_Amount'] = KPI['Max_debit_Amount'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                KPI['Max_debit_Amount'] = KPI['Max_debit_Amount'].apply(
                    lambda x: str(x).split('.')[0])

                # KPI['Max_Debit_Amount'] = KPI['Max_Debit_Amount'].apply(lambda x: (round(x)))
                # KPI['Max_Debit_Amount'] = KPI['Max_Debit_Amount'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                # KPI['Max_Debit_Amount'] = KPI['Max_Debit_Amount'].apply(lambda x: str(x).split('.')[0])

                # KPI['Average_Balance'] = KPI['Average_Balance'].apply(lambda x: (round(x)))
                # KPI['Average_Balance'] = KPI['Average_Balance'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                # KPI['Average_Balance'] = KPI['Average_Balance'].apply(lambda x: str(x).split('.')[0])

                KPI['Average_balance'] = KPI['Average_balance'].apply(
                    lambda x: x if pd.notnull(x) else 0)
                KPI['Average_balance'] = KPI['Average_balance'].apply(
                    lambda x: round(x))
                KPI['Average_balance'] = KPI['Average_balance'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                KPI['Average_balance'] = KPI['Average_balance'].apply(
                    lambda x: str(x).split('.')[0])

                KPI['Month_End_balance'] = KPI['Month_End_balance'].apply(
                    lambda x: x if pd.notnull(x) else 0)
                KPI['Month_End_balance'] = KPI['Month_End_balance'].apply(
                    lambda x: round(x))
                KPI['Month_End_balance'] = KPI['Month_End_balance'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                KPI['Month_End_balance'] = KPI['Month_End_balance'].apply(
                    lambda x: str(x).split('.')[0])

                # KPI['Month_End_Balance'] = KPI['Month_End_Balance'].apply(lambda x: (round(x)))
                # KPI['Month_End_Balance'] = KPI['Month_End_Balance'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                # KPI['Month_End_Balance'] = KPI['Month_End_Balance'].apply(lambda x: str(x).split('.')[0])

                KPI['Net_Inflow_Amount'] = KPI['Net_Inflow_Amount'].apply(
                    lambda x: x if pd.notnull(x) else 0)
                KPI['Net_Inflow_Amount'] = KPI['Net_Inflow_Amount'].apply(
                    lambda x: round(x))
                KPI['Net_Inflow_Amount'] = KPI['Net_Inflow_Amount'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                KPI['Net_Inflow_Amount'] = KPI['Net_Inflow_Amount'].apply(
                    lambda x: str(x).split('.')[0])

                # KPI['Net_Inflow_Amount'] = KPI['Net_Inflow_Amount'].apply(lambda x: (round(x)))
                # KPI['Net_Inflow_Amount'] = KPI['Net_Inflow_Amount'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                # KPI['Net_Inflow_Amount'] = KPI['Net_Inflow_Amount'].apply(lambda x: str(x).split('.')[0])

                # KPI['EMI'] = KPI['EMI'].apply(lambda x: (round(x)))
                # KPI['EMI'] = KPI['EMI'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                # KPI['EMI'] = KPI['EMI'].apply(lambda x: str(x).split('.')[0])

                KPI['EMI'] = KPI['EMI'].apply(
                    lambda x: x if pd.notnull(x) else 0)
                KPI['EMI'] = KPI['EMI'].apply(lambda x: round(x))
                KPI['EMI'] = KPI['EMI'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                KPI['EMI'] = KPI['EMI'].apply(lambda x: str(x).split('.')[0])

                KPI = KPI.replace('₹', '', regex=True)

                json_records = KPI.reset_index().to_json(orient='records')
                data1 = json.loads(json_records)
                # data1 = KPI
                # print(data1)
                # x1 = [10,20,30]
                # y1 = [20,40,10]
                # # plotting the line 1 points n
                # plt.plot(x1, y1, label = "line 1")
                # plt.savefig(os.path.join(settings.BASE_DIR, '/static/assets/images/image_1.png'))
                n1 = n[1:-1]

                # print(n1)
                # pydict = json.dumps([data, data1, n1, n2, p1])
                #
                # return HttpResponse(pydict)
                data3 = pd.DataFrame(list([data, data1, n1, n2, p1]))
                data3 = data3.to_dict('split')
                pydict = json.dumps([data3])
                return HttpResponse(pydict)

                # return render(request, "bcmk.html",{'data' : data,'data1' : data1, 'n' : n1, 'n2':n2, 'p1':p1 })

        data3 = pd.DataFrame(list([data]))
        data3 = data3.to_dict('split')
        pydict = json.dumps([data3])
        return HttpResponse(pydict)
        # return render(request, "bcmk.html",{ 'data' : data, 'n2':n2, 'p1':p1 })


# plt.savefig(os.path.join(settings.BASE_DIR, 'static/img/imagen.png'))
# import os
# from django.conf import settings

# @login_required
# @csrf_protect
# def bank_customer_kpi(request):
#     try:
#         os.remove(settings.STATICFILES_DIRS[0] + '/assets/images/saved_figure_1.png')
#     except:
#         pass

#     try:
#         os.remove(settings.STATICFILES_DIRS[0] + '/assets/images/saved_figure.png')
#     except:
#         pass
#     try:
#         os.remove(settings.STATICFILES_DIRS[0] + '/assets/images/saved_figure_2.png')
#     except:
#         pass
#     status = {}
#     n2 = ''
#     p1 = ''
#     # print("Getting analyze data.")
#     if (0):
#         pass
#     else:
#         lead_id = int(request.POST["leadID"])
#         # deal_id=request.session["deal_id"]
#         # with connection.cursor() as cursor:
#         #     cursor.execute("SELECT account_number, bank_name, min(txn_date) as from_date, max(txn_date) as to_date  FROM bank_bank WHERE customer_id = " + customer_id  + " GROUP BY account_number" + ";")
#         #     data = dictfetchall(cursor)
#         # print(data)
#         # names = bank_bank.objects.values('txn_date', 'description', 'cheque_number', 'debit', 'credit', 'balance',
#         #                                  'account_name', 'account_number', 'mode', 'entity', 'source_of_trans',
#         #                                  'sub_mode', 'transaction_type', 'bank_name', 'lead_id', 'creation_time')
#         # meta_data = pd.DataFrame(names)
#         # print(meta_data)

#         data = bank_bank.objects.filter(lead_id=lead_id).values('account_number', 'bank_name').annotate(
#             from_date=Min('txn_date'), to_date=Max('txn_date'))

#         for date in data:
#             date['from_date'] = date['from_date'].strftime('%d/%m/%Y')
#             date['to_date'] = date['to_date'].strftime('%d/%m/%Y')

#         if request.POST.getlist('optbank'):

#             n = request.POST.get('optbank')
#             # print (n)
#             n2 = n
#             if n is not None:
#                 n = "'%" + n[1:-1] + "%'"
#                 # print(n)
#                 p1 = 'q'
#                 # cursor.execute("SELECT txn_date, credit, debit, balance, account_number, account_name, mode, sub_mode, entity, source_of_trans, description, transaction_type FROM bank_bank WHERE account_number like " + n  +";")
#                 # data1 = dictfetchall(cursor)
#                 data1 = bank_bank.objects.filter(account_number__startswith=n).values(
#                     'txn_date', 'credit', 'debit', 'balance', 'account_number', 'account_name', 'mode', 'sub_mode',
#                     'entity', 'source_of_trans', 'description', 'transaction_type'
#                 )

#                 data1 = pd.DataFrame(data1)
#                 # print('output from views')
#                 # print(data1['account_number'])
#                 KPI = bck(data1)
#                 KPI1 = KPI[1]
#                 KPI2 = KPI[2]
#                 KPI3 = KPI[3]
#                 KPI4 = KPI[4]
#                 KPI = KPI[0]

#                 # KPI['Average_Monthly_Balance'] = KPI['Average_Monthly_Balance'].apply(lambda x : round(x))
#                 # KPI['Average_Monthly_Balance'] = KPI['Average_Monthly_Balance'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
#                 # KPI['Average_Monthly_Balance'] = KPI['Average_Monthly_Balance'].apply(lambda x: str(x).split('.')[0])

#                 KPI['Average_Monthly_Balance'] = KPI['Average_Monthly_Balance'].apply(
#                     lambda x: x if pd.notnull(x) else 0)
#                 KPI['Average_Monthly_Balance'] = KPI['Average_Monthly_Balance'].apply(lambda x: round(x))
#                 KPI['Average_Monthly_Balance'] = KPI['Average_Monthly_Balance'].apply(
#                     lambda x: format_currency(x, 'INR', locale='en_IN'))
#                 KPI['Average_Monthly_Balance'] = KPI['Average_Monthly_Balance'].apply(lambda x: str(x).split('.')[0])

#                 # KPI['Average_Monthly_Credit'] = KPI['Average_Monthly_Credit'].apply(lambda x : round(x))
#                 # KPI['Average_Monthly_Credit'] = KPI['Average_Monthly_Credit'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
#                 # KPI['Average_Monthly_Credit'] = KPI['Average_Monthly_Credit'].apply(lambda x: str(x).split('.')[0])

#                 KPI['Average_Monthly_Credit'] = KPI['Average_Monthly_Credit'].apply(lambda x: x if pd.notnull(x) else 0)
#                 KPI['Average_Monthly_Credit'] = KPI['Average_Monthly_Credit'].apply(lambda x: round(x))
#                 KPI['Average_Monthly_Credit'] = KPI['Average_Monthly_Credit'].apply(
#                     lambda x: format_currency(x, 'INR', locale='en_IN'))
#                 KPI['Average_Monthly_Credit'] = KPI['Average_Monthly_Credit'].apply(lambda x: str(x).split('.')[0])

#                 # KPI['Average_Monthly_Debit'] = KPI['Average_Monthly_Debit'].apply(lambda x : round(x))
#                 # KPI['Average_Monthly_Debit'] = KPI['Average_Monthly_Debit'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
#                 # KPI['Average_Monthly_Debit'] = KPI['Average_Monthly_Debit'].apply(lambda x: str(x).split('.')[0])

#                 KPI['Average_Monthly_Debit'] = KPI['Average_Monthly_Debit'].apply(lambda x: x if pd.notnull(x) else 0)
#                 KPI['Average_Monthly_Debit'] = KPI['Average_Monthly_Debit'].apply(lambda x: round(x))
#                 KPI['Average_Monthly_Debit'] = KPI['Average_Monthly_Debit'].apply(
#                     lambda x: format_currency(x, 'INR', locale='en_IN'))
#                 KPI['Average_Monthly_Debit'] = KPI['Average_Monthly_Debit'].apply(lambda x: str(x).split('.')[0])

#                 # KPI['Maximum_Balance'] = KPI['Maximum_Balance'].apply(lambda x : round(x))
#                 # KPI['Maximum_Balance'] = KPI['Maximum_Balance'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
#                 # KPI['Maximum_Balance'] = KPI['Maximum_Balance'].apply(lambda x: str(x).split('.')[0])

#                 KPI['Maximum_Balance'] = KPI['Maximum_Balance'].apply(lambda x: x if pd.notnull(x) else 0)
#                 KPI['Maximum_Balance'] = KPI['Maximum_Balance'].apply(lambda x: round(x))
#                 KPI['Maximum_Balance'] = KPI['Maximum_Balance'].apply(
#                     lambda x: format_currency(x, 'INR', locale='en_IN'))
#                 KPI['Maximum_Balance'] = KPI['Maximum_Balance'].apply(lambda x: str(x).split('.')[0])

#                 KPI['Minimum_Balance'] = KPI['Minimum_Balance'].apply(lambda x: x if pd.notnull(x) else 0)
#                 KPI['Minimum_Balance'] = KPI['Minimum_Balance'].apply(lambda x: round(x))
#                 KPI['Minimum_Balance'] = KPI['Minimum_Balance'].apply(
#                     lambda x: format_currency(x, 'INR', locale='en_IN'))
#                 KPI['Minimum_Balance'] = KPI['Minimum_Balance'].apply(lambda x: str(x).split('.')[0])

#                 # KPI['Minimum_Balance'] = KPI['Minimum_Balance'].apply(lambda x : round(x))
#                 # KPI['Minimum_Balance'] = KPI['Minimum_Balance'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
#                 # KPI['Minimum_Balance'] = KPI['Minimum_Balance'].apply(lambda x: str(x).split('.')[0])

#                 # KPI = pd.DataFrame.from_dict(KPI)

#                 # KPI2['Highest_Credit_Amount'] = KPI2['Highest_Credit_Amount'].apply(lambda x : round(x,2))
#                 # KPI2['Highest_Credit_Amount'] = KPI2['Highest_Credit_Amount'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))

#                 # KPI4['Opening_Balance'] = KPI4['Opening_Balance'].apply(lambda x : round(x))
#                 # KPI4['Opening_Balance'] = KPI4['Opening_Balance'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
#                 # KPI4['Opening_Balance'] = KPI4['Opening_Balance'].apply(lambda x: str(x).split('.')[0])

#                 KPI4['Opening_Balance'] = KPI4['Opening_Balance'].apply(lambda x: x if pd.notnull(x) else 0)
#                 KPI4['Opening_Balance'] = KPI4['Opening_Balance'].apply(lambda x: round(x))
#                 KPI4['Opening_Balance'] = KPI4['Opening_Balance'].apply(
#                     lambda x: format_currency(x, 'INR', locale='en_IN'))
#                 KPI4['Opening_Balance'] = KPI4['Opening_Balance'].apply(lambda x: str(x).split('.')[0])

#                 # KPI4['Closing_Balance'] = KPI4['Closing_Balance'].apply(lambda x : round(x))
#                 # KPI4['Closing_Balance'] = KPI4['Closing_Balance'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
#                 # KPI4['Closing_Balance'] = KPI4['Closing_Balance'].apply(lambda x: str(x).split('.')[0])

#                 KPI4['Closing_Balance'] = KPI4['Closing_Balance'].apply(lambda x: x if pd.notnull(x) else 0)
#                 KPI4['Closing_Balance'] = KPI4['Closing_Balance'].apply(lambda x: round(x))
#                 KPI4['Closing_Balance'] = KPI4['Closing_Balance'].apply(
#                     lambda x: format_currency(x, 'INR', locale='en_IN'))
#                 KPI4['Closing_Balance'] = KPI4['Closing_Balance'].apply(lambda x: str(x).split('.')[0])

#                 KPI2['Ratio_Debit_Credit'] = KPI2['Ratio_Debit_Credit'].apply(lambda x: round(x, 2))
#                 KPI2['Ratio_Cash_Total_Credit'] = KPI2['Ratio_Cash_Total_Credit'].apply(lambda x: round(x, 2))

#                 # KPI2['Highest_Credit_Amount_Org'] = KPI2['Highest_Credit_Amount'].apply(lambda x : x.split(' ')[0])
#                 # KPI2['Highest_Credit_Amount_Org'] = KPI2['Highest_Credit_Amount_Org'].astype('str')
#                 # KPI2['Highest_Credit_Amount_Org'].apply(lambda x : x.replace(',',''))

#                 # KPI2['Highest_Credit_Amount_Org'].apply(lambda x : x.replace('₹',''))

#                 KPI2['Highest_Credit_Amount'] = KPI2['Highest_Credit_Amount'].apply(lambda x: str(x).split('.')[0])
#                 KPI2['Lowest_Debit_Amount'] = KPI2['Lowest_Debit_Amount'].apply(lambda x: str(x).split('.')[0])

#                 json_records = KPI.to_json(orient='records')
#                 data1 = json.loads(json_records)
#                 # print(data1)
#                 data1 = data1[0]

#                 json_records = KPI1.to_json(orient='records')
#                 data2 = json.loads(json_records)
#                 # print(data2)
#                 data2 = data2[0]

#                 json_records = KPI2.to_json(orient='records')
#                 data3 = json.loads(json_records)
#                 # print(data3)
#                 data3 = data3[0]

#                 json_records = KPI3.to_json(orient='records')
#                 data4 = json.loads(json_records)
#                 # print(data4)
#                 data4 = data4[0]

#                 # print(KPI4)
#                 json_records = KPI4.to_json(orient='records', date_format='iso')
#                 data5 = json.loads(json_records)
#                 # print(data5)
#                 data5 = data5[0]

#                 data5['Start_Date'] = pd.to_datetime(data5['Start_Date'], format="%Y-%m-%d").strftime('%d/%m/%Y')
#                 data5['End_Date'] = pd.to_datetime(data5['End_Date'], format="%Y-%m-%d").strftime('%d/%m/%Y')
#                 print(data4)
#                 E_Z_N_B = data4.get('Entries_Zero_Neg_Bal')

#                 pydict = json.dumps([data, data1, data2, data4, data5, n2, p1, E_Z_N_B])
#                 return HttpResponse(pydict)

#                 # return render(request, 'bck.html', {'data' : data,'data1' : data1,'data2' : data2, 'data3' : data3, 'data4' : data4, 'data5' : data5, 'n2':n2, 'p1':p1,'EZNB':E_Z_N_B})
#         # pydict = json.dumps([data, n2, p1])
#         finaldata = pd.DataFrame(list([data, n2, p1]))
#         finaldata = finaldata.to_dict('split')
#         pydict = json.dumps([finaldata])
#         return HttpResponse(json.dumps(pydict))

#     # return render(request, 'bck.html', {'data' : data, 'n2':n2, 'p1':p1})

def bank_customer_kpi(request):

    try:
        path = os.path.join(path_static_files, 'closing-balance-trend.png')
        os.remove(path)
    except:
        pass

    try:
        path = os.path.join(path_static_files, 'feq-mode-txn.png')
        os.remove(path)
    except:
        pass
    try:
        path = os.path.join(path_static_files, 'in-outflow.png')
        os.remove(path)
    except:
        pass
    status = {}
    n2 = ''
    p1 = ''
    # print("Getting analyze data.")
    if (0):
        pass
    else:
        lead_id = int(request.POST["leadID"])
        with connection.cursor() as cursor:
            cursor.execute("SELECT account_number, bank_name, min(txn_date) as from_date, max(txn_date) as to_date  FROM a5_kit.mysite_bank_bank WHERE lead_id = " +
                           str(lead_id) + " GROUP BY account_number" + ";")
            data = dictfetchall(cursor)

            # print(data)
            for date in data:

                date['from_date'] = date['from_date'].strftime('%d/%m/%Y')
                date['to_date'] = date['to_date'].strftime('%d/%m/%Y')

            if request.POST.getlist('optbank'):

                n = request.POST.get('optbank')
                # print (n)
                n2 = n
                if n is not None:
                    try:
                        path = os.path.join(
                            path_static_files, 'closing-balance-trend.png')
                        os.remove(path)
                    except:
                        pass

                    try:
                        path = os.path.join(
                            path_static_files, 'feq-mode-txn.png')
                        os.remove(path)
                    except:
                        pass
                    try:
                        path = os.path.join(
                            path_static_files, 'in-outflow.png')
                        os.remove(path)
                    except:
                        pass
                    n = "'%" + n[1:-1] + "%'"
                    # print(n)
                    p1 = 'q'
                    cursor.execute("SELECT txn_date, credit, debit, balance, account_number, account_name, mode, sub_mode, entity, source_of_trans, description, transaction_type,lead_id FROM mysite_bank_bank WHERE account_number like " + n + ";")
                    data1 = dictfetchall(cursor)

                    data1 = pd.DataFrame(data1)
                    lead_id_str = str(lead_id)
                    data1 = data1[data1['lead_id'] == lead_id_str]

                    print('output from views')
                    print(data1['account_number'])
                    KPI = bck(data1)
                    KPI1 = KPI[1]
                    KPI2 = KPI[2]
                    KPI3 = KPI[3]
                    KPI4 = KPI[4]
                    KPI = KPI[0]

                    # KPI['Average_Monthly_Balance'] = KPI['Average_Monthly_Balance'].apply(lambda x : round(x))
                    # KPI['Average_Monthly_Balance'] = KPI['Average_Monthly_Balance'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['Average_Monthly_Balance'] = KPI['Average_Monthly_Balance'].apply(lambda x: str(x).split('.')[0])

                    KPI['Average_Monthly_Balance'] = KPI['Average_Monthly_Balance'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['Average_Monthly_Balance'] = KPI['Average_Monthly_Balance'].apply(
                        lambda x: round(x))
                    KPI['Average_Monthly_Balance'] = KPI['Average_Monthly_Balance'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['Average_Monthly_Balance'] = KPI['Average_Monthly_Balance'].apply(
                        lambda x: str(x).split('.')[0])

                    # KPI['Average_Monthly_Credit'] = KPI['Average_Monthly_Credit'].apply(lambda x : round(x))
                    # KPI['Average_Monthly_Credit'] = KPI['Average_Monthly_Credit'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['Average_Monthly_Credit'] = KPI['Average_Monthly_Credit'].apply(lambda x: str(x).split('.')[0])

                    KPI['Average_Monthly_Credit'] = KPI['Average_Monthly_Credit'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['Average_Monthly_Credit'] = KPI['Average_Monthly_Credit'].apply(
                        lambda x: round(x))
                    KPI['Average_Monthly_Credit'] = KPI['Average_Monthly_Credit'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['Average_Monthly_Credit'] = KPI['Average_Monthly_Credit'].apply(
                        lambda x: str(x).split('.')[0])

                    # KPI['Average_Monthly_Debit'] = KPI['Average_Monthly_Debit'].apply(lambda x : round(x))
                    # KPI['Average_Monthly_Debit'] = KPI['Average_Monthly_Debit'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['Average_Monthly_Debit'] = KPI['Average_Monthly_Debit'].apply(lambda x: str(x).split('.')[0])

                    KPI['Average_Monthly_Debit'] = KPI['Average_Monthly_Debit'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['Average_Monthly_Debit'] = KPI['Average_Monthly_Debit'].apply(
                        lambda x: round(x))
                    KPI['Average_Monthly_Debit'] = KPI['Average_Monthly_Debit'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['Average_Monthly_Debit'] = KPI['Average_Monthly_Debit'].apply(
                        lambda x: str(x).split('.')[0])

                    # KPI['Maximum_Balance'] = KPI['Maximum_Balance'].apply(lambda x : round(x))
                    # KPI['Maximum_Balance'] = KPI['Maximum_Balance'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['Maximum_Balance'] = KPI['Maximum_Balance'].apply(lambda x: str(x).split('.')[0])
                    KPI['Maximum_Balance'] = KPI['Maximum_Balance'].astype(
                        float)
                    KPI['Maximum_Balance'] = KPI['Maximum_Balance'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['Maximum_Balance'] = KPI['Maximum_Balance'].apply(
                        lambda x: round(x))
                    KPI['Maximum_Balance'] = KPI['Maximum_Balance'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['Maximum_Balance'] = KPI['Maximum_Balance'].apply(
                        lambda x: str(x).split('.')[0])

                    KPI['Minimum_Balance'] = KPI['Minimum_Balance'].astype(
                        float)
                    KPI['Minimum_Balance'] = KPI['Minimum_Balance'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['Minimum_Balance'] = KPI['Minimum_Balance'].apply(
                        lambda x: round(x))
                    KPI['Minimum_Balance'] = KPI['Minimum_Balance'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['Minimum_Balance'] = KPI['Minimum_Balance'].apply(
                        lambda x: str(x).split('.')[0])

                    # KPI['Minimum_Balance'] = KPI['Minimum_Balance'].apply(lambda x : round(x))
                    # KPI['Minimum_Balance'] = KPI['Minimum_Balance'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['Minimum_Balance'] = KPI['Minimum_Balance'].apply(lambda x: str(x).split('.')[0])

                    # KPI = pd.DataFrame.from_dict(KPI)

                    # KPI2['Highest_Credit_Amount'] = KPI2['Highest_Credit_Amount'].apply(lambda x : round(x,2))
                    # KPI2['Highest_Credit_Amount'] = KPI2['Highest_Credit_Amount'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))

                    # KPI4['Opening_Balance'] = KPI4['Opening_Balance'].apply(lambda x : round(x))
                    # KPI4['Opening_Balance'] = KPI4['Opening_Balance'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI4['Opening_Balance'] = KPI4['Opening_Balance'].apply(lambda x: str(x).split('.')[0])
                    KPI4['Opening_Balance'] = KPI4['Opening_Balance'].astype(
                        float)
                    KPI4['Opening_Balance'] = KPI4['Opening_Balance'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI4['Opening_Balance'] = KPI4['Opening_Balance'].apply(
                        lambda x: round(x))
                    KPI4['Opening_Balance'] = KPI4['Opening_Balance'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI4['Opening_Balance'] = KPI4['Opening_Balance'].apply(
                        lambda x: str(x).split('.')[0])


                    # KPI4['Closing_Balance'] = KPI4['Closing_Balance'].apply(lambda x : round(x))
                    # KPI4['Closing_Balance'] = KPI4['Closing_Balance'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI4['Closing_Balance'] = KPI4['Closing_Balance'].apply(lambda x: str(x).split('.')[0])
                    KPI4['Closing_Balance'] = KPI4['Closing_Balance'].astype(
                        float)
                    KPI4['Closing_Balance'] = KPI4['Closing_Balance'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI4['Closing_Balance'] = KPI4['Closing_Balance'].apply(
                        lambda x: round(x))
                    KPI4['Closing_Balance'] = KPI4['Closing_Balance'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI4['Closing_Balance'] = KPI4['Closing_Balance'].apply(
                        lambda x: str(x).split('.')[0])


                    KPI2['Ratio_Debit_Credit'] = KPI2['Ratio_Debit_Credit'].apply(
                        lambda x: round(x, 2))
                    KPI2['Ratio_Cash_Total_Credit'] = KPI2['Ratio_Cash_Total_Credit'].apply(
                        lambda x: round(x, 2))

                    # KPI2['Highest_Credit_Amount_Org'] = KPI2['Highest_Credit_Amount'].apply(lambda x : x.split(' ')[0])
                    # KPI2['Highest_Credit_Amount_Org'] = KPI2['Highest_Credit_Amount_Org'].astype('str')
                    # KPI2['Highest_Credit_Amount_Org'].apply(lambda x : x.replace(',',''))

                    # KPI2['Highest_Credit_Amount_Org'].apply(lambda x : x.replace('₹',''))

                    KPI2['Highest_Credit_Amount'] = KPI2['Highest_Credit_Amount'].apply(
                        lambda x: str(x).split('.')[0])
                    KPI2['Lowest_Debit_Amount'] = KPI2['Lowest_Debit_Amount'].apply(
                        lambda x: str(x).split('.')[0])




                    # KPI3['Min_Amt_Chq_Bounce'] = KPI3['Min_Amt_Chq_Bounce'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI3['Latest_Chq_Bounce'] = KPI3['Latest_Chq_Bounce'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI3['Latest_Chq_Bounce']=KPI3['Latest_Chq_Bounce'].astype(str)

                    # # KPI3['Min_Amt_Chq_Bounce']
                    # Latest_Chq_Bounce

                    KPI = KPI.replace('₹', '₹ ', regex=True)
                    KPI2 = KPI2.replace('₹', '₹ ', regex=True)
                    KPI3 = KPI3.replace('₹', '₹ ', regex=True)
                    KPI4 = KPI4.replace('₹', '₹ ', regex=True)
                    KPI1 = KPI1.replace('₹', '₹ ', regex=True)

                    json_records = KPI.to_json(orient='records')
                    data1 = json.loads(json_records)
                    # print(data1)
                    data1 = data1[0]

                    json_records = KPI1.to_json(orient='records')
                    data2 = json.loads(json_records)
                    # print(data2)
                    data2 = data2[0]

                    json_records = KPI2.to_json(orient='records')
                    data3 = json.loads(json_records)
                    # print(data3)
                    data3 = data3[0]

                    json_records = KPI3.to_json(orient='records')
                    data4 = json.loads(json_records)
                    # print(data4)
                    data4 = data4[0]

                    # print(KPI4)
                    json_records = KPI4.to_json(
                        orient='records', date_format='iso')
                    data5 = json.loads(json_records)
                    # print(data5)
                    data5 = data5[0]

                    data5['Start_Date'] = pd.to_datetime(
                        data5['Start_Date'], format="%Y-%m-%d").strftime('%d/%m/%Y')
                    data5['End_Date'] = pd.to_datetime(
                        data5['End_Date'], format="%Y-%m-%d").strftime('%d/%m/%Y')
                    print(data4)
                    E_Z_N_B = data4.get('Entries_Zero_Neg_Bal')
                    # finaldata = pd.DataFrame(list([data, data1,data2,data3,data4,data5,n2, p1,E_Z_N_B]))
                    finaldata = pd.DataFrame(
                        list([data, data1, data2, data3, data4, data5, n2, p1, str(E_Z_N_B)]))
                    finaldata = finaldata.to_dict('split')
                    pydict = json.dumps([finaldata])
                    # return HttpResponse(json.dumps(pydict))
                    return HttpResponse(json.dumps(
                        {'data': data, 'data1': data1, 'data2': data2, 'data3': data3, 'data4': data4, 'data5': data5,
                         'n2': n2, 'p1': p1, 'EZNB': E_Z_N_B}))
                    # return HttpResponse( {'data' : data,'data1' : data1,'data2' : data2, 'data3' : data3, 'data4' : data4, 'data5' : data5, 'n2':n2, 'p1':p1,'EZNB':E_Z_N_B})

    # finaldata = pd.DataFrame(list([data]))
    # finaldata = finaldata.to_dict('split')
    # pydict = json.dumps([finaldata])
    # return HttpResponse(json.dumps(pydict))
    data3 = pd.DataFrame(list([data]))
    data3 = data3.to_dict('split')
    pydict = json.dumps([data3])
    return HttpResponse(pydict)


@login_required
def bureauAnalyze(request):
    status = {}
    if "deal_id" not in request.session or "customer_id" not in request.session:
        status["type"] = "deal"
        status["message"] = "Please select a deal first!"
    else:
        customer_id = request.session["customer_id"]
        deal_id = request.session["deal_id"]

    payload = {"entity_kpi": True, "status": status if status else None}
    return render(request, "bureauAnalyze.html", payload)


@login_required
def bankAnalyze(request):
    status = {}
    if "deal_id" not in request.session or "customer_id" not in request.session:
        status["type"] = "deal"
        status["message"] = "Please select a deal first!"
    else:
        customer_id = request.session["customer_id"]
        deal_id = request.session["deal_id"]

    payload = {"entity_kpi": True, "status": status if status else None}
    return render(request, "bankAnalyze.html", payload)


@login_required
def maxcredit(request, date, maxcredit, accno):
    if (maxcredit == "1,00,000.00"):
        maxcredit = maxcredit
    # else:

    # print(maxcredit)
    # maxcredit=float(maxcredit)
    # print("suhaib")

    # maxcredit = "{:,.2f}".format(maxcredit)
    # maxcredit="'" + maxcredit + "'"

    # n is for find which request credit or debit
    n = date[0]

    date = date[1:4]
    # print(maxcredit)
    accno = "'%" + accno[1:-1] + "%'"

    if date == "Jan":
        date = 1
    if date == "Feb":
        date = 2
    if date == "Mar":
        date = 3
    if date == "Apr":
        date = 4
    if date == "May":
        date = 5
    if date == "Jun":
        date = 6
    if date == "Jul":
        date = 7
    if date == "Aug":
        date = 8
    if date == "Sep":
        date = 9
    if date == "Oct":
        date = 10
    if date == "Nov":
        date = 11
    if date == "Dec":
        date = 12

    with connection.cursor() as cursor:
        # cursor.execute("SELECT * from bank_bank where (month(txn_date) =" + str(date)  + " and account_number like  " + accno + " and credit =" + maxcredit + ");")
        # data = dictfetchall(cursor)
        # cursor.execute("SELECT * from bank_bank where (month(txn_date) = " + str(8) + "and account_number like " + accno + "and credit = 30,000.00 );")
        if n == "c":
            # print(date)
            # print(maxcredit)
            # maxcredit = maxcredit.replace(',','')
            # maxcredit = float(maxcredit)
            # cursor.execute("SELECT * from bank_bank where month(txn_date) = "+ str(date)+ "  and account_number like " + accno + " and credit  like '" + maxcredit +"';")
            cursor.execute("SELECT * from bank_bank where month(txn_date) = " + str(
                date) + "  and account_number like " + accno + " and credit = '" + (maxcredit) + "';")
            data = dictfetchall(cursor)
            for date in data:
                date['txn_date'] = date['txn_date'].strftime('%d/%m/%Y')
                date['debit'] = format_currency(
                    date['debit'], 'INR', locale='en_IN')
                date['credit'] = format_currency(
                    date['credit'], 'INR', locale='en_IN')
                date['balance'] = format_currency(
                    date['balance'], 'INR', locale='en_IN')

            return render(request, "maxcredit.html",
                          {'date': date, 'maxcredit': maxcredit, 'accno': accno, 'data': data})
        if n == "d":
            # print(date)
            # print(maxcredit)
            maxcredit = maxcredit.replace(',', '')
            cursor.execute("SELECT * from bank_bank where month(txn_date) = " + str(
                date) + "  and account_number like " + accno + " and debit = '" + maxcredit + "';")
            data = dictfetchall(cursor)
            for date in data:
                date['txn_date'] = date['txn_date'].strftime('%d/%m/%Y')
                date['debit'] = format_currency(
                    date['debit'], 'INR', locale='en_IN')
                date['credit'] = format_currency(
                    date['credit'], 'INR', locale='en_IN')
                date['balance'] = format_currency(
                    date['balance'], 'INR', locale='en_IN')

            return render(request, "maxcredit.html",
                          {'date': date, 'maxcredit': maxcredit, 'accno': accno, 'data': data})

    return render(request, "maxcredit.html", {'date': date, 'maxcredit': maxcredit, 'accno': accno})


# @login_required
def bureau_customer_kpi(request):

    if (0):
        print(hello)
    else:
        customer_id = str(5)
        deal_id = int(request.POST["leadID"])

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM mysite_bureau_ref_dtl WHERE CUSTOMER_ID = " + customer_id + ";")
            bureau_ref_dtl = dictfetchall(cursor)
            bureau_ref_dtl = pd.DataFrame(bureau_ref_dtl)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM mysite_bureau_account_segment_tl WHERE CUSTOMER_ID = " + str(5) + "  ;")
            bureau_account_segment_tl = dictfetchall(cursor)
            bureau_account_segment_tl = pd.DataFrame(bureau_account_segment_tl)

        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM mysite_bureau_table_data WHERE CUSTOMER_ID = " +
                           customer_id + "  ;")
            bureau_automated = dictfetchall(cursor)
            bureau_automated = pd.DataFrame(bureau_automated)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM mysite_bureau_enquiry_segment_iq WHERE CUSTOMER_ID = " + customer_id + ";")
            bureau_enquiry_segment_iq = dictfetchall(cursor)
            bureau_enquiry_segment_iq = pd.DataFrame(bureau_enquiry_segment_iq)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM mysite_bureau_address_segment WHERE CUSTOMER_ID = " + customer_id + ";")
            bureau_address_segment = dictfetchall(cursor)
            bureau_address_segment = pd.DataFrame(bureau_address_segment)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM mysite_bureau_score_segment WHERE CUSTOMER_ID = " + customer_id + ";")
            bureau_score_segment = dictfetchall(cursor)
            bureau_score_segment = pd.DataFrame(bureau_score_segment)

#         def gantt_chart_loan_timeline(df):
#             try:
#                 os.remove(
#                     r'C:/Users/hardik\Documents/GitHub/Nischay_28-03-2023/frontend\staticfiles/plotly_chart.png')
#                 os.remove(
#                     r'C:/Users/hardik\Documents/GitHub/Nischay_28-03-2023/frontend\staticfiles/plotly_chart2.png')
#             except:
#                 pass
#             df = df.sort_values('HIGH_CREDIT_AMOUNT')
#             # df['DATE_CLOSED']=pd.to_datetime(df['DATE_CLOSED'])
#             df['security_status'] = np.where(df['ACCOUNT_TYPE'].isin(['5', '6', '8', '9', 10, '12',
#                                                                       '14', '16', '18', 19, 20, 35, 36, 37, 38, 39, 40,
#                                                                       41, 43, 44, 45, 51, 52,
#                                                                       53, 54, 55, 56, 57, 58, 61, 00]), "unsecured", "secured")
#
#             df['DATE_CLOSED'] = (pd.to_datetime(df['DATE_CLOSED']))
#             df['DATE_CLOSED'] = df['DATE_CLOSED'].apply(lambda x: x.date())
#             df['PAYMENT_HST_1'] = df['PAYMENT_HST_1'].astype(str)
#
#             df['status_check'] = 0
#
#             for i in range(len(df)):
#
#                 if (pd.isnull(df['DATE_CLOSED'][i])):
#
#                     if ((df['PAYMENT_HST_1'][i][1:4] == '000') or (df['PAYMENT_HST_1'][i][1:4] == 'XXX') or (
#                             df['PAYMENT_HST_1'][i] == 'nan') or (df['PAYMENT_HST_1'][i] == None) or (
#                             df['PAYMENT_HST_1'][i] == 0) or df['PAYMENT_HST_1'][i][1:4] == ''):
#                         df['status_check'][i] = "Active Non Delinquent"
#                     else:
#                         df['status_check'][i] = "Active Delinquent"
#
#                 else:
#                     df['status_check'][i] = "Closed Loan"
#
#             ###########
#
#             df['DATE_CLOSED'] = (pd.to_datetime(df['DATE_CLOSED']))
#             df['DATE_AC_DISBURSED'] = pd.to_datetime(df['DATE_AC_DISBURSED'])
#
#             start_dates = [i.date() for i in df['DATE_AC_DISBURSED']]
#
#             for j in range(len(df)):
#                 if (pd.isnull(df['DATE_CLOSED'][j])):
#                     df['DATE_CLOSED'][j] = datetime.now()
#                     df['DATE_CLOSED'][j] = df['DATE_CLOSED'][j].date()
#                 else:
#                     df['DATE_CLOSED'][j] = df['DATE_CLOSED'][j].date()
#
#             dfsecured = df[df['security_status'] == 'secured']
#             dfunsecured = df[df['security_status'] == 'unsecured']
#
#             amt1 = dfsecured['HIGH_CREDIT_AMOUNT']
#             start_dates1 = dfsecured['DATE_AC_DISBURSED']
#             end_dates1 = dfsecured['DATE_CLOSED']
#             types1 = dfsecured['status_check']
#
#             amt2 = dfunsecured['HIGH_CREDIT_AMOUNT']
#             start_dates2 = dfunsecured['DATE_AC_DISBURSED']
#             end_dates2 = dfunsecured['DATE_CLOSED']
#             types2 = dfunsecured['status_check']
#
#             # df_chart1 = pd.DataFrame(
#             #     {'Task': amt1, 'Start': start_dates1, 'Finish': end_dates1, 'Resource': types1})
#             # df_chart2 = pd.DataFrame(
#             #     {'Task': amt2, 'Start': start_dates2, 'Finish': end_dates2, 'Resource': types2})
#             # colors = {
#             #     "Active Non Delinquent": 'rgb(0, 255, 100)',
#             #     "Active Delinquent": 'rgb(255, 0, 0)',
#             #     "Closed Loan": 'rgb(255, 191, 0)',
#             # }
#             # fig1 = go.Figure()
#             # for i, row in df_chart1.iterrows():
#             #     fig1.add_trace(
#             #         go.Bar(
#             #             x=[(row['Start'], row['Finish'])],
#             #             y=[row['Resource']],
#             #             base=row['Task'],
#             #             name=row['Task'],
#             #             orientation='h',
#             #             marker=dict(color=colors[row['Resource']]),
#             #         )
#             #     )
#             # fig1.update_xaxes(tickformat='%Y')
#
#             # # Set showlegend=True to show the legend
#             # fig1.update_layout(showlegend=True)
#
#             # # Set the legend's position below the graph
#             # fig1.update_layout(legend=dict(orientation='h', y=-0.2))
#
#             # # Add Y-axis label
#             # fig1.update_layout(yaxis_title='Disbursed Amount')
#
#             # # Remove the timeline navigator
#             # fig1.update_layout(xaxis_rangeslider_visible=False)
#
#             # # Set the title
#             # fig1.update_layout(title='Secured Loan Timeline')
#
#             # # Save the plot as an image
#             # plotly.io.write_image(
#             #     fig1, r'C:\Users\hardik\Documents\GitHub\Nischay_28-03-2023\frontend\staticfiles\plotly_chart.png')
#
#             df_chart1 = pd.DataFrame()
#             df_chart1['Task'] = amt1.apply(
#                 lambda x: format_currency(x, 'INR', locale='en_IN').replace('₹', ''))
#             df_chart1['Start'] = start_dates1
#             df_chart1['Finish'] = end_dates1
#             df_chart1['Resource'] = types1
#             colors = {"Active Non Delinquent": 'rgb(112, 173, 71)',
#                       "Active Delinquent": 'rgb(255,0,0)',
#                       "Closed Loan": 'rgb(255, 192, 0)'}
#
#             df_chart2 = pd.DataFrame()
#             df_chart2['Task'] = amt2.apply(
#                 lambda x: format_currency(x, 'INR', locale='en_IN').replace('₹', ''))
#             df_chart2['Start'] = start_dates2
#             df_chart2['Finish'] = end_dates2
#             df_chart2['Resource'] = types2
#             colors = {"Active Non Delinquent": 'rgb(112, 173, 71)',
#                       "Active Delinquent": 'rgb(255,0,0)',
#                       "Closed Loan": 'rgb(255, 192, 0)'}
#
#             fig1 = ff.create_gantt(df_chart1, index_col='Resource', colors=colors,
#                                    showgrid_x=True, showgrid_y=False, title='Secured Loan Timeline',
#                                    show_colorbar=True, bar_width=0.25, )
#             fig1['layout']['title']['x'] = 0.5
#             fig1['layout']['title']['xanchor'] = 'center'
#             fig1.layout.xaxis.tickformat = '%Y'
#             fig1.update_layout(showlegend=True, font=dict(
#                 color='black',
#
#             ))
#             fig1.update_layout(yaxis_title='Disbursed Amount (₹)')
#             fig1.update_layout(xaxis_rangeslider_visible=False)
#
# # Set the legend's position below the graph
#             fig1.update_layout(legend=dict(orientation='h', y=-0.1))
#
#             plotly.io.write_image(
#                 fig1, r'C:\Users\hardik\Documents\GitHub\Nischay_28-03-2023\frontend\staticfiles\plotly_chart.png')
#
#             fig2 = ff.create_gantt(df_chart2, index_col='Resource', colors=colors,
#                                    showgrid_x=True, showgrid_y=False, title='Unsecured Loan Timeline',
#                                    show_colorbar=True, bar_width=0.25, )
#             fig2.update_layout(
#                 title_text='Unsecured Loan Timeline',
#                 title_x=0.5,
#                 title_xanchor='center',
#                 font=dict(
#                     color='black'
#                 ),
#
#             )
#             fig2.layout.xaxis.tickformat = '%Y'
#             fig2.update_layout(showlegend=True)
#
# # Set the legend's position below the graph
#             fig2.update_layout(legend=dict(orientation='h', y=-0.1))
#             fig2.update_layout(xaxis_rangeslider_visible=False)
#             fig2.update_layout(yaxis_title='Disbursed Amount (₹)')
#             plotly.io.write_image(
#                 fig2, r'C:\Users\hardik\Documents\GitHub\Nischay_28-03-2023\frontend\staticfiles\plotly_chart2.png')

        KPI = bureau_cust_kpi(bureau_ref_dtl, bureau_score_segment, bureau_account_segment_tl,
                              bureau_enquiry_segment_iq, bureau_address_segment, customer_id, deal_id, bureau_automated)
        # print(type(KPI))

        if type(KPI) is not type(None):

            data = KPI[0]
            # print(data)
            data1 = KPI[1]
            data2 = KPI[2]
            data3 = KPI[3]
            data4 = KPI[4]
            # gantt_chart_loan_timeline(bureau_account_segment_tl)

            # print('data', data)
            specifics = data[data['source'] == 'cibil']

            # print(specifics['sum_of_current_balance_of_secured_active_loans'])
            specifics = specifics.drop_duplicates().reset_index(drop=True)
            # specifics = specifics[3:]

            specifics = specifics.fillna(0)

            try:
                specifics['last_reported_address_date'] = specifics['last_reported_address_date'].apply(
                    lambda x: x.strftime('%d/%m/%Y'))
            except:
                pass

            try:
                specifics['largest_loan_type'] = specifics['largest_active_loan'].apply(
                    lambda x: x.split('of')[0])
                specifics['largest_loan_amount'] = specifics['largest_active_loan'].apply(
                    lambda x: x.split('of')[1].split('in')[0])
            except:
                pass
            try:
                specifics['smallest_loan_type'] = specifics['smallest_active_loan'].apply(
                    lambda x: x.split('of')[0])
                specifics['smallest_loan_amount'] = specifics['smallest_active_loan'].apply(
                    lambda x: x.split('of')[1].split('in')[0])
            except:
                pass
            try:
                specifics['largest_closed_loan_type'] = specifics['largest_closed_loan'].apply(
                    lambda x: x.split('of')[0])
                specifics['largest_closed_loan_amount'] = specifics['largest_closed_loan'].apply(
                    lambda x: x.split('of')[1].split('in')[0])
            except:
                pass
            try:
                specifics['oldest_loan_disbursed_type'] = specifics['oldest_loan_disbursed'].apply(
                    lambda x: x.split('of')[0])
                specifics['oldest_loan_disbursed_amount'] = specifics['oldest_loan_disbursed'].apply(
                    lambda x: x.split('of')[1].split(',')[0])
            except:
                pass
            try:
                specifics['last_closed_loan_type'] = specifics['last_closed_loan'].apply(
                    lambda x: x.split('of')[0])
                specifics['last_closed_loan_amount'] = specifics['last_closed_loan'].apply(
                    lambda x: x.split('of')[1].split(',')[0])
            except:
                pass
            try:
                specifics['last_disbursed_loan_type'] = specifics['last_disbursed_loan'].apply(
                    lambda x: x.split('of')[0])
                specifics['last_disbursed_loan_amount'] = specifics['last_disbursed_loan'].apply(
                    lambda x: x.split('of')[1].split(',')[0])
            except:
                pass
            try:
                specifics['last_disbursed_cc_od_loan_type'] = specifics['last_disbursed_cc/od_loan'].apply(
                    lambda x: x.split('of')[0])
                specifics['last_disbursed_cc_od_loan_amount'] = specifics['last_disbursed_cc/od_loan'].apply(
                    lambda x: x.split('of')[1].split(',')[0])
            except:
                specifics['last_disbursed_cc_od_loan_type'] = 'Not available'
            try:
                specifics['largest_loan_amount'] = specifics['largest_loan_amount'].astype(
                    'float')
                specifics['largest_loan_amount'] = specifics['largest_loan_amount'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                specifics['largest_loan_amount'] = specifics['largest_loan_amount'].apply(
                    lambda x: str(x).split('.')[0])
            except:
                pass
            try:
                specifics['smallest_loan_amount'] = specifics['smallest_loan_amount'].astype(
                    'float')
                specifics['smallest_loan_amount'] = specifics['smallest_loan_amount'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                specifics['smallest_loan_amount'] = specifics['smallest_loan_amount'].apply(
                    lambda x: str(x).split('.')[0])
            except:
                pass
            try:
                specifics['largest_closed_loan_amount'] = specifics['largest_closed_loan_amount'].astype(
                    'float')
                specifics['largest_closed_loan_amount'] = specifics['largest_closed_loan_amount'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                specifics['largest_closed_loan_amount'] = specifics['largest_closed_loan_amount'].apply(
                    lambda x: str(x).split('.')[0])
            except:
                pass
            try:
                specifics['max_credit_limit_of_active_cc_od'] = specifics['max_credit_limit_of_active_cc_od'].astype(
                    'float')
                specifics['max_credit_limit_of_active_cc_od'] = specifics['max_credit_limit_of_active_cc_od'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                specifics['max_credit_limit_of_active_cc_od'] = specifics['max_credit_limit_of_active_cc_od'].apply(
                    lambda x: str(x).split('.')[0])
            except:
                pass
            try:
                specifics['total_credit_limit_of_active_cc_od'] = specifics[
                    'total_credit_limit_of_active_cc_od'].astype('float')
                specifics['total_credit_limit_of_active_cc_od'] = specifics['total_credit_limit_of_active_cc_od'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                specifics['total_credit_limit_of_active_cc_od'] = specifics['total_credit_limit_of_active_cc_od'].apply(
                    lambda x: str(x).split('.')[0])
            except:
                pass
            try:
                specifics['total_current_balance_of_active_cc_od'] = specifics[
                    'total_current_balance_of_active_cc_od'].astype('float')
                specifics['total_current_balance_of_active_cc_od'] = specifics[
                    'total_current_balance_of_active_cc_od'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                specifics['total_current_balance_of_active_cc_od'] = specifics[
                    'total_current_balance_of_active_cc_od'].apply(lambda x: str(x).split('.')[0])
            except:
                pass
            try:
                specifics['credit_utilization_ratio'] = specifics['credit_utilization_ratio'].apply(
                    lambda x: round(float(x), 2))
            except:
                pass
            try:
                specifics['sum_of_current_balance_of_unsecured_active_loans'] = specifics[
                    'sum_of_current_balance_of_unsecured_active_loans'].astype('float')
                specifics['sum_of_current_balance_of_secured_active_loans'] = specifics[
                    'sum_of_current_balance_of_secured_active_loans'].astype('float')
            except:
                pass
            try:
                specifics['current_balance_active'] = specifics['sum_of_current_balance_of_unsecured_active_loans'] + \
                    specifics['sum_of_current_balance_of_secured_active_loans']
                specifics['current_balance_active'] = specifics['current_balance_active'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                specifics['current_balance_active'] = specifics['current_balance_active'].apply(
                    lambda x: str(x).split('.')[0])
            except:
                pass

            specifics['sum_of_emi_of_active_loans'] = specifics['sum_of_emi_of_active_loans'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            specifics['sum_of_emi_of_active_loans'] = specifics['sum_of_emi_of_active_loans'].apply(
                lambda x: str(x).split('.')[0])
            try:
                specifics['max_emi_of_active_loans'] = specifics['max_emi_of_active_loans'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
            except:
                specifics['max_emi_of_active_loans'] = "NR"
            specifics['max_emi_of_active_loans'] = specifics['max_emi_of_active_loans'].apply(
                lambda x: str(x).split('.')[0])
            try:
                specifics['min_emi_of_active_loans'] = specifics['min_emi_of_active_loans'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
            except:
                specifics['min_emi_of_active_loans'] = "NR"
            specifics['min_emi_of_active_loans'] = specifics['min_emi_of_active_loans'].apply(
                lambda x: str(x).split('.')[0])

            specifics['sum_of_current_balance_of_secured_active_loans'] = specifics[
                'sum_of_current_balance_of_secured_active_loans'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            specifics['sum_of_current_balance_of_secured_active_loans'] = specifics[
                'sum_of_current_balance_of_secured_active_loans'].apply(lambda x: str(x).split('.')[0])

            specifics['sum_of_current_balance_of_unsecured_active_loans'] = specifics[
                'sum_of_current_balance_of_unsecured_active_loans'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            specifics['sum_of_current_balance_of_unsecured_active_loans'] = specifics[
                'sum_of_current_balance_of_unsecured_active_loans'].apply(lambda x: str(x).split('.')[0])

            specifics['oldest_loan_disbursed_amount'] = specifics['oldest_loan_disbursed_amount'].astype(
                'float')
            specifics['oldest_loan_disbursed_amount'] = specifics['oldest_loan_disbursed_amount'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            specifics['oldest_loan_disbursed_amount'] = specifics['oldest_loan_disbursed_amount'].apply(
                lambda x: str(x).split('.')[0])

            specifics['oldest_loan_disbursed_year'] = specifics['oldest_loan_disbursed'].apply(
                lambda x: x.split(',')[1])
            try:
                specifics['last_closed_loan_year'] = specifics['last_closed_loan'].apply(
                    lambda x: x.split(',')[1])
            except:
                specifics['last_closed_loan_year'] = 'Not Available'
            try:
                specifics['last_disbursed_cc_od_loan_year'] = specifics['last_disbursed_cc/od_loan'].apply(
                    lambda x: x.split(',')[1])
                specifics['last_disbursed_loan_year'] = specifics['last_disbursed_loan'].apply(
                    lambda x: x.split(',')[1])
            except:
                specifics['last_disbursed_cc_od_loan_year'] = 'Not available'
                specifics['last_disbursed_loan_year'] = 'Not available'

            try:
                specifics['last_closed_loan_amount'] = specifics['last_closed_loan_amount'].astype(
                    'float')
                specifics['last_closed_loan_amount'] = specifics['last_closed_loan_amount'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                specifics['last_closed_loan_amount'] = specifics['last_closed_loan_amount'].apply(
                    lambda x: str(x).split('.')[0])
            except:
                specifics['last_closed_loan_amount'] = 'Not Available'
            specifics['last_disbursed_loan_amount'] = specifics['last_disbursed_loan_amount'].astype(
                'float')
            specifics['last_disbursed_loan_amount'] = specifics['last_disbursed_loan_amount'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            specifics['last_disbursed_loan_amount'] = specifics['last_disbursed_loan_amount'].apply(
                lambda x: str(x).split('.')[0])

            try:
                specifics['last_disbursed_cc_od_loan_amount'] = specifics['last_disbursed_cc_od_loan_amount'].astype(
                    'float')
                specifics['last_disbursed_cc_od_loan_amount'] = specifics['last_disbursed_cc_od_loan_amount'].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                specifics['last_disbursed_cc_od_loan_amount'] = specifics['last_disbursed_cc_od_loan_amount'].apply(
                    lambda x: str(x).split('.')[0])
            except:
                specifics['last_disbursed_cc_od_loan_amount'] = 'Not available'
            specifics['number_of_closed_accounts'] = specifics['number_of_closed_accounts'].astype(
                'int')
            specifics['number_of_inquiries_in_last_6_month'] = specifics['number_of_inquiries_in_last_6_month'].astype(
                'int')

            specifics['last_inquiry_amount'] = specifics['last_inquiry'].apply(
                lambda x: x.split('for')[0])
            specifics['last_inquiry_type'] = specifics['last_inquiry'].apply(
                lambda x: x.split('for')[1].split('of')[0])
            specifics['last_inquiry_year'] = specifics['last_inquiry'].apply(
                lambda x: x.split('of')[1])

            specifics['last_inquiry_amount'] = specifics['last_inquiry_amount'].astype(
                'float')
            specifics['last_inquiry_amount'] = specifics['last_inquiry_amount'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            specifics['last_inquiry_amount'] = specifics['last_inquiry_amount'].apply(
                lambda x: str(x).split('.')[0])

            ################# Varibales initiated #######not present in bureau_c_k python code################

            specifics['age'] = specifics['age'].astype('int')
            specifics['last_reported_phone_no'] = 'Not available'
            specifics['total_written_off_amount'] = 'Not available'
            specifics['marital_status'] = 'Not available'
            specifics['number_of_written_off_accounts'] = specifics['number_of_written_off_accounts'].astype(
                'int')

            # specifics.to_csv(r"D:\test.csv")

            specifics1 = data1[data1['source'] == 'cibil']

            specifics1 = specifics1.drop_duplicates().reset_index(drop=True)
            specifics1 = specifics1[8:]
            specifics1 = specifics1.fillna(0)
            try:
                unsecuremax = specifics[0]['unsecured_max_dpd_status'][0:-12]
            except:
                pass
            try:
                securemax = specifics[0]['secured_max_dpd_status'][0:-12]
            except:
                pass
            try:
                unsecurelatestYear = specifics[0]['unsecured_last_dpd_status'][-4:]
            except:
                pass
            try:
                securelatestYear = specifics[0]['secured_last_dpd_status'][-4:]
            except:
                pass

            specifics = specifics[0:]
            json_records = specifics.reset_index().to_json(orient='records')
            specifics = json.loads(json_records)

            json_records = specifics1.reset_index().to_json(orient='records')
            specifics1 = json.loads(json_records)

            json_records = data.reset_index().to_json(orient='records')
            data = json.loads(json_records)

            json_records = data1.reset_index().to_json(orient='records')
            data1 = json.loads(json_records)

            json_records = data2.reset_index().to_json(orient='records')
            data2 = json.loads(json_records)

            json_records = data3.reset_index().to_json(orient='records')
            data3 = json.loads(json_records)

            json_records = data4.reset_index().to_json(orient='records')
            data4 = json.loads(json_records)

            try:

                if (int(unsecurelatestYear) > int(securelatestYear)):
                    latest = specifics[0]['unsecured_last_dpd_status'].split(
                        ',')
                if (int(unsecurelatestYear) < int(securelatestYear)):
                    latest = specifics[0]['secured_last_dpd_status'].split(',')
                if (int(securelatestYear) == int(unsecurelatestYear)):
                    securelatestMonth = specifics[0]['unsecured_last_dpd_status'][-8:-5]
                    unsecurelatestMonth = specifics[0]['unsecured_last_dpd_status'][-8:-5]
                    if securelatestMonth == "Jan":
                        securelatestMonth = 1
                    if securelatestMonth == "Feb":
                        securelatestMonth = 2
                    if securelatestMonth == "Mar":
                        securelatestMonth = 3
                    if securelatestMonth == "Apr":
                        securelatestMonth = 4
                    if securelatestMonth == "May":
                        securelatestMonth = 5
                    if securelatestMonth == "Jun":
                        securelatestMonth = 6
                    if securelatestMonth == "Jul":
                        securelatestMonth = 7
                    if securelatestMonth == "Aug":
                        securelatestMonth = 8
                    if securelatestMonth == "Sep":
                        securelatestMonth = 9
                    if securelatestMonth == "Oct":
                        securelatestMonth = 10
                    if securelatestMonth == "Nov":
                        securelatestMonth = 11
                    if securelatestMonth == "Dec":
                        securelatestMonth = 12

                    if unsecurelatestMonth == "Jan":
                        unsecurelatestMonth = 1
                    if unsecurelatestMonth == "Feb":
                        unsecurelatestMonth = 2
                    if unsecurelatestMonth == "Mar":
                        unsecurelatestMonth = 3
                    if unsecurelatestMonth == "Apr":
                        unsecurelatestMonth = 4
                    if unsecurelatestMonth == "May":
                        unsecurelatestMonth = 5
                    if unsecurelatestMonth == "Jun":
                        unsecurelatestMonth = 6
                    if unsecurelatestMonth == "Jul":
                        unsecurelatestMonth = 7
                    if unsecurelatestMonth == "Aug":
                        unsecurelatestMonth = 8
                    if unsecurelatestMonth == "Sep":
                        unsecurelatestMonth = 9
                    if unsecurelatestMonth == "Oct":
                        unsecurelatestMonth = 10
                    if unsecurelatestMonth == "Nov":
                        unsecurelatestMonth = 11
                    if unsecurelatestMonth == "Dec":
                        unsecurelatestMonth = 12
                    if (int(unsecurelatestMonth) > int(securelatestMonth)):
                        latest = specifics[0]['unsecured_last_dpd_status'].split(
                            ',')
                    else:
                        latest = specifics[0]['secured_last_dpd_status'].split(
                            ',')

                if (int(unsecuremax) > int(securemax)):
                    max1 = specifics[0]['unsecured_max_dpd_status'].split(',')
                else:
                    max1 = specifics[0]['secured_max_dpd_status'].split(',')
            except:
                pass
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT count(CUSTOMER_ID) as No_Of_Address FROM mysite_bureau_address_segment WHERE CUSTOMER_ID = " + customer_id + " GROUP BY ADDRESS_1,ADDRESS_2,ADDRESS_3,ADDRESS_4,ADDRESS_5,source" + ";")
                No_Of_Address = dictfetchall(cursor)

            No_Of_Address = len(No_Of_Address)
            latest = ''
            max1 = ''

            return HttpResponse(
                json.dumps({'data': data, 'data1': data1, 'data2': data2, 'data3': data3, 'data4': data4,
                            'specifics': specifics, 'specifics1': specifics1, 'latest': latest, 'max1': max1,
                            'No_Of_Address': No_Of_Address, "customer_id": customer_id}))

    # payload = {"audit_report_page": True, "status": status if status else None, 'data':data, 'data1':data1, 'data2':data2, 'data3':data3, 'bank_return':bank_return, 'bank_return_1':bank_return_1, 'itr_return':itr_return, 'form16_return':form16_return, 'form26as_return':form26as_return, 'emi_debit_table':emi_debit_table,'no_of_statements':no_of_statements}

    #    return render(request, "audit_report.html", payload)

    payload = {"analyze_page": True, "status": status if status else None}
    return render(request, "bureau_c_k.html", payload)


@login_required
def itr(request):
    status = {}
    # print("suahib")
    if "deal_id" not in request.session or "customer_id" not in request.session:
        status["type"] = "deal"
        status["message"] = "Please select a deal first!"

    else:
        customer_id = request.session["customer_id"]

        deal_id = request.session["deal_id"]
        data = ""
        data1 = ""
        data2 = ""
        data6 = ""
        data7 = ""
        fy = ""
        fy1 = ""
        measures = ""
        count_measures = ""
        # print(customer_id)
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM  form26as_parta WHERE CUSTOMER_ID = " + customer_id + ";")
            form26_parta = dictfetchall(cursor)
            form26_parta = pd.DataFrame(form26_parta)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM  form26as_partb WHERE CUSTOMER_ID = " + customer_id + ";")
            form26_partb = dictfetchall(cursor)
            form26_partb = pd.DataFrame(form26_partb)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM  form26as_partg WHERE CUSTOMER_ID = " + customer_id + ";")
            form26_partg = dictfetchall(cursor)
            form26_partg = pd.DataFrame(form26_partg)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM  itrv_itrv WHERE CUSTOMER_ID = " + customer_id + ";")
            itrv = dictfetchall(cursor)
            itrv = pd.DataFrame(itrv)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM  form16_partb WHERE CUSTOMER_ID = " + customer_id + ";")
            form16_partb = dictfetchall(cursor)
            form16_partb = pd.DataFrame(form16_partb)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM  form26as_asseseedetails WHERE CUSTOMER_ID = " + customer_id + ";")
            form26as_asseseedetails = dictfetchall(cursor)
            form26as_asseseedetails = pd.DataFrame(form26as_asseseedetails)

        KPI1 = itr_display345(form26_parta, form26_partb,
                              form26as_asseseedetails)

        # print(KPI1)
        data = KPI1[0]
        # print("XXX")
        try:
            data['April'] = data['April'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            data['April'] = data['April'].astype(
                str).apply(lambda x: x.split('.')[0])
            data['May'] = data['May'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            data['May'] = data['May'].astype(
                str).apply(lambda x: x.split('.')[0])
            data['June'] = data['June'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            data['June'] = data['June'].astype(
                str).apply(lambda x: x.split('.')[0])
            data['July'] = data['July'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            data['July'] = data['July'].astype(
                str).apply(lambda x: x.split('.')[0])
            data['August'] = data['August'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            data['August'] = data['August'].astype(
                str).apply(lambda x: x.split('.')[0])
            data['September'] = data['September'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            data['September'] = data['September'].astype(
                str).apply(lambda x: x.split('.')[0])
            data['October'] = data['October'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            data['October'] = data['October'].astype(
                str).apply(lambda x: x.split('.')[0])
            data['November'] = data['November'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            data['November'] = data['November'].astype(
                str).apply(lambda x: x.split('.')[0])
            data['December'] = data['December'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            data['December'] = data['December'].astype(
                str).apply(lambda x: x.split('.')[0])
            data['January'] = data['January'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            data['January'] = data['January'].astype(
                str).apply(lambda x: x.split('.')[0])
            data['February'] = data['February'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            data['February'] = data['February'].astype(
                str).apply(lambda x: x.split('.')[0])
            data['March'] = data['March'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            data['March'] = data['March'].astype(
                str).apply(lambda x: x.split('.')[0])

            json_records = data.to_json(orient='records')
            data = json.loads(json_records)
        except:
            pass
        try:
            data1 = KPI1[1].transpose()
            for i in range(1, len(data1)):
                data1.iloc[i] = data1.iloc[i].apply(
                    lambda x: format_currency(x, 'INR', locale='en_IN'))
                data1.iloc[i] = data1.iloc[i].astype(
                    str).apply(lambda x: x.split('.')[0])

                data1.columns = data1.iloc[0]
                data1 = data1.iloc[1:]

                data1 = data1.rename(columns={'Income from investment': 'Income_from_investment',
                                              'Income from contracting': 'Income_from_contracting',
                                              'Income from abroad': 'Income_from_abroad',
                                              'Orignal investment(principal) withdrawal': 'Orignal_investment_principal_withdrawal',
                                              'Sale of property': 'Sale_of_property',
                                              'Income from tech. professional services': 'Income_from_tech_professional_services',
                                              'Income from commission': 'Income_from_commission',
                                              'Collection at source': 'Collection_at_source'})
                # print(data1)

                json_records = data1.to_json(orient='records')
                data1 = json.loads(json_records)
        except:
            pass
        try:
            KPI1[2]['total_amount_x'] = KPI1[2]['total_amount_x'].fillna(0)
            KPI1[2]['total_amount_x'] = KPI1[2]['total_amount_x'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            KPI1[2]['total_amount_x'] = KPI1[2]['total_amount_x'].astype(
                str).apply(lambda x: x.split('.')[0])
            KPI1[2]['total_amount_x'] = KPI1[2]['total_amount_x'].replace(
                '₹0', '-')

            KPI1[2]['no_of_transactions_x'] = KPI1[2]['no_of_transactions_x'].fillna(
                0)
            KPI1[2]['no_of_transactions_x'] = KPI1[2]['no_of_transactions_x'].astype(
                'int64')
            KPI1[2]['no_of_transactions_x'] = KPI1[2]['no_of_transactions_x'].replace(
                0, '-')

            KPI1[2]['total_amount_y'] = KPI1[2]['total_amount_y'].fillna(0)
            KPI1[2]['total_amount_y'] = KPI1[2]['total_amount_y'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            KPI1[2]['total_amount_y'] = KPI1[2]['total_amount_y'].astype(
                str).apply(lambda x: x.split('.')[0])
            KPI1[2]['total_amount_y'] = KPI1[2]['total_amount_y'].replace(
                '₹0', '-')

            KPI1[2]['no_of_transactions_y'] = KPI1[2]['no_of_transactions_y'].fillna(
                0)
            KPI1[2]['no_of_transactions_y'] = KPI1[2]['no_of_transactions_y'].astype(
                'int64')
            KPI1[2]['no_of_transactions_y'] = KPI1[2]['no_of_transactions_y'].replace(
                0, '-')

            KPI1[2]['total_amount'] = KPI1[2]['total_amount'].fillna(0)
            KPI1[2]['total_amount'] = KPI1[2]['total_amount'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            KPI1[2]['total_amount'] = KPI1[2]['total_amount'].astype(
                str).apply(lambda x: x.split('.')[0])
            KPI1[2]['total_amount'] = KPI1[2]['total_amount'].replace(
                '₹0', '-')

            KPI1[2]['no_of_transactions'] = KPI1[2]['no_of_transactions'].fillna(
                0)
            KPI1[2]['no_of_transactions'] = KPI1[2]['no_of_transactions'].astype(
                'int64')
            KPI1[2]['no_of_transactions'] = KPI1[2]['no_of_transactions'].replace(
                0, '-')

            json_records = KPI1[2].to_json(orient='records')
            data2 = json.loads(json_records)
        except:
            pass
        try:
            fy = KPI1[0]['Financial_Year'].unique()
            fy1 = list(fy)
            if len(fy) == 1:
                fy1.append('-')
                fy1.append('-')
            elif len(fy) == 2:
                fy1.append('-')

            measures = KPI1[0].Measures.unique()

            count_measures = range(1, KPI1[0].Measures.nunique())
        except:
            pass
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM  form16_info WHERE CUSTOMER_ID = " + customer_id + ";")
                form16_info = dictfetchall(cursor)

                pd.set_option('display.max_colwidth', None)

                form16_info = pd.DataFrame(form16_info)
                data6 = itr2(form16_info)
                json_records = data6.to_json(orient='records')
                data6 = json.loads(json_records)
        except:
            pass
            # print(form16_info['employer_address'])

        try:
            KPI2 = itr_display1(form26_parta, form16_partb, form26_partg, itrv)
            print(type(KPI2))
            KPI2['Gross_Income'] = KPI2['Gross_Income'].apply(
                lambda x: format_currency(round(float(x)), 'INR', locale='en_IN'))
            KPI2['Gross_Income'] = KPI2['Gross_Income'].astype(
                str).apply(lambda x: x.split('.')[0])
            KPI2['Total_Deductions'] = KPI2['Total_Deductions'].apply(
                lambda x: format_currency(round(float(x)), 'INR', locale='en_IN'))
            KPI2['Total_Deductions'] = KPI2['Total_Deductions'].astype(
                str).apply(lambda x: x.split('.')[0])
        except:
            pass
        try:
            KPI2['Average_Monthly_Gross_Income'] = KPI2['Average_Monthly_Gross_Income'].apply(
                lambda x: format_currency(round(float(x)), 'INR', locale='en_IN'))
            KPI2['Average_Monthly_Gross_Income'] = KPI2['Average_Monthly_Gross_Income'].astype(str).apply(
                lambda x: x.split('.')[0])

            KPI2['Taxable_Income'] = KPI2['Taxable_Income'].apply(
                lambda x: format_currency(round(float(x)), 'INR', locale='en_IN'))
            KPI2['Taxable_Income'] = KPI2['Taxable_Income'].astype(
                str).apply(lambda x: x.split('.')[0])

            KPI2['HRA'] = KPI2['HRA'].apply(lambda x: format_currency(
                round(float(x)), 'INR', locale='en_IN'))
            KPI2['HRA'] = KPI2['HRA'].astype(
                str).apply(lambda x: x.split('.')[0])

            KPI2['Rent_Income'] = KPI2['Rent_Income'].apply(
                lambda x: format_currency(round(float(x)), 'INR', locale='en_IN'))
            KPI2['Rent_Income'] = KPI2['Rent_Income'].astype(
                str).apply(lambda x: x.split('.')[0])

            KPI2['80C'] = KPI2['80C'].apply(lambda x: format_currency(
                round(float(x)), 'INR', locale='en_IN'))
            KPI2['80C'] = KPI2['80C'].astype(
                str).apply(lambda x: x.split('.')[0])

            KPI2['80CCC'] = KPI2['80CCC'].apply(
                lambda x: format_currency(round(float(x)), 'INR', locale='en_IN'))
            KPI2['80CCC'] = KPI2['80CCC'].astype(
                str).apply(lambda x: x.split('.')[0])

            KPI2['80D'] = KPI2['80D'].apply(lambda x: format_currency(
                round(float(x)), 'INR', locale='en_IN'))
            KPI2['80D'] = KPI2['80D'].astype(
                str).apply(lambda x: x.split('.')[0])

            KPI2['Other_Deductions'] = KPI2['Other_Deductions'].apply(
                lambda x: format_currency(round(float(x)), 'INR', locale='en_IN'))
            KPI2['Other_Deductions'] = KPI2['Other_Deductions'].astype(
                str).apply(lambda x: x.split('.')[0])
        except:
            pass

        try:
            json_records = KPI2.to_json(orient='records')
            data7 = json.loads(json_records)
        except:
            pass

        return render(request, 'itr.html',
                      {'data': data, 'data1': data1, 'data2': data2, 'data3': fy, 'data4': measures,
                       'data5': count_measures, 'data6': data6, 'data7': data7, 'data8': fy1})
    return render(request, 'itr.html', {})


@login_required
def fishy(request):
    status = {}
    n1 = ""
    n3 = "p"
    print("Getting analyze data.")
    if "deal_id" not in request.session or "customer_id" not in request.session:
        status["type"] = "deal"
        status["message"] = "Please select a deal first!"
        return JsonResponse({"status": "failed"})

    else:
        customer_id = request.session["customer_id"]
        deal_id = request.session["deal_id"]

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT account_number, bank_name, min(txn_date) as from_date, max(txn_date) as to_date  FROM bank_bank WHERE customer_id = " + customer_id + " GROUP BY account_number" + ";")
            data = dictfetchall(cursor)
            for date in data:
                date['from_date'] = date['from_date'].strftime('%d/%m/%Y')
                date['to_date'] = date['to_date'].strftime('%d/%m/%Y')
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT  account_number, transaction_type, min(txn_date) as from_date, max(txn_date) as to_date, sum(case when debit > 0 then 1 else 0 end ) as d_count, sum(case when credit > 0 then 1 else 0 end ) as c_count, sum(credit) as s_credit, sum(debit) as s_debit, min(case when credit = 0 then null else credit end) as min_credit, min(case when debit = 0 then null else debit end) as min_debit, max(credit) as max_credit, max(debit) as max_debit ,  ROUND(AVG(case when credit = 0 then null else credit end),0) as avgcredit, ROUND(AVG(case when debit = 0 then null else debit end),0) as avgdebit from bank_bank   WHERE customer_id = " + customer_id + " group by transaction_type, account_number;")
            data1 = dictfetchall(cursor)
            # print(data1)
            for date in data1:
                date['from_date'] = date['from_date'].strftime('%d/%m/%Y')
                date['to_date'] = date['to_date'].strftime('%d/%m/%Y')

                date['s_credit'] = format_currency(
                    date['s_credit'], 'INR', locale='en_IN')
                date['s_credit'] = date['s_credit'].split('.')[0]

                date['s_debit'] = format_currency(
                    date['s_debit'], 'INR', locale='en_IN')
                date['s_debit'] = date['s_debit'].split('.')[0]

                if date['min_credit'] is None:
                    date['min_credit'] = 0

                if date['min_debit'] is None:
                    date['min_debit'] = 0
                if date['avgcredit'] is None:
                    date['avgcredit'] = 0

                if date['avgdebit'] is None:
                    date['avgdebit'] = 0

                date['min_credit'] = format_currency(
                    int(date['min_credit']), 'INR', locale='en_IN')
                date['min_credit'] = str(date['min_credit']).split('.')[0]

                date['min_debit'] = format_currency(
                    str(date['min_debit']), 'INR', locale='en_IN')
                date['min_debit'] = str(date['min_debit']).split('.')[0]

                date['max_credit'] = format_currency(
                    date['max_credit'], 'INR', locale='en_IN')
                date['max_credit'] = date['max_credit'].split('.')[0]

                date['max_debit'] = format_currency(
                    date['max_debit'], 'INR', locale='en_IN')
                date['max_debit'] = date['max_debit'].split('.')[0]

                date['avgcredit'] = format_currency(
                    date['avgcredit'], 'INR', locale='en_IN')
                date['avgcredit'] = date['avgcredit'].split('.')[0]

                date['avgdebit'] = format_currency(
                    date['avgdebit'], 'INR', locale='en_IN')
                date['avgdebit'] = date['avgdebit'].split('.')[0]

                # print(date['avgcredit']  + "   ss  ss  "  +date['avgdebit'])
        # with connection.cursor() as cursor:
        #     cursor.execute("SELECT entity, account_number, mode, min(txn_date) as from_date, max(txn_date) as to_date, count(debit) as d_count, count(credit) as c_count, sum(credit) as s_credit, sum(debit) as s_debit, min(credit) as min_credit, min(debit) as min_debit, max(credit) as max_credit, max(debit) as max_debit, ROUND(AVG(credit),0) as avgcredit, ROUND(AVG(debit),0) as avgdebit from bank_bank   WHERE customer_id = " + customer_id  + "  group by mode, entity,account_number;")
        #     data2 = dictfetchall(cursor)
        #     for date in data2:
        #         date['from_date'] = date['from_date'].strftime('%d/%m/%Y')
        #         date['to_date'] = date['to_date'].strftime('%d/%m/%Y')
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT transaction_type, account_number,cheque_number,txn_date,debit,credit,balance ,description from bank_bank   WHERE customer_id = " + customer_id + ";")
            data3 = dictfetchall(cursor)
            data3 = pd.DataFrame(data3)
            data3['credit'] = data3['credit'].apply(
                lambda x: x if pd.notnull(x) else 0)
            # data3['credit'] = data3['credit'].apply(lambda x: round(x))
            data3['credit'] = data3['credit'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))

            data3['debit'] = data3['debit'].apply(
                lambda x: x if pd.notnull(x) else 0)
            data3['debit'] = data3['debit'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            data3['balance'] = data3['balance'].apply(
                lambda x: format_currency(x, 'INR', locale='en_IN'))
            # data3['credit'] = data3['credit'].apply(lambda x: str(x).split('.')[0])
            data3['txn_date'] = data3['txn_date'].apply(
                lambda x: x.strftime('%d/%m/%Y'))

            json_records = data3.to_json(orient='records')
            data3 = json.loads(json_records)
            # for date in data3:
            #     date['txn_date'] = date['txn_date'].strftime('%d/%m/%Y')
            #     date['debit']=format_currency(date['debit'], 'INR', locale='en_IN')
            #     # date['debit']=date['debit'].split('.')[0]
            #     # date['credit']=format_currency(date['credit'], 'INR', locale='en_IN')
            #     # date['credit']=date['credit'].split('.')[0]
            #     date['balance']=format_currency(date['balance'], 'INR', locale='en_IN')
            #     # date['balance']=date['balance'].split('.')[0]
    return render(request, "fishy.html", {'data': data, 'data1': data1, 'data3': data3})


def bank_entity(request):
    # cid = request.GET.get('cid')
    lead_id = ''
    lead_id = lead_id.join(request.POST.getlist('leadID'))
    lead_id = lead_id.rstrip()

    entity = ''
    entity = entity.join(request.POST.getlist('entity'))
    entity = entity.rstrip()

    accno = ''
    accno = accno.join(request.POST.getlist('account_number'))
    accno = accno.rstrip()

    # entity=

    # entity = request.GET.get('entity')
    # accno = request.GET.get('accno')
    # accno = "'%" + accno + "%'"

    with connection.cursor() as cursor:

        cursor.execute(
            "SELECT * FROM a5_kit.mysite_bank_bank ")
        data = dictfetchall(cursor)
        data = pd.DataFrame(data)

        filtered_data = data[data['lead_id'] == lead_id]
        filtered_data = filtered_data[filtered_data['account_number'] == accno]
        entity = entity.strip()
        filtered_data = filtered_data[filtered_data['entity'] == entity]

        data = filtered_data

        try:
            data['txn_date'] = data['txn_date'].apply(
                lambda x: x.strftime('%d/%m/%Y'))
        except Exception as e:
            entity = "%" + entity + "%"
            cursor.execute(
                "SELECT * FROM bank_bank WHERE customer_id=" + cid + " and account_number like " + accno + " and entity like '" + entity + "';")
            data = dictfetchall(cursor)
            data = pd.DataFrame(data)
            data['txn_date'] = data['txn_date'].apply(
                lambda x: x.strftime('%d/%m/%Y'))

        data['debit'] = data['debit'].fillna(0)
        data['debit'] = data['debit'].apply(
            lambda x: format_currency(x, 'INR', locale='en_IN'))

        data['credit'] = data['credit'].fillna(0)
        data['credit'] = data['credit'].apply(
            lambda x: format_currency(x, 'INR', locale='en_IN'))

        data['balance'] = data['balance'].fillna(0)
        data['balance'] = data['balance'].apply(
            lambda x: format_currency(x, 'INR', locale='en_IN'))

        json_records = data.to_json(orient='records')
        data = json.loads(json_records)
        # json_records = filtered_data.to_json(orient='records')
        # data = json.loads(json_records)
        # data3 = data.to_dict('split')
        pydict = json.dumps([data])
        return HttpResponse(pydict)

        # return render(request, "bank_entity.html", {'entity': data})


def bank_entity_kpi(request):
    n4 = "p"
    z = ""

    if request.method == "POST":
        lead_id = ''
        lead_id = lead_id.join(request.POST.getlist('leadID'))
        lead_id = lead_id.rstrip()

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT account_number, bank_name, min(txn_date) as from_date, max(txn_date) as to_date, COUNT(DISTINCT(entity)) as num_entities  FROM mysite_bank_bank WHERE lead_id = " + lead_id + " GROUP BY account_number " + ";")
            data = dictfetchall(cursor)
            # print(data)
            for date in data:
                date['from_date'] = date['from_date'].strftime('%d/%m/%Y')
                date['to_date'] = date['to_date'].strftime('%d/%m/%Y')

        if request.method == "POST":
            n = request.POST.get('optbank')
            z = n
            n4 = "q"

            if n is not None:
                n1 = n[1:-1]

                n = "'%" + n[1:-1] + "%'"
                # print(n)
                with connection.cursor() as cursor1:
                    cursor1.execute(
                        "SELECT * FROM mysite_bank_bank WHERE account_number like " + n + ";")
                    data1 = dictfetchall(cursor1)
                    data1 = pd.DataFrame(data1)
                    data1 = data1[data1['lead_id'] == lead_id]

                    KPI = bek(data1)

                    KPI['debits'] = KPI['debits'].fillna(0)
                    KPI['debits'] = KPI['debits'].astype('int64')
                    KPI['credits'] = KPI['credits'].fillna(0)
                    KPI['credits'] = KPI['credits'].astype('int64')

                    KPI['debited_amt_total'] = KPI['debited_amt_total'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['debited_amt_total'] = KPI['debited_amt_total'].apply(
                        lambda x: round(x))
                    KPI['debited_amt_total'] = KPI['debited_amt_total'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['debited_amt_total'] = KPI['debited_amt_total'].apply(
                        lambda x: str(x).split('.')[0])

                    # KPI['credited_amt_total'] = KPI['credited_amt_total'].apply(lambda x: round(x) if pd.notnull(x) else 0)
                    # KPI['credited_amt_total'] = KPI['credited_amt_total'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['credited_amt_total'] = KPI['credited_amt_total'].apply(lambda x: str(x).split('.')[0])

                    KPI['credited_amt_total'] = KPI['credited_amt_total'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['credited_amt_total'] = KPI['credited_amt_total'].apply(
                        lambda x: round(x))
                    KPI['credited_amt_total'] = KPI['credited_amt_total'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['credited_amt_total'] = KPI['credited_amt_total'].apply(
                        lambda x: str(x).split('.')[0])

                    # KPI['max_debit'] = KPI['max_debit'].apply(lambda x: round(x) if pd.notnull(x) else 0)
                    # KPI['max_debit'] = KPI['max_debit'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['max_debit'] = KPI['max_debit'].apply(lambda x: str(x).split('.')[0])

                    KPI['max_debit'] = KPI['max_debit'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['max_debit'] = KPI['max_debit'].apply(
                        lambda x: round(x))
                    KPI['max_debit'] = KPI['max_debit'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['max_debit'] = KPI['max_debit'].apply(
                        lambda x: str(x).split('.')[0])

                    # KPI['max_credit'] = KPI['max_credit'].apply(lambda x: round(x) if pd.notnull(x) else 0)
                    # KPI['max_credit'] = KPI['max_credit'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['max_credit'] = KPI['max_credit'].apply(lambda x: str(x).split('.')[0])

                    KPI['max_credit'] = KPI['max_credit'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['max_credit'] = KPI['max_credit'].apply(
                        lambda x: round(x))
                    KPI['max_credit'] = KPI['max_credit'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['max_credit'] = KPI['max_credit'].apply(
                        lambda x: str(x).split('.')[0])

                    # KPI['min_credit'] = KPI['min_credit'].apply(lambda x: round(x) if pd.notnull(x) else 0)
                    # KPI['min_credit'] = KPI['min_credit'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['min_credit'] = KPI['min_credit'].apply(lambda x: str(x).split('.')[0])

                    KPI['min_credit'] = KPI['min_credit'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['min_credit'] = KPI['min_credit'].apply(
                        lambda x: round(x))
                    KPI['min_credit'] = KPI['min_credit'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['min_credit'] = KPI['min_credit'].apply(
                        lambda x: str(x).split('.')[0])

                    # KPI['min_debit'] = KPI['min_debit'].apply(lambda x: round(x) if pd.notnull(x) else 0)
                    # KPI['min_debit'] = KPI['min_debit'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['min_debit'] = KPI['min_debit'].apply(lambda x: str(x).split('.')[0])

                    KPI['min_debit'] = KPI['min_debit'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['min_debit'] = KPI['min_debit'].apply(
                        lambda x: round(x))
                    KPI['min_debit'] = KPI['min_debit'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['min_debit'] = KPI['min_debit'].apply(
                        lambda x: str(x).split('.')[0])

                    # KPI['debited_amt_mthly'] = KPI['debited_amt_mthly'].apply(lambda x: round(x) if pd.notnull(x) else 0)
                    # KPI['debited_amt_mthly'] = KPI['debited_amt_mthly'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['debited_amt_mthly'] = KPI['debited_amt_mthly'].apply(lambda x: str(x).split('.')[0])

                    KPI['debited_amt_mthly'] = KPI['debited_amt_mthly'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['debited_amt_mthly'] = KPI['debited_amt_mthly'].apply(
                        lambda x: round(x))
                    KPI['debited_amt_mthly'] = KPI['debited_amt_mthly'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['debited_amt_mthly'] = KPI['debited_amt_mthly'].apply(
                        lambda x: str(x).split('.')[0])

                    # KPI['credited_amt_mthly'] = KPI['credited_amt_mthly'].apply(lambda x: round(x) if pd.notnull(x) else 0)
                    # KPI['credited_amt_mthly'] = KPI['credited_amt_mthly'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['credited_amt_mthly'] = KPI['credited_amt_mthly'].apply(lambda x: str(x).split('.')[0])

                    KPI['credited_amt_mthly'] = KPI['credited_amt_mthly'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['credited_amt_mthly'] = KPI['credited_amt_mthly'].apply(
                        lambda x: round(x))
                    KPI['credited_amt_mthly'] = KPI['credited_amt_mthly'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['credited_amt_mthly'] = KPI['credited_amt_mthly'].apply(
                        lambda x: str(x).split('.')[0])

                    KPI['oldest_txn'] = KPI['oldest_txn'].apply(
                        lambda x: x.strftime('%d/%m/%Y') if pd.notnull(x) else '')
                    KPI['latest_txn'] = KPI['latest_txn'].apply(
                        lambda x: x.strftime('%d/%m/%Y') if pd.notnull(x) else '')

                    KPI1 = KPI[KPI['entity'] == 'Overall']
                    KPI = KPI[KPI['entity'] != 'Overall']
                    KPI = KPI.replace('₹', '', regex=True)

                    json_records = KPI.reset_index().to_json(orient='records', date_format='iso')
                    data1 = json.loads(json_records)

                    json_records = KPI1.reset_index().to_json(orient='records', date_format='iso')
                    data2 = json.loads(json_records)

                    data3 = pd.DataFrame(list([data, data1, data2, n1, n4, z]))
                    data3 = data3.to_dict('split')
                    pydict = json.dumps([data3])
                    return HttpResponse(pydict)

                    # return render(request, "bek.html",
                    #               {'data': data, 'data1': data1, 'data2': data2, 'n': n1, 'n4': n4, 'z': z})
    # return render(request, "bek.html", {'data': data, 'n4': n4, 'z': z})
    data3 = pd.DataFrame(list([data]))
    data3 = data3.to_dict('split')
    pydict = json.dumps([data3])
    return HttpResponse(pydict)


def extract_rows_data(request):
    # Assuming you received the QueryDict from the request object
    query_dict = request.POST

    # Initialize lists to store rows data
    rows_data_list = []

    # Get the total number of rows, assuming the keys follow the pattern 'RowsData[i][key]'
    num_rows = len([key for key in query_dict if key.startswith('RowsData[')])

    # Iterate over the rows and extract the data
    for i in range(num_rows):
        # index = query_dict.get(f'RowsData[selectedRowsData][{i}][index]')
        if (query_dict.get(f'RowsData[selectedRowsData][{i}][entity]')):
            entity = query_dict.get(f'RowsData[selectedRowsData][{i}][entity]')
            group_no = query_dict.get(
                f'RowsData[selectedRowsData][{i}][group_no]')

        # Add more fields as needed

        # Create a dictionary for each row and append it to the list
        row_data = {

            'entity': entity,
            'group_no': group_no,

            # Add more fields as needed
        }
        rows_data_list.append(row_data)

    # Convert the list of dictionaries to a DataFrame
    df = DataFrame(rows_data_list)
    df = df.drop_duplicates()

    # Perform any additional processing or calculations if needed

    # Return the DataFrame as JSON response
    return df


def bank_entity_kpi_merge(request):
    n4 = "p"
    z = ""

    if request.method == "POST":
        lead_id = ''
        lead_id = lead_id.join(request.POST.getlist('leadID'))
        lead_id = lead_id.rstrip()
        group_no = ''
        group_no = group_no.join(request.POST.getlist('group_no'))
        group_no = group_no.rstrip()

        acc_no = request.POST.get('optbank')

        selected_rows_data = extract_rows_data(request)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT *  FROM mysite_mergerowslist")
            data_1 = dictfetchall(cursor)
            data_rows = pd.DataFrame(data_1)
            if not data_rows.empty:
                data_rows['entity'] = data_rows['entity'].str.strip()

        if not data_rows.empty:
            lastIndex = data_rows.index[-1]

            c = data_rows.loc[lastIndex, 'group_no']

            k = int(c)
            k = k+1
            c = str(k)
        else:
            c = '1'

        # if not selected_rows_data.empty:
        #     for index, row in selected_rows_data.iterrows():
        #         entity = str(row['entity'])
        #         group_no=str(row['group_no'])
        #         with connection.cursor() as cursor:
        #             sql_query = "INSERT INTO a5_kit.mysite_mergerowslist (group_no, lead_id, account_number, entity) VALUES (%s, %s, %s, %s);"
        #             cursor.execute(sql_query, (c, lead_id, acc_no, entity))

        if not selected_rows_data.empty:
            for index, row in selected_rows_data.iterrows():
                entity = str(row['entity'])
                group_no = str(row['group_no'])
                if group_no == "" or group_no == "None":
                    with connection.cursor() as cursor:
                        sql_query = "INSERT INTO a5_kit.mysite_mergerowslist (group_no, lead_id, account_number, entity) VALUES (%s, %s, %s, %s);"
                        cursor.execute(sql_query, (c, lead_id, acc_no, entity))
                else:
                    with connection.cursor() as cursor:
                        sql_query = "UPDATE a5_kit.mysite_mergerowslist SET group_no = %s WHERE group_no = %s;"
                        cursor.execute(sql_query, (c, group_no))

        if not group_no == "":
            with connection.cursor() as cursor:
                sql_query = "DELETE FROM a5_kit.mysite_mergerowslist WHERE group_no = %s AND lead_id = %s AND account_number = %s;"
                cursor.execute(sql_query, (group_no, lead_id, acc_no))

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT *  FROM mysite_mergerowslist")
            data_1 = dictfetchall(cursor)
            data_rows = pd.DataFrame(data_1)
            if not data_rows.empty:
                data_rows['entity'] = data_rows['entity'].str.strip()

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT account_number, bank_name, min(txn_date) as from_date, max(txn_date) as to_date, COUNT(DISTINCT(entity)) as num_entities  FROM mysite_bank_bank WHERE lead_id = " + lead_id + " GROUP BY account_number " + ";")
            data = dictfetchall(cursor)
            # print(data)
            for date in data:
                date['from_date'] = date['from_date'].strftime('%d/%m/%Y')
                date['to_date'] = date['to_date'].strftime('%d/%m/%Y')

        if request.method == "POST":
            n = request.POST.get('optbank')
            z = n
            n4 = "q"

            if n is not None:
                n1 = n[1:-1]

                n = "'%" + n[1:-1] + "%'"
                # print(n)
                with connection.cursor() as cursor1:
                    cursor1.execute(
                        "SELECT * FROM mysite_bank_bank WHERE account_number like " + n + ";")
                    data1 = dictfetchall(cursor1)
                    data1 = pd.DataFrame(data1)
                    data1 = data1[data1['lead_id'] == lead_id]
                    data1['entity'] = data1['entity'].str.strip()

                    # Assuming 'lead_id', 'account_number', and 'entity' are common columns in both data1 and data_rows DataFrames

                    # Merge the two DataFrames on the common columns
                    if not data_rows.empty:
                        merged_data = data1.merge(
                            data_rows, on=['lead_id', 'account_number', 'entity'], how="left")
                    # Assuming you have a DataFrame named 'merged_data' with columns 'entity' and 'group_no'

                        # merged_data.sort_values(by='entity', inplace=True)
                    # Create a new column 'first_entity' that holds the first entity name in each group
                    # merged_data['first_entity'] = merged_data.groupby('group_no')['entity'].transform('first')
                        data_rows['first_entity'] = data_rows.groupby(
                            'group_no')['entity'].transform('first')
                        merged_data = merged_data.merge(
                            data_rows, on=['entity', 'lead_id', 'account_number'], how='left')
                        # Replace the 'entity' column with the 'first_entity' column within each group
                        merged_data.loc[~merged_data['first_entity'].isna(
                        ), 'entity'] = merged_data['first_entity']

                        # Drop the 'first_entity' column if it's no longer needed
                        merged_data.drop(columns='first_entity', inplace=True)

                        # Display the modified DataFrame
                        print(merged_data)
                        merged_data['count'] = 0

                        data_rows['count'] = data_rows.groupby(
                            'group_no')['group_no'].transform(lambda x: x.count())

                        KPI = bek(merged_data)

                        KPI = KPI.merge(data_rows, on='entity', how='left')
                        KPI.drop(columns='first_entity', inplace=True)
                        KPI.drop(columns='lead_id', inplace=True)
                        KPI.drop(columns='account_number', inplace=True)

                        KPI.drop_duplicates(
                            subset='entity', keep='first', inplace=True)
                        # KPI.reset_index(inplace=True)

                    else:
                        KPI = bek(data1)

                    KPI['debits'] = KPI['debits'].fillna(0)
                    KPI['debits'] = KPI['debits'].astype('int64')
                    KPI['credits'] = KPI['credits'].fillna(0)
                    KPI['credits'] = KPI['credits'].astype('int64')

                    KPI['debited_amt_total'] = KPI['debited_amt_total'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['debited_amt_total'] = KPI['debited_amt_total'].apply(
                        lambda x: round(x))
                    KPI['debited_amt_total'] = KPI['debited_amt_total'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['debited_amt_total'] = KPI['debited_amt_total'].apply(
                        lambda x: str(x).split('.')[0])

                    # KPI['credited_amt_total'] = KPI['credited_amt_total'].apply(lambda x: round(x) if pd.notnull(x) else 0)
                    # KPI['credited_amt_total'] = KPI['credited_amt_total'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['credited_amt_total'] = KPI['credited_amt_total'].apply(lambda x: str(x).split('.')[0])

                    KPI['credited_amt_total'] = KPI['credited_amt_total'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['credited_amt_total'] = KPI['credited_amt_total'].apply(
                        lambda x: round(x))
                    KPI['credited_amt_total'] = KPI['credited_amt_total'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['credited_amt_total'] = KPI['credited_amt_total'].apply(
                        lambda x: str(x).split('.')[0])

                    # KPI['max_debit'] = KPI['max_debit'].apply(lambda x: round(x) if pd.notnull(x) else 0)
                    # KPI['max_debit'] = KPI['max_debit'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['max_debit'] = KPI['max_debit'].apply(lambda x: str(x).split('.')[0])

                    KPI['max_debit'] = KPI['max_debit'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['max_debit'] = KPI['max_debit'].apply(
                        lambda x: round(x))
                    KPI['max_debit'] = KPI['max_debit'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['max_debit'] = KPI['max_debit'].apply(
                        lambda x: str(x).split('.')[0])

                    # KPI['max_credit'] = KPI['max_credit'].apply(lambda x: round(x) if pd.notnull(x) else 0)
                    # KPI['max_credit'] = KPI['max_credit'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['max_credit'] = KPI['max_credit'].apply(lambda x: str(x).split('.')[0])

                    KPI['max_credit'] = KPI['max_credit'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['max_credit'] = KPI['max_credit'].apply(
                        lambda x: round(x))
                    KPI['max_credit'] = KPI['max_credit'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['max_credit'] = KPI['max_credit'].apply(
                        lambda x: str(x).split('.')[0])

                    # KPI['min_credit'] = KPI['min_credit'].apply(lambda x: round(x) if pd.notnull(x) else 0)
                    # KPI['min_credit'] = KPI['min_credit'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['min_credit'] = KPI['min_credit'].apply(lambda x: str(x).split('.')[0])

                    KPI['min_credit'] = KPI['min_credit'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['min_credit'] = KPI['min_credit'].apply(
                        lambda x: round(x))
                    KPI['min_credit'] = KPI['min_credit'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['min_credit'] = KPI['min_credit'].apply(
                        lambda x: str(x).split('.')[0])

                    # KPI['min_debit'] = KPI['min_debit'].apply(lambda x: round(x) if pd.notnull(x) else 0)
                    # KPI['min_debit'] = KPI['min_debit'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['min_debit'] = KPI['min_debit'].apply(lambda x: str(x).split('.')[0])

                    KPI['min_debit'] = KPI['min_debit'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['min_debit'] = KPI['min_debit'].apply(
                        lambda x: round(x))
                    KPI['min_debit'] = KPI['min_debit'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['min_debit'] = KPI['min_debit'].apply(
                        lambda x: str(x).split('.')[0])

                    # KPI['debited_amt_mthly'] = KPI['debited_amt_mthly'].apply(lambda x: round(x) if pd.notnull(x) else 0)
                    # KPI['debited_amt_mthly'] = KPI['debited_amt_mthly'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['debited_amt_mthly'] = KPI['debited_amt_mthly'].apply(lambda x: str(x).split('.')[0])

                    KPI['debited_amt_mthly'] = KPI['debited_amt_mthly'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['debited_amt_mthly'] = KPI['debited_amt_mthly'].apply(
                        lambda x: round(x))
                    KPI['debited_amt_mthly'] = KPI['debited_amt_mthly'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['debited_amt_mthly'] = KPI['debited_amt_mthly'].apply(
                        lambda x: str(x).split('.')[0])

                    # KPI['credited_amt_mthly'] = KPI['credited_amt_mthly'].apply(lambda x: round(x) if pd.notnull(x) else 0)
                    # KPI['credited_amt_mthly'] = KPI['credited_amt_mthly'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                    # KPI['credited_amt_mthly'] = KPI['credited_amt_mthly'].apply(lambda x: str(x).split('.')[0])

                    KPI['credited_amt_mthly'] = KPI['credited_amt_mthly'].apply(
                        lambda x: x if pd.notnull(x) else 0)
                    KPI['credited_amt_mthly'] = KPI['credited_amt_mthly'].apply(
                        lambda x: round(x))
                    KPI['credited_amt_mthly'] = KPI['credited_amt_mthly'].apply(
                        lambda x: format_currency(x, 'INR', locale='en_IN'))
                    KPI['credited_amt_mthly'] = KPI['credited_amt_mthly'].apply(
                        lambda x: str(x).split('.')[0])

                    KPI['oldest_txn'] = KPI['oldest_txn'].apply(
                        lambda x: x.strftime('%d/%m/%Y') if pd.notnull(x) else '')
                    KPI['latest_txn'] = KPI['latest_txn'].apply(
                        lambda x: x.strftime('%d/%m/%Y') if pd.notnull(x) else '')

                    KPI1 = KPI[KPI['entity'] == 'Overall']
                    KPI = KPI[KPI['entity'] != 'Overall']
                    KPI = KPI.replace('₹', '', regex=True)

                    KPI = KPI[KPI['entity'] != 'Other Transactions']

                    json_records = KPI.reset_index().to_json(orient='records', date_format='iso')
                    data1 = json.loads(json_records)

                    json_records = KPI1.reset_index().to_json(orient='records', date_format='iso')
                    data2 = json.loads(json_records)

                    data3 = pd.DataFrame(list([data, data1, data2, n1, n4, z]))
                    data3 = data3.to_dict('split')
                    pydict = json.dumps([data3])
                    return HttpResponse(pydict)

                    # return render(request, "bek.html",
                    #               {'data': data, 'data1': data1, 'data2': data2, 'n': n1, 'n4': n4, 'z': z})
    # return render(request, "bek.html", {'data': data, 'n4': n4, 'z': z})
    data3 = pd.DataFrame(list([data]))
    data3 = data3.to_dict('split')
    pydict = json.dumps([data3])
    return HttpResponse(pydict)


def bck_popup(request):
    status = {}
    if "deal_id" not in request.session or "customer_id" not in request.session:
        status["type"] = "deal"
        status["message"] = "Please select a deal first!"
    else:
        customer_id = request.session["customer_id"]
        deal_id = request.session["deal_id"]

    leadID = ''
    leadID = leadID.join(request.POST.getlist('leadID'))
    leadID = leadID.rstrip()

    accno = ''
    accno = accno.join(request.POST.getlist('account_number'))
    accno = accno.rstrip()

    type = ''
    type = type.join(request.POST.getlist('type'))

    amount = ''
    amount = amount.join(request.POST.getlist('amount'))
    # amount = ''.join(e for e in amount if e.isalnum() or e.isspace())
    # amount = ''.join(e for e in amount if e.isalnum() or e.isspace() or (e == '-' and amount.index(e) == 0))
    amount = amount.replace(',', '').replace('₹', '')
    amount = amount.split('.')
    whole_part = amount[0]
    decimal_part = amount[1] if len(amount) > 1 else ''

    decimal_part = decimal_part.rstrip('0')
    amount = whole_part + ('.' + decimal_part if decimal_part else '')

    print(amount)

    # accno = accno[1:-1]
    # accno = "'%" + accno + "%'"
    if not amount == '':
        amount = float(amount)
        amount = str(amount)

    if type == 'credit':
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM a5_kit.mysite_bank_bank"

            )

            data = dictfetchall(cursor)

            data = pd.DataFrame(data)
            data = data[data['account_number'] == accno]
            data = data[data['lead_id'] == leadID]
            # filtered_data = data[data['account_number'] == accno]
            filtered_data = data[data['credit'] == amount]

    if type == 'debit':
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM a5_kit.mysite_bank_bank"
            )

            data = dictfetchall(cursor)

            data = pd.DataFrame(data)
            data = data[data['account_number'] == accno]
            data = data[data['lead_id'] == leadID]

            # filtered_data = data[data['account_number'] == accno]
            filtered_data = data
            filtered_data = filtered_data[filtered_data['debit'] == amount]
            # filtered_data = data[data['debit'] == amount]

    if type == 'negative_balance':
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM a5_kit.mysite_bank_bank"
            )

            data = dictfetchall(cursor)

            data = pd.DataFrame(data)
            data = data[data['account_number'] == accno]
            data = data[data['lead_id'] == leadID]

            data['balance'] = data['balance'].astype(float)
            filtered_data = data[data['balance'] <= 0]

        # with connection.cursor() as cursor:
        #     cursor.execute(
        #         'SELECT txn_date, description, debit, credit, balance FROM a5_kit.mysite_bank_bank WHERE account_number like ' + accno + 'and balance <= 0 ;')
        #     data = dictfetchall(cursor)
        #
        #     data = pd.DataFrame(data)

    if type == 'Bounced':
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM a5_kit.mysite_bank_bank"
            )
            data = dictfetchall(cursor)

            data = pd.DataFrame(data)
            data = data[data['account_number'] == accno]
            data = data[data['lead_id'] == leadID]

            filtered_data = data[data['transaction_type'] == "Bounced"]
            # filtered_data = filtered_data[filtered_data['account_number'] == accno]

        # with connection.cursor() as cursor:
        #     cursor.execute(
        #         'SELECT txn_date, description, debit, credit, balance FROM a3_kit.bank_bank WHERE account_number like ' + accno + 'AND transaction_type =  "Bounced" ;')
        #     data = dictfetchall(cursor)
        #
        #     data = pd.DataFrame(data)
        #     filtered_data=data

    if type == 'min_amt_chq_bounce':
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM a5_kit.mysite_bank_bank"
            )
            data = dictfetchall(cursor)

            data = pd.DataFrame(data)
            data = data[data['account_number'] == accno]
            data = data[data['lead_id'] == leadID]

            data = data[data['transaction_type'] == "Bounced"]
            data['debit'] = data['debit'].astype(float)

            data = data[data['debit'] > 0]
            minimum_value = data['debit'].min()
            if not np.isnan(minimum_value):
                minimum_value.astype(float)
            filtered_data = data[data['debit'] == minimum_value]

            # filtered_data = filtered_data[filtered_data['account_number'] == accno]

        # with connection.cursor() as cursor:
        #     cursor.execute(
        #         'SELECT txn_date, description, debit, credit, balance FROM a3_kit.bank_bank WHERE account_number like ' + accno + 'AND transaction_type =  "Bounced" ;')
        #     data = dictfetchall(cursor)
        #
        #     data = pd.DataFrame(data)
        #     filtered_data=data

    if type == 'latest_chq_bounce':
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM a5_kit.mysite_bank_bank"
            )
            data = dictfetchall(cursor)

            data = pd.DataFrame(data)
            data = data[data['account_number'] == accno]
            data = data[data['lead_id'] == leadID]

            data = data[data['transaction_type'] == "Bounced"]
            # data['debit'] = data['debit'].astype(float)

            # data=data[data['debit']>0]
            latest_date = data['txn_date'].max()
            # minimum_value.astype(float)
            filtered_data = data[data['txn_date'] == latest_date]

            # filtered_data = filtered_data[filtered_data['account_number'] == accno]

        # with connection.cursor() as cursor:
        #     cursor.execute(
        #         'SELECT txn_date, description, debit, credit, balance FROM a3_kit.bank_bank WHERE account_number like ' + accno + 'AND transaction_type =  "Bounced" ;')
        #     data = dictfetchall(cursor)
        #
        #     data = pd.DataFrame(data)
        #     filtered_data=data

    if type == 'charges':
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM a5_kit.mysite_bank_bank"

            )
            data = dictfetchall(cursor)

            data = pd.DataFrame(data)
            data = data[data['account_number'] == accno]
            data = data[data['lead_id'] == leadID]

            filtered_data = data[data['transaction_type'] == "charges"]
        # with connection.cursor() as cursor:
        #     cursor.execute(
        #         'SELECT txn_date, description, debit, credit, balance FROM a3_kit.bank_bank WHERE account_number like ' + accno + 'AND transaction_type =  "charges" ;')
        #     data = dictfetchall(cursor)
        #
        #     data = pd.DataFrame(data)
        #     filtered_data=data

    try:
        filtered_data['debit'] = filtered_data['debit'].apply(
            lambda x: format_currency(x, 'INR', locale='en_IN'))
        filtered_data['credit'] = filtered_data['credit'].apply(
            lambda x: format_currency(x, 'INR', locale='en_IN'))
        filtered_data['balance'] = filtered_data['balance'].apply(
            lambda x: format_currency(x, 'INR', locale='en_IN'))
        filtered_data['txn_date'] = filtered_data['txn_date'].apply(
            lambda x: x.strftime('%d/%m/%Y'))
    except:
        pass

    json_records = filtered_data.to_json(orient='records')
    data = json.loads(json_records)
    # data3 = data.to_dict('split')
    pydict = json.dumps([data])
    return HttpResponse(pydict)

    # return render(request, "bck_popup.html", {'data': data})


def bureau_customer_month_kpi(request):
    status = {}
    # if "deal_id" not in request.session or "customer_id" not in request.session:
    #     status["type"] = "deal"
    #     status["message"] = "Please select a deal first!"
    # else:
    if (1 > 0):
        customer_id = '5'
        deal_id = '5898'

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM mysite_bureau_ref_dtl WHERE CUSTOMER_ID = " + customer_id + ";")
            bureau_ref_dtl = dictfetchall(cursor)
            bureau_ref_dtl = pd.DataFrame(bureau_ref_dtl)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM mysite_bureau_account_segment_tl WHERE CUSTOMER_ID = " + customer_id + ";")
            bureau_account_segment_tl = dictfetchall(cursor)
            bureau_account_segment_tl = pd.DataFrame(bureau_account_segment_tl)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM mysite_bureau_enquiry_segment_iq WHERE CUSTOMER_ID = " + customer_id + ";")
            bureau_enquiry_segment_iq = dictfetchall(cursor)
            bureau_enquiry_segment_iq = pd.DataFrame(bureau_enquiry_segment_iq)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM mysite_bureau_address_segment WHERE CUSTOMER_ID = " + customer_id + ";")
            bureau_address_segment = dictfetchall(cursor)
            bureau_address_segment = pd.DataFrame(bureau_address_segment)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM mysite_bureau_score_segment WHERE CUSTOMER_ID = " + customer_id + ";")
            bureau_score_segment = dictfetchall(cursor)
            bureau_score_segment = pd.DataFrame(bureau_score_segment)

        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM loan_amt_bins_for_tenure_revised;")
            loan_amt_bins = dictfetchall(cursor)
            loan_amt_bins = pd.DataFrame(loan_amt_bins)
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM roi_calculation;")
            roi_cal = dictfetchall(cursor)
            roi_cal = pd.DataFrame(roi_cal)
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM tenure_by_acc_type_for_missing;")
            ten_acc_missing = dictfetchall(cursor)
            ten_acc_missing = pd.DataFrame(ten_acc_missing)
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM tenure_by_acc_type_loan_amt_revised;")
            ten_acc_loan_amt = dictfetchall(cursor)
            ten_acc_loan_amt = pd.DataFrame(ten_acc_loan_amt)

        KPI = bureau_c_m_k(bureau_ref_dtl, bureau_score_segment, bureau_account_segment_tl, bureau_enquiry_segment_iq,
                           bureau_address_segment, customer_id, deal_id, ten_acc_loan_amt, ten_acc_missing,
                           loan_amt_bins, roi_cal)

        if type(KPI) is not type(None):

            data1 = KPI[1]
            data1 = data1.drop_duplicates().reset_index(drop=True)

            data = KPI[0]
            data = data.drop_duplicates().reset_index(drop=True)

            data['Year'] = data['emi_month'].astype(
                'str').apply(lambda x: x.split('-')[0])
            data['Month'] = data['emi_month'].astype(
                'str').apply(lambda x: x.split('-')[1])
            data['Year'] = data['Year'].astype('int64')
            data['Month'] = data['Month'].astype('int64')

            data1['Year'] = data1['date_som'].astype(
                'str').apply(lambda x: x.split('-')[0])
            data1['Month'] = data1['date_som'].astype(
                'str').apply(lambda x: x.split('-')[1])
            data1['Year'] = data1['Year'].astype('int64')
            data1['Month'] = data1['Month'].astype('int64')

            data = data.sort_values(['Year', 'Month'], ascending=[False, True])
            years = list(set(data['Year']))
            years = sorted(years, reverse=True)
            if len(years) > 4:
                years = years[0:4]

            data1 = data1.sort_values(
                ['Year', 'Month'], ascending=[False, True])

            fy1 = data[data['Year'] == years[0]]
            fm1 = pd.DataFrame({'Month': sorted(list(set(fy1['Month'])))})
            fy1 = fm1.merge(fy1, on="Month", how="left")

            # fy1 = fy1.fillna(0)
            # fy1['sum_emi'] = fy1['sum_emi'].astype('int64')

            # fy1['sum_emi'] = fy1['sum_emi'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
            # fy1['sum_emi'] = fy1['sum_emi'].astype(str).apply(lambda x : x.split('.')[0])

            fy1['sum_emi'] = fy1['sum_emi'].apply(
                lambda x: format_currency(int(x), 'INR', locale='en_IN') if pd.notnull(x) else x)
            fy1['sum_emi'] = fy1['sum_emi'].apply(
                lambda x: str(x).replace('₹', '₹ '))

            fy1['sum_emi'] = fy1['sum_emi'].astype(
                str).apply(lambda x: x.split('.')[0])

            fy1['cnt_active_accounts'] = fy1['cnt_active_accounts'].fillna(0)
            fy1['cnt_active_accounts'] = fy1['cnt_active_accounts'].astype(
                'int64')

            # fy1['cnt_active_accounts'] = fy1['cnt_active_accounts'].apply(lambda x : int(x) if pd.notnull(x) else x)

            fy1_1 = data1[data1['Year'] == years[0]]
            fy1_1 = fm1.merge(fy1_1, on="Month", how="left")
            # fy1_1 = fy1_1.fillna(0)

            # fy1_1['valid_emi'] = fy1_1['valid_emi'].astype('int64')

            fy1_1['valid_emi'] = fy1_1['valid_emi'].apply(
                lambda x: format_currency(int(x), 'INR', locale='en_IN') if pd.notnull(x) else x)
            fy1_1['valid_emi'] = fy1_1['valid_emi'].apply(
                lambda x: str(x).replace('₹', '₹ '))

            fy1_1['valid_emi'] = fy1_1['valid_emi'].astype(
                str).apply(lambda x: x.split('.')[0])

            fy1_1_1 = fy1_1[fy1_1['Month'] == 1]
            fy1_1_2 = fy1_1[fy1_1['Month'] == 2]
            fy1_1_3 = fy1_1[fy1_1['Month'] == 3]
            fy1_1_4 = fy1_1[fy1_1['Month'] == 4]
            fy1_1_5 = fy1_1[fy1_1['Month'] == 5]
            fy1_1_6 = fy1_1[fy1_1['Month'] == 6]
            fy1_1_7 = fy1_1[fy1_1['Month'] == 7]
            fy1_1_8 = fy1_1[fy1_1['Month'] == 8]
            fy1_1_9 = fy1_1[fy1_1['Month'] == 9]
            fy1_1_10 = fy1_1[fy1_1['Month'] == 10]
            fy1_1_11 = fy1_1[fy1_1['Month'] == 11]
            fy1_1_12 = fy1_1[fy1_1['Month'] == 12]

            fy1_2_1 = fy1[fy1['Month'] == 1]

            fy1_2_2 = fy1[fy1['Month'] == 2]
            fy1_2_3 = fy1[fy1['Month'] == 3]
            fy1_2_4 = fy1[fy1['Month'] == 4]
            fy1_2_5 = fy1[fy1['Month'] == 5]
            fy1_2_6 = fy1[fy1['Month'] == 6]
            fy1_2_7 = fy1[fy1['Month'] == 7]
            fy1_2_8 = fy1[fy1['Month'] == 8]
            fy1_2_9 = fy1[fy1['Month'] == 9]
            fy1_2_10 = fy1[fy1['Month'] == 10]
            fy1_2_11 = fy1[fy1['Month'] == 11]
            fy1_2_12 = fy1[fy1['Month'] == 12]

            fy2 = data[data['Year'] == years[1]]
            fm1 = pd.DataFrame({'Month': sorted(list(set(fy2['Month'])))})
            fy2 = fm1.merge(fy2, on="Month", how="left")
            # fy2 = fy2.fillna(0)
            # fy2['sum_emi'] = fy2['sum_emi'].astype('int64')
            # fy2['sum_emi'] = fy2['sum_emi'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
            # fy2['sum_emi'] = fy2['sum_emi'].astype(str).apply(lambda x : x.split('.')[0])

            fy2['sum_emi'] = fy2['sum_emi'].apply(
                lambda x: format_currency(int(x), 'INR', locale='en_IN') if pd.notnull(x) else x)
            fy2['sum_emi'] = fy2['sum_emi'].apply(
                lambda x: str(x).replace('₹', '₹ '))

            fy2['sum_emi'] = fy2['sum_emi'].astype(
                str).apply(lambda x: x.split('.')[0])

            # fy2['cnt_active_accounts'] = fy2['cnt_active_accounts'].apply(lambda x : int(x) if pd.notnull(x) else x)
            fy2['cnt_active_accounts'] = fy2['cnt_active_accounts'].fillna(0)
            fy2['cnt_active_accounts'] = fy2['cnt_active_accounts'].astype(
                'int64')

            fy2_1 = data1[data1['Year'] == years[1]]
            fy2_1 = fm1.merge(fy2_1, on="Month", how="left")
            # fy2_1 = fy2_1.fillna(0)

            # fy2_1['valid_emi'] = fy2_1['valid_emi'].astype('int64')

            # fy2_1['valid_emi'] = fy2_1['valid_emi'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
            # fy2_1['valid_emi'] = fy2_1['valid_emi'].astype(str).apply(lambda x : x.split('.')[0])

            fy2_1['valid_emi'] = fy2_1['valid_emi'].apply(
                lambda x: format_currency(int(x), 'INR', locale='en_IN') if pd.notnull(x) else x)
            fy2_1['valid_emi'] = fy2_1['valid_emi'].apply(
                lambda x: str(x).replace('₹', '₹ '))

            fy2_1['valid_emi'] = fy2_1['valid_emi'].astype(
                str).apply(lambda x: x.split('.')[0])

            fy2_1_1 = fy2_1[fy2_1['Month'] == 1]
            fy2_1_2 = fy2_1[fy2_1['Month'] == 2]
            fy2_1_3 = fy2_1[fy2_1['Month'] == 3]
            fy2_1_4 = fy2_1[fy2_1['Month'] == 4]
            fy2_1_5 = fy2_1[fy2_1['Month'] == 5]
            fy2_1_6 = fy2_1[fy2_1['Month'] == 6]
            fy2_1_7 = fy2_1[fy2_1['Month'] == 7]
            fy2_1_8 = fy2_1[fy2_1['Month'] == 8]
            fy2_1_9 = fy2_1[fy2_1['Month'] == 9]
            fy2_1_10 = fy2_1[fy2_1['Month'] == 10]
            fy2_1_11 = fy2_1[fy2_1['Month'] == 11]
            fy2_1_12 = fy2_1[fy2_1['Month'] == 12]

            fy2_2_1 = fy2[fy2['Month'] == 1]
            fy2_2_2 = fy2[fy2['Month'] == 2]
            fy2_2_3 = fy2[fy2['Month'] == 3]
            fy2_2_4 = fy2[fy2['Month'] == 4]
            fy2_2_5 = fy2[fy2['Month'] == 5]
            fy2_2_6 = fy2[fy2['Month'] == 6]
            fy2_2_7 = fy2[fy2['Month'] == 7]
            fy2_2_8 = fy2[fy2['Month'] == 8]
            fy2_2_9 = fy2[fy2['Month'] == 9]
            fy2_2_10 = fy2[fy2['Month'] == 10]
            fy2_2_11 = fy2[fy2['Month'] == 11]
            fy2_2_12 = fy2[fy2['Month'] == 12]

            fy3 = data[data['Year'] == years[2]]
            fm1 = pd.DataFrame({'Month': sorted(list(set(fy3['Month'])))})
            fy3 = fm1.merge(fy3, on="Month", how="left")
            # fy3 = fy3.fillna(0)
            # fy3['sum_emi'] = fy3['sum_emi'].astype('int64')
            # fy3['sum_emi'] = fy3['sum_emi'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
            # fy3['sum_emi'] = fy3['sum_emi'].astype(str).apply(lambda x : x.split('.')[0])

            fy3['sum_emi'] = fy3['sum_emi'].apply(
                lambda x: format_currency(int(x), 'INR', locale='en_IN') if pd.notnull(x) else x)
            fy3['sum_emi'] = fy3['sum_emi'].apply(
                lambda x: str(x).replace('₹', '₹ '))

            fy3['sum_emi'] = fy3['sum_emi'].astype(
                str).apply(lambda x: x.split('.')[0])

            fy3['cnt_active_accounts'] = fy3['cnt_active_accounts'].fillna(0)
            fy3['cnt_active_accounts'] = fy3['cnt_active_accounts'].astype(
                'int64')
            # fy3['cnt_active_accounts'] = fy3['cnt_active_accounts'].apply(lambda x : int(x) if pd.notnull(x) else x)

            fy3_1 = data1[data1['Year'] == years[2]]
            fy3_1 = fm1.merge(fy3_1, on="Month", how="left")
            # fy3_1 = fy3_1.fillna(0)

            # fy3_1['valid_emi'] = fy3_1['valid_emi'].astype('int64')

            # fy3_1['valid_emi'] = fy3_1['valid_emi'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
            # fy3_1['valid_emi'] = fy3_1['valid_emi'].astype(str).apply(lambda x : x.split('.')[0])

            fy3_1['valid_emi'] = fy3_1['valid_emi'].apply(
                lambda x: format_currency(int(x), 'INR', locale='en_IN') if pd.notnull(x) else x)
            fy3_1['valid_emi'] = fy3_1['valid_emi'].apply(
                lambda x: str(x).replace('₹', '₹ '))

            fy3_1['valid_emi'] = fy3_1['valid_emi'].astype(
                str).apply(lambda x: x.split('.')[0])

            fy3_1_1 = fy3_1[fy3_1['Month'] == 1]
            fy3_1_2 = fy3_1[fy3_1['Month'] == 2]
            fy3_1_3 = fy3_1[fy3_1['Month'] == 3]
            fy3_1_4 = fy3_1[fy3_1['Month'] == 4]
            fy3_1_5 = fy3_1[fy3_1['Month'] == 5]
            fy3_1_6 = fy3_1[fy3_1['Month'] == 6]
            fy3_1_7 = fy3_1[fy3_1['Month'] == 7]
            fy3_1_8 = fy3_1[fy3_1['Month'] == 8]
            fy3_1_9 = fy3_1[fy3_1['Month'] == 9]
            fy3_1_10 = fy3_1[fy3_1['Month'] == 10]
            fy3_1_11 = fy3_1[fy3_1['Month'] == 11]
            fy3_1_12 = fy3_1[fy3_1['Month'] == 12]

            fy3_2_1 = fy3[fy3['Month'] == 1]
            fy3_2_2 = fy3[fy3['Month'] == 2]
            fy3_2_3 = fy3[fy3['Month'] == 3]
            fy3_2_4 = fy3[fy3['Month'] == 4]
            fy3_2_5 = fy3[fy3['Month'] == 5]
            fy3_2_6 = fy3[fy3['Month'] == 6]
            fy3_2_7 = fy3[fy3['Month'] == 7]
            fy3_2_8 = fy3[fy3['Month'] == 8]
            fy3_2_9 = fy3[fy3['Month'] == 9]
            fy3_2_10 = fy3[fy3['Month'] == 10]
            fy3_2_11 = fy3[fy3['Month'] == 11]
            fy3_2_12 = fy3[fy3['Month'] == 12]

            if len(years) == 4:
                fy4 = data[data['Year'] == years[3]]
                fm1 = pd.DataFrame({'Month': sorted(list(set(fy4['Month'])))})
                fy4 = fm1.merge(fy4, on="Month", how="left")
                # fy4 = fy4.fillna(0)
                # fy4['sum_emi'] = fy4['sum_emi'].astype('int64')
                # fy4['sum_emi'] = fy4['sum_emi'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                # fy4['sum_emi'] = fy4['sum_emi'].astype(str).apply(lambda x : x.split('.')[0])

                fy4['sum_emi'] = fy4['sum_emi'].apply(
                    lambda x: format_currency(int(x), 'INR', locale='en_IN') if pd.notnull(x) else x)
                fy4['sum_emi'] = fy4['sum_emi'].apply(
                    lambda x: str(x).replace('₹', '₹ '))

                fy4['sum_emi'] = fy4['sum_emi'].astype(
                    str).apply(lambda x: x.split('.')[0])

                fy4['cnt_active_accounts'] = fy4['cnt_active_accounts'].fillna(
                    0)
                fy4['cnt_active_accounts'] = fy4['cnt_active_accounts'].astype(
                    'int64')
                # fy4['cnt_active_accounts'] = pd.to_numeric(fy4['cnt_active_accounts'], errors="coerce")

                # fy4['cnt_active_accounts'] = fy4['cnt_active_accounts'].apply(lambda x : int(x) if pd.notnull(x) else x)

                fy4_1 = data1[data1['Year'] == years[3]]
                fm1 = pd.DataFrame(
                    {'Month': sorted(list(set(fy4_1['Month'])))})
                fy4_1 = fm1.merge(fy4_1, on="Month", how="left")
                # fy4_1 = fy4_1.fillna(0)

                # fy4_1['valid_emi'] = fy4_1['valid_emi'].astype('int64')

                # fy4_1['valid_emi'] = fy4_1['valid_emi'].apply(lambda x: format_currency(x, 'INR', locale='en_IN'))
                # fy4_1['valid_emi'] = fy4_1['valid_emi'].astype(str).apply(lambda x : x.split('.')[0])

                fy4_1['valid_emi'] = fy4_1['valid_emi'].apply(
                    lambda x: format_currency(int(x), 'INR', locale='en_IN') if pd.notnull(x) else x)
                fy4_1['valid_emi'] = fy4_1['valid_emi'].apply(
                    lambda x: str(x).replace('₹', '₹ '))

                fy4_1['valid_emi'] = fy4_1['valid_emi'].astype(
                    str).apply(lambda x: x.split('.')[0])

                fy4_1_1 = fy4_1[fy4_1['Month'] == 1]

                fy4_1_2 = fy4_1[fy4_1['Month'] == 2]
                fy4_1_3 = fy4_1[fy4_1['Month'] == 3]
                fy4_1_4 = fy4_1[fy4_1['Month'] == 4]
                fy4_1_5 = fy4_1[fy4_1['Month'] == 5]
                fy4_1_6 = fy4_1[fy4_1['Month'] == 6]
                fy4_1_7 = fy4_1[fy4_1['Month'] == 7]
                fy4_1_8 = fy4_1[fy4_1['Month'] == 8]
                fy4_1_9 = fy4_1[fy4_1['Month'] == 9]
                fy4_1_10 = fy4_1[fy4_1['Month'] == 10]
                fy4_1_11 = fy4_1[fy4_1['Month'] == 11]
                fy4_1_12 = fy4_1[fy4_1['Month'] == 12]

                fy4_2_1 = fy4[fy4['Month'] == 1]

                fy4_2_2 = fy4[fy4['Month'] == 2]
                fy4_2_3 = fy4[fy4['Month'] == 3]
                fy4_2_4 = fy4[fy4['Month'] == 4]
                fy4_2_5 = fy4[fy4['Month'] == 5]
                fy4_2_6 = fy4[fy4['Month'] == 6]
                fy4_2_7 = fy4[fy4['Month'] == 7]
                fy4_2_8 = fy4[fy4['Month'] == 8]
                fy4_2_9 = fy4[fy4['Month'] == 9]
                fy4_2_10 = fy4[fy4['Month'] == 10]
                fy4_2_11 = fy4[fy4['Month'] == 11]
                fy4_2_12 = fy4[fy4['Month'] == 12]

                json_records = fy4_1_1.to_json(orient='records')
                fy4_1_1 = json.loads(json_records)

                json_records = fy4_1_2.to_json(orient='records')
                fy4_1_2 = json.loads(json_records)

                json_records = fy4_1_3.to_json(orient='records')
                fy4_1_3 = json.loads(json_records)

                json_records = fy4_1_4.to_json(orient='records')
                fy4_1_4 = json.loads(json_records)

                json_records = fy4_1_5.to_json(orient='records')
                fy4_1_5 = json.loads(json_records)

                json_records = fy4_1_6.to_json(orient='records')
                fy4_1_6 = json.loads(json_records)

                json_records = fy4_1_7.to_json(orient='records')
                fy4_1_7 = json.loads(json_records)

                json_records = fy4_1_8.to_json(orient='records')
                fy4_1_8 = json.loads(json_records)

                json_records = fy4_1_9.to_json(orient='records')
                fy4_1_9 = json.loads(json_records)

                json_records = fy4_1_10.to_json(orient='records')
                fy4_1_10 = json.loads(json_records)

                json_records = fy4_1_11.to_json(orient='records')
                fy4_1_11 = json.loads(json_records)

                json_records = fy4_1_12.to_json(orient='records')
                fy4_1_12 = json.loads(json_records)

                json_records = fy4_2_1.to_json(orient='records')
                fy4_2_1 = json.loads(json_records)

                json_records = fy4_2_2.to_json(orient='records')
                fy4_2_2 = json.loads(json_records)

                json_records = fy4_2_3.to_json(orient='records')
                fy4_2_3 = json.loads(json_records)

                json_records = fy4_2_4.to_json(orient='records')
                fy4_2_4 = json.loads(json_records)

                json_records = fy4_2_5.to_json(orient='records')
                fy4_2_5 = json.loads(json_records)

                json_records = fy4_2_6.to_json(orient='records')
                fy4_2_6 = json.loads(json_records)

                json_records = fy4_2_7.to_json(orient='records')
                fy4_2_7 = json.loads(json_records)

                json_records = fy4_2_8.to_json(orient='records')
                fy4_2_8 = json.loads(json_records)

                json_records = fy4_2_9.to_json(orient='records')
                fy4_2_9 = json.loads(json_records)

                json_records = fy4_2_10.to_json(orient='records')
                fy4_2_10 = json.loads(json_records)

                json_records = fy4_2_11.to_json(orient='records')
                fy4_2_11 = json.loads(json_records)

                json_records = fy4_2_12.to_json(orient='records')
                fy4_2_12 = json.loads(json_records)

                json_records = fy4.to_json(orient='records')
                fy4 = json.loads(json_records)

            json_records = fy1.to_json(orient='records')
            fy1 = json.loads(json_records)

            json_records = fy1_1_1.to_json(orient='records')
            fy1_1_1 = json.loads(json_records)

            json_records = fy1_2_1.to_json(orient='records')
            fy1_2_1 = json.loads(json_records)

            json_records = fy1_2_2.to_json(orient='records')
            fy1_2_2 = json.loads(json_records)

            json_records = fy1_2_3.to_json(orient='records')
            fy1_2_3 = json.loads(json_records)

            json_records = fy1_2_4.to_json(orient='records')
            fy1_2_4 = json.loads(json_records)

            json_records = fy1_2_5.to_json(orient='records')
            fy1_2_5 = json.loads(json_records)

            json_records = fy1_2_6.to_json(orient='records')
            fy1_2_6 = json.loads(json_records)

            json_records = fy1_2_7.to_json(orient='records')
            fy1_2_7 = json.loads(json_records)

            json_records = fy1_2_8.to_json(orient='records')
            fy1_2_8 = json.loads(json_records)

            json_records = fy1_2_9.to_json(orient='records')
            fy1_2_9 = json.loads(json_records)

            json_records = fy1_2_10.to_json(orient='records')
            fy1_2_10 = json.loads(json_records)

            json_records = fy1_2_11.to_json(orient='records')
            fy1_2_11 = json.loads(json_records)

            json_records = fy1_2_12.to_json(orient='records')
            fy1_2_12 = json.loads(json_records)

            json_records = fy1_1_2.to_json(orient='records')
            fy1_1_2 = json.loads(json_records)

            json_records = fy1_1_3.to_json(orient='records')
            fy1_1_3 = json.loads(json_records)

            json_records = fy1_1_4.to_json(orient='records')
            fy1_1_4 = json.loads(json_records)

            json_records = fy1_1_5.to_json(orient='records')
            fy1_1_5 = json.loads(json_records)

            json_records = fy1_1_6.to_json(orient='records')
            fy1_1_6 = json.loads(json_records)

            json_records = fy1_1_7.to_json(orient='records')
            fy1_1_7 = json.loads(json_records)

            json_records = fy1_1_8.to_json(orient='records')
            fy1_1_8 = json.loads(json_records)

            json_records = fy1_1_9.to_json(orient='records')
            fy1_1_9 = json.loads(json_records)

            json_records = fy1_1_10.to_json(orient='records')
            fy1_1_10 = json.loads(json_records)

            json_records = fy1_1_11.to_json(orient='records')
            fy1_1_11 = json.loads(json_records)

            json_records = fy1_1_12.to_json(orient='records')
            fy1_1_12 = json.loads(json_records)

            json_records = fy2.to_json(orient='records')
            fy2 = json.loads(json_records)

            json_records = fy2_2_1.to_json(orient='records')
            fy2_2_1 = json.loads(json_records)

            json_records = fy2_2_2.to_json(orient='records')
            fy2_2_2 = json.loads(json_records)

            json_records = fy2_2_3.to_json(orient='records')
            fy2_2_3 = json.loads(json_records)

            json_records = fy2_2_4.to_json(orient='records')
            fy2_2_4 = json.loads(json_records)

            json_records = fy2_2_5.to_json(orient='records')
            fy2_2_5 = json.loads(json_records)

            json_records = fy2_2_6.to_json(orient='records')
            fy2_2_6 = json.loads(json_records)

            json_records = fy2_2_7.to_json(orient='records')
            fy2_2_7 = json.loads(json_records)

            json_records = fy2_2_8.to_json(orient='records')
            fy2_2_8 = json.loads(json_records)

            json_records = fy2_2_9.to_json(orient='records')
            fy2_2_9 = json.loads(json_records)

            json_records = fy2_2_10.to_json(orient='records')
            fy2_2_10 = json.loads(json_records)

            json_records = fy2_2_11.to_json(orient='records')
            fy2_2_11 = json.loads(json_records)

            json_records = fy2_2_12.to_json(orient='records')
            fy2_2_12 = json.loads(json_records)

            json_records = fy2_1_1.to_json(orient='records')
            fy2_1_1 = json.loads(json_records)

            json_records = fy2_1_2.to_json(orient='records')
            fy2_1_2 = json.loads(json_records)

            json_records = fy2_1_3.to_json(orient='records')
            fy2_1_3 = json.loads(json_records)

            json_records = fy2_1_4.to_json(orient='records')
            fy2_1_4 = json.loads(json_records)

            json_records = fy2_1_5.to_json(orient='records')
            fy2_1_5 = json.loads(json_records)

            json_records = fy2_1_6.to_json(orient='records')
            fy2_1_6 = json.loads(json_records)

            json_records = fy2_1_7.to_json(orient='records')
            fy2_1_7 = json.loads(json_records)

            json_records = fy2_1_8.to_json(orient='records')
            fy2_1_8 = json.loads(json_records)

            json_records = fy2_1_9.to_json(orient='records')
            fy2_1_9 = json.loads(json_records)

            json_records = fy2_1_10.to_json(orient='records')
            fy2_1_10 = json.loads(json_records)

            json_records = fy2_1_11.to_json(orient='records')
            fy2_1_11 = json.loads(json_records)

            json_records = fy2_1_12.to_json(orient='records')
            fy2_1_12 = json.loads(json_records)

            json_records = fy3.to_json(orient='records')
            fy3 = json.loads(json_records)

            json_records = fy3_2_1.to_json(orient='records')
            fy3_2_1 = json.loads(json_records)

            json_records = fy3_2_2.to_json(orient='records')
            fy3_2_2 = json.loads(json_records)

            json_records = fy3_2_3.to_json(orient='records')
            fy3_2_3 = json.loads(json_records)

            json_records = fy3_2_4.to_json(orient='records')
            fy3_2_4 = json.loads(json_records)

            json_records = fy3_2_5.to_json(orient='records')
            fy3_2_5 = json.loads(json_records)

            json_records = fy3_2_6.to_json(orient='records')
            fy3_2_6 = json.loads(json_records)

            json_records = fy3_2_7.to_json(orient='records')
            fy3_2_7 = json.loads(json_records)

            json_records = fy3_2_8.to_json(orient='records')
            fy3_2_8 = json.loads(json_records)

            json_records = fy3_2_9.to_json(orient='records')
            fy3_2_9 = json.loads(json_records)

            json_records = fy3_2_10.to_json(orient='records')
            fy3_2_10 = json.loads(json_records)

            json_records = fy3_2_11.to_json(orient='records')
            fy3_2_11 = json.loads(json_records)

            json_records = fy3_2_12.to_json(orient='records')
            fy3_2_12 = json.loads(json_records)

            json_records = fy3_1_1.to_json(orient='records')
            fy3_1_1 = json.loads(json_records)

            json_records = fy3_1_2.to_json(orient='records')
            fy3_1_2 = json.loads(json_records)

            json_records = fy3_1_3.to_json(orient='records')
            fy3_1_3 = json.loads(json_records)

            json_records = fy3_1_4.to_json(orient='records')
            fy3_1_4 = json.loads(json_records)

            json_records = fy3_1_5.to_json(orient='records')
            fy3_1_5 = json.loads(json_records)

            json_records = fy3_1_6.to_json(orient='records')
            fy3_1_6 = json.loads(json_records)

            json_records = fy3_1_7.to_json(orient='records')
            fy3_1_7 = json.loads(json_records)

            json_records = fy3_1_8.to_json(orient='records')
            fy3_1_8 = json.loads(json_records)

            json_records = fy3_1_9.to_json(orient='records')
            fy3_1_9 = json.loads(json_records)

            json_records = fy3_1_10.to_json(orient='records')
            fy3_1_10 = json.loads(json_records)

            json_records = fy3_1_11.to_json(orient='records')
            fy3_1_11 = json.loads(json_records)

            json_records = fy3_1_12.to_json(orient='records')
            fy3_1_12 = json.loads(json_records)

            # json_records = data1.to_json(orient ='records')
            # data1 = json.loads(json_records)
            # print(years)
            if len(years) == 3:
                payload = {'fy1_1_1': fy1_1_1, 'fy1_1_2': fy1_1_2, 'fy1_1_3': fy1_1_3, 'fy1_1_4': fy1_1_4,
                           'fy1_1_5': fy1_1_5, 'fy1_1_6': fy1_1_6, 'fy1_1_7': fy1_1_7, 'fy1_1_8': fy1_1_8,
                           'fy1_1_9': fy1_1_9, 'fy1_1_10': fy1_1_10, 'fy1_1_11': fy1_1_11, 'fy1_1_12': fy1_1_12,
                           'fy1_2_1': fy1_2_1, 'fy1_2_2': fy1_2_2, 'fy1_2_3': fy1_2_3, 'fy1_2_4': fy1_2_4,
                           'fy1_2_5': fy1_2_5, 'fy1_2_6': fy1_2_6, 'fy1_2_7': fy1_2_7, 'fy1_2_8': fy1_2_8,
                           'fy1_2_9': fy1_2_9, 'fy1_2_10': fy1_1_10, 'fy1_2_11': fy1_1_11, 'fy1_2_12': fy1_2_12,
                           'fy2_1_1': fy2_1_1, 'fy2_1_2': fy2_1_2, 'fy2_1_3': fy2_1_3, 'fy2_1_4': fy2_1_4,
                           'fy2_1_5': fy2_1_5, 'fy2_1_6': fy2_1_6, 'fy2_1_7': fy2_1_7, 'fy2_1_8': fy2_1_8,
                           'fy2_1_9': fy2_1_9, 'fy2_1_10': fy2_1_10, 'fy2_1_11': fy2_1_11, 'fy2_1_12': fy2_1_12,
                           'fy2_2_1': fy2_2_1, 'fy2_2_2': fy2_2_2, 'fy2_2_3': fy2_2_3, 'fy2_2_4': fy2_2_4,
                           'fy2_2_5': fy2_2_5, 'fy2_2_6': fy2_2_6, 'fy2_2_7': fy2_2_7, 'fy2_2_8': fy2_2_8,
                           'fy2_2_9': fy2_2_9, 'fy2_2_10': fy2_2_10, 'fy2_2_11': fy2_2_11, 'fy2_2_12': fy2_2_12,
                           'fy3_1_1': fy3_1_1, 'fy3_1_2': fy3_1_2, 'fy3_1_3': fy3_1_3, 'fy3_1_4': fy3_1_4,
                           'fy3_1_5': fy3_1_5, 'fy3_1_6': fy3_1_6, 'fy3_1_7': fy3_1_7, 'fy3_1_8': fy3_1_8,
                           'fy3_1_9': fy3_1_9, 'fy3_1_10': fy3_1_10, 'fy3_1_11': fy3_1_11, 'fy3_1_12': fy3_1_12,
                           'fy3_2_1': fy3_2_1, 'fy3_2_2': fy3_2_2, 'fy3_2_3': fy3_2_3, 'fy3_2_4': fy3_2_4,
                           'fy3_2_5': fy3_2_5, 'fy3_2_6': fy3_2_6, 'fy3_2_7': fy3_2_7, 'fy3_2_8': fy3_2_8,
                           'fy3_2_9': fy3_2_9, 'fy3_2_10': fy3_2_10, 'fy3_2_11': fy3_2_11, 'fy3_2_12': fy3_2_12,
                           'years': years}
                # return render(request, "bureau_c_m_k.html", payload)
                pydict = json.dumps(payload)
                return HttpResponse(pydict)

            else:
                payload = {'fy1_1_1': fy1_1_1, 'fy1_1_2': fy1_1_2, 'fy1_1_3': fy1_1_3, 'fy1_1_4': fy1_1_4,
                           'fy1_1_5': fy1_1_5, 'fy1_1_6': fy1_1_6, 'fy1_1_7': fy1_1_7, 'fy1_1_8': fy1_1_8,
                           'fy1_1_9': fy1_1_9, 'fy1_1_10': fy1_1_10, 'fy1_1_11': fy1_1_11, 'fy1_1_12': fy1_1_12,
                           'fy1_2_1': fy1_2_1, 'fy1_2_2': fy1_2_2, 'fy1_2_3': fy1_2_3, 'fy1_2_4': fy1_2_4,
                           'fy1_2_5': fy1_2_5, 'fy1_2_6': fy1_2_6, 'fy1_2_7': fy1_2_7, 'fy1_2_8': fy1_2_8,
                           'fy1_2_9': fy1_2_9, 'fy1_2_10': fy1_2_10, 'fy1_2_11': fy1_2_11, 'fy1_2_12': fy1_2_12,
                           'fy2_1_1': fy2_1_1, 'fy2_1_2': fy2_1_2, 'fy2_1_3': fy2_1_3, 'fy2_1_4': fy2_1_4,
                           'fy2_1_5': fy2_1_5, 'fy2_1_6': fy2_1_6, 'fy2_1_7': fy2_1_7, 'fy2_1_8': fy2_1_8,
                           'fy2_1_9': fy2_1_9, 'fy2_1_10': fy2_1_10, 'fy2_1_11': fy2_1_11, 'fy2_1_12': fy2_1_12,
                           'fy2_2_1': fy2_2_1, 'fy2_2_2': fy2_2_2, 'fy2_2_3': fy2_2_3, 'fy2_2_4': fy2_2_4,
                           'fy2_2_5': fy2_2_5, 'fy2_2_6': fy2_2_6, 'fy2_2_7': fy2_2_7, 'fy2_2_8': fy2_2_8,
                           'fy2_2_9': fy2_2_9, 'fy2_2_10': fy2_2_10, 'fy2_2_11': fy2_2_11, 'fy2_2_12': fy2_2_12,
                           'fy3_1_1': fy3_1_1, 'fy3_1_2': fy3_1_2, 'fy3_1_3': fy3_1_3, 'fy3_1_4': fy3_1_4,
                           'fy3_1_5': fy3_1_5, 'fy3_1_6': fy3_1_6, 'fy3_1_7': fy3_1_7, 'fy3_1_8': fy3_1_8,
                           'fy3_1_9': fy3_1_9, 'fy3_1_10': fy3_1_10, 'fy3_1_11': fy3_1_11, 'fy3_1_12': fy3_1_12,
                           'fy3_2_1': fy3_2_1, 'fy3_2_2': fy3_2_2, 'fy3_2_3': fy3_2_3, 'fy3_2_4': fy3_2_4,
                           'fy3_2_5': fy3_2_5, 'fy3_2_6': fy3_2_6, 'fy3_2_7': fy3_2_7, 'fy3_2_8': fy3_2_8,
                           'fy3_2_9': fy3_2_9, 'fy3_2_10': fy3_2_10, 'fy3_2_11': fy3_2_11, 'fy3_2_12': fy3_2_12,
                           'fy4_1_1': fy4_1_1, 'fy4_1_2': fy4_1_2, 'fy4_1_3': fy4_1_3, 'fy4_1_4': fy4_1_4,
                           'fy4_1_5': fy4_1_5, 'fy4_1_6': fy4_1_6, 'fy4_1_7': fy4_1_7, 'fy4_1_8': fy4_1_8,
                           'fy4_1_9': fy4_1_9, 'fy4_1_10': fy4_1_10, 'fy4_1_11': fy4_1_11, 'fy4_1_12': fy4_1_12,
                           'fy4_2_1': fy4_2_1, 'fy4_2_2': fy4_2_2, 'fy4_2_3': fy4_2_3, 'fy4_2_4': fy4_2_4,
                           'fy4_2_5': fy4_2_5, 'fy4_2_6': fy4_2_6, 'fy4_2_7': fy4_2_7, 'fy4_2_8': fy4_2_8,
                           'fy4_2_9': fy4_2_9, 'fy4_2_10': fy4_2_10, 'fy4_2_11': fy4_2_11, 'fy4_2_12': fy4_2_12,
                           'years': years}
                payload_11 = {'fy1_1_12': fy1_1_12, 'fy1_1_11': fy1_1_11, 'fy1_1_10': fy1_1_10,
                              'fy1_1_9': fy1_1_9,
                              'fy1_1_8': fy1_1_8, 'fy1_1_7': fy1_1_7, 'fy1_1_6': fy1_1_6, 'fy1_1_5': fy1_1_5,
                              'fy1_1_4': fy1_1_4, 'fy1_1_3': fy1_1_3, 'fy1_1_2': fy1_1_2, 'fy1_1_1': fy1_1_1}

                payload_12 = {'fy1_2_12': fy1_2_12, 'fy1_2_11': fy1_2_11, 'fy1_2_10': fy1_2_10,
                              'fy1_2_9': fy1_2_9,
                              'fy1_2_8': fy1_2_8, 'fy1_2_7': fy1_2_7, 'fy1_2_6': fy1_2_6, 'fy1_2_5': fy1_2_5,
                              'fy1_2_4': fy1_2_4, 'fy1_2_3': fy1_2_3, 'fy1_2_2': fy1_2_2, 'fy1_2_1': fy1_2_1}

                payload_21 = {
                    'fy2_1_12': fy2_1_12, 'fy2_1_11': fy2_1_11, 'fy2_1_10': fy2_1_10, 'fy2_1_9': fy2_1_9,
                    'fy2_1_8': fy2_1_8, 'fy2_1_7': fy2_1_7, 'fy2_1_6': fy2_1_6, 'fy2_1_5': fy2_1_5,
                    'fy2_1_4': fy2_1_4, 'fy2_1_3': fy2_1_3, 'fy2_1_2': fy2_1_2, 'fy2_1_1': fy2_1_1
                }

                payload_22 = {
                    'fy2_2_12': fy2_2_12, 'fy2_2_11': fy2_2_11, 'fy2_2_10': fy2_2_10, 'fy2_2_9': fy2_2_9,
                    'fy2_2_8': fy2_2_8, 'fy2_2_7': fy2_2_7, 'fy2_2_6': fy2_2_6, 'fy2_2_5': fy2_2_5,
                    'fy2_2_4': fy2_2_4, 'fy2_2_3': fy2_2_3, 'fy2_2_2': fy2_2_2, 'fy2_2_1': fy2_2_1
                }

                payload_31 = {
                    'fy3_1_12': fy3_1_12, 'fy3_1_11': fy3_1_11, 'fy3_1_10': fy3_1_10, 'fy3_1_9': fy3_1_9,
                    'fy3_1_8': fy3_1_8, 'fy3_1_7': fy3_1_7, 'fy3_1_6': fy3_1_6, 'fy3_1_5': fy3_1_5,
                    'fy3_1_4': fy3_1_4, 'fy3_1_3': fy3_1_3, 'fy3_1_2': fy3_1_2, 'fy3_1_1': fy3_1_1,
                }

                payload_32 = {
                    'fy3_2_12': fy3_2_12, 'fy3_2_11': fy3_2_11, 'fy3_2_10': fy3_2_10, 'fy3_2_9': fy3_2_9,
                    'fy3_2_8': fy3_2_8, 'fy3_2_7': fy3_2_7, 'fy3_2_6': fy3_2_6, 'fy3_2_5': fy3_2_5,
                    'fy3_2_4': fy3_2_4, 'fy3_2_3': fy3_2_3, 'fy3_2_2': fy3_2_2, 'fy3_2_1': fy3_2_1,
                }

                payload_41 = {
                    'fy4_1_12': fy4_1_12, 'fy4_1_11': fy4_1_11, 'fy4_1_10': fy4_1_10, 'fy4_1_9': fy4_1_9,
                    'fy4_1_8': fy4_1_8, 'fy4_1_7': fy4_1_7, 'fy4_1_6': fy4_1_6, 'fy4_1_5': fy4_1_5,
                    'fy4_1_4': fy4_1_4, 'fy4_1_3': fy4_1_3, 'fy4_1_2': fy4_1_2, 'fy4_1_1': fy4_1_1,
                }

                payload_42 = {
                    'fy4_2_12': fy4_2_12, 'fy4_2_11': fy4_2_11, 'fy4_2_10': fy4_2_10, 'fy4_2_9': fy4_2_9,
                    'fy4_2_8': fy4_2_8, 'fy4_2_7': fy4_2_7, 'fy4_2_6': fy4_2_6, 'fy4_2_5': fy4_2_5,
                    'fy4_2_4': fy4_2_4, 'fy4_2_3': fy4_2_3, 'fy4_2_2': fy4_2_2, 'fy4_2_1': fy4_2_1,
                }

                # finaldata = pd.DataFrame(list([payload]))
                # finaldata = finaldata.to_dict('split')
                # pydict = json.dumps(payload,payload_11,payload_12)
                pydict = json.dumps([payload, payload_11, payload_12, payload_21,
                                    payload_22, payload_31, payload_32, payload_41, payload_42])
                return HttpResponse(pydict)

                # return render(request, "bureau_c_m_k.html", payload)

    payload = {"analyze_page": True, "status": status if status else None}
    return render(request, "bureau_c_m_k.html", payload)


def statement(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT distinct(lead_id) from los_did_cid_generation")
            data = dictfetchall(cursor)
            # print(data)
            data = pd.DataFrame(data)
            lead_id = list(set(data['lead_id']))
            lead_id_session = int(request.session['lead_session'])

            lead_id.remove(lead_id_session)
            # print(lead_id)

        return render(request, 'statement.html', {'data': data, 'lead_id': lead_id})
    except:
        return JsonResponse({'status': 'failed'})


def statement1(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest' and request.method == "POST":
        cust_id = request.POST.get('cust_id')
        n = request.POST.get('account_number')
        balance_from = request.POST.get('balance_from')
        balance_to = request.POST.get('balance_to')

        credit_from = request.POST.get('credit_from')
        credit_to = request.POST.get('credit_to')
        select2 = request.POST.get('select2')
        debit_from = request.POST.get('debit_from')
        debit_to = request.POST.get('debit_to')
        select3 = request.POST.get('select3')
        lead_id = request.POST.get('lead_id')
        from1 = request.POST.get('from1')
        to = request.POST.get('to')
        transaction_type = request.POST.get('select4').split(',')
        # print("abcd")
        # print(cust_id)
        # print(n)
        # print(balance_from)
        # print(balance_to)

        # print(credit_from)
        # print(credit_to)
        # print(select2)
        # print(debit_from)
        # print(debit_to)
        # print(select3)
        # print(from1)
        # print(to)
        # print(lead_id)
        # if balance_from == "":
        #     balance_from="0"
        # if balance_to =="":
        #     balance_to="1000000000"
        # if credit_to =="":
        #     credit_to="1000000000"
        # if credit_from=="":
        #     credit_from="0"
        # if debit_from=="":
        #     debit_from="0"
        # if debit_to=="":
        #     debit_to="1000000000"

        # print(select3)
        if n != None:
            n = "'%" + n[1:-1] + "%'"

        if transaction_type != "select":
            transaction_type = "'" + transaction_type + "'"

        message = ""
        from1 = "'" + from1 + "'"
        to = "'" + to + "'"

        if to != "''" and from1 != "''" and cust_id != "Select" and lead_id != "Select" and n != "Select":
            # print("suhaibyyy")
            if balance_from == "" and balance_to == "" and debit_to == "" and debit_to == "" and credit_to == "" and credit_from == "":
                if transaction_type != 'select':
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "SELECT txn_date,description,cheque_number,debit,credit,balance FROM bank_bank where txn_date between " + from1 + " and " + to + " and customer_id = " + cust_id + " and account_number like " + n + " and transaction_type=" + transaction_type + ";")
                        data1 = dictfetchall(cursor)
                        # print(data1)
                        # print("suhaibxxxx")
                        message = ""
                        if len(data1) == 0:
                            message = "no data is available for selected date"
                            # print("suhaib")
                        return JsonResponse({"result": data1, 'message': message})

                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT txn_date,description,cheque_number,debit,credit,balance FROM bank_bank where txn_date between " + from1 + " and " + to + " and customer_id = " + cust_id + " and account_number like " + n + ";")
                    data1 = dictfetchall(cursor)
                    # print(data1)
                    # print("suhaibxxxx")
                    message = ""
                    if len(data1) == 0:
                        message = "no data is available for selected date"
                        print("suhaib")
                    return JsonResponse({"result": data1, 'message': message})
            if select3 == "select" and select2 == "select":

                if credit_from == "" and credit_to == "" and debit_to == "" and debit_to == "":
                    if balance_from == "":
                        balance_from = "-1000000"
                    if balance_to == "":
                        balance_to = "1000000000"

                    if transaction_type != 'select':
                        with connection.cursor() as cursor:
                            cursor.execute(
                                "SELECT txn_date,description,cheque_number,debit,credit,balance FROM bank_bank where  txn_date between " + from1 + " and " + to + " and (balance >= " + balance_from + " and balance <= " + balance_to + ") and ( customer_id = " + cust_id + " and account_number like " + n + " and transaction_type=" + transaction_type + ");")
                            data1 = dictfetchall(cursor)
                            if len(data1) == 0:
                                message = "no data is available for selected date"
                            # print(data1)
                            print("ghijkl")
                            return JsonResponse({"result": data1, 'message': message})

                    with connection.cursor() as cursor:
                        cursor.execute(
                            "SELECT txn_date,description,cheque_number,debit,credit,balance FROM bank_bank where  txn_date between " + from1 + " and " + to + " and (balance >= " + balance_from + " and balance <= " + balance_to + ") and ( customer_id = " + cust_id + " and account_number like " + n + ");")
                        data1 = dictfetchall(cursor)
                        if len(data1) == 0:
                            message = "no data is available for selected date"
                        # print(data1)
                        print("ghijkl")
                        return JsonResponse({"result": data1, 'message': message})
                if balance_from == "" and balance_to == "" and debit_to == "" and debit_to == "":
                    if credit_from == "":
                        credit_from = "1"
                    if credit_to == "":
                        credit_to = "1000000000"
                    if transaction_type != 'select':
                        with connection.cursor() as cursor:
                            cursor.execute(
                                "SELECT txn_date,description,cheque_number,debit,credit,balance FROM bank_bank where  txn_date between " + from1 + " and " + to + " and (credit >= " + credit_from + " and credit <= " + credit_to + ") and (deal_id = " + lead_id + " and customer_id = " + cust_id + " and account_number like " + n + ");")
                            data1 = dictfetchall(cursor)
                            if len(data1) == 0:
                                message = "no data is available for selected date"
                            # print(data1)
                            print("ghijkl")
                            return JsonResponse({"result": data1, 'message': message})

                    with connection.cursor() as cursor:
                        cursor.execute(
                            "SELECT txn_date,description,cheque_number,debit,credit,balance FROM bank_bank where  txn_date between " + from1 + " and " + to + " and (credit >= " + credit_from + " and credit <= " + credit_to + ") and (deal_id = " + lead_id + " and customer_id = " + cust_id + " and account_number like " + n + ");")
                        data1 = dictfetchall(cursor)
                        if len(data1) == 0:
                            message = "no data is available for selected date"
                        # print(data1)
                        print("ghijkl")
                        return JsonResponse({"result": data1, 'message': message})
                if balance_from == "" and balance_to == "" and credit_to == "" and credit_from == "":
                    if debit_from == "":
                        debit_from = "1"
                    if debit_to == "":
                        debit_to = "1000000000"
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "SELECT txn_date,description,cheque_number,debit,credit,balance FROM bank_bank where  txn_date between " + from1 + " and " + to + " and (debit >= " + debit_from + " and debit <= " + debit_to + ") and (deal_id = " + lead_id + " and customer_id = " + cust_id + " and account_number like " + n + ");")
                        data1 = dictfetchall(cursor)
                        if len(data1) == 0:
                            message = "no data is available for selected date"
                        print(data1)

                        print(message)
                        print("pqr")
                        return JsonResponse({"result": data1, 'message': message})

            if balance_from == "":
                balance_from = "-1000000"
            if balance_to == "":
                # message="this data is from balace " + balance_from + " to " + balance_to + " " + select + " " + " debit upto " +  debit_to;
                balance_to = "1000000000"
            if debit_from == "":
                debit_from = "1"
            if debit_to == "":
                debit_to = "1000000000"
            if credit_from == "":
                credit_from = "1"
            if credit_to == "":
                credit_to = "1000000000"

            if select3 != "select" and select2 != "select":
                print("xyz")
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT txn_date,description,cheque_number,debit,credit,balance FROM bank_bank where  txn_date between " + from1 + " and " + to + " and (balance >= " + balance_from + " and balance <= " + balance_to + " " + select2 + " debit >= " + debit_from + " and debit <= " + debit_to + " " + select3 + " credit >= " + credit_from + " and credit <= " + credit_to + ") and (deal_id = " + lead_id + " and customer_id = " + cust_id + " and account_number like " + n + ");")
                    data1 = dictfetchall(cursor)
                    # print(data1)
                    # print("suhaibaaaa")
                    if len(data1) == 0:
                        message = "no data is available for selected date"

                    # message="this data is from balace " + balance_from + " to " + balance_to + " " + select + " " + " debit upto " +  debit_to;
                    return JsonResponse({"result": data1, 'message': message})

            if select2 != "select" and select3 == "select":
                if transaction_type != "select":
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "SELECT txn_date,description,cheque_number,debit,credit,balance FROM bank_bank where  txn_date between " + from1 + " and " + to + " and (balance >= " + balance_from + " and balance <= " + balance_to + " " + select2 + " credit >= " + credit_from + " and credit <= " + credit_to + " ) and (deal_id = " + lead_id + " and customer_id = " + cust_id + " and account_number like " + n + ");")
                        data1 = dictfetchall(cursor)
                        print(data1)
                        print("abcdef")
                        if len(data1) == 0:
                            message = "no data is available for selected date"
                        return JsonResponse({"result": data1, 'message': message})

                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT txn_date,description,cheque_number,debit,credit,balance FROM bank_bank where  txn_date between " + from1 + " and " + to + " and (balance >= " + balance_from + " and balance <= " + balance_to + " " + select2 + " credit >= " + credit_from + " and credit <= " + credit_to + ") and (deal_id = " + lead_id + " and customer_id = " + cust_id + " and account_number like " + n + ");")
                    data1 = dictfetchall(cursor)
                    print(data1)
                    print("abcdef")
                    if len(data1) == 0:
                        message = "no data is available for selected date"

                    # message="this data is from balace " + balance_from + " to " + balance_to + " " + select + " " + " debit upto " +  debit_to;
                    return JsonResponse({"result": data1, 'message': message})

            if select2 == "select" and select3 != "select":
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT txn_date,description,cheque_number,debit,credit,balance FROM bank_bank where  txn_date between " + from1 + " and " + to + " and (balance >= " + balance_from + " and balance <= " + balance_to + " " + select3 + " debit >= " + debit_from + " and debit <= " + debit_to + ") and (deal_id = " + lead_id + " and customer_id = " + cust_id + " and account_number like " + n + ");")
                    data1 = dictfetchall(cursor)
                    if len(data1) == 0:
                        message = "no data is available for selected date"
                    print(data1)
                    print("oqwer")

                    # message="this data is from balace " + balance_from + " to " + balance_to + " " + select + " " + " debit upto " +  debit_to;
                    return JsonResponse({"result": data1, 'message': message})

                # print(data1)
                return JsonResponse({"result": data1, 'message': message})
        if to == "''" and from1 != "''":
            message = "no data is available for selected date"
            return JsonResponse({'message': message})
        if to != "''" and from1 == "''":
            message = "no data is available for selected date"

            return JsonResponse({'message': message})

        if to == "''" and from1 == "''" and cust_id != "Select" and lead_id != "Select" and n != "Select":
            if cust_id != "Select" and lead_id != "Select" and n != "Select":
                if select3 == "select" and select2 == "select":

                    if credit_from == "" and credit_to == "" and debit_to == "" and debit_to == "":
                        if balance_from == "":
                            balance_from = "-1000000"
                        if balance_to == "":
                            balance_to = "1000000000"
                        if transaction_type != "'Select'":
                            with connection.cursor() as cursor:
                                cursor.execute(
                                    "SELECT txn_date,description,cheque_number,debit,credit,balance FROM bank_bank where (balance >= " + balance_from + " and balance <= " + balance_to + ") and (deal_id = " + lead_id + " and customer_id = " + cust_id + " and account_number like " + n + " and transaction_type=" + transaction_type + ");")
                                data1 = dictfetchall(cursor)
                                # print(data1)
                                # print("ghijkl")
                                if len(data1) == 0:
                                    message = "no data is available for selected date"
                                return JsonResponse({"result": data1, 'message': message})

                        with connection.cursor() as cursor:
                            cursor.execute(
                                "SELECT txn_date,description,cheque_number,debit,credit,balance FROM bank_bank where (balance >= " + balance_from + " and balance <= " + balance_to + ") and (deal_id = " + lead_id + " and customer_id = " + cust_id + " and account_number like " + n + ");")
                            data1 = dictfetchall(cursor)
                            # print(data1)
                            print("ghijkl")
                            if len(data1) == 0:
                                message = "no data is available for selected date"
                            return JsonResponse({"result": data1, 'message': message})
                    if balance_from == "" and balance_to == "" and debit_to == "" and debit_to == "":
                        if credit_from == "":
                            credit_from = "1"
                        if credit_to == "":
                            credit_to = "1000000000"
                        with connection.cursor() as cursor:
                            cursor.execute(
                                "SELECT txn_date,description,cheque_number,debit,credit,balance FROM bank_bank where (credit >= " + credit_from + " and credit <= " + credit_to + ") and (deal_id = " + lead_id + " and customer_id = " + cust_id + " and account_number like " + n + ");")
                            data1 = dictfetchall(cursor)
                            # print(data1)
                            print("ghijkl")
                            if len(data1) == 0:
                                message = "no data is available for selected date"
                            return JsonResponse({"result": data1, 'message': message})
                    if balance_from == "" and balance_to == "" and credit_to == "" and credit_from == "":
                        if debit_from == "":
                            debit_from = "1"
                        if debit_to == "":
                            debit_to = "1000000000"
                        with connection.cursor() as cursor:
                            cursor.execute(
                                "SELECT txn_date,description,cheque_number,debit,credit,balance FROM bank_bank where (debit >= " + debit_from + " and debit <= " + debit_to + ") and (deal_id = " + lead_id + " and customer_id = " + cust_id + " and account_number like " + n + ");")
                            data1 = dictfetchall(cursor)
                            # print(data1)
                            if len(data1) == 0:
                                message = "no data is available for selected date"
                            print("ghijkl")
                            return JsonResponse({"result": data1, 'message': message})

                if balance_from == "":
                    balance_from = "-1000000"
                if balance_to == "":
                    # message="this data is from balace " + balance_from + " to " + balance_to + " " + select + " " + " debit upto " +  debit_to;
                    balance_to = "1000000000"
                if debit_from == "":
                    debit_from = "1"
                if debit_to == "":
                    debit_to = "1000000000"
                if credit_from == "":
                    credit_from = "1"
                if credit_to == "":
                    credit_to = "1000000000"

                if select3 != "select" and select2 != "select":
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "SELECT txn_date,description,cheque_number,debit,credit,balance FROM bank_bank where (balance >= " + balance_from + " and balance <= " + balance_to + " " + select2 + " debit >= " + debit_from + " and debit <= " + debit_to + " " + select3 + " credit >= " + credit_from + " and credit <= " + credit_to + ") and (deal_id = " + lead_id + " and customer_id = " + cust_id + " and account_number like " + n + ");")
                        data1 = dictfetchall(cursor)
                        print(data1)
                        print("mnosbh")
                        if len(data1) == 0:
                            message = "no data is available for selected date"

                        # message="this data is from balace " + balance_from + " to " + balance_to + " " + select + " " + " debit upto " +  debit_to;
                        return JsonResponse({"result": data1, 'message': message})

                if select2 != "select" and select3 == "select":
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "SELECT txn_date,description,cheque_number,debit,credit,balance FROM bank_bank where (balance >= " + balance_from + " and balance <= " + balance_to + " " + select2 + " credit >= " + credit_from + " and credit <= " + credit_to + ") and (deal_id = " + lead_id + " and customer_id = " + cust_id + " and account_number like " + n + ");")
                        data1 = dictfetchall(cursor)
                        print(data1)
                        print("abcdef")
                        if len(data1) == 0:
                            message = "no data is available for selected date"

                        # message="this data is from balace " + balance_from + " to " + balance_to + " " + select + " " + " debit upto " +  debit_to;
                        return JsonResponse({"result": data1, 'message': message})

                if select2 == "select" and select3 != "select":
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "SELECT txn_date,description,cheque_number,debit,credit,balance FROM bank_bank where (balance >= " + balance_from + " and balance <= " + balance_to + " " + select3 + " debit >= " + debit_from + " and debit <= " + debit_to + ") and (deal_id = " + lead_id + " and customer_id = " + cust_id + " and account_number like " + n + ");")
                        data1 = dictfetchall(cursor)
                        print(data1)
                        print("oqwer")
                        if len(data1) == 0:
                            message = "no data is available for selected date"

                        # message="this data is from balace " + balance_from + " to " + balance_to + " " + select + " " + " debit upto " +  debit_to;
                        return JsonResponse({"result": data1, 'message': message})

    message = ''
    return JsonResponse({'message': message})


@login_required
def lead(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest' and request.method == "POST":
        print("khan")
        lead_id = request.POST.get('id')
        print(lead_id)
        print("suhaib")
        # lead_name = request.POST.get('name')
        with connection.cursor() as cursor:
            sql_query = "SELECT distinct(customer_id),account_number,account_name,bank_name FROM a3_kit.bank_bank  where deal_id = " + lead_id + ";"
            cursor.execute(sql_query)
            data = dictfetchall(cursor)
            print(data)
            data = pd.DataFrame(data)
            bank_name = list(set(data['bank_name']))
            account_name = list(set(data['account_name']))
            customer_id = list(set(data['customer_id']))

            transaction_type = ['Self Credit', 'Auto Debit', 'Bounced', 'Not available', 'Self Debit', 'Overdrawn',
                                'Auto Credit']
            json_records = data.reset_index().to_json(orient='records')

            data = json.loads(json_records)

            return JsonResponse(
                {"result": data, 'bank_name': bank_name, 'account_name': account_name, 'customer_id': customer_id,
                 'transaction_type': transaction_type})


@login_required
def alladress(request, cust_id):
    status = {}
    if "deal_id" not in request.session or "customer_id" not in request.session:
        status["type"] = "deal"
        status["message"] = "Please select a deal first!"
    else:
        customer_id = request.session["customer_id"]
        deal_id = request.session["deal_id"]

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT concat(ADDRESS_1,ADDRESS_2,ADDRESS_3,ADDRESS_4,ADDRESS_5) as address ,source FROM bureau_address_segment WHERE CUSTOMER_ID = " + customer_id + " GROUP BY ADDRESS_1,ADDRESS_2,ADDRESS_3,ADDRESS_4,ADDRESS_5,source" + ";")
            Address_Val = dictfetchall(cursor)
    return render(request, "alladdress.html", {'Address_Val': Address_Val})


def age(request, cust_id):
    status = {}
    if "deal_id" not in request.session or "customer_id" not in request.session:
        status["type"] = "deal"
        status["message"] = "Please select a deal first!"
    else:
        customer_id = request.session["customer_id"]
        deal_id = request.session["deal_id"]

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT distinct(DATE_OF_BIRTH) as DATE_OF_BIRTH ,source FROM bureau_name_segment WHERE CUSTOMER_ID = " + customer_id + ";")
            DOB = dictfetchall(cursor)
            for date in DOB:
                date['DATE_OF_BIRTH'] = date['DATE_OF_BIRTH'].strftime(
                    '%d/%m/%Y')
    return render(request, "bureauAge.html", {'DOB': DOB})


def statements(request):

    lead_id = ''
    lead_id = lead_id.join(request.POST.getlist('leadID'))
    lead_id = lead_id.rstrip()

    accountNo = ''
    accountNo = accountNo.join(request.POST.getlist('account_number'))
    accountNo = accountNo.rstrip('')

    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT txn_date,description,account_number,cheque_number,debit,credit,balance FROM mysite_bank_bank where  lead_id = " + lead_id + ";")
        data = dictfetchall(cursor)
        data = pd.DataFrame(data)
        data = data[data['account_number'] == accountNo]
        data['txn_date'] = data['txn_date'].apply(
            lambda x: x.strftime('%d/%m/%Y'))
        data['debit'] = data['debit'].apply(
            lambda x: format_currency(x, 'INR', locale='en_IN'))
        data['credit'] = data['credit'].apply(
            lambda x: format_currency(x, 'INR', locale='en_IN'))
        data['balance'] = data['balance'].apply(
            lambda x: format_currency(x, 'INR', locale='en_IN'))
        data = data.replace('₹', '', regex=True)

        json_records = data.to_json(orient='records')
        data = json.loads(json_records)
        pydict = json.dumps([data])
        return HttpResponse(pydict)


def executive_summary(request):

    status = {}
    if (0):
        pass
    else:
        customer_id = str(5)
        lead_id = ''
        lead_id = lead_id.join(request.POST.getlist('leadID'))
        lead_id = lead_id.rstrip()
        deal_id = lead_id

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM `a5_kit`.`mysite_executivesummarydata` WHERE lead_id = " + lead_id + ";")
            summary_calculator_data = dictfetchall(cursor)
            summary_calculator_data = pd.DataFrame(summary_calculator_data)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM a5_kit.mysite_bureau_ref_dtl WHERE CUSTOMER_ID = " + customer_id + ";")
            bureau_ref_dtl = dictfetchall(cursor)
            bureau_ref_dtl = pd.DataFrame(bureau_ref_dtl)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM a5_kit.mysite_bureau_account_segment_tl WHERE CUSTOMER_ID = " + customer_id + "  ;")
            bureau_account_segment_tl = dictfetchall(cursor)
            bureau_account_segment_tl = pd.DataFrame(bureau_account_segment_tl)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM a5_kit.mysite_bureau_table_data WHERE CUSTOMER_ID = " + customer_id + "  ;")
            bureau_automated = dictfetchall(cursor)
            bureau_automated = pd.DataFrame(bureau_automated)

        # with connection.cursor() as cursor:
        #     cursor.execute(
        #         "SELECT * FROM lead_details.cr_deal_dtl WHERE did = " + str(deal_id) + "  ;")
        #     findingleadid = dictfetchall(cursor)
        #     findingleadid = pd.DataFrame(findingleadid)

        # lead_id = findingleadid['lid'][0]

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM a5_kit.mysite_bureau_enquiry_segment_iq WHERE CUSTOMER_ID = " + customer_id + ";")
            bureau_enquiry_segment_iq = dictfetchall(cursor)
            bureau_enquiry_segment_iq = pd.DataFrame(bureau_enquiry_segment_iq)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM a5_kit.mysite_bureau_address_segment WHERE CUSTOMER_ID = " + customer_id + ";")
            bureau_address_segment = dictfetchall(cursor)
            bureau_address_segment = pd.DataFrame(bureau_address_segment)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM a5_kit.mysite_bureau_score_segment WHERE CUSTOMER_ID = " + customer_id + ";")
            bureau_score_segment = dictfetchall(cursor)
            bureau_score_segment = pd.DataFrame(bureau_score_segment)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM a5_kit.mysite_bank_bank WHERE lead_id = " + lead_id + ";")
            bank_bank = dictfetchall(cursor)
            bank_bank = pd.DataFrame(bank_bank)
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM lead_details.cr_lead_dtl WHERE lead_id = " + lead_id + ";")
            personal_info = dictfetchall(cursor)
            lmsdetails = pd.DataFrame(personal_info)

    bureau_details = {}

    try:
        bureau_details["creditscore"] = int(bureau_score_segment["SCORE"])
    except:
        bureau_details["creditscore"] = "No Credit Score"

    try:
        bureau_details["activeloans"] = len(
            bureau_automated[bureau_automated['Loan_status'] == "Active"])
    except:
        bureau_details["activeloans"] = "No Active Loans."

    try:
        bureau_details["totalpos"] = (
            int(bureau_automated["Current Balance"].sum()))
    except:
        bureau_details["totalpos"] = "Not Available"

    try:
        data_dpd = bureau_account_segment_tl
        data_dpd = data_dpd.dropna(subset=['PAYMENT_HST_1'])
        data_dpd['PAYMENT_HST_2'] = data_dpd['PAYMENT_HST_2'].fillna("XXX")
        data_dpd['payment'] = data_dpd['PAYMENT_HST_1'] + \
            data_dpd['PAYMENT_HST_2']
        data_dpd['payment_new'] = data_dpd['payment'].apply(
            lambda x: [x[i:i+3] for i in range(0, len(x), 3)])
        data_dpd = data_dpd[data_dpd['DATE_PAYMENT_HST_END'] != ""]
        data_dpd['date'] = data_dpd.apply(lambda row: list(pd.date_range(
            start=row['DATE_PAYMENT_HST_START'], end=row['DATE_PAYMENT_HST_END'], freq='-1MS')), axis=1)
        data_dpd['combined'] = data_dpd.apply(lambda row: list(
            zip(row['payment_new'], row['date'])), axis=1)

        data_dpd = data_dpd.reset_index()
        data_dpd_final = pd.DataFrame(np.concatenate(data_dpd['combined']), columns=[
                                      'DPD', 'DPD_month']).reset_index(drop=True)

        temp1 = data_dpd_final.copy()
        temp1['DPD'] = temp1['DPD'].replace("XXX", 0)
        temp1['DPD'] = temp1['DPD'].replace("STD", 0)
        temp1['DPD'] = temp1['DPD'].replace("SMA", 90)
        temp1['DPD'] = temp1['DPD'].replace("LSS", 360)
        temp1['DPD'] = temp1['DPD'].replace("DBT", 270)
        temp1['DPD'] = temp1['DPD'].replace("SUB", 180)
        temp1['DPD'] = pd.to_numeric(temp1['DPD'], errors="coerce")
        bureau_details["maxdpd"] = str(temp1['DPD'].max())

    except:

        bureau_details["maxdpd"] = "Not Available"

    try:

        temp2 = temp1[temp1['DPD'] != 0]

    except:
        bureau_details['recentdpd'] = "Not Available"

    # try:
    #     bureau_account_segment_tl['DATE_CLOSED'] = pd.to_datetime(
    #         bureau_account_segment_tl['DATE_CLOSED'])

    #     recentlyclosedloandate = bureau_account_segment_tl['DATE_CLOSED'].max()
    #     bureau_details['recentlyclosedloandate'] = (
    #         dt.datetime.today()-recentlyclosedloandate)
    #     bureau_details['recentlyclosedloandate'] = {
    #         'days': bureau_details['recentlyclosedloandate'].days,
    #         'seconds': bureau_details['recentlyclosedloandate'].seconds,
    #         'microseconds': bureau_details['recentlyclosedloandate'].microseconds
    #     }

    #     if (pd.isnull(bureau_details['recentlyclosedloandate'])):
    #         bureau_details['recentlyclosedloandate'] = "No Loans Closed"
    # except:
    #     pass
    # try:
    #     bureau_details['Name'] = personal_info['CUSTOMER_NAME'][0]
    # except:
    #     pass
    # try:

    #     bureau_details['DISTRICT'] = personal_info['Location'][0]
    #     bureau_details['Purpose'] = personal_info['LOAN_PURPOSE'][0]
    #     bureau_details['Loan_amount'] = personal_info['LOAN_AMOUNT'][0]
    # except:
    #     pass

    try:
        bureau_details["Name"] = lmsdetails["CUSTOMER_NAME"][0]
        lmsdetails["CUSTOMER_DOB"] = pd.to_datetime(lmsdetails["CUSTOMER_DOB"])
        # bureau_details["Age"]=int((dt.date.today-lmsdetails["CUSTOMER_DOB"])/365)
        bureau_details["Location"] = lmsdetails["DISTRICT"][0] + \
            " ,"+lmsdetails["STATE"][0]
        bureau_details["Deal_id"] = deal_id
        bureau_details["Purpose"] = lmsdetails["LOAN_PURPOSE"][0]
        bureau_details["Loan_amount"] = format_currency(
            lmsdetails["LOAN_AMOUNT"][0], 'INR', locale='en_IN')

        bureau_details["Tenure"] = lmsdetails["TENURE"][0]
        bureau_details["Salary"] = lmsdetails["Salary"][0]

    except:
        pass

    try:
        bureau_automated.dropna(subset=['EMI_edited'], inplace=True)
        bureau_automated['EMI_edited'].fillna(0, inplace=True)
        bureau_automated['EMI_edited'] = bureau_automated['EMI_edited'].astype(
            'float')
        bureau_details['EMI_Sum'] = int(bureau_automated['EMI_edited'].sum())
    except:
        bureau_details['EMI_Sum'] = 0

    try:

        from datetime import timedelta
        print(bank_bank)
        closing_bal = bank_bank.balance[bank_bank.last_valid_index()]
        bureau_details['closingbalance'] = closing_bal

        df = bank_bank.reset_index()

        start = df['txn_date'].min()
        end = df['txn_date'].max()

        df['txn_date'] = pd.to_datetime(df['txn_date'])

        # Find the date of the last transaction
        last_transaction_date = df['txn_date'].max()

        # Calculate the date 3 months ago from the last transaction
        three_months_ago = last_transaction_date - pd.DateOffset(months=3)

        # Filter data for the last 3 months from the last transaction
        filtered_df = df[(df['txn_date'] >= three_months_ago)
                         & (df['txn_date'] <= last_transaction_date)]

        # Calculate the sum of debit and credit for the last 3 months from the last transaction
        filtered_df['debit'] = pd.to_numeric(
            filtered_df['debit'], errors='coerce').fillna(0).astype(int)
        filtered_df['credit'] = pd.to_numeric(
            filtered_df['credit'], errors='coerce').fillna(0).astype(int)
        total_debit = filtered_df['debit'].sum()
        total_credit = filtered_df['credit'].sum()

        # Calculate debit to credit ratio
        # Calculate debit to credit ratio
        bureau_details['dtocratio'] = round(total_debit / total_credit, 2)

        start1 = start.date()
        start1 = str(start1)
        end1 = end.date()
        end1 = str(end1)
        df2 = pd.DataFrame(data={'date': pd.date_range(
            start, end-timedelta(days=0), freq='d').tolist()})

        df2 = df2.merge(df[['txn_date', 'balance']],
                        left_on='date', right_on='txn_date', how='left')
        df2.drop(columns=['txn_date'], inplace=True)
        df2 = df2[df2['balance'].notna()]
        df2['balance'].fillna(method='ffill', inplace=True)
        df2['month_year'] = df2['date'].dt.month.astype(
            str)+'-'+df2['date'].dt.year.astype(str)
        df2['balance'] = df2['balance'].astype(float)

        a = df2.groupby('month_year')['balance'].mean()
        last_3_months_average = a.tail(3)
        bureau_details['last3month'] = str(int(last_3_months_average.mean()))

        try:
            bureau_details['chequebounce'] = int(
                df[df['transaction_type'] == 'Bounced']['transaction_type'].count()/2)
        except:
            bureau_details['chequebounce'] = 0

        try:
            df['credit'] = pd.to_numeric(df['credit'], errors='coerce')
            bureau_details['cashcreditratio'] = round((df.loc[(
                df['mode'].str.lower().str.strip() == 'cash'), 'credit'].sum()/df.credit.sum()), 2)
        except:
            bureau_details['cashcreditratio'] = "NR"

    except:
        pass

    # json_records = bureau_details.to_json(orient='records')
    # data = json.loads(json_records)
    # pydict = json.dumps([data])\

    # bureau_details["totalpos"] = format_currency(
    #     bureau_details["totalpos"][0], 'INR', locale='en_IN')
    # formatted_totalpos = '₹' + '{:,.2f}'.format(bureau_details['totalpos']).rstrip('0').rstrip('.')
    #
    # # formatted_closingbal = '₹' + '{:,.2f}'.format(bureau_details['closingbalance']).rstrip('0').rstrip('.')
    # # Format closingbalance in Indian Rupees
    # formatted_closingbalance = '₹' + '{:,.2f}'.format(float(bureau_details['closingbalance'])).rstrip('0').rstrip('.')

    # # Format last3month in Indian Rupees
    # last3month_value = float(bureau_details['last3month'])
    # formatted_last3month = '₹{:,.2f}'.format(last3month_value)
    # # Update the data dictionary with the formatted value
    # bureau_details['last3month'] = formatted_last3month

    # Format last3month in Indian Rupees
    last3month_value = bureau_details['last3month']
    formatted_last3month = format_currency(
        last3month_value, 'INR', locale='en_IN')

    # Remove trailing zeroes after decimal
    formatted_last3month = formatted_last3month.rstrip('0').rstrip(
        '.') if '.' in formatted_last3month else formatted_last3month

    # Update the bureau_details dictionary with the formatted value
    bureau_details['last3month'] = formatted_last3month

    # Format totalpos in Indian Rupees
    totalpos_value = bureau_details['totalpos']
    formatted_totalpos = format_currency(totalpos_value, 'INR', locale='en_IN')

    # Remove trailing zeroes after decimal
    formatted_totalpos = formatted_totalpos.rstrip('0').rstrip(
        '.') if '.' in formatted_totalpos else formatted_totalpos

    # Update the bureau_details dictionary with the formatted value
    bureau_details['totalpos'] = formatted_totalpos

    loan_amount = bureau_details['Loan_amount']
    loan_amount = loan_amount.replace('.00', '')  # Removing trailing ".00"
    bureau_details['Loan_amount'] = loan_amount
    try:
        if int(bureau_details['Salary']) > 0:
            bureau_details['Employment'] = 'Salaried'
        else:
            bureau_details['Employment'] = 'Self Employed'
    except:
        bureau_details['Employment'] = 'Self Employed'
    try:
        salary_value = bureau_details['Salary']
        formatted_salary = format_currency(salary_value, 'INR', locale='en_IN')
        # Remove trailing zeroes after decimal
        formatted_salary = formatted_salary.rstrip('0').rstrip(
            '.') if '.' in formatted_salary else formatted_salary

        bureau_details['Salary'] = formatted_salary

        bureau_details['Salary'] = bureau_details['Salary'].replace("₹", "₹ ")

    except:
        bureau_details['Salary'] = ("₹ 0")

    bureau_details['totalpos'] = bureau_details['totalpos'].replace("₹", "₹ ")
    bureau_details['last3month'] = bureau_details['last3month'].replace(
        "₹", "₹ ")
    bureau_details['Loan_amount'] = bureau_details['Loan_amount'].replace(
        "₹", "₹ ")



    json_records_1 = summary_calculator_data.to_json(orient='records')
    summary_calculator_data = json.loads(json_records_1)




    return HttpResponse(json.dumps([bureau_details,summary_calculator_data]))




def executivesummarysavefetch(request):
    # notes=request.POST.getlist('data[notes]')
    # loan_considered=request.POST.getlist('data[loanAmount]')
    # tenure=request.POST.getlist('data[tenure]')
    # roi=request.POST.getlist('data[roi]')
    # newEmi=request.POST.getlist('data[newEmi]')
    # totalEmi=request.POST.getlist('data[totalEmi]')
    # foirStated=request.POST.getlist('data[foirStated]')
    # foirInflow=request.POST.getlist('data[foirInflow]')
    # recommendation=request.POST.getlist('data[recommendation]')
    # notes=request.POST.getlist('data[notes]')
    # deal_id=request.POST.getlist('data[deal_id]')
    notes = [str(note) for note in request.POST.getlist('data[notes]')]
    loan_considered = [str(loan) for loan in request.POST.getlist('data[loanAmount]')]
    tenure = [str(ten) for ten in request.POST.getlist('data[tenure]')]
    roi = [str(rate) for rate in request.POST.getlist('data[roi]')]
    newEmi = [str(emi) for emi in request.POST.getlist('data[newEmi]')]
    totalEmi = [str(emi) for emi in request.POST.getlist('data[totalEmi]')]
    foirStated = [str(foir) for foir in request.POST.getlist('data[foirStated]')]
    foirInflow = [str(foir) for foir in request.POST.getlist('data[foirInflow]')]
    recommendation = [str(recommend) for recommend in request.POST.getlist('data[recommendation]')]
    deal_id = [str(id) for id in request.POST.getlist('data[deal_id]')]

    with connection.cursor() as cursor:
        query = "INSERT INTO `a5_kit`.`mysite_executivesummarydata` (lead_id, loan_considered, tenure, roi, new_emi, total_emi, foir_stated, foir_inflow, recommendation, notes) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE lead_id = VALUES(lead_id), loan_considered = VALUES(loan_considered), tenure = VALUES(tenure), roi = VALUES(roi), new_emi = VALUES(new_emi), total_emi = VALUES(total_emi), foir_stated = VALUES(foir_stated), foir_inflow = VALUES(foir_inflow), recommendation = VALUES(recommendation), notes = VALUES(notes);"

        with connection.cursor() as cursor:
            cursor.execute(query, [deal_id,loan_considered,tenure,roi,newEmi,totalEmi,foirStated,foirInflow,recommendation,notes])
    return HttpResponse("0")
