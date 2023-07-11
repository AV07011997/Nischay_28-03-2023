import pandas as pd
import numpy as np
from datetime import timedelta
import matplotlib.pyplot as plt
import os
import squarify
from django.conf import settings
from babel.numbers import format_currency
from CONSTANT import path_digitized_folder,path_pdf_files_folder,path_static_files
from babel.numbers import format_currency
import calendar
def bck(data):
  df = data
  df['txn_date'] = pd.to_datetime(df['txn_date'], format='%Y-%m-%d')
  df['month_year'] = df['txn_date'].dt.month.astype(str)+'-'+df['txn_date'].dt.year.astype(str)
  df.debit = df.debit.replace(0.0,np.nan)
  df.credit = df.credit.replace(0.0,np.nan)
  df.sort_values('txn_date', ascending=True, inplace=True)
  print('output from python code')
  print(df['account_number'])
  df=df.reset_index()
  account_number=df['account_number'][0]
  start = df['txn_date'].min()
  end = df['txn_date'].max()
  start1 = start.date()
  start1 = str(start1)
  end1 = end.date()
  end1 = str(end1)

  opening_bal = df.balance[df.first_valid_index()]
  closing_bal = df.balance[df.last_valid_index()]

  table4 = pd.DataFrame({'Start_Date':[start1], 'End_Date':[end1], 'Opening_Balance':[opening_bal], 'Closing_Balance':[closing_bal]})

  df2 = pd.DataFrame(data={'date':pd.date_range(start,end-timedelta(days=0),freq='d').tolist()})
  
  df2 = df2.merge(df[['txn_date', 'balance']], left_on='date', right_on='txn_date', how='left')
  df2.drop(columns=['txn_date'], inplace=True)
  df2 = df2[df2['balance'].notna()]
  df2['balance'].fillna(method='ffill', inplace=True)
  df2['month_year'] = df2['date'].dt.month.astype(str)+'-'+df2['date'].dt.year.astype(str)
  df2['balance']=df2['balance'].astype(float)
  
  a = df2.groupby('month_year')['balance'].mean()

  avg_mthly_bal = AverageMonthlyBalance(df2)

  
  df['debit']=df['debit'].astype(float)
  temp=df[df['debit']>0]
  a=temp.loc[temp.debit.notnull(),:].groupby('month_year').debit.mean()
  avg_mthly_debit = (a.sum()/a.shape[0])

  df['credit']=df['credit'].astype(float)
  temp=df[df['credit']>0]
  a=temp.loc[temp.credit.notnull(),:].groupby('month_year').credit.mean()
  avg_mthly_credit = (a.sum()/a.shape[0])


  max_bal = df.balance.max()

  min_bal = df.balance.min()

  table = pd.DataFrame({'Average_Monthly_Balance':[avg_mthly_bal],'Average_Monthly_Debit':[avg_mthly_debit],'Average_Monthly_Credit':[avg_mthly_credit],'Maximum_Balance':[max_bal],'Minimum_Balance':[min_bal]})

  ratio_deb_cr = df.debit.sum()/df.credit.sum()
  ratio_cash_tot_cr = df.loc[(df['mode'].str.lower().str.strip()=='cash'),'credit'].sum()/df.credit.sum()

  if pd.notna(df.credit.idxmax()):
    mode_str = df.loc[df.credit.idxmax(),'mode']
    if pd.isna(mode_str):
      mode_str=''
    hi_cr_amt = format_currency(df.loc[df.credit.idxmax(), 'credit'], 'INR', locale='en_IN') + ' ('+mode_str+')'
  else:
    mode_str = ''
    hi_cr_amt = u"\u20B9"+str(np.nan) + ' ('+mode_str+')'
  hi_cr_amt_org = hi_cr_amt.replace(',','').replace('₹','').split(' ')[0]
  
  if pd.notna(df.debit.idxmin()):
    mode_str = df.loc[df.debit.idxmin(),'mode']
    if pd.isna(mode_str):
      mode_str=''
    low_deb_amt = format_currency(df.loc[df.debit.idxmin(), 'debit'], 'INR', locale='en_IN') + ' ('+mode_str+')'
  else:
    mode_str = ''
    low_deb_amt = u"\u20B9"+str(np.nan) + ' ('+mode_str+')'  
  low_deb_amt_org = low_deb_amt.replace(',','').replace('₹','').split(' ')[0]
  
  table2 = pd.DataFrame({'Ratio_Debit_Credit':[ratio_deb_cr], 'Ratio_Cash_Total_Credit':[ratio_cash_tot_cr], 'Lowest_Debit_Amount':[low_deb_amt], 'Highest_Credit_Amount':[hi_cr_amt], 'Lowest_Debit_Amount_Org':[low_deb_amt_org], 'Highest_Credit_Amount_Org':[hi_cr_amt_org]})
  table2['Lowest_Debit_Amount_Source'] = table2['Lowest_Debit_Amount'].apply(lambda x:x.split(' ')[1])
  table2['Highest_Credit_Amount_Source'] = table2['Highest_Credit_Amount'].apply(lambda x:x.split(' ')[1])
  
  number_cheque_bounce = int(df[df['transaction_type'] == 'Bounced']['transaction_type'].count()/2)
  
  min_amt_cheque_bounce = df[df['transaction_type']=='Bounced']
  min_amt_cheque_bounce=min_amt_cheque_bounce[min_amt_cheque_bounce['debit']>0]
  min_amt_cheque_bounce_greater_than_zero=min_amt_cheque_bounce
  min_amt_cheque_bounce=min_amt_cheque_bounce['debit'].min()
  latest_cheque_bounce_date= min_amt_cheque_bounce_greater_than_zero['txn_date'].max()
  latest_cheque_bounce=min_amt_cheque_bounce_greater_than_zero[min_amt_cheque_bounce_greater_than_zero['txn_date']==latest_cheque_bounce_date]
  latest_cheque_bounce=latest_cheque_bounce['debit']

  df2.sort_values(['date','balance'], ascending=[True,False], inplace=True)
  df2.drop_duplicates(['date'], keep='last', inplace=True)
  df2.reset_index(drop=True, inplace=True)
  days_with_bal_0_neg = df2.loc[df2.balance<=0,:].shape[0]
  df['balance']=df['balance'].astype(float)
  entries_0_neg_bal = df.loc[df['balance']<=0].shape[0]


  
  #number_charges_levied = int(df[df['transaction_type'] == 'Bounced']['transaction_type'].count()/2)
  number_charges_levied = np.nan

  table3 = pd.DataFrame({'Num_Chq_Bounce':[number_cheque_bounce], 'Min_Amt_Chq_Bounce':[min_amt_cheque_bounce], 'Latest_Chq_Bounce':[latest_cheque_bounce], 'Entries_Zero_Neg_Bal':[entries_0_neg_bal], 'Num_Charges_Levied':[number_charges_levied], 'Days_with_bal_0_neg':[days_with_bal_0_neg]})
  print('table3 =', table3)
  
  count_deb_txn = df.debit.count()
  
  
  count_cr_txn = df.credit.count()
  table1 = pd.DataFrame({'Num_Credit_Tnx':[count_cr_txn],'Num_Debit_Tnx':[count_deb_txn]})

  df3 = df2.copy()
  df3.drop_duplicates('month_year', keep='last', inplace=True)
  df3.rename(columns={'balance':'Closing Balance', 'month_year':'Month'}, inplace=True)
  df3.sort_values('date', inplace=True)
  df3.drop(columns='date', inplace=True)
  df3.reset_index(drop=True, inplace=True)
  df3['Month'] = pd.to_datetime(df3['Month'], format='%m-%Y')
  df3['Month'] = [i.strftime(format='%b-%y') for i in df3['Month']]
  df3['Closing Balance'] = df3['Closing Balance'].apply(lambda x : round(x))
  # df3['Closing Balance'] = df3['Closing Balance'].apply(lambda x : format_currency(x, 'INR', locale='en_IN'))
  # df3['Closing Balance'] = df3['Closing Balance'].astype('str')
  # df3['Closing Balance'] = df3['Closing Balance'].apply(lambda x : x.split('.')[0])

  #Old code of graph
  #def annotate_plot(frame, plot_col, label_col, **kwargs):
  #  for label, x, y in zip(frame[label_col], frame.index, frame[plot_col]):
  #    plt.annotate(format_currency(label, 'INR', locale='en_IN').split('.')[0], xy=(x, y), **kwargs, weight='bold')

  #plt.figure(figsize=(12,6))
  #plt.plot(df3['Month'],df3['Closing Balance'], color='#ee8a11', marker='o', linewidth=3)
  #annotate_plot(df3, 'Closing Balance', 'Closing Balance')
  #plt.title('Closing Balance Monthly Trend')
  #plt.xlabel('Month-Year', fontsize=14)
  #plt.ylabel('Closing Balance', fontsize=14)
  #plt.grid(True)

  # New code of graph
  plt.switch_backend('Agg')
  def annotate_plot(frame, plot_col, label_col, **kwargs):
    for label, x, y in zip(frame[label_col], frame.index, frame[plot_col]):
      currency_label = format_currency(label, 'INR', locale='en_IN')
      formatted_label = currency_label.replace('₹', '₹ ')
      plt.annotate(formatted_label.split('.')[0], xy=(x, y), **kwargs, weight='bold')
    # for label, x, y in zip(frame[label_col], frame.index, frame[plot_col]):
    #   plt.annotate(format_currency(label, 'INR', locale='en_IN').split('.')[0], xy=(x, y), **kwargs, weight='bold')


  plt.figure(figsize=(12, 6))



  # plt.yticks(range(min(df3['Closing Balance']), max(df3['Closing Balance'])+1))
  plt.plot(df3['Month'], df3['Closing Balance'], color='#ee8a11', marker='o', linewidth=3)
  ax = plt.gca()
  ax.set_yticklabels([])
  # ax.get_yaxis().get_major_formatter().set_scientific(False)
  annotate_plot(df3, 'Closing Balance', 'Closing Balance')
  plt.title('Closing Balance Monthly Trend',fontdict={'fontsize': 20, 'fontweight': 'bold'})
  # plt.xlabel('Month-Year', fontsize=14)
  plt.ylabel('Closing Balance', fontsize=14)
  plt.xticks(fontsize=12)
  plt.yticks(fontsize=12)
  plt.grid(True)
  #plt.show()
  path = os.path.join(path_static_files, account_number+'closing-balance-trend.png')

  plt.savefig(path)

  df = df.drop_duplicates()

