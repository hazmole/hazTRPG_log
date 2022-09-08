class TrpgParser{
	constructor(){
		this.regList = {
			"getFileName": new RegExp(/(.*)\.\w+$/),
			"htmlBody": new RegExp(/<body>(.*)<\/body>/, 's'),
			"ccfFotmat": new RegExp(/style="color:#[\w\d]+;"/),
			"ddfFotmat": new RegExp(/color='#[\w\d]+'/),
		};
		this.rawData = null;
		this.mode = '';
		
		this.filename = '';
		this.userMap = {};
		this.script = null;

		this.isLoaded = false;
	}

	ParseData(filename, data){
		var mode = this.checkMode(data);
		if(mode === "unknown"){
			throw 'Unknown file format';
		}

		this.rawData = data;
		this.mode = mode;
		this.userMap = {};
		this.script = [];
		this.filename = filename.match(this.regList["getFileName"])[1];

		switch(mode){
			case "ARP": this.parseFormat_ARP(); break;
			case "CCF": this.parseFormat_CCF(); break;
			case "DDF": this.parseFormat_DDF(); break;
		}

		this.isLoaded = true;
	}

	GetTitle(){ return this.filename; }
	GetActorList(){
		var retList = {};
		for(var actor of Object.values(this.userMap)){
			retList[actor.id] = actor;
		}
		return retList;
	}
	GetScript(){
		return this.script;
	}

	//=================
	checkMode(data){
		var self = this;

		if(isJSON(data)){
			if(isARP(data)) return "ARP";
		} else if(isHTML(data)){
			if(isCCF(data)) return "CCF";
			if(isDDF(data)) return "DDF";
		} 
		return "unknown";

		//==================
		function isJSON(data){
			try{ JSON.parse(data) }
			catch(e){ return false; }
			return true;
		}
		function isARP(data){
			var jsonObj = JSON.parse(data);
			return jsonObj.version.includes("hazmole");
		}
		function isHTML(data){
			var matchResult = data.match(self.regList["htmlBody"]);
	    return (matchResult!=null);
		}
		function isCCF(data){
	    var matchResult = data.match(self.regList["ccfFotmat"]);
	    return (matchResult!=null);
		}
		function isDDF(data){
	    var matchResult = data.match(self.regList["ddfFotmat"]);
	    return (matchResult!=null);
		}	
	}

	//==================
	registerUser(userName, color){
		var userMapCount = Object.keys(this.userMap).length;
		if(!this.userMap[userName]){
			this.userMap[userName] = new Actor(userMapCount, userName, color, "");
			return userMapCount;
		}
		return this.userMap[userName].id;
	}
	//==================
	parseFormat_ARP(){
		var jsonObj = JSON.parse(this.rawData);

		this.filename = jsonObj.config.title;

		for(var actor of jsonObj.config.actors){
			this.userMap[actor.id] = new Actor(actor.id, actor.name, actor.color, actor.imgUrl);
		}

		for(var scriptObj of jsonObj.script){
			this.script.push(new ScirptLine(scriptObj.type, scriptObj));
		}
	}

	parseFormat_DDF(){
		var self = this;
		var body = this.rawData.match(this.regList["htmlBody"])[1];
		var sectionphArr = body.split("<\/font>")
			.map( sect => sect.trim() )
			.map( sect => parseSection(sect) )
			.filter( sect => sect!=null );
		this.script = sectionphArr;
		
		//==============
		function parseSection(data){
			if(!data) return null;

			try{
				var color = data.match(/color='#(.*)'/)[1];
				var user = data.match(/<b>(.*?)<\/b>/)[1];
				var id = self.registerUser(user, color);

				var content = data.match(/<\/b>：(.*)/s)[1];
				var line = new ScirptLine("talk", {
					actorId: id,
					content: content
				});
				return line;
			} catch(e) {
				//console.error(e);
				return null;
			}
		}
	}
	parseFormat_CCF(){
		var self = this;
		var body = this.rawData.match(this.regList["htmlBody"])[1];
		var sectionphArr = body.split("<\/p>")
			.map( sect => sect.trim() )
			.map( sect => parseSection(sect) )
			.filter( sect => sect!=null );
		this.script = sectionphArr;

		//==============
		function parseSection(data){
			if(!data) return null;
			var arr = data.match(/<span>(.*?)<\/span>/gs)
				.filter( d => d!=null )
				.map( d => d.match(/<span>(.*)<\/span>/s)[1] )
				.map( d => d.trim() );

			var color = data.match(/color:#(.*);/)[1];
			var user = arr[1];
			var id = self.registerUser(user, color);

			var content = arr[2];

			var line = new ScirptLine("talk", {
				actorId: id,
				content: content
			});
			return line;
		}
	}
}


class Actor {
	constructor(id, name, colorCode, imgUrl){
		this.id = id;
		this.name = name;
		this.color = colorCode;
		this.imgUrl = imgUrl;
	}
}
class ScirptLine {
	constructor(type, info){
		this.type = type;
		if(info){
			this.setFields(info);
		}
	}
	setFields(info){
		switch(this.type){
			case "talk":
				this.actorId = info.actorId;
				this.content = info.content;
				break;
			case "changeBg":
				this.bgUrl = info.bgUrl;
				break;
			case "halt":
				break;
		}
	}

}
