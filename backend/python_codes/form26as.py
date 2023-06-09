# -*- coding: utf-8 -*-
"""Form26AS Digitization.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1xvspcvMcu17opGrdWUmcuE3VHQdhbw0r

# **FUNCTION**
"""

import pandas as pd
import numpy as np
# !pip install tabula-py
import tabula

import glob
import re


########################################### Function for digitization. ###########################################################

def get_form26as_data(fname):
    files = glob.glob(fname)
    # print(files)

    for i in range(len(files)):
        file_name = files[i].split("\\")[-1][:-4]
        image_name = file_name + '.' + 'pdf'
        lid = file_name.split('_')[0]
        print('file= ', file_name)

    # reading the pdf table
    tables = tabula.read_pdf(files[i], pages='all', stream=True)

    ################## Assessee Table ################################

    df1 = tables[0]

    PAN = []
    Financial_Year = []
    Assessment_Year = []
    Current_pan_status = []
    Name_of_Assessee = []
    Address_of_Assessee = []

    # Finding the PAN Number from the columns

    df1.drop(columns='Unnamed: 0', inplace=True)

    for i in df1.columns.tolist():

        # If any Unnamed column is present then delete it

        # Using re function to find the 10 digit PAN number from the columns of df1 and storing them in list.
        temp = re.findall("([a-zA-Z0-9]{10,})", i)
        temp = list(temp)

        # Function to find whether list temp contain any number for it to be a PAN
        def num(s):
            return any(j.isdigit() for j in s)

        # Finding and appending the PAN value in list PAN
        for k in temp:
            if num(k) == True:
                PAN.append(k)

    columns = list(df1.columns)

    # Getting the Financial and Assessment Year and status of PAN

    for i in df1.columns.tolist():
        if "Financial" in i:
            Financial_Year.append(columns[columns.index(i) + 1])

        if "Assessment" in i:
            Assessment_Year.append(columns[columns.index(i) + 1])

        if "Status" in i:
            Current_pan_status.append(
                columns[columns.index(i) + 1])  # There's a problem here when using different pdf's

    # Getting the Name of Assessee
    for j in range(len(df1)):
        for k in range(len(df1.columns)):
            if "Name" in str(df1.iloc[j, k]):
                Name_of_Assessee.append(df1.iloc[j, k + 1])

    # Getting the Address of Assessee
    for j in range(len(df1)):
        for k in range(len(df1.columns)):
            if "Address" in str(df1.iloc[j, k]):
                add = (df1.iloc[j, k + 1])
                if df1.iloc[j + 1, k + 1] is None:
                    pass
                else:
                    add = add + str(df1.iloc[j + 1, k + 1])
                    Address_of_Assessee.append(add)

    # Generating the table

    assessee_table = pd.DataFrame({"PAN": PAN,
                                   "Financial_Year": Financial_Year,
                                   "Assessment_Year": Assessment_Year,
                                   "Current_pan_status": Current_pan_status,
                                   "Name_of_Assessee": Name_of_Assessee,
                                   "Address_of_Assessee": Address_of_Assessee,
                                   "Image_name": image_name,
                                   "lid": lid})
    # assessee_table.to_csv(r'Assessee.csv')

    ############################## Part A ################################################

    x = tables[1].copy()
    # xd=tables[1].copy()

    d2 = tables[2]
    d3 = tables[3]
    d4 = tables[4]
    d5 = tables[5]
    d6 = tables[6]
    d7 = tables[7]
    d8 = tables[8]
    d9 = tables[9]

    def check(c):
        c = c.columns.to_frame().T.append(c, ignore_index=True)
        c.columns = range(len(c.columns))

        for i in range(len(c)):
            for j in range(len(c.columns)):
                if '194A' in str(c.iloc[i, j]):
                    return 'yes'

    data = pd.DataFrame()

    if check(d2) == 'yes':
        print('A')
        if 'Unnamed: 0' in list(d2.columns):
            d2.drop(columns='Unnamed: 0', inplace=True)

        # for AIKPS5626C-2020-2021.pdf file
        if len(d2.columns) == 10:
            if '##' in d2.columns:
                d2.drop(columns='Tax Deducted', inplace=True)
                d2.rename(columns={'##': 'Total Tax Deducted #'}, inplace=True)
        else:
            pass

        d2 = d2.columns.to_frame().T.append(d2, ignore_index=True)
        d2.columns = range(len(d2.columns))
        data = pd.concat([data, d2], axis=0)

        if check(d3) == 'yes':
            print('B')
            if 'Unnamed: 0' in list(d3.columns):
                d3.drop(columns='Unnamed: 0', inplace=True)

            d3 = d3.columns.to_frame().T.append(d3, ignore_index=True)
            d3.columns = range(len(d3.columns))
            data = pd.concat([data, d3], axis=0)

            if check(d4) == 'yes':
                print('C')
                d4 = d4.columns.to_frame().T.append(d4, ignore_index=True)
                d4.columns = range(len(d4.columns))
                data = pd.concat([data, d4], axis=0)

                if check(d5) == 'yes':
                    d5 = d5.columns.to_frame().T.append(d5, ignore_index=True)
                    d5.columns = range(len(d5.columns))
                    data = pd.concat([data, d5], axis=0)

                    if check(d6) == 'yes':
                        d6 = d6.columns.to_frame().T.append(d6, ignore_index=True)
                        d6.columns = range(len(d6.columns))
                        data = pd.concat([data, d6], axis=0)

                        if check(d7) == 'yes':
                            d7 = d7.columns.to_frame().T.append(d7, ignore_index=True)
                            d7.columns = range(len(d7.columns))
                            data = pd.concat([data, d7], axis=0)

                            if check(d8) == 'yes':
                                d8 = d8.columns.to_frame().T.append(d8, ignore_index=True)
                                d8.columns = range(len(d8.columns))
                                data = pd.concat([data, d8], axis=0)

                                if check(d9) == 'yes':
                                    d9 = d9.columns.to_frame().T.append(d9, ignore_index=True)
                                    d9.columns = range(len(d9.columns))
                                    data = pd.concat([data, d9], axis=0)

    if len(data.columns) == 8:
        data = data.fillna(' ')
        data[1] = data[[1, 2, 3]].apply(lambda x: ' '.join(x), axis=1)
        data.drop(columns={2, 3}, inplace=True)
        if 'Unnamed: 1' in list(x.columns):
            x.drop(columns='Unnamed: 1', inplace=True)
        data.columns = ['Sr. No.', 'Name of Deductor', 'TAN of Deductor', 'Total Amount Paid/', 'Total Tax Deducted #',
                        'Total TDS']

    elif len(data.columns) == 9:
        data = data.fillna(' ')
        data[1] = data[[1, 2, 3, 4]].apply(lambda x: ' '.join(x), axis=1)
        data.drop(columns={2, 3, 4}, inplace=True)
        data.columns = ['Sr. No.', 'Name of Deductor', 'TAN of Deductor', 'Total Amount Paid/', 'Total Tax Deducted #',
                        'Total TDS']

    else:
        pass

    if len(x.columns) == 7:
        x = x.fillna(' ')
        x['Name of Deductor'] = x[['Unnamed: 0', 'Name of Deductor']].apply(lambda x: ' '.join(x), axis=1)
        x.drop(columns={'Unnamed: 0'}, inplace=True)
        if 'Unnamed: 1' in list(x.columns):
            x.drop(columns='Unnamed: 1', inplace=True)
        x.columns = ['Sr. No.', 'Name of Deductor', 'TAN of Deductor', 'Total Amount Paid/', 'Total Tax Deducted #',
                     'Total TDS']
    elif len(x.columns) == 8:
        x = x.fillna(' ')
        x['Name of Deductor'] = x[['Unnamed: 0', 'Name of Deductor', 'Unnamed: 1']].apply(lambda x: ' '.join(x), axis=1)
        x.drop(columns={'Unnamed: 0', 'Unnamed: 1'}, inplace=True)
        x.columns = ['Sr. No.', 'Name of Deductor', 'TAN of Deductor', 'Total Amount Paid/', 'Total Tax Deducted #',
                     'Total TDS']
    else:
        pass

    xd = x.copy()
    parta = pd.concat([x, data], axis=0)
    parta.reset_index(inplace=True)
    parta.drop(columns={'index'}, inplace=True)
    d = data.copy()

    if len(xd) == 0:
        pass
    else:
        xd['flag'] = [True if len(str(i)) == 10 else False for i in xd['TAN of Deductor']]
        xd = xd[xd['flag'] == True]
        if 'Unnamed: 0' in xd.columns:
            xd.drop(columns={'Unnamed: 0'}, inplace=True)
        xd.reset_index(inplace=True)
        xd.drop(columns={'index', 'flag'}, inplace=True)

        if len(d) == 0:
            pass
        else:
            d['flag'] = [True if len(str(i)) == 10 else False for i in d['TAN of Deductor']]
            d = d[d['flag'] == True]
            d.drop(columns={'Sr. No.', 'flag'}, inplace=True)
            d.reset_index(inplace=True)
            d.drop(columns={'index'}, inplace=True)

        if len(d) == 0:
            deduct = xd.copy()
        else:
            # d.columns=xd.columns
            deduct = pd.concat([xd, d], axis=0)

    deduct.reset_index(inplace=True)
    deduct.drop(columns={'index'}, inplace=True)
    deduct['Sr. No.'] = deduct.index + 1

    def transaction(t):

        # Removing the rows containing nan and 'Sr. No.' in column 1
        for j in range(len(t)):
            for k in range(len(t.columns)):
                try:
                    if "Sr. No." in str(t.iloc[j, k]):
                        t.drop(t.index[[j, j + 1]], axis=0, inplace=True)
                except:
                    pass

                # Creating column 'Remarks' to store the value of the remarks for each transaction

        for i in t.columns:
            if "TAN" in i:
                t["Remarks"] = t[i]

        # Finding the index of the column in which TAN of the deductor is present

        for i in list(t.columns):
            if "TAN" in i:
                k = list(t.columns).index(i)

        # Replacing any value in the TAN column which is not a 10 digit string with the value before it.
        # Basically repeating the TAN values in the row till any new value appears

        for j in range(len(t)):
            if len(str(t.iloc[j, k])) < 10:
                t.iloc[j, k] = t.iloc[j - 1, k]
            else:
                pass

        # Checking and removing the rows with nan values from column 1 and column 2

        for j in range(len(t)):
            for k in range(len(t.columns)):
                try:
                    if "nan" in str(t.iloc[j, 1]):
                        t.drop(t.index[[j]], axis=0, inplace=True)
                    if "nan" in str(t.iloc[j, 2]):
                        t.drop(t.index[[j]], axis=0, inplace=True)
                # if "Section 1" in str(x1.iloc[j,k]):
                # x1.drop(x1.index[[j]],axis=0,inplace=True)
                except:
                    pass

        return t

    if len(deduct) == 0:
        parta.to_csv('Transaction.csv')
        part1 = parta.copy()
    else:
        part1 = transaction(parta)

        part1.reset_index(inplace=True)
        part1.drop(columns={'index'}, inplace=True)

        part1['flag'] = [True if len(str(i)) != 10 else False for i in part1['Remarks']]
        part1 = part1[part1['flag'] == True]
        part1.reset_index(inplace=True)
        part1.drop(columns={'index', 'flag'}, inplace=True)

        x1 = part1.copy()

        # Splitting the values merged in the name of the deductor column and storing them in new columns.

        Section_1 = []
        Transaction_Date = []
        Status_of_Booking = []
        Date_of_Booking = []

        x1 = x1.iloc[1:]
        x1.reset_index(inplace=True)
        x1.drop(columns={'index'}, inplace=True)

        for i in x1['Name of Deductor']:
            l1 = i.split(" ")
            # print(l1)

            if len(l1) >= 4:
                Section_1.append(l1[0])
                Transaction_Date.append(l1[1])
                Status_of_Booking.append(l1[2])
                Date_of_Booking.append(l1[3])
                x2 = pd.DataFrame({'Section_1': Section_1, 'Transaction_Date': Transaction_Date,
                                   'Status_of_Booking': Status_of_Booking, 'Date_of_Booking': Date_of_Booking})

        x1 = x1.fillna(' ')
        for i in range(len(x1)):
            if x1['Remarks'][i] == ' ':
                x1.drop(x1.index[[i]], axis=0, inplace=True)

        x1.reset_index(inplace=True)
        x1.drop(columns={'index'}, inplace=True)

        x1 = pd.concat([x1, x2], axis=1)
        part1 = x1
        if 'Section_1' in part1.columns:
            name = part1.pop('Section_1')
            part1.insert(1, 'Section_1', name)

    # Cleaning parta data
    if len(deduct) == 0:
        dict = {'Sr_No.': [], "Section_1": [], "TAN_of_Deductor": [], "Amount_Paid_Credited": [], "Tax_Deducted": [],
                "TDS_Deposited": [], "Remarks": [], "Transaction_Date": [], "Status_of_Booking": [],
                "Date_of_Booking": [],
                "Name_of_Deductor": [], "Total_Amount_Paid_Credited": [], "Total_Tax_Deducted": []
            , "Total_TDS_Deposited": [], "PAN": [], "Name_of_Assessee": [], "Assessment_Year": []}
        table_parta = pd.DataFrame(dict)

    else:
        part1.drop(columns={'Name of Deductor'}, inplace=True)
        part1.rename(columns={'Unnamed: 0': 'Section_1', 'Total Amount Paid/': 'Amount_Paid',
                              'Total Tax Deducted #': 'Tax_Deducted', 'Total TDS': 'TDS_Deposited'}, inplace=True)
        deduct.drop(columns={'Sr. No.'}, inplace=True)
        deduct.rename(
            columns={'Total Amount Paid/': 'Total_Amount_Paid_Credited', 'Total Tax Deducted #': 'Total_Tax_Deducted',
                     'Total TDS': 'Total_TDS_Deposited'})

        deduct = deduct.rename(columns={'TAN_of_Deductor': 'TAN of Deductor'})
        table_parta = pd.merge(part1, deduct, on='TAN of Deductor', how='left')

    if 'Unnamed: 1' in table_parta.columns:
        table_parta.drop(columns={'Unnamed: 1'}, inplace=True)
    if 'Unnamed: 1_x' in table_parta.columns:
        table_parta.drop(columns={'Unnamed: 1_x'}, inplace=True)
    if 'Unnamed: 1_y' in table_parta.columns:
        table_parta.drop(columns={'Unnamed: 1_y'}, inplace=True)

    table_parta["PAN"] = PAN[0]
    table_parta["Name_of_Assessee"] = Name_of_Assessee[0]
    table_parta["Assessment_Year"] = Assessment_Year[0]

    # table_part_a.to_csv(r'PART A.csv')
    ####################################################################

    ############################## Part B ################################################

    # We apply the same method as we've used for part a extraction

    # first we need to extract the data of the collectors in part b table

    Name_of_Collector = []
    TAN_of_Collector = []
    Total_Amount_Paid_Debited = []
    Total_Tax_Collected = []
    Total_TCS_Deposited = []

    for tab in tables:
        cols = list(tab.columns)
        for i in cols:
            if "Collected" in i:
                data = tab

                for j in range(len(data)):
                    for k in range(len(data.columns)):

                        if "Section" in str(data.iloc[j, k]):

                            l1 = list(data.iloc[j - 1, :])
                            l1 = l1[1:]
                            l2 = []

                            for p in l1:
                                if "nan" not in str(p):
                                    l2.append(p)

                            if len(l2) > 1:
                                Name_of_Collector.append(l2[0])
                                TAN_of_Collector.append(l2[1])
                                Total_Amount_Paid_Debited.append(l2[2])
                                Total_Tax_Collected.append(l2[3])
                                Total_TCS_Deposited.append(l2[4])

    part_b_collec = pd.DataFrame({'Name_of_Collector': Name_of_Collector,
                                  'TAN_of_Collector': TAN_of_Collector,
                                  'Total_Amount_Paid_Debited': Total_Amount_Paid_Debited,
                                  'Total_Tax_Collected': Total_Amount_Paid_Debited,
                                  'Total_TCS_Deposited': Total_Amount_Paid_Debited})

    # Extracting all the transactions of collectors

    def extractct(x):

        for j in list(x.columns):
            if x[j].isna().sum() == (list(x.shape))[0]:
                del x[j]

            # df2=df2.iloc[1:]

        for j in range(len(x)):
            for k in range(len(x.columns)):
                try:
                    if "Sr. No." in str(x.iloc[j, k]):
                        x.drop(x.index[[j, j + 1]], axis=0, inplace=True)
                except:
                    pass

        for i in x.columns:
            if "TAN" in i:
                x["Remarks"] = x[i]

        for i in list(x.columns):
            if "TAN" in i:
                k = list(x.columns).index(i)
        for j in range(len(x)):
            if len(str(x.iloc[j, k])) < 10:
                x.iloc[j, k] = x.iloc[j - 1, k]

        for j in range(len(x)):
            for k in range(len(x.columns)):
                try:
                    if "nan" in str(x.iloc[j, 1]):
                        x.drop(x.index[[j]], axis=0, inplace=True)
                    if "nan" in str(x.iloc[j, 2]):
                        x.drop(x.index[[j]], axis=0, inplace=True)
                except:
                    pass

        x = x.reset_index()

        for i in list(x.columns):
            if "Name" in i:
                list1 = x[i].str.split(" ")
                if len(list1[0]) == 3:
                    x[['Transaction_Date', 'Status_of_Booking', 'Date_of_Booking']] = pd.DataFrame(
                        [x.split(' ') for x in x[i].tolist()])
                else:
                    x[['Transaction_Date', 'Status_of_Booking']] = pd.DataFrame([x.split(' ') for x in x[i].tolist()])
                    x['Date_of_Booking'] = x.iloc[:, (list(x.columns)).index(i) + 1]
                    del x["Unnamed: 1"]

        for i in x.columns:
            if "index" in i:
                del x[i]
            if "Name" in i:
                del x[i]
        return x

    if len(part_b_collec) == 0:
        dict = {'Sr_No.': [], "Section_1": [], "TAN_of_Collector": [], "Amount_Paid_Debited": [], "Tax_Collected": [],
                "TCS_Deposited": [], "Remarks": [], "Transaction_Date": [], "Status_of_Booking": [],
                "Date_of_Booking": [],
                "Name_of_Collector": [], "Total_Amount_Paid_Debited": [], "Total_Tax_Collected": []
            , "Total_TCS_Deposited": [], "PAN": [], "Name_of_Assessee": [], "Assessment_Year": []}
        table_part_b = pd.DataFrame(dict)
    else:
        part_b_trans = pd.DataFrame(extractct(data))

        # Renaming the columns for the desired output
        cols = ['Sr_No.',
                'Section_1',
                'TAN_of_Collector',
                'Amount_Paid_Debited',
                'Tax_Collected',
                'TCS_Deposited',
                'Remarks',
                'Transaction_Date',
                'Status_of_Booking',
                'Date_of_Booking']

        part_b_trans.columns = cols

        # Merging the two dataframes
        table_part_b = pd.merge(part_b_trans, part_b_collec, on=["TAN_of_Collector"], how="left")

        table_part_b["PAN"] = PAN[0]
        table_part_b["Name_of_Assessee"] = Name_of_Assessee[0]
        table_part_b["Assessment_Year"] = Assessment_Year[0]

    # table_part_b.to_csv(r'PART B.csv')

    ############################## Part C ################################################

    # Checking the tables for the columns containing the keyword 'Major' for extracting partc data
    for tab in tables:
        col = list(tab.columns)
        for i in col:
            if "Major" in i:
                data = tab
                partc = data.iloc[1:, :]  # Remove the first row of the table containg partc data

    # Deleting the unwanted columns
    del partc['3']
    del partc['2']

    table_part_c = partc

    table_part_c["PAN"] = PAN[0]
    table_part_c["Name_of_Assessee"] = Name_of_Assessee[0]
    table_part_c["Assessment_Year"] = Assessment_Year[0]

    # table_part_c.to_csv(r'PART C.csv')

    ############################## Part D ################################################

    # Checking the tables for the columns containing the keyword 'Refund' for extracting partd data
    partd = pd.DataFrame()

    for tab in tables:
        col = list(tab.columns)
        for i in col:
            if ("Nature of Refund" in i) or ('Amount of Refund' in i):
                data = tab
                partd = data.iloc[1:, :]  # Remove the first row of the table containg partc data

        for j in list(partd.columns):
            if "Unnamed" in j:
                partd["Interest"] = partd[j]
                del partd[j]

    table_part_d = partd

    table_part_d["PAN"] = PAN[0]
    table_part_d["Name_of_Assessee"] = Name_of_Assessee[0]
    table_part_d["Assessment_Year"] = Assessment_Year[0]

    # table_part_d.to_csv(r'PART D.csv')

    ############################## Part G ################################################

    # Checking the tables for the columns containing the keyword 'Refund' for extracting partd data

    for tab in tables:
        col = list(tab.columns)
        for i in col:
            if ("Short Payment" in i) or ('Short Deduction' in i):
                data = tab
                partg = data.iloc[1:, :]  # Remove the first row of the table containg partc data

    # Extracting data from the above dataframe
    Financial_Year = []
    Short_Payment = []
    Short_Deduction = []
    Interest_on_TDS = []
    Interest_on_TDS_1 = []
    Late_Filing_Fee_us = []
    Interest_us_220 = []
    Total_Default = []
    TAN = []

    for j in range(len(partg)):
        for k in range(len(partg.columns)):
            if "Short Payment" in str(partg.iloc[j, k]):

                # Getting the TAN if transactions are present
                if "TANs" in str(partg.iloc[j, k]):
                    TAN = str(partg.iloc[j + 2, k])
                else:
                    TAN = '-'
                print(TAN)

                l1 = list(partg.iloc[j - 1, :])  # Contains the details of each deductor in this table

                l1 = l1[1:]
                l2 = []
                for p in l1:
                    if "nan" not in str(p):
                        l2.append(p)

                # Same as what we did for assessee table
                if len(l2) > 1:
                    Financial_Year.append(l2[0])
                    Short_Payment.append(l2[1])
                    Short_Deduction.append(l2[2])
                    Interest_on_TDS.append(float(l2[3]))
                    Interest_on_TDS_1.append(l2[4])
                    Late_Filing_Fee_us.append(l2[5])
                    Interest_us_220.append(l2[6])
                    Total_Default.append(l2[7])
            else:
                pass

    table_part_g = pd.DataFrame(
        {'Financial Year': Financial_Year, 'Short Payment': Short_Payment, 'Short Deduction': Short_Deduction,
         'Interest on  TDS': Interest_on_TDS, 'Interest on  TDS.1': Interest_on_TDS_1,
         'Late Filing Fee u/s 234E': Late_Filing_Fee_us,
         'Interest u/s 220(2)': Interest_us_220, 'Total Default': Total_Default, 'TAN': TAN})

    table_part_g["PAN"] = PAN[0]
    table_part_g["Name_of_Assessee"] = Name_of_Assessee[0]
    table_part_g["Assessment_Year"] = Assessment_Year[0]

    # table_part_g.to_csv(r'PART G.csv')

    x = file_name.split('_')[0]
    y = file_name.split('_')[1:]

    z = x + '_form26as_asseseedetails_' + '_'.join(y)
    z1 = x + '_form26as_parta_' + '_'.join(y)
    z2 = x + '_form26as_partb_' + '_'.join(y)
    z3 = x + '_form26as_partc_' + '_'.join(y)
    z4 = x + '_form26as_partd_' + '_'.join(y)
    z5 = x + '_form26as_partg_' + '_'.join(y)

    assessee_table['lid'] = lid
    table_parta['lid'] = lid
    table_part_b['lid'] = lid
    table_part_c['lid'] = lid
    table_part_d['lid'] = lid
    table_part_g['lid'] = lid

    assessee_table.to_csv(r'D:\digitizedfiles\{}_i.csv'.format(z), index=False)
    table_parta.to_csv(r'D:\digitizedfiles\{}_i.csv'.format(z1), index=False)
    table_part_b.to_csv(r'D:\digitizedfiles\{}_i.csv'.format(z2), index=False)
    table_part_c.to_csv(r'D:\digitizedfiles\{}_i.csv'.format(z3), index=False)
    table_part_d.to_csv(r'D:\digitizedfiles\{}_i.csv'.format(z4), index=False)
    table_part_g.to_csv(r'D:\digitizedfiles\{}_i.csv'.format(z5), index=False)

    data_list = []

    data_list.append(r'D:\digitizedfiles\{}_i.csv'.format(z))
    data_list.append(r'D:\digitizedfiles\{}_i.csv'.format(z1))
    data_list.append(r'D:\digitizedfiles\{}_i.csv'.format(z2))
    data_list.append(r'D:\digitizedfiles\{}_i.csv'.format(z3))
    data_list.append(r'D:\digitizedfiles\{}_i.csv'.format(z4))
    data_list.append(r'D:\digitizedfiles\{}_i.csv'.format(z5))

    return data_list


"""# **FNAME**"""

# Calling the function
# digitize('AADCO0619H-2021.pdf')