### @@@@@@@@@@@@@@@@@@       Main logic code credit-debit frequency distribution graph  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


  debit_cash=df[df['mode'].str.lower().str.strip() == 'cash'][df['credit'] == 0]['debit'].count()
  credit_cash=df[(df['mode'].str.lower().str.strip() == 'cash') & (df['debit'] == 0)]['credit'].count()


  debit_cheque=df[df['mode'].str.lower().str.strip() == 'cheque'][df['credit'] == 0]['debit'].count()
  credit_cheque=df[df['mode'].str.lower().str.strip() == 'cheque'][df['debit'] == 0]['credit'].count()


  debit_net=df[(df['mode'].str.lower().str.strip().str.replace(' ', '')=='netbanking') & (df['credit'] == 0)]['credit'].count()
  credit_net=df[(df['mode'].str.lower().str.strip().str.replace(' ', '')=='netbanking') & (df['debit'] == 0)]['credit'].count()

  data = {'debit': [debit_cheque, debit_cash, debit_net],
          'credit': [credit_cheque, credit_cash, credit_net]
          }
  df10 = pd.DataFrame(data,columns=['debit','credit'], index = ['Cheque', 'Cash', 'Net Banking'])
  print(df10)
  df10.plot.barh(figsize=(12,6))
  plt.xticks(fontsize=12)
  plt.yticks(fontsize=12)
  plt.title('Count of Transactions by Mode',fontdict={'fontsize': 20, 'fontweight': 'bold'})
  plt.legend(['Debit', 'Credit'], loc='lower right')

  for i, (debit, credit) in enumerate(zip(df10['debit'], df10['credit'])):
    debit_label = f'{debit:,.0f}' if debit >= 1000 else f'{debit:.0f}'
    credit_label = f'{credit:,.0f}' if credit >= 1000 else f'{credit:.0f}'
    plt.text(debit+0.05, i-0.15, debit_label, fontsize=12)
    plt.text(credit+0.05, i+0.1, credit_label, fontsize=12)




  path = os.path.join(path_static_files, account_number+'feq-mode-txn.png')

  plt.savefig(path)

    

  df['flag2'] = ['Cash' if str(i).lower()=='cash' else 'Non-Cash' for i in df['mode']]
  df['flag1'] = ['Credit' if pd.notna(i) else 'Debit' for i in df['credit']]
  df['value'] = [i if pd.notna(i) else j for i,j in zip(df['debit'], df['credit'])]

  df1 = df.groupby(['flag1', 'flag2'], as_index=False).value.sum()

  fig1 = plt.figure()
  ax = fig1.add_subplot()
  fig1.set_size_inches(16, 5)

  labels = ["%s %s\n{}".format(format_currency(k, 'INR', locale='en_IN').split('.')[0]) % (i,j) for (i,j,k) in zip(df1.flag2, df1.flag1, df1.value)]

  # squarify.plot(sizes=df1['value'], label=labels, color=['#1e90ff', '#1e90ff', '#ff6600', '#ff6700'], alpha=.8, bar_kwargs=dict(linewidth=2, edgecolor="#f2f0f0"),text_kwargs={'fontsize':14,'weight':'bold', 'color':'white','wrap':True})
  plt.title('Inflow & Outflow',fontsize=18)

  plt.axis('off')
  #plt.show()
  #plt.show()
  path = os.path.join(path_static_files, account_number+'in-outflow.png')

  plt.savefig(path)

  return table,table1,table2,table3,table4

