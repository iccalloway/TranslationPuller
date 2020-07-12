/**
    Made by Ian Calloway
*/
 
 //Load ISO Codes
var two_codes
var two_codes_loaded = false
var code_req = new XMLHttpRequest();
code_req.open("GET", "./language_info/ISO-Two-to-Three.json");
code_req.overrideMimeType("application/json");
code_req.send(null);
code_req.onreadystatechange = function(){
    if (code_req.readyState == 4 && code_req.status == 200){
        two_codes = JSON.parse(code_req.response);
        two_codes_loaded = true;
    }
}

var three_codes
var three_codes_loaded = false
var three_req = new XMLHttpRequest();
three_req.open("GET", "./language_info/ISO-Three-to-Two.json");
three_req.overrideMimeType("application/json");
three_req.send(null);
three_req.onreadystatechange = function(){
    if (three_req.readyState == 4 && three_req.status == 200){
        three_codes = JSON.parse(three_req.response);
        three_codes_loaded = true;
    }
}

var language_names
var language_names_loaded = false
var req = new XMLHttpRequest();
req.open("GET", "./language_info/full_languages.json");
req.overrideMimeType("application/json");
req.send(null);
req.onreadystatechange = function(){
    if (req.readyState == 4 && req.status == 200){
        language_names = JSON.parse(req.response);
        language_names_loaded = true;
    }
}

function allow_continue(){
	if (language_names_loaded == true && three_codes_loaded == true && two_codes_loaded == true){
        $('#loading').hide();
        $('#button').show();
	} else {
		setTimeout(allow_continue, 1000);
        $('#button').hide();
		return;
	}
}

