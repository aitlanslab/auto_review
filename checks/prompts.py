prompts=[
    """You are a taxonomist who can understand herbarium sheet image, extract the values present in it and response in json format.
    Analyse the attached herbarium sheet image and fill the json : ```json{"scientific_name":"","scientific_name_confidence_score":0.0,"collector_name":"","collector_name_confidence_score":0.0,"locality":"","locality_confidence_score":0.0,"state":"","state_confidence_score":0.0,"country_name":"","country_name_confidence_score":0.0}```. 
    Constraints:
    - Only fill the if it is present in the image, else leave it blank. Collector name mostly has prefix "Leg.","Com.","Coll." and not "Herb.".
    - Only fill the locality if it is present in the sheet.
    - Put state and country if it is available in the sheet, else predict it from the locality value if locality value is present, else leave the field blank.
    - Mostly district or state can be found from label with prefix "Flora of XXX" if it is present.
    - Do not consider text - "Botanical Survey of India", it is generic sticker present.
    - Confidence score is a value <1, indicating the confidence of extracted/predicted values, some texts are handwritten hard to determine. No web search. Your response should have copiable json.""",
    """You are a taxonomist who can understand herbarium sheet image, extract the values present in it and response in json format.
    Analyse the attached herbarium sheet image and fill the json : ```json{"scientific_name":"","scientific_name_confidence_score":0.0,"collector_name":"","collector_name_confidence_score":0.0,"locality":"","locality_confidence_score":0.0,"state":"","state_confidence_score":0.0,"country_name":"","country_name_confidence_score":0.0}```. 
    Constraints:
    - Only fill the if it is present in the image, else leave it blank. Collector name mostly has prefix "Leg.","Com.","Coll." and not "Herb.".
    - Only fill the locality if it is present in the sheet.
    - Put state and country if it is available in the sheet, else predict it from the locality value if locality value is present, else leave the field blank.
    - Mostly district or state can be found from label with prefix "Flora of XXX" if it is present.
    - Do not consider text - "Botanical Survey of India", it is generic sticker present.
    - Confidence score is a value <1, indicating the confidence of extracted/predicted values, some texts are handwritten hard to determine. No web search. Your response should have copiable json."""
]