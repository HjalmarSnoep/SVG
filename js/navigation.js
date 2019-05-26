/*
	header 
*/
(function()
{
	
	var nav=document.getElementById("nav");
	var active=nav.getAttribute("data-active");
	console.log("active menu item: "+active);
	var menu=document.createElement("div");
	menu.className="menu";
	nav.appendChild(menu);
	var items=[];
	items.push({label: "SVG", url: "index.html", help: "Over SVG - inhoud"});
	items.push({label: "Voorbeelden", url: "uses.html", help: "Wat zijn de voordelen van het gebruik van SVG en hoe wordt het vaak gebruikt?"});
	items.push({label: "Maken/Vinden", url: "creating.html", help: "Waar vind ik SVGs? en als ik het niet kan vinden, hoe maak ik ze?"});
	items.push({label: "Lessen", url: "lesson01.html", help: "Wat je moet weten om goed met SVG te kunnen werken"});
	items.push({label: "Libraries", url: "libraries.html", help: "Libraries voor SVG die je kunnen helpen"});
	
	
	var active_dom=null;
	for(var i=0;i<items.length;i++)
	{
		var item=document.createElement("a");
		item.href=items[i].url;
		item.innerHTML=items[i].label;
		item.title=items[i].help + " op "+items[i].url;
		if(items[i].label.toLowerCase()==active.toLowerCase())
		{
			var active_dom=item;
			item.className="active";
		}
		menu.appendChild(item);
	}
	
})();