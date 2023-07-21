const express = require('express')
const axios = require('axios')
const cors = require('cors');
const { JSDOM } = require('jsdom');


const baseUrl = process.env.URL || `http://moed.gov.sy/12th/index.php`;
const baseUrl2 = process.env.URL2 ||`http://moed.gov.sy/12th/resultpage.php`;



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
	while(tryCount > 0){
		let data = await resultNum(num,city,branch,sub)
		if(data == 'error'){
			data = await resultNum(num,city,branch,sub)
		}else if(data == null){
			res.json({status : "error" , message : null});
			tryCount = 0
		}else if(data.length == 0){
			res.json({status : "notFound" , message : data})
			tryCount = 0
		}else{
			res.json({status : "success" , message : data})
			tryCount = 0
		}
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


			const response = await axios.request(options)
			const data = await response.data;
			cookies = response.headers.get('set-cookie')
			console.log(cookies)
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
				 "Cookie" : cookies[0]
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
			message['result']  = result?.textContent.trim() == "ناجح" ? 1 : 3

			
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



