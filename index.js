const express = require('express')
const axios = require('axios')
const cors = require('cors');
const { JSDOM } = require('jsdom');


const baseUrl = process.env.URL || `http://moed.gov.sy/12th/index.php`;
const baseUrl2 = process.env.URL2 ||`http://moed.gov.sy/12th/resultpage.php`;

const asasyUrl = process.env.URL || `http://moed.gov.sy/9th/index.php`;
const asasyUrl2 = process.env.URL2 ||`http://moed.gov.sy/9th/result.php`;

const app = express()

app.use(
	cors(),
    express.json()
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(
	`Server started on port ${PORT}`));

app.get('/',(req,res)=>{
    res.send("Ok")
})

let tryCount = 5;
app.post('/num', async (req, res) => {
	tryCount = 5;
	console.log(tryCount)
	const num = req.body.id;
	const city = req.body.city;
   	 const branch =  req.body.br;
    	const sub =  req.body.sub || '';
console.log(num,city,branch)
try{
	let data = await resultNum(num,city,branch,sub)
	while(tryCount > 0){	
		if(data == 'error'){
			data = await resultNum(num,city,branch,sub)
		}else if(data == null){
			res.json({status : "error" , message : null});
			tryCount = 0
			return
		}else if(data.length == 0){
			res.json({status : "notFound" , message : data})
			tryCount = 0
			return
		}else{
			res.json({status : "success" , message : data})
			tryCount = 0
			return
		}
	}
		if(data == 'error' || data == null){
			res.json({status : "error" , message : null});
		}else if(data.length == 0){
			res.json({status : "notFound" , message : data})
		}else{
			res.json({status : "success" , message : data})	
		}
	
	

}catch(err){
	res.json({status : "error" , message : null});
}
})

let tryCountAsasy = 5;
app.post('/asasy', async (req, res) => {
	tryCountAsasy = 5;
	console.log(tryCountAsasy)
	const num = req.body.id;
	const city = req.body.city;
   	 const branch =  req.body.br;

console.log(num,city,branch)
try{
	let data = await resultAsasy(num,city,branch)
	while(tryCountAsasy > 0){	
		if(data == 'error'){
			data = await resultAsasy(num,city,branch)
		}else if(data == null){
			res.json({status : "error" , message : null});
			tryCountAsasy = 0
			return
		}else if(data.length == 0){
			res.json({status : "notFound" , message : data})
			tryCountAsasy = 0
			return
		}else{
			res.json({status : "success" , message : data})
			tryCountAsasy = 0
			return
		}
	}
		if(data == 'error' || data == null){
			res.json({status : "error" , message : null});
		}else if(data.length == 0){
			res.json({status : "notFound" , message : data})
		}else{
			res.json({status : "success" , message : data})	
		}
	
	

}catch(err){
	res.json({status : "error" , message : null});
}
})

let cookies = ''

const options = {
	method :'get',
	url : baseUrl,  
	headers: {
		"Host" : "moed.gov.sy",
		"User-Agent" : "Mozilla/5.0"
	}
}


// Number
const resultNum = async (num,city,branch,sub)=>{
    try {
	   		tryCount--;		
	    		const formData = new FormData();
			formData.append("stnumber",num);
			formData.append("branch", branch);
			formData.append("city", city);
			formData.append("sub-branch", sub);


			//const response = await axios.request(options)
	                // cookies =await response.headers.get('set-cookie')
			//const data = await response.data;
			
			//console.log(cookies)
			const options2 = {
				method: "post",
				url :baseUrl2,
				headers: {
					"Host" : "moed.gov.sy",
					"Referer" : baseUrl,
					"Origin" : "http://moed.gov.sy",
				   "User-Agent" : "Mozilla/5.0 ",
					 "Upgrade-Insecure-Requests" : "1",
				 "Content-Type" : "application/x-www-form-urlencoded",
			         "Cookie" : "PHPSESSID=7plud9soec5k8cuambngcrm6tg"
				},
				data : formData
			}

			let message = {}
			const response2 = await axios.request(options2)
			const html = await response2.data;

			const dom = new JSDOM(html);
			const document = dom.window.document;

			const subjects = document.querySelectorAll('.subject-con .per-subject .subject-title');
			const marks = document.querySelectorAll('.subject-mark span:last-child');
			const marksUp = document.querySelectorAll('.max span:last-child');
			const marksDown = document.querySelectorAll('.min span:last-child ');
			const id = document.querySelector('.student-info .info-1 div:last-child');
			const name = document.querySelector('.student-info .info-4 div:last-child');
			const mother = document.querySelector('.student-info .info-5 div:last-child');
			const school = document.querySelector('.student-info .info-6 div:last-child');
			const result = document.querySelector('.student-info .info-7 div:last-child');
	    		const errorReq = document.querySelector('.message');
			const notFound = document.querySelector('.be-sure');

			message['id']  = id?.textContent
			message['name']  = name?.textContent
			message['name4']  = mother?.textContent
			message['school']  = school?.textContent
			message['result']  = result?.textContent.trim() == "ناجح" ? 1 : result?.textContent.trim() == "راسب" ? 3 : 0 

			
			for (let i = 0; i < subjects.length; i++) {
				message['m'+(i+1)+'n'] = subjects[i].textContent.trim()
				message['m'+(i+1)+'a'] = marksDown[i].textContent.trim()
				message['m'+(i+1)+'b'] = marksUp[i].textContent.trim()
				message['m'+(i+1)] = marks[i].textContent.trim()
			}
			
			if(errorReq != null){
				console.log(tryCount)
				return 'error';
			}else if(notFound != null){
				return [];
			}else if(message['name']){
				return [message];
			}else{
				return null
			}
			
}
	catch (error) {
		console.log(error)
		return null
	}
}



