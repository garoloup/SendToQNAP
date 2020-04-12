/* +++++++++++++++++++++++++++++++++
Create context menu item
*/
//browser.contextMenus.create({
chrome.contextMenus.create({
    id: "copy-link-to-clipboard",
    title: chrome.i18n.getMessage("menuContextSendLink"),
contexts: ["link"],
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
var NASdir = "";
var NASsid = "";

function onError(error) {
    console.log(`Error: ${error}`);
  }


function initialize() {
//  var gettingAllStorageItems = browser.storage.local.get(null);
  chrome.storage.local.get(null,function(res) {
      NASaddr = res.NASaddress;
      NASport = res.NASport;
      NASlogin = res.NASlogin;
      NASpassword = res.NASpassword;
      NASdir = res.NASdir;
      NASsecure = res.NASsecure;
      if (NASsecure)
      {
        NASprotocol = "https";
      }
      else {
        NASprotocol = "http";
      }
  });
}
//browser.storage.onChanged.addListener(initialize);
chrome.storage.onChanged.addListener(initialize);

/* +++++++++++++++++++++++++++++++++
Section of HTTP request to send download URL to QNAP
 +++++++++++++++++++++++++++++++++ */

function handleCreatedbyXHR(item) {

   LoadAndLogAndAddUrl(item.url) ;
}

/* +++++++++++++++++++++++++++++++++
Load NAS settings and call next steps
*/
function LoadAndLogAndAddUrl(url) {
//  var gettingAllStorageItems = browser.storage.local.get(null);
/*  var gettingAllStorageItems = chrome.storage.local.get(null);
  gettingAllStorageItems.then((res) => {
      NASaddr = res.NASaddress;
      NASport = res.NASport;
      NASlogin = res.NASlogin;
      NASpassword = res.NASpassword;
      NASdir = res.NASdir;*/

    chrome.storage.local.get(null,function(res) {
      NASaddr = res.NASaddress;
      NASport = res.NASport;
      NASlogin = res.NASlogin;
      NASpassword = res.NASpassword;
      NASdir = res.NASdir;
      NASsecure = res.NASsecure;
      if (NASsecure)
      {
        NASprotocol = "https";
      }
      else {
        NASprotocol = "http";
      }

    console.log("settings: "+NASprotocol+" "+res.NASlogin+":"+res.NASpassword+"@"+res.NASaddress+":"+res.NASport+"/"+res.NASdir);
     LogAndAddUrl(url);
  });
}

function notifyExtension(url) {
  console.log("content script sending message: "+url);
  browser.runtime.sendMessage({"url": url});
}


/* +++++++++++++++++++++++++++++++++
Login into NAS and get SID for next step
*/
function LogAndAddUrl(url) {
  var data = "";

  // cannot share SID in that way
  if (true) //(NASsid.length == 0)
  {
    var xhr = new XMLHttpRequest();

    data = "user="+NASlogin+"&pass="+btoa(NASpassword);
    console.log("param login ="+data);
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
          console.log(this.responseText);
          var obj = JSON.parse(this.responseText);
          console.log("SID="+obj.sid);
          NASsid = obj.sid;
          addURL(obj.sid,url);
        }
    });

    console.log("Lancement QNAP get SID");
    xhr.open("POST", NASprotocol+"://"+NASaddr+":"+NASport+"/downloadstation/V4/Misc/Login");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");

    xhr.send(data);
  }
  else {
    console.log("SID "+NASsid+" already avaialble")
    addURL(NASsid,url);
  }
}

/* +++++++++++++++++++++++++++++++++
 Add download task using SID
*/
function addURL(sid, url) {
    //var data = "sid="+sid+"&temp=Download&move=Multimedia%2FTemp&url=http%3A%2F%2Freleases.ubuntu.com%2F18.04%2Fubuntu-18.04.4-desktop-amd64.iso";
    console.log("SID="+sid);
    console.log("URL="+url);

    var urlQNAP = url.replace(/\//g,"%2F");
    urlQNAP = urlQNAP.replace(/:/,"%3A");
    console.log("urlQNAP="+urlQNAP);

    var dirQNAP = NASdir.replace(/\//g,"%2F");
    dirQNAP = dirQNAP.replace(/:/,"%3A");
    console.log("dirQNAP="+dirQNAP);

    var data = "sid="+sid+"&temp=Download&move="+dirQNAP+"&url="+urlQNAP;
    //var data = "sid="+sid+"&temp=Download&move=Multimedia%2FTemp&url="+urlQNAP;

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            console.log(this.responseText);
        }
    });

    xhr.open("POST", NASprotocol+"://"+NASaddr+":"+NASport+"/downloadstation/V4/Task/AddUrl");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
    console.log(xhr);
    xhr.send(data);

    }
