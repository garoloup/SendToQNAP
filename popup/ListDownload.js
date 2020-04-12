/* +++++++++++++++++++++++++++++++++
 Handles to DOM elements
*/

const addButton = document.querySelector("#NASpress");
const input = document.querySelector("#NAStest");
const tableDNL = document.querySelector("#NASDownloadTable");
const JobNb = document.querySelector("#NASDNLJobNb");

/* +++++++++++++++++++++++++++++++++
 Fill DOM element with retrieved Nb of download Jobs
*/
function setJobNb(newInfo)
{
  JobNb.textContent=newInfo+" Jobs in queue";
}


/* +++++++++++++++++++++++++++++++++
 Remove from DOM all download Jobs except first row used as header
*/
function clearDNLTable()
{
  var table = document.querySelector('#NASDownloadTable');
  var nbItem = table.rows.length;
  console.log("Nb of items to del:"+nbItem);
  if (table.rows.length > 1) {
      for (let i=1; i< nbItem;i++) {

        console.log("Loop2del "+i+" => item to del:"+table.rows[1].getAttribute("hash"));
        table.rows[1].remove();
      };
    }
}

/* +++++++++++++++++++++++++++++++++
 Add a new DOM element with one retrieved job defined by its QNAP hash, filename and already downloaded file
*/
function AddQNAPDNLasTable(hashFile ,filename,rateFile) {
  let newItem = filename;

  console.log("AQD New item="+newItem);

  var attrHash = document.createAttribute("hash");
  const fileRow = document.createElement('tr');
  const fileCol1 = document.createElement('td');
  const fileCol2 = document.createElement('td');
  const fileCol3 = document.createElement('td');
  const fileProgress = document.createElement('progress');
  const listBtn = document.createElement('button');

  console.log(" col1="+fileCol1);
  console.log(" col2="+fileCol2);
  console.log("btn="+listBtn);

  fileRow.appendChild(fileCol1);
  fileRow.id = "itemDNL";
  fileCol1.textContent = newItem;
//  fileCol1.width = "70%";

  fileProgress.textContent = rateFile;
  fileProgress.value = rateFile;
  fileProgress.max = "100";
  console.log("fprog="+fileProgress.value+"/"+fileProgress.max+" innerHTML="+fileProgress.innerHTML);

  fileCol2.appendChild(fileProgress);
  //fileCol2.textContent = rateFile;
  fileRow.appendChild(fileCol2);

  fileCol3.appendChild(listBtn);
  listBtn.className = "Btn3D";
  fileRow.appendChild(fileCol3);
  listBtn.textContent = 'X';

  attrHash.value = hashFile;
  fileRow.setAttributeNode(attrHash);
  tableDNL.appendChild(fileRow);

  listBtn.onclick = function(e) {
    console.log("Press Del="+hashFile);
    LogAndDelDNL(hashFile);
    //tableDNL.removeChild(fileRow);
  }

}

/* +++++++++++++++++++++++++++++++++
 Link DOM button to callback
*/
function initListSection()
{
    var refreshButton = document.querySelector("#NASrefresh");

    refreshButton.addEventListener("click", LoadAndLogAndListDNL);
}

initListSection();


/* +++++++++++++++++++++++++++++++++
Load NAS settings and call next steps
*/
function LoadAndLogAndListDNL() {
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

    if (false) /*(NASsid.length > 0)*/ {
      console.log("LLLD SID "+NASsid+" already avaialble")
      listDNL();
    }
    else {
      LogAndListDNL();
    }
  });
}


/* +++++++++++++++++++++++++++++++++
Login into NAS and get SID for next step
*/
function LogAndListDNL() {
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
          //NASsid = obj.sid;
          ListQNAPDNL(obj.sid);
        }
    });

    console.log("Lancement QNAP get DS SID");
    var requete = NASprotocol+"://"+NASaddr+":"+NASport+"/downloadstation/V4/Misc/Login";
    console.log("Request to send:"+requete);
    xhr.open("POST", requete);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");

    xhr.send(data);
  }
  else {
    //console.log("LLD SID "+NASsid+" already avaialble")
    //listDNL(NASsid);
  }
}

/* +++++++++++++++++++++++++++++++++
   return filename from URL
*/
function getFilenameOfURL(url) {
  console.log("gFN URL="+url);

  var flna = url.split("/");
  var fileURL = flna[flna.length-1];

  console.log("fileURL="+fileURL);

  return(fileURL);
}

