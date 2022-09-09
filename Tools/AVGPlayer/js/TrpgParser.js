class TrpgParser{
	constructor(){
		this.regList = {
			"getFileName": new RegExp(/(.*)\.\w+$/),
			"htmlBody": new RegExp(/<body>(.*)<\/body>/, 's'),
			"ccfFotmat": new RegExp(/<p style="color:#([\w\d]{6});">.*?<span> \[(.*?)\].*?<span>(.*?)<\/span>.*?<span>(.*?)<\/span>/, 'smg'),
			"ddfFotmat": new RegExp(/(^\[(.*?)\])?<font color='#([\w\d]{6})'><b>(.*?)<\/b>：(.*?)<\/font>/, 'smg'),
		};
		this.rawData = null;
		this.mode = '';
		
		this.filename = '';
		this.generalCfg = {};
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

		this.generalCfg = {
			isOnlyMainCh: false,
		};
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
	GetGeneralCfg(){
		return this.generalCfg;
	}
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
		this.generalCfg.isOnlyMainCh = !!(jsonObj.config?.isOnlyMainCh);

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

		var sectionphArr = body.match(this.regList['ddfFotmat'])
			.map( sect => sect.trim() )
			.map( sect => parseSection(sect) )
			.filter( sect => sect!=null );
		this.script = sectionphArr;
		
		//==============
		function parseSection(data){
			if(!data) return null;

			var matchMap = [...data.matchAll(self.regList['ddfFotmat'])][0];
			var channel = matchMap[2];
			var color = matchMap[3];
			var user = matchMap[4];
			var content = matchMap[5];

			var id = self.registerUser(user, color);
			var line = new ScirptLine("talk", {
				channel: isMainChannel(channel)? "main": "other",
				actorId: id,
				content: content.trim()
			});
			return line;
		}
		function isMainChannel(ch){
			if(!ch) return true;
			if(ch=="主要" || ch=="メイン") return true;
			return false;
		}
	}
	parseFormat_CCF(){
		var self = this;
		var body = this.rawData.match(this.regList["htmlBody"])[1];

		var sectionphArr = body.match(this.regList['ccfFotmat'])
			.map( sect => sect.trim() )
			.map( sect => parseSection(sect) )
			.filter( sect => sect!=null );
		this.script = sectionphArr;

		//==============
		function parseSection(data){
			if(!data) return null;

			var matchMap = [...data.matchAll(self.regList['ccfFotmat'])][0];
			var channel = matchMap[2];
			var color = matchMap[1];
			var user = matchMap[3];
			var content = matchMap[4];

			var id = self.registerUser(user, color);
			var line = new ScirptLine("talk", {
				channel: isMainChannel(channel)? "main": "other",
				actorId: id,
				content: content.trim()
			});
			return line;
		}
		function isMainChannel(ch){
			if(!ch) return true;
			if(ch=="主頻道" || ch=="メイン" || ch=="Main") return true;
			return false;
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
				this.channel = info.channel;
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
