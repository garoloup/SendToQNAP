function saveOptions(e) {
  // chrome.storage.local.set({
  //   NASsecurevalue: document.querySelector("#NASsecure").value
  // });
  chrome.storage.local.set({
    NASsecure: document.querySelector("#NASsecure").checked
  });
  chrome.storage.local.set({
    NASaddress: document.querySelector("#NASaddress").value
  });
  chrome.storage.local.set({
    NASport: document.querySelector("#NASport").value
  });
  chrome.storage.local.set({
    NASlogin: document.querySelector("#NASlogin").value
  });
  chrome.storage.local.set({
    NASpassword: document.querySelector("#NASpassword").value
  });
  chrome.storage.local.set({
    NAStempdir: document.querySelector("#NAStempdir").value
  });
  chrome.storage.local.set({
    NASdir: document.querySelector("#NASdir").value
  });
//  e.preventDefault();
}

function restoreOptions() {
  function onError(error) {
    appendLog(`Error: ${error}`);
  }

  function setCurrentSecureValue(res){
      document.querySelector("#NASsecure").value = res.NASsecurevalue || "Secure" ;
      appendLog("Set DOM "+document.querySelector("#NASsecure").value+" with "+res.NASsecurevalue || "Secure")
  }

//     chrome.storage.local.get('NASsecurevalue',setCurrentSecureValue);


  function setCurrentSecure(res){
         document.querySelector("#NASsecure").checked = res.NASsecure ;
         appendLog("Set DOM "+document.querySelector("#NASsecure").checked+" with "+res.NASsecure )
     }

        chrome.storage.local.get('NASsecure',setCurrentSecure);


 function setCurrentAddress(res){
     document.querySelector("#NASaddress").value = res.NASaddress || "192.168.0.2" ;
     appendLog("Set DOM "+document.querySelector("#NASaddress").value+" with "+res.NASaddress || "192.168.0.2")
 }

    chrome.storage.local.get('NASaddress',setCurrentAddress);

function setCurrentPort(res){
     document.querySelector("#NASport").value = res.NASport || "80" ;
     appendLog("Set DOM "+document.querySelector("#NASport").value+" with "+res.NASport || "80")
 }

    chrome.storage.local.get('NASport',setCurrentPort);

 function setCurrentLogin(res){
     document.querySelector("#NASlogin").value = res.NASlogin || "admin" ;
      appendLog("Set DOM "+document.querySelector("#NASlogin").value+" with "+res.NASlogin || "admin" )
}

    chrome.storage.local.get('NASlogin',setCurrentLogin);

function setCurrentPassword(res){
     document.querySelector("#NASpassword").value = res.NASpassword || "aabbccdd" ;
      appendLog("Set DOM "+document.querySelector("#NASpassword").value+" with "+res.NASpassword || "aabbccdd")
}

    chrome.storage.local.get('NASpassword',setCurrentPassword);

    function setCurrentTempDir(res){
         document.querySelector("#NAStempdir").value = res.NAStempdir || "Download" ;
          appendLog("Set DOM "+document.querySelector("#NAStempdir").value+" with "+res.NAStempdir || "Download" )
    }

        chrome.storage.local.get('NAStempdir',setCurrentTempDir);


function setCurrentDir(res){
     document.querySelector("#NASdir").value = res.NASdir || "Public/Multimedia/Films" ;
      appendLog("Set DOM "+document.querySelector("#NASdir").value+" with "+res.NASdir || "Public/Multimedia/Films" )
}

    chrome.storage.local.get('NASdir',setCurrentDir);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
//document.addEventListener('DOMContentLoaded', LoadAndLogAndListDNL);
document.addEventListener('DOMContentLoaded', LoadAndLogAndListDNL_bis);

chrome.storage.onChanged.addListener(restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);


function changeNASInfo(newInfo)
{
  document.querySelector("#NASInfo").textContent=newInfo;
}

function toggleHideMenu() {
  var x = document.querySelector("#NASSettingForm");
//  appendLog("Section id "+id+" is "x.className.indexOf("showsection"))
  if (x.className.indexOf("hidesection") == -1) {
    x.className += "hidesection";
  } else {
    x.className = x.className.replace("hidesection", "");
  }
}
document.querySelector("#SettingsMenu").addEventListener("click", toggleHideMenu);

function toggleHideDebug() {
  var x = document.querySelector("#DebugLog");

  if (x.className.indexOf("hidesection") == -1) {
    x.className += "hidesection";
  } else {
    x.className = x.className.replace("hidesection", "");
  }
}
document.querySelector("#DebugMenu").addEventListener("click", toggleHideDebug);

function resetLog() {
  appendLog("Clear Logs");    document.getElementById('DebugLog').innerHTML = "";
}

document.querySelector("#ClearLogs").addEventListener("click", resetLog);


function copyLogDivToClipboard() {
    var range = document.createRange();
    range.selectNode(document.getElementById("DebugLog"));
    window.getSelection().removeAllRanges(); // clear current selection
    window.getSelection().addRange(range); // to select text
    document.execCommand("copy");
    window.getSelection().removeAllRanges();// to deselect
}


document.querySelector("#copyLogs").addEventListener("click", copyLogDivToClipboard);


/*==================
function showMessage(msg)
{
  appendLog("Show msg: "+msg);
  document.querySelector("#ErrMsg").textContent = msg;
  chrome.browserAction.setBadgeText({text:"Msg"});

}
function clearMessage()
{
  appendLog("Clear msg");
  document.querySelector("#ErrMsg").textContent = "";
  chrome.browserAction.setBadgeText({text:""});
}

function showError(msg)
{
  appendLog("Show error: "+msg);
  document.querySelector("#ErrMsg").textContent = msg;
  chrome.browserAction.setBadgeText({text:"Err"});
}

function clearError()
{
  appendLog("Clear Error");
  document.querySelector("#ErrMsg").textContent = "";
  chrome.browserAction.setBadgeText({text:""});
  document.querySelector("#NASpasswordLabel").style.color = "black";
}
*/

//=================
// Test NAS address & port 
// Still using XHR API for timeout capability
//=================
function testConnection()
{
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

    clearError();
    clearPopupError();

    chrome.storage.local.get(null,function(res) {
      var NASprotocol = "";
      var NASaddr = res.NASaddress;
      var NASport = res.NASport;
      var NASlogin = res.NASlogin;
      var NASpassword = res.NASpassword;
      var NASdir = res.NASdir;
      var NASsecure = res.NASsecure;
      if (NASsecure)
      {
        NASprotocol = "https";
      }
      else {
        NASprotocol = "http";
      }
      xhr.timeout = 2000;

    appendLog("settings "+res.NASsecure+" :"+NASprotocol+"://"+res.NASlogin+":"+res.NASpassword+"@"+res.NASaddress+":"+res.NASport+"/"+res.NASdir);
        xhr.addEventListener("error", (e) => {
          appendLog(e);
          showError("Err");
          showPopupError(e.message);//+": "+e.error.toString());

        });
        xhr.addEventListener("timeout", () => {
          appendLog(NASaddr+" not responding");
          showError("Err");
          showPopupError(NASaddr+" not responding");//+": "+e.error.toString());

        });
        xhr.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
          appendLog(this.responseText);
          if (this.status === 200)
          {
            if (this.responseText != null && this.responseText.length > 0)
            {
  //            var jsonObject = xml2json(this.responseText,"");
  //            var jsonObject = xml2json.parser(this.responseText);
  //            var jsonObject = xmlToJson.parse(this.responseText);

              var jsonObject = xmlToJSON.parseString(this.responseText);
              appendLog("json="+jsonObject);

              let NASModel = jsonObject.QDocRoot[0].model[0].modelName[0]._text;
              appendLog("model Name= "+NASModel);

              let NASDisplayName = jsonObject.QDocRoot[0].model[0].displayModelName[0]._text;
              appendLog("model displayModelName= "+NASDisplayName);

              appendLog("fmwr version= "+jsonObject.QDocRoot[0].firmware[0].version[0]._text);

              let NASHostname = jsonObject.QDocRoot[0].hostname[0]._text;
              appendLog("hostname = "+NASHostname);

              let NASIPinfo = jsonObject.QDocRoot[0].HTTPHost[0]._text;
              appendLog("HTTP = "+NASIPinfo);

              let NASPortInfo = jsonObject.QDocRoot[0].webAccessPort[0]._text;
              appendLog("port = "+NASPortInfo);
              changeNASInfo(NASHostname+" "+NASDisplayName+" "+NASIPinfo+":"+NASPortInfo);
   
            }
            else {
              showError("Err");
              showPopupError("Empty response from "+NASaddr);
            }
          }
          else {
            {
              if (this.status === 404)
                showPopupError("Err "+this.status +" Page not found "+NASaddr);
              else  if (this.status === 500)
                  showPopupError("Err "+this.status +" Server error of "+NASaddr);
              else
              showPopupError("Err "+this.status +" with "+NASaddr);
            }
          }
        }
    });
    var requete = NASprotocol+"://"+NASaddr+":"+NASport+"/cgi-bin/authLogin.cgi";
    appendLog("Request to send:"+requete);
    try {
      xhr.open("GET", requete);

      xhr.send();
    } catch (e) {
      appendLog(e);
      showPopupError(e.message);//+": "+e.error.toString());
    } finally {

    }
  });

}


document.querySelector("#testConnectionButton").addEventListener("click", testConnection);
