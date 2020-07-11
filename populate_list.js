new_list  = document.getElementById("languages");
var language_names
var options = new XMLHttpRequest();
options.open("GET", "./language_info/languages_datalist.json");
options.overrideMimeType("application/json");
options.send(null);
options.onreadystatechange = function(){
    if (options.readyState == 4 && options.status == 200){
        data_list = JSON.parse(options.response);
        //console.log("data_list loaded")
        for(key in data_list){
            var new_option = document.createElement('option');
            new_option.value = key;
            new_list.appendChild(new_option);
            
        }
    }
}
