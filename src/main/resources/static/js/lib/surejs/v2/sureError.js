/**
 * Copyright 2015, Wuxi SOUL.
 * 
 * 错误码解析
 */
!(function(window, $){
	'use strict';
	
	/**
	 * TODO:此处增加错误对应的现实错误信息
	 */
	var ERROR_INFO = {
		'0': '执行成功',
		'65535' : '未知错误'
	},
	
	ERROR_NUM = {
		//base error
		NOT_EXIST : '-10000',                  //内容不存在
		STATUS_NOT_CHANGE : '-10001',          //状态不可更改
		EXISTED : '-10002',                    //内容已存在
		PARAM_IS_ERROR : '-10003'             //参数不正确
	},
	
	LABEL = {
		abnormal : '异常',
		operation : '操作',
		about : '关于',
		add : '添加',
		admin : '系统管理员',
		advanced : '高级',
		apply : '应用',
		auto : '自动',
		autoPageSize : '自动分页',
		cancel : '取消',
		cannotOpretion : '不可操作',
		caseSensitive : '大小写敏感',
		close : '关闭',
		complete : '完成',
		copy_error : '复制错误',
		create : '新建',
		createTask : '新建任务',
		day : '天',
		del : '删除',
		detail : '详细模式',
		diskInfo : '磁盘信息',
		domainName : '域名',
		force : '强制',
		encloseInfo : '盘柜信息',
		enclosureSelect : '磁盘柜选择',
		error : '错误',
		errorNum : '错误码',
		errorType : '错误类型',
		errorDesc : '错误描述',
		errorDetail : '错误详细信息',
		executeSuccess : '执行成功',
		executing : '执行中',
		failure : '失败',
		formIsInvalid : '提交参数有误，请检查输入选项',
		funcModule : '功能模块',
		get_task_status_error : '获取任务进程失败',
		grid : '表格模式',
		dataView : '视图模式',
		group : '组',
		help : '帮助',
		hide : '隐藏',
		host : '主机',
		hostName : '主机名',
		hour : '小时',
		image : '图形模式',
		in_backgroubd : '后台运行',
		info : '信息',
		infoPanel : '对象信息',
		inputRightIP : '请输入正确的IP地址',
		invailedUser : '无效用户',
		ioStatus : 'IO状态',
		keyword : '关键字',
		language : '语言',
		load : '载入',
		login : '登录',
		logining : '登录中',
		logout : '注销',
		macInfo : '主机信息',
		masterEnc : '主柜',
		masterEnc2 : '主柜（B）',
		matchFound : '个匹配的对象',
		minute : '分',
		model : '型号',
		moduleLoading : '模块载入中',
		must_input_number : '必须输入数字！',
		name_required : '必须输入名称',
		navigation : '导航菜单',
		newMsg : '最新消息',
		newPwd : '新密码',
		nextStep : '下一步',
		no : '否',
		noChineseAndSymbol : '请勿输入中文字符或符号',
		noInfoShow : '没有可显示对象信息',
		noMatchs : '无匹配项',
		normal : '正常',
		normalUser : '普通用户',
		note : '注意',
		nothing : '无',
		open : '开启',
		ok : '确定',
		overleap : '忽略',
		pageSize : '每页显示',
		paging : '分页显示',
		password : '密码',
		password_blankText : '密码必须输入',
		password_vtypeText : '两次输入密码必须一致',
		pleaseWait : '请等待',
		prevStep : '上一步',
		property : '属性',
		readOnlyProperty : '只读属性',
		reboot : '重启',
		regExp : '正则',
		reNewPwd : '重复新密码',
		report_error : '报告错误',
		reset : '重置',

		search : '搜索',
		searchHighlight : '高亮显示匹配项',
		selectModule : '选择模块',
		server_run_error : '请求服务运行错误！',
		setup : '设置',
		show : '查看',
		showAll : '显示全部',
		showPoolProperty : '显示存储池属性',
		showProperty : '显示属性',
		show_results : '查看结果',
		showSearchBar : '搜索工具栏',
		showWeclome : '显示欢迎界面',
		shutdown : '关机',
		slaveEnc : '扩展柜',
		slider : '调节',
		summary : '摘要模式',
		superUser : '超级用户',
		startTime : '开始时间',
		status : '状态',
		stop_task : '停止任务',
		stop : '停止',
		stopTime : '结束时间',
		task_complete : '执行成功',
		taskManager : '任务管理',
		task_results : '任务结果',
		time_format : 'Y年m月d日 A H:i:s',
		tip : '提示',
		unknownError : '未知错误',
		unSupport : '不支持',
		unPermOrUnOperable : '无权限或不可操作',
		update : '更新',
		updateData : '更新数据',
		user : '用户',
		userName : '用户名',
		authcode : '验证码',
		another : '换一张',
		rememberMe : '记住我的用户名',
		avoidLogin : '一周内免登陆',
		getSaki : '获取密钥',
		register : '注册',
		registering : '注册中',
		save : '保存',
		submit : '提交',
		success : '成功',
		viewSelect : '显示模式',
		warn : '警告',
		webConsole : '控制台',
		yes : '是',
		zfsSelect : '数据集选择',
		zpoolSelect : '存储池选择',
		zpoolZfsSelectFull : '选择存储池以及池中文件系统或者卷',
		userConfigInfo : '个人信息设置',
		tree_page_button_msg : '显示 {0} - {1}条，共 {2} 条',
		baseUserInfo : '个人基本信息',
		upload : '上传图片'
	};
	
	window.SureError = {
			
			 UNKNOWNERRNO : 65535,
			 
			/**
			 * 通过错误编码返回错误信息
			 * @param errorNum	错误编码
			 * @returns
			 */
			parseError : function (errorNum){
				if(ERROR_INFO[errorNum]) {
					return LABEL.errorNum+':'+errorNum+'!<br>'+
						LABEL.errorDesc+
						'<span style="color:red;">'+ERROR_INFO[errorNum] + '</span>';
				} else {
					if(errorNum == 0) {
						return LABEL.task_complete;
					} else {
						return '<span style="color:red;">' + errorNum + '</span>';
					}
				}
				
			}, 
			
			/**
			 * 解析错误信息
			 * @param error
			 * @returns {String}
			 */
			parseErrorMsg : function (error){
				var errorNum = SureError.UNKNOWNERRNO, 
					errorDesc = LABEL.unknownError;
				
				if (error.hasOwnProperty('errorNum'))
					errorNum = error.errorNum;

				var args = '';
				if (error.hasOwnProperty('errorArgs') && error.errorArgs instanceof Array && error.errorArgs.length > 0) {
					args = "String.format(ERROR_INFO[" + errorNum + "],";
					for(var i = 0 ; i < error.errorArgs.length; i++) {
						if(i == (error.errorArgs.length - 1))
							args += 'error.errorArgs[' + i + ']';
						else
							args += 'error.errorArgs[' + i + '],';
					}
					args +=")";
				} else if (errorNum != SureError.UNKNOWNERRNO){
					args = 'ERROR_INFO[' + errorNum + ']';
				}
				if (args.length > 0 ) {
					try{
						errorDesc = eval(args);
						if (!errorDesc)
							errorDesc = error.errorMsg;
					}catch(e){
						if (error.hasOwnProperty('errorMsg'))
							errorDesc = error.errorMsg;
					}
				} else if (args.length == 0 && error.hasOwnProperty('errorMsg')) {
					errorDesc = error.errorMsg;
				}
				/*return LABEL.errorNum + ':' + errorNum + '!<br>' + 
					LABEL.errorDesc + ':<span style="color:red;">' + errorDesc + '</span>';*/
				return  errorDesc;
			},
			
			/*
			 *通过传入的错误号，返回系统状态信息！
			 *
			*/
			parseSysStatus : function (sysStatus){
				if(ERROR_INFO[sysStatus.errorNum])
					return sysStatus.devName+":"+ERROR_INFO[sysStatus.errorNum];
				else{
					return sysStatus.devName+":"+sysStatus.errorNum;
				}
			}
		};

}(window, jQuery));
