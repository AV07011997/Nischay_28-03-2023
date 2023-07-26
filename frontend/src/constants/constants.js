export const backendaddress = "http://127.0.0.1:8000/";
// export const backendaddress = "http://192.168.1.126:8000/";

export const staticImagesPath =
  "/Users/hardikbhardwaj/Documents/GitHub/Nischay_28-03-2023/frontend/staticfiles";

export const APIADDRESS = {
  LOGIN: "login/",
  TABLE: "home/",
  SEARCHSESSION: "search/searchsession/",
  UPLOADSTATEMENT: "upload_file/upload_data/",
  UPLOADFILES: "upload_file/bankstatements/",
  DOWNLOAD1: "download1/",
  TEST: "test/",
  BUREAUDATA: "get_bureau_data/",
  ANALYZEBANKSUMMARY: "bank_customer_kpi/",
  ANALYZEBANKMONTHWISE: "bank_customer_month_kpi/",
  ANALYZEBANKMONTHWISEPOPUP: "bank_customer_kpi_popup/",
  ANALYZECOUNTERPARTIES: "bank_entity_kpi/",
  ANALYZECOUNTERPARTIESMERGE: "bank_entity_kpi_merge/",

  ANALYZECOUNTERPARTIESPOPUP: "bank_entity_kpi_pop_up/",

  ANALYZESTATEMENTS: "statements/",
  UPLOADEDFILESDELETE: "delete_files/",
  UPDATEUPLOADLIST: "update_upload_list/",
  BUREAUMONTHWISE: "bureau_customer_month_kpi/",
  SAVEBUREAUDATA: "update_bureau_data/",
};

export const BUREAUPAGECOLUMNS = {
  columns: [
    { title: "Date Reported", field: "date_reported_som" },
    { title: "Loan Type", field: "Loan_type" },
    { title: "Loan Status", field: "Loan_status" },
    { title: "Disbursal Date", field: "Disbursal_date" },
    { title: "Disbursed amount", field: "Disbursed_amount" },
    { title: "Tenure(M)", field: "Tenure" },
    { title: "ROI(%)", field: "ROI" },
    { title: "EMI", field: "EMI" },
    { title: "Current Balance", field: "Current Balance" },
    { title: "Last DPD", field: "lastDpd" },
    { title: "Overdue Amount", field: "Overdue amount" },
    { title: "Source", field: "Source" },
    { title: "Value Type", field: "valueType" },
  ],
};
