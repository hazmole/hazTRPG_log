var MSG = {
	"btn_import": "匯入團錄",
	"btn_export": "輸出",
	"btn_generalCfg": "團錄設定",
	"btn_actorCfg": "角色設定",
	"btn_scriptCfg": "腳本設定",
	"btn_save": "儲存",
	"Title_ActorList": "登場角色列表",
	"introDoc": `這個工具能夠將 どどんとふ 和 CCFolia 輸出的團錄轉換成播放器可用的格式。<ul>
<li>先使用左上角的「匯入團錄」將團錄文件匯入工具中。</li>
<li>利用「團錄設定」可以設定輸出檔的標題。</li>
<li>利用「角色設定」可以設定團錄中登場人物的代表色跟頭像。</li>
<li>利用「腳本設定」可以設定團錄中變更背景的時機。</li>
<li>在設定完成後，點擊「輸出」來將團錄輸出成播放器可用的格式。</li></ul>
若有其他使用上的疑問或建議，請不吝在Discord上聯絡 <b>hazmole#6672</b>。`,
	"replatTitle": "團錄標題",
	"exportFormat": "輸出格式",
	"actor_id": "ID",
	"actor_name": "名稱",
	"actor_color": "代表色",
	"actor_headImg_url": "角色頭像URL",
	"undefined_headImg": "未設定頭像",
	"Error_WrongFileFormat": "錯誤！無法辨識的檔案格式！",
	"Error_NoFileLoaded": "錯誤！尚未上傳原始團錄！",
	"Success_ParseComplete": "讀取成功！",
	"Success_SaveCfg": "設定已儲存！",
	"Tip_selectActor": "請點選左側的登場角色進行個別設定。",
};

class CfgEditor {
	constructor(id){
		this.viewPort = document.getElementById(id);
		this.parser = new TrpgParser();

		this.generalCfg = {};
		this.actorCfg = {};
		this.scriptCfg = [];

		this.selectedPtr = null;
	}

	init(){
		this.createFrame();
		this.createUploadElem();
		this.createMsgBox();
		
		this.goToPage("index");
	}

	initConfig(){
		this.generalCfg = {
			title: this.parser.GetTitle(),
		};
		this.actorCfg = this.parser.GetActorList();
		this.scriptCfg = this.parser.GetScript();
	}

	Parse(filename, data){
		try{
			this.parser.ParseData(filename, data);
			this.initConfig();
  	} catch(e){
    	this.popupMsgBox("error", MSG["Error_WrongFileFormat"]);
    	console.error(e);
    }
    this.popupMsgBox("success", MSG["Success_ParseComplete"]);
    this.goToPage("general");
	}
	getExportResult(){
		return {};
	}

	//============
	// Main Button Event
	clickImport(){
		$('#_uploadFile').trigger('click'); 
	}
	clickExport(){
		if(!this.doLoadedCheck()) return ;
		var fileName = "test.arp";
		var data = this.getExportResult();
		//this.downloadFile(fileName, data);
	}
	clickGoToGeneral(){ this.goToPage("general"); }
	clickGoToActor(){ this.goToPage("actor"); }
	clickGoToScript(){ this.goToPage("script"); }
	//============
	// Actor-Page Click-Event
	clickActorEntry(elem){
		$('._actorEntry').removeClass("active");
		$(elem).addClass("active");

		var actorId = elem.getAttribute("data-id");
		this.selectedPtr = this.actorCfg[actorId];
		
		this.renderActorEditPage();
	}
	
	clickSaveActorCfg(id){
		var inputVal = {
			name: $("#_input_actorName").val(),
			color: $("#_input_actorColor").val(),
			headImgUrl: $("#_input_actorHeadImgUrl").val(),
		};

		// Edit Config
		this.actorCfg[id].name = inputVal.name;
		this.actorCfg[id].color = inputVal.color.substring(1);
		this.actorCfg[id].imgUrl = inputVal.headImgUrl;
		
		// Re-Render Entry
		$(`._actorEntry[data-id=${id}]`).text(inputVal.name);

		this.popupMsgBox("success", MSG["Success_SaveCfg"]);
	}

	//============
	// Page Handler
	goToPage(pageId){
		if(pageId!="index"){
			if(!this.doLoadedCheck()) return;
		}

		this.clearPage();
		switch(pageId){
			case "index":   this.goToPage_index(); break;
			case "general": this.goToPage_general(); break;
			case "actor":   this.goToPage_actor(); break;
			case "script":  this.goToPage_script(); break;
		}
	}
	goToPage_index(){
		$("#_rightCol").append(this.getIntroPage());
	}
	goToPage_general(){
		$("#btn_to_general").addClass("active");
		$("#_rightCol").append(this.getGeneralCfgPage());
	}
	goToPage_actor(){
		$("#btn_to_actor").addClass("active");
		$("#_leftCol").append(this.getActorListCol());
		$("#_rightCol").append(this.getActorWorkspace());

		var self = this;
		$("._actorEntry").on("click", function(event){ self.clickActorEntry(event.target); });
	}
	goToPage_script(){
		$("#btn_to_script").addClass("active");
	}

