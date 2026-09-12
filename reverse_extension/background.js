chrome.action.onClicked.addListener((tab) => {
  // Check if the tab URL matches the review annotations page
  if (tab.url && tab.url.includes('review_annotations.php')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractAndShowData
    });
  } else {
    // Show a simple alert if not on the correct page
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        alert('Please navigate to the BSI Review Annotations page first.');
      }
    });
  }
});

// This function is injected into the page
function extractAndShowData() {
  // Wait for elements to be available
  function waitForElements(callback, retries = 20) {
    const imageElement = document.getElementById('previewImage');
    const formElement = document.getElementById('annotationForm');
    
    if (imageElement && imageElement.src && imageElement.src !== '' && formElement) {
      // Check if image is actually loaded
      if (imageElement.complete && imageElement.naturalWidth > 0) {
        callback();
        return;
      }
    }
    
    if (retries <= 0) {
      // Show loading message when elements not ready
      if (confirm('⏳ Loading...\n\nThe page is still loading. Please wait for the image and form data to load completely, then try again.\n\nClick OK to dismiss this message and try again later.')) {
        return;
      }
      return;
    }
    
    setTimeout(() => {
      waitForElements(callback, retries - 1);
    }, 500);
  }

  function extractData() {
    try {
      // Helper function to get value safely
      function getVal(id) {
        const el = document.getElementById(id);
        if (!el) return '';
        return el.value || '';
      }

      // Helper function to get select text
      function getSelectText(id) {
        const el = document.getElementById(id);
        if (!el) return '';
        if (el.tagName === 'SELECT' && el.selectedIndex >= 0) {
          return el.options[el.selectedIndex] ? el.options[el.selectedIndex].text.trim() : '';
        }
        return el.value || '';
      }

      // Get collection date fields
      const day = getVal('collection_day');
      const month = getVal('collection_month');
      const year = getVal('collection_year');
      
      // Check if full date is available
      const isFullDateAvailable = day !== '' && month !== '' && year !== '';

      // Get latitude from DMS fields
      let latitude = '';
      const latDir = getVal('lat_dir');
      const latDeg = getVal('lat_deg');
      const latMin = getVal('lat_min');
      const latSec = getVal('lat_sec');
      
      if (latDir && latDeg) {
        let latStr = `${latDir} ${latDeg}°`;
        if (latMin) latStr += ` ${latMin}'`;
        if (latSec) latStr += ` ${latSec}"`;
        latitude = latStr;
      }

      // Get longitude from DMS fields
      let longitude = '';
      const lonDir = getVal('lon_dir');
      const lonDeg = getVal('lon_deg');
      const lonMin = getVal('lon_min');
      const lonSec = getVal('lon_sec');
      
      if (lonDir && lonDeg) {
        let lonStr = `${lonDir} ${lonDeg}°`;
        if (lonMin) lonStr += ` ${lonMin}'`;
        if (lonSec) lonStr += ` ${lonSec}"`;
        longitude = lonStr;
      }

      // Build the JSON object in the exact format requested
      const data = {
        family: getSelectText('family'),
        family_handwritten:false,
        genus: getVal('genus'),
        genus_handwritten:false,
        species: getVal('species'),
        species_handwritten:false,
        author_name: getVal('author_name'),
        author_name_handwritten:false,
        scientific_name: getVal('scientific_name'),
        scientific_name_handwritten:false,
        collector_name: getVal('collector_name'),
        collector_name_handwritten:false,
        is_full_date_available: isFullDateAvailable,
        is_date_handwritten:false,
        day_of_collection: day || '',
        month_of_collection: month || '',
        year_of_collection: year || '',
        country_name: getSelectText('country_id'),
        country_name_handwritten:false,
        state: getSelectText('state_id'),
        state_handwritten:false,
        district: getVal('locality'), // Using locality as district
        district_handwritten:false,
        city: '',
        city_handwritten:false,
        village: '',
        village_handwritten:false,
        locality: getVal('locality'),
        locality_handwritten:false,
        collection_number: getVal('collection_number'),
        altitude: getVal('altitude'),
        latitude: latitude,
        longitude: longitude
      };

      // Clean up - ensure all fields exist with proper values
      const cleanedData = {};
      for (const [key, value] of Object.entries(data)) {
        // Preserve boolean values
        if (typeof value === 'boolean') {
          cleanedData[key] = value;
        } 
        // For strings, trim and keep if not empty
        else if (typeof value === 'string') {
          cleanedData[key] = value.trim();
        } 
        // For other types, keep as is
        else {
          cleanedData[key] = value;
        }
      }

      const jsonString = JSON.stringify(cleanedData, null, 2);
      
      // Show the JSON in an alert with copy functionality
      if (confirm(`✅ Data Extracted Successfully!\n\nClick OK to copy the JSON to clipboard.\n\n📋 JSON:\n${jsonString}`)) {
        // Copy to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(jsonString)
            .then(() => {
              // Show success message
              console.log('✅ JSON copied to clipboard successfully!');
            })
            .catch(() => {
              // Fallback copy method
              copyUsingTextarea(jsonString);
            });
        } else {
          // Fallback for older browsers
          copyUsingTextarea(jsonString);
        }
      }
      
      return jsonString;
    } catch (error) {
      alert(`❌ Error extracting data: ${error.message}\n\nPlease ensure you are on the BSI Review Annotations page with the form loaded.`);
      return null;
    }
  }

  // Helper function for fallback copy
  function copyUsingTextarea(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      console.log('✅ JSON copied to clipboard successfully!');
    } catch (e) {
      alert('❌ Failed to copy. Please copy the JSON manually from the previous dialog.');
    }
    document.body.removeChild(textarea);
  }

  // Check if we're on the right page
  if (!window.location.href.includes('review_annotations.php')) {
    alert('Please navigate to the BSI Review Annotations page (review_annotations.php) first.');
    return;
  }

  // Check if required elements exist
  const imageElement = document.getElementById('previewImage');
  const formElement = document.getElementById('annotationForm');

  if (!imageElement || !formElement) {
    alert('❌ Required elements not found on this page.\n\nPlease ensure you are on the BSI Review Annotations page with a loaded annotation.');
    return;
  }

  // Check if image is loaded
  if (imageElement.src && imageElement.complete && imageElement.naturalWidth > 0) {
    // Image is loaded, extract data
    extractData();
  } else {
    // Image not loaded, show loading message
    if (confirm('⏳ Loading...\n\nThe annotation data is still loading. Please wait for the image and form to load completely, then try again.\n\nClick OK to dismiss this message and try again later.')) {
      // User acknowledged
    }
  }
}