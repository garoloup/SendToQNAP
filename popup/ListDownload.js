/* +++++++++++++++++++++++++++++++++
 Handles to DOM elements
*/

const addButton = document.querySelector("#NASpress");
const input = document.querySelector("#NAStest");
const tableDNL = document.querySelector("#NASDownloadTable");
const JobNb = document.querySelector("#NASDNLJobNb");

var NASsid="";


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
  appendLog("Nb of items to del:"+nbItem);
  if (table.rows.length > 1) {
      for (let i=1; i< nbItem;i++) {

        appendLog("Loop2del "+i+" => item to del:"+table.rows[1].getAttribute("hash"));
        table.rows[1].remove();
      };
    }
}

/* +++++++++++++++++++++++++++++++++
 Add a new DOM element with one retrieved job defined by its QNAP hash, filename and already downloaded file
*/
async function AddQNAPDNLasTable(hashFile ,filename,rateFile) {
  let newItem = filename;

  appendLog("AQD New item="+newItem);

  var attrHash = document.createAttribute("hash");
  const fileRow = document.createElement('tr');
  const fileCol1 = document.createElement('td');
  const fileCol2 = document.createElement('td');
  const fileCol3 = document.createElement('td');
  const fileProgress = document.createElement('progress');
  const listBtn = document.createElement('button');

  appendLog(" col1="+fileCol1);
  appendLog(" col2="+fileCol2);
  appendLog("btn="+listBtn);

  fileRow.appendChild(fileCol1);
  fileRow.id = "itemDNL";
  fileCol1.textContent = newItem;
//  fileCol1.width = "70%";

  fileProgress.textContent = rateFile;
  fileProgress.value = rateFile;
  fileProgress.max = "100";
  appendLog("fprog="+fileProgress.value+"/"+fileProgress.max+" innerHTML="+fileProgress.innerHTML);

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

  listBtn.onclick = async function(e) {
    appendLog("Press Del="+hashFile);
    await LogAndDelDNL(hashFile);
    //tableDNL.removeChild(fileRow);
  }

}

/* +++++++++++++++++++++++++++++++++
 Link DOM button to callback
*/
function initListSection()
{
    var refreshButton = document.querySelector("#NASrefresh");

    refreshButton.addEventListener("click", LoadAndLogAndListDNL_bis /*LoadAndLogAndListDNL*/);
}

initListSection();


/* +++++++++++++++++++++++++++++++++
Load NAS settings and call next steps
*/
function LoadAndLogAndListDNL() {

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

    appendLog("settings: "+NASprotocol+" "+res.NASlogin+":"+res.NASpassword+"@"+res.NASaddress+":"+res.NASport+"/"+res.NASdir);

    if (false) /*(NASsid.length > 0)*/ {
      appendLog("LLLD SID "+NASsid+" already avaialble")
      listDNL();
    }
    else {
      LogAndListDNL();
    }
  });
}


// WIP replace by asunc pattern
/* +++++++++++++++++++++++++++++++++
Load settings, Log and List DNL
*/
async function LoadAndLogAndListDNL_bis() {
    var resLogin = false;
    
    clearError();
    clearPopupError();
    await getSettings();

    appendLog(" LogAndListDNL_bis : settings: "+NASprotocol+" "+NASlogin+":"+NASpassword+"@"+NASaddr+":"+NASport+" temp="+NAStempdir+" move="+NASdir);
/*
    try
        {
        resLogin = await loginNAS();
        appendLog("LogAndListDNL_bis: called loginNAS="+resLogin);
        } 
    catch(err)
        {
            appendLog("LoadAndLogAndListDNL_bis: Bad NAS address or login")
            showPopupError("Bad NAS address or login")
        }

    if (resLogin === true)*/
    {
      // Call addUrl with SID & URL
      appendLog("LogAndListDNL_bis: async fct now calls addUrl with SID="+NASsid+" & URL");

      let resSend = await ListQNAPDNL(NASsid);
      if (resSend === true )
      {
        appendLog("LogAndListDNL_bis: ListQNAPDNL OK with ");
      }
      else
      {
        appendLog("LogAndListDNL_bis: ListQNAPDNL error");
      }
    }
}

