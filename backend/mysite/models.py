from django.db import models
from django.contrib.auth.models import User


class digitized_file_status(models.Model):
    # objects = None
    lead_id = models.CharField(primary_key=True, max_length=30)
    file_name = models.CharField(unique=True, max_length=50, blank=True)
    type = models.CharField(max_length=20)

    def __str__(self):
        return (self.lead_id)




class upload_file_details(models.Model):
    # id = models.AutoField(primary_key=True, default=True)
    lead_id = models.CharField(max_length=30)
    name = models.CharField(max_length=20)
    date = models.DateTimeField(null=True, default=' ')
    file_name = models.CharField(max_length=50, null=True, default=' ')
    type = models.CharField(max_length=20)
    status = models.CharField(max_length=100)

    def __int__(self):
        return (self.lead_id)


class downloaded_file_details(models.Model):
    # objects = None
    lead_id = models.CharField(max_length=200)
    file_name = models.CharField(max_length=200)
    date = models.CharField(max_length=500)

    # def __str__(self):
    #     return(self.lead_id)

class failed_digitization(models.Model):
    lead_id=models.CharField(max_length=10)
    file_name=models.CharField(max_length=100)




class los_did_cid_generation(models.Model):
    lead_id = models.CharField(max_length=20)
    deal_id = models.CharField(max_length=20)
    customer_id = models.CharField(max_length=20)
    name = models.CharField(max_length=30)
    bank = models.CharField(max_length=30, blank=True)
    account_number = models.CharField(max_length=30, blank=True)
    creation_time = models.DateTimeField()


class los_lid_generation(models.Model):
    lead_id = models.CharField(max_length=20)
    name = models.CharField(max_length=30)
    dob = models.DateField()
    aadhar = models.CharField(max_length=2, blank=True)
    district = models.CharField(max_length=20)
    state = models.CharField(max_length=20)
    pin_code = models.CharField(max_length=20)
    bank_name = models.CharField(max_length=50, blank=True)
    account = models.CharField(max_length=30, blank=True)
    creation_time = models.DateTimeField()


class bureau(models.Model):
    index = models.CharField(max_length=20, null=True, default=" ")
    Loan_Selection = models.CharField(max_length=10)
    Loan_Selection_edited = models.CharField(max_length=5)
    Loan_Selection_user_edited = models.BinaryField()
    Customer_Id = models.CharField(max_length=10)
    Date_reported = models.DateField()
    Loan_type = models.CharField(max_length=50)
    Loan_status = models.CharField(max_length=10)
    Disbursed_amount = models.CharField(max_length=20)
    Disbursed_amount_edited = models.CharField(max_length=10, null=True)
    Disbursed_amount_user_edited = models.CharField(max_length=10)
    Disbursal_date = models.DateField()
    Tenure = models.CharField(max_length=20, null=True)
    Tenure_new = models.CharField(max_length=20, null=True)
    Tenure_edited = models.CharField(max_length=20, null=True)
    Tenure_user_edited = models.BinaryField()
    ROI = models.CharField(max_length=10, null=True)
    ROI_new = models.CharField(max_length=50, null=True)
    ROI_edited = models.CharField(max_length=50, null=True)
    ROI_user_edited = models.BinaryField()
    EMI = models.CharField(max_length=50, null=True, blank=True)
    EMI_new = models.CharField(max_length=50, null=True, blank=True)
    EMI_edited = models.CharField(max_length=50, null=True, blank=True)
    EMI_user_edited = models.BinaryField()
    Current_Balance = models.CharField(max_length=50, blank=True)
    DPD = models.CharField(max_length=20, null=True, blank=True)
    DPD_month_new = models.CharField(max_length=50, blank=True, null=True)
    Overdueamount = models.CharField(max_length=20, blank=True)
    Source = models.CharField(max_length=20)
    lead_id = models.CharField(max_length=20, null=True, blank=True)
    final_selected = models.BinaryField()
    valuetype = models.CharField(max_length=30)
    salary = models.CharField(max_length=30)

    def __str__(self):
        return (self.Customer_Id)


