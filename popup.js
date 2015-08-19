/**
 * @param dp1 Directory or name of password
 * @param dp2 Directory or name of password
 *
 * if dp1 or dp2 is array then it is a directory, first item of the array is name of directory
 * if dp1 or dp2 is string then it is a password's name
 */
function sortDirAndPasswords (dp1,dp2)
{
    switch (typeof dp1)
    {
	case "string":
	switch (typeof dp2)
	{
	    case "string": return (dp1<dp2)?-1:(dp1==dp2)?0:1;
	    default: return -1; //"string" is password, passwords will on top of window
	}
	default:
	switch (typeof dp2)
	{
	    case "string": return 1;
	    default: return (dp1[0]<dp2[0])?-1:(dp1[0]==dp2[0])?0:1;
	}
	
    }
}

function showDirectory (msg,name,parent,fullPath)
{
    div=document.getElementById('passwordslist');
    div.innerHTML='';
    h3=document.createElement('h3')
    h3.appendChild(document.createTextNode(name))
    div.appendChild(h3)
    if (parent)
    {
	     //This is a directory parent
 	     divNew=document.createElement ('div')
	     divNew.className="dir"
    	     textNew=document.createTextNode ('..');
  	     divNew.appendChild (textNew);
             divNew.addEventListener ('click',parent)
             div.appendChild (divNew)
    }
    for (item in msg.sort (sortDirAndPasswords))
    {
	if (typeof(msg[item])=="string")
	{
	    //show Password Description
 	   divNew=document.createElement ('div')
	   textNew=document.createTextNode (msg[item])
           divNew.appendChild (textNew)
            divNew.className="file";
	    (function ()
	     {
		 var path=((fullPath=="")?"":(fullPath+'/'))+msg[item]
	         divNew.addEventListener ('click',function(){
                     chrome.extension.sendMessage({command:"show",path:path},function (msg)
						  {

						      var copyDiv = document.createElement('div');
						      copyDiv.contentEditable = true;
						      document.body.appendChild(copyDiv);
						      copyDiv.innerHTML = msg;
						      copyDiv.unselectable = "off";
						      copyDiv.focus();
						      document.execCommand('SelectAll');
						      document.execCommand("Copy", false, null);
						      document.body.removeChild(copyDiv);
						      window.close()
						  return true
				              })
		 })
             })()
	   div.appendChild (divNew)
	} else
	{
	     //This is a directory
 	     divNew=document.createElement ('div')
	     divNew.className="dir"
    	     textNew=document.createTextNode (msg[item][0]);
  	     divNew.appendChild (textNew);
	    (function(dirDescription) {
		var description=dirDescription.slice(0) //clone
		var nameLocal=description.shift();
		var path=((fullPath=="")?"":(fullPath+'/'))+nameLocal
  	        divNew.addEventListener ('click',function (){
		    showDirectory (description,nameLocal,function () {showDirectory (msg,name,parent,path)},path)
	        })
	    }(msg[item]))
             div.appendChild (divNew)

	 }
    }
     
}

document.addEventListener('DOMContentLoaded', function () {
      chrome.extension.sendMessage("ls",function (msg)
				 {
				     showDirectory (msg,'All passwords',null,'');
				     return true;
				 })
})



