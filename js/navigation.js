/*
	header 
*/
window.onload=function()
{
	     var nav = document.getElementById("nav");
	var active = nav.getAttribute("data-active");
	console.log("active menu item: " + active);

	var items = [];
	items.push({ label: "SVG", url: "index.html", help: "Over SVG - inhoud" });
	items.push({ label: "Voorbeelden", url: "uses.html", help: "Wat zijn de voordelen van het gebruik van SVG en hoe wordt het vaak gebruikt?" });
	items.push({ label: "Maken/Vinden", url: "creating.html", help: "Waar vind ik SVGs? en als ik het niet kan vinden, hoe maak ik ze?" });
	items.push({ label: "Lessen", url: "lesson01.html", help: "Wat je moet weten om goed met SVG te kunnen werken" });
	items.push({ label: "Libraries", url: "libraries.html", help: "Libraries voor SVG die je kunnen helpen" });

	function createNSNode(n, v) {
	  n = document.createElementNS("http://www.w3.org/2000/svg", n);
	  for (var p in v)
	  n.setAttributeNS(null, p.replace(/[A-Z]/g, function (m, p, o, s) {return "-" + m.toLowerCase();}), v[p]);
	  return n;
	}

	var menu = createNSNode("svg", { width: "100%", height: "70" });
	menu.className = "menu";
	nav.appendChild(menu);
	menu.className = "menu";
	// create at the right width..
	var w = menu.getBoundingClientRect().width;

	var defs = createNSNode('defs');
	defs.innerHTML = '<filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"></feGaussianBlur><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo"></feColorMatrix><feComposite in="SourceGraphic" in2="goo" operator="atop"></feComposite></filter>';
	menu.appendChild(defs);
	var textgroup = createNSNode('g');
	var activegroup = createNSNode('g', {filter: "url(#goo)", fill:"#f57f17" });
	menu.appendChild(activegroup);
	var rect = createNSNode('rect', { x: 0, y: 70, width: "100%", height: "100" });
	activegroup.appendChild(rect);
	menu.appendChild(textgroup);
	var total_text_width=0;
	var textSize=20;
	if(w<700) textSize=12;
	for (var i = 0; i < items.length; i++)
	{
	  items[i].text= createNSNode('text', { x: 0, y: 40, fontSize: textSize,fontFamily: "Montserrat, sans-serif" , fill: "#f57f17"});
	  items[i].text.innerHTML = items[i].label;
	  textgroup.appendChild(items[i].text);
	  var bbox = items[i].text.getBBox();
	  items[i].text_w=bbox.width;
	  total_text_width+=items[i].text_w;
	  
	  items[i].over= createNSNode('rect', { cx: 0, cy: 0, width:100, height:70,fill:"fff", fillOpacity:"0" });
	  var title=createNSNode("title");
	  title.innerHTML="<title>"+ items[i].help+"</title>"
	  items[i].over.appendChild(title);
	  textgroup.appendChild(items[i].over);
	  
	}

	var margin=70;// we need 30 pixels left and right.
	var over=w-total_text_width-margin*2; 
	var between_texts=over/(items.length-1);
	if(between_texts<0) between_texts=0;
	var x=margin;
	for (var i = 0; i < items.length; i++)
	{
		items[i].text.setAttribute("x",x);
		items[i].over.setAttribute("x",x-between_texts*0.15);
		items[i].over.setAttribute("width",items[i].text_w+between_texts*0.3);
		items[i].over.id="menu-"+i;
		items[i].over.style.cursor="pointer";
		items[i].over.addEventListener("pointerover",overMenu);
		items[i].over.addEventListener("pointerout",outMenu);
		items[i].over.addEventListener("click",clickMenu);
		items[i].x=x+items[i].text_w/2;
		x+=items[i].text_w+between_texts;
	// now properly align the texts..
	}
	var blobgroups=[];
	for (var i = 0; i < items.length; i++)
	{
		// create the blobs for each item.
		blobgroups[i]={};
		var text=items[i].text;  
		var x=items[i].x;
		var y=60;
		blobgroups[i].dy=0;
		blobgroups[i].r=0;
		blobgroups[i].dr=0;
		if (items[i].label.toLowerCase() == active.toLowerCase())
		{
			text.classList.add("active");
			text.setAttribute("fill","#fff");
			blobgroups[i].r=0;
			blobgroups[i].dr=-2;
			// create the active rectangle underneath!
		}
		blobgroups[i].x=x;
		blobgroups[i].y=y;

		blobgroups[i].group = createNSNode('g',{transform: "translate("+items[i].x+","+y+")"});
		
   		var balloon_w=items[i].text_w+50;
		var rect = createNSNode('rect', { x: 0 - balloon_w*0.25, y: 10, width: balloon_w*0.5, height: "75" });
    	rect.id = "active-stalk-"+i;
		blobgroups[i].group.appendChild(rect);
		blobgroups[i].stalk=rect;
		
		var rect = createNSNode('rect', { x: 0 - balloon_w/2, y: 10, width: balloon_w, height: "45" ,rx:"20",rx:"20" });
		rect.id = "active-blob-"+i;
		blobgroups[i].group.appendChild(rect);
		blobgroups[i].blob=rect;
		
		activegroup.appendChild(blobgroups[i].group);
	}
	function redistributeMenu()
	{
		var w = menu.getBoundingClientRect().width;
		var over=w-total_text_width-margin*2; 
		var between_texts=over/(items.length-1);
		if(between_texts<0) between_texts=0;
		var x=margin;
		for (var i = 0; i < items.length; i++)
		{
			items[i].text.setAttribute("x",x);
			items[i].over.setAttribute("x",x-between_texts*0.15);
			items[i].x=x+items[i].text_w/2;
			blobgroups[i].x=items[i].x;
			x+=items[i].text_w+between_texts;
		}
	}
	function overMenu(ev)
	{
		var nr=parseInt(ev.currentTarget.id.split("-")[1]);

		if (items[nr].label.toLowerCase() != active.toLowerCase())
		{
			items[nr].text.style.fill="#ffb04c";
			blobgroups[nr].dy=-2.5;
			blobgroups[nr].dr=3*(Math.random()-0.5);
			blobgroups[nr].dy*=0.9;
			blobgroups[nr].dr*=0.9;
		}

	}
	function outMenu(ev)
	{
		var nr=parseInt(ev.currentTarget.id.split("-")[1]);
		if (items[nr].label.toLowerCase() != active.toLowerCase())
		{
			items[nr].text.style.fill="#f57f17";
			blobgroups[nr].dy=0;
			blobgroups[nr].dr*=0.9;
		}
	}
	function clickMenu(ev)
	{
		var nr=parseInt(ev.currentTarget.id.split("-")[1]);
		location.href=items[nr].url;
	}
	window.addEventListener("resize",redistributeMenu);
	animate();
	function animate()
	{
		for (var i = 0; i < items.length; i++)
		{
			var x=blobgroups[i].x;
			blobgroups[i].y+=blobgroups[i].dy;
			if (items[i].label.toLowerCase() != active.toLowerCase())
			{
				blobgroups[i].dy+=0.05;
			}else
			{
				blobgroups[i].dy-=0.01;
			}
			if(blobgroups[i].y>60){
				blobgroups[i].y=60;
				blobgroups[i].dy=-Math.abs(blobgroups[i].dy)*0.2;
				blobgroups[i].r*=0.5;
				blobgroups[i].dr*=0.5;
			}
			if(blobgroups[i].y<0){
				blobgroups[i].y=0;
				blobgroups[i].dy=Math.abs(blobgroups[i].dy)*0.2;
				blobgroups[i].r*=0.5;
				blobgroups[i].dr*=0.5;
			}
			var y=blobgroups[i].y;
			blobgroups[i].group.setAttribute("transform", "translate("+x+","+y+")");
			
			blobgroups[i].blob.setAttribute("transform", "rotate("+blobgroups[i].r+")");
			blobgroups[i].r+=blobgroups[i].dr;
			if(blobgroups[i].r>0)
			{
				blobgroups[i].dr-=0.1;
			}else{
				blobgroups[i].dr+=0.1;
			}
			blobgroups[i].dr*=0.9;
			
		}
		window.requestAnimationFrame(animate);
	}

	
	// now create the table of contents dynamically :)
	var toc=document.createElement("div");
	toc.id="table-of-contents";
	document.getElementById("page").appendChild(toc);
	var section=document.createElement("section");
	section.innerHTML="<h2>Table of contents</h2>";
	toc.appendChild(section);
	var list=document.createElement("ul");
	section.appendChild(list);
	var h2=document.getElementById("content").getElementsByTagName("h2");
	var elements_found=0;
	for(var i=0;i<h2.length;i++)
	{
		console.log("h2: "+ h2[i].parentNode);
		if(h2[i].parentNode.className=="heading") continue; // skip heading titles..
		if(h2[i].className=="not-toc") continue; // skip heading titles..
		
		var li=document.createElement("li");
		var a=document.createElement("a");
		li.appendChild(a);
		a.innerHTML=h2[i].innerHTML;
		h2[i].id="h2"+i;
		a.href="#h2"+i;
		list.appendChild(li);
		elements_found++;
	}
	if(elements_found==0)
	{
		// hide the toc
		toc.style.display="none";
	}else{
		// display..
	}
	document.addEventListener("scroll",updateTOC);
	function updateTOC()
	{
		// first make it sticky.
		var html = document.documentElement || document.body; 
		console.log("scroll"+html.scrollTop);
		var shift=html.scrollTop-50;
		if(shift<15)shift=15;
		section.style.marginTop=shift+"px";
	}
	
}