class bank_bank(models.Model):
    bank_name = models.CharField(max_length=50)
    txn_date = models.DateField()
    description = models.CharField(max_length=200)
    debit = models.CharField(max_length=20)
    credit = models.CharField(max_length=20)
    balance = models.CharField(max_length=20)
    account_name = models.CharField(max_length=50)
    account_number = models.CharField(max_length=30)
    deal_id = models.CharField(max_length=10)
    customer_id = models.CharField(max_length=10)
    creation_time = models.DateTimeField()
    last_modification_time = models.DateTimeField()
    created_by_id = models.DateTimeField()
    last_modified_by_id = models.CharField(max_length=10, null=True)
    image_name = models.CharField(max_length=20)
    cheque_number = models.CharField(max_length=30)
    entity = models.CharField(max_length=50)
    mode = models.CharField(max_length=20)
    source_of_trans = models.CharField(max_length=20)
    sub_mode = models.CharField(max_length=30)
    transaction_type = models.CharField(max_length=30)
    lead_id=models.CharField(max_length=30)
    file_name=models.CharField(max_length=100)

    def __str__(self):
        return (self.customer_id)


class customer_allocation(models.Model):
    lid = models.CharField(max_length=20)
    did = models.CharField(max_length=20)
    cid = models.CharField(max_length=20)
    identifier = models.CharField(max_length=20)
    name = models.CharField(max_length=20)


class bureau_account_segment_tl(models.Model):
    RECORD_ID = models.CharField(max_length=20)
    BUREAU_ID = models.CharField(max_length=20)
    CUSTOMER_ID = models.CharField(max_length=20)
    ACCOUNT_HD_SEGMENT = models.CharField(max_length=20)
    REPORTER_SHORT_NAME = models.CharField(max_length=20)
    AC_RPT_MEMBER_NAME = models.CharField(null=True, default=" ", max_length=20)
    ACCOUNT_NUMBER = models.CharField(max_length=20)
    ACCOUNT_TYPE = models.CharField(max_length=20)
    OWNERSHIP_INDICATOR = models.CharField(max_length=20)
    DATE_AC_DISBURSED = models.DateField(max_length=20)
    DATE_LAST_PAYMENT = models.DateField(null=True)
    DATE_CLOSED = models.DateField(null=True)
    DATE_REPORTED_CERTIFIED = models.CharField(max_length=20)
    HIGH_CREDIT_AMOUNT = models.CharField(max_length=20)
    CURRENT_BALANCE = models.CharField(max_length=20)
    AMOUNT_OVER_DUE = models.CharField(max_length=20)
    PAYMENT_HST_1 = models.CharField(null=True, max_length=20)
    PAYMENT_HST_2 = models.CharField(max_length=20)
    DATE_PAYMENT_HST_START = models.DateField()
    DATE_PAYMENT_HST_END = models.DateField()
    SUIT_FILED = models.CharField(null=True, max_length=20)
    WRITTEN_OFF_STATUS = models.CharField(null=True, max_length=20)
    TYPE_OF_COLLATERAL = models.CharField(null=True, max_length=20)
    VALUE_OF_COLLATERAL = models.CharField(null=True, max_length=20)
    CREDIT_LIMIT = models.CharField(null=True, max_length=20)
    CASH_LIMIT = models.CharField(null=True, max_length=20)
    RATE_OF_INTEREST = models.CharField(null=True, max_length=20)
    REPAYMENT_TENURE = models.CharField(null=True, max_length=20)
    EMI_AMMOUNT = models.CharField(null=True, max_length=20)
    WRITEN_OFF_AMOUNT = models.CharField(null=True, max_length=20)
    WRITTEN_OFF_AMOUNT_TOTAL = models.CharField(null=True, max_length=20)
    WRITTEN_OFF_AMOUNT_PRINCIPAL = models.CharField(null=True, max_length=20)
    SETTLEMENT_AMOUNT = models.CharField(null=True, max_length=20)
    PAYMENT_FREQUENCY = models.CharField(null=True, max_length=20)
    ACTUAL_AMOUNT_PAYMENT = models.CharField(null=True, max_length=20)
    DATE_ENTRY_ERROR_CODE = models.CharField(null=True, max_length=20)
    ERROR_CODE = models.CharField(null=True, max_length=20)
    DATE_BUREAU_REMARK_CODE = models.CharField(null=True, max_length=20)
    ACCOUNT_HEADER_COUNT = models.CharField(null=True, max_length=20)
    source = models.CharField(max_length=20)
    final_selected = models.CharField(max_length=20)
