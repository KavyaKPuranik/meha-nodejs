var express = require('express')
const path = require('path');
var router = express.Router();
var request = require('request');
var config = require('./webapp/conf/config.json');
var log = require('./logger/logger')(module);
var userInfo; 


const INDEX = path.join(__dirname, 'chatbot.html');

// middleware that is specific to this router
router.use(express.static(path.join(__dirname, 'webapp')))

// define the home page route
router.get('/', function (req, res) 
{
	log.info("Redirecting to: "+config.pushd_baseurl+config.pushd_url+config.pushd_api_userinfo);
	res.cookie("mehaURL", config.pushd_baseurl);
	request(config.pushd_baseurl+config.pushd_url+config.pushd_api_userinfo, function (error, response, body) 
	{
		if (!error && response.statusCode == 200) 
			userInfo = JSON.parse(body);
		var userid = req.query.userid;
		res.cookie("mehaEmail", "no-email"); 
		res.cookie("mehaName", "no-name");
		res.cookie("mehaUser", "no-user");
		for (var key in userInfo)
		{
			//console.log(userInfo[key].mailId);
			if(userid==userInfo[key].id)
			{
				delete userInfo[key]['sessionStats'];
				res.cookie("mehaEmail", userInfo[key].mailId);
				//console.log("mehaUser: "+JSON.stringify(userInfo[key]));
				res.cookie("mehaUser", JSON.stringify(userInfo[key]));
				if(userInfo[key].hasOwnProperty('name'))
					res.cookie("mehaName", userInfo[key].name);
				break;		
			}
		}	
		res.sendFile(INDEX);
	});
})
/*
router.get('/iframe', function (req, res) 
{
	res.sendFile(path.join(__dirname, 'chatbot.html'));
});*/

//console.log('Userid: '+userid);
module.exports = router