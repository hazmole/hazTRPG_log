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
		this.rawData = data;
		this.mode = this.checkMode();

		switch(this.mode){
			case "unknown":
				throw 'Unknown file format';
			case "CCF":
				this.parseFormat_CCF();
		}

		this.filename = filename.match(this.regList["getFileName"])[1];
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

/*
	Export(){
		var title = document.getElementById("_input_title").value;

		var jsonFile = {};
		jsonFile.config = {
			title: title,
			defaultBg: "",
			actors: [],
		};
		jsonFile.script = [];

		// append Actors
		for(var actor of Object.values(this.userMap)){
			jsonFile.config.actors.push(actor);
		}
		// append Script
		for(var line of this.script){
			jsonFile.script.push(line);
		}

		download(JSON.stringify(jsonFile))
	}
	//=================
	setUserMapColor(actorId, color){
		var actor = Object.values(this.userMap).find( user => user.id==actorId );
		this.userMap[actor.name].color = color;
		this.renderColor();
	}
*/
	//=================
	checkMode(){
		var self = this;
		var result = this.rawData.match(this.regList["htmlBody"]);

		if(result==null){
			return 'Text';
		} else if(isCCF(this.rawData)){
			return 'CCF';
		} else if(isDDF(this.rawData)){
			return 'DDF';
		} else {
			return 'unknown';
		}
		return this.mode;

		//==================
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
			var content = arr[2];

			var id = self.registerUser(user, color);

			var line = new ScirptLine("talk");
			line.setTalkType(id, content);
			return line;
		}
	}

	/*
	//=========
	buildUserList(rootId){
		$(`#${rootId}`).empty();
		
		var userArr = Object.values(this.userMap);
		for(var user of userArr){
			appendUserElem(user)
		}

		//====================
		function appendUserElem(userObj){
			var template = 
`<div class="UserEntry" id="_user_${userObj.id}">
	<div class="UserEntryInner">
		<div class="_user_img" title="人物頭像" onclick="toggleImgUrl(this)"></div>
		<div class="_user_color">
			<input type="color" value="#${userObj.color}">
		</div>
		<div class="_user_name">${userObj.name}</div>
	</div>
	<div class="_user_img_url">
		<div style="display: flex;">
			<div class="label">URL</div>
			<div class="field"><input type="text" onchange="setCharImg(this)"></div>
		</div>
	</div>
</div>`;
			$(`#${rootId}`).append(template);
		}
	}
	buildScript(rootId){
		$(`#${rootId}`).empty();

		for(var line of this.script){
			var template = 
`<div class="_scriptLine actor_${line.actorId}">
	<div class="user">${this.getActorName(line.actorId)}</div>
	<div class="content">${line.content}</div>
</div>`;
			$(`#${rootId}`).append(template);
		}
		this.renderColor();
	}

	getActorName(id){
		var actor = Object.values(this.userMap).find( user => user.id==id );
		return (actor==null)? 'unknown': actor.name;
	}
	renderColor(){
		for(var actor of Object.values(this.userMap)){
			$(`.actor_${actor.id} .user`).css('color', `#${actor.color}`);
		}
	}
	*/

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
	constructor(type){
		this.type = type;
		this.actorId = null;
		this.content = null;
	}
	setTalkType(actorId, content){
		this.actorId = actorId;
		this.content = content;
	}
}

/*function toggleImgUrl(elem){
	$(elem).parent().siblings().toggle(500);
}
function setCharImg(elem){
	var url = $(elem).val();

	var imgElem = $(elem).parent().parent().parent().siblings().find("._user_img");
	imgElem.css("background-image", `url(${url})`);

	var elemId = $(elem).parent().parent().parent().parent().attr('id');
	var actorId = elemId.match(/_user_(\d+)/)[1];

}
*/