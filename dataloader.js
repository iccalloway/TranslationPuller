 //Load ISO Codes
    var req = new XMLHttpRequest();
    req.open("GET", "./ISO-Two-to-Three.json");
    req.overrideMimeType("application/json");
    req.send(null);
    
    two_codes = req.response