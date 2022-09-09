var MSG = {
	"SceneEnd": "-- END --",
	"LoadComplete": "讀取完畢！",
	"Restart": "重新開始！",
	"Autoplay_enable": "啟用自動播放",
	"Autoplay_disable": "關閉自動播放",
	"Error_EmptyConfig": "錯誤！尚未匯入團錄文件！",
	"Error_WrongFileFormat": "錯誤！檔案格式有誤！",
	"PressSpaceToStart": "請按下[空白鍵]開始...",
	"Tip_ImportFile": "匯入團錄文件",
	"Tip_Autoplay": "自動播放",
	"Tip_Restart": "重新開始",
};

class SceneCtrl {
	constructor(id){
		this.viewPort = document.getElementById(id);
		this.currentSceneObj = null;
		this.state = "disabled";
		this.cmdIndex = 0;

		this.isAutoplay = false;
		this.autoplayInterval = null;
	}

	Init(scene_id){
		// Create Objects
		this.createBackground();
		this.createToolBar();
		this.createChatBox();
		this.createMsgBox();
		this.createFileImport();

		// Add Listener
		$(document).on('keypress', this.handleUserInput.bind(this));

	}
	LoadSceneFile(sceneObj){
		this.currentSceneObj = sceneObj;
		this.cmdIndex = 0;
		this.state = "loaded";

		this.popupMsgBox("info", MSG["LoadComplete"]);

		this.Chat(sceneObj.config.title, MSG["PressSpaceToStart"]);
	}


	//===============
	runNextCommand(){
		var self = this;
		var cmdObj = this.currentSceneObj.script[this.cmdIndex];
		if(cmdObj==undefined){
			this.handleEOF();
			return;
		}

		while(isSkipCmd(cmdObj)){
			this.cmdIndex++;
			cmdObj = this.currentSceneObj.script[this.cmdIndex];
		}

		switch(cmdObj.type){
			case "talk":
				this.handleTalkCmd(cmdObj);
				break;
			case "halt":
				this.handleHalt();
				break;
			case "changeBg":
				this.handleChangeBg(cmdObj);
				break;
		}
		this.cmdIndex++;

		//========
		function isSkipCmd(cmdObj){
			var isSkipOtherCh = self.currentSceneObj.config.isOnlyMainCh;
			if( cmdObj.type=="talk" && cmdObj.channel=="other" ) return true;
			return false;
		}
	}

	
	handleUserInput(e){
		var isPressSpace = (e.which == 32);
		if(!isPressSpace) return;
		
	    switch(this.state){
	    	case "disabled": break;
	    	case "loaded":
	    		this.hideChatBox();
	    		this.initScene();
	    		break;
	    	case "run":
	    		this.runNextCommand();
	    		break;
	    	case "scriptEnded":
	    		break;
	    }
	    
	}

	//===============
	initScene(){
		var firstSceneBackgroundUrl = this.currentSceneObj.config.defaultBg;
		this.state = "run";
		this.cmdIndex = 0;
		this.showBackground(firstSceneBackgroundUrl, function(){
			this.runNextCommand();
		}.bind(this))
	}

	//===============
	createToolBar(){
		var self = this;
		var toolBarElem = document.createElement('div');
		toolBarElem.id = "_toolbar"

		var importBtn = document.createElement('div');
		importBtn.className = "_btn";
		importBtn.id = "_btn_import";
		importBtn.title = MSG["Tip_ImportFile"];
		toolBarElem.append(importBtn);
		$(importBtn).on("click", function(){
			$('#_sceneFile').trigger('click'); 
		});

		var autoplayBtn = document.createElement('div');
		autoplayBtn.className = "_btn";
		autoplayBtn.id = "_btn_autoplay";
		autoplayBtn.title = MSG["Tip_Autoplay"];
		toolBarElem.append(autoplayBtn);
		$(autoplayBtn).on("click", function(){
			self.toggleAutoplay();
		});

		var restartBtn = document.createElement('div');
		restartBtn.className = "_btn";
		restartBtn.id = "_btn_restart";
		restartBtn.title = MSG["Tip_Restart"];
		toolBarElem.append(restartBtn);
		$(restartBtn).on("click", function(){
			self.restart();
		});

		this.viewPort.append(toolBarElem);
	}
	toggleAutoplay(){
		this.isAutoplay = !this.isAutoplay;
		$("#_btn_autoplay").toggleClass("active");

		var self = this;
		if(this.isAutoplay){
			this.autoplayInterval = window.setInterval(function(){
				if(self.state==="run"){
					self.runNextCommand();
				}
			}, 3000);
			this.popupMsgBox("info", MSG["Autoplay_enable"]);
		} else {
			window.clearInterval(this.autoplayInterval);
			this.popupMsgBox("info", MSG["Autoplay_disable"]);
		}
	}
	restart(){
		if(this.currentSceneObj==null){
			this.popupMsgBox("error", MSG["Error_EmptyConfig"]);
			return;
		}
		this.popupMsgBox("info", MSG["Restart"]);

		this.hideBackground();
		this.cmdIndex = 0;
		this.state = "loaded";
		this.Chat(this.currentSceneObj.config.title, MSG["PressSpaceToStart"]);
	}

