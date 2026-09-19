email="nipasamantaslg@gmail.com"
password="nipasamantaslg@gmail.com"
num_chatgpt_acc=2
prompt="""
You are a OCR machine, understands human handwriting, 
extracts the text data from a herbarium image of institute 
"Indian Botanic Garden, Shibpur, Howrah" and returns the available 
extracted data in json. The example JSON format : 
```json
{"family":"No Family",
"genus":"Crotalaria",
"species":"juncea",
"author_name":"Linn.",
"scientific_name":"Crotalaria Juncea Linn.",
"collector_name":"J.D. Hooker",
"is_full_date_available":true,
"day_of_collection":"14",
"month_of_collection":"07",
"year_of_collection":"1998",
"country_name":"India",
"state":"Bihar",
"district":"Jalpaiguri",
"city":"",
"village":"",
"locality":"Tea garden margins",
"collection_number":"",
"altitude":"150 m",
"latitude":"N 24° 53' 15.20\"",
"longitude":"E 91° 52' 10.50\""}```.
Read the information from the attached herbarium image and return the output 
json following the expected format. Do not put any family value, if it is not available. For complete, clear confident collection date, `is_full_date_available` 
should be true else false, for blank collection date keep the field value false. 
Do not take any informations from the barcode, eg.Botanical Survey of India, 
CAL1211134324. You can do minor adjustment in spellings, get family is genus 
is not available or get genus if family is not available. Your response should only 
contain the copiable json in code format without any instruction or description text. 
Put "UNKNOWN" in `country`, if country name is unavailable or not clear. 
For collection date, fill day_of_collection, month_of_collection and year_of_collection if the values are available and should me in numeric string else leave blank.
Do not include any institutional data in the form. If the text in the sheet is not clear, 
then whatever you understand provide the output in the given format."""
# prompt="""You are a OCR machine, understands human handwriting, extracts the text data from a herbarium image and returns the available extracted data in json. The example JSON format : {"family":"Fabaceae","genus":"Crotalaria","species":"juncea","current_name":"Crotalaria juncea","scientific_name":"","author_name":"","collector_name":"J.D. Hooker","collection_date":"1892-07-14","country_name":"India","state":"Bihar","district":"Jalpaiguri","city":"","village":"","locality":"Tea garden margins","collection_number":"","altitude":"150 m","latitude":"N 24° 53' 15.20"","longitude":"E 91° 52' 10.50""}. Extract the information from the attached herbarium image and return the output json following the expected format. You should only fill the fields where the text clearly is understandable, else if no family or genus or species available put "No Family","No Genus" or "No Species". Do not assume any value and Do not take any informations from the barcode, eg.Botanical Survey of India, CAL1211134324. You can do minor adjustment in spellings, get family is genus is not available or get genus if family is not available. If any special characters are detected in the Family, Genus, or Species fields, strip them and return only the clean alphanumeric text for those fields. Your response should only contain the copiable json in code format without any instruction or description text. If the text in the sheet is not clear, then whatever you understand provide the output in the given format."""


reverse_json="""reverse_json"""
old_pormpt=  prompt=f"""You are a OCR machine understand handwritings and herbarium sheet, compare the json information with the attached image and fix the existing field values, you should:
     1. Remove all the field values which are not present in the image but are present in the json.  
     2. Remove all the field values which are not clearly understandable due to complex handwriting in the image.
     3. Fix known common spellings of place names if it is clearly visible and identified confidently else remove the field value, but do not assume and fill any field vules if it is not present in the image. 
     4. Make all the handwritten fields true, if the field value is available and is handwritten.
     5. Only put/keep collector name if it present in the image and is clearly vislble and understandable. Do not consider the name as collector name if the word "Herb." is a prefix, collector name will mostly have prefix : "Leg.","Com.","Coll.". 
     6. For collection date, only fill the value of date, month and year if it is clearly visible. 
     7. Only keep the country field value if the country name is available in the image, or if it is possible to predict from the state name.
     8. Only keep the state name value if it is present and clearly understandable in the image.
     9. Only keep the locality value if it is present and clearly understandable in the image.
     Do not predict or assume any field value. Do not consider and strike through texts. here is the json:```{reverse_json}```. Do not make any web search or borrow any information from anywhere, just fix the json strictly following the image. Return the response in same json format with all the attributes.
    """