/* J.A.R.V.I.S. CALCULATOR CORE */

const JCalculator={
version:"1.0",

normalize(expression){
return String(expression||"")
.replace(/,/g,".")
.replace(/[xX×]/g,"*")
.replace(/[÷]/g,"/")
.replace(/[−–—]/g,"-")
.replace(/\s+/g,"")
.trim();
},

tokenize(expression){
const e=this.normalize(expression);
const tokens=[];
let i=0;

while(i<e.length){

const c=e[i];

if(/[0-9.]/.test(c)){
let n="";
let dots=0;

while(i<e.length&&/[0-9.]/.test(e[i])){
if(e[i]===".")dots++;
n+=e[i++];
}

if(dots>1)throw new Error("Número inválido");

tokens.push(Number(n));
continue;
}

if("+-*/%^()".includes(c)){
tokens.push(c);
i++;
continue;
}

throw new Error("Carácter no válido");
}

return tokens;
},

toRPN(tokens){
const output=[];
const ops=[];

const priority={
"+":1,
"-":1,
"*":2,
"/":2,
"%":2,
"^":3
};

const rightAssociative={
"^":true
};

for(let i=0;i<tokens.length;i++){

const token=tokens[i];

if(typeof token==="number"){
output.push(token);
continue;
}

if(token==="("){
ops.push(token);
continue;
}

if(token===")"){
while(ops.length&&ops[ops.length-1]!=="(")
output.push(ops.pop());

if(!ops.length)
throw new Error("Paréntesis incorrectos");

ops.pop();
continue;
}

while(
ops.length&&
ops[ops.length-1]!=="("&&
(
priority[ops[ops.length-1]]>priority[token]||
(
priority[ops[ops.length-1]]===priority[token]&&
!rightAssociative[token]
)
)
){
output.push(ops.pop());
}

ops.push(token);
}

while(ops.length){

const op=ops.pop();

if(op==="(")
throw new Error("Paréntesis incorrectos");

output.push(op);
}

return output;
},

evaluateRPN(rpn){
const stack=[];

for(const token of rpn){

if(typeof token==="number"){
stack.push(token);
continue;
}

if(stack.length<2)
throw new Error("Operación incompleta");

const b=stack.pop();
const a=stack.pop();

let result;

switch(token){

case"+":result=a+b;break;
case"-":result=a-b;break;
case"*":result=a*b;break;

case"/":
if(b===0)
throw new Error("No se puede dividir entre cero");
result=a/b;
break;

case"%":
result=a%b;
break;

case"^":
result=Math.pow(a,b);
break;

default:
throw new Error("Operador desconocido");
}

if(!Number.isFinite(result))
throw new Error("Resultado no válido");

stack.push(result);
}

if(stack.length!==1)
throw new Error("Operación incompleta");

return stack[0];
},

calculate(expression){

try{

let e=String(expression||"").trim();

e=e
.replace(/^calcula(r)?\s+/i,"")
.replace(/^cuánto es\s+/i,"")
.replace(/^cuanto es\s+/i,"")
.replace(/^resuelve\s+/i,"");

if(!e)
return"Necesito una operación.";

const percentage=e.match(
/^(-?\d+(?:[.,]\d+)?)%\s+de\s+(-?\d+(?:[.,]\d+)?)$/i
);

if(percentage){

const a=Number(percentage[1].replace(",","."));
const b=Number(percentage[2].replace(",","."));

return a*b/100;
}

const tokens=this.tokenize(e);

if(!tokens.length)
return"Necesito una operación.";

const rpn=this.toRPN(tokens);
const result=this.evaluateRPN(rpn);

return this.format(result);

}catch(error){

return`Error: ${error.message||"operación no válida"}`;
}
},

format(value){

if(!Number.isFinite(value))
return"Resultado no válido";

if(Number.isInteger(value))
return String(value);

return String(
Number(value.toFixed(12))
);
},

percentage(value,total){
value=Number(value);
total=Number(total);

if(!Number.isFinite(value)||!Number.isFinite(total)||total===0)
return null;

return(value/total)*100;
},

percentageOf(percent,total){
percent=Number(percent);
total=Number(total);

if(!Number.isFinite(percent)||!Number.isFinite(total))
return null;

return(percent*total)/100
},

average(numbers){

if(!Array.isArray(numbers)||!numbers.length)
return null;

const values=numbers
.map(Number)
.filter(Number.isFinite);

if(!values.length)
return null;

return values.reduce((a,b)=>a+b,0)/values.length;
},

sum(numbers){

if(!Array.isArray(numbers))
return null;

const values=numbers
.map(Number)
.filter(Number.isFinite);

return values.reduce((a,b)=>a+b,0);
},

min(numbers){

if(!Array.isArray(numbers)||!numbers.length)
return null;

const values=numbers
.map(Number)
.filter(Number.isFinite);

return values.length?Math.min(...values):null;
},

max(numbers){

if(!Array.isArray(numbers)||!numbers.length)
return null;

const values=numbers
.map(Number)
.filter(Number.isFinite);

return values.length?Math.max(...values):null;
}
};


/* FUNCIONES GLOBALES */

function calculate(expression){
return JCalculator.calculate(expression);
}

function calculatePercentage(value,total){
return JCalculator.percentage(value,total);
}

function percentageOf(percent,total){
return JCalculator.percentageOf(percent,total);
}

function calculateAverage(numbers){
return JCalculator.average(numbers);
}

function calculateSum(numbers){
return JCalculator.sum(numbers);
}

function calculateMin(numbers){
return JCalculator.min(numbers);
}

function calculateMax(numbers){
return JCalculator.max(numbers);
}
