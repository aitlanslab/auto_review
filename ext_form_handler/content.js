async function stateToId(stateName) {
  const COUNTRIES_JSON_PATH = "states.json";
  const url = chrome.runtime.getURL(COUNTRIES_JSON_PATH);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${COUNTRIES_JSON_PATH}: ${res.status}`);
  const json = await res.json();
  if (Array.isArray(json)) {
    for (const item of json) {
      if (!item) continue;
      if(item.name==stateName.toLowerCase()){
        return item.id
      }
    }
  }
  return false;
}

async function countryToId(countryName) {
  const COUNTRIES_JSON_PATH = "countries.json";
  const url = chrome.runtime.getURL(COUNTRIES_JSON_PATH);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${COUNTRIES_JSON_PATH}: ${res.status}`);
  const json = await res.json();
  if (Array.isArray(json)) {
    for (const item of json) {
      if (!item){
        continue;
      }
      if(item.name.toLowerCase()==countryName.toLowerCase()){
        return item.id
      }
    }
  }
  return false;
}

function isStringSame(str1,str2){
  str1=str1.replaceAll(".","").replaceAll("(","").replaceAll(")","").replaceAll(" ","")
  str2=str2.replaceAll(".","").replaceAll("(","").replaceAll(")","").replaceAll(" ","")
  if(str1.toLowerCase()==str2.toLowerCase()){
    return true;
  }
  return false;
}

