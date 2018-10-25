var host='www.facebook.com';
var pathNew='notifications';
var pathZero='';

var counter=0;
var newNotif=false;
var protocol='https';
var domain='facebook.com/messages';
var alwaysNew=false;
var showZero=false;
var deskNoti=null;
var showNoti=true;
var timeNoti=20000;
var timerVar=null;
var timerDelay=2000;
var playSound=true;
var audio=new Audio('ding.ogg');
window.onload=init;

var BADGE_NEW={color:[204,0,51,255]};
var BADGE_ACTIVE={color:[204,0,51,255]};
var BADGE_LOADING={color:[204,204,51,255]};
var BADGE_INACTIVE={color:[204,0,51,255]};

function loadData(){
	var xhr=new XMLHttpRequest();
	xhr.open('GET','https://www.facebook.com/',true);
	xhr.onreadystatechange=function(){
		if(xhr.readyState==4){
      chrome.browserAction.setBadgeBackgroundColor(BADGE_INACTIVE);
			
			var xmlDoc=xhr.responseText;		
			if( (xmlDoc.indexOf('notificationsCountValue') > 0) || (xmlDoc.indexOf('notifications:{unseen_count:') > 0) )
			{
				var lastCounter=counter;
				var fReq=0;
				var fMes=0;
				var fNot=0;
				
				if(xmlDoc.indexOf('notificationsCountValue') > 0)
				{
					// Request Value
					loc=xmlDoc.indexOf('requestsCountValue');
					if(loc>0){
						var myString=xmlDoc.substr(loc,80);
						fReq=parseInt(myString.substring(myString.indexOf('>')+1,myString.indexOf('<')));
					}
					
					// Message Value
					loc=xmlDoc.indexOf('messagesCountValue');
					if(loc>0){
						var myString=xmlDoc.substr(loc,80);
						fMes=parseInt(myString.substring(myString.indexOf('>')+1,myString.indexOf('<')));
					}
					
					// Notification Value
					loc=xmlDoc.indexOf('notificationsCountValue');
					if(loc>0){
						var myString=xmlDoc.substr(loc,80);
						fNot=parseInt(myString.substring(myString.indexOf('>')+1,myString.indexOf('<')));
					}
				}
				else if(xmlDoc.indexOf('notifications:{unseen_count:') > 0)
				{

					// Friends requests
					loc=xmlDoc.indexOf('friending_possibilities:{unseen_count:');
					if(loc>0){
						var myString=xmlDoc.substr(loc+30,80);
						fReq=parseInt(myString.substring(myString.indexOf(':')+1,myString.indexOf(',')));
					}
					
					// Messages
					loc=xmlDoc.indexOf('inbox:{unread_count:');
					if(loc>0){
						var myString=xmlDoc.substr(loc+10,80);
						fMes=parseInt(myString.substring(myString.indexOf(':')+1,myString.indexOf(',')));
					}

					// notifications
					loc = xmlDoc.indexOf('notifications:{unseen_count:');
					if(loc>0){
						var myString=xmlDoc.substr(loc+20,80);
						fNot = parseInt(myString.substring(myString.indexOf(':')+1,myString.indexOf(',')));
					}
				}
				
				var badgeTitle='Facebook - Online';
				if(fReq>0) badgeTitle+='\n> '+fReq+' Requests';
				if(fMes>0) badgeTitle+='\n> '+fMes+' Messages';
				if(fNot>0) badgeTitle+='\n> '+fNot+' Notifications';
				counter=fReq+fMes+fNot;

				chrome.browserAction.setIcon({path:'images/ico19.png'});
				chrome.browserAction.setTitle({title:badgeTitle});
				if(!showZero&&counter==0)chrome.browserAction.setBadgeText({text:''});
				else chrome.browserAction.setBadgeText({text:counter+''});
				if(counter>lastCounter && fReq>0)
				{
					newNotif=true;
					if(playSound)audio.play();
					if(showNoti)
					{
						if(deskNoti)deskNoti.close();
						deskNoti=new Notification('Electronic Request Received',{ body: 'You have '+counter+' new request(s)', icon: '/images/freiendrequest.png'});
						deskNoti.onclick=function(){openPageReq();this.close()};
						if(timeNoti)
						{
							window.setTimeout(function() { deskNoti.close(); }, timeNoti);
						}
					}
				}
				if(counter>lastCounter && fMes>0)
				{
					newNotif=true;
					if(playSound)audio.play();
					if(showNoti)
					{
						if(deskNoti)deskNoti.close();
						deskNoti=new Notification('Electronic Message Received',{ body: 'You have '+counter+' new message(s)', icon: '/images/Chat.png'});
						deskNoti.onclick=function(){openPageMess();this.close()};
						if(timeNoti)
						{
							window.setTimeout(function() { deskNoti.close(); }, timeNoti);
						}
					}
				}
				if(counter>lastCounter && fNot>0)
				{
					newNotif=true;
					if(playSound)audio.play();
					if(showNoti)
					{
						if(deskNoti)deskNoti.close();
						deskNoti=new Notification('Electronic Notification Received',{ body: 'You have '+counter+' new notification(s)', icon: '/images/notifications.png'});
						deskNoti.onclick=function(){openPageNoti();this.close()};
						if(timeNoti)
						{
							window.setTimeout(function() { deskNoti.close(); }, timeNoti);
						}
					}
				}
				if(newNotif)chrome.browserAction.setBadgeBackgroundColor(BADGE_NEW);
				else if(counter>0)chrome.browserAction.setBadgeBackgroundColor(BADGE_ACTIVE);
			}
			else{
				chrome.browserAction.setIcon({path:'images/ico19_offline.png'});
				chrome.browserAction.setTitle({title:'--Disconnected--'});
				chrome.browserAction.setBadgeText({text:'?'});
				return;
			}
		}
		else return;
	}
	xhr.send(null);
	window.clearTimeout(timerVar);
	timerVar=window.setTimeout(loadData,timerDelay);
}

