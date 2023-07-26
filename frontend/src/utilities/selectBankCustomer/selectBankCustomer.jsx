import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Loader } from "rsuite";
import { postApi } from "../../callapi";
import { APIADDRESS } from "../../constants/constants";

const SELECTBANKCUSTOMER = (props) => {
  var [table1, settable1] = useState();
  var [optbank, setoptbank] = useState();
  const [acc_number, setacc_number] = useState();

  const api_address = props.apiaddress;

  const headers_select_customer = props.headers;

  var headers = [];
  if (headers_select_customer) {
    headers = [
      { header: "Account Number", rowspan: "2", colSpan: "1" },
      { header: "Bank Name", rowspan: "2", colSpan: "1" },
      { header: "Transactions", rowspan: "1", colSpan: "2" },
      { header: headers_select_customer, rowspan: "2", colSpan: "1" },
    ];
  } else {
    headers = [
      { header: "Account Number", rowspan: "2", colSpan: "1" },
      { header: "Bank Name", rowspan: "2", colSpan: "1" },
      { header: "Transactions", rowspan: "1", colSpan: "2" },
    ];
  }

  useEffect(() => {
    const getTable = async () => {
      const response = await postApi("analyze/" + api_address, {
        leadID: localStorage.getItem("leadID"),
      });
      settable1(response[0]);
    };

    getTable(); // run it, run it
  }, []);

  const table2 = (optbank) => {
    setacc_number(optbank);
    const getTable = async () => {
      const response = await postApi("analyze/" + api_address, {
        leadID: localStorage.getItem("leadID"),
        optbank: optbank,
      });
      setoptbank(response[0]["data"][1]);
    };

    getTable();
  };

  function sendData(data, acc_number, table1) {
    props.onData(data, acc_number, table1);
  }
  useEffect(() => {
    sendData(optbank, acc_number, table1);
  }, [optbank]);

  return (
    <div className="div_table1_monthwise">
      {table1 ? (
        <table style={{ width: "90%" }} className="table1_monthwise">
          <thead className="thead_table1_monthwise">
            <tr>
              <th rowSpan={2}>Account Number</th>
              <th rowSpan={2}>Bank Name</th>
              <th colSpan="2">Transactions</th>
              {headers_select_customer && <th rowSpan={2}>Counterparties</th>}
            </tr>
            <tr>
              <></>
              <></>
              <th>From</th>
              <th>To</th>
            </tr>
          </thead>
          <tbody>
            {table1["data"][0]?.map((item, i) => {
              {
                if (item) {
                  return (
                    <tr key={i}>
                      <td>
                        <label>
                          <input
                            type="radio"
                            id="radio_table"
                            name="radio_table"
                            value={item.account_number}
                            onClick={() => {
                              table2(item.account_number);
                            }}
                          />
                          <span className="radiobuttongap">
                            {item.account_number}
                          </span>
                        </label>
                      </td>
                      <td>{item.bank_name}</td>
                      <td>{item.from_date}</td>
                      <td>{item.to_date}</td>
                      {headers_select_customer && <td>{item.num_entities}</td>}
                    </tr>
                  );
                }
              }
            })}
          </tbody>
        </table>
      ) : (
        <Loader
          className="loader_landingpage"
          center
          size="lg"
          content="loading..."
        ></Loader>
      )}
    </div>
  );
};
export default SELECTBANKCUSTOMER;
