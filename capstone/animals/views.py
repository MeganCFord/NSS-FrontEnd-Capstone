from django.http import HttpResponse, JsonResponse
from django.views import generic
from django.conf.urls.static import static
from requests import *
import json
import datetime


class IndexView(generic.TemplateView):
  # Main index.html.
  template_name = 'animals/index.html'


def EOLforId(request, taxa_name):
  '''
  Get Encyclopedia of life ID match given a taxa scientific name. 
  Separated from modal info call in case there is no match.

  Method argument: string scientific taxa name.
  '''

  taxa_id = 0
  try:
    r = get('http://eol.org/api/search/1.0.json?q='+ taxa_name + '&page=1&exact=true&filter_by_taxon_concept_id=&filter_by_hierarchy_entry_id=&filter_by_string=&cache_ttl=&key=1ded9f1eb184c38df6511aef3ba552a11b96e4c9')
    r = r.json()
  except requests.exceptions.RequestException:
    return taxa_id
  finally: 
    pass

  if r["results"] is not None:
    taxa_id = r["results"][0]["id"]

  return HttpResponse(taxa_id)


def EOLforModalInfo(request, taxa_id):
  '''
  Get and parse Encyclopedia of Life info for a given taxa ID.
  Check all photos returned.
  Used to populate species cards and modals- this is a lot of info.

  Method Argument: EOL taxa ID obtained from EOLforId.
  '''
  info = {"textStuff": [], "links": [], "pictures": [], "commonName": "", "scientificName": ""}

  try:
    r = get('http://eol.org/api/pages/1.0.json?batch=false&id=' + taxa_id + '&images_per_page=10&images_page=1&videos_per_page=0&videos_page=0&sounds_per_page=0&sounds_page=0&maps_per_page=0&maps_page=0&texts_per_page=2&texts_page=1&iucn=false&subjects=overview&licenses=all&details=true&common_names=true&synonyms=true&references=false&taxonomy=false&vetted=0&cache_ttl=&language=en&key=1ded9f1eb184c38df6511aef3ba552a11b96e4c9')
    r = r.json()
  except requests.exceptions.RequestException:
    return JsonResponse(info)
  finally:
    pass

  # Assign scientific name.
  info["scientificName"] = r["scientificName"]
  # Assign common name based on EOL english preferred option.
  for name in r["vernacularNames"]:
    if name["language"] == "en":
      try:
        if name["eol_preferred"] == True:
          info["commonName"] = name["vernacularName"]
      except:
        pass

  for data in r["dataObjects"]:
    # Add image data to 'pictures'. TODO: concurrency-this.
    try:    
      if data["mimeType"] == "image/jpeg":
        p = get(data["mediaURL"])
        if p.status_code == 200:
          info["pictures"].append(data["mediaURL"])
      else: 
        # Add source links.
        info["links"].append(data["source"])
  
        # Add text data to 'textStuff'.
        if data["mimeType"] == "text/plain":
          info["textStuff"].append(data["description"])
        elif data["mimeType"] == "text/html":
          info["textStuff"].append(data["description"])
    except:
      pass

  return JsonResponse(info) 


def loadTaxaObject(taxa_name):
  '''
  Creates/populates a 'current taxa' object with lists of subtaxa and supertaxa, given a scientific name. 
  Mimics structure of Catalog of life database object.
  Checks Firebase database first, but if info is missing, this function gets it from the Catalog of Life API 
  and 'put's it into Firebase as an automigration.

  Method Argument: string scientific taxa name.
  '''
  taxa = {"childtaxa": [], "supertaxa": [], "rank": "", "name": taxa_name, "question": ""}
  # Get firebase data on selected taxa.
  try:
    f = get("https://animal-identification.firebaseio.com/specialData/" + taxa_name + "/.json")
    f = f.json()
  except:
    f = {}
  finally:
    pass

  try:
    taxa["question"] = f["question"]
  except: 
    taxa["question"] = ""
  finally:
    pass

  try:
    taxa["rank"] = f["rank"]
  except:
    pass
  finally:
    pass

  try: 
    taxa["childtaxa"] = f["childtaxa"]
    print(f["childtaxa"])
  except: 
    # if the COL data hasn't already been added to the taxa in Firebase, get it from COL.
    try:
      r = get("http://www.catalogueoflife.org/col/webservice?name=" + taxa_name + "&format=json&response=full")
      r=r.json()
      r = r["results"][0]
    except:
      r= {}
    finally:
      pass

    try:
      taxa["rank"] = r["rank"]
    except:
      taxa["rank"] = ""
    finally:
      pass

    try:
      for child in r["child_taxa"]:
        to_add = {"name": child["name"]}
        taxa["childtaxa"].append(to_add)
    except:
      pass
    finally:
      pass

  finally:
    pass

  try: 
    taxa["supertaxa"] = f["supertaxa"]
  except:
    try:
      r = get("http://www.catalogueoflife.org/col/webservice?name=" + taxa_name + "&format=json&response=full")
      r=r.json()
      r = r["results"][0]
    except:
      r={}
    finally:
      pass
    try:
      for parent in r["classification"]:
        to_add = {"name": parent["name"]}
        taxa["supertaxa"].append(to_add)
    except:
      pass
    finally:
      pass
  finally:
    pass

  # patch the taxa object back to firebase. 
  putter = put("https://animal-identification.firebaseio.com/specialData/" + taxa_name + "/.json", json=taxa) 
  return taxa

def loadTree(response, taxa_name):
  '''
  Loads a 'current taxa' object with the names, questions, and firebase status of all subtaxa and supertaxa, via loadTaxaObject function. Once migration is complete, I will combine this with loadTaxaObject.

  Method Argument: string scientific name of taxa.
  '''
  taxa = loadTaxaObject(taxa_name)

  # Get the 'question' data for each subtaxa and supertaxa.
  for child in taxa["childtaxa"]:
    c = get("https://animal-identification.firebaseio.com/specialData/" + child["name"] + "/.json")
    c = c.json()
    try:
      child["question"] = c["question"]
    except: 
      child["question"] = ""
    finally:
      pass

  for parent in taxa["supertaxa"]:
    p = get("https://animal-identification.firebaseio.com/specialData/" + parent["name"] + "/.json")
    p = p.json()
    try: 
      parent["question"] = p["question"]
    except:
      child["question"] = ""
    finally:
      pass

  return JsonResponse(taxa)    

def publishAnimal(response, taxa_name):
  '''
  Publishes user image to firebase database 'feed' table with current datetime and identified object. 
  Noted that this app only has one database url for a user image so if multiple people use it at once, the image upload will get super messed up. 
  On V2 to-do list to add users or sessioning/saving in django database.

  Method Argument: String scientific name of taxa.
  '''
  userInfo = get("https://animal-identification.firebaseio.com/currentUserObject.json")
  userInfo = userInfo.json()

  thenow = datetime.datetime.now()
  thenow = thenow.__str__()
  print(thenow)

  feedObj = {"name": taxa_name, "picture": userInfo["url"], "date": thenow}

  p = post("https://animal-identification.firebaseio.com/feed/.json", json = feedObj)

  return HttpResponse("/")
