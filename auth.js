(Login System using LocalStorage)
function register(){
let name=document.getElementById("regName").value;
let email=document.getElementById("regEmail").value;
let pass=document.getElementById("regPass").value;

let user={name,email,pass};
localStorage.setItem("user",JSON.stringify(user));
alert("Registered Successfully!");
window.location="login.html";
}

function login(){
let email=document.getElementById("loginEmail").value;
let pass=document.getElementById("loginPass").value;

let storedUser=JSON.parse(localStorage.getItem("user"));

if(email===storedUser.email && pass===storedUser.pass){
localStorage.setItem("loggedIn",true);
window.location="index.html";
}else{
alert("Invalid Credentials");
}
}

function logout(){
localStorage.removeItem("loggedIn");
}

7️⃣ js/ai.js (AI Recommendation Engine)
function calculateBMI(weight,height){
height=height/100;
return (weight/(height*height)).toFixed(2);
}

function generatePlan(){

let weight=document.getElementById("weight").value;
let height=document.getElementById("height").value;
let goal=document.getElementById("goal").value;
let condition=document.getElementById("condition").value;

let bmi=calculateBMI(weight,height);

let workout="";
let diet="";

if(goal==="weight_loss"){
workout="Cardio + HIIT 5 days/week";
diet="Low calorie high protein diet";
}
else if(goal==="muscle_gain"){
workout="Strength training split routine";
diet="High protein calorie surplus diet";
}
else{
workout="Balanced full body workout";
diet="Balanced macro diet";
}

if(condition==="diabetes"){
diet+=" with low glycemic foods";
}
if(condition==="hypertension"){
workout="Light cardio + Yoga";
diet+=" reduce salt";
}

let plan={weight,height,bmi,workout,diet};
localStorage.setItem("plan",JSON.stringify(plan));

document.getElementById("result").innerHTML=
"<h3>BMI:</h3>"+bmi+
"<h3>Workout:</h3>"+workout+
"<h3>Diet:</h3>"+diet;
}

