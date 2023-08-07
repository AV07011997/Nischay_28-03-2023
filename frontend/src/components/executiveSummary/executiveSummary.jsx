import React, { useEffect, useState } from "react";
import NavBar from "../../utilities/navbar/navbar";
import { postApi } from "../../callapi";
import { APIADDRESS } from "../../constants/constants";
import "./executiveSummar.css";

const ExecutiveSummary = () => {
  const [bureau_details, setBureau_Details] = useState();
  useEffect(() => {
    postApi("analyze/" + APIADDRESS.EXECUTIVESUMMARY, {
      leadID: localStorage.getItem("leadID"),
    }).then((res) => {
      setBureau_Details(res);
    });
  }, []);

  return (
    <div>
      <NavBar></NavBar>

      <div className="outerbox" style={{ display: "flex" }}>
        <div className="innertxtandbox">
          <div className="innertxt">
            <h6>Personal and Loan Details</h6>
          </div>

          <div className="innerbox">
            1.<span className="values">{bureau_details?.Name} </span>is{" "}
            <span class="values"> Age </span> years old and lives in
            <span className="values"> {bureau_details?.Location}. </span>
            <br />
            <br />
            2.<span className="values"> {bureau_details?.Name} </span>has
            applied for{" "}
            <span className="values">{bureau_details?.Purpose}</span> and{" "}
            <span className="values">{bureau_details?.Loan_amount}</span>
            <br />
            <br />
            3. <span className="values">{bureau_details?.Name} </span> is
            Individual/Joint applicant of the loan.
            <br />
            <br />
            4.<span className="values">{bureau_details?.Name} </span> is{" "}
            <span className="values">{bureau_details?.Salaried} </span>
            <br />
            <br />
            5.Applicant earns{" "}
            <span className="values">{bureau_details?.Salary} (Stated)</span>
          </div>
        </div>

        <div className="innertxtandbox">
          <div className="innertxt">
            <h6>Bureau Details</h6>
          </div>

          <div className="innerbox">
            1. Credit Bureau Score :
            <span className="values">{bureau_details?.creditscore}</span>
            <br />
            <br />
            2. Total number of active loans :{" "}
            <span className="values">{bureau_details?.activeloans}</span>
            <br />
            <br />
            3. Total live POS :{" "}
            <span className="values">{bureau_details?.totalpos}</span>
            <br />
            <br />
            4. Most Recent DPD :{" "}
            <span className="values">{bureau_details?.maxdpd} days. </span>
            <br />
            <br />
            5. Max dpd :{" "}
            <span className="values">{bureau_details?.maxdpd} days.</span>
            <br />
            <br />
            {/* 6. Time since recently closed loan :
            <span className="values">
              {bureau_details?.recentlyclosedloandate} months.
            </span> */}
            <br />
            <br />
          </div>
        </div>

        <div className="innertxtandbox">
          <div className="innertxt">
            <h6>Banking</h6>
          </div>

          <div className="innerbox">
            1. Latest Month Closing Balance :
            <span className="values">{bureau_details?.closingbalance}</span>
            <br />
            <br />
            2. Average Monthly Balance :
            <span className="values">{bureau_details?.last3month}</span>
            <br />
            <br />
            3. Debit to Credit Ratio(3M) :{" "}
            <span className="values">{bureau_details?.dtocratio} </span>
            <br />
            <br />
            4. Fixed Inflows =
            <br />
            <br />
            5.Fixed Outflows
            <br />
            <br />
            6. Debt to Income Ratio
            <br />
            <br />
            7. Cheque Bounce (Last 6M) :
            <span className="values">{bureau_details?.chequebounce} </span>
            <br />
            <br />
            8. Cash Credit Ratio::
            <span className="values">{bureau_details?.cashcreditratio} %</span>
            <br />
            <br />
          </div>
        </div>

        <div className="innertxtandbox">
          <div className="innertxt">
            <h6>Lending Scores</h6>
          </div>

          <div className="innerbox" style={{ width: "210px" }}>
            1. Bureau Risk Score
            <br />
            <br />
            2. Banking Based Score
            <br />
            <br />
            3. Application Score
            <br />
            <br />
            4. Alternate Partner Score
            <br />
            <br />
          </div>
        </div>
      </div>
    </div>
  );
};
export default ExecutiveSummary;
