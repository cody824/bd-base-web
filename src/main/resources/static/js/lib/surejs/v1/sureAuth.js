var browserClientId = sessionStorage.getItem("browserClientId");
if (browserClientId == null) {
	browserClientId = new UUID().id;
	sessionStorage.setItem("browserClientId", browserClientId);
}

Array.prototype.contains = function(elem) {
	for ( var i = 0; i < this.length; i++) {
		if (this[i] == elem) {
			return true;
		}
	}
	return false;
};



var SureAuthTool = {
	vendorStr : 'Soul',
	sign_headrers_key : [ "Accept", "Accept-Encoding", "Accept-Language",
			"Host" ],

	buildS2Authrization : function(accessKeyId, secretAccessKeyID, request) {
		var me = this, src = me.canonicalString(request.method, request.url,
				request.headers, request.expires), hash = null, auth = "";
		hash = me.sign(src, secretAccessKeyID);
		auth = me.vendorStr + " " + accessKeyId + ":" + hash;
		return auth;
	},

	buildAuthrization : function(url, method, headers, expires) {

		
	
		var accessKeyId = SureAuthInfo.getAccessKeyId(), secretAccessKeyID = SureAuthInfo
				.getSecretAccessKeyId();
		
		//如果是微信端访问，且accessKeyId为空时，重新获取accessKeyId和secretAccessKeyID，模拟次登录成功的赋值
		//影响版本2.23.1
		 var isWechat=$.cookie("SURE_IS_WECHAT");
		 if(isWechat=="Y"&&(accessKeyId==null||accessKeyId==""||accessKeyId==undefined))
		 {
			 var w_accessKeyId=$.cookie("SURE_ACCESSKEY_ID");
			 var w_secretAccessKeyID=$.cookie("SURE_SECREACCESSKEY_ID");
			 		 
			 if(w_accessKeyId!=null)
			 {
				 accessKeyId=w_accessKeyId;
				 //TODO此处有个不是很明白的地方，把SureAuthInfo.saveAccessKeyID(w_accessKeyId)中的参数"w_accessKeyId"换成accessKeyId就是不行。
				 SureAuthInfo.saveAccessKeyID(w_accessKeyId);
			 }
			 if(w_secretAccessKeyID!=null)
			 {
				 secretAccessKeyID=w_secretAccessKeyID;
				 SureAuthInfo.saveSecretAccessKeyID(w_secretAccessKeyID);
			 } 
		 }
		
		
		if (url.indexOf('/') == 0 && url.length > 1) {
			url = url.substring(1);
		}
		auth = this.buildS2Authrization(accessKeyId, secretAccessKeyID, {
			method : method,
			url : url,
			headers : headers,
			expires : expires
		});
		return auth;
	},

	sign : function(str, secretAccessKeyID) {
		var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA1,
				secretAccessKeyID);
		hash = '';
		hmac.update(str);
		hash = hmac.finalize();
		return hash;
	},

	canonicalString : function(method, path, headers, expires) {
		var me = this, sign_headers = {};
		for ( var header in headers) {
			if (me.sign_headrers_key.contains(header))
				sign_headers[header] = headers[header];
		}
		sign_headers.date = expires ? expires : '';
		var canonical = method.toUpperCase() + "\n";
		for ( var sheader in sign_headers) {
			canonical += sheader.toUpperCase();
			canonical += ":";
			canonical += sign_headers[sheader].toUpperCase();
			canonical += "\n";
		}
		canonical += path;
		return canonical;
	}

};

