# GooglePlacesAggregator
A tool that minimizes API costs for getting the coordinates of all places returned from Google Places API for a user defined region, adhering to Google Places TOS.

To use this tool:
1) Search or manually locate a location of interest on the map.
2) Select the specific areas of interests using the polygon drawing feature.
3) Select the Google Places Search Category from the category dropdown list.  NOTE: Google only allows one category to be searched at a time.
4) Switch the tool from "Test Mode" and enter your API key.  The API key used will not be sent to the server or saved by the tool.  All API calls are made from the client directly, with only results being passed to the server for processing.
5) Set a max budget.  If no budget is set, then each new search must be manually triggered by the user by clicking the "Next Search" button.
6) If you wish to export your results, use the "Download Data" option.


IMPORTANT NOTES:
results are saved on the server for no longer than 25 days to comply with google TOS.
