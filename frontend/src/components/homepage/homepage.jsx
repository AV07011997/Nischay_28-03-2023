import React from "react";
import { FaUser, FaLock } from "react-icons/fa";
import "./homepage.css";
import { useRef } from "react";
import validator from "validator";
import { postApi } from "../../callapi";
import { APIADDRESS } from "../../constants/constants";
import Buttonutility from "../../utilities/button/buttonutility";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const HomePage = () => {
  window.DataStream = null;
  const userid = useRef();
  const password = useRef();
  const navigate = useNavigate();

  const handleClickEvent = async () => {
    if (validator.isEmail(userid.current.value)) {
      callingloginapi(userid.current.value, password.current.value);
    } else {
      toast.error("Please Enter Valid Email");
    }
  };
  const callingloginapi = async (username, password) => {
    const response = await postApi(APIADDRESS.LOGIN, {
      username: username,
      password: password,
    });
    console.log(response);
    if (response.login_page == true) {
      console.log(true);
      navigate("/home");
    } else {
      toast.error("Please Enter Valid Credentials");
    }
  };

  return (
    <div className="login">
      <div className="container">
        <div className="row">
          <div className="col-lg-2"></div>
          <div className="col-lg-8">
            <div className="login_wrap">
              <div className="row">
                <div className="col-md-6 text-center">
                  <img src="/images/logo.png" width="270" />
                </div>
                <div className="col-md-6 login_form">
                  <h3>
                    <span>Sign In</span>
                  </h3>
                  <div>
                    <input
                      type="hidden"
                      name="csrfmiddlewaretoken"
                      value="XjlI5XnmHeTGok4P8dcp6Q8FiYxkyNAbbwXDbhyR2BFcJ4nzPsHM1zxj2l2PDXMS"
                    />
                    <div className="row">
                      <div className="col-1">
                        <FaUser></FaUser>
                      </div>
                      <div className="col-10" style={{ paddingLeft: "10px" }}>
                        <input
                          type="text"
                          id="no-outline"
                          ref={userid}
                          className="form-control"
                          label={"first name"}
                          name={"userid"}
                          placeholder="Username"
                          required=""
                        />
                      </div>
                      <div className="col-1"></div>
                    </div>
                    <div className="row">
                      <div className="col-1">
                        <FaLock></FaLock>
                      </div>
                      <div className="col-9" style={{ paddingLeft: "10px" }}>
                        <input
                          type="password"
                          id="no-outline1"
                          ref={password}
                          className="form-control"
                          label={"last name"}
                          name={"password"}
                          placeholder="Password"
                          required=""
                        />
                      </div>
                      <div className="col-1">
                        <a id="passToggle"></a>
                      </div>
                    </div>

                    <div className="buttonsignin" onClick={handleClickEvent}>
                      <Buttonutility
                        text="Sign In"
                        width="160px"
                        height="30px"
                        textcolor="white"
                        backgroundcolor="black"
                      ></Buttonutility>
                    </div>
                  </div>
                  <p>
                    <strong>
                      <a className="forget" href="#">
                        Forgot Password?
                      </a>
                    </strong>
                  </p>
                  <hr />
                  <p>
                    Powered by <a href="#">Dhurin</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-2"></div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
