document.getElementById("scrapeBtn").addEventListener("click", async () => {


    /**
 * Picks the best-matching IPNI result for a query string.
 *
 * Scoring priority (highest wins):
 *   1. Exact case-insensitive match of `name` to query
 *   2. Exact match of `name` to query ignoring rank/author (uses genus+species)
 *   3. Query starts with result `name` (genus-level query, species result)
 *   4. Result `name` starts with query (query is a prefix of the full name)
 *   5. Token overlap / Levenshtein-ish similarity
 *
 * Falls back to results[0] if nothing scores above zero.
 *
 * @param {Array}  results  - searchJson.results
 * @param {string} query    - the keyword that was searched
 * @returns {Object|null}   - the best result object
 */
function pickBestResult(results, query) {
    if (!Array.isArray(results) || results.length === 0) return null;

    const norm = (s) =>
        (s || "")
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")   // strip diacritics
            .replace(/[^a-z0-9\s-]/g, " ")     // punctuation -> space
            .replace(/\s+/g, " ")
            .trim();

    const q = norm(query);
    if (!q) return results[0];

    // Simple similarity: 1 - normalized edit distance
    function levenshtein(a, b) {
        if (a === b) return 0;
        if (!a.length) return b.length;
        if (!b.length) return a.length;
        const prev = new Array(b.length + 1);
        for (let j = 0; j <= b.length; j++) prev[j] = j;
        for (let i = 1; i <= a.length; i++) {
            let prevDiag = prev[0];
            prev[0] = i;
            for (let j = 1; j <= b.length; j++) {
                const tmp = prev[j];
                prev[j] = Math.min(
                    prev[j] + 1,        // deletion
                    prev[j - 1] + 1,    // insertion
                    prevDiag + (a[i - 1] === b[j - 1] ? 0 : 1)
                );
                prevDiag = tmp;
            }
        }
        return prev[b.length];
    }
    const similarity = (a, b) => {
        const m = Math.max(a.length, b.length);
        return m === 0 ? 1 : 1 - levenshtein(a, b) / m;
    };

    let best = results[0];
    let bestScore = -Infinity;

    for (const r of results) {
        const name = norm(r.name);
        // Build the "binomial / uninomial" part without the author or rank markers
        // e.g. "Jasminum sect. Alternifolia" -> "jasminum alternifolia"
        const binomial = norm(
            [r.genus, r.species].filter(Boolean).join(" ")
        );
        const fullName = norm(
            [
                r.genus,
                r.rank && r.rank !== "gen." && r.rank !== "spec."
                    ? r.rank
                    : "",
                r.rank === "var." || r.rank === "subsp." || r.rank === "forma"
                    ? r.infraspecies
                    : "",
                r.species,
                r.infraspecies,
            ]
                .filter(Boolean)
                .join(" ")
        );

        let score = 0;

        // 1. Exact match on `name` (best possible)
        if (name === q) score = 1000;

        // 2. Exact match on genus+species (very strong)
        else if (binomial && binomial === q) score = 900;

        // 3. Query is a genus and result is exactly that genus
        else if (r.genus && norm(r.genus) === q) score = 850;

        // 4. Query starts with result name (query is more specific than result)
        else if (name.startsWith(q + " ") || name === q) score = 700;

        // 5. Result name starts with query (query is a prefix)
        else if (name.startsWith(q)) score = 600;

        // 6. Fuzzy similarity
        else {
            score = similarity(q, name) * 500;
            // bonus if the genus matches at all
            if (r.genus && norm(r.genus) === q.split(" ")[0]) score += 100;
        }

        // Small tiebreakers: prefer the "canonical" record (topCopy / inPowo)
        if (r.topCopy) score += 5;
        if (r.inPowo) score += 5;
        // Prefer species/genus over infraspecific if scores are close
        if (r.rank === "gen." || r.rank === "spec.") score += 2;

        if (score > bestScore) {
            bestScore = score;
            best = r;
        }
    }

    // If nothing scored at all, fall back to first result
    return bestScore > 0 ? best : results[0];
}



    const loading = document.getElementById("loading");
    const button = document.getElementById("scrapeBtn");
    const input_json = document.getElementById("keyword").value.trim();
    json = JSON.parse(input_json)
    try {
        // Show loading
        loading.style.display = "block";
        button.disabled = true;
        button.textContent = "Scraping...";
        // First try: genus + species
        let keyword = `${json.genus} ${json.species}`;
        keyword = keyword.replace("sp.","");
        if(json.genus=="No Genus"){
            keyword=json.scientific_name
        }


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
            json["scrapping_success"]=false
            json["ipni_verified"]=true
            json["multiple_authors"]=false
            navigator.clipboard.writeText(JSON.stringify(json, null, 2))
                .then(() => {
                    console.log("JSON copied to clipboard");
                })
                .catch(err => console.error("Failed to copy:", err));
            alert(JSON.stringify(json, null, 2));
            return;
        }

        // First search result
        //const firstResult = searchJson.results[0];
        const firstResult = pickBestResult(searchJson.results, keyword);

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
        let authors = [...doc.querySelectorAll(".author-link")]
            .map(el => el.textContent.trim());

        if(authors.length==0){
            authors = doc.querySelector(
                '.record-detail__heading h2 i[lang="la"]'
            ).nextSibling.textContent.trim().split(';');
        }
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
        let family=getField("Family as entered in IPNI")

        if(json["family"]=="No Family"){
            json["family"] = family
        }
        
        if(family==null || family=="null"){
            json["family"]="No Family"
            json["flag_family"]=true
        }
        //make sure author name != null
        if(json["author_name"]==null || json["author_name"]=="null"){
            json["author_name"]=""
        }

        if(json["author_name"].length==0){
            json["author_name"]=data["firstAuthor"]
            if(!json["scientific_name"].includes(data["firstAuthor"]) && (data["firstAuthor"]!=null || data["firstAuthor"]!="null")){
                json["scientific_name"]=json["scientific_name"]+" "+data["firstAuthor"]
            }
        }


        //json["scientific_name"]=scientificName
        json["ipni_verified"]=true
        /*if(authors.length!=0){
            json["author_name"]=authors[0]
        }*/
        json["multiple_authors"]=false
        if(json["family"]==null){
            json["family"]="null"
        }
        json["scrapping_success"]=true
        navigator.clipboard.writeText(JSON.stringify(json, null, 2))
            .then(() => {
                console.log("JSON copied to clipboard");
                // Optional: you can still have reload if needed
                // window.location.reload();
            })
            .catch(err => console.error("Failed to copy:", err));
        alert(JSON.stringify(json, null, 2));

    } catch (err) {
        json["scrapping_success"]=false
        json["ipni_verified"]=true
        json["multiple_authors"]=false
        navigator.clipboard.writeText(JSON.stringify(json, null, 2))
            .then(() => {
                console.log("JSON copied to clipboard");
            })
            .catch(err => console.error("Failed to copy:", err));
        alert(JSON.stringify(json, null, 2));

    } finally {

        // Hide loading
        loading.style.display = "none";
        button.disabled = false;
        button.textContent = "Scrape";
    }
});