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

THREASHOLD_VALUE=0
AUTOSUBMIT=true

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Delay to ensure DOM + Select2 are ready

  setTimeout(() => {
    setValue("flag_family",false)
    setValue("flag_scientific_name",false)
    let isFillingRequired=true
    const data = message.payload;

    status="You decide"
    const isIpniVerified=data.ipni_verified || false
    fam=getFamilyValue()
    setValue("current_name","");
    if(checkIfRejected()){
      status="Reject"
      data["flag_family"]=true
      data["flag_genus"]=true
      data["flag_species"]=true
      data["flag_scientific_name"]=true
      data["flag_author_name"]=true
      data["family"]="No Family"
      data["genus"]="No Genus"
      data["species"]="No Species"
      data["scientific_name"]=""
      data["author_name"]=""
      isFillingRequired=false;
    } 
    if(checkIfConfirmed(data,isIpniVerified)){
      // Confirmed
      status="Confirm"
    }
    if(!checkIfRejected() && checkIfTaxonomist(data,isIpniVerified)){
      // Send to taxonomist
      status="Send to Taxonimist"      
      setValue("flag_family",true)
      setValue("flag_scientific_name",true)
      if(data["country_name_confidence_score"]<THREASHOLD_VALUE){
        data["flag_country"]=true
      }
      if(data["state_confidence_score"]<THREASHOLD_VALUE){
        data["flag_state"]=true
      }
      if(data["locality_confidence_score"]<THREASHOLD_VALUE){
        data["flag_locality"]=true
      }
      if(data["collector_name_confidence_score"]<THREASHOLD_VALUE){
        data["flag_collector_name"]=true
        data["collector_name"]=getValue("collector_name")
      }
    
    }

      Object.entries(data).forEach(([id, value]) => {
        //console.log(id,value)
        if(id=="scientific_name"){
          existing_scientific_name=getValue("scientific_name")
          if(!isIpniVerified && (!isStringSame(value,existing_scientific_name) || data["scientific_name_confidence_score"]<THREASHOLD_VALUE)){
              value=existing_scientific_name
              setValue("flag_family",true)
              setValue("flag_scientific_name",true)
              if(isFillingRequired)
                status="Send to Taxonimist"
          }
        }


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
              setTimeout(() => { setValue("country_id", country_code) }, 300)
              if(country_code=="265"){
                setValue("flag_country",true);
              }
            }else{
              setTimeout(() => { setValue("country_id", "265") }, 300)
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

        if(id=="author_name" && getValue("author_name")!=value){
          if(!isIpniVerified){
            if(getValue("author_name").length!=0){
              value=getValue("author_name")
            }
            //setValue("flag_author_name",true)
          }
        }
        if(id=="collector_name" && data["collector_name_confidence_score"]<THREASHOLD_VALUE){
          if(isFillingRequired && !isIpniVerified){
            alert("collector name problem")
            status="Send to Taxonimist"
          }
        }
        if(id=="locality" && data["locality_confidence_score"]<THREASHOLD_VALUE){
          if(isFillingRequired && !isIpniVerified){
            alert("locality problem")
            status="Send to Taxonimist"
          }
        }
        if(id=="state" && data["state_confidence_score"]<THREASHOLD_VALUE){
          if(isFillingRequired && !isIpniVerified)
            alert("state problem")
            status="Send to Taxonimist"
        }
        if(id=="country_name" && data["country_name_confidence_score"]<THREASHOLD_VALUE){
          if(isFillingRequired && !isIpniVerified){
            alert("country name problem")
            status="Send to Taxonimist"
          }
        }

        // Setting values
        if(id!="family"){
          setValue(id,value)
        }else{
          setFamilyValue(value)
        }
        
      });
    
    if(!AUTOSUBMIT){
      //alert(status)
    }  
    
    if(status=="Reject"){
      if(AUTOSUBMIT){
        setTimeout(() => {
          const submitBtn = document.getElementById("flagToBsiBtn");
          if (!submitBtn) {
            alert("Button does not exists")
            return;
          }
          submitBtn.click();
        }, 300);
      }
    } else if(status=="Confirm"){
      if(AUTOSUBMIT){
        setTimeout(() => {
          const submitBtn = document.getElementById("acceptBtn");
          if (!submitBtn) {
            alert("Button does not exists")
            return;
          }
          submitBtn.click();
        }, 300);
      }
    } else if(status=="Send to Taxonimist"){
        alert(status)
        if(AUTOSUBMIT){
          /*setTimeout(() => {
            const submitBtn = document.getElementById("flagToTaxonomistBtn");
            if (!submitBtn) {
              alert("Button does not exists")
              return;
            }
            submitBtn.click();
          }, 300);*/
        }
    } else {
      alert(status)
    }
  }, 300); 

});



function checkIfTaxonomist(data,isIpniVerified=false){
  if(isIpniVerified){
    if(
     isValueMissing(data["genus"]) ||
     isValueMissing(data["species"]) ||
     isValueMissing(data["scientific_name"]) ||
     isValueMissing(data["family"]) ||
     isValueMissing(data["author_name"]) 
    ){
      return true
    }else{
      return false
    }
  }
  // 1. Check any of the mandatory fields are missing
  if(
     isValueMissing(getValue("genus")) ||
     isValueMissing(getValue("species")) ||
     isValueMissing(getValue("scientific_name")) ||
     isValueMissing(getFamilyValue()) ||
     isValueMissing(getValue("author_name")) 
    ){
      if(isValueMissing(getValue("author_name"))){
        alert("Author name is missing - Check IPNI")
      }
      return true
    }
  // 2. Check if there exists any difference between present value and rectified value
  if(data["scientific_name"]!=getValue("scientific_name") && !isIpniVerified){
    alert("Scientific Name not matching - Check IPNI")
    return true
  }
  return false
}


function checkIfRejected(){
  if(
     isValueMissing(getValue("genus")) &&
     isValueMissing(getValue("species")) &&
     isValueMissing(getFamilyValue())
    ){
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
  val=val.toLowerCase() || ""
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
  return document.querySelector(`#${id}`).value;
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
    chec = el.getAttribute("name")
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
