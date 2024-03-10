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

//=================
// Test NAS address & port 
// Still using XHR API for timeout capability
//=================
async function testConnection()
{
    clearError();
    clearPopupError();

    chrome.storage.local.get(null,async function(res) {
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

    appendLog("settings "+res.NASsecure+" :"+NASprotocol+"://"+res.NASlogin+":"+res.NASpassword+"@"+res.NASaddress+":"+res.NASport+"/"+res.NASdir);

    var requete = NASprotocol+"://"+NASaddr+":"+NASport+"/cgi-bin/authLogin.cgi";
    appendLog("Request to send:"+requete);

    try {

        let response = await
            fetch(requete,{
                method: 'GET',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
                }
            })

          if (response.ok) {
            let xmlData = await response.text();
            console.log("testConnection: fetch reponse ok = "+xmlData);

            if (xmlData != null && xmlData.length > 0)
            {
                let NASmodel ="";
                let NASDisplayName = "";
                let NASfirmware ="";
                let NASHostname = "";
                let NASIPinfo = "";
                let NASWebPortInfo = "";
                let NASPortInfo = "";

                var jsonObject = xmlToJSON.parseString(xmlData);
                appendLog("json="+jsonObject);

                if (jsonObject.hasOwnProperty('QDocRoot') &&
                   jsonObject.QDocRoot[0].hasOwnProperty('model') &&
                   jsonObject.QDocRoot[0].model[0].hasOwnProperty('modelName')) {
                        NASModel = jsonObject.QDocRoot[0].model[0].modelName[0]._text;
                        appendLog("model Name= "+NASModel);
                    }

                if (jsonObject.hasOwnProperty('QDocRoot') &&
                   jsonObject.QDocRoot[0].hasOwnProperty('model') &&
                   jsonObject.QDocRoot[0].model[0].hasOwnProperty('displayModelName')) {
                   NASDisplayName = jsonObject.QDocRoot[0].model[0].displayModelName[0]._text;
                   appendLog("model displayModelName= "+NASDisplayName);
                }

                if (jsonObject.hasOwnProperty('QDocRoot') &&
                   jsonObject.QDocRoot[0].hasOwnProperty('firmware')) {
                    NASfirmware = jsonObject.QDocRoot[0].model[0]._text ;
                  appendLog("fmwr version= "+jsonObject.QDocRoot[0].firmware[0].version[0]._text);
                }

                if (jsonObject.hasOwnProperty('QDocRoot') &&
                   jsonObject.QDocRoot[0].hasOwnProperty('hostname')) {
                    NASHostname = jsonObject.QDocRoot[0].hostname[0]._text;
                    appendLog("hostname = "+NASHostname);
                }

               if (jsonObject.hasOwnProperty('QDocRoot') &&
                   jsonObject.QDocRoot[0].hasOwnProperty('HTTPHost')) {
                   NASIPinfo = jsonObject.QDocRoot[0].HTTPHost[0]._text;
                   appendLog("HTTP = "+NASIPinfo);
               }

               if (jsonObject.hasOwnProperty('QDocRoot') &&
                   jsonObject.QDocRoot[0].hasOwnProperty('webAccessPort')) {
                   NASWebPortInfo = jsonObject.QDocRoot[0].webAccessPort[0]._text;
                   appendLog("web port = "+NASWebPortInfo);
               }
               if (jsonObject.hasOwnProperty('QDocRoot') &&
                   jsonObject.QDocRoot[0].hasOwnProperty('stunnelport')) {
                   NASPortInfo = jsonObject.QDocRoot[0].stunnelport[0]._text;
                   appendLog("stunnel port = "+NASPortInfo);
               }
              changeNASInfo(NASHostname+" "+NASDisplayName+" "+NASIPinfo+":"+NASPortInfo);
   
            }
            else {
              showError("Err");
              showPopupError("Empty response from "+NASaddr);
            }
          }
        else {
              showError("Err");
              showPopupError("HTTP error "+ response.status + "response from "+NASaddr);
            }

    } catch (e) {
          appendLog(e);
          showError("Err");
          showPopupError(e.message);//+": "+e.error.toString());
    } finally {

    }
  });

}


document.querySelector("#testConnectionButton").addEventListener("click", testConnection);
