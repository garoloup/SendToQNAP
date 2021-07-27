
async function getSettings()
{
    let storedItems = new Promise(function(resolve, reject) {
    chrome.storage.local.get( null, resolve ) } ) ;
    
    let res = await storedItems;
    
    console.log("getSettings res="+res);

    NASaddr = res.NASaddress;
    NASport = res.NASport;
    NASlogin = res.NASlogin;
    NASpassword = res.NASpassword;
    NAStempdir = res.NAStempdir;
    NASdir = res.NASdir;
    NASsecure = res.NASsecure;
    if (NASsecure)
    {
    NASprotocol = "https";
    }
    else {
    NASprotocol = "http";
    }

}


/* +++++++++++++++++++++++++++++++++
 Open NAS session to get session ID SID
*/
async function loginNAS()
{
    let data = "user="+NASlogin+"&pass="+btoa(NASpassword);
    console.log("async loginNAS: param login ="+data);
    
    let requete = NASprotocol+"://"+NASaddr+":"+NASport+"/downloadstation/V4/Misc/Login";
// TODO retrun false/throw err if bad URL , port or login/pwd
    let response = await fetch(requete, {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
        },
        body: data,
        credentials: 'include' 
    });
        
    console.log("loginNAS fetch response ok ="+response.ok +" status="+response.status);

    if (response.ok) {
        let responseData = await response.json();
        console.log("loginNAS fetch response = "+JSON.stringify(responseData) );
        if (responseData.error == 0)
            {
                console.log("SID="+responseData.sid);
                NASsid = responseData.sid;
                return true;
            }
        else
            {
                console.log("loginNAS error = "+responseData.error);
                showError("Err");
                showPopupError("Failed to login")
                return false;
            }

    }
    else {
        console.error("loginNAS failed response ok ="+response.ok +" status="+response.status);
        showError("Err");
        showPopupError("Failed to reach NAS during login")
        return false;
    }

}



/* +++++++++++++++++++++++++++++++++
 Get download tasks list
*/
async function getQNAPDNLList(sid) {
    console.log("getQNAPDNLList SID="+sid);

    var data = "sid="+sid+"&limit=0&status=all&type=all";

    console.log("Lauch QNAP Query DS Tasks");
    var requete = NASprotocol+"://"+NASaddr+":"+NASport+"/downloadstation/V4/Task/Query";
    console.log("Request to send:"+requete);

    let response = await fetch(requete, {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
        },
        body: data,
        credentials: 'include'
    });
    
    let responseData = await response.json();
    
    if (response.ok && responseData.error == 0) {
        console.log("getQNAPDNLList: reponse ok = "+responseData);
        return(responseData);
    }
    else {
        console.log("getQNAPDNLList: reponse error = "+responseData.error+"error reason = "+responseData.reason);
        throw(responseData.reason);
        return [];
    }

}

/* +++++++++++++++++++++++++++++++++
 Get download tasks list
*/
async function getQNAPDNLNb(sid) {
    let DNLList = await getQNAPDNLList(sid);
    return DNLList.status.downloading;
}

// permet d'attendre le délai indiqué
function timeout(ms) {
  let timeoutId;
  return new Promise(res => {
    timeoutId = setTimeout(() => res(timeoutId), ms);
  });
}


//==================
function showMessage(msg)
{
  console.log(msg);
// To replace with err storage as popup not present
//      document.querySelector("#ErrMsg").textContent = msg;
  chrome.browserAction.setBadgeText({text:msg});
}

function showError(msg)
{
  console.log(msg);
//      document.querySelector("#ErrMsg").textContent = msg;
  chrome.browserAction.setBadgeText({text:msg});
}

function clearError()
{
  console.log("Clear Error");
//      document.querySelector("#ErrMsg").textContent = "";
  chrome.browserAction.setBadgeText({text:""});
//      document.querySelector("#NASpasswordLabel").style.color = "black";
}

function clearMessage()
{
  console.log("Clear Message");
//      document.querySelector("#ErrMsg").textContent = "";
  chrome.browserAction.setBadgeText({text:""});
//      document.querySelector("#NASpasswordLabel").style.color = "black";
}



//==================
// Show messages in bar popup
//==================
function showPopupMessage(msg)
{
  console.log("Show msg: "+msg);
  document.querySelector("#ErrMsg").textContent = msg;
  chrome.browserAction.setBadgeText({text:"Msg"});

}
function clearPopupMessage()
{
  console.log("Clear msg");
  document.querySelector("#ErrMsg").textContent = "";
  chrome.browserAction.setBadgeText({text:""});
}

function showPopupError(msg)
{
  console.log("Show error: "+msg);
  document.querySelector("#ErrMsg").textContent = msg;
  chrome.browserAction.setBadgeText({text:"Err"});
}

function clearPopupError()
{
  console.log("Clear Error");
  document.querySelector("#ErrMsg").textContent = "";
  chrome.browserAction.setBadgeText({text:""});
  document.querySelector("#NASpasswordLabel").style.color = "black";
}