function main(){
    answerbegin.innerHTML = ''
    var input = document.getElementById("word").value;
    if (input == ""){
        $("<p>Nothing chosen.<p>").appendTo(answerbegin);
        return(1);
    }
    choice = document.getElementById("language").value;
    if (choice != ""){
        if (data_list[choice] == undefined){
            var toLanguage = undefined;
        } else {
            var toLanguage = data_list[choice];
        }
    } else {
        var toLanguage = "";
    }
    //var fromLanguage = document.getElementById("fromLanguage").value;
    var fromLanguage = 'eng';
    //SPARQL Query
    word_search = "<http://kaiko.getalp.org/dbnary/"+fromLanguage+"/"+input.replace(/ /g,"_")+">"

    var query=
        'PREFIX dbnary: <http://kaiko.getalp.org/dbnary#> \n ' +
        'PREFIX lang: <http://kaiko.getalp.org/dbnary/eng> \n ' +
        'PREFIX lexinfo: <http://www.lexinfo.net/ontology/2.0/lexinfo#> \n ' +
        'PREFIX lexvo: <http://www.lexvo.org/id/iso639-3/> \n ' +
        'PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \n' +
        'PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#> \n' +
        'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \n' +
        
        'SELECT DISTINCT ?pos, ?sensenum, ?written, ?lang, ?def WHERE { \n ' +
            word_search + ' dbnary:describes ?word . \n ' +
            '?word lexinfo:partOfSpeech ?pos ; \n ' +
            'ontolex:sense ?sense . \n ' +
            '?trans dbnary:isTranslationOf ?sense ; \n ' +
            'dbnary:writtenForm ?written ; \n ' +
            'dbnary:targetLanguage ?lang . \n ' +
            '?sense skos:definition ?definition ; \n ' +
            'dbnary:senseNumber ?sensenum . \n ' +
            '?definition rdf:value ?def . \n ' +
    '}';
        
    var website = "http://kaiko.getalp.org/sparql?default-graph-uri=&query=";
    var extraParameters = "&format=json&timeout=0&debug=on";
    queryToSend = encodeURI(website+query+extraParameters).replace(/#/g, "%23");
    var xhttp = new XMLHttpRequest();
    var d = new Date();

    var translationList = []
    $.ajax({
        dataType: "jsonp",  
        url: queryToSend,
        success: function( _data ) {
            var results = _data.results.bindings;
            found_entries = results.length;
            
            test_object = {}
            selected_count = 0;
            answerbegin.innerHTML = ''            
            if (found_entries > 0) {
                if (selected_count == 1){
                    $entry_number = $("<p>1 translation found across all languages.</p><br>");
                } else {
                    $entry_number = $("<p>"+found_entries+" translations found across all languages.</p>");
                }
                $entry_number.appendTo(answerbegin);
                var languageCheck = (toLanguage== "") ? true : toLanguage;
                for ( var i in results ) {
                    if(results[i].written != undefined && 
                    results[i].sensenum != undefined && 
                    results[i].written['xml:lang'] != undefined && 
                    results[i].def != undefined && 
                    results[i].sensenum.value != undefined && 
                    results[i].written.value != undefined && 
                    results[i].def.value != undefined && 
                    (languageCheck == true  || languageCheck == results[i].written['xml:lang'])){
                        two = results[i].written['xml:lang'];
                        language_name = "";
                        if (three_codes[fromLanguage] != undefined){
                            if (three_codes[fromLanguage].two_letter != ""){
                                var from_language_two = three_codes[fromLanguage].two_letter;
                                if (language_names[two] != undefined && language_names[two][from_language_two] != undefined){
                                    language_name = language_names[two][from_language_two];
                                }
                            }
                        }
                        if (language_name == "" && two_codes[two] != undefined){
                            language_name = two_codes[two].name;
                        } else if (language_name == "") {
                            language_name = two;
                        }
                        var last_item =[language_name,
                        results[i].pos.value.replace("http://www.lexinfo.net/ontology/2.0/lexinfo#", "").replace(/-/g,""),
                        results[i].def.value,
                        //results[i].sense.value.replace(/, ''.*/g,"").replace(/[\[\]]/g, ""),
                        //results[i].sense.value.replace(/.*ws_([0-9]).*/,'$1'),
                        results[i].written.value.replace(/[\[\]]/g, "")];
                        
                        if (test_object[last_item[0]] == undefined){
                            test_object[last_item[0]] = {};
                        } if (test_object[last_item[0]][last_item[1]] == undefined){
                            test_object[last_item[0]][last_item[1]] = {};
                        } if (test_object[last_item[0]][last_item[1]][last_item[2]] == undefined){
                            test_object[last_item[0]][last_item[1]][last_item[2]] = [];
                        } if (!(last_item[3] in test_object[last_item[0]][last_item[1]][last_item[2]])){
                            test_object[last_item[0]][last_item[1]][last_item[2]].push(last_item[3]);
                            selected_count += 1;
                        }
                    }
                }
                             
                if (selected_count == 0){
                    $("<p>No unique entries selected.</p>").appendTo(answerbegin);
                    return 1;
                } else if (selected_count == 1){
                    $entry_number = $("<p>1 unique translation selected.</p><br>");
                } else {
                    $entry_number = $("<p>"+selected_count+" unique translations selected.</p>");
                }
                $entry_number.appendTo(answerbegin);
                sortedList = translationList.sort(function(a,b)
                {
                    if(a[0].localeCompare(b[0])==0){
                        if (a[1].localeCompare(b[1])==0){
                            return a[2].localeCompare(b[2]);
                        }
                            return a[1].localeCompare(b[1]);
                    }
                    return a[0].localeCompare(b[0]);
                });
                download_value = "<a download=\""+input.replace(/[|&;$%@"<>()+,\\\/]/g, "_")+"-translation.csv\" href=\"#\" onclick=\"return ExcellentExport.csv(this, 'translationtable');\"><i><small>Export results to CSV</small></i></a><br>";
                var $table = $( "<table id='translationtable' style='table-layout: fixed; width: 80%' class='tablesorter'></table>");
                var $header = $("<thead><tr><th>Language <!--<br><small><i>(Falls back on English)</i></small>--></th><th>Part of Speech</th><th>Sense</th><th>Word</th></tr></thead>");
                var $bodier = $("<tbody></tbody>");

                language_keys = Object.keys(test_object).sort()
                for (var i in language_keys){
                    pos_keys = Object.keys(test_object[language_keys[i]]).sort()
                    for (var j in pos_keys){
                        sense_keys = Object.keys(test_object[language_keys[i]][pos_keys[j]]).sort()
                        for (var k in sense_keys){
                            var $line = $("<tr></tr>");
                            $line.append($("<td style='word-wrap: break-word'></td>").html(language_keys[i]));
                            $line.append($("<td style='word-wrap: break-word'></td>").html(pos_keys[j]));
                            $line.append($("<td style='word-wrap: break-word'></td>").html(sense_keys[k]));
                            $line.append($("<td style='word-wrap: break-word'></td>").html(test_object[language_keys[i]][pos_keys[j]][sense_keys[k]].sort().join(" | ")));
                            $bodier.append( $line );
                        }
                    } 
                }
                $(download_value).appendTo(answerbegin);
                $table.append($header);
                $table.append($bodier);
                $table.appendTo(answerbegin);
                $(document).ready(function() { 
                    $("#translationtable").tablesorter(); 
                });
                return 0;
            
            } else {
                $("<p>No entries found.</p>").appendTo(answerbegin);
                return 1;
            }
        },
        error: function (){
            answerbegin.innerHTML = '';
            $("<p>Error performing search.</p>").appendTo(answerbegin);
            return 2;
        }
    });
}
allow_continue();
