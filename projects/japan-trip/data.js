const itineraryData = {
  "flights": [
    {
      "type": "Departure",
      "date": "2026-05-16",
      "flight": "ZG029",
      "from": "SJC",
      "to": "NRT",
      "depTime": "11:40",
      "arrTime": "14:50 (+1)"
    },
    {
      "type": "Return",
      "date": "2026-06-01",
      "flight": "ZG030",
      "from": "NRT",
      "to": "SJC",
      "depTime": "16:25",
      "arrTime": "09:40"
    }
  ],
  "itinerary": [
    {
      "phase": 0,
      "title": "The Narita Landing",
      "location": "Narita Omotesando",
      "dates": "May 17 - May 18",
      "nights": 1,
      "description": "Immediate rest after an 11-hour flight. Omotesando offers a traditional feel right next to the airport.",
      "toddlerTip": "Naritasan Park is huge and perfect for stretching little legs after a long flight.",
      "accommodations": [
        { "name": "Wakamatsu Honten", "coords": [35.7742, 140.3186], "type": "Ryokan" }
      ],
      "activities": [
        { "name": "Naritasan Park", "coords": [35.7770, 140.3220], "reason": "Massive park with koi ponds, ideal for toddlers to burn off energy.", "image": "images/naritasan_park_koi_fish.jpg" },
        { "name": "Narita Omotesando", "coords": [35.7730, 140.3140], "reason": "Traditional street with fun snacks like 'unagi-pan' and fresh gelato.", "image": "images/narita_omotesando_traditional_street_shops.jpg" },
        { "name": "Kuriyama Park", "coords": [35.7706, 140.3217], "reason": "Features a mini steam locomotive that kids can see up close.", "image": "images/kuriyama_park_narita_mini_steam_locomotive.jpg" }
      ],
      "dailyPlan": [
        "Day 1: Arrival & Omotesando Walk",
        "Day 2: Naritasan Park & Kuriyama Park"
      ]
    },
    {
      "phase": 1,
      "title": "The Big City Start",
      "location": "Shinjuku/Shibuya, Tokyo",
      "dates": "May 18 - May 23",
      "nights": 5,
      "description": "Stay at the iconic Park Hyatt Tokyo. Use the hotel's complimentary shuttle to Shinjuku Station for easy access to the city and your transit to Hakone.",
      "toddlerTip": "The hotel shuttle saves a 15-minute walk with a stroller. Shinjuku Gyoen is perfect for morning runs to burn off jet lag.",
      "accommodations": [
        { "name": "Park Hyatt Tokyo", "coords": [35.6853, 139.6912], "type": "Hotel" }
      ],
      "dayTrips": [
        {
          "title": "Shibuya & Parks",
          "mode": "Walk/Train",
          "details": [
            "Walk to Meiji Jingu/Yoyogi Park: ~20-25 mins (pleasant walk through Nishi-Shinjuku).",
            "Yoyogi Park to Playground Shibuya Kids: ~15 min walk or 1 stop on JR Yamanote (Harajuku to Shibuya)."
          ]
        },
        {
          "title": "Local Shinjuku",
          "mode": "Walk/Shuttle",
          "details": [
            "Walk to Shinjuku Gyoen: ~30-35 mins (or shuttle to station + 10 min walk).",
            "Fire Museum: 10 min walk from Shinjuku Gyoen (Okido Gate) or Marunouchi Line to Yotsuya-sanchome."
          ]
        },
        {
          "title": "Tokyo Dome City",
          "mode": "Subway",
          "details": [
            "Transit to Asobōno!: Shuttle to Shinjuku St. → JR Chuo-Sobu Line to Suidobashi (30-35 mins total).",
            "Explore: Tokyo Dome City and Koishikawa Korakuen are adjacent to Asobōno!."
          ]
        },
        {
          "title": "Imperial Palace",
          "mode": "Subway",
          "details": [
            "Transit to Tokyo Station: Shuttle to Shinjuku St. → JR Chuo Line Rapid (30 mins total).",
            "Boats: Take Toei Shinjuku Line to Kudanshita Station (8 mins) for the Chidorigafuchi moat boat rentals."
          ]
        }
      ],
      "activities": [
        { "name": "Shinjuku Gyoen", "coords": [35.6852, 139.7101], "reason": "Massive green space perfect for toddlers to run around and burn off energy.", "image": "images/shinjuku_gyoen_lush_green_summer.jpg" },
        { "name": "Asobōno!", "coords": [35.7061, 139.7523], "reason": "The ultimate indoor playground with ball pits and climbing structures.", "image": "images/asobōno.jpg" },
        { "name": "teamLab Borderless", "coords": [35.6626, 139.7401], "reason": "Immersive digital art at Azabudai Hills. Features the Forest of Resonating Lamps.", "image": "images/teamlab_borderless_forest_of_resonating_lamps.jpg" },
        { "name": "Robot Park", "coords": [35.6596, 139.7291], "reason": "Outdoor slides and robot-themed equipment in Roppongi Hills.", "image": "images/robot_park_roppongi_hills_outdoor_robot_slides.jpg" },
        { "name": "Tokyo Disneyland", "coords": [35.6328, 139.8806], "reason": "The happiest place on earth, with toddler-friendly rides and magical parades.", "image": "images/tokyo_disneyland.jpg" },
        { "name": "Playground Shibuya Kids", "coords": [35.6591, 139.7037], "reason": "Clean, reservation-only indoor play area in the heart of Shibuya.", "image": "images/playground_shibuya_kids.jpg" },
        { "name": "Yoyogi Park", "coords": [35.6717, 139.6949], "reason": "Spacious park near Meiji Shrine, ideal for toddlers to run on expansive lawns.", "image": "images/yoyogi_park.jpg" },
        { "name": "Meiji Jingu", "coords": [35.6764, 139.6993], "reason": "Serene forest shrine with wide gravel paths, perfect for a peaceful morning walk.", "image": "images/meiji_jingu_forest_walk.jpg" },
        { "name": "Tokyo Toy Museum", "coords": [35.6885, 139.7183], "reason": "Tactile play area with wooden toys in a renovated school building.", "image": "images/tokyo_toy_museum.jpg" },
        { "name": "Fire Museum", "coords": [35.6865, 139.7195], "reason": "Sit in real fire trucks and helicopters. A hands-on delight for toddlers.", "image": "images/fire_museum_tokyo.jpg" },
        { "name": "Koishikawa Korakuen", "coords": [35.7042, 139.7494], "reason": "Beautiful traditional garden adjacent to Tokyo Dome City.", "image": "images/koishikawa_korakuen_autumn_garden.jpg" },
        { "name": "Imperial Palace Boats", "coords": [35.6905, 139.7490], "reason": "Rent a rowboat and enjoy the serene Chidorigafuchi moat.", "image": "images/chidorigafuchi_moat_boat_rentals.jpg" }
      ],
      "dailyPlan": [
        "Day 2: Arrival & Evening at Shinjuku Gyoen",
        "Day 3: Asobōno! & Koishikawa Korakuen (Subway)",
        "Day 4: teamLab Borderless & Robot Park",
        "Day 5: Tokyo Disneyland",
        "Day 6: Shibuya Walk, Yoyogi Park & Meiji Jingu",
        "Day 7: Toy & Fire Museums → Transit to Hakone"
      ]
    },
    {
      "phase": 2,
      "title": "The Mountain Retreat",
      "location": "Hakone (Lake Ashi & Gora)",
      "dates": "May 23 - May 27",
      "nights": 4,
      "description": "A split-stay adventure! First, relax by the serene Lake Ashi for 2 nights, then move up to the Gora area for 2 nights to explore the world-class museums and parks.",
      "toddlerTip": "Use the 'Hakone Carrying Service' at Hakone-Yumoto station to send your bags to your hotel so you can explore hands-free immediately.",
      "accommodations": [
        { "name": "Lake Ashi: The Prince Hakone", "coords": [35.2070, 139.0060], "type": "Hotel" },
        { "name": "Gora: Hakone Kowakien Ten-yu", "coords": [35.2390, 139.0430], "type": "Ryokan" }
      ],
      "dayTrips": [
        {
          "title": "Day 7: Shinjuku to Lake Ashi",
          "mode": "Romancecar + Bus",
          "details": [
            "Odakyu Romancecar from Shinjuku (85 mins).",
            "Drop bags at 'Carrying Service' at Hakone-Yumoto station (¥800-1000/bag).",
            "Take Toozan Bus (Line H or R) to Moto-Hakone/Lake Ashi area (40 mins).",
            "Afternoon check-in at your lakeside hotel."
          ]
        },
        {
          "title": "Day 8: Pirate Ships & Animals",
          "mode": "Boat & Walk",
          "details": [
            "Ride the Pirate Ship (Hakone Sightseeing Cruise) from Motohakone-ko to Togendai-ko.",
            "Visit Dakkoshite! Zoo at Hakone-en—petting alpacas and ponies is a toddler favorite.",
            "Stroll through Onshi-Hakone Park (barrier-free paved paths with Mt. Fuji views).",
            "Photo op at the floating 'Torii of Peace' at Hakone Shrine."
          ]
        },
        {
          "title": "Day 9: The Great Transfer",
          "mode": "Ropeway & Cable Car",
          "details": [
            "Check out from Lake Ashi hotel.",
            "Take the Hakone Ropeway from Togendai to Owakudani (volcanic vents & black eggs).",
            "Continue on the Ropeway down to Sounzan, then the Cable Car down to Gora.",
            "Check into your Gora-area hotel and enjoy a relaxing onsen evening."
          ]
        },
        {
          "title": "Day 10: Gora's Best",
          "mode": "Cable Car / Walk",
          "details": [
            "Explore the Hakone Open-Air Museum (dedicated 'Net Forest' and 'Zig Zag World' play areas).",
            "Visit Gora Park to see the massive central fountain.",
            "Casual dinner at the kid-welcoming Gyoza Center (Cash only!)."
          ]
        }
      ],
      "activities": [
        { "name": "Pirate Ship Cruise", "coords": [35.2016, 139.0205], "reason": "A themed boat ride across Lake Ashi that kids will love.", "image": "images/hakone_pirate_ship_lake_ashi.jpg" },
        { "name": "Onshi-Hakone Park", "coords": [35.1950, 139.0250], "reason": "Wide, stroller-friendly paths with spectacular views of Mt. Fuji.", "image": "images/onshi-hakone_park_view_of_mt_fuji.jpg" },
        { "name": "Hakone Shrine", "coords": [35.1888, 139.0261], "reason": "The famous red torii gate in the water.", "image": "images/hakone_shrine_torii_gate_in_water.jpg" },
        { "name": "Dakkoshite! Zoo", "coords": [35.2060, 139.0060], "reason": "A petting zoo specifically designed for small children at Hakone-en.", "image": "images/dakkoshite_zoo_hakone-en_petting_zoo.jpg" },
        { "name": "Hakone Ropeway", "coords": [35.2440, 139.0100], "reason": "Gondola ride to the volcanic Owakudani valley.", "image": "images/hakone_ropeway.jpg" },
        { "name": "Owakudani (Black Eggs)", "coords": [35.2435, 139.0194], "reason": "Explore volcanic activity and eat eggs cooked in the hot springs.", "image": "images/owakudani.jpg" },
        { "name": "NINJABUS", "coords": [35.2040, 139.0220], "reason": "Amphibious bus tour with an exciting splash into the lake.", "image": "images/ninjabus_hakone_amphibious_bus.jpg" },
        { "name": "Hakone Open-Air Museum", "coords": [35.2447, 139.0514], "reason": "Features the 'Net Forest' and 'Zig Zag World' play areas.", "image": "images/hakone_open-air_museum.jpg" },
        { "name": "Gora Park", "coords": [35.2480, 139.0460], "reason": "Beautiful gardens with a large central fountain and greenhouses.", "image": "images/hakone_gora_park_fountain.jpg" }
      ],
      "dailyPlan": [
        "Day 7: Arrival at Lake Ashi (Luggage Service)",
        "Day 8: Pirate Ship, Park & Shrine",
        "Day 9: Ropeway to Owakudani & Move to Gora",
        "Day 10: Open-Air Museum & Gora Park"
      ]
    },
    {
      "phase": 3,
      "title": "The Coastal Break",
      "location": "Atami",
      "dates": "May 27 - May 30",
      "nights": 3,
      "description": "Short hop from Hakone. Focus on relaxation and resort facilities.",
      "toddlerTip": "RISONARE Atami is 'toddler heaven' with ball pools and climbing walls.",
      "accommodations": [
        { "name": "Hoshino Resorts RISONARE Atami", "coords": [35.0955, 139.0605], "type": "Resort" }
      ],
      "activities": [
        { "name": "Marine Spa Atami", "coords": [35.0908, 139.0791], "reason": "All-season water park with pools and slides overlooking the ocean.", "image": "images/marine_spa_atami.jpg" },
        { "name": "Acao Forest", "coords": [35.0715, 139.0785], "reason": "Beautiful gardens with a high-up swing and ocean views.", "image": "images/acao_forest.jpg" },
        { "name": "Kinomiya Shrine", "coords": [35.1001, 139.0671], "reason": "Home to a 2,000-year-old camphor tree with a cozy cafe.", "image": "images/kinomiya_shrine_atami.jpg" }
      ],
      "dailyPlan": [
        "Day 11: Arrival & Tree House Forest",
        "Day 12: Marine Spa Atami",
        "Day 13: Acao Forest & Kinomiya Shrine"
      ]
    },
    {
      "phase": 4,
      "title": "The Waterfront Finale",
      "location": "Odaiba, Tokyo",
      "dates": "May 30 - Jun 1",
      "nights": 2,
      "description": "Odaiba is essentially a giant, pedestrian-friendly 'mall island.'",
      "toddlerTip": "Legoland Discovery Center and waterfront park views of Rainbow Bridge.",
      "accommodations": [
        { "name": "Hilton Tokyo Odaiba", "coords": [35.6268, 139.7711], "type": "Hotel" }
      ],
      "activities": [
        { "name": "Legoland Discovery Center", "coords": [35.6267, 139.7758], "reason": "Indoor Lego-themed attraction perfect for younger kids.", "image": "images/legoland_discovery_center_tokyo.jpg" },
        { "name": "teamLab Planets", "coords": [35.6491, 139.7895], "reason": "Sensory art experience. Features the Floating Flower Garden.", "image": "images/teamlab_planets_floating_flower_garden.jpg" },
        { "name": "Toyosu Park", "coords": [35.6545, 139.7942], "reason": "Expansive park with a water play area, perfect for cooling off after teamLab.", "image": "images/toyosu_park.jpg" },
        { "name": "Odaiba Waterfront Park", "coords": [35.6295, 139.7750], "reason": "Beach-side park with views of the Rainbow Bridge and Statue of Liberty.", "image": "images/odaiba_waterfront_park.jpg" }
      ],
      "dailyPlan": [
        "Day 14: Transit to Odaiba",
        "Day 15: Legoland & teamLab Planets",
        "Day 16: Departure (Limousine Bus to NRT)"
      ]
    }
  ],
  "transit": [
    { 
      "id": 0,
      "from": "NRT", 
      "to": "Narita Omotesando", 
      "mode": "Taxi/Train", 
      "time": "15m", 
      "costJPY": 1500,
      "recommendation": "Taxi",
      "options": ["Taxi (¥1,500)", "JR Train (¥200)"]
    },
    { 
      "id": 1,
      "from": "Narita Omotesando", 
      "to": "Shinjuku", 
      "mode": "JR Train", 
      "time": "80m", 
      "costJPY": 1500,
      "recommendation": "JR Narita Line",
      "options": ["JR Narita Line (¥1,170)", "Keisei Skyliner + Subway (¥2,800)"]
    },
    { 
      "id": 2,
      "from": "Shinjuku", 
      "to": "Hakone", 
      "mode": "3-Day Free Pass + Romancecar", 
      "time": "85m", 
      "costJPY": 7700,
      "recommendation": "Odakyu Romancecar",
      "options": ["3-Day Free Pass (¥6,500)", "Romancecar Surcharge (¥1,200)"]
    },
    { 
      "id": 3,
      "from": "Hakone", 
      "to": "Atami", 
      "mode": "Local Train/Bus", 
      "time": "60m", 
      "costJPY": 1000,
      "recommendation": "Bus via Odawara",
      "options": ["Bus (¥1,000)", "Taxi (¥8,000)"]
    },
    { 
      "id": 4,
      "from": "Atami", 
      "to": "Odaiba", 
      "mode": "Shinkansen + Local", 
      "time": "90m", 
      "costJPY": 4100,
      "recommendation": "Shinkansen to Shinagawa",
      "options": ["Shinkansen (¥4,100)", "Local JR (¥1,900)"]
    },
    { 
      "id": 5,
      "from": "Odaiba", 
      "to": "NRT", 
      "mode": "Limousine Bus", 
      "time": "80m", 
      "costJPY": 3200,
      "recommendation": "Airport Limousine Bus",
      "options": ["Limousine Bus (¥3,200)", "Narita Express (¥3,500)"]
    }
  ]
};
