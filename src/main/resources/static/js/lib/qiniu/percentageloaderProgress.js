/**
 * 单个图片上传进度显示
 * 
 * @param up			plupload对象
 * @param file			上传的file对象
 * @param progressBar	进度显示的bar
 * @returns
 */
function ImgProgress(up, file, progressBar) {
	var me = this;
	
	this.fileProgressID = file.id;
    this.file = file;
    this.fileProgressWrapper = progressBar;
    
    this.fileProgressWrapper.empty();
    this.loadingBar = this.fileProgressWrapper.percentageLoader({width: 64, height: 64, controllable : false, progress : 0, onProgressUpdate : function(val) {
    	me.loadingBar.setValue(Math.round(val * 100.0));
    }});
    
    this.loadingBar.children().children().eq(1).html("确定");
    
    this.loadingBar.unbind('click');
    this.loadingBar.bind('click', function(e){
    	up.start();
    	e.stopPropagation();
    });
    
    this.setProgress = function(percentage, speed) {
        var uploaded = file.loaded;
        var size = plupload.formatSize(uploaded).toUpperCase();
        //var formatSpeed = plupload.formatSize(speed).toUpperCase();
        this.loadingBar.setProgress(percentage);
        this.loadingBar.setValue(size);
        
    };

    this.destroy = function() {
        this.loadingBar.empty();
    };
    
    this.setComplete = function(up, info) {
        this.loadingBar.empty();
    };
}
