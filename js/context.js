/* J.A.R.V.I.S. CONTEXT CORE */

const JContext={
version:"1.0",
maxRecent:12,
maxImportant:20,
recent:[],
important:[],
summary:"",

add(role,text,important=false){
if(!text)return;

const item={
role,
text:String(text),
time:Date.now()
};

this.recent.push(item);

if(important)this.important.push(item);

if(this.recent.length>this.maxRecent)
this.recent.shift();

if(this.important.length>this.maxImportant)
this.important.shift();

return item;
},

addUser(text){
return this.add("user",text);
},

addAssistant(text){
return this.add("assistant",text);
},

markImportant(text){
return this.add("memory",text,true);
},

getRecent(){
return this.recent.slice(-this.maxRecent);
},

getImportant(){
return this.important.slice(-this.maxImportant);
},

setSummary(text){
this.summary=String(text||"");
},

getSummary(){
return this.summary;
},

build(){
let r=this.getRecent()
.map(x=>`${x.role}: ${x.text}`)
.join("\n");

let i=this.getImportant()
.map(x=>`${x.role}: ${x.text}`)
.join("\n");

return[
this.summary?`RESUMEN:\n${this.summary}`:"",
i?`INFORMACIÓN IMPORTANTE:\n${i}`:"",
r?`CONVERSACIÓN RECIENTE:\n${r}`:""
].filter(Boolean).join("\n\n");
},

clearRecent(){
this.recent=[];
},

clearAll(){
this.recent=[];
this.important=[];
this.summary="";
},

stats(){
return{
recent:this.recent.length,
important:this.important.length,
hasSummary:!!this.summary
};
}
};

function contextAddUser(text){
return JContext.addUser(text);
}

function contextAddAssistant(text){
return JContext.addAssistant(text);
}

function getContext(){
return JContext.build();
}

function clearContext(){
JContext.clearAll();
            }