def AverageMonthlyBalance(df):

    monthly_df = df.groupby('month_year')

    AverageBalance = []

    for group_name, group_df in monthly_df:
      new_df = pd.DataFrame(group_df)

      AverageBalance.append(CalculationsMonthly(new_df))

    return np.mean(AverageBalance)


def assign_non_zero_to_previous_zeros(array):
  non_zero_found = False

  non_zero_value = None

  for i in range(len(array)):

    if array[i] != 0:
      non_zero_found = True

      non_zero_value = array[i]

    if non_zero_found and array[i] == 0:
      array[i] = non_zero_value

  return array


def CalculationsMonthly(DF):
  month = (DF['date'].iloc[0]).month

  year = (DF['date'].iloc[0]).year

  days_in_month = calendar.monthrange(year, month)[1]

  monthly_balance_array = np.zeros(days_in_month)

  final_records = DF.groupby('date').last().reset_index()

  final_records['day'] = final_records['date'].apply(lambda x: x.day)

  for index, row in final_records.iterrows():
    # Access individual row elements

    monthly_balance_array[row['day'] - 1] = row['balance']

  prevMaxBal = 0

  monthly_balance_array = assign_non_zero_to_previous_zeros(monthly_balance_array)

  for i in range(len(monthly_balance_array)):

    if (monthly_balance_array[i] == 0):

      monthly_balance_array[i] = prevMaxBal

    else:

      prevMaxBal = monthly_balance_array[i]

  return np.mean(monthly_balance_array)