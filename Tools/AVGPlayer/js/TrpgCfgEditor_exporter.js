var VERSION = "hazmole_v1.0";

class CfgExporter {
	constructor(){}

	Export(mode, cfgData){
		switch(mode){
			case "ARP": return this._exportArpFile(cfgData);
			case "HTML": return this._exportHtmlFile(cfgData);
		}
	}

	_exportArpFile(cfgData){
		var filename = `${cfgData.generalCfg.title}.arp`;
		var filedata = {
				version: VERSION,
				config: {
					title: cfgData.generalCfg.title,
					actors: Object.values(cfgData.actorCfg),
				},
				script: cfgData.scriptCfg,
			};
		return {
			fileName: filename,
			fileData: JSON.stringify(filedata, null, '\t')
		};
	}
	_exportHtmlFile(cfgData){
		var title = cfgData.generalCfg.title;
		var actorMap = cfgData.actorCfg;
		var scriptArr = cfgData.scriptCfg;
		
		var self = this;
		var filename = `${title}.html`;
		var style = Object.values(actorMap).map( actorObj => this.getActorStyle(actorObj) ).join('\n');
		var body = scriptArr.map( script => this.getScriptEntry(actorMap, script) ).join('\n');

		return {
			fileName: filename,
			fileData: this.getBasicWebStruct(title, style, body),
		};
	}


	//===================

	getActorStyle(actorObj){
		return `._actor_${actorObj.id} { color: #${actorObj.color}; }`;
	}
	getScriptEntry(actorMap, scriptObj){
		var type = scriptObj.type;
		switch(type){
			case "talk": return talkCmd(actorMap, scriptObj);
			default:
				return `<div class="_hidden" data-type="${type}"></div>`;
		}

		//=================
		function talkCmd(actorMap, scriptObj){
			var id = scriptObj.actorId;
			var actorObj = actorMap[id];
			var imgUrl = actorObj.imgUrl;
			return `
			<div class="_talk" data-type="talk">
				<div class="_leftCol">
					<div class="_actorImg ${imgUrl==""? "_hidden": ""}" style="background-image:url(${imgUrl})"></div>
				</div>
				<div class="_rightCol">
					<div class="_actorName _actor_${id}">${actorObj.name}</div>
					<div class="_actorWords">${scriptObj.content}</div>
				</div>
			</div>`
		}
	}
	getBasicWebStruct(title, actorStyle, body){
		return `
			<html>
				<head>
					<title>${title}</title>
					<style>
						._hidden { display:none; }
						#_main { display:flex; flex-direction:column; align-items:center; }
						._talk { margin:10px 5px; display:flex; border:1px solid black; background:#1e1e1e; width:100%; max-width:1080px; border-radius:5px; }
						._leftCol { width:122px; }
						._rightCol { width:calc(100% - 126px); }
						._actorName{ text-align:left; padding:5px; height:16px; font-size:18px; }
						._actorImg { margin:6px; width:110px; height:110px; background-repeat:no-repeat; background-size:cover; background-color:#2a2a2a; }
						._actorWords { margin:5px; background:#e3e3e3; font-size:1.1rem; padding:10px; height:calc(100% - 57px); border-radius:5px; }
						body{ background:#4f545e; }
						h1{ color:white; text-align:center; }
						${actorStyle}
					</style>
				</head>
				<body>
					<h1>${title}</h1>
					<div class="_hidden">
						<version>${VERSION}</version>
					</div>
					<div id="_main">
					${body}
					</div>
				</body>
			</html>`.fmt();
	}
}
