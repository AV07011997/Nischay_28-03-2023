import React, { useEffect } from "react";
import NavBar from "../../../../utilities/navbar/navbar";
import { postApi } from "../../../../callapi";

const AnalyzeStatement = (leadID) => {
  useEffect(() => {
    var statementsArray = [];
    postApi("analyze/" + APIADDRESS.ANALYZEBANKSUMMARY, {
      leadID: localStorage.getItem("leadID"),
    }).then((res) => {
      const temp = JSON.parse(res)[0].data;
      temp.forEach((element) => {
        if (element[0] != null) {
          statementsArray.push(element[0]);
        }
      });
      setTable(statementsArray);
    });
  }, []);
  return (
    <div>
      <NavBar></NavBar>

      <div>
        <div className="div_table1_monthwise">
          {table ? (
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
                {table?.map((item, i) => {
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
                                  getData(item.account_number);
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
      </div>
    </div>
  );
};
export default AnalyzeStatement;
