var loading = false; //Flag loading list of passwords
var passwordList="";
var port = chrome.runtime.connectNative('com.zx2c4.pass');
      function loadpasswords(f_callback)
      {
//        var port = chrome.runtime.connectNative('com.zx2c4.pass');
          port.onMessage.addListener(function(msg) {
		passwordList=msg;
 	      f_callback (msg)
	      return true;
        });
        port.onDisconnect.addListener(function() {
        });
          port.postMessage({ command: "ls" });
      }

      function loadonepassword(path,f_callback)
      {
//        var port = chrome.runtime.connectNative('com.zx2c4.pass');
          port.onMessage.addListener(function(msg) {
	      f_callback (msg)
	      return true;
        });
        port.onDisconnect.addListener(function() {
        });
          port.postMessage({ command: "show",path: path });
      }

chrome.extension.onMessage.addListener(function(data, sender,f_callback) {
    if (data=="ls") {
//	console.log(f_callback);
        if (!loading) 
	{
		loadpasswords(f_callback);
		loading=true;
	}
	else f_callback (passwordList);
	return true;
    }
    if (data.command=="show")
    {
	loadonepassword (data.path,f_callback);
	return true;
    }
});
