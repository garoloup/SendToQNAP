
async function getSettings()
{
    let storedItems = new Promise(function(resolve, reject) {
    chrome.storage.local.get( null, resolve ) } ) ;
    
    let res = await storedItems;
    
    appendLog("getSettings res="+res);

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
    appendLog("async loginNAS: param login ="+data);
    
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
        
    appendLog("loginNAS fetch response ok ="+response.ok +" status="+response.status);

    if (response.ok) {
        let responseData = await response.json();
        appendLog("loginNAS fetch response = "+JSON.stringify(responseData) );
        if (responseData.error == 0)
            {
                appendLog("SID="+responseData.sid);
                NASsid = responseData.sid;
                return true;
            }
        else
            {
                appendLog("loginNAS error = "+responseData.error);
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
    appendLog("getQNAPDNLList SID="+sid);

    var data = "sid="+sid+"&limit=0&status=all&type=all";

    appendLog("Lauch QNAP Query DS Tasks");
    var requete = NASprotocol+"://"+NASaddr+":"+NASport+"/downloadstation/V4/Task/Query";
    appendLog("Request to send:"+requete);

    try {
        let response = await fetch(requete, {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
            },
            body: data,
            credentials: 'include'
        });

        // if HTTP retiurn code is not 2xx
        if ( !response.ok) {
            throw new Error("getQNAPDNLList: HTTP Error ${response.status}, ${response.statusText}");
        }

        let responseData = await response.json();

        if (response.ok && responseData.error == 0) {
            appendLog("getQNAPDNLList: reponse ok = "+responseData);
            return(responseData);
        }
        else {
            appendLog("getQNAPDNLList: reponse error = "+responseData.error+"error reason = "+responseData.reason);
            throw(responseData.reason);
            return [];
        }

    } catch (e) {
        appendLog(e);
    }
    

}

/* +++++++++++++++++++++++++++++++++
 Get download tasks list
*/
async function getQNAPDNLNb(sid) {
    let DNLList = await getQNAPDNLList(sid);
    let rateDNL = getTotalRate(DNLList);
    appendLog("getQNAPDNLNb: "+DNLList + " rate="+rateDNL+" %");
    //return DNLList.status.downloading;
    return {NbOfDNL: DNLList.status.downloading, 
            rateOfDNL: rateDNL};
}

function getTotalRate(listOfDNL)
{
    let doneDNL = 0;
    let todoDNL = 0;
    for (i=0; i < listOfDNL.total ; i++) {
        if ( listOfDNL.data[i].state != "5" && listOfDNL.data[i].state != "4") {
          appendLog("En cours ["+i+"].status : "+listOfDNL.data[i].state+" - "+listOfDNL.data[i].source_name);
          appendLog("Rate ["+i+"] : total down="+parseInt(listOfDNL.data[i].total_down)+" / size="+parseInt(listOfDNL.data[i].size) + " down_size="+parseInt(listOfDNL.data[i].down_size));

            doneDNL += parseInt(listOfDNL.data[i].total_down);
          
            todoDNL += parseInt(listOfDNL.data[i].size);
            appendLog("done="+doneDNL+" / todoDNL="+todoDNL);
          let fnDNL = listOfDNL.data[i].source;
          let hashDNL = listOfDNL.data[i].hash;
        }
    }
  let rateDNL = 0;
  if (todoDNL > 0)
  {
    rateDNL = Math.trunc(100*doneDNL/todoDNL);
  }
  else {
    rateDNL = 0;
  }

  appendLog("Rate ["+i+"] : "+rateDNL);
  appendLog("Rate"+rateDNL.toString());
    
    return(rateDNL);

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
  appendLog(msg);
// To replace with err storage as popup not present
//      document.querySelector("#ErrMsg").textContent = msg;
  chrome.action.setBadgeText({text:msg});
//    getBadgeColor();


}

function showError(msg)
{
  appendLog(msg);
//      document.querySelector("#ErrMsg").textContent = msg;
  chrome.action.setBadgeText({text:msg});
//    getBadgeColor();


}

function clearError()
{
  appendLog("Clear Error");
//      document.querySelector("#ErrMsg").textContent = "";
  chrome.action.setBadgeText({text:""});
//      document.querySelector("#NASpasswordLabel").style.color = "black";
}

function clearMessage()
{
  appendLog("Clear Message");
//      document.querySelector("#ErrMsg").textContent = "";
  chrome.action.setBadgeText({text:""});
//      document.querySelector("#NASpasswordLabel").style.color = "black";
}



//==================
// Show messages in bar popup
//==================
function getBadgeColor()
{
       chrome.action.getBadgeBackgroundColor({},
            function (color)
                {
                appendLog("getBadgeColor: color="+color);
            });

}

function showPopupMessage(msg)
{
  appendLog("Show msg: "+msg);
  document.querySelector("#ErrMsg").textContent = msg;
  chrome.action.setBadgeText({text:"Msg"});
}
function clearPopupMessage()
{
  appendLog("Clear msg");
  document.querySelector("#ErrMsg").textContent = "";
  chrome.action.setBadgeText({text:""});
}

function showPopupError(msg)
{
  appendLog("Show error: "+msg);
  document.querySelector("#ErrMsg").textContent = msg;
  chrome.action.setBadgeText({text:"Err"});
}

function clearPopupError()
{
  appendLog("Clear Error");
  document.querySelector("#ErrMsg").textContent = "";
  chrome.action.setBadgeText({text:""});
  document.querySelector("#NASpasswordLabel").style.color = "black";
}

//==================
// Show messages in Debug Log popup
//==================
//function resetLog() {
//  appendLog("Clear Logs");    document.getElementById('DebugLog').innerHTML = "";
//}

function appendLog(msg) {
    let logDiv = document.getElementById('DebugLog')

    if (logDiv)
        logDiv.innerHTML += "<br>" + msg;

	console.log(msg);
}


//==================
// Set Progress indicator in badge
//==================

let IntervalID;

function startIndicator()
{
    appendLog("Start Indicator");
    var context=document.createElement('canvas').getContext('2d');
    var start = new Date();
    var lines = 16,
    cW = 40,
    cH = 40;

    IntervalID = setInterval(function() {
      var rotation = parseInt(((new Date() - start) / 1000) * lines) / lines;
      context.save();
      context.clearRect(0, 0, cW, cH);
      context.translate(cW / 2, cH / 2);
      context.rotate(Math.PI * 2 * rotation);
      for (var i = 0; i < lines; i++) {
        context.beginPath();
        context.rotate(Math.PI * 2 / lines);
        context.moveTo(cW / 10, 0);
        context.lineTo(cW / 4, 0);
        context.lineWidth = cW / 30;
        context.strokeStyle = 'rgba(0, 0, 0,' + i / lines + ')';
        context.stroke();
      }

    var imageData = context.getImageData(10, 10, 19, 19);
      chrome.action.setIcon({
        imageData: imageData
      });

    context.restore();
    }, 1000 / 30);
}


function displayProgressIndicator(progressValue)
{
    appendLog("displayProgressIndicator  ="+ progressValue);
    var context=document.createElement('canvas').getContext('2d');
    var start = new Date();
    var cpt = 0;
    var lines = 100,
    cW = 32,
    cH = 32;
    let img = new Image();

    img.onload = function() {
        
        var rotation = progressValue/lines;
        context.save();
        context.clearRect(0, 0, cW, cH);
        context.drawImage(img,0,0);
        context.translate(cW / 2, cH / 2);
        i = lines;
        context.rotate(Math.PI * 2 * rotation - Math.PI * 0.5);
        context.beginPath();
        context.moveTo(cW / 10, 0);
        context.lineTo(cW * 0.5, 0);
        context.strokeStyle = "black";
        context.lineWidth = 8;
        context.stroke();
        context.strokeStyle = "white";
        context.lineWidth = 4;
        context.stroke();

        var imageData = context.getImageData(0, 0, cW, cH);
        chrome.action.setIcon({
            imageData: imageData
          });

        context.restore();        
    };
    img.src = "icons/32_download.png";

    // remove to bug in chrome net retrieving actual color
    //makeBadgeTransparent();
}

function makeBadgeTransparent()
{
    chrome.action.getBadgeBackgroundColor({},
            function (color)
                {
                appendLog("makeBadgeTransparent: color="+color);
                if (color[0]==0)
                    {
                        color[0]=217;
                    }
                color[3] = 125;
                chrome.action.setBadgeBackgroundColor({color:color})
            });
}

function makeBadgeOpaque()
{
    chrome.action.getBadgeBackgroundColor({},
            function (color)
                {
                appendLog("makeBadgeOpaque: color="+color);
                if (color[0]==0)
                    {
                        color[0]=217;
                    }
                color[3] = 255;
                chrome.action.setBadgeBackgroundColor({color:color})
            });
}

function removeIndicator()
{
    clearInterval(IntervalID);
    // remove to bug in chrome net retrieving actual color
    //makeBadgeOpaque();
    
    appendLog("Stop Indicator")
    chrome.action.setIcon({
        path : "icons/32_download.png"
      });  
    chrome.action.setIcon({
        path : "icons/32_download.png",
        path : "icons/48_download.png"
      });  
}

/* +++++++++++++++++++++++++++++++++
 Refresh Task Nb periodically
*/

async function watchDownloads()
{
//    let DNLList = await getQNAPDNLList(NASsid);
//    let NbDNL = DNLList.status.downloading;
//    showMessage(NbDNL.toString());

    let DNL = await getQNAPDNLNb(NASsid);
    NbDNL = DNL.NbOfDNL;
    rateDNL = DNL.rateOfDNL;
    showMessage(NbDNL.toString());

    // When nb of running download decreases
    if (NbDNL < totalNbOfDNL) {
        var decrease = NbDNL-totalNbOfDNL;
        console.log("watchDownloads: decrease downloads : "+decrease);
        setTimeout(showMessage,0, decrease.toString());
        totalNbOfDNL = NbDNL;
        // Clear badge in 5s
        setTimeout( clearMessage, 5000);
        setTimeout( watchDownloads, 5500);
        displayProgressIndicator(rateDNL);
         console.log("watchDownloads: display progress  :"+rateDNL);
    }

    if (NbDNL > 0)
        {
            if (refreshTimer == 0)
                {
                    refreshTimer = setInterval(watchDownloads, 2000);
                    console.log("watchDownloads: launch interval ID  :"+refreshTimer);
               }
            else
                {
                    console.log("watchDownloads: Already running interval ID  :"+refreshTimer);
                }
        displayProgressIndicator(rateDNL);
         console.log("watchDownloads: display progress  :"+rateDNL);
        }
    else{
            console.log("watchDownloads: kill interval ID  :"+refreshTimer);
            clearInterval(refreshTimer) ;
            refreshTimer = 0;
            removeIndicator();

            await timeout(2000);
            clearMessage();
    }
}




