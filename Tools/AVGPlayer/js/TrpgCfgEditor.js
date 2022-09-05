var MSG = {
	"": "",
};

class CfgEditor {
	constructor(id){
		this.viewPort = document.getElementById(id);
	}

	init(){
		this.createFrame();
	}

	//============
	createFrame(){
		var template = `<div id="_toolbar"></div>`;
		$(this.viewPort).append(template);
	}
}

