//var restify = require('restify'); //module required to make a server to connect to
var builder = require('botbuilder');
var model = 'https://api.projectoxford.ai/luis/v1/application?id=89663372-7a2a-4a40-b4d5-43ab37173df3&subscription-key=1ae1efdab0a54c389e5ec2fc0e74c738';
var dialog = new builder.LuisDialog(model);
var cortanaBot = new builder.TextBot();

//potential code to allow bot to be connected to the Bot Connector which would
//be used to test the bot locally and then can be used to publish the bot
//var cortanaBot = new builder.BotConnectorBot({appId:'YourAppId',appSecret:'YourAppSecret'});
/*var server = restify.createServer();
server.post('/api/messages', cortanaBot.verifyBotFramework(), cortanaBot.listen());
	server.listen(process.env.port || 8080,function(){
		console.log('%s is listening to %s', server.name, server.url);
	});
*/
cortanaBot.add('/',dialog);
dialog.onBegin(function (session,args,next){
	if(!session.userData.firstRun){
		session.userData.firstRun = true;
		session.beginDialog('/firstRun');
	}else{
		next();
	}
});
dialog.on('change', [function(session, args, next){
		//console.log(args);//testing code
		if (args.entities.length<1){
			session.send("You did not say what to change.");
		}else{
			args.entities.forEach(function (item){
				if (item.entity == 'name'){
					session.beginDialog('/getName');
				}else if(item.entity =='age'){
					session.beginDialog('/getAge');
				}else if(item.entity =='email'){
					session.beginDialog('/getEmail');
				}
			});
		}
}]);
dialog.on('end',[function(session){
	session.endDialog();
}]);
dialog.onDefault(function(session){
	if (!session.userData.name){
		session.beginDialog('/getName');
	} else if(!session.userData.age){
		session.send('Hi nice to meet you %s!', session.userData.name);
	}
	if(!session.userData.age && session.userData.name){
		session.beginDialog('/getAge');
	}
	if(!session.userData.email&&session.userData.name && session.userData.age){
		session.beginDialog('/getEmail');
	}
	if(session.userData.email&&session.userData.name && session.userData.age){
		var user = session.userData.name+' \nAge: '+session.userData.age+' \nEmail: '+session.userData.email;
		
		session.send('The Values you have entered are \nName: '+ user);
	}

});
//welcoming the user to the bot on the first run
cortanaBot.add('/firstRun',function (session){
		session.send('Welcome to the bot.');
		session.beginDialog('/');
})
//prompting user for their name
cortanaBot.add('/getName',[function(session){
	builder.Prompts.text(session, "Please enter your name");
}, function(session, results){
	session.userData.name = results.response;
	session.beginDialog('/');
}
]);
// prompting user for their age (will reject anything that is not a number)
cortanaBot.add('/getAge', [function(session){
	builder.Prompts.number(session, 'Please enter your age:');
}, function (session, results){
	session.userData.age = results.response;
	session.beginDialog('/');
}]);
//prompting user for their email (can be improved by requiring an @ and . to ensure it is an email address)
cortanaBot.add('/getEmail', [function(session){
	builder.Prompts.text(session, 'Please enter your email address.');
}, function (session, results){
	session.userData.email = results.response;
	session.beginDialog('/');
}]);
cortanaBot.listenStdin();