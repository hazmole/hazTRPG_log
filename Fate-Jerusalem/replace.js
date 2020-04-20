const fs = require('fs');

if(process.argv.length < 3){
	console.error("filename needed.");
	return ;
}

var name = "Jerusalem_part";

//for(var i=1; i<25; i++){
	var filename = process.argv[2];
	//var i = process.argv[2];

	//var filename = name + (parseInt(i)<10? "0": "") + i + ".html";
	console.log(filename);

	fs.readFile(filename, function (err, data) {
	    if (err) throw err;
	 
	    var regArr = [
	    	["https://cdn.discordapp.com/avatars/137776984909545472/1d6941d4cc01198345ac06bdd5b65e4f.png", "./src/01.png"],
	   		["https://cdn.discordapp.com/avatars/137776984909545472/5c6bda486935b15405b9a899101cb07f.png", "./src/01.png"], // haz頭像
	   		["https://cdn.discordapp.com/avatars/249145925921013760/00d88f05e7f8b859a3bda4b85053c409.png", "./src/02.png"], // 乙名頭像
	   		["https://cdn.discordapp.com/avatars/248759644674195456/4e2f50645195ff07e5258c6c91e4bca6.png", "./src/03.png"], // 紫紫頭像

	   		["    </style>", "span[data-user-id=\"249145925921013760\"] { color: #3498db; }\n    </style>"], // 紫紫上色
	   		["    </style>", "span[data-user-id=\"248759644674195456\"] { color: #9b59b6; }\n    </style>"], // 乙名上色

	   		["hazmole</span>", "GM@Hazmole</span>"], // Haz名稱

	   		[/<span class="chatlog__edited-timestamp" title="([^"]+)">\(edited\)<\/span>/, ""], //除去edited
		];


	    var html = data.toString();
	    for(var i in regArr){
			var regexp = new RegExp(regArr[i][0], "g");

			html = html.replace(regexp, regArr[i][1]);
		}
	    fs.writeFileSync(filename, html, "utf8");
	});

//}