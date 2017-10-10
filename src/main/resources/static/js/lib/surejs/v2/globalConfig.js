/**
 * 获取全局配置的客户端库，保存在sessionStorage中
 * 
 * @author guodong
 * 
 */

!(function(window, $){
	'use strict';
	
	var _config_url = '/globalconfig/';

	window.SURE = {
			GLOBALCONFIG : new Object(),
			/**
			 * 从服务起获取全局配置
			 * @param update 是否更新服务器中配置
			 */
			fetchConfig : function(update) {
				var me = this;
				SureAjax.ajax({
					url : _config_url,
					async : false,
					data : {
						fetch : update || false
					},
					parseError : false,
					success : function(data) {
						SURE.saveGlobalConfig(data, me);
					}
				});
			},
			
			saveGlobalConfig : function(data, scope){
				SURE.GLOBALCONFIG = data;
				sessionStorage.setItem("Sure.GLOBALCONFIG", $.toJSON(data));
			},
			/**
			 * 获取全局配置
			 * @returns 全局配置
			 */
			getGlobalConfig : function(){
				var global = sessionStorage.getItem("Sure.GLOBALCONFIG");
				if (global == null) {
					SURE.fetchConfig(false);
					global = sessionStorage.getItem("Sure.GLOBALCONFIG");
				}
				SURE.GLOBALCONFIG = $.parseJSON(global);
				return SURE.GLOBALCONFIG;
			},
			
			/**
			 * 获取配置库
			 * @param configType
			 * @return configType对应的配置库/不存在返回null
			 */
			getConfigRepo : function(configType){
				var globalConfig = SURE.getGlobalConfig();
				var configRepo = null;
				if (globalConfig != null && 
						globalConfig.hasOwnProperty("configRepos") &&
						globalConfig["configRepos"].hasOwnProperty(configType)) 
					configRepo = globalConfig["configRepos"][configType];
				return configRepo;
					
			},
			
			/**
			 * 获取domain对应的配置
			 * @param configType
			 * @param domain
			 * @return configType类型下domain域的配置
			 */
			getConfigProperties : function(configType, domain){
				var config = null;
				var configRepo = SURE.getConfigRepo(configType);
				if (configRepo != null && 
						configRepo.hasOwnProperty("configs") &&
						configRepo["configs"].hasOwnProperty(domain))
					config = configRepo["configs"][domain];
				return config;
			},
			
			/**
			 * 获取key对应配置值
			 * @param configType
			 * @param domain
			 * @param key
			 */
			getConfigValue : function(configType, domain, key){
				var value = null;
				var config = SURE.getConfigProperties(configType, domain);
				if (config != null && config.hasOwnProperty(key))
					value = config[key];
				return value;
			},
			
			/**
			 * 获取配置
			 * @param configType 配置类型，如果为null，返回全局配置，
			 * @param domain     配置域，如果为null， 返回配置库
			 * @param key		 配置key，如果为null，返回配置
			 * @returns  全局配置/配置库/配置/配置值
			 */
			getConfig : function(configType, domain, key){
				var globalConfig = SURE.getGlobalConfig();
				configType = configType || null;
				if (configType == null)
					return globalConfig;
				var configRepo = SURE.getConfigRepo(configType);
				domain = domain || null;
				if (domain == null)
					return configRepo;
				var config = SURE.getConfigProperties(configType, domain);
				key = key || null;
				if (key == null)
					return config;
				
				return SURE.getConfigValue(configType, domain, key);
			},
			
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
				window.APPID = appId;
		        return appId;
		    },
		    
		    getWSUrl : function() {
		    	return SURE.getConfigValue("baseConfig", SureConfig.getAppId(), 'WSUrl');
		    }
		};
}(window, jQuery));