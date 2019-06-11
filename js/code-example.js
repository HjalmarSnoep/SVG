"use strict";

window.addEventListener('DOMContentLoaded', (event) => {

	/* handling live code examples on page.. */
	
	hljs.initHighlightingOnLoad(); // init highlight..

	// formatter or indentation functions..
	function formatXML(input,indent)
	{
	  indent = indent || '\t'; //you can set/define other ident than tabs
	  //PART 1: Add \n where necessary
	  var xmlString = input.replace(/^\s+|\s+$/g, '');  //trim it (just in case) {method trim() not working in IE8}
	  xmlString = input
					   .replace( /(<([a-zA-Z]+\b)[^>]*>)(?!<\/\2>|[\w\s])/g, "$1\n" ) //add \n after tag if not followed by the closing tag of pair or text node
					   .replace( /(<\/[a-zA-Z]+[^>]*>)/g, "$1\n") //add \n after closing tag
					   .replace( />\s+(.+?)\s+<(?!\/)/g, ">\n$1\n<") //add \n between sets of angled brackets and text node between them
					   .replace( />(.+?)<([a-zA-Z])/g, ">\n$1\n<$2") //add \n between angled brackets and text node between them
					   .replace(/\?></, "?>\n<") //detect a header of XML

	  var xmlArr = xmlString.split('\n');  //split it into an array (for analise each line separately)
	  //PART 2: indent each line appropriately
	  var tabs = '';  //store the current indentation
	  var start = 0;  //starting line
	  if (/^<[?]xml/.test(xmlArr[0]))  start++;  //if the first line is a header, ignore it
	  for (var i = start; i < xmlArr.length; i++) //for each line
	  {  
		var line = xmlArr[i].replace(/^\s+|\s+$/g, '');  //trim it (just in case)
		if (/^<[/]/.test(line))  //if the line is a closing tag
		 {
		  tabs = tabs.replace(indent, '');  //remove one indent from the store
		  xmlArr[i] = tabs + line;  //add the tabs at the beginning of the line
		 }
		 else if (/<.*>.*<\/.*>|<.*[^>]\/>/.test(line))  //if the line contains an entire node
		 {
		  //leave the store as is
		  xmlArr[i] = tabs + line; //add the tabs at the beginning of the line
		 }
		 else if (/<.*>/.test(line)) //if the line starts with an opening tag and does not contain an entire node
		 {
		  xmlArr[i] = tabs + line;  //add the tabs at the beginning of the line
		  tabs += indent;  //and add one indent to the store
		 }
		 else  //if the line contain a text node
		 {
		  xmlArr[i] = tabs + line;  // add the tabs at the beginning of the line
		 }
	  }
	  //PART 3: return formatted string (source)
	  return  xmlArr.join('\n');  //rejoin the array to a string and return it
	}

	// formatter functions..
	function formatJS(input,indent)
	{
		indent = indent || '\t'; //you can set/define other ident than tabs
		var dent=0;
		var lines=input.split("\n");
		// step 1 split into lines, remove indentation
		for(var i=lines.length-1;i>=0;i--)
		{
			lines[i]=lines[i].trim();
			if(lines[i]=="") lines.splice(i,1);
		}	
		for(var i=0;i<lines.length;i++)
		{	
			var dent_increase_after=0;
			var c=lines[i].charAt(0);
			switch(c)
			{
				case "{":
					dent_increase_after=1;
					//console.log(lines[i]+" "+dent);
				break;
				case "}":
					dent--;
					if(dent<0) dent=0;
					//console.log(dent);
				break;
			}
			var str="";
			for(var d=0;d<dent;d++)
			{
				str+=indent;	
			}
			str+=lines[i];
			lines[i]=str;
			dent+=dent_increase_after;
		}
		return lines.join("\n");
	}
	// now let's do something for everything marked class example..

    var examples=document.getElementsByClassName("example");
    for(var e=0;e<examples.length;e++)
    {
        // copy stuff with highlighter script
        var interactive_example=examples[e];
   	    console.log("example found: "+interactive_example.id);
		var svgs=interactive_example.getElementsByTagName("svg");
   	    console.log("svgs foundin example: "+svgs.length);
		for(var s=0;s<svgs.length;s++)
		{
			// create show code toggle.
			var id="svg"+e+"_"+s;

			var toggle=document.createElement("div");
			toggle.className="toggle closed";
			toggle.innerHTML="Show SVG code";
			toggle.id=id;
			toggle.addEventListener("click",toggleCodeVisibility);
			interactive_example.appendChild(toggle);
			
			var svg=interactive_example.getElementsByTagName("svg")[s].outerHTML;
			var code=document.createElement("code");
			var pre=document.createElement("pre");
			
			pre.appendChild(code);
			pre.style.maxHeight="0px";
//			pre.style.display="none";
			pre.id="code-for-"+id;
			interactive_example.appendChild(pre);
			
			code.innerText=formatXML(svg,"    ");
			//code.setAttribute("contenteditable","true");
			code.className="svg";
			hljs.highlightBlock(code);
		}
		var scripts=interactive_example.getElementsByTagName("script");
		 console.log("scripts foundin example: "+svgs.length);
		for(var s=0;s<scripts.length;s++)
		{
			var id="js"+e+"_"+s;
			var toggle=document.createElement("div");
			toggle.className="toggle closed";
			toggle.innerHTML="Show Javascript code";
			toggle.id=id;
			toggle.addEventListener("click",toggleCodeVisibility);
			interactive_example.appendChild(toggle);

			var js=scripts[s].innerHTML;
			js=js.split("(function(){").join("");
			js=js.split("})();").join("");
			var pre=document.createElement("pre");
			var code=document.createElement("code");
			
			pre.appendChild(code);
			pre.style.maxHeight="0px";
			pre.id="code-for-"+id;
			interactive_example.appendChild(pre);
			
			code.innerText=formatJS(js,"    ");
			code.className="javascript";
			//code.setAttribute("contenteditable","true");
			hljs.highlightBlock(code);
		}
		var styles=interactive_example.getElementsByTagName("style");
		 console.log("styles foundin example: "+styles.length);
		for(var s=0;s<styles.length;s++)
		{
			var id="style"+e+"_"+s;
			var toggle=document.createElement("div");
			toggle.className="toggle closed";
			toggle.innerHTML="Show CSS code";
			toggle.id=id;
			toggle.addEventListener("click",toggleCodeVisibility);
			interactive_example.appendChild(toggle);

			var js=styles[s].innerHTML;
			var pre=document.createElement("pre");
			var code=document.createElement("code");
			
			pre.appendChild(code);
			pre.style.maxHeight="0px";
			pre.id="code-for-"+id;
			interactive_example.appendChild(pre);
			
			code.innerText=formatJS(js,"    ");
			code.className="javascript";
			//code.setAttribute("contenteditable","true");
			hljs.highlightBlock(code);
		}
             
		function toggleCodeVisibility(ev)			 
		{
			var toggle=ev.currentTarget;
			var id=toggle.id;
			console.log("id"+ id);
			var closed=toggle.classList.contains("closed");
			if(closed)
			{
				toggle.classList.remove("closed");
				toggle.innerHTML=toggle.innerHTML.split("Show").join("Hide");
				document.getElementById("code-for-"+id).style.maxHeight="200px";
//				document.getElementById("code-for-"+id).style.width="100%";
			}else{
				toggle.classList.add("closed");
				toggle.innerHTML=toggle.innerHTML.split("Hide").join("Show");
				document.getElementById("code-for-"+id).style.maxHeight="0px";
//				document.getElementById("code-for-"+id).style.width="0px";
//				document.getElementById("code-for-"+id).style.display="block";
			}
		}

/*				<pre><code class="svg" contenteditable="true"></code></pre>
              <pre><code class="javascript" contenteditable="true"></code></pre>*/
		
    }

});