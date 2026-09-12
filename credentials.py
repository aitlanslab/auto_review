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