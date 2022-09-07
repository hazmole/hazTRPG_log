var VERSION = "hazmole_v1.0";
var MSG = {
	"btn_import": "匯入團錄",
	"btn_export": "輸出",
	"btn_generalCfg": "團錄設定",
	"btn_actorCfg": "角色設定",
	"btn_scriptCfg": "腳本設定",
	"btn_save": "儲存",
	"btn_apply": "確定",
	"btn_methodEdit": "編輯段落",
	"btn_methodAddTalk": "插入：對話",
	"btn_methodAddChangeBg": "插入：更改背景",
	"btn_methodAddHalt": "插入：停頓",
	"btn_methodDel": "刪除段落",
	"Title_ActorList": "登場角色列表",
	"Title_EditBgImg": "設定背景圖片",
	"Title_EditTalk": "設定對話",
	"introDoc": `這個工具能夠將 どどんとふ 和 CCFolia 輸出的團錄轉換成播放器可用的格式。<ul>
		<li>先使用左上角的「匯入團錄」將團錄文件匯入工具中。</li>
		<li>利用「團錄設定」可以設定輸出檔的標題。</li>
		<li>利用「角色設定」可以設定團錄中登場人物的代表色跟頭像。</li>
		<li>利用「腳本設定」可以設定團錄中變更背景的時機。</li>
		<li>在設定完成後，點擊「輸出」來將團錄輸出成播放器可用的格式。</li></ul>
		若有其他使用上的疑問或建議，請不吝在Discord上聯絡 <b>hazmole#6672</b>。`,
	"replatTitle": "團錄標題",
	"exportFormat": "輸出格式",
	"talk_actor": "發話角色",
	"actor_id": "ID",
	"actor_name": "名稱",
	"actor_color": "代表色",
	"actor_headImg_url": "角色頭像URL",
	"undefined_headImg": "未設定頭像",
	"imgUrl": "圖片網址",
	"cmd_changeBg": "指令：設定背景",
	"cmd_halt": "指令：停頓",
	"SOF": "文件開頭",
	"EOF": "文件結尾",
	"Error_WrongFileFormat": "錯誤！無法辨識的檔案格式！",
	"Error_NoFileLoaded": "錯誤！尚未上傳原始團錄！",
	"Error_NoSelectedEntry": "請先選擇一個段落！",
	"Warn_WebStorageExceedLimit": "警告！網頁儲存空間超過上限，自動儲存失敗。",
	"Success_ParseComplete": "讀取成功！",
	"Success_AutoLoaded": "自動讀取成功！",
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
		this.createCtrlWindow();

		this.loadFromWebStorage();
		
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
		this.saveToWebStorage();
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
		this.render_scriptList();
		//---
		$("#_btn_saveScriptCfg").on('click', this.onClick_SaveScriptCfg.bind(this));
		$("#_btn_editCmd").on('click', this.onClick_editCmd.bind(this));
		//$("#_btn_addTalkCmd").on('click', this.onClick_developing.bind(this));
		$("#_btn_addChBgCmd").on('click', this.onClick_addChBgCmd.bind(this));
		$("#_btn_addHaltCmd").on('click', this.onClick_addHaltCmd.bind(this));
		$("#_btn_delCmd").on('click', this.onClick_delScriptCmd.bind(this));
	}
	clearPage(){
		this.selectedPtr = null;
		$("._btn").removeClass("active");
		$("#_leftCol").empty();
		$("#_rightCol").empty();
	}
	//============
	// Sub-Page Handler
	render_actorEdit(){
		var actorObj = this.selectedPtr;
		//---
		$("#_actor_workspace").html(builder.subpage_actorEditPage(actorObj));
		this.render_actorHeadImg();
		//---
		$("#_btn_saveActorCfg").on('click', this.onClick_SaveActorCfg.bind(this, actorObj.id));
		$("#_input_actorHeadImgUrl").on('change', this.onChange_setActorHeadImg.bind(this));
	}
	render_actorHeadImg(){
		var url = $("#_input_actorHeadImgUrl").val();
		if(url){
			$("._actor_headImg").empty();
			$("._actor_headImg").css("background-image", `url(${url})`);
		} else {
			$("._actor_headImg").html(builder.actorUndefinedImg());
			$("._actor_headImg").css("background-image", '');
		}
	}
	render_scriptList(){
		$("#_script_listPanel").html(builder.subpage_scriptList(this.actorCfg, this.scriptCfg));
		//---
		$("._scriptEntry").on('click', this.onClick_selectScriptEntry.bind(this));
	}

	



	//=================
	// Interact Method
	onClick_SaveGeneralCfg(){
		var inputVal = {
			title: $("#_input_title").val()
		};
		//---
		this.generalCfg.title = inputVal.title;
		this.saveToWebStorage();
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
		this.saveToWebStorage();
		//---
		$(`._actorEntry[data-id=${id}]`).text(inputVal.name);
		this.popupMsgBox("success", MSG["Success_SaveCfg"]);
	}
	onClick_SaveScriptCfg(){
		var self = this;
		var scriptArr = $("._scriptEntry:not(.SOF):not(.EOF)")
			.map(function(){
				return self.getScriptObjFromEntryElem(this);
			})
			.toArray();
		//---
		this.scriptCfg = scriptArr;
		this.saveToWebStorage();
		//---
		this.popupMsgBox("success", MSG["Success_SaveCfg"]);
	}

	onClick_selectActorEntry(event){
		var elem = this.getEntryElemByEvent(event, "_actorEntry");
		//---
		$('._actorEntry').removeClass("active");
		$(elem).addClass("active");
		//---
		var actorId = elem.getAttribute("data-id");
		this.selectedPtr = this.actorCfg[actorId];
		this.render_actorEdit();
	}
	onClick_selectScriptEntry(event){
		var elem = this.getEntryElemByEvent(event, "_scriptEntry");
		//---
		$('._scriptEntry').removeClass("active");
		$(elem).addClass("active");
		//---
		this.selectedPtr = elem;
	}

	onClick_editCmd(){
		var self = this;
		if(!this.selectedPtr){
			this.popupMsgBox("error", MSG["Error_NoSelectedEntry"]);
			return ;
		}
		if($(this.selectedPtr).hasClass("SOF")) return ;
		//---
		var cmdType = $(this.selectedPtr).attr("data-type");
		switch(cmdType){
			case "changeBg": editChangeBgCmd(); break;
			case "talk": editTalkCmd(); break;
			case "halt": break;
			default:
				this.popupMsgBox("error", "尚未實作");
				break;
		}

		//===============
		function editChangeBgCmd(){
			var imgElem = $(self.selectedPtr).children("._scriptEntry_image");
			var arg_url = imgElem.attr("data-url");
			self.popWindow_editBackground(arg_url, function(){
				var newUrl = $("#_input_imgUrl").val();
				imgElem.attr("data-url", newUrl);
				imgElem.css("background-image", `url(${newUrl})`);
				self.hideCtrlWindow();
			}.bind(self));
		}
		function editTalkCmd(){
			var actorElem = $(self.selectedPtr).children("._scriptEntry_talkActor");
			var contentElem = $(self.selectedPtr).children("._scriptEntry_talkContent");
			var arg = {
				actorId: actorElem.attr("data-actor-id"),
				content: contentElem.html(),
			};
			self.popWindow_editTalk(arg.actorId, arg.content, function(){
				var newContent = $("#_input_content").val();
				contentElem.html(newContent);
				self.hideCtrlWindow();
			}.bind(self));
		}
	}

	onClick_addChBgCmd(){
		if(!this.selectedPtr){
			this.popupMsgBox("error", MSG["Error_NoSelectedEntry"]);
			return ;
		}
		//---
		this.popWindow_editBackground("", function(){
			var scriptObj = {
				type: "changeBg",
				bgUrl: $("#_input_imgUrl").val(),
			};
			this.insertScriptEntry(this.selectedPtr, scriptObj);
			this.hideCtrlWindow();
		}.bind(this));
	}
	onClick_addHaltCmd(){
		if(!this.selectedPtr){
			this.popupMsgBox("error", MSG["Error_NoSelectedEntry"]);
			return ;
		}

		var scriptObj = {
			type: "halt"
		};
		this.insertScriptEntry(this.selectedPtr, scriptObj);
	}
	onClick_delScriptCmd(){
		if(!this.selectedPtr){
			this.popupMsgBox("error", MSG["Error_NoSelectedEntry"]);
			return ;
		}
		
		if(!this.selectedPtr) return;
		if($(this.selectedPtr).hasClass("SOF")) return ;

		$(this.selectedPtr).remove();
		this.selectedPtr = null;
	}

	onChange_setActorHeadImg(){
		this.render_actorHeadImg();
	}


	onClick_showCtrlWindow(type, callback){
		this.popupCtrlWindow(type, callback);
	}
	onClick_hideCtrlWindow(){
		this.hideCtrlWindow();
	}


	//=================
	// Supportive Function
	insertScriptEntry(root, scriptObj){
		if(!root) return;
		$(root).after(builder.scriptEntry(this.actorCfg, scriptObj));
		$(root).next().on('click', this.onClick_selectScriptEntry.bind(this));
	}
	getEntryElemByEvent(event, targetClass){
		var elem = event.target;
		while(!$(elem).hasClass(targetClass)){
			elem = elem.parentElement;
		}
		return elem;
	}
	getScriptObjFromEntryElem(scriptEntry){
		var type = $(scriptEntry).attr("data-type");
		switch(type){
			case "changeBg":
				var bgUrl = $(scriptEntry).children("._scriptEntry_image").attr("data-url");
				return { type, bgUrl };
			case "talk":
				var actorId = $(scriptEntry).children("._scriptEntry_talkActor").attr("data-actor-id");
				var content = $(scriptEntry).children("._scriptEntry_talkContent").html();
				return { type, actorId, content };
			default:
				return { type };
		}
	}

	//=================
	// Control Window
	popWindow_editBackground(imgUrl, applyCallback){
		var title = MSG["Title_EditBgImg"];
		var content = builder.ctrlWin_editBgImg(imgUrl);
		//---
		this.popupCtrlWindow(title, content, applyCallback);
		//---
		$("#_input_imgUrl").on('change', function(){
			$("#_output_imgPreview").css("background-image", `url(${$("#_input_imgUrl").val()})`);
		}.bind(this));
	}
	popWindow_editTalk(actorId, content, applyCallback){
		var title = MSG["Title_EditTalk"];
		var content = builder.ctrlWin_editTalk(this.actorCfg, actorId, content);
		//---
		this.popupCtrlWindow(title, content, applyCallback);
		//---
		//$("#_input_imgUrl").on('change', function(){
		//	$("#_output_imgPreview").css("background-image", `url(${$("#_input_imgUrl").val()})`);
		//}.bind(this));
	}

	popupCtrlWindow(title, content, callback){
		$("._ctrlbar_title").text(title);
		$("._ctrlbody").html(content);
		$("#_btn_ctrlWinApply").on('click', callback);
		$("._ctrlwindow").fadeIn(200);
	}
	hideCtrlWindow(){
		$("#_btn_ctrlWinApply").off();
		$("._ctrlwindow").fadeOut(200);
	}
	//=================
	// Create Elements
	createMsgBox(){
		$(this.viewPort).append(builder.messageBox());
	}
	createCtrlWindow(){
		$(this.viewPort).append(builder.controlWindow());
		$(".cross-stand-alone").on('click', this.onClick_hideCtrlWindow.bind(this));
	}
	createFrame(){
		$(this.viewPort).append(builder.mainFrame());
		$("#btn_import").on('click',    this.clickImport.bind(this));
		$("#btn_export").on('click',    this.clickExport.bind(this));
		$("#btn_to_general").on('click',this.clickGoToGeneral.bind(this));
		$("#btn_to_actor").on('click',  this.clickGoToActor.bind(this));
		$("#btn_to_script").on('click', this.clickGoToScript.bind(this));
	}
	//=================
	// Message Box
	popupMsgBox(type, msg){
		$("#_msgbox").attr('class', type)
		$("#_msgbox").text(msg).fadeIn(200);
		setTimeout(function(){
			$("#_msgbox").fadeOut(200);
		}, 1200);
	}
	//=================
	// Local Storage
	saveToWebStorage(){
		var obj = {
			general: this.generalCfg,
			actors: this.actorCfg,
			script: this.scriptCfg,
		};
		try{
			localStorage.setItem('rpCfgSave', JSON.stringify(obj));
		} catch(e){
			this.popupMsgBox("warn", MSG["Warn_WebStorageExceedLimit"]);
			console.error(e);
		}
	}
	loadFromWebStorage(){
		var cfg = localStorage.getItem('rpCfgSave');
		if(cfg){
			try{
				var jsonObj = JSON.parse(cfg);
				this.parser.isLoaded = true;
				this.generalCfg = jsonObj.general;
				this.actorCfg = jsonObj.actors;
				this.scriptCfg = jsonObj.script;
				this.popupMsgBox("success", MSG["Success_AutoLoaded"]);
			}catch(e){
				localStorage.clear();
				console.error(e);
			}
		}
	}
	getWebStorageUsage(){
		var _key = 'rpCfgSave';
		var _bytes = ((localStorage[_key].length + _key.length) * 2);

		return (_bytes / 1024).toFixed(2) + " KB";
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

