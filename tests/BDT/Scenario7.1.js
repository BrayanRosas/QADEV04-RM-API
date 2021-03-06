 //scenario 7.1
 /*
Scenario 3 – have a meeting with 15 seconds of duration and then the room should be free

Given I have a Room "Floor1Room5"
	And a location called "D4-03" is asigned to the room 
	And the room have 15 chairs like resources
When a meeting with a duration of 15 seconds is asigned to the room 
	Then the room should be reserved for the meeting
When the time is off for the meeting 
	Then the room should be free

*/
var init = require('../../init');
var config = require(GLOBAL.initialDirectory+'/config/config.json');
var resourceConfig = require(GLOBAL.initialDirectory+config.path.resourceConfig);
var locationConfig = require(GLOBAL.initialDirectory+config.path.locationConfig);
var expect = require('chai').expect;
var tokenAPI = require(GLOBAL.initialDirectory+config.path.tokenAPI);
var roomManagerAPI = require(GLOBAL.initialDirectory+config.path.roomManagerAPI);
var endPoints = require(GLOBAL.initialDirectory+config.path.endPoints);
var util = require(GLOBAL.initialDirectory+config.path.util);
var mongodb = require(GLOBAL.initialDirectory+config.path.mongodb);
var ObjectId = require('mongodb').ObjectId;
//EndPoints
var url = config.url;
var resourceEndPoint = url+endPoints.resources;
var locationEndPoint = url+endPoints.locations;
var roomEndPoint = url+endPoints.rooms;
var servicesEndPoint = url + endPoints.services;
var rooms = endPoints.rooms;
var meetings = endPoints.meetings;
// global variables
var token = null;
var roomJson = null;
var locationJson = locationConfig.locationJson;
var resourceJson = null;
var basic = config.userBasicAccountJson;

describe('Scenario 7.1 – have a meeting with 15 seconds of duration and then the room should be free', function () {
	before(function (done) {
		this.timeout(config.timeOut);
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		tokenAPI
			.getToken(function(err,res){
				token = res.body.token;
				done();
			});

	});
	describe('Given I have a Room "Floor1Room5"',function(){
		before(function (done) {
			mongodb
				.findDocument('rooms',{"displayName" : "Floor1Room5"}, function(res){
					//console.log('++++++++++++++'+JSON.stringify(res));
					roomJson = res;
					done();
			});
		});
		before('And a location called "D4-03" is asigned to the room',function (done) {
			var stringJson = JSON.stringify(locationJson);
			stringJson = stringJson.replace("locationName","D4-03");
			stringJson = stringJson.replace("locationCustomName","D4-03");
			stringJson = stringJson.replace("locationDescription","Scenario 7.1");
			locationJson = JSON.parse(stringJson);
			roomManagerAPI
				.post(token,locationEndPoint,locationJson,function(err,res){
					locationJson = res.body;
					roomManagerAPI
						.put(token,roomEndPoint+'/'+roomJson._id,{"locationId" : locationJson._id},function(err,res){
							//console.log('Room ID: '+roomJson._id+'  LocationsId :'+locationJson._id);
							console.log('\t \tAnd a location is asigned to the room');
							done();				
						});
				});
		});
		before('And the room have 15 chairs like resources',function (done) {
			roomManagerAPI
				.post(token,resourceEndPoint,util.getResourcesJson('chair','chair','','Scenario 7.1'),function(err,res){
					resourceJson = res.body;
					// TODO associate the resources with a quantity of 15
					/*roomManagerAPI
						.post(token,roomEndPoint+'/'+roomJson._id+resource)*/
					console.log('\t \tAnd the room have 15 chairs like resources');
					done();
				});
			
		});
		describe('When a meeting with a duration of 15 seconds is asigned to the room',function () {
			this.timeout(config.timeOut);
			var meeting = null;
			var meetingJSon = null;
			var currentDatePlus = util.getCurrentDate(15) 
			before(function (done) {
				meetingJSon = {
				    "organizer": "Ariel.Rojas",
				    "title": "test",
				    "start": "2015-10-29T01:20:00.000Z",
				    "end": "2015-10-29T01:25:00.000Z",
				    "location": "Floor1Room12",
				    "roomEmail": "Floor1Room12@forest1.local",
				    "resources": [
				      "Floor1Room12@forest1.local"
				    ],
				    "attendees": [
				      "test@myexchange.com"
				    ]
				};
				//TODO resolve the problem whit the dates 
				//console.log('---------------------------',meetingJSon);
				
				meetingJSon.start = currentDatePlus[0];
				meetingJSon.end = currentDatePlus[1];
				//console.log('---------------------------',meetingJSon);
				
				roomManagerAPI
					.postwithBasic(basic, servicesEndPoint + '/' + roomJson.serviceId + '/' + rooms + '/' + roomJson._id + '/' + meetings, meetingJSon, function(err, res){
						//console.log('//////////////////////'+JSON.stringify(res.body));
						meeting= res.body;
						done()
					});
			});

			after(function (done) {
				roomManagerAPI
					.delwithBasic(basic,servicesEndPoint+'/'+roomJson.serviceId+'/'+rooms+'/'+roomJson._id+'/'+meetings+'/'+meeting._id,function(err,res){
						//console.log('after'+servicesEndPoint+'/'+roomJson.serviceId+rooms+'/'+roomJson._id+meetings+'/'+meeting._id);
						done();
					});
			});

			it('Then the room should be reserved for the meeting', function (done) {
				var jsonId = {"_id" : ObjectId(meeting._id)}
				//console.log('***********************************'+JSON.stringify(jsonId));
				mongodb
					.findDocument('meetings', jsonId, function(res){
						meetingDb = res;
						//console.log('++++++++++++++++++',JSON.stringify(res));
						expect(meeting.roomId).to.equal(meetingDb.roomId);
						expect(meetingDb).to.have.property("serviceId")
							.and.to.be.equal(meeting.serviceId);
						expect(meetingDb).to.have.property("location")
							.and.to.be.equal(meeting.location);
						expect(meetingDb).to.have.property("location")
							.and.to.be.equal(meeting.location);
						done();
				});
				
			});
			/**describe('When the time is off for the meeting', function () {
				this.timeout(16000);
				it('Then the room should be free', function (done) {

					setTimeout(done, 16000);
				});
			});*/
		});
		
	});
	
});