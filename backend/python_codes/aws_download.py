# import constants
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")

import django
django.setup()

from django.core.management import call_command
import schedule
import boto3
import time
import tabula
import datetime
import mysql.connector
import shutil
from pdfimage import pdf_image
from textract_python_table_parser import append_files
from hdfc import hdfc_digitization
from kotak import kotak_digitization
from sbi import sbi_digitization
from icici import icici_digitization
from axis import axis_digitization
from letest_corporation import corporation_digitization
from form_aws import form_data_itr
import os
from itrv import get_itrv_data
from form26as import get_form26as_data
from form16 import get_form16_data
from fstype_extraction_bank import bank_extraction
from bank_name_extraction import fstype_extraction
from django.db import connection
from datetime import datetime
from mysite.models import downloaded_file_details
from mysite.models import failed_digitization



from fstype_extraction_itr import itr_extraction
import glob
import csv



# bucket = 'a3bank'  ###define bucket name
# bucket1 = 'a3itr'  ###define bucket name
# bucket2 = 'digitizedfiles'
#
# s3 = boto3.resource('s3')

# file_path = r'C:\Users\Abhishek\Desktop\pdf_files'  ## Here the pdf is stored after uploading it into the web
# csv_path = r'C:\Users\Abhishek\Desktop\digitized_files'  ##  Here we will store the csv after digitisation
#
# # objects_bank = s3.Bucket(bucket).objects.all()   ###get all objects in the bucket
# # objects_itr = s3.Bucket(bucket1).objects.all()   ###get all objects in the bucket
#
# objects_bank = glob.glob(file_path + '*.pdf')  # manual testing


# objects_itr = glob.glob(r'D:\s3_itr\\*')       # manual testing

