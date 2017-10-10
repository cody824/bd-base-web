SureConfig = {
	loadBaseConfig : function(productName, callbackFn) {
		$.ajax({
			type : "GET",
			dataType : 'json',
			url : "/globalconfig/baseConfig/" + productName,
			success : function(baseConfig) {
				callbackFn(baseConfig);
			},
		});
	},

	/**
	 * 获取APPID
	 * @param fetch 是否从后台读取
	 * @returns
	 */
    getAppId : function(fetch) {
    	var appId = localStorage.getItem("APPID");
    	fetch = false || fetch;
    	if (appId == null || fetch) {
    		$.ajax({
    			type : "GET",
    			dataType : 'json',
    			async : false,
    			url : "/config/appId",
    			success : function(ret) {
    				appId = ret.appId;
    				localStorage.setItem("APPID", appId);
    			}
    		});
		}
    	APPID = appId;
        return appId;
    },

    getWSUrl : function() {
    	return SURE.getConfigValue("baseConfig", SureConfig.getAppId(), 'WSUrl');
    },
};