	doLoadedCheck(){
		if(!this.parser.isLoaded){
			this.popupMsgBox("error", MSG["Error_NoFileLoaded"]);
			return false;
		}
		return true;
	}
	//=============
	popupMsgBox(type, msg){
		$("#_msgbox").attr('class', type)
		$("#_msgbox").text(msg).fadeIn(200);
		setTimeout(function(){
			$("#_msgbox").fadeOut(200);
		}, 1200);
	}
	//============
	clearPage(){
		$("._btn").removeClass("active");
		$("#_leftCol").empty();
		$("#_rightCol").empty();
	}
	getIntroPage(){
		return `<div class="infoBlock">${MSG["introDoc"]}</div>`;
	}
	getGeneralCfgPage(){
		var title = (this.generalCfg.title)? this.generalCfg.title: "";
		return `
<h2>${MSG["btn_generalCfg"]}</h2>
<div class="row"><b>${MSG["replatTitle"]}</b>：<input type="text" id="_input_title" value="${title}"></div>
<div class="row"><b>${MSG["exportFormat"]}</b>：.arp (團錄播放器專用格式)</div>`;
	}
	getActorListCol(){
		var actorElemArr = [];
		for(var actorObj of Object.values(this.actorCfg)){
			var actorName = (actorObj.name)? actorObj.name: "&nbsp;";
			actorElemArr.push(`<div class="_actorEntry clickable" data-id="${actorObj.id}">${actorName}</div>`);
		}
		return `<div class="title">${MSG["Title_ActorList"]}</div>${actorElemArr.join('')}`;
	}
	getActorWorkspace(){
		return `
<h2>${MSG["btn_actorCfg"]}</h2>
<div id="_actor_workspace" class="row">${MSG["Tip_selectActor"]}</div>`;
	}
	//=================
	downloadFile(fileName, data){
		var elem = document.createElement('a');
		elem.setAttribute('href','data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    elem.setAttribute('download', fileName);
    document.body.appendChild(elem);
    elem.click();
	}
	//=================
	// Render
	renderActorEditPage(){
		var actorObj = this.selectedPtr;
		var id = actorObj.id;
		var name = actorObj.name;
		var colorCode = "#"+actorObj.color;
		var imgUrl = actorObj.imgUrl;

		var template = `
<div class="_actor_frame">
	<div class="_actor_headImg_frame">
		<div class="_actor_headImg" ${ imgUrl? `style="background-image:url(${imgUrl});"`: "" }>
			${ imgUrl? "": `<div>${MSG["undefined_headImg"]}</div>` }
		</div>
	</div>
	<div class="_actor_basicInfo_frame">
		<div class="row flex"><div class="_entry_title">${MSG["actor_id"]}：</div><div>${actorObj.id}</div></div>
		<div class="row flex"><div class="_entry_title">${MSG["actor_name"]}：</div><div><input type="text" id="_input_actorName" value="${name}"></div></div>
		<div class="row flex"><div class="_entry_title">${MSG["actor_color"]}：</div><div><input type="color" id="_input_actorColor" value="${colorCode}"></div></div>
		<div class="row flex"><div class="_entry_title">${MSG["actor_headImg_url"]}：</div><div><input type="text" id="_input_actorHeadImgUrl" value="${imgUrl}"></div></div>
	</div>
</div>
<div class="row right"><button id="_btn_saveActorCfg" class="_btn_save">${MSG["btn_save"]}</button></div>`;
		$("#_actor_workspace").empty();
		$("#_actor_workspace").append(template);

		$("#_input_actorHeadImgUrl").on('change', this.renderActorHeadImg.bind(this));
		$("#_btn_saveActorCfg").on('click', this.clickSaveActorCfg.bind(this, id));
	}
	renderActorHeadImg(){
		var url = $("#_input_actorHeadImgUrl").val();
		if(url){
			$("._actor_headImg").empty();
			$("._actor_headImg").css("background-image", `url(${url})`);
		} else {
			$("._actor_headImg").html(`<div>${MSG["undefined_headImg"]}</div>`);
			$("._actor_headImg").css("background-image", '');
		}
		
	}
	//=================
	// Create Elements
	createMsgBox(){
		$(this.viewPort).append(`<div id="_msgbox"></div>`);
	}
	createFrame(){
		var template = `
<div id="_toolbar">
	<div id='_toolbar_leftGroup'>
		<div class="_btn_group">
			<div id="btn_import" class="_btn clickable">
				<div class="_icon"></div><div class="_label">${MSG["btn_import"]}</div>
			</div>
			<div id="btn_export" class="_btn clickable">
				<div class="_icon"></div><div class="_label">${MSG["btn_export"]}</div>
			</div>
		</div>
		<div class="_btn_group">
			<div id="btn_to_general" class="_btn clickable">
				<div class="_icon"></div><div class="_label">${MSG["btn_generalCfg"]}</div>
			</div>
			<div id="btn_to_actor" class="_btn clickable">
				<div class="_icon"></div><div class="_label">${MSG["btn_actorCfg"]}</div>
			</div>
			<div id="btn_to_script" class="_btn clickable">
				<div class="_icon"></div><div class="_label">${MSG["btn_scriptCfg"]}</div>
			</div>
		</div>
	</div>
	<div id='_toolbar_rightGroup'>
		<div id="_sign">by. Hazmole</div>
	</div>
</div>
<div id="_workspace">
	<div id="_leftCol"></div>
	<div id="_rightCol"></div>
</div>`;
		$(this.viewPort).append(template);
		$("#btn_import").on('click', this.clickImport.bind(this));
		$("#btn_export").on('click', this.clickExport.bind(this));
		$("#btn_to_general").on('click', this.clickGoToGeneral.bind(this));
		$("#btn_to_actor").on('click', this.clickGoToActor.bind(this));
		$("#btn_to_script").on('click', this.clickGoToScript.bind(this));
	}
	createUploadElem(){
		var elem = document.createElement('input');
		elem.type = "file";
		elem.id = "_uploadFile";
		elem.setAttribute("accept", ".html");
		document.body.append(elem);

		var self = this;
		$(elem).on('change', (event) => {
			const file = event.target.files[0];
			var filename = file.name;

			var fr = new FileReader();
			fr.onload = function(){
				self.Parse(filename, fr.result);
			}

			fr.readAsText(file);
		});
	}
}

