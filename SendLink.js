/* +++++++++++++++++++++++++++++++++
Create context menu item
*/
//browser.contextMenus.create({
chrome.contextMenus.create({
    id: "copy-link-to-clipboard",
    title: chrome.i18n.getMessage("menuContextSendLink"),
    contexts: ["link"]
},onCreated);

/* +++++++++++++++++++++++++++++++++
Listen to new context menu item
and start QNAP steps for download
*/
//browser.contextMenus.onClicked.addListener((info, tab) => {
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "copy-link-to-clipboard") {
        // Examples: text and HTML to be copied.
        const text = "This is text: " + info.linkUrl;
        // Always HTML-escape external input to avoid XSS.
        const safeUrl = escapeHTML(info.linkUrl);
        const html = `This is HTML: <a href="${safeUrl}">${safeUrl}</a>`;

        console.log("Send to QNAP URL="+safeUrl);
        LoadAndLogAndAddUrl(safeUrl);
    }
});

// https://gist.github.com/Rob--W/ec23b9d6db9e56b7e4563f1544e0d546
function escapeHTML(str) {
    // Note: string cast using String; may throw if `str` is non-serializable, e.g. a Symbol.
    // Most often this is not the case though.
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;")
        .replace(/</g, "&lt;").replace(/>/g, "&gt;");
}




/*
Called when the item has been created, or when creation failed due to an error.
We'll just log success/failure here.
*/
function onCreated() {
//  if (browser.runtime.lastError) {
  if (chrome.runtime.lastError) {
    console.log(`Error: ${chrome.runtime.lastError}`);
  } else {
    console.log("Item created successfully");
      initialize();
  }
}

/*
Called when the item has been removed.
We'll just log success here.
*/
function onRemoved() {
  console.log("Item removed successfully");
}

/*
Called when there was an error.
We'll just log the error here.
*/
function onError(error) {
  console.log(`Error: ${error}`);
}


/* +++++++++++++++++++++++++++++++++
QNAP settings vars
*/
var NASsecure = false;
var NASprotocol = "";
var NASaddr = "0.0.0.0";
var NASport = "80";
var NASlogin = "";
var NASpassword = "";
var NAStempdir = "";
var NASdir = "";
var NASsid = "";
var NASDNLNb = 0;
var refreshTimer = 0;
var totalNbOfDNL =0;

function onError(error) {
    console.log(`Error: ${error}`);
  }


async function initialize() {
    await getSettings();

    console.log("initialize => settings: "+NASprotocol+" "+NASlogin+":"+NASpassword+"@"+NASaddr+":"+NASport+" temp="+NAStempdir+" move="+NASdir);
    
//    NASDNLNb = await getQNAPDNLNb(NASsid);
//    console.log("initialize NASDNLNb"+NASDNLNb);
//  var gettingAllStorageItems = browser.storage.local.get(null);
//  chrome.storage.local.get(null,function(res) {
//      NASaddr = res.NASaddress;
//      NASport = res.NASport;
//      NASlogin = res.NASlogin;
//      NASpassword = res.NASpassword;
//      NAStempdir = res.NAStempdir;
//      NASdir = res.NASdir;
//      NASsecure = res.NASsecure;
//      if (NASsecure)
//      {
//        NASprotocol = "https";
//      }
//      else {
//        NASprotocol = "http";
//      }
//  });
}


/* +++++++++++++++++++++++++++++++++
Update NAS settings if chnaged in popup
*/
//browser.storage.onChanged.addListener(initialize);
chrome.storage.onChanged.addListener(initialize);

/* +++++++++++++++++++++++++++++++++
initialize by loaing settings and DNL nb
*/
initialize();

/* +++++++++++++++++++++++++++++++++
Load NAS settings and call next steps
*/
async function LoadAndLogAndAddUrl(url) {
    await getSettings();

    console.log("settings: "+NASprotocol+" "+NASlogin+":"+NASpassword+"@"+NASaddr+":"+NASport+" temp="+NAStempdir+" move="+NASdir);

    let resLogin = await loginNAS();
    console.log("LoadAndLogAndAddUrl: called loginNAS="+resLogin);

    if (resLogin === true)
    {
      // Call addUrl with SID & URL
      console.log("LoadAndLogAndAddUrl: async fct now calls addUrl with SID & URL");

      let resSend = await sendURL(NASsid,url);
      if (resSend === true )
      {
        console.log("LoadAndLogAndAddUrl: sendURL OK with "+url);
      }
      else
      {
        console.log("LoadAndLogAndAddUrl: sendURL error with "+url);
      }
    }
}

