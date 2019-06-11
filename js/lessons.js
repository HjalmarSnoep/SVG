/*
	header 
*/
(function()
{
	
	var lessons=document.getElementsByClassName("show_lessons");
	
	
	
	var nr_of_lessons=16;
	var active=location.href.split("lesson")[1];
	active=active.split(".")[0];
	for(var l=0;l<lessons.length;l++)
	{
		for(var i=0;i<nr_of_lessons;i++)
		{
			var item=document.createElement("a");
			var nr=('0' + (i+1)).slice(-2);
			item.href="lesson"+nr+".html";
			item.innerHTML=" Les&nbsp;"+nr+" ";
			item.className="lesson-button";
			if(nr==active)
			{
				var active_dom=item;
				item.className="lesson-button active";
			}
			lessons[l].appendChild(item);
		}
	}
	
})();