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




/**
 *
 * @param msg descriptor of password store
 * @param name name of directory or message 'All passwords'
 * @param fullPath full path to the directory (for generating full path to password for `pass show`)
 * @param textTitle node for title in the popup window
 * @param divNew div for showing the content of directory
 * @param filterText text for filtering name of directory and password's names
 * @param searcher div for search elements
 */
function showDirectory (msg,name,parent,fullPath,textTitle,divNew,filterText,searcher)
{
    textTitle.nodeValue=name;
    divNew.innerHTML='';
    if (parent)
    {
	     //This is a directory parent
	var divNew2=document.createElement ('div');
	divNew2.className="dir"
    	var textNew=document.createTextNode ('..');
  	divNew2.appendChild (textNew);
        divNew2.addEventListener ('click',parent);
	divNew.appendChild (divNew2);
	searcher.style.display='none';
    } else
    {
	searcher.style.display='block';
	
    }
    var msgFilters;
    for (item in msgFilters=msg.sort (sortDirAndPasswords).filter (function (arg) {
	if ((typeof arg=="string")&&(arg.substr(0,filterText.length)==filterText)) return true;
	if (arg[0].substr(0,filterText.length)==filterText) return true;
	return false;
    }))
    {
	v=msgFilters[item]
	if (typeof v=="string")
	{
	    //show Password Description
 	   var divNew2=document.createElement ('div')
	   textNew=document.createTextNode (v)
           divNew2.appendChild (textNew)
            divNew2.className="file";
	    (function ()
	     {
		 var path=((fullPath=="")?"":(fullPath+'/'))+v
	         divNew2.addEventListener ('click',function(){
                     chrome.extension.sendMessage({command:"show",path:path},function (msg)
						  {
							if (msg.Error) {
								alert (msgError);
								return false;
									
							}
						      var copyDiv = document.createElement('div');
						      copyDiv.contentEditable = true;
						      document.body.appendChild(copyDiv);
						      copyDiv.innerHTML = msg.Password;
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
	   divNew.appendChild (divNew2)
	} else
	{
	     //This is a directory
 	     var divNew2=document.createElement ('div')
	     divNew2.className="dir"
    	     textNew=document.createTextNode (v[0]);
  	     divNew2.appendChild (textNew);
	    (function(dirDescription) {
		var description=dirDescription.slice(0) //clone
		var nameLocal=description.shift();
		var path=((fullPath=="")?"":(fullPath+'/'))+nameLocal
  	        divNew2.addEventListener ('click',function (){
		    showDirectory (description,nameLocal,function () {showDirectory (msg,name,parent,fullPath,textTitle,divNew,filterText,searcher)},path,textTitle,divNew,"",searcher)
	        })
	    }(v))
             divNew.appendChild (divNew2)

	 }
    }
     
}

document.addEventListener('DOMContentLoaded', function () {

    var div=document.getElementById('passwordslist');
    div.innerHTML='';
    var h3=document.createElement('h3');
    var textTitle=document.createTextNode("");
    h3.appendChild(textTitle);
    div.appendChild(h3);
    divNew=document.createElement ('div')
 	var divSearch=document.createElement ('div');
	var textNew=document.createTextNode ('Search: ');
  	divSearch.appendChild (textNew);
	//             divNew.addEventListener ('click',parent)
	var edit=document.createElement ('input')
	edit.type='text'
	divSearch.appendChild (edit)
	div.appendChild (divSearch);
    div.appendChild (divNew)


    
      chrome.extension.sendMessage("ls",function (msg)
				 {
					if (msg.Error)
					{
						alert (msg.Error);
						return false;
					}
//					alert (Object.keys(msg.Ls))
//
//					recoding in old format
					
					var msg2=recode(msg.Ls)
//					alert (msg)
				     	edit.addEventListener ('input',function () {filter(msg2,edit,textTitle,divNew,divSearch)})
				     	showDirectory (msg2,'All passwords',null,'',textTitle,divNew,"",divSearch);
				     	return true;
				 })
})

function recode(msgObject)
{
	var result=[]
//	alert (Object.keys(msgObject))
	for (var name in msgObject)
	{
	//	alert (name)
		if (msgObject[name]===null) { result.push(name) }else
		{
			var arr = recode(msgObject[name])
			arr.unshift (name)
			result.push (arr)
		}
	}
	return result
}


function filter(msg,edit,textTitle,divNew,searcher)
{
    showDirectory (msg,(edit.value=="")?"All passwords":'Filter by '+edit.value,null,'',textTitle,divNew,edit.value,searcher);
}