function notifyExtension(url) {
  console.log("content script sending message: "+url);
  browser.runtime.sendMessage({"url": url});
}


/* +++++++++++++++++++++++++++++++++
Login into NAS 
*/
// Moved to common.js
/* WIP : replace with fetch and await 
async function loginNAS()
{
  let data = "user="+NASlogin+"&pass="+btoa(NASpassword);
  console.log("async loginNAS: param login ="+data);
  let response = await fetch(NASprotocol+"://"+NASaddr+":"+NASport+"/downloadstation/V4/Misc/Login", {
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
    },
    body: data,
    credentials: 'include' 
  })
  let responseData = await response.json();
  if (response.ok) {
    console.log(this.responseData);
    console.log("SID="+responseData.sid);//obj.sid);
    NASsid = responseData.sid;//obj.sid;

    return true;
  }
  else {
    console.error("loginNAS failed "+response);
    return false;
  }

}*/

/* +++++++++++++++++++++++++++++++++
 Add download task using SID
 Add URL using fetch
*/
async function sendURL(sid,url)
{
    //var data = "sid="+sid+"&temp=Download&move=Multimedia%2FTemp&url=http%3A%2F%2Freleases.ubuntu.com%2F18.04%2Fubuntu-18.04.4-desktop-amd64.iso";
  console.log("Send URL: SID="+sid+"URL="+url);

  var urlQNAP = url.replace(/\//g,"%2F");
  urlQNAP = urlQNAP.replace(/:/,"%3A");
  console.log("urlQNAP="+urlQNAP);

  var tempdirQNAP = NAStempdir.replace(/\//g,"%2F");
  tempdirQNAP = tempdirQNAP.replace(/:/,"%3A");
  console.log("tempdirQNAP="+tempdirQNAP);

  var dirQNAP = NASdir.replace(/\//g,"%2F");
  dirQNAP = dirQNAP.replace(/:/,"%3A");
  console.log("dirQNAP="+dirQNAP);
    
    //var data = "sid="+sid+"&temp=Download&move=Multimedia%2FTemp&url="+urlQNAP;
    //var data = "sid="+sid+"&temp=Download&move="+dirQNAP+"&url="+urlQNAP;
  var data = "sid="+sid+"&temp="+tempdirQNAP+"&move="+dirQNAP+"&url="+urlQNAP;

  let response = await fetch(NASprotocol+"://"+NASaddr+":"+NASport+"/downloadstation/V4/Task/AddUrl", {
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
    },
    body: data
  })

  if (response.ok) {
    let responseData = await response.json();
    console.log("sendURL: fetch reponse ok = "+responseData);
      if (responseData.error === 0)
      {
        showMessage("+1");
        totalNbOfDNL++;
        // Clear badge in 5s
        setTimeout( clearMessage, 5000);
        setTimeout( watchDownloads, 5500);
          
        return(true);
      }
      else if (responseData.error !== 0) {
          console.log("sendURL: error fetch :"+response.status);
        showError("Err");
        // Clear badge in 5s
        setTimeout( clearError, 5000);
        return(false);

      }

  }
}

/* +++++++++++++++++++++++++++++++++
 Refresh Task Nb periodically
*/

async function watchDownloads()
{
//    let DNLList = await getQNAPDNLList(NASsid);
//    let NbDNL = DNLList.status.downloading;
//    showMessage(NbDNL.toString());

    let NbDNL = await getQNAPDNLNb(NASsid);
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
        }
    else{
            console.log("watchDownloads: kill interval ID  :"+refreshTimer);
            clearInterval(refreshTimer) ;
            refreshTimer = 0;

            await timeout(2000);
            clearMessage();
    }
}


