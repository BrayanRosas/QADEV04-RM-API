//Smoke testing - GET Meetings
//Author Ariel Wagner Rojas
var request = require('superagent');
require('superagent-proxy')(request);
var expect = require('chai').expect;

//with config it can use the methods located into the config file
var config = require('../../config/config.json');
//with meetingsAPI it can use the methods located into the meetingsAPI file
var meetingsAPI = require(config.path.meetingsAPI);
//with tokenAPI it can use the parameters located into the loginAPI file
var tokenAPI = require(config.path.tokenAPI);


describe('Smoke testings for meetings', function () {

	//global variables
	var userCredential = config.userAccountJson;
	//the token variable will contain the token
	var token = null;
	//the serviceId variable will contain the service id
	var serviceId = null;
	//the roomId variable will contain the room id
	var roomId = null;

	this.timeout(config.timeOut);

	before('Getting the token ',function (done){
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
		//getting the token
		tokenAPI
			.getToken(userCredential,function(res){
				token = res;
				done();
			});
	});

	beforeEach('Getting the service id and room id ',function (done){
		meetingsAPI
				.getService(token.body.token, function(res1){
					serviceId = res1.body[0]._id;
				meetingsAPI
					.getRooms(function(res2){
						roomId = res2.body[0]._id;
						done();
					});
				});
	});

	it('GET /services/{:serviceId}/rooms/{:roomId}/meetings returns 200',function (done){	
		meetingsAPI
			.getMeetings(serviceId,roomId,function(res){
				expect(res.status).to.equal(200);
				done();
		});
	});
});