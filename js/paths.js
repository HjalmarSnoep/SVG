"use strict";
(function(){
	var palet={};
	
	palet.grid_normal="rgba(255,255,255,0.2)";
	palet.grid5="rgba(255,255,255,0.5)";
	palet.grid10="rgba(255,255,255,0.7)";
	var unique_id_counter=0;
	function ShowPath(dom)
	{
		this.str=dom.innerHTML;
		this.dragging=false;
		this.unique_id=unique_id_counter++;
//		console.log("body after: "+document.body.innerHTML);
		this.svg = createNSNode("svg", { width: "400", height: "400"});
		// Create an SVGPoint for future math
		this.pt = this.svg.createSVGPoint();
		// Get point in global SVG space
		this.svg.style.verticalAlign="top";
		this.path=createNSNode("path",{d:this.str,transform: "scale(6,6)", fill: "rgba(255,255,150,0.5)",stroke: "white"});
		this.grid=createNSNode("g",{class: "grid"});
		for(var i=0;i<67;i++)
		{
			var col=palet.grid5;
			if(i%10==0) col=palet.grid10;
			if(i%5!=0) col=palet.grid_normal;
			var line=createNSNode("line",{stroke: col,x1:0,x2:400,y1:i*6,y2:i*6});
			this.grid.appendChild(line);
			var line=createNSNode("line",{stroke: col,y1:0,y2:400,x1:i*6,x2:i*6});
			this.grid.appendChild(line);
		}
		this.controlLines=createNSNode("path",{stroke: "rgba(255,255,255,0.5)",fill: "none",strokeWidth:2});
		this.controls=createNSNode("g",{class: "controls"});
		this.svg.appendChild(this.grid);
		this.svg.appendChild(this.path);
		this.svg.appendChild(this.controlLines);
		this.svg.appendChild(this.controls);
		this.svg.addEventListener("pointerup",this.handleControlPoint.bind(this),false); // voorkomt dat punten blijven 'hangen'
		this.svg.addEventListener("pointercancel",this.handleControlPoint.bind(this),false); // voorkomt dat punten blijven 'hangen'
		this.svg.addEventListener("pointermove",this.handleControlPoint.bind(this),false); // voorkomt dat punten blijven 'hangen'
		this.svg.style.backgroundColor="#bc5100";
		this.list=document.createElement("div");
		this.list.style.display="inline-block";
		this.list.style.width="calc(100% - 410px)";
		this.list.style.height="400px";
		this.list.style.verticalAlign="top";
		this.list.style.backgroundColor="#f57f17";
		this.list.style.overflowY="scroll";
		this.list.style.paddingLeft="10px";

		this.showpath=document.createElement("div");
		dom.innerHTML="";
		this.showpath.innerHTML=this.str;
		dom.appendChild(this.svg);
		dom.appendChild(this.list);
		dom.appendChild(this.showpath);
		// analyse the path..
	//	console.log("analyse the path "+this.str);
		var command_strings=this.str.split(/(?=[A-Za-z])/)
//		console.log(command_strings);
		this.commands=[];
		this.list.innerHTML="";
		// We also create the controlpoints.
		// build commands from command strings.
		for(var i=0;i<command_strings.length;i++)
		{
			//console.log("command string "+last);
			// insert a new command.
			var c=command_strings[i].charAt(0);
			var last=command_strings[i];
			last=last.substr(1,last.length);
			last=last.trim();
			var parts=last.split(" ");
			var command={c:c,data:parts};
			this.commands.push(command);
		}
		
		// now we have the commands, rebuild List, Controlpoins, Path and showPath.
		this.rebuildList();
		this.rebuildPath();
		this.rebuildControls();
	}
	ShowPath.prototype.rebuildPath=function()
	{
		// build path from commands..
		var string="";
		var path="";
		var last_command="";
		for(var i=0;i<this.commands.length;i++)
		{
			path+=this.commands[i].c+" "+this.commands[i].data.join(" ")+" "; 
			if(last_command==this.commands[i].c)
			{
				string+='<span id="str|'+this.unique_id+"_"+i+'">'+this.commands[i].data.join(" ")+" </span>";
			}else{
				string+='<span id="str|'+this.unique_id+"_"+i+'">'+this.commands[i].c+this.commands[i].data.join(" ")+" </span>";
			}
			last_command=this.commands[i].c;
		}
		this.path.setAttribute("d",path);
		this.showpath.innerHTML='&lt;path d="'+string+'"/&gt;';
	};
	ShowPath.prototype.rebuildControls=function()
	{
		var pen={x:0,y:0};
		while (this.controls.firstChild) this.controls.removeChild(this.controls.firstChild);
		for(var i=0;i<this.commands.length;i++)
		{
			var command=this.commands[i];
			for(var d=0;d<command.data.length;d++)
			{
				// build the control point.
				switch(command.c)
				{
					case "M":
					case "L":
						if(d==1) // first coord
						{
							var p=this.createControlPoint(i,command.c+i,command.data[0],command.data[1]);
							p.setAttribute("x-controls",0); // data nummer.
							p.setAttribute("y-controls",1);// data nummer.

							this.controls.appendChild(p);
							pen.x=command.data[0];
							pen.y=command.data[1];
						}
					break;
					case "V":
						if(d==0) // half coord
						{
							var p=this.createControlPoint(i,"V"+i,pen.x,command.data[0]);
							this.controls.appendChild(p);
							p.setAttribute("y-controls",0); // data nummer.
							pen.y=command.data[0];
						}
					break;
					case "H":
						if(d==0) // half coord
						{
							var p=this.createControlPoint(i,"H"+i,command.data[0],pen.y);
							this.controls.appendChild(p);
							p.setAttribute("x-controls",0); // data nummer.
							pen.x=command.data[0];
						}
					break;
					case "C":
						if(d==5) // third coord
						{
							var p=this.createControlPoint(i,"C"+i+"-c1",command.data[0],command.data[1]);
							p.setAttribute("x-controls",0); // data nummer.
							p.setAttribute("y-controls",1);// data nummer.
							this.controls.appendChild(p);
							var p=this.createControlPoint(i,"C"+i+"-c2",command.data[2],command.data[3]);
							p.setAttribute("x-controls",2); // data nummer.
							p.setAttribute("y-controls",3);// data nummer.
							this.controls.appendChild(p);
							var p=this.createControlPoint(i,"C"+i,command.data[4],command.data[5]);
							p.setAttribute("x-controls",4); // data nummer.
							p.setAttribute("y-controls",5);// data nummer.
							this.controls.appendChild(p);
							pen.x=command.data[4];
							pen.y=command.data[5];
						}
					break;
					case "S":
						if(d==3) // second coord
						{
							var p=this.createControlPoint(i,"S"+i+"-c2",command.data[0],command.data[1]);
							p.setAttribute("x-controls",0); // data nummer.
							p.setAttribute("y-controls",1);// data nummer.
							this.controls.appendChild(p);
							var p=this.createControlPoint(i,"S"+i,command.data[2],command.data[3]);
							p.setAttribute("x-controls",2); // data nummer.
							p.setAttribute("y-controls",3);// data nummer.
							this.controls.appendChild(p);
							pen.x=command.data[2];
							pen.y=command.data[3];
						}
					break;									
					case "Q":
						if(d==3) // second coord
						{
							var p=this.createControlPoint(i,"c12",command.data[0],command.data[1]);
							p.setAttribute("x-controls",0); // data nummer.
							p.setAttribute("y-controls",1);// data nummer.
							this.controls.appendChild(p);
							var p=this.createControlPoint(i,"Q"+i,command.data[2],command.data[3]);
							p.setAttribute("x-controls",2); // data nummer.
							p.setAttribute("y-controls",3);// data nummer.
							this.controls.appendChild(p);
							pen.x=command.data[2];
							pen.y=command.data[3];
						}
					break;		
					case "T":
						if(d==1) // first coord
						{
							var p=this.createControlPoint(i,"T"+i,command.data[0],command.data[1]);
							p.setAttribute("x-controls",0); // data nummer.
							p.setAttribute("y-controls",1);// data nummer.
							this.controls.appendChild(p);
							pen.x=command.data[0];
							pen.y=command.data[1];
						}
					break;	
					case "A":
						if(d==6) // zesde coord
						{
							var p=this.createControlPoint(i,"A"+i,command.data[5],command.data[6]);
							p.setAttribute("x-controls",5); // data nummer.
							p.setAttribute("y-controls",6);// data nummer.
							this.controls.appendChild(p);
							pen.x=command.data[5];
							pen.y=command.data[6];
						}
					break;							
				}
			}
		}
		this.rebuildControlLines();
	};
	ShowPath.prototype.rebuildControlLines=function()
	{
		var pen={x:0,y:0};
		var smooth={x:0,y:0};
		var str="";
		
		for(var i=0;i<this.commands.length;i++)
		{
			var command=this.commands[i];
			for(var d=0;d<command.data.length;d++)
			{
				// build the control point.
				switch(command.c)
				{
					case "M":
					case "L":
						pen.x=command.data[0];
						pen.y=command.data[1];
					break;
					case "V":
						pen.y=command.data[0];
					break;
					case "H":
						pen.x=command.data[0];
					break;
					case "C":
						// create lines
						if(d==5)
						{
							str+="M"+pen.x*6+" "+pen.y*6+" L"+command.data[0]*6+" "+command.data[1]*6+" ";
							str+="M"+command.data[2]*6+" "+command.data[3]*6+" L"+command.data[4]*6+" "+command.data[5]*6+" ";
							pen.x=command.data[4];
							pen.y=command.data[5];
							smooth.x=command.data[2]-command.data[4];
							smooth.y=command.data[3]-command.data[5];
						}
					break;
					case "S":
						// create lines
						if(d==3)
						{
							str+="M"+pen.x*6+" "+pen.y*6+" ";
							str+="L"+(pen.x-smooth.x)*6+" "+(pen.y-smooth.y)*6+" ";
							
							str+="M"+command.data[0]*6+" "+command.data[1]*6+" ";
							str+="L"+command.data[2]*6+" "+command.data[3]*6+" ";
							pen.x=command.data[2];
							pen.y=command.data[3];
							smooth.x=command.data[0]-command.data[2];
							smooth.y=command.data[1]-command.data[3];
						}
					break;			
					case "Q":
						// create lines
						if(d==3)
						{
							str+="M"+pen.x*6+" "+pen.y*6+" L"+command.data[0]*6+" "+command.data[1]*6+" ";
							str+="L"+command.data[2]*6+" "+command.data[3]*6+" ";
							pen.x=command.data[2];
							pen.y=command.data[3];
							smooth.x=command.data[0]-command.data[2];
							smooth.y=command.data[1]-command.data[3];
						}
					break;		
					case "T":
						// create lines
						if(d==1)
						{
							str+="M"+pen.x*6+" "+pen.y*6+" ";
							str+="L"+(pen.x-smooth.x)*6+" "+(pen.y-smooth.y)*6+" ";
							str+="L"+command.data[0]*6+" "+command.data[1]*6+" ";
							pen.x=command.data[0];
							pen.y=command.data[1];
						}
					break;	
					case "A":
						if(d==0) // zesde coord
						{ // A rx ry rotation large 
							str+="M"+pen.x*6+" "+pen.y*6+" ";
							var not3=command.data[3];
							if(command.data[3]==1) not3=0;
							else not3=1;
							var not4=command.data[4];
							if(command.data[4]==1) not4=0;
							else not4=1;
							str+="A"+command.data[0]*6+" "+command.data[1]*6+" "+command.data[2]+" "+not3+" "+not4+" "+command.data[5]*6+" "+command.data[6]*6+" ";
							
							var mx=(pen.x+command.data[5])/2;
							var my=(pen.y+command.data[6])/2;
							var rad=command.data[2]*Math.PI/180;
							var dx=(pen.x-command.data[5]);
							var dy=(pen.y-command.data[6]);
							var size=Math.sqrt(dx*dx+dy*dy);
							if(size>=command.data[0] && size>=command.data[1])
							{
								size/=2;
								rad=rad+Math.PI/2;
								var rx=command.data[0];
								var ry=command.data[1];
								var x_ax_x=-rx*Math.sin(rad);
								var x_ax_y=rx*Math.cos(rad);
								rad=rad+Math.PI/2;
								var y_ax_x=-ry*Math.sin(rad);
								var y_ax_y=ry*Math.cos(rad);
								str+="M"+(mx+x_ax_x)*6+" "+(my+x_ax_y)*6+"L"+(mx-x_ax_x)*6+" "+(my-x_ax_y)*6;
								str+="M"+(mx+y_ax_x)*6+" "+(my+y_ax_y)*6+"L"+(mx-y_ax_x)*6+" "+(my-y_ax_y)*6;
							}
							
							pen.x=command.data[5];
							pen.y=command.data[6];
						}
					break;								
					
				}
			}
		}
		this.controlLines.setAttribute("d",str);
	};	
	ShowPath.prototype.createControlPoint=function(i,label,x,y)
	{
		var str="translate("+x*6+","+y*6+")";
		var p=createNSNode("g",{transform: str});
		p.id="con|"+this.unique_id+"_"+i;
		var c=createNSNode("circle",{class: "controlPoint",r:15,cx:0,cy:0});
		var t=createNSNode("text",{x:6,y:-6,fontSize: 12,fill: "#fff",strokeWidth:3,stroke: "#000",paintOrder:"stroke", textAnchor: "middle",alignmentBaseline:"middle"});
		t.style.userSelect="none";
		var m=createNSNode("circle",{fill: "black",r:2,cx:0,cy:0});
		t.innerHTML=label;
		p.appendChild(c);
		p.appendChild(t);
		p.appendChild(m);
		
		p.setAttribute("nr",i); // command number
		p.addEventListener("pointerover",this.hoverCommand.bind(this),true);
		p.addEventListener("pointerout",this.hoverCommand.bind(this),true);
		p.addEventListener("pointerdown",this.handleControlPoint.bind(this),true);
//      p.addEventListener("pointerup",this.handleControlPoint.bind(this),true);
//		p.addEventListener("pointercancel",this.handleControlPoint.bind(this),true);
//		p.addEventListener("pointermove",this.handleControlPoint.bind(this),true);
		
		return p;
	};
	ShowPath.prototype.hoverCommand=function(ev)
	{
		var target=ev.currentTarget;
		if(target.tagName=="CIRCLE")target=target.parentNode;
		// none active..
		for(var i=0;i<this.commands.length;i++)
		{
			var command_in_list=document.getElementById("com|"+this.unique_id+"_"+i);
			if(command_in_list!=null) command_in_list.classList.remove("SVGactive");
			var controlpoint_in_svg=document.getElementById("con|"+this.unique_id+"_"+i);
			if(controlpoint_in_svg!=null) controlpoint_in_svg.classList.remove("SVGactive");
			var span_in_path=document.getElementById("str|"+this.unique_id+"_"+i);
			if(span_in_path!=null) span_in_path.classList.remove("SVGactive");
		}
		target.classList.remove("SVGactive");
		// we are hovering one of the commands..
		if(ev.type.indexOf("over")!=-1)
		{
			var i=target.getAttribute("nr");
			var command_in_list=document.getElementById("com|"+this.unique_id+"_"+i);
			if(command_in_list!=null) command_in_list.classList.add("SVGactive");
			var controlpoint_in_svg=document.getElementById("con|"+this.unique_id+"_"+i);
			if(controlpoint_in_svg!=null) controlpoint_in_svg.classList.add("SVGactive");
			var span_in_path=document.getElementById("str|"+this.unique_id+"_"+i);
			if(span_in_path!=null) span_in_path.classList.add("SVGactive");
			target.classList.add("SVGactive");
		}
	}
	ShowPath.prototype.rebuildList=function()
	{
		// build list from commands..
		var keys={};
		keys["M"]=["eindpunt-x","eindpunt-y"];
		keys["L"]=["eindpunt-x","eindpunt-y"];
		keys["H"]=["eindpunt-y"];
		keys["V"]=["eindpunt-x"];
		keys["C"]=["c1-x","c1-y","c2-x","c2-y","eindpunt-x","eindpunt-y"];
		keys["Q"]=["c12-x","c12-y","eindpunt-x","eindpunt-y"];
		keys["S"]=["c2-x","c2-y","eindpunt-x","eindpunt-y"];
		keys["T"]=["eindpunt-x","eindpunt-y"];
		keys["A"]=["radius-x verhouding","radius-y verhouding","rotatie (graden)","large-arc (0 small /1 large)","clockwise-sweep (0 kloktegen/1 klokmee)","eindpunt-x","eindpunt-y"];
		
		this.list.innerHTML=""; // clear.
		for(var i=0;i<this.commands.length;i++)
		{
			var command=this.commands[i];
			var com=document.createElement("div");
			com.addEventListener("pointerover",this.hoverCommand.bind(this),false);
			com.addEventListener("pointerout",this.hoverCommand.bind(this),false);
			com.id="com|"+this.unique_id+"_"+i;
			com.setAttribute("nr",i);
			var span=document.createElement("span");
			span.innerHTML="("+i+") ";
			com.appendChild(span);
			com.className="SVGCommand";
			var select=document.createElement("select");
			fillSelect(select,command.c);
			com.appendChild(select);
			this.list.appendChild(com);
			for(var d=0;d<command.data.length;d++)
			{
				if(command.data[d]!="")
				{
					var input=document.createElement("input");
					input.value=command.data[d];
					if(typeof(keys[command.c])!="undefined" && typeof(keys[command.c][d])!="undefined")
					input.setAttribute("title",keys[command.c][d]);
					input.type="number";
					input.setAttribute("min",0);
					input.setAttribute("nr",i);
					input.setAttribute("max",99);
					var command_id=this.unique_id+"_"+(i)+"_"+d;
					input.id="com|"+command_id;
					input.addEventListener("change",this.handleInputChange.bind(this))
					com.appendChild(input);
				}
			}
			var button=document.createElement("button");
			button.style.float="right";
			button.style.clear="right";
			button.innerHTML="x";
			com.appendChild(button);
		}
		var button=document.createElement("button");
		button.style.border="none";
		button.style.display="inline";
		button.style.padding="none";
		button.style.padding="none";
		button.style.width="100%";
		button.style.height="30px";
		button.style.background="#bc5100";
		button.style.color="#fff";
		button.innerHTML="+ Nieuw commando";
		this.list.appendChild(button);
		this.list.appendChild(button);
	};
		
	ShowPath.prototype.handleControlPoint=function (ev)
	{
		if(ev.type.indexOf("up")!=-1 || ev.type.indexOf("cancel")!=-1)
		{
			this.dragging=false;
			this.rebuildPath();
			this.rebuildControls();
		}
		if(ev.type.indexOf("down")!=-1)
		{
			console.log("start dragging");
			this.dragging=ev.currentTarget;
			console.log(this.dragging);
		}
		if(ev.type.indexOf("move")!=-1)
		{
			if(this.dragging!=false)
			{
				var x = ev.clientX-this.svg.getBoundingClientRect().x;
				var y = ev.clientY-this.svg.getBoundingClientRect().y;
				this.dragging.setAttribute("transform","translate("+(Math.floor(x/6)*6)+","+(Math.floor(y/6)*6)+")");
				var nr=parseInt(this.dragging.getAttribute("nr"));
				var command=this.commands[nr];
				console.log("command "+command);
				this.commands[parseInt(this.dragging.getAttribute("nr"))].data[parseInt(this.dragging.getAttribute("x-controls"))]=Math.floor(x/6);
				this.commands[parseInt(this.dragging.getAttribute("nr"))].data[parseInt(this.dragging.getAttribute("y-controls"))]=Math.floor(y/6);
				this.rebuildPath();
				this.rebuildList();
				this.rebuildControlLines();
			}
		}
	}
	ShowPath.prototype.handleInputChange=function (ev)
	{
		var command_nr=parseInt(ev.currentTarget.getAttribute("nr"));
		var command=this.commands[command_nr];
		var dom=document.getElementById("com|"+this.unique_id+"_"+command_nr);
		var inputs=dom.getElementsByTagName("input");
		for(var i=0;i<inputs.length;i++)
		{
			command.data[i]=inputs[i].value; // now we definitely got it..
		}
		this.rebuildPath();
		this.rebuildControls();
		
	}
	// helper functions
	function fillSelect(select,selected)
	{
		var commands="MLZHVCQSTA";
		var command_labels=["moveTo","lineTo","closePath","HorizontalLineTo","VerticalLineTo","BezierCurveTo","QuadraticCurveTo","SmoothBezierTo","SmoothQuadraticTo","Arc"];
		for(var i=0;i<commands.length;i++)
		{
			var c=commands.charAt(i);
			var option=document.createElement("option");
			option.innerHTML=c+" &nbsp; ("+command_labels[i]+")";
			option.value=c;
			if(c==selected)
			{
				option.setAttribute("selected","");
			}
			select.appendChild(option);
		}
	}
	function createNSNode(n, v) {
	  n = document.createElementNS("http://www.w3.org/2000/svg", n);
	  for (var p in v)
	  n.setAttributeNS(null, p.replace(/[A-Z]/g, function (m, p, o, s) {return "-" + m.toLowerCase();}), v[p]);
	  return n;
	}

	var shows=document.getElementsByClassName("show_path");
	for(var s=0;s<shows.length;s++)
	{
		var o=new ShowPath(shows[s]);
		
	}
	
})();