var SureAuthInfo = {

	userPermission : 0,

	/**
	 * 登录名
	 */
	loginUserName : "",
	
	/**
	 * 登陆用户显示名
	 */
	showName : "",

	/**
	 * 访问Key
	 */
	accessKeyId : "",

	/**
	 * 安全Key
	 */
	secretAccessKeyID : "",

	/**
	 * 安全Key存放位置
	 */
	sakiPos : 'sessionStroage',

	/**
	 * 过期时间
	 */
	avoidTime : 7, // 天
	
	/**
	 * 是否自动登录
	 */
	autoLogin : false,

	init : function() {
		var me = this;
		me.isAutoLogin();
		me.getLoginName();
		me.getShowName();
		me.getAccessKeyId();
		me.getSecretAccessKeyId();
	},

	logout : function() {
		this.clearLoginInfo();
		window.location.reload();
	},

	isAutoLogin : function(){
		var me = this;
		me.autoLogin = localStorage.getItem("autoLogin") || false;
		return me.autoLogin;
	},
	
	getSakiPos : function() {
		var me = this;
		me.sakiPos = 'localStroage';
		return me.sakiPos;
	},
	
	getLoginUser : function() {
		var me = this;
		var luStr = localStorage.getItem('loginUser');
		me.loginUser = $.parseJSON(luStr);
		return me.loginUser;
	},

	getLoginName : function() {
		var me = this;
		me.loginUserName = localStorage.getItem('loginName') || 'Guest';
		return me.loginUserName;
	},
	
	getShowName : function() {
		var me = this;
		me.showName = localStorage.getItem('showName') || me.getLoginName();
		return me.showName;
	},

	getAccessKeyId : function() {
		var me = this;
		me.accessKeyId = $.cookie("accessKeyID");
		return me.accessKeyId;
	},

	getSecretAccessKeyId : function() {
		var me = this;
		var now = new Date();
		var saveTime = localStorage.getItem('secretAccessKeyIDSaveTime')
				|| new Date(0).getTime();

		var interval = now.getTime() - parseInt(saveTime);
		if (interval > me.avoidTime * 24 * 60 * 60 * 1000)
			localStorage.removeItem('secretAccessKeyID');
		me.secretAccessKeyID = localStorage.getItem('secretAccessKeyID') || 'none';

		return me.secretAccessKeyID;
	},

	clearLoginInfo : function() {
		this.clearLoginName();
		this.clearShowName();
		this.clearLoginUser();
		this.clearAccessKeyId();
		this.clearSecretAccessKeyID();
		this.changeSaki(false);
		this.init();
	},
	
	clearLoginUser : function() {
		sessionStorage.removeItem("loginUser");
		localStorage.removeItem("loginUser");
	},

	clearLoginName : function() {
		sessionStorage.removeItem("loginName");
		localStorage.removeItem("loginName");
	},
	
	clearShowName : function() {
		sessionStorage.removeItem("showName");
		localStorage.removeItem("showName");
	},

	clearAccessKeyId : function() {
		sessionStorage.removeItem("accessKeyID");
		localStorage.removeItem("accessKeyID");
		$.cookie("accessKeyID", null, {path:"/"});
	},

	clearSecretAccessKeyID : function() {
		sessionStorage.removeItem("secretAccessKeyID");
		localStorage.removeItem("secretAccessKeyID");
	},
	
	saveLoginUser : function(user) {
		localStorage.setItem("loginUser", $.toJSON(user));
	},

	saveLoginName : function(loginName) {
		var me = this;
		var saki = loginName || me.getLoginName();
		localStorage.setItem("loginName", saki);
	},
	
	saveShowName : function(showName) {
		var me = this;
		var saki = showName || me.getLoginName();
		localStorage.setItem("showName", saki);
	},

	saveAccessKeyID : function(accessKeyID) {
		var me = this;
		var saki = accessKeyID || me.getAccessKeyId();
		if (me.isAutoLogin() == "true") {
			$.cookie("accessKeyID", saki, {expires : me.avoidTime, path: "/"});
		} else {
			$.cookie("accessKeyID", saki, {path: "/"});
		}
	},

	saveSecretAccessKeyID : function(secretAccessKeyID) {
		var me = this;
		var saki = secretAccessKeyID || me.getSecretAccessKeyId();
		localStorage.setItem("secretAccessKeyID", saki);
		localStorage.setItem("secretAccessKeyIDSaveTime", new Date()
				.getTime());
	},

	/**
	 * 改变自动登录状态
	 * @param autoLogin	{Boolean} 是否自动登录
	 */
	changeAutoLogin : function(autoLogin){
		localStorage.setItem("autoLogin", autoLogin);
		this.autoLogin = autoLogin;
	},
	
	changeSaki : function(isSave) {
		
		
		localStorage.setItem("Soul.sakiPos", 'localStorage');
	}
};

//读取CAS信息
/** 暂时屏蔽，等待全部联调打开
(function() {
	if (SureAuthInfo.getLoginName() == "Guest") {
		SureAjax.ajax({
		url : "/cas/" ,
		type : 'GET',
		headers : {
			Accept : 'application/json',
		},
		success : function(res) {
			
			var loginInfo = res;
			SureAuthInfo.saveLoginName(loginInfo.userName);
			SureAuthInfo.saveAccessKeyID(loginInfo.accessKeyId);
			SureAuthInfo.saveSecretAccessKeyID(loginInfo.secretAccessKeyId);
			SureAuthInfo.saveShowName(loginInfo.fullName);
			SureAuthInfo.saveLoginUser(loginInfo.loginUser);
		},
		error : function(res) {
		//	SureMsg.hideLoadBar();
		//	SureMsg.parseResponse(res);
		}
	});
	}
}());
**/
