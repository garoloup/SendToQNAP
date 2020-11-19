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
    console.log(`Error: ${error}`);
  }

  function setCurrentSecureValue(res){
      document.querySelector("#NASsecure").value = res.NASsecurevalue || "Secure" ;
      console.log("Set DOM "+document.querySelector("#NASsecure").value+" with "+res.NASsecurevalue || "Secure")
  }

//     chrome.storage.local.get('NASsecurevalue',setCurrentSecureValue);


  function setCurrentSecure(res){
         document.querySelector("#NASsecure").checked = res.NASsecure ;
         console.log("Set DOM "+document.querySelector("#NASsecure").checked+" with "+res.NASsecure )
     }

        chrome.storage.local.get('NASsecure',setCurrentSecure);


 function setCurrentAddress(res){
     document.querySelector("#NASaddress").value = res.NASaddress || "192.168.0.2" ;
     console.log("Set DOM "+document.querySelector("#NASaddress").value+" with "+res.NASaddress || "192.168.0.2")
 }

    chrome.storage.local.get('NASaddress',setCurrentAddress);

function setCurrentPort(res){
     document.querySelector("#NASport").value = res.NASport || "80" ;
     console.log("Set DOM "+document.querySelector("#NASport").value+" with "+res.NASport || "80")
 }

    chrome.storage.local.get('NASport',setCurrentPort);

 function setCurrentLogin(res){
     document.querySelector("#NASlogin").value = res.NASlogin || "admin" ;
      console.log("Set DOM "+document.querySelector("#NASlogin").value+" with "+res.NASlogin || "admin" )
}

    chrome.storage.local.get('NASlogin',setCurrentLogin);

function setCurrentPassword(res){
     document.querySelector("#NASpassword").value = res.NASpassword || "aabbccdd" ;
      console.log("Set DOM "+document.querySelector("#NASpassword").value+" with "+res.NASpassword || "aabbccdd")
}

    chrome.storage.local.get('NASpassword',setCurrentPassword);

    function setCurrentTempDir(res){
         document.querySelector("#NAStempdir").value = res.NAStempdir || "Download" ;
          console.log("Set DOM "+document.querySelector("#NAStempdir").value+" with "+res.NAStempdir || "Download" )
    }

        chrome.storage.local.get('NAStempdir',setCurrentTempDir);


function setCurrentDir(res){
     document.querySelector("#NASdir").value = res.NASdir || "Public/Multimedia/Films" ;
      console.log("Set DOM "+document.querySelector("#NASdir").value+" with "+res.NASdir || "Public/Multimedia/Films" )
}

    chrome.storage.local.get('NASdir',setCurrentDir);
}

document.addEventListener('DOMContentLoaded', restoreOptions);

chrome.storage.onChanged.addListener(restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);


function chnageNASInfo(newInfo)
{
  document.querySelector("#NASInfo").textContent=newInfo;
}

function toggleHideMenu() {
  var x = document.querySelector("#NASSettingForm");
//  console.log("Section id "+id+" is "x.className.indexOf("showsection"))
  if (x.className.indexOf("hidesection") == -1) {
    x.className += "hidesection";
  } else {
    x.className = x.className.replace("hidesection", "");
  }
}
document.querySelector("#SettingsMenu").addEventListener("click", toggleHideMenu);


//==================
function showMessage(msg)
{
  console.log("Show msg: "+msg);
  document.querySelector("#ErrMsg").textContent = msg;
  chrome.browserAction.setBadgeText({text:"Msg"});

}
function clearMessage()
{
  console.log("Clear msg");
  document.querySelector("#ErrMsg").textContent = "";
  chrome.browserAction.setBadgeText({text:""});
}

function showError(msg)
{
  console.log("Show error: "+msg);
  document.querySelector("#ErrMsg").textContent = msg;
  chrome.browserAction.setBadgeText({text:"Err"});
}

function clearError()
{
  console.log("Clear Error");
  document.querySelector("#ErrMsg").textContent = "";
  chrome.browserAction.setBadgeText({text:""});
  document.querySelector("#NASpasswordLabel").style.color = "black";
}
//=================

function testConnection()
{
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

    clearError();

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

    console.log("settings "+res.NASsecure+" :"+NASprotocol+"://"+res.NASlogin+":"+res.NASpassword+"@"+res.NASaddress+":"+res.NASport+"/"+res.NASdir);
        xhr.addEventListener("error", (e) => {
          console.log(e);
          showError(e.message);//+": "+e.error.toString());

        });
        xhr.addEventListener("timeout", () => {
          console.log(NASaddr+" not responding");
          showError(NASaddr+" not responding");//+": "+e.error.toString());

        });
        xhr.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
          console.log(this.responseText);
          if (this.status === 200)
          {
            if (this.responseText != null && this.responseText.length > 0)
            {
  //            var jsonObject = xml2json(this.responseText,"");
  //            var jsonObject = xml2json.parser(this.responseText);
  //            var jsonObject = xmlToJson.parse(this.responseText);

              var jsonObject = xmlToJSON.parseString(this.responseText);
              console.log("json="+jsonObject);

              let NASModel = jsonObject.QDocRoot[0].model[0].modelName[0]._text;
              console.log("model Name= "+NASModel);

              let NASDisplayName = jsonObject.QDocRoot[0].model[0].displayModelName[0]._text;
              console.log("model displayModelName= "+NASDisplayName);

              console.log("fmwr version= "+jsonObject.QDocRoot[0].firmware[0].version[0]._text);

              let NASHostname = jsonObject.QDocRoot[0].hostname[0]._text;
              console.log("hostname = "+NASHostname);

              let NASIPinfo = jsonObject.QDocRoot[0].HTTPHost[0]._text;
              console.log("HTTP = "+NASIPinfo);

              let NASPortInfo = jsonObject.QDocRoot[0].webAccessPort[0]._text;
              console.log("port = "+NASPortInfo);
              chnageNASInfo(NASHostname+" "+NASDisplayName+" "+NASIPinfo+":"+NASPortInfo);
            }
            else {
              showError("Empty response from "+NASaddr);
            }
          }
          else {
            {
              if (this.status === 404)
                showError("Err "+this.status +" Page not found "+NASaddr);
              else  if (this.status === 500)
                  showError("Err "+this.status +" Server error of "+NASaddr);
              else
              showError("Err "+this.status +" with "+NASaddr);
            }
          }
        }
    });
    var requete = NASprotocol+"://"+NASaddr+":"+NASport+"/cgi-bin/authLogin.cgi";
    console.log("Request to send:"+requete);
    try {
      xhr.open("GET", requete);

      xhr.send();
    } catch (e) {
      console.log(e);
      showError(e.message);//+": "+e.error.toString());
    } finally {

    }
  });

}


document.querySelector("#testConnectionButton").addEventListener("click", testConnection);