/* +++++++++++++++++++++++++++++++++
 Add download task using SID
*/
async function ListQNAPDNL(sid) {
    appendLog("ListQNAPDNL: SID="+sid);

    appendLog("Launch QNAP Query DS Tasks");
    var requete = NASprotocol+"://"+NASaddr+":"+NASport+"/downloadstation/V4/Task/Query";
    appendLog("Request to send:"+requete);
    var data = "sid="+sid+"&limit=0&status=all&type=all";

    try {
        let response = await fetch(requete, {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
            },
            body: data
        }
                                  )
    
    if(response.ok ) {
        var jsonData = await response.json(); //JSON.parse(this.responseText);
        appendLog("ListQNAPDNL: fetch response: "+JSON.stringify(jsonData));

        // an error occured
        if (jsonData.error > 0)
            {
                appendLog("ListQNAPDNL: error code="+jsonData.error+ " reason="+jsonData.reason);
                
                // check if session expiration error
                if ( jsonData.error === 5)
                    {
                        appendLog("ListQNAPDNL:session expired: try to relogin");
   
                    try
                        {
                        resLogin = await loginNAS();
                        appendLog("LogAndListDNL_bis: called loginNAS="+resLogin);
                        } 
                    catch(err)
                        {
                            appendLog("LoadAndLogAndListDNL_bis: Bad NAS address or login")
                            showPopupError("Bad NAS address or login");
                        }

                    if (resLogin === true)
                        {
                            let resSend = await ListQNAPDNL(NASsid);
                            if (resSend === true )
                            {
                                appendLog("LogAndListDNL_bis: ListQNAPDNL OK with ");
                            }
                            else
                            {
                                appendLog("LogAndListDNL_bis: ListQNAPDNL error");
                            }
                            return resSend;
                        }
                    }
                else // other error to report 
                {
                    showPopupError(jsonData.reason);
                    return false;
                }
            }
        
        clearDNLTable();
        appendLog("Total tasks:"+jsonData.total);
        appendLog("Total downloading:"+jsonData.status.downloading);
        setJobNb(jsonData.status.downloading);
        for (i=0; i < jsonData.total ; i++) {
            if ( jsonData.data[i].state != "5" && jsonData.data[i].state != "4") {
              appendLog("En cours ["+i+"].status : "+jsonData.data[i].state+" - "+jsonData.data[i].source_name);
              appendLog("Rate ["+i+"] : "+jsonData.data[i].total_down+" / "+jsonData.data[i].size);
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

              appendLog("Rate ["+i+"] : "+rateDNL);
              appendLog("Rate"+rateDNL.toString());
//                    AddQNAPDNL(getFilenameOfURL(jsonData.data[i].source));

              let TabElt = document.querySelector("[hash=\""+hashDNL+"\"]");
              appendLog("Query Result ("+fnDNL+" - "+hashDNL+") = "+TabElt);


              if ( TabElt == null)
              {
                appendLog("Create="+fnDNL+" - "+hashDNL);
                await AddQNAPDNLasTable(hashDNL,getFilenameOfURL(fnDNL),rateDNL.toString());
              }
              else {
                appendLog("Doublon="+fnDNL+" - "+hashDNL);
              }

                //AddQNAPDNL(jsonData.data[i].source_name); // Only filled if actually downloading state = 104
            }
            else {
              //appendLog("Fini["+i+"].status : "+jsonData.data[i].state+" - "+jsonData.data[i].source_name);

            }
        }
    }
    } catch (e) {
            //Catch Statement
        }

    return true;
}


/* +++++++++++++++++++++++++++++++++
   return filename from URL
*/
function getFilenameOfURL(url) {
  appendLog("gFN URL="+url);

  var flna = url.split("/");
  var fileURL = flna[flna.length-1];

  appendLog("fileURL="+fileURL);

  return(fileURL);
}


/* +++++++++++++++++++++++++++++++++
Login into NAS and get SID for next step
*/
async function LogAndDelDNL(hash) {
  var data = "";

    data = "user="+NASlogin+"&pass="+btoa(NASpassword);
    appendLog("param login ="+data);

    var requete = NASprotocol+"://"+NASaddr+":"+NASport+"/downloadstation/V4/Misc/Login";
    appendLog("Request to send:"+requete);

    let response = await
        fetch(requete,{
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
            },
            body: data
        })

      if (response.ok) {
        let jsonData = await response.json();
        console.log("logAndDelDNL: fetch reponse ok = "+jsonData);
          if (jsonData.error === 0)
          {
              appendLog("SID="+jsonData.sid);
              //NASsid = obj.sid;
              delDNL(jsonData.sid,hash);
          }
  }
  else {
    appendLog("LDD SID "+NASsid+" already avaialble")
  }
}

/* +++++++++++++++++++++++++++++++++
 Add download task using SID
*/
async function delDNL(sid,hash) {
    //var data = "sid="+sid+"&temp=Download&move=Multimedia%2FTemp&url=http%3A%2F%2Freleases.ubuntu.com%2F18.04%2Fubuntu-18.04.4-desktop-amd64.iso";
    appendLog("SID="+sid);
    appendLog("Hash="+hash);

    var data = "sid="+sid+"&hash="+hash;
    var requete = NASprotocol+"://"+NASaddr+":"+NASport+"/downloadstation/V4/Task/Remove";
    appendLog("Request to send:"+requete);

    let response = await
        fetch(requete,{
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
            },
            body: data
        })

      if (response.ok) {
        let jsonData = await response.json();
        console.log("DelDNL: fetch reponse ok = "+jsonData);
          if (jsonData.error === 0)
          {
            appendLog("error:"+jsonData.error);


            appendLog("EndOfDel=>List (SID ="+sid+"  )")
            setTimeout( ListQNAPDNL, 500, sid);
          }
      }
}