function init(){
	pathNew=(localStorage.pathNew||localStorage.pathNew=='')?localStorage.pathNew:pathNew;
	pathZero=(localStorage.pathZero||localStorage.pathZero=='')?localStorage.pathZero:pathZero;
	domain=(localStorage.useMess=='yes')?'messenger.com':'facebook.com/messages';
	alwaysNew=(localStorage.alwaysNew)?(localStorage.alwaysNew=='yes'):false;
	showZero=(localStorage.showZero)?(localStorage.showZero=='yes'):false;
	playSound=(localStorage.playSound)?(localStorage.playSound=='yes'):true;
	showNoti=(localStorage.showNoti)?(localStorage.showNoti=='yes'):true;
	timeNoti=parseInt(localStorage.timeNoti||'20000');
	timerDelay=parseInt(localStorage.refreshInterval||'30000');

	chrome.browserAction.setIcon({path:'images/ico19_offline.png'});
	chrome.browserAction.setBadgeText({text:'...'});
	chrome.browserAction.setBadgeBackgroundColor(BADGE_LOADING);
	loadData();
	control.init();
}

function init1(){
	pathNew=(localStorage.pathNew||localStorage.pathNew=='')?localStorage.pathNew:pathNew;
	pathZero=(localStorage.pathZero||localStorage.pathZero=='')?localStorage.pathZero:pathZero;
	domain=(localStorage.useMess=='yes')?'messenger.com':'facebook.com/messages';
	alwaysNew=(localStorage.alwaysNew)?(localStorage.alwaysNew=='yes'):false;
	showZero=(localStorage.showZero)?(localStorage.showZero=='yes'):false;
	playSound=(localStorage.playSound)?(localStorage.playSound=='yes'):true;
	showNoti=(localStorage.showNoti)?(localStorage.showNoti=='yes'):true;
	timeNoti=parseInt(localStorage.timeNoti||'20000');
	timerDelay=parseInt(localStorage.refreshInterval||'30000');

	chrome.browserAction.setIcon({path:'images/ico19_offline.png'});
	chrome.browserAction.setBadgeText({text:'...'});
	chrome.browserAction.setBadgeBackgroundColor(BADGE_LOADING);
	loadData();
	control.init();
}

function tabCallback(tab){
	chrome.tabs.onRemoved.addListener(function(tabId){if(tabId==tab.id)loadData();});
	chrome.windows.update(tab.windowId,{focused:true});
}

function openUrl(uri){
	chrome.windows.getAll({populate:true},function(windows){
		if(windows.length<1){
			chrome.windows.create({url:uri,focused:true});
			return;
		}
		else if(!alwaysNew){
			for(var i=0;i<windows.length;i++){
				var tabs=windows[i].tabs;
				for(var j=0;j<tabs.length;j++){
					if(tabs[j].url.indexOf(uri)!=-1){
						chrome.tabs.update(tabs[j].id,{selected:true},tabCallback);
						return;
					}
				}
			}
		}
		chrome.tabs.getSelected(null,function(tab){
			if(tab.url=='chrome://newtab/')
				chrome.tabs.update(tab.id,{url:uri},tabCallback);
			else
				chrome.tabs.create({url:uri},tabCallback);
		});
	});
}
//Don't change anything here, you will fuck up everything.
function openPage(){
	if(counter>0)
		openUrl(protocol+'://'+host+'/'+pathNew);
	else
		openUrl(protocol+'://'+host+'/'+pathZero);
	newNotif=false;
	loadData();
}
function openPageReq(){
	if(counter>0)
		openUrl(protocol+'://'+host+'/friends/requests');
	else
		openUrl(protocol+'://'+host+'/'+pathZero);
	newNotif=false;
	loadData();
}
function openPageMess(){
	if(counter>0)
		openUrl(protocol+'://'+domain);
	else
		openUrl(protocol+'://'+host+'/'+pathZero);
	newNotif=false;
	loadData();
}

function openPageNoti(){
	if(counter>0)
		openUrl(protocol+'://'+host+'/'+pathNew);
	else
		openUrl(protocol+'://'+host+'/'+pathZero);
	newNotif=false;
	loadData();
}

chrome.browserAction.onClicked.addListener(function(tab){
	openPage();
	iconClick();
});

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-9028814-2']);
  _gaq.push(['_trackPageview']);

  (function(){
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
  
  function iconClick(){
    _gaq.push(['_trackEvent', 'icon', 'clicked']);
  };