	//===============
	handleTalkCmd(cmdObj){
		this.showChatBox();
		var actorCfg = this.findActorById(cmdObj.actorId);
		$("#chat_head_img").css('background-image', `url(${actorCfg.imgUrl})`);
		$("#chat_title").text(actorCfg.name);
		$("#chat_title").css('color', actorCfg.color? actorCfg.color: '#fff');
		$("#chat_content").html(cmdObj.content.replace("\n","<br>"));
	}
	handleHalt(){
		this.hideChatBox();
	}
	handleChangeBg(cmdObj){
		this.transBackground(cmdObj.bgUrl)
	}
	handleEOF(){
		this.state = "scriptEnded";
		this.hideBackground();
		this.hideChatBox(function(){
			this.Chat(MSG["SceneEnd"], "");
		}.bind(this));
	}

	//===============
	createFileImport(){
		var elem = document.createElement('input');
		elem.type = "file";
		elem.id = "_sceneFile";
		elem.setAttribute("accept", ".arp");
		document.body.append(elem);

		var self = this;
		$(elem).on('change', (event) => {
			const files = event.target.files;

			var fr = new FileReader();
			fr.onload = function(){
	            try{
	            	var jsonObj = JSON.parse(fr.result);
	            	self.LoadSceneFile(jsonObj);
	            } catch(e){
	            	self.popupMsgBox("error", MSG["Error_WrongFileFormat"]);
	            	console.error(e);
	            }
       		};
       		fr.readAsText(files[0]);
		});
	}
	//===============
	createMsgBox(){
		var elem = document.createElement('div');
		elem.id = "_msgbox"
		this.viewPort.append(elem);
	}
	popupMsgBox(type, msg){
		$("#_msgbox").attr('class', type)
		$("#_msgbox").text(msg).fadeIn(200);
		setTimeout(function(){
			$("#_msgbox").fadeOut(200);
		}, 1200);
	}
	//===============
	createBackground(){
		var elem = document.createElement('div');
		elem.id = "_background"
		this.viewPort.append(elem);
	}
	showBackground(url, callback){
		$("#_background")
			.css('background-image', `url(${url})`)
			.fadeIn(500, function(){
				if(callback) callback();
			});
	}
	transBackground(url){
		this.hideBackground(function(){
			this.showBackground(url);
		}.bind(this));
	}
	hideBackground(callback){
		return $("#_background").fadeOut(500, function(){
			if(callback) callback();
		});
	}
	//===============
	createChatBox(){
		var chatBoxElem = document.createElement('div');
		chatBoxElem.id = "chatWindow";
		
		var chatBoxRowElem = document.createElement('div');
		chatBoxRowElem.className = "row";
		chatBoxElem.append(chatBoxRowElem);

		var chatBoxHeadImgElem = document.createElement('div');
		chatBoxHeadImgElem.id = "chat_head_img";
		var chatBoxFrameElem = document.createElement('div');
		chatBoxFrameElem.id = "chat_frame";
		chatBoxRowElem.append(chatBoxHeadImgElem, chatBoxFrameElem);

		var chatBoxTitleElem = document.createElement('div');
		chatBoxTitleElem.id = "chat_title";
		var chatBoxContentElem = document.createElement('div');
		chatBoxContentElem.id = "chat_content";
		chatBoxFrameElem.append(chatBoxTitleElem, chatBoxContentElem);

		this.viewPort.append(chatBoxElem);
	}
	hideChatBox(callback){
		return $("#chatWindow").fadeOut(500, function(){
			if(callback) callback();
		});
	}
	showChatBox(callback){
		return $("#chatWindow").fadeIn(500, function(){
			if(callback) callback();
		});
	}
	Chat(title, text){
		$("#chat_head_img").css('background-image', ``);
		$("#chat_title").text(title);
		$("#chat_title").css('color', '#fff');
		$("#chat_content").html(text);
		this.showChatBox();
	}
	//===============
	findActorById(id){
		return this.currentSceneObj.config.actors.find( actor => actor.id == id );
	}
}
