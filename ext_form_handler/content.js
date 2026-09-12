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


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  setTimeout(() => { setValue("country_id", "105") }, 300)
  // Delay to ensure DOM + Select2 are ready
  setTimeout(() => {
    const data = message.payload;
    status=""
    if(checkIfConfirmed(data)){
      // Confirmed
      status="Confirm"

    }else if(checkIfTaxonomist(data)){
      // Send to taxonomist
      status="Send to Taxonimist"
      data["flag_family"]=true
      data["flag_genus"]=true
      data["flag_species"]=true
      data["flag_scientific_name"]=true
      data["flag_author_name"]=true
      if(data["locality_handwritten"]==true){
        data["flag_locality"]=true
      }
      if(data["collection_number_handwritten"]==true){
        data["flag_collection_number"]=true
      }
      if(data["collector_name_handwritten"]==true){
        data["flag_collector_name"]=true
      }

    }else if(checkIfRejected(data)){
      // Reject
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
      if(data["locality_handwritten"]==true){
        data["flag_locality"]=true
      }
      if(data["collection_number_handwritten"]==true){
        data["flag_collection_number"]=true
      }
      if(data["collector_name_handwritten"]==true){
        data["flag_collector_name"]=true
      }

    }else{
      status="Hard to decide"
    }
    

    Object.entries(data).forEach(([id, value]) => {
      //console.log(id,value)
      if(id=="country_name"){
        country_code=false
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
      setValue(id,value)
    });

    if(status=="Reject"){
      setTimeout(() => {
        const submitBtn = document.getElementById("flagToBsiBtn");
        if (!submitBtn) {
          alert("Button does not exists")
          return;
        }
        submitBtn.click();
      }, 300);
    }else{
      alert(status)
    }
  }, 300); 

});



function checkIfTaxonomist(data){
  if(
     !isValueMissing(data["genus"]) &&
     !isValueMissing(data["species"]) &&
     !isValueMissing(data["scientific_name"])
    ){
      return true
    }
  return false
}


function checkIfRejected(data){
  if(
     isValueMissing(data["genus"]) &&
     isValueMissing(data["species"]) &&
     isValueMissing(data["scientific_name"]) &&
     isValueMissing(data["author_name"])
    ){
      return true
    }
  return false
}

function checkIfConfirmed(data){
  if(!isValueMissing(data["family"]) && 
     !isValueMissing(data["genus"]) &&
     !isValueMissing(data["species"]) &&
     !isValueMissing(data["scientific_name"]) &&
     !isValueMissing(data["author_name"])
    ){
      return true
    }
  return false
}



function isValueMissing(val){
  val=val.toLowerCase()
  if(val=="" || val=="no family" || val=="no genus" || val=="sp." || val=="no species"){
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
