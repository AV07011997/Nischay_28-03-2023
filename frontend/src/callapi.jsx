import { backendaddress } from "../src/constants/constants";
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>;

export const postApi = async (address, data, content_type, process_data) => {
  var response;
  // console.log(data);

  await $.ajax({
    url: backendaddress + address,
    data: data,
    type: "POST",
    contentType: content_type,
    processData: process_data,
    success: function (res) {
      // console.log(res);
      // console.log(res);
      response = JSON.parse(res);
    },
  });

  return response;
};

export const getApi = async (address) => {
  var response;
  await $.ajax({
    url: backendaddress + address,
    type: "GET",
    data: null,
    cache: false,
    contentType: false,
    processData: false,
    success: function (res) {
      response = JSON.parse(res);
    },
  });

  return response;
};
