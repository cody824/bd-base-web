
//建立一個可存取到該file的url
function getObjectURL(file) {
	var url = null;
	try{
		if (window.createObjectURL != undefined) {// basic
			url = window.createObjectURL(file);
		} else if (window.URL != undefined) { // mozilla(firefox)
			url = window.URL.createObjectURL(file);
		} else if (window.webkitURL != undefined) { // webkit or chrome
			url = window.webkitURL.createObjectURL(file);
		}else{
			url="";
		}
	} catch(e){
	}
	return url;
}

/**
 * 获取图片对象的Base64编码
 * @param img	图片对象
 * @returns
 */
function getBase64Image(img) {
      var canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
      var dataURL = canvas.toDataURL("image/png");
      return dataURL;
      // return dataURL.replace("data:image/png;base64,", "");
}