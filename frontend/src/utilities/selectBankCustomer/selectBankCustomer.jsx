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

  useEffect(() => {
    const getTable = async () => {
      const response = await postApi("analyze/" + api_address, {
        leadID: localStorage.getItem("leadID"),
      });
      //   console.log(response);
      settable1(response[0]);
    };

    getTable(); // run it, run it
  }, []);

  const table2 = (optbank) => {
    setacc_number(optbank);
    console.log("called");
    const getTable = async () => {
      const response = await postApi(
        "analyze/" + APIADDRESS.ANALYZEBANKMONTHWISE,
        {
          leadID: localStorage.getItem("leadID"),
          optbank: optbank,
        }
      );
      console.log(response);
      setoptbank(response[0]["data"][1]);
    };

    getTable();
  };
  console.log(optbank);

  function sendData(data, acc_number) {
    props.onData(data, acc_number);
  }

  sendData(optbank, acc_number);

  return (
    <div className="div_table1_monthwise">
      {table1 ? (
        <table className="table1_monthwise">
          <thead className="thead_table1_monthwise">
            <tr>
              <th rowSpan={2}>Account Number</th>
              <th rowSpan={2}>Bank Name number</th>
              <th colSpan="2">Transactions</th>
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
                  console.log(item);
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