THREASHOLD_VALUE=0.90
AUTOSUBMIT=true
DEBUG=false

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Delay to ensure DOM + Select2 are ready

  setTimeout(() => {
    setValue("flag_family",false)
    setValue("flag_scientific_name",false)

    let isFillingRequired=true
    const data = message.payload;
    let isIpniVerified=false
    isIpniVerified = data?.ipni_verified ?? false;

    //remove scientific name
    if(!isIpniVerified){
      delete data.scientific_name
    }
    

    status="Validate with IPNI"


    old_genus=getValue("genus")
    new_genus=data["genus_name"] || ""
    if(old_genus=="No Genus" && new_genus!=""){
      setValue("genus",data["genus_name"])  
    }


    if(getValue("species").toLowerCase()=="no species" || getValue("species").toLowerCase()==""){
      setValue("species","sp.")
      if(!getValue("scientific_name").includes("sp.") && getValue("genus").toLowerCase()!="no genus"){
        sc_name=getValue("genus")+" sp. "+getValue("author_name")
        setValue("scientific_name",sc_name)
      }
    }

    // If scientific name is missing the author name put it
    if(!getValue("scientific_name").includes(getValue("author_name")) && getValue("author_name").length!=0){
      sc_name=getValue("genus")+" "+getValue("species")+" "+getValue("author_name")
      setValue("scientific_name",sc_name)
    }



    if(isIpniVerified){
      status="Confirm"
    }

    fam=getFamilyValue()
    setValue("current_name","");
    let prequalified=false
    // By pass IPNI Verification if all the required fields are present
    // Code of 12 Nov 2026
     if(
        fam.toLowerCase()!="no family" && fam.length!=0 && 
        getValue("genus").toLowerCase()!="no genus" && getValue("genus").length!=0 &&
        getValue("species").toLowerCase()!="no species" && getValue("species").length!=0 &&
        getValue("author_name").length!=0 && getValue("scientific_name").includes(getValue("author_name")) &&
        getValue("scientific_name").length!=0 &&  getValue("scientific_name").includes(getValue("species")) && getValue("scientific_name").split(' ').length - 1 >=2
      ){
          status="Confirm"
          isIpniVerified=true
          prequalified=true
      }
    
    // Case 1 - Rejected
    if(checkIfRejected(data)){
      status="Reject"
      if(!isValueMissing(getValue("scientific_name"))){
        status="Validate with IPNI"
      }
      else if(isValueMissing(getValue("scientific_name")) && (!isValueMissing(getValue("genus")) || !isValueMissing(getValue("species")) )){
        status="Validate with IPNI"
      } 
      else{
          if(!AUTOSUBMIT){
            alert("Reject - Line 68")
          }
          data["scientific_name"]=getValue("scientific_name")
          data["flag_family"]=true
          data["flag_genus"]=true
          data["flag_species"]=true
          data["flag_scientific_name"]=true
          data["flag_author_name"]=true
      }

      //data["family"]="No Family"
      //data["genus"]="No Genus"

      Object.entries(data).forEach(([id, value]) => {
        if(id=="country_name"){
          country_code=false
          if(value.toLowerCase()=="united states" || value.toLowerCase()=="united states of america"){
            value="USA"
          }
          existing_country_id=getCountryId()
          if(existing_country_id=="115" && value.toLowerCase()!="india"){
            value="unknown"
          }
          countryToId(value).then(id=>{
            country_code=id
            if(country_code!=false){
              setTimeout(() => { setValue("country_id", country_code) }, 500)
              if(country_code=="265"){
                setValue("flag_country",true);
              }
            }else{
              setTimeout(() => { setValue("country_id", "265") }, 500)
              setValue("flag_country",true);
            }
          })
        }
        if(id=="state"){
          state_code=false
          stateToId(value).then(id=>{
            state_code=id
            if(state_code!=false){
              setTimeout(() => { setValue("state_id", state_code) }, 1500)
            }
          }) 
        }
        setValue(id,value)
      })
      isFillingRequired=false;
    } 

    // Case 2 - Send to Taxonomist
    if(checkIfTaxonimoist(data) && isFillingRequired && !prequalified){
      status="Send to Taxonimist"
      if(DEBUG) alert("Taxonomist Line 165")
      if(isValueMissing(getFamilyValue()) && !data["ipni_verified"]){
        status="Validate with IPNI"
      }else{
        if(getFamilyValue()=="No Family"){
          data["flag_family"]=true
        }
        data["scientific_name"]=getValue("scientific_name")
        //data["flag_species"]=true
        data["flag_scientific_name"]=true
        data["flag_author_name"]=true
      }

      Object.entries(data).forEach(([id, value]) => {
        if(id=="country_name"){
          country_code=false
          if(value.toLowerCase()=="united states" || value.toLowerCase()=="united states of america"){
            value="USA"
          }
          existing_country_id=getCountryId()
          if(existing_country_id=="115" && value.toLowerCase()!="india"){
            value="unknown"
          }
          countryToId(value).then(id=>{
            country_code=id
            if(country_code!=false){
              setTimeout(() => { setValue("country_id", country_code) }, 500)
              if(country_code=="265"){
                setValue("flag_country",true);
              }
            }else{
              setTimeout(() => { setValue("country_id", "265") }, 500)
              setValue("flag_country",true);
            }
          })

        }
        if(id=="state"){
          state_code=false
          stateToId(value).then(id=>{
            state_code=id
            if(state_code!=false){
              setTimeout(() => { setValue("state_id", state_code) }, 1500)
            }
          }) 
        }
        setValue(id,value)
      })
      isFillingRequired=false;
    }

    // Case 3 - Check if IPNI verification required
    if(!isIpniVerified && isFillingRequired && !prequalified){
      Object.entries(data).forEach(([id, value]) => {
        // Non IPNI Fillings
        if(id=="scientific_name"){
          value=getValue("scientific_name")
        }
        if(id=="country_name"){
          value=value.replace(/\[.*?\]/g, '');
          country_code=false
          if(value.toLowerCase()=="united states" || value.toLowerCase()=="united states of america"){
            value="USA"
          }
          existing_country_id=getCountryId()
          if(existing_country_id=="115" && value.toLowerCase()!="india"){
            value="unknown"
          }
          countryToId(value).then(id=>{
            country_code=id
            if(country_code!=false){
              setTimeout(() => { setValue("country_id", country_code) }, 500)
              if(country_code=="265"){
                setValue("flag_country",true);
              }
            }else{
              setTimeout(() => { setValue("country_id", "265") }, 500)
              setValue("flag_country",true);
            }
          })

        }
        if(id=="state"){
          state_code=false
          value=value.replace(/\[.*?\]/g, '');
          stateToId(value).then(id=>{
            state_code=id
            if(state_code!=false){
              setTimeout(() => { setValue("state_id", state_code) }, 1500)
            }
          }) 
        }
        if(id=="locality"){
          value=value.replace(/\[.*?\]/g, '');
        }
        if(id=="collector_name"){
          value=value.replace(/\[.*?\]/g, '');
        }
        setValue(id,value)
      });
    }

    // Case 4 - If IPNI verified
    if(isIpniVerified && isFillingRequired && !prequalified){
      
      fields_already_filled=["country_name","country_id","state_id","collector_name","locality","lat_deg","lat_min","lat_sec","lon_deg","lon_min","lon_sec","latitude","longitude"]
      if(!data["scientific_name"].includes(" ")){
        data["scientific_name"]=getValue("scientific_name")
      }
      if(data["scientific_name"].includes("sp.")){
        data["species"]="sp."
      }
      if(data["family"]=="No Family"){
          if(data["scientific_name"]!="" && (data["genus"]!="No Genus" || data["species"]!="No Species")){
              status="Send to Taxonimist"
              if(DEBUG) alert("Send to taxonomist - Line 226")
              data["flag_family"]=true
              data["flag_genus"]=true
              data["flag_species"]=true
              data["flag_scientific_name"]=true
              data["flag_author_name"]=true
          }else if(data["genus"]!="No Genus" && data["genus"].length!=0 && (data["family"]=="No Family" || data["species"]=="sp." || data["species"]=="No Species")){
            status="Send to Taxonimist"
            if(DEBUG) alert("Taxonomist Line 287")
          }else{
            status="Reject"
            if(!AUTOSUBMIT){
              alert("Reject - Line 229")
            }
            data["flag_family"]=true
            data["flag_genus"]=true
            data["flag_species"]=true
            data["flag_scientific_name"]=true
            data["flag_author_name"]=true
          }

        }
      // Handle cases
      if(data["scrapping_success"]==false){
        data["flag_family"]=true
        data["flag_scientific_name"]=true
        status="Send to Taxonimist"
        if(DEBUG) alert("Send to taxonomist - Line 521")
        if(data["family"]=="No Family"){
          status="Reject"
          if(!AUTOSUBMIT){
            alert("Reject - Line 68")
          }
          data["flag_family"]=true
          data["flag_genus"]=true
          data["flag_species"]=true
          data["flag_scientific_name"]=true
          data["flag_author_name"]=true
        }
      }

      if(data["multiple_authors"]==true){
        data["flag_author_name"]=true
        //data["author_name"]="" 
        if(status!="Reject"){
          status="Send to Taxonimist"
          if(DEBUG) alert("Send to taxonomist - Line 269")
        }
      }

      // If not getting family name and author name flag to taxonomist
      if(data["family"]=="No Family" || data["author_name"]=="null" || data["author_name"]==null){
        status="Send to Taxonimist"
        if(DEBUG) alert("Taxonomist Line 331")
      }

      Object.entries(data).forEach(([id, value]) => {
        // IPNI Fillings, ignoring the fields already filled
        if(!fields_already_filled.includes(id) && isFillingRequired){
          if(id=="family"){
            setFamilyValue(value)
          }else{
            setValue(id,value)
          }
        }
      });
    }
    

    // Case 5 - Everything is already correct
    if(prequalified){
      Object.entries(data).forEach(([id, value]) => {
        // Non IPNI Fillings
        if(id=="country_name"){
          value=value.replace(/\[.*?\]/g, '');
          country_code=false
          if(value.toLowerCase()=="united states" || value.toLowerCase()=="united states of america"){
            value="USA"
          }
          existing_country_id=getCountryId()
          if(existing_country_id=="115" && value.toLowerCase()!="india"){
            value="unknown"
          }
          countryToId(value).then(id=>{
            country_code=id
            if(country_code!=false){
              setTimeout(() => { setValue("country_id", country_code) }, 500)
              if(country_code=="265"){
                setValue("flag_country",true);
              }
            }else{
              setTimeout(() => { setValue("country_id", "265") }, 500)
              setValue("flag_country",true);
            }
          })

        }
        if(id=="state"){
          state_code=false
          value=value.replace(/\[.*?\]/g, '');
          stateToId(value).then(id=>{
            state_code=id
            if(state_code!=false){
              setTimeout(() => { setValue("state_id", state_code) }, 1500)
            }
          }) 
        }
        if(id=="locality"){
          value=value.replace(/\[.*?\]/g, '');
        }
        if(id=="collector_name"){
          value=value.replace(/\[.*?\]/g, '');
        }
        setValue(id,value)
      });
    }

    if(status=="Reject" && data["plant_name"]!=""){
      status="Send to Taxonimist"
      if(DEBUG) alert("Taxonomist Line 348")
    }

    if(status=="Confirm"){
        data["flag_family"]=false
        data["flag_genus"]=false
        data["flag_species"]=false
        data["flag_scientific_name"]=false
        data["flag_author_name"]=false
        Object.entries(data).forEach(([id, value]) => {
          setValue(id,value)
        });
      setTimeout(() => {
        const submitBtn = document.getElementById("acceptBtn");
        if (!submitBtn) {
          alert("Button does not exists")
          return;
        }
        if(AUTOSUBMIT){
           submitBtn.click(); 
           //alert(status)
          }else{
          alert("Confirming")
        }
        
      }, 300);
    }else if(status=="Reject"){
      setTimeout(() => {
        const submitBtn = document.getElementById("flagToBsiBtn");
        if (!submitBtn) {
          alert("Button does not exists")
          return;
        }
       if(AUTOSUBMIT){ 
        submitBtn.click(); 
        //alert(status)
       }else{ alert(status) }
       
      }, 300);
    }else if(status=="Send to Taxonimist"){
      setTimeout(() => {

        const submitBtn = document.getElementById("flagToTaxonomistBtn");
        if (!submitBtn) {
          alert("Button does not exists")
          return;
        }
        if(AUTOSUBMIT){ 
          submitBtn.click();
          //alert("Taxonomist")
         }else{alert("Send to Taxonomist") }
        
      }, 300);
    }else{
      alert(status)
    }
  }, 300); 
});