let cookiesAsasy = ''

const optionsAsasy = {
	method :'get',
	url : asasyUrl,  
	headers: {
		"Host" : "moed.gov.sy",
		"User-Agent" : "Mozilla/5.0"
	}
}


// Number
const resultAsasy = async (num,city,branch)=>{
    try {
	   		tryCount--;		
	    	const formData = new FormData();
			formData.append("stdnum",num);
			formData.append("branch", branch);
			formData.append("city", city);


			const response = await axios.request(optionsAsasy)
	        cookiesAsasy =await response.headers.get('set-cookie')
			const data = await response.data;
			
			console.log(cookiesAsasy)
			const optionsAsasy2 = {
				method: "post",
				url :asasyUrl2,
				headers: {
					"Host" : "moed.gov.sy",
					"Referer" : asasyUrl,
					"Origin" : "http://moed.gov.sy",
				   "User-Agent" : "Mozilla/5.0 ",
					 "Upgrade-Insecure-Requests" : "1",
				 "Content-Type" : "application/x-www-form-urlencoded",
				 "Cookie" : cookiesAsasy[0]
				},
				data : formData
			}

			let message = {}
			const response2 = await axios.request(optionsAsasy2)
			const html = await response2.data;

			const dom = new JSDOM(html);
			const document = dom.window.document;

			const subjects = document.querySelectorAll('.subject-con .per-subject .subject-title');
			const marks = document.querySelectorAll('.subject-mark span:last-child');
			const marksUp = document.querySelectorAll('.max span:last-child');
			const marksDown = document.querySelectorAll('.min span:last-child ');
			const id = document.querySelector('.student-info .info-1 div:last-child');
			const name = document.querySelector('.student-info .info-4 div:last-child');
			const mother = document.querySelector('.student-info .info-5 div:last-child');
			const school = document.querySelector('.student-info .info-6 div:last-child');
			const result = document.querySelector('.student-info .info-7 div:last-child');
			const nccd = document.querySelector('.nccd-msg a');
			const olympic = document.querySelector('.olympic-msg a');
	    	const errorReq = document.querySelector('.message');
			const notFound = document.querySelector('.be-sure');

			message['id']  = id?.textContent
			message['name']  = name?.textContent
			message['name4']  = mother?.textContent
			message['school']  = school?.textContent
			message['result']  = result?.textContent.trim() == "ناجح" ? 1 : result?.textContent.trim() == "راسب" ? 3 : 0 

			message['nccd']  = nccd ? 1 : 0
			message['nccdTitle']  = nccd?.textContent
			message['nccdUrl']  = nccd?.href
			
			message['olympic']  = olympic ? 1 : 0
			message['olympicTitle']  = olympic?.textContent
			message['olympicUrl']  = olympic?.href

			for (let i = 0; i < subjects.length; i++) {
				message['m'+(i+1)+'n'] = subjects[i].textContent.trim()
				message['m'+(i+1)+'a'] = marksDown[i].textContent.trim()
				message['m'+(i+1)+'b'] = marksUp[i].textContent.trim()
				message['m'+(i+1)] = marks[i].textContent.trim()
			}
			
			if(errorReq != null){
				console.log(tryCountAsasy)
				return 'error';
			}else if(notFound != null){
				return [];
			}else if(message['name']){
				return [message];
			}else{
				return null
			}
			
}
	catch (error) {
		console.log(error)
		return null
	}
}



