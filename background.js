var loading = false; //Flag loading list of passwords
var passwordList="";
var port = chrome.runtime.connectNative('com.zx2c4.pass');
      function loadpasswords(f_callback)
      {
	      var f,f2;
//        var port = chrome.runtime.connectNative('com.zx2c4.pass');
          port.onMessage.addListener(f=function(msg) {
		port.onMessage.removeListener (f)
		port.onDisconnect.removeListener (f2)
		passwordList=msg;
 	      f_callback (msg)

	      return true;
        });
        port.onDisconnect.addListener(f2=function() {
        });
          port.postMessage({ Command: "ls" });
      }

      function loadonepassword(path,f_callback)
      {
//        var port = chrome.runtime.connectNative('com.zx2c4.pass');
//        var f,f2;
          port.onMessage.addListener(f=function(msg) {
		port.onMessage.removeListener (f)
		port.onDisconnect.removeListener (f2)
	      f_callback (msg)
	      return true;
        });
        port.onDisconnect.addListener(f2=function() {
        });
          port.postMessage({ Command: "show",Path: path });
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
