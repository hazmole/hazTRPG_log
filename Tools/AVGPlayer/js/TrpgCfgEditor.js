var VERSION = "hazmole_v1.0";
var MSG = {
	"btn_import": "匯入團錄",
	"btn_export": "輸出",
	"btn_generalCfg": "團錄設定",
	"btn_actorCfg": "角色設定",
	"btn_scriptCfg": "腳本設定",
	"btn_save": "儲存",
	"btn_methodAddTalk": "追加：對話",
	"btn_methodAddChangeBg": "追加：更改背景",
	"btn_methodAddHalt": "追加：停頓",
	"btn_methodDel": "刪除段落",
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
	"Tip_editScript": "請使用左側功能編輯你的團錄。",
	"fileType_ARP": ".arp (團錄播放器專用格式)",
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

	//================
	// Parser Ref
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
	doLoadedCheck(){
		if(!this.parser.isLoaded){
			this.popupMsgBox("error", MSG["Error_NoFileLoaded"]);
			return false;
		}
		return true;
	}

	//============
	// Main Button Event
	clickImport(){
		$('#_uploadFile').trigger('click'); 
	}
	clickExport(){
		if(!this.doLoadedCheck()) return ;
		this.downloadFile();
	}
	clickGoToGeneral(){
		if(!this.doLoadedCheck()) return ;
		this.goToPage("general");
	}
	clickGoToActor(){
		if(!this.doLoadedCheck()) return ;
		this.goToPage("actor");
	}
	clickGoToScript(){
		if(!this.doLoadedCheck()) return ;
		this.goToPage("script");
	}

	//============
	// Page Handler
	goToPage(pageId){
		this.clearPage();
		switch(pageId){
			case "index":   this.goToPage_index(); break;
			case "general": this.goToPage_general(); break;
			case "actor":   this.goToPage_actor(); break;
			case "script":  this.goToPage_script(); break;
		}
	}
	goToPage_index(){
		$("#_rightCol").append(builder.pageR_intro());
	}
	goToPage_general(){
		var title = this.generalCfg.title;
		//---
		$("#btn_to_general").addClass("active");
		$("#_rightCol").append(builder.pageR_generalCfg(title));
		//---
		$("#_btn_saveGeneralCfg").on('click', this.onClick_SaveGeneralCfg.bind(this));
	}
	goToPage_actor(){
		var self = this;
		//---
		$("#btn_to_actor").addClass("active");
		$("#_leftCol").append( builder.pageL_actorEntryList(Object.values(this.actorCfg)));
		$("#_rightCol").append(builder.pageR_actorCfg_Workspace());
		//---
		$("._actorEntry").on("click", this.onClick_selectActorEntry.bind(this));
	}
	goToPage_script(){
		//---
		$("#btn_to_script").addClass("active");
		$("#_leftCol").append( builder.pageL_scriptMethodList());
		$("#_rightCol").append(builder.pageR_scriptCfg_Workspace());
		//---
		$("#_btn_saveScriptCfg").on('click', this.onClick_developing.bind(this));
		$("#_btn_addTalkCmd").on('click', this.onClick_developing.bind(this));
		$("#_btn_addChBgCmd").on('click', this.onClick_developing.bind(this));
		$("#_btn_addHaltCmd").on('click', this.onClick_developing.bind(this));
		$("#_btn_delCmd").on('click', this.onClick_developing.bind(this));
	}
	//============
	// Sub-Page Handler
	goToSubpage_actorEdit(){
		var actorObj = this.selectedPtr;
		//---
		$("#_actor_workspace").html(builder.subpage_actorEditPage(actorObj));
		this.renderActorHeadImg();
		//---
		$("#_btn_saveActorCfg").on('click', this.onClick_SaveActorCfg.bind(this, actorObj.id));
		$("#_input_actorHeadImgUrl").on('change', this.onChange_setActorHeadImg.bind(this));
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
		this.selectedPtr = null;
		$("._btn").removeClass("active");
		$("#_leftCol").empty();
		$("#_rightCol").empty();
	}


	//=================
	// Interact Method
	onClick_SaveGeneralCfg(){
		var inputVal = {
			title: $("#_input_title").val()
		};
		//---
		this.generalCfg.title = inputVal.title;
		//---
		this.popupMsgBox("success", MSG["Success_SaveCfg"]);
	}
	onClick_SaveActorCfg(id){
		var inputVal = {
			name: $("#_input_actorName").val(),
			color: $("#_input_actorColor").val(),
			headImgUrl: $("#_input_actorHeadImgUrl").val(),
		};
		//---
		this.actorCfg[id].name = inputVal.name;
		this.actorCfg[id].color = inputVal.color.substring(1);
		this.actorCfg[id].imgUrl = inputVal.headImgUrl;
		//---
		$(`._actorEntry[data-id=${id}]`).text(inputVal.name);
		this.popupMsgBox("success", MSG["Success_SaveCfg"]);
	}

	onClick_selectActorEntry(event){
		var elem = event.target;

		$('._actorEntry').removeClass("active");
		$(elem).addClass("active");

		var actorId = elem.getAttribute("data-id");
		this.selectedPtr = this.actorCfg[actorId];
		
		this.goToSubpage_actorEdit();
	}

	onClick_developing(){
		this.popupMsgBox("error", "尚未開發完成");
	}

	onChange_setActorHeadImg(){
		this.renderActorHeadImg();
	}


	//=================
	// Render Element
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
		$(this.viewPort).append(builder.mainFrame());
		$("#btn_import").on('click',    this.clickImport.bind(this));
		$("#btn_export").on('click',    this.clickExport.bind(this));
		$("#btn_to_general").on('click',this.clickGoToGeneral.bind(this));
		$("#btn_to_actor").on('click',  this.clickGoToActor.bind(this));
		$("#btn_to_script").on('click', this.clickGoToScript.bind(this));
	}

	//================
	// File I/O
	downloadFile(){
		var fileName = `${this.generalCfg.title}.arp`;
		var data = {
			version: VERSION,
			config: {
				title: this.generalCfg.title,
				actors: Object.values(this.actorCfg),
			},
			script: this.scriptCfg,
		};

		var elem = document.createElement('a');
		elem.setAttribute('href','data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, '\t')));
		elem.setAttribute('download', fileName);
		document.body.appendChild(elem);
		elem.click();
	}
	createUploadElem(){
		var elem = document.createElement('input');
		elem.type = "file";
		elem.id = "_uploadFile";
		elem.setAttribute("accept", ".html,.arp");
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

