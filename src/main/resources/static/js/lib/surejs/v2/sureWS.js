/**
 * Sure WebSocket lib 
 * 
 * 	var WS = new SureWS({
 *		url : "ws://jms.soulinfo.com:61614/stomp",
 *		userId : userId,
 *		type : "activeMQ",
 *		noteUpdate : updateNoteCount,
 *		letterUpdate : updateLetterCount,
 *	});
 * WS.connect(); 
 * 
 */
function SureWS (options) {
	var me = this;
	
	var WSUrl = SureConfig.getWSUrl();
	
	options = options || {};
	/* 用户id */
	me.userId = options.userId;
	/* 扩展的订阅函数 */
	me.subscribe = options.subscribe || [];
	/* websocket 地址 */
	me.socketUrl = options.socketUrl || WSUrl ||"/SureWS/endpoint";
	me.url = options.url || WSUrl || "/SureWS/endpoint";
	/* 连接类型 activeMQ */
	me.type = options.type || "sockJS";
	/* 收到新通知 */
	me.noteUpdate = options.noteUpdate || function (){};
	/* 收到站内信 */
	me.letterUpdate = options.letterUpdate || function (){};

	/* 是否支持重连 */
	me.isReconnect = options.isReconnect || false;
	/* 最大重连次数 */
	me.maxReconnectCount = options.maxReconnectCount || -1;
	me.reconnectCount  = 0;
	
	var processMsg = function (message) {
		if (message.body == "")
			return;
		
		var m = JSON.parse(message.body);
		//console.log(m);
		switch (m.type) {
			case "note":
				me.noteUpdate(m.count);
				break;
			case "letter":
				me.letterUpdate(m.count);
			default:
				break;
		};
	};
	 
	me.connect = function() {
		switch (me.type) {
		case "sockJS" :
			me.socket = new SockJS(me.socketUrl);
			me.stompClient = Stomp.over(me.socket);
			break;
		case "activeMQ":
			me.stompClient = Stomp.client(me.url);
			break;
		default:
				return;
		}
		me.stompClient.connect({}, function(frame) {
			me.stompClient.subscribe("/queue/note." + me.userId, processMsg);
			me.stompClient.subscribe("/queue/letter." + me.userId, processMsg);
			for(var i = 0; i < me.subscribe.length; i ++ ) {
        		me.stompClient.subscribe(me.subscribe[i].url, me.subscribe[i].process);
        	}
          }, function(error) {
            if (me.isReconnect == true && (me.maxReconnectCount == -1 || 
            		me.reconnectCount < me.maxReconnectCount)) {
            	if(window.console){
            		console.log("Reconnect WS!");
            	}
            	me.close();
            	me.connect();
            	me.reconnectCount ++;
            } else {
            	if(window.console){
            		console.log("STOMP protocol error:" + error);
            	}
            }

          });
	};
	
	me.send = function(dest, data) {
		if (me.stompClient) me.stompClient.send(dest, {}, JSON.stringify(data));
	};
	
	me.close = function() {
		me.stompClient.disconnect();
	};
};