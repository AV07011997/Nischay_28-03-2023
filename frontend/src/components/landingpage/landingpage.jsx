import React, { useEffect } from "react";
import NavBar from "../../utilities/navbar/navbar";
import "./landingpage.css";
import { getApi } from "../../callapi";
import { APIADDRESS } from "../../constants/constants";
import { useState } from "react";
import { FaWindowClose } from "react-icons/fa";
import { ImCheckboxChecked } from "react-icons/im";
import { Loader } from "rsuite";
import { BiRightArrow, BiLeftArrow } from "react-icons/bi";
import { FiInfo } from "react-icons/fi";
import ScrollToTop from "../../utilities/moveToTop/moveToTop";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const LandingPage = ({ setinfo }) => {
  var [table, settable] = useState([]);
  const [radio, setradio] = useState();
  const [name, setname] = useState();
  const [uploadcount, setuploadcount] = useState();
  var [table2, settable2] = useState();
  const [search, setsearch] = useState({
    search: "",
  });
  const [upperLimit, setupperLimit] = useState();
  const [lowerLimit, setlowerLimit] = useState();

  const [valueDropdown, setValueDropdown] = useState(5);

  const [isHovering, setIsHovering] = useState(false);

  const tableheaders = [
    { value: "LMS Updates", colspan: "3" },
    { value: "Bank statements updates", colspan: "2" },
    { value: "Bureau Updates", colspan: "2" },
  ];

  const tablesubheaders = [
    "Lead id selection",
    "Customer name",
    "Creation Time",
    "Uploaded",
    "Digitized",
    "Synced",
    "Sync-Date",
  ];

  const tableHeaderVariable = [
    { lead_id: "Lead ID" },
    { deal_id: "Deal ID" },
    { name: "Customer Name" },
    { creation_time: "Last Modification Date" },
    { bank_uploaded: "Uploaded" },
    { bank_download: "Downloaded" },
    { bank_download_ready: "Download Ready" },
    { bureau_updated: "Synced" },
    { bureau_creation_time: "Sync-Date" },
  ];

  const handleChangeDropdown = (e) => {
    setValueDropdown(e.target.value);
  };

  const functionNavigateValue = (n) => {
    setupperLimit(upperLimit + n * valueDropdown);
    setlowerLimit(lowerLimit + n * valueDropdown);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setsearch({
      ...search,
      [name]: value,
    });
  };

  useEffect(() => {
    getApi(APIADDRESS.TABLE).then((response) => {
      settable(response["customer_detail"]);
      settable2(response["customer_detail"]);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("leadID", radio);
  }, [radio]);

  useEffect(() => {
    let local = [];
    if (search.search === "") {
      settable(table2);
    }
    if (search.search) {
      table = table2;
      for (let x of table) {
        var localobj = {};

        let nameList = x.name.toLowerCase();
        let searchInput = search.search.toLowerCase();
        let leadIdList = x.lead_id.toString();

        if (
          nameList.includes(searchInput) ||
          leadIdList.includes(searchInput)
        ) {
          for (let y of tableHeaderVariable) {
            Object.keys(y).forEach((res) => {
              localobj[res] = x[res];
            });
          }

          local.push(localobj);
        }
      }
      settable(local);
    }
  }, [search]);

  useEffect(() => {
    setupperLimit(parseInt(valueDropdown));
    setlowerLimit(0);
  }, [valueDropdown]);

  const setvalues = (leadId, customerId, dealId) => {
    setradio(leadId);
    let localarray = [leadId, customerId, dealId];
    setinfo(localarray);
  };

  const handleMouseOver = () => {
    setIsHovering(true);
  };

  const handleMouseOut = () => {
    setIsHovering(false);
  };

  // console.log(table);

  const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "#000000",
      color: "#ffffff",
      maxWidth: 220,
      fontSize: theme.typography.pxToRem(13),
      // border: "1px solid #dadde9",
    },
  }));

  console.log(table);
  return (
    <div>
      <NavBar
        radiovalue={radio}
        namevalue={name}
        uploadcount={uploadcount}
      ></NavBar>

      <div className="landingPage">
        {table ? (
          <>
            <input
              className="searchbar_landingpage"
              type="search"
              name="search"
              value={search.search}
              onChange={handleChange}
              placeholder="Search"
            ></input>
            <div className="table_landingpage">
              <table className="table_fixed">
                <thead className="landingpage_table_header">
                  <tr>
                    {tableheaders.map((items, i) => {
                      return (
                        <th colSpan={items["colspan"]} key={items["value"]}>
                          {items["value"]}
                        </th>
                      );
                    })}
                  </tr>
                  <tr>
                    {tablesubheaders.map((subheaders) => {
                      return <th key={subheaders}>{subheaders}</th>;
                    })}
                  </tr>
                </thead>

                <tbody>
                  {table?.map((item, i) => {
                    {
                      if (i < upperLimit && i >= lowerLimit) {
                        return (
                          <tr key={i}>
                            <td>
                              <label>
                                <input
                                  type="radio"
                                  id="radio_table"
                                  name="radio_table"
                                  value={item.lead_id}
                                  onClick={() => {
                                    setradio(item.lead_id);
                                    setname(item.name);
                                    setuploadcount(item.bank_uploaded);

                                    setvalues(
                                      item.lead_id,
                                      item.customer_id,
                                      item.deal_id
                                    );
                                  }}
                                />
                                <span className="radiobuttongap">
                                  {item.lead_id}
                                </span>
                              </label>
                            </td>
                            {/* <td>{item.deal_id}</td> */}
                            {/* <td>{item.customer_id}</td> */}
                            <td>{item.name}</td>
                            <td>{item.creation_time}</td>
                            <td>{item.bank_uploaded}</td>
                            {/* <td>{item.bank_download}</td> */}
                            <td className="digitizedtd">
                              <div className="hover_text">
                                {item.bank_download}

                                {item.bank_uploaded !== item.bank_download && (
                                  <HtmlTooltip
                                    title={
                                      <React.Fragment>
                                        In-progress:
                                        {item.bank_uploaded -
                                          item.failed_count -
                                          item.bank_download}
                                        <br></br>
                                        Failed :{item.failed_count}
                                      </React.Fragment>
                                    }
                                  >
                                    <Button className="hover_button">
                                      {item.failed_count === 0 ? (
                                        <FiInfo></FiInfo>
                                      ) : (
                                        <FiInfo
                                          style={{
                                            color: "red",
                                          }}
                                        ></FiInfo>
                                      )}
                                    </Button>
                                  </HtmlTooltip>
                                )}
                              </div>
                            </td>
                            {item.bureau_updated === "Yes" && (
                              <td>
                                <ImCheckboxChecked
                                  style={{ color: "green" }}
                                ></ImCheckboxChecked>
                              </td>
                            )}
                            {item.bureau_updated === "" && (
                              <td>
                                <FaWindowClose
                                  style={{ color: "red" }}
                                ></FaWindowClose>
                              </td>
                            )}
                            {/* <td>{item.bureau_creation_time}</td> */}
                          </tr>
                        );
                      }
                    }
                  })}
                </tbody>
              </table>
              <div className="paginationLandingPage">
                {lowerLimit > 0 && (
                  <button
                    className="divv3"
                    onClick={() => {
                      functionNavigateValue(-1);
                    }}
                  >
                    <BiLeftArrow></BiLeftArrow>
                  </button>
                )}
                <div className="divv1"></div>

                <select
                  id="dropDownLandingPage"
                  onChange={handleChangeDropdown}
                  className="divv3"
                >
                  <option value={5}>5 Rows</option>
                  <option value={10}>10 Rows</option>
                  <option value={15}>15 Rows</option>
                </select>

                <div className="divv2">
                  Pages {upperLimit / valueDropdown} /{" "}
                  {Math.floor(table.length / valueDropdown) + 1}
                </div>

                {upperLimit <= table.length && (
                  <button
                    className="divv3"
                    onClick={() => {
                      functionNavigateValue(1);
                    }}
                  >
                    <BiRightArrow></BiRightArrow>
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <Loader
            className="loader_landingpage"
            center
            size="lg"
            content="loading..."
          ></Loader>
        )}
      </div>
      <ScrollToTop className="tooltip"></ScrollToTop>
    </div>
  );
};
export default LandingPage;
