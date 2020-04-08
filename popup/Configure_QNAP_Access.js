function saveOptions(e) {
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
    NASdir: document.querySelector("#NASdir").value
  });
//  e.preventDefault();
}

function restoreOptions() {
  function onError(error) {
    console.log(`Error: ${error}`);
  }

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



function setCurrentDir(res){
     document.querySelector("#NASdir").value = res.NASdir || "Multimedia/Films" ;
      console.log("Set DOM "+document.querySelector("#NASdir").value+" with "+res.NASdir || "Multimedia/Films" )
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

function testConnection()
{
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

    chrome.storage.local.get(null,function(res) {
      var NASaddr = res.NASaddress;
      var NASport = res.NASport;
      var NASlogin = res.NASlogin;
      var NASpassword = res.NASpassword;
      var NASdir = res.NASdir;
      console.log("settings:"+res.NASlogin+":"+res.NASpassword+"@"+res.NASaddress+":"+res.NASport+"/".NASdir);

        xhr.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
          console.log(this.responseText);
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
        }
    });

  xhr.open("GET", "http://"+NASaddr+":"+NASport+"/cgi-bin/authLogin.cgi");

  xhr.send();

  });

}


document.querySelector("#testConnectionButton").addEventListener("click", testConnection);
