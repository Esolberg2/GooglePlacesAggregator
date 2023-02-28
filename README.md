# Getting Started
A working demo of this project can also be viewed at http://35.209.231.120:3000/

This repo includes both the ReactJS frontedn and Flask api needed to run this tool.  

To setup this project once cloned, the root of this project contains the file setup.py which will automate the following steps:
- creation of a python3 virtual environment
- pip install dependencies within virtual environment
- prompt user for environment variables and create relevant .env files
- Allow user to install package.json dependencies via yarn or npm.

Alternatively, you can run the following terminal commands in order to run the project locally on localhost:3000 via the included docker-compose.yml file:
docker-compose pull
docker-compose up



# About
This project was designed to help individuals quickly interact with Google Places API data for research purposes.  Because the Google Places API is predominately used for one off, isolated requests for map data within small areas, it is very difficult to use this tool to survey large geographic areas.  Doing so requires a means of organizing API calls such that a comprehensive search of the region is accomplished (nothing left unsearched), which also minimizing the occurrence of duplicate searches of the same area - as this only serves to increase costs.

The project accomplishes the above by using the K Nearest Neighbors Algorithm to choose a coordinate within the desired search region, which is furthest from both the edges of the search region, as well as all other coordinates within the region that have already been searched.  The reason for this is that we do not know how large of an area the results from a Google Places API 'Nearby Search' request will cover until after the call is places.  This means that overlapping searches are best prevented by picking an unsearched coordinate that has the longest distance to its nearest neighbor.

With each search, the KNN algorithm is updated to include the area that was searched due to the latest Google Places API call, allowing the process to repeat until all available coordinates within a search region have been covered.

In order to use this tool with live google data, you will need your own Google Places API key that has access to Google Maps and the Google Places Javascript API.  

This took does not store any Google Data, or your Google API key.  The UI conducts all data transfer with the Google API directly from your browser, and the application backend operates strictly on summary derived data to determine which areas within your search region have and have not yet been searched.

