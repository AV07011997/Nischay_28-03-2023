import React from "react";
import "./upload.css";
import { getApi, postApi } from "../../callapi";
import { useState, useEffect } from "react";
import { APIADDRESS } from "../../constants/constants";
import NavBar from "../../utilities/navbar/navbar";
import { useParams } from "react-router-dom";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Worker } from "@react-pdf-viewer/core";
import { objectFunction } from "../../constants/objectFunction";
import Pageinfo from "../../utilities/pageInfo/pageInfo";
import MaterialTable from "@material-table/core";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { AiOutlineFilePdf } from "react-icons/ai";
import { AiFillDelete, AiOutlineFileAdd } from "react-icons/ai";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  var [table, settable] = useState();
  var [table1, settable1] = useState();
  const [deleteFileList, setDeleteFileList] = useState();
  const [mergefiles, setmergefiles] = useState();
  const navigate = useNavigate();
  const params = useParams();
  var { radiovalue } = params;
  var { name } = params;
  var { uploadcount } = params;

  var mergedFilesUrl = [];
  var tableData = [];

  var formData = new FormData();

  var defaultLayoutPluginInstance = defaultLayoutPlugin();
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current.click();
  };

  useEffect(() => {
    getApi(
      APIADDRESS.UPLOADSTATEMENT + localStorage.getItem("leadID") + "/"
    ).then((response) => {
      if (response) {
        // console.log(response);
        if (response[1]) {
          table = objectFunction(response[1]);
          settable(table);
        }

        const table1 = objectFunction(response[0]);

        settable1(table1);
      }
    });
  }, []);
  // console.log(table1);
  var newFiles = [];
  var pdfurl = [];

  const handleFile = (e) => {
    newFiles.push(e.target.files);
    for (let i = 0; i < e.target.files.length; i++) {
      let reader = new FileReader();

      newFiles.push(e.target.files[i]);
      let selectedfile = e.target.files[i];
      reader.readAsDataURL(selectedfile);
      reader.onloadend = (e) => {
        mergefilesurl(selectedfile, e.target.result);

        pdfurl.push(e.target.result);
      };
    }
  };

  const mergefilesurl = (file, fileurl) => {
    mergedFilesUrl.push([file, fileurl]);
    setmergefiles(mergedFilesUrl);
  };

  const state = {
    columns: [
      { title: "File Name", field: "file_name" },
      { title: "Date", field: "date" },
      { title: "Status", field: "status" },
    ],
  };

  useEffect(() => {
    if (table) {
      for (let index of table) {
        let localobject = { fileName: index.file_name, date: index.date };
        tableData.push(localobject);
      }
    }
  }, [table]);

  const uplooadfiles = () => {
    var repeatnumber = 0;
    var repeateddocuments = {};
    var repeatfiles = [];

    for (let filesDataBase of table) {
      // console.log(filesDataBase);
      for (let newFiles in mergefiles) {
        console.log(table1);
        console.log(table);

        if (
          filesDataBase.file_name == mergefiles[newFiles][0].name &&
          filesDataBase.status != "Deleted"
          // JSON.stringify(filesDataBase.lead_id) == JSON.stringify(radiovalue)
        ) {
          repeatnumber = repeatnumber + 1;
          let repeatfilesvariable =
            "File Name: " +
            filesDataBase.file_name +
            " Customer Name: " +
            filesDataBase.name +
            " Lead ID: " +
            filesDataBase.lead_id +
            " ";
          repeatfiles.push(repeatfilesvariable);
        }
      }
    }

    if (repeatnumber > 0) {
      alert("File(s) already present in the database ");

      alert(repeatfiles.join("\n"));
    }
    if (repeatnumber == 0) {
      formData.append("lead_id", radiovalue);
      formData.append("name", name);
      formData.append("lead_id__count", uploadcount);
      for (let files in mergefiles) {
        formData.append(files, mergefiles[files][0]);
      }

      postApi(APIADDRESS.UPLOADFILES, formData, false, false).then(
        (response) => {
          if (response == 1) {
            alert("Statements uploaded successfully");
            navigate(`/home`);
          }
        }
      );
    }
  };

  const removepdfview = (fileurl) => {
    const localmergedfile = [];
    for (let combinedfile of mergefiles) {
      if (fileurl == combinedfile[1]) {
      } else {
        localmergedfile.push(combinedfile);
      }
    }
    setmergefiles(localmergedfile);
  };
  const deleteFiles = async () => {
    var jsonData = JSON.stringify(deleteFileList);

    // console.log(deleteFileList);
    const response = await postApi(
      "upload_file/" + APIADDRESS.UPLOADEDFILESDELETE,
      {
        data: jsonData,
      }
    );
    // console.log(response);
    if (response == 1) {
      alert("File(s) successfully deleted");
      window.location.reload();
    }
  };

  postApi(APIADDRESS.UPDATEUPLOADLIST, {}).then((res) => {});

  return (
    <div>
      <div>
        <NavBar radiovalue={radiovalue}></NavBar>
      </div>
      <div>
        <Pageinfo leadId={radiovalue} name={name}></Pageinfo>
      </div>

      <input
        style={{ display: "none" }}
        ref={inputRef}
        type="file"
        multiple
        onChange={handleFile}
      />

      {deleteFileList?.length > 0 && (
        <div className="delete_option_upoad">
          <button className="delete_option_upoad_button" onClick={deleteFiles}>
            <AiFillDelete size={30} style={{ color: "red" }}></AiFillDelete>{" "}
            <span className="delete_option_upoad_text">
              Delete selected files
            </span>
          </button>
        </div>
      )}

      <div className="upload_table">
        <MaterialTable
          title="Upload table Records"
          columns={state.columns}
          data={table}
          options={{
            selection: true,
          }}
          actions={[
            {
              icon: () => {
                return (
                  <AiOutlineFileAdd
                    size={40}
                    style={{ color: "red", size: "10" }}
                  ></AiOutlineFileAdd>
                );
              },
              tooltip: "Add File",
              position: "toolbar",

              onClick: () => {
                handleClick();
              },
            },
          ]}
          onSelectionChange={(rows) => setDeleteFileList(rows)}
        />
      </div>

      {mergefiles &&
        mergefiles.map((items, i) => {
          return (
            <div key={i} className="pdfviewercontainer">
              <div className="removebutton_uploadpage">
                <button
                  onClick={() => {
                    removepdfview(items[1]);
                  }}
                >
                  <AiFillDelete
                    size={20}
                    style={{ color: "red" }}
                  ></AiFillDelete>
                  {items[0].name}
                </button>
              </div>
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.1.81/build/pdf.worker.min.js">
                <Viewer
                  fileUrl={items[1]}
                  plugins={[defaultLayoutPluginInstance]}
                />
              </Worker>
            </div>
          );
        })}

      {mergefiles?.length > 0 && (
        <div>
          <button className="uploadbutton" onClick={uplooadfiles}>
            Upload
          </button>
        </div>
      )}
    </div>
  );
};
export default Upload;