/* +++++++++++++++++++++++++++++++++
 Add download task using SID
*/
function ListQNAPDNL(sid) {
    console.log("SID="+sid);

    var data = "sid="+sid+"&limit=0&status=all&type=all";

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            console.log(this.responseText);
            var jsonData = JSON.parse(this.responseText);

            clearDNLTable();
            console.log("Total tasks:"+jsonData.total);
            console.log("Total downloading:"+jsonData.status.downloading);
            setJobNb(jsonData.status.downloading);
            for (i=0; i < jsonData.total ; i++) {
                if ( jsonData.data[i].state != "5" && jsonData.data[i].state != "4") {
                  console.log("En cours ["+i+"].status : "+jsonData.data[i].state+" - "+jsonData.data[i].source_name);
                  console.log("Rate ["+i+"] : "+jsonData.data[i].total_down+" / "+jsonData.data[i].size);
                  let doneDNL = parseInt(jsonData.data[i].total_down);
                  let todoDNL = parseInt(jsonData.data[i].size);
                  let rateDNL = 0;
                  let fnDNL = getFilenameOfURL(jsonData.data[i].source);
                  let hashDNL = jsonData.data[i].hash;
                  if (todoDNL > 0)
                  {
                    rateDNL = Math.trunc(100*doneDNL/todoDNL);
                  }
                  else {
                    rateDNL = 0;
                  }

                  console.log("Rate ["+i+"] : "+rateDNL);
                  console.log("Rate"+rateDNL.toString());
//                    AddQNAPDNL(getFilenameOfURL(jsonData.data[i].source));

                  let TabElt = document.querySelector("[hash=\""+hashDNL+"\"]");
                  console.log("Query Result ("+fnDNL+" - "+hashDNL+") = "+TabElt);


                  if ( TabElt == null)
                  {
                    console.log("Create="+fnDNL+" - "+hashDNL);
                    AddQNAPDNLasTable(hashDNL,getFilenameOfURL(fnDNL),rateDNL.toString());
                  }
                  else {
                    console.log("Doublon="+fnDNL+" - "+hashDNL);
                  }

                    //AddQNAPDNL(jsonData.data[i].source_name); // Only filled if actually downloading state = 104
                }
                else {
                  //console.log("Fini["+i+"].status : "+jsonData.data[i].state+" - "+jsonData.data[i].source_name);

                }
            }
        }
    });

    console.log("Lancement QNAP Query DS Tasks");
    var requete = NASprotocol+"://"+NASaddr+":"+NASport+"/downloadstation/V4/Task/Query";
    console.log("Request to send:"+requete);
    xhr.open("POST", requete);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
    console.log(xhr);
    xhr.send(data);

}


/* +++++++++++++++++++++++++++++++++
Login into NAS and get SID for next step
*/
function LogAndDelDNL(hash) {
  var data = "";
  //    var data = "user=admin&pass=bm9ncm9pMDE%3D";

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
          //NASsid = obj.sid;
          delDNL(obj.sid,hash);
        }
    });

    console.log("Lancement QNAP Login DS SID");
    var requete = NASprotocol+"://"+NASaddr+":"+NASport+"/downloadstation/V4/Misc/Login";
    console.log("Request to send:"+requete);
    xhr.open("POST", requete);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");

    xhr.send(data);
  }
  else {
    console.log("LDD SID "+NASsid+" already avaialble")
    //delDNL(NASsid,hash);
  }
}
/* +++++++++++++++++++++++++++++++++
 Add download task using SID
*/
function delDNL(sid,hash) {
    //var data = "sid="+sid+"&temp=Download&move=Multimedia%2FTemp&url=http%3A%2F%2Freleases.ubuntu.com%2F18.04%2Fubuntu-18.04.4-desktop-amd64.iso";
    console.log("SID="+sid);
    console.log("Hash="+hash);

    var data = "sid="+sid+"&hash="+hash;

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            console.log(this.responseText);
            var jsonData = JSON.parse(this.responseText);

            console.log("error:"+jsonData.error);

            console.log("EndOfDel=>List (SID ="+sid+"  )")
            ListQNAPDNL(sid);
      }

    });

    console.log("Lancement QNAP Remove Task hash:"+hash);
    var requete = NASprotocol+"://"+NASaddr+":"+NASport+"/downloadstation/V4/Task/Remove";
    console.log("Request to send:"+requete);
    xhr.open("POST", requete);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
    console.log(xhr);
    xhr.send(data);

}