function checkIfRejected(data){
  // If scientific name is present but genus is not present - it can not be rejected
  if(
     isValueMissing(getValue("genus")) ||
     isValueMissing(getValue("scientific_name"))
    ){
      return true
    }
  return false
}


function checkIfTaxonimoist(data){
  if(isValueMissing(getValue("author_name")) && (isValueMissing(getValue("genus")))){
    return true
  }
  if(isValueMissing(getFamilyValue())){
    return true
  }
  return false  

}

function checkIfConfirmed(data,ipni_verified=false){
  if( !isValueMissing(getValue("genus")) &&
     !isValueMissing(getValue("species")) &&
     !isValueMissing(getValue("scientific_name")) &&
      !isValueMissing(getValue("author_name"))
    ){
      return true      
    }
  return false
}



function isValueMissing(val){
  val=(val || "").toLowerCase() || ""
  if(val=="" || val=="no family" || val=="no genus" || val=="sp." || val=="no species" || val=="sp"){
    return true;
  }
  return false;
}

/*
          const interval = setInterval(() => {
            const state = document.getElementById('state_id');

            if (!state) return;

            state.value = value
            state.dispatchEvent(new Event('change', { bubbles: true }));

            console.log('forcing state...');
          }, 300);

*/

function getValue(id){
  return document.querySelector(`#${id}`).value || "";
}

