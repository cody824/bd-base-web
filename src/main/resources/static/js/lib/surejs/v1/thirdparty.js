$.cachedScript("/js/lib/surejs/globalConfig.js");
$.cachedScript("http://qzonestyle.gtimg.cn/qzone/openapi/qc_loader.js");
function thirdpartyLogin (type, openId, myApp, callback){
	SureAjax.ajax({
		method : 'POST',
		url : '/suresecurity/tplogin/' + openId,
		data : {
			type : type,
			appId : myApp
		},
		parseError : false,
		complete : function(XHR, TS){
			if (XHR.status == 404){
				window.location.href = "/view/login/tpaRegist.html?type=" + type + "&code=" + openId;
			} else if (XHR.status == 202){
				var loginInfo = XHR.responseJSON;
				SureAuthInfo.saveLoginName(loginInfo.userName);
				SureAuthInfo.saveAccessKeyID(loginInfo.accessKeyId);
				SureAuthInfo.saveSecretAccessKeyID(loginInfo.secretAccessKeyId);
				SureMsg.msg(LABEL.login, LABEL.success);
				if (typeof(callback) == "function"){
					callback(loginInfo.userName);
				} else {
					window.location.href = "/";
				}
			} else if (XHR.status == 500){
				SureMsg.parseResponse(XHR);
			}
		}
	});
}


var qqLogin = function(app) {
	this.app = app;

	this.clientId = SURE.getConfig("qq", this.app, "client_id") || '';

	this.redirectURI = SURE.getConfig("qq", this.app, "redirect_uri") || '';

	this.login = function() {
		var me = this;
		QC.Login.showPopup({
			appId : me.clientId.trim(),
			redirectURI : me.redirectURI.trim()
		});
	};
	

};

var weiboLogin = function(app) {
	this.app = app;

	this.clientId = SURE.getConfig("weibo", this.app, "client_ID") || '';
	this.redirectURI = SURE.getConfig("weibo", this.app, "redirect_URI") || '';
	this.authorizeURL = SURE.getConfig("weibo", this.app, "authorizeURL") || '';

	this.buildRedirectURI = function() {
		var url = this.authorizeURL.trim() + "?client_id=" + this.clientId.trim()
				+ "&redirect_uri=" + this.redirectURI.trim() + "&response_type=code"
				+ "&state=";
		return url;
	};

	this.login = function() {
		window.location.href = this.buildRedirectURI();
	};
	
	this.getSuid = function(code){
		var suid = null;
		var me = this;
		
		SureAjax.ajax({
			url : '/suresecurity/weibo/' + code + '/uid',
			async : false,
			parseError : false,
			data : {
				appId : me.app
			},
			success : function(XHR){
				suid = XHR;
			}
		});
		
		return suid;
		
	};
};

var renrenLogin = function(app) {
	this.app = app;
	
	this.clientId = SURE.getConfig("renren", this.app, "api_key") || '';
	this.scope = SURE.getConfig("renren", this.app, "scope")|| '';
	
	this.redirectURI = SURE.getConfig("renren", this.app, "redirect_uri") || '';
	this.baseURL = SURE.getConfig("renren", this.app, "baseURL") || '';
	this.x_renew = SURE.getConfig("renren", this.app, "x_renew") || '';

	this.buildRedirectURI = function() {
		var url = this.baseURL.trim() + "?client_id=" + this.clientId.trim()
				+ "&redirect_uri=" + this.redirectURI.trim() + "&response_type=code"
				+ "&display=page" + "&scope=" + this.scope.trim() + "&x_renew=" + this.x_renew.trim();
		return url;
	};

	this.login = function() {
		window.location.href = this.buildRedirectURI();
	};
	
	this.getSuid = function(code){
		var suid = null;
		var me = this;
		
		SureAjax.ajax({
			url : '/suresecurity/renren/' + code + '/uid',
			async : false,
			parseError : false,
			data : {
				appId : me.app
			},
			success : function(XHR){
				suid = XHR;
			}
		});
		
		return suid;
		
	};
};

