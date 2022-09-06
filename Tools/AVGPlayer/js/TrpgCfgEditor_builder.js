function builder(){}

/*----------------
  Page: Introduction
 ----------------*/
builder.pageR_intro = function(){
	return `<div class="infoBlock">${MSG["introDoc"]}</div>`;
}

/*----------------
  Page: General Config
 ----------------*/
builder.pageR_generalCfg = function(title){
	return `
		<h2>${MSG["btn_generalCfg"]}</h2>
		<div class="row"><b>${MSG["replatTitle"]}</b>：<input type="text" id="_input_title" value="${title}"></div>
		<div class="row"><b>${MSG["exportFormat"]}</b>：${MSG["fileType_ARP"]}</div>
		<div class="row right"><button id="_btn_saveGeneralCfg" class="_btn_save">${MSG["btn_save"]}</button></div>`.fmt();
}

/*----------------
  Page: Actor Config
 ----------------*/
builder.pageL_actorEntryList = function(actorList){
	var entryList = actorList.map( actor => builder.actorEntry(actor) )
	return `<div class="title">${MSG["Title_ActorList"]}</div>
					${entryList.join('')}`.fmt();
}
builder.pageR_actorCfg_Workspace = function(title){
	return `
		<h2>${MSG["btn_actorCfg"]}</h2>
		<div id="_actor_workspace" class="row">${MSG["Tip_selectActor"]}</div>`.fmt();
}
builder.actorEntry = function(actorObj){
	var actorName = (actorObj.name)? actorObj.name: "&nbsp;";
	return `<div class="_actorEntry clickable" data-id="${actorObj.id}">${actorName}</div>`;
}

builder.subpage_actorEditPage = function(actorObj){
	var imgUrl = actorObj.imgUrl;
	return `
		<div class="_actor_frame">
			<div class="_actor_headImg_frame">
				<div class="_actor_headImg" ${ imgUrl? `style="background-image:url(${imgUrl});"`: "" }>
					${ imgUrl? "": `<div>${MSG["undefined_headImg"]}</div>` }
				</div>
			</div>
			<div class="_actor_basicInfo_frame">
				<div class="row flex"><div class="_entry_title">${MSG["actor_id"]}：</div><div>${actorObj.id}</div></div>
				<div class="row flex"><div class="_entry_title">${MSG["actor_name"]}：</div><div><input type="text" id="_input_actorName" value="${actorObj.name}"></div></div>
				<div class="row flex"><div class="_entry_title">${MSG["actor_color"]}：</div><div><input type="color" id="_input_actorColor" value="#${actorObj.color}"></div></div>
				<div class="row flex"><div class="_entry_title">${MSG["actor_headImg_url"]}：</div><div><input type="text" id="_input_actorHeadImgUrl" value="${imgUrl}"></div></div>
			</div>
		</div>
		<div class="row right"><button id="_btn_saveActorCfg" class="_btn_save">${MSG["btn_save"]}</button></div>`.fmt();
}

/*----------------
  Page: Script Config
 ----------------*/
builder.pageL_scriptMethodList = function(){
	return `
		<div class="title">${MSG["Title_ActorList"]}</div>
		<div id="_btn_addTalkCmd" class="_scriptMethodEntry clickable">${MSG["btn_methodAddTalk"]}</div>
		<div id="_btn_addChBgCmd" class="_scriptMethodEntry clickable">${MSG["btn_methodAddChangeBg"]}</div>
		<div id="_btn_addHaltCmd" class="_scriptMethodEntry clickable">${MSG["btn_methodAddHalt"]}</div>
		<div id="_btn_delCmd" class="_scriptMethodEntry clickable">${MSG["btn_methodDel"]}</div>`.fmt();
}
builder.pageR_scriptCfg_Workspace = function(){
	return `
		<div id="_script_ctrlPanel">
			<h2>${MSG["btn_scriptCfg"]}</h2>
			<div class="row">${MSG["Tip_editScript"]}</div>
			<div class="row right"><button id="_btn_saveScriptCfg" class="_btn_save">${MSG["btn_save"]}</button></div>
		</div>
		<div id="_script_listPanel">
		</div>`.fmt();
}

/*----------------
  Basic Element 
 ----------------*/
builder.messageBox = function(){
	return `<div id="_msgbox"></div>`;
}
builder.mainFrame = function(){
	return `
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
		</div>`.fmt();
}

String.prototype.fmt = function(){
	return this.replace(/[\t]/g, '')
}