def job():
    print('Digitization')
    mydb = mysql.connector.connect(
        host='localhost',
        user='root',  ###connect to database
        password='Knowlvers@555',
        database="a5_kit"
    )

    mycursor = mydb.cursor()
    file_path = r'C:\Users\Abhishek\Desktop\pdf_files'  ## Here the pdf is stored after uploading it into the web
    csv_path = r'C:\Users\Abhishek\Desktop\digitized_files'  ##  Here we will store the csv after digitisation

    # objects_bank = s3.Bucket(bucket).objects.all()   ###get all objects in the bucket
    # objects_itr = s3.Bucket(bucket1).objects.all()   ###get all objects in the bucket

    # objects_bank = glob.glob(file_path)  # manual testing
    #
    # for obj in objects_bank:
    #
    #     try:
    #
    #         file = file_path ##+ '{}'.format(obj.key)
    #         # s3.Bucket(bucket).download_file(obj.key, constants.OUTPUT_PATH+'{}'.format(obj.key))  ###download file to bank folder
    #
    #         ### chek scanned/unscanned
    #
    #         passcode = ''
    #
    #         try:
    #
    #             tables = tabula.read_pdf(file, pages='all', password=passcode)
    #
    #         except:
    #
    #             passcode = ''
    #             tables = tabula.read_pdf(file, pages='all', password=passcode)
    #
    #         if len(tables) == 0:
    #             scanned_flag = 1
    #             file_path2 = pdf_image(file_path + '{}'.format(obj.key))
    #             append_files(file_path2, 'bank')
    #
    #         else:
    #             scanned_flag = 0
    #             # fstype='HDFC'
    #         files = glob.glob(file_path + '*.pdf')
    #
    #             for i in range(len(files)):
    #                 print(files[i])
    #                 fstype = bank_extraction(files[i])
    #                 if fstype == 'HDFC':
    #                     print('hdfc')
    #                     file_path = hdfc_digitization(file)  ##SHUBHAM EDIT
    #                     shutil.copy(file_path, csv_path)
    #
    #                 elif fstype == 'SBI':
    #                     file_path = sbi_digitization(file, '')
    #                     shutil.copy(file_path, csv_path)
    #
    #                 elif fstype == 'ICICI':
    #                     file_path = icici_digitization(file)
    #                     shutil.copy(file_path, csv_path)
    #
    #                 elif fstype == 'AXIS':
    #                     file_path = axis_digitization(file, '')
    #                     shutil.copy(file_path, csv_path)
    #
    #                 elif fstype == 'Corporation':
    #                     file_path = corporation_digitization(file, '')
    #                     shutil.copy(file_path, csv_path)
    #
    #                 elif fstype == 'KOTAK':
    #                     file_path = kotak_digitization(file, '')
    #                     shutil.copy(file_path, csv_path)
    #
    #         ###  end scanned/unscanned
    #
    #         ### insert document details into the table
    #
    #         sql = "INSERT INTO received_file_details (lead_id, file_name, file_type, file_extension, scanned, uploaded_output, uploaded_datetime) VALUES (%s, %s, %s, %s, %s, %s, %s);"
    #         lid = obj.key.split('_')[0]
    #         spl_word = '_'
    #         fname = obj.key.partition(spl_word)[2]
    #         # fname = ''.join(obj.key.split('_')[1:])
    #         ftype = 'bank'
    #
    #         extension = obj.key.split('.')[1]
    #         s = scanned_flag
    #         fswap = 'ok'
    #         hours = 5.5  ### add hours to match our local timezone
    #         hours_added = datetime.timedelta(hours=hours)
    #         uptime = str(obj.last_modified + hours_added).split('+')[0]
    #         # uptime=str(obj.last_modified).split('+')[0]
    #
    #         val = (lid, fname, ftype, extension, s, fswap, uptime)
    #
    #         mycursor.execute(sql, val)
    #
    #
    #     except Exception as e:
    #         print(e)
    #
    # mydb.commit()  ### until and unless you commit table will not be updated
    for filename in os.listdir(csv_path):
        if filename.endswith('.csv'):
            file_path = os.path.join(csv_path, filename)
            with open(file_path, newline='') as csvfile:
                reader = csv.reader(csvfile, delimiter=',', quotechar='"')
                next(reader)
                for row in reader:
                    print(row)



    files = glob.glob(r"C:\Users\Abhishek\Desktop\pdf_files\*.pdf")

    for i in range(len(files)):
        print(files[i])
        fstype = bank_extraction(files[i])

        if fstype == 'HDFC':
            str(files[i])
            print('hdfc')
            file_path = hdfc_digitization(files[i])
            file_name = files[i].split('\\')[-1][:-4]
            lead_id = file_name.split("\\")[0][:6]


            # with connection.cursor() as cursor:
            #     queryset = "INSERT INTO a5_kit.mysite_downloaded_file_details(lead_id, file_name,date ) VALUES(" + lead_id + ",'" + file_name + "," + now() + ");"
            #     cursor.execute(queryset)


            u = downloaded_file_details(lead_id=lead_id,file_name=file_name, date=datetime.now())
            u.save()
            os.remove(files[i])

        else:
            file_name = files[i].split('\\')[-1][:-4]
            lead_id = file_name.split("\\")[0][:6]
            u = failed_digitization(lead_id=lead_id, file_name=file_name)
            u.save()
            os.remove(files[i])

        # elif fstype == 'SBI':
        #     file_name = files[i].split('\\')[-1][:-4]
        #
        #     lead_id = file_name.split("\\")[0][:6]
        #
        #     u = failed_digitization(lead_id=lead_id, file_name=file_name)
        #     u.save()
        #     os.remove(files[i])
        #
        #     pass
        #     # str(files[i])
        #     #
        #     # file_path = sbi_digitization(files[i])
        #     # # response = s3.Bucket(bucket2).upload_file(file_path, Key=os.path.basename(file_path))
        #     # os.remove(files[i])
        #
        # elif fstype == 'ICICI':
        #     file_name = files[i].split('\\')[-1][:-4]
        #
        #     lead_id = file_name.split("\\")[0][:6]
        #
        #     u = failed_digitization(lead_id=lead_id,file_name=file_name)
        #     u.save()
        #     os.remove(files[i])
        #
        #     pass
        #
        #     # str(files[i])
        #     #
        #     # file_path = icici_digitization(files[i])
        #     # # response = s3.Bucket(bucket2).upload_file(file_path, Key=os.path.basename(file_path))
        #
        #
        # elif fstype == 'AXIS':
        #     file_name = files[i].split('\\')[-1][:-4]
        #
        #     lead_id = file_name.split("\\")[0][:6]
        #
        #     u = failed_digitization(lead_id=lead_id, file_name=file_name)
        #     u.save()
        #     os.remove(files[i])
        #     pass
        #     # file_path = axis_digitization(files[i])
        #     # # response = s3.Bucket(bucket2).upload_file(file_path, Key=os.path.basename(file_path))
        #     # os.remove(files[i])

        # elif fstype == 'Corporation':
        #     file_name = files[i].split('\\')[-1][:-4]
        #     lead_id = file_name.split("\\")[0][:6]
        #     u = failed_digitization(lead_id=lead_id,file_name=file_name)
        #     u.save()
        #
        #     os.remove(files[i])
        #
        #     pass
        #
        #     # file_path = corporation_digitization(files[i],'')
        #     # # response = s3.Bucket(bucket2).upload_file(file_path, Key=os.path.basename(file_path))
        #     # os.remove(files[i])

schedule.every(0.1).minutes.do(job)  ### frequency of code execution

while True:
    schedule.run_pending()
    time.sleep(1) 

