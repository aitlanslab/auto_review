document.getElementById("scrapeBtn").addEventListener("click", async () => {

    const loading = document.getElementById("loading");
    const button = document.getElementById("scrapeBtn");

    try {

        // Show loading
        loading.style.display = "block";
        button.disabled = true;
        button.textContent = "Scraping...";

        const input_json = document.getElementById("keyword").value.trim();
        json = JSON.parse(input_json)

        // First try: genus + species
        let keyword = `${json.genus} ${json.species}`;

        // Helper function for search
        async function searchIPNI(query) {
            const url = `https://ipni.org/api/1/search?q=${encodeURIComponent(query)}`;
            const res = await fetch(url);
            return await res.json();
        }

        // Search using full keyword
        let searchJson = await searchIPNI(keyword);

        // Fallback: only genus
        if (!searchJson.results || !searchJson.results.length) {

            keyword = json.genus;

            console.log("No species result found. Retrying with genus only...");

            searchJson = await searchIPNI(keyword);
        }

        // Still no result
        if (!searchJson.results || !searchJson.results.length) {
            alert("No results found");
            return;
        }

        // First search result
        const firstResult = searchJson.results[0];

        // Build page URL
        const pageUrl = `https://ipni.org${firstResult.url}`;

        // STEP 2: Fetch HTML page
        const pageRes = await fetch(pageUrl);
        const html = await pageRes.text();

        // Parse HTML
        const doc = new DOMParser().parseFromString(html, "text/html");
        const scientificName = doc.querySelector("h2").innerText;
        // Helper function
        const getField = (label) => {
            const dt = [...doc.querySelectorAll("dt")]
                .find(el => el.textContent.includes(label));

            return dt?.nextElementSibling?.textContent.trim() || null;
        };

        // Authors
        const authors = [...doc.querySelectorAll(".author-link")]
            .map(el => el.textContent.trim());

        // Final data
        const data = {
            searchedKeyword: keyword,
            pageUrl,
            family: getField("Family as entered in IPNI"),
            locality: getField("Locality"),
            distribution: getField("Distribution Of Types"),
            remarks: getField("Remarks"),
            lsid: getField("IPNI Life Sciences Identifier"),
            authors,
            firstAuthor: authors[0] || null,
            authorCitation: authors.join(" ex ")
        };
        json["family"] = getField("Family as entered in IPNI")
        if(json["family"]==null || json["family"]=="null"){
            json["family"]="No Family"
            json["flag_family"]=true
        }
        json["scientific_name"]=scientificName
        json["ipni_verified"]=true
        if(authors.length!=0){
            json["author_name"]=authors[0]
        }
        if(json["family"]==null){
            json["family"]="null"
        }
        navigator.clipboard.writeText(JSON.stringify(json, null, 2))
            .then(() => {
                console.log("JSON copied to clipboard");
                // Optional: you can still have reload if needed
                // window.location.reload();
            })
            .catch(err => console.error("Failed to copy:", err));
        alert(JSON.stringify(json, null, 2));

    } catch (err) {

        console.error(err);
        alert("Error: " + err.message);

    } finally {

        // Hide loading
        loading.style.display = "none";
        button.disabled = false;
        button.textContent = "Scrape";
    }
});