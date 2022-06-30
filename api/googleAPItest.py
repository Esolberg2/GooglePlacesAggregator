import requests


# umass memorial hospital lat 	42.42688
# lon -71.69274

# 1.2 miles
# lat = '42.354149'
# lon = '-71.200089'


# # 2.3 miles
# lat = '42.350182'
# lon = '-71.217430'

# 2.7 miles
# lat = '42.349360'
# lon = '-71.229810'

# # 3 miles
# lat = '42.34595'
# lon = '	-71.23307'

# 3.5 miles
# lat = '42.343130'
# lon = '-71.241660'

# 4 miles
# lat = '42.331402'
# lon = '-71.246063'


# ----- apple
# 3.5 miles to hospital
# searchType = 'amusement_park'
# lat = '42.38173974479801'
# lon = '-71.55406700045606'
# # url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=42.34514578419426%2C-71.3548041975686&radius=50000&type=library&key=AIzaSyBhJRgpD2FTMa8_q68645LQRb2qNVD6wlE"
# url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={0}%2C{1}&radius=50000&type={2}&key=AIzaSyBhJRgpD2FTMa8_q68645LQRb2qNVD6wlE'.format(lat,lon, searchType)
#
# payload={}
# headers = {}
#
# response = requests.request("GET", url, headers=headers, data=payload)
#
# print(response.text)
# results = response.json()["results"]
# for place in results:
    # print(place["name"])




# # fields=formatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry%2type%2vicinity
# # fields=formatted_address%2Cname%2Crating%2type%2Cgeometry
# # url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Museum%20of%20Contemporary%20Art%20Australia&inputtype=textquery&fields=type%2Cformatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry&key=AIzaSyBhJRgpD2FTMa8_q68645LQRb2qNVD6wlE"

url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=boundless%20adventure%20zipline&inputtype=textquery&fields=formatted_address%2Cname%2Crating%2Ctype%2Cgeometry&key=AIzaSyBhJRgpD2FTMa8_q68645LQRb2qNVD6wlE"

payload={}
headers = {}

response = requests.request("GET", url, headers=headers, data=payload)

print(response.text)