function getFamilyValue() {
  return document.querySelector('#select2-family-container').textContent
  //setTimeout(()=>{
    return document.querySelector("#family").value;
  //},300)
  
}

function getCountryId(){
  return document.querySelector("#country_id").value;
}

function setFamilyValue(value) {
  const select = document.getElementById('family');
  const option = document.createElement('option');
  option.value = value;
  option.text = value;
  option.selected = true;

  select.appendChild(option);

  select.dispatchEvent(new Event('change', {
    bubbles: true
  }));

  document.querySelector('#select2-family-container').textContent = value;
}
// ---------- Helper ----------
function setValue(id, value) {
  const el = document.getElementById(id);
  if (!el) return;

  if (el.type === "checkbox") {
    el.checked = value === 1 || value === true;
    let chec = el.getAttribute("name")
    console.log({ key: chec, val: value })

  }
  else if (el.tagName === "SELECT") {
    console.log(el.tagName)
    el.value = value;
    el.dispatchEvent(new Event("change", { bubbles: true }));

    // Select2 support
    if (window.jQuery && jQuery(el).hasClass("select2-hidden-accessible")) {
      jQuery(el).trigger("change.select2");
    }
  }
  else {
    if(value==null){
      value=""
    }
    value=value.toString()
    value = value.replace("&amp;", "&")
    el.value = value ?? "";
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

/*
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.action === "submitForm") {
    // Small delay to ensure all values are fully applied
    setTimeout(() => {
      const submitBtn = document.getElementById("submitBtn");

      if (!submitBtn) {
        console.warn("submitBtn not found on page");
        return;
      }

      submitBtn.click();
    }, 300);

    return;
  }

  if (message.action !== "fillForm") return;

  // existing fillForm logic ↓↓↓
});
*/
