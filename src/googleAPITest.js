import * as turf from '@turf/turf'


let t = [
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.334282,
                "lng": -71.6825878
            },
            "viewport": {
                "south": 42.3328534697085,
                "west": -71.6840040302915,
                "north": 42.3355514302915,
                "east": -71.68130606970848
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
        "name": "Walk’in the Dog",
        "place_id": "ChIJKXp_QPz344kRkP_w1tozntk",
        "plus_code": {
            "compound_code": "88M8+PX Northborough, MA, USA",
            "global_code": "87JC88M8+PX"
        },
        "rating": 5,
        "reference": "ChIJKXp_QPz344kRkP_w1tozntk",
        "scope": "GOOGLE",
        "types": [
            "meal_takeaway",
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 1,
        "vicinity": "489 Church Street, Northborough",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.3382348,
                "lng": -71.7209589
            },
            "viewport": {
                "south": 42.33256615000001,
                "west": -71.72292553029149,
                "north": 42.34012435,
                "east": -71.72022756970848
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
        "name": "Cyprian's Restaraunt",
        "opening_hours": {
            "open_now": true
        },
        "photos": [
            {
                "height": 607,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/116530636756034607120\">Cyprian&#39;s Restaraunt</a>"
                ],
                "width": 809
            }
        ],
        "place_id": "ChIJ5xONXrb344kRmW-uvwHKvBQ",
        "plus_code": {
            "compound_code": "87QH+7J Boylston, MA, USA",
            "global_code": "87JC87QH+7J"
        },
        "reference": "ChIJ5xONXrb344kRmW-uvwHKvBQ",
        "scope": "GOOGLE",
        "types": [
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "vicinity": "284 East Temple Street, Boylston",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.3296861,
                "lng": -71.724318
            },
            "viewport": {
                "south": 42.3284180197085,
                "west": -71.7256078802915,
                "north": 42.3311159802915,
                "east": -71.7229099197085
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
        "name": "Dragon 88 Restaurant",
        "opening_hours": {
            "open_now": true
        },
        "photos": [
            {
                "height": 3456,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/107777030356374902357\">Christian Lanciaux</a>"
                ],
                "width": 4608
            }
        ],
        "place_id": "ChIJqTEULrj344kRkdDnND3l69M",
        "plus_code": {
            "compound_code": "87HG+V7 Boylston, MA, USA",
            "global_code": "87JC87HG+V7"
        },
        "price_level": 2,
        "rating": 4.2,
        "reference": "ChIJqTEULrj344kRkdDnND3l69M",
        "scope": "GOOGLE",
        "types": [
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 335,
        "vicinity": "260 Shrewsbury Street, Boylston",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.3290138,
                "lng": -71.72405239999999
            },
            "viewport": {
                "south": 42.32781736970851,
                "west": -71.7254923302915,
                "north": 42.3305153302915,
                "east": -71.72279436970848
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/cafe-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/cafe_pinlet",
        "name": "Dunkin'",
        "opening_hours": {
            "open_now": true
        },
        "photos": [
            {
                "height": 4032,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/116808360568690371892\">Amit Jagdale</a>"
                ],
                "width": 3024
            }
        ],
        "place_id": "ChIJZTK_KLj344kR4yXjxaPYR34",
        "plus_code": {
            "compound_code": "87HG+J9 Boylston, MA, USA",
            "global_code": "87JC87HG+J9"
        },
        "price_level": 1,
        "rating": 3.8,
        "reference": "ChIJZTK_KLj344kR4yXjxaPYR34",
        "scope": "GOOGLE",
        "types": [
            "meal_takeaway",
            "cafe",
            "bakery",
            "store",
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 146,
        "vicinity": "Gulf Gas Station, 270 Shrewsbury Street #140, Boylston",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.3617972,
                "lng": -71.7266917
            },
            "viewport": {
                "south": 42.3605006197085,
                "west": -71.72819293029151,
                "north": 42.3631985802915,
                "east": -71.7254949697085
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
        "name": "Farmer and the Fork",
        "opening_hours": {
            "open_now": false
        },
        "photos": [
            {
                "height": 4032,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/114823164797318307247\">Farmer and the Fork</a>"
                ],
                "width": 3024
            }
        ],
        "place_id": "ChIJaw-7hxr344kRcQcf5PCzimE",
        "plus_code": {
            "compound_code": "976F+P8 Boylston, MA, USA",
            "global_code": "87JC976F+P8"
        },
        "rating": 3.9,
        "reference": "ChIJaw-7hxr344kRcQcf5PCzimE",
        "scope": "GOOGLE",
        "types": [
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 40,
        "vicinity": "11 French Drive, Boylston",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.3538534,
                "lng": -71.734224
            },
            "viewport": {
                "south": 42.3525238697085,
                "west": -71.73566798029151,
                "north": 42.3552218302915,
                "east": -71.7329700197085
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
        "name": "Boylston Deli Cafe & Catering",
        "opening_hours": {
            "open_now": true
        },
        "photos": [
            {
                "height": 2988,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/114562287751020005569\">Hannah Aron</a>"
                ],
                "width": 5312
            }
        ],
        "place_id": "ChIJmXpdtAv344kRZicsgNGXKQQ",
        "plus_code": {
            "compound_code": "9738+G8 Boylston, MA, USA",
            "global_code": "87JC9738+G8"
        },
        "rating": 4.7,
        "reference": "ChIJmXpdtAv344kRZicsgNGXKQQ",
        "scope": "GOOGLE",
        "types": [
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 91,
        "vicinity": "700 Main Street, Boylston",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.35560449999999,
                "lng": -71.733598
            },
            "viewport": {
                "south": 42.3542555197085,
                "west": -71.73494698029151,
                "north": 42.35695348029149,
                "east": -71.7322490197085
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
        "name": "Atrevete a Probar Chocoplosh",
        "photos": [
            {
                "height": 1440,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/112719297774525750658\">Tony McNair</a>"
                ],
                "width": 4000
            }
        ],
        "place_id": "ChIJpwdU4BP344kR0SJUsTp9DtU",
        "plus_code": {
            "compound_code": "9748+6H Boylston, MA, USA",
            "global_code": "87JC9748+6H"
        },
        "rating": 5,
        "reference": "ChIJpwdU4BP344kR0SJUsTp9DtU",
        "scope": "GOOGLE",
        "types": [
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 1,
        "vicinity": "Main Street, Boylston",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.33452700000001,
                "lng": -71.737931
            },
            "viewport": {
                "south": 42.3329773197085,
                "west": -71.73909548029151,
                "north": 42.3356752802915,
                "east": -71.73639751970849
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
        "name": "Boylston House of Pizza",
        "opening_hours": {
            "open_now": true
        },
        "photos": [
            {
                "height": 1080,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/115648576773954035030\">Matt Nachtrieb</a>"
                ],
                "width": 1920
            }
        ],
        "place_id": "ChIJE7tC4L_344kRNCZRYaZsQ_4",
        "plus_code": {
            "compound_code": "87M6+RR Boylston, MA, USA",
            "global_code": "87JC87M6+RR"
        },
        "price_level": 2,
        "rating": 4.2,
        "reference": "ChIJE7tC4L_344kRNCZRYaZsQ_4",
        "scope": "GOOGLE",
        "types": [
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 114,
        "vicinity": "81 Shrewsbury Street, Boylston",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.3344389,
                "lng": -71.7387639
            },
            "viewport": {
                "south": 42.3329532697085,
                "west": -71.7400834302915,
                "north": 42.3356512302915,
                "east": -71.7373854697085
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
        "name": "The Other Place Pub",
        "opening_hours": {
            "open_now": true
        },
        "photos": [
            {
                "height": 1944,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/107645377469707453470\">John Bomba</a>"
                ],
                "width": 2592
            }
        ],
        "place_id": "ChIJnZfIYJX344kRVBbK8U2tCxs",
        "plus_code": {
            "compound_code": "87M6+QF Boylston, MA, USA",
            "global_code": "87JC87M6+QF"
        },
        "price_level": 1,
        "rating": 4.3,
        "reference": "ChIJnZfIYJX344kRVBbK8U2tCxs",
        "scope": "GOOGLE",
        "types": [
            "bar",
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 440,
        "vicinity": "71 Shrewsbury Street, Boylston",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.3348207,
                "lng": -71.7403336
            },
            "viewport": {
                "south": 42.3332932697085,
                "west": -71.74175623029151,
                "north": 42.3359912302915,
                "east": -71.7390582697085
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
        "name": "Chefee's 1921 Diner",
        "opening_hours": {
            "open_now": false
        },
        "photos": [
            {
                "height": 3024,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/109234274102910387274\">Dave Bianchi Mello</a>"
                ],
                "width": 4032
            }
        ],
        "place_id": "ChIJVV7YPZX344kRuY7pnfA4b_c",
        "plus_code": {
            "compound_code": "87M5+WV Boylston, MA, USA",
            "global_code": "87JC87M5+WV"
        },
        "price_level": 1,
        "rating": 4.6,
        "reference": "ChIJVV7YPZX344kRuY7pnfA4b_c",
        "scope": "GOOGLE",
        "types": [
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 236,
        "vicinity": "59 Shrewsbury Street, Boylston",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.3354598,
                "lng": -71.7461659
            },
            "viewport": {
                "south": 42.3340908697085,
                "west": -71.7474181802915,
                "north": 42.3367888302915,
                "east": -71.7447202197085
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
        "name": "Christo",
        "opening_hours": {
            "open_now": true
        },
        "place_id": "ChIJt2djRd_344kRSgBQgYk5Lz4",
        "plus_code": {
            "compound_code": "87P3+5G Boylston, MA, USA",
            "global_code": "87JC87P3+5G"
        },
        "rating": 5,
        "reference": "ChIJt2djRd_344kRSgBQgYk5Lz4",
        "scope": "GOOGLE",
        "types": [
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 1,
        "vicinity": "7 Shrewsbury Street, Boylston",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.3014833,
                "lng": -71.68297679999999
            },
            "viewport": {
                "south": 42.3003510197085,
                "west": -71.6846569302915,
                "north": 42.3030489802915,
                "east": -71.68195896970848
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png",
        "icon_background_color": "#7B9EB0",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
        "name": "Ski Ward Ski Area",
        "photos": [
            {
                "height": 2269,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/104701420637018809715\">Ski Ward Ski Area</a>"
                ],
                "width": 4032
            }
        ],
        "place_id": "ChIJ5bIUkuIJ5IkRP4E8nFFli1Y",
        "plus_code": {
            "compound_code": "8828+HR Shrewsbury, MA, USA",
            "global_code": "87JC8828+HR"
        },
        "rating": 4.2,
        "reference": "ChIJ5bIUkuIJ5IkRP4E8nFFli1Y",
        "scope": "GOOGLE",
        "types": [
            "tourist_attraction",
            "bar",
            "store",
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 523,
        "vicinity": "1000 Main Street, Shrewsbury",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.3014898,
                "lng": -71.6828512
            },
            "viewport": {
                "south": 42.3003791697085,
                "west": -71.6845643802915,
                "north": 42.3030771302915,
                "east": -71.6818664197085
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
        "name": "Slopeside Bar & Grill",
        "opening_hours": {
            "open_now": true
        },
        "photos": [
            {
                "height": 3000,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/107701672606353714545\">Dinora Hernandez</a>"
                ],
                "width": 4000
            }
        ],
        "place_id": "ChIJjVgu9OIJ5IkRt4JCM1sbiQ8",
        "plus_code": {
            "compound_code": "8828+HV Shrewsbury, MA, USA",
            "global_code": "87JC8828+HV"
        },
        "rating": 4.5,
        "reference": "ChIJjVgu9OIJ5IkRt4JCM1sbiQ8",
        "scope": "GOOGLE",
        "types": [
            "restaurant",
            "bar",
            "store",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 24,
        "vicinity": "1000 Main Street, Shrewsbury",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.3199018,
                "lng": -71.6472143
            },
            "viewport": {
                "south": 42.3184447697085,
                "west": -71.64842898029151,
                "north": 42.3211427302915,
                "east": -71.64573101970849
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/cafe-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/cafe_pinlet",
        "name": "Dunkin'",
        "opening_hours": {
            "open_now": true
        },
        "photos": [
            {
                "height": 800,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/117749784089021237624\">Dunkin&#39;</a>"
                ],
                "width": 1143
            }
        ],
        "place_id": "ChIJVXX7r8H144kRF6VUeRTwFpk",
        "plus_code": {
            "compound_code": "8993+X4 Northborough, MA, USA",
            "global_code": "87JC8993+X4"
        },
        "price_level": 1,
        "rating": 4.2,
        "reference": "ChIJVXX7r8H144kRF6VUeRTwFpk",
        "scope": "GOOGLE",
        "types": [
            "meal_takeaway",
            "cafe",
            "bakery",
            "store",
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 162,
        "vicinity": "70 West Main Street, Northborough",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.3193722,
                "lng": -71.6475667
            },
            "viewport": {
                "south": 42.3180755697085,
                "west": -71.64911868029151,
                "north": 42.3207735302915,
                "east": -71.6464207197085
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
        "name": "Hillside Grille",
        "opening_hours": {
            "open_now": true
        },
        "photos": [
            {
                "height": 3024,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/105446334654082061732\">Neal Howland</a>"
                ],
                "width": 4032
            }
        ],
        "place_id": "ChIJ4yISuMH144kRN5AnoqDAgws",
        "plus_code": {
            "compound_code": "8992+PX Northborough, MA, USA",
            "global_code": "87JC8992+PX"
        },
        "price_level": 1,
        "rating": 4.7,
        "reference": "ChIJ4yISuMH144kRN5AnoqDAgws",
        "scope": "GOOGLE",
        "types": [
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 337,
        "vicinity": "73 West Main Street, Northborough",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.3049087,
                "lng": -71.6671829
            },
            "viewport": {
                "south": 42.3037935197085,
                "west": -71.6686284302915,
                "north": 42.3064914802915,
                "east": -71.6659304697085
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
        "name": "A.J. Tomaiolo's Restaurant",
        "opening_hours": {
            "open_now": false
        },
        "photos": [
            {
                "height": 3080,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/107283236325090597164\">A.J. Tomaiolo&#39;s Restaurant</a>"
                ],
                "width": 5472
            }
        ],
        "place_id": "ChIJOxTdeAD244kRgSc7rGoPjFk",
        "plus_code": {
            "compound_code": "883M+X4 Northborough, MA, USA",
            "global_code": "87JC883M+X4"
        },
        "price_level": 2,
        "rating": 4.5,
        "reference": "ChIJOxTdeAD244kRgSc7rGoPjFk",
        "scope": "GOOGLE",
        "types": [
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 159,
        "vicinity": "411 West Main Street, Northborough",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.30523099999999,
                "lng": -71.66584
            },
            "viewport": {
                "south": 42.3039462197085,
                "west": -71.66716303029152,
                "north": 42.3066441802915,
                "east": -71.6644650697085
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
        "name": "Yama Zakura",
        "opening_hours": {
            "open_now": false
        },
        "photos": [
            {
                "height": 2160,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/114250210746866466842\">Mike O&#39;Farrell</a>"
                ],
                "width": 3840
            }
        ],
        "place_id": "ChIJfXHvRv7144kRTO9i8_HukQU",
        "plus_code": {
            "compound_code": "884M+3M Northborough, MA, USA",
            "global_code": "87JC884M+3M"
        },
        "price_level": 2,
        "rating": 4.6,
        "reference": "ChIJfXHvRv7144kRTO9i8_HukQU",
        "scope": "GOOGLE",
        "types": [
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 466,
        "vicinity": "369 West Main Street #3, Northborough",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.30515909999999,
                "lng": -71.6655139
            },
            "viewport": {
                "south": 42.3038698197085,
                "west": -71.6668406302915,
                "north": 42.3065677802915,
                "east": -71.6641426697085
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
        "name": "Monti's Pizza Plus",
        "opening_hours": {
            "open_now": true
        },
        "photos": [
            {
                "height": 368,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/110713742217216001003\">Monti&#39;s Pizza Plus</a>"
                ],
                "width": 655
            }
        ],
        "place_id": "ChIJfXHvRv7144kReTYS5OqiVBs",
        "plus_code": {
            "compound_code": "884M+3Q Northborough, MA, USA",
            "global_code": "87JC884M+3Q"
        },
        "rating": 4.6,
        "reference": "ChIJfXHvRv7144kReTYS5OqiVBs",
        "scope": "GOOGLE",
        "types": [
            "meal_takeaway",
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 122,
        "vicinity": "369 West Main Street, Northborough",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.305024,
                "lng": -71.6654026
            },
            "viewport": {
                "south": 42.3037892697085,
                "west": -71.6667332802915,
                "north": 42.3064872302915,
                "east": -71.66403531970849
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
        "name": "The Cellar Bar & Grille",
        "opening_hours": {
            "open_now": false
        },
        "photos": [
            {
                "height": 782,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/111403743854562442258\">The Cellar Bar &amp; Grille</a>"
                ],
                "width": 1170
            }
        ],
        "place_id": "ChIJ01HIpFL144kRrcYktzUF-1s",
        "plus_code": {
            "compound_code": "884M+2R Northborough, MA, USA",
            "global_code": "87JC884M+2R"
        },
        "rating": 4.4,
        "reference": "ChIJ01HIpFL144kRrcYktzUF-1s",
        "scope": "GOOGLE",
        "types": [
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 30,
        "vicinity": "369 West Main Street #8, Northborough",
        "html_attributions": []
    },
    {
        "business_status": "OPERATIONAL",
        "geometry": {
            "location": {
                "lat": 42.3208367,
                "lng": -71.6439743
            },
            "viewport": {
                "south": 42.3194504697085,
                "west": -71.6452763302915,
                "north": 42.3221484302915,
                "east": -71.64257836970849
            }
        },
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
        "icon_background_color": "#FF9E67",
        "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
        "name": "Special Teas",
        "opening_hours": {
            "open_now": true
        },
        "photos": [
            {
                "height": 1080,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/103529059789071160088\">john fraize</a>"
                ],
                "width": 1920
            }
        ],
        "place_id": "ChIJ_a7RnsD144kR9rEBkim_3js",
        "plus_code": {
            "compound_code": "89C4+8C Northborough, MA, USA",
            "global_code": "87JC89C4+8C"
        },
        "price_level": 2,
        "rating": 4.8,
        "reference": "ChIJ_a7RnsD144kR9rEBkim_3js",
        "scope": "GOOGLE",
        "types": [
            "cafe",
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "user_ratings_total": 89,
        "vicinity": "10 Church Street STE 4, Northborough",
        "html_attributions": []
    }
]

let nextCenter ={current: [
    -71.69906747945178,
    42.345661896399214
]}

let lat = t[0].geometry.location.lat
let lon = t[0].geometry.location.lng
let lastLat = t[t.length-1].geometry.location.lat
let lastLon = t[t.length-1].geometry.location.lng

console.log(nextCenter.current)
console.log(typeof(nextCenter.current))
console.log(typeof(lastLon))
console.log("lat", lat)
console.log("lon", lon)
console.log("-------")
console.log("lat", lastLat)
console.log("lon", lastLon)
console.log("")

let calcedRadius1 = Math.hypot(t[0].geometry.location.lat-nextCenter.current[1], t[0].geometry.location.lng-nextCenter.current[0])
let calcedRadius2 = Math.hypot(t[t.length-1].geometry.location.lat-nextCenter.current[1], t[t.length-1].geometry.location.lng-nextCenter.current[0])

var from = turf.point(nextCenter.current);
var to = turf.point([lastLon, lastLat]);
var options = {units: 'miles'};
var distance = turf.distance(from, to, options);

console.log(calcedRadius1)
console.log(calcedRadius2)
console.log(distance)
