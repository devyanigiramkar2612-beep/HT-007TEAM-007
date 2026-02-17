window.onload=function(){
let user=JSON.parse(localStorage.getItem("user"));
let plan=JSON.parse(localStorage.getItem("plan"));

if(user && plan){
document.getElementById("userData").innerHTML=
"<h3>Name: "+user.name+"</h3>"+
"<h3>BMI: "+plan.bmi+"</h3>"+
"<h3>Workout: "+plan.workout+"</h3>"+
"<h3>Diet: "+plan.diet+"</h3>";
}
}

function updateProgress(){

let newWeight=document.getElementById("newWeight").value;
let plan=JSON.parse(localStorage.getItem("plan"));

if(newWeight < plan.weight){
document.getElementById("progressOutput").innerHTML=
"Great Progress! Keep going!";
}
else{
document.getElementById("progressOutput").innerHTML=
"Increasing workout intensity next week.";
}
}