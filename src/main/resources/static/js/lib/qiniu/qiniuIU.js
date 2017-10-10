function QiniuImageUtil(op) {
	
	op = op || {};

	this.qiniu = op.qiniu || null;
	
	/**
	 * @param rotate  旋转弧度(0-360)
	 * @param key qiniu存储文件的key
	 * @returns  裁减后图片的url,失败返回null
	 */
	this.rotate = function(rotate, key){
		var fopArr = [];
		fopArr.push({
			'fop' : 'imageMogr2',
			'strip' : true,
			'rotate' : rotate,
			'quality': 50
		});
		if (this.qiniu != null) {
			return this.qiniu.pipeline(fopArr, key);
		} else
			return null;
	};
	
	/**
	 * @param op
	 * 		scope 上传文件key
	 * 		persistentOps 预持久化处理参数
	 * 
	 * @param callback 执行成功后回调函数
	 */
	this.getUpdateToken = function(op, callback){
		SureAjax.ajax({
			url : '/qiniu/upToken',
			data : op,
			success : callback
		});
	};
	
	
	/**
	 * @param rotate  旋转弧度(0-360)
	 * @param offset  裁图的偏移
	 * 				属性有x,y,w,h
	 * @param key qiniu存储文件的key
	 * @returns  裁减后图片的url,失败返回null
	 */
	this.crop = function(rotate, offset,key){
		var fopArr = [];
		if (rotate % 360 != 0) {
			fopArr.push({
				'fop' : 'imageMogr2',
				'strip' : true,
				'rotate' : rotate
			});
		}
		
		if (offset.w > 0 && offset.h > 0) {
			fopArr.push({
				'fop' : 'imageMogr2',
				'strip' : true,
				'crop' : '!' + offset.w + 'x' + offset.h + 'a' + offset.x + 'a' + offset.y
			});
		}
		if (this.qiniu != null) {
			return this.qiniu.pipeline(fopArr, key);
		} else
			return null;
	};
	
	this.removeTmp = function(bucket, key){
		SureAjax.ajax({
			url : '/qiniu/' + bucket + '/' + key,
			type : 'delete',
			parseError : false
		});
	};

}