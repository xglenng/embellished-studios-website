import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.mjs';
const env = { RESEND_API_KEY: 'test-only', TURNSTILE_SECRET_KEY: 'test-only' };
const data = {name:'Test Visitor', email:'visitor@example.com', phone:'555-0100', subject:'Tattoo apprenticeship',message:'Please tell me about availability.', token:'test-token'};
function req(body=data, origin='https://www.embellishedstudios.com') {
 return new Request('https://worker.example/inquiry', {method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
}
test('reject untrusted origins without contacting providers', async()=>{
 assert.equal((await worker.fetch(req(data,'https://evil.example'),env)).status,403);
});
test('preflight allows website', async()=>{
 const r=await worker.fetch(new Request('https://worker.example/inquiry',{method:'OPTIONS',headers:{Origin:'https://www.embellishedstudios.com'}}),env);
 assert.equal(r.status,204);
});
test('fail closed without secrets', async()=>assert.equal((await worker.fetch(req(),{})).status,503));
test('validate email and body sizes', async()=>{
 assert.equal((await worker.fetch(req({...data,email:'bad'}),env)).status,400);
 assert.equal((await worker.fetch(req({...data,message:'x'.repeat(17000)}),env)).status,413);
});
test('reject bad verification and hostname without sending', async()=>{
 const previous=globalThis.fetch;
 try {
  for(const verification of [{success:false},{success:true,hostname:'evil.example',action:'inquiry'},{success:true,hostname:'www.embellishedstudios.com',action:'other'}]){
   let calls=0; globalThis.fetch=async()=>{calls++;return Response.json(verification);};
   assert.equal((await worker.fetch(req(),env)).status,400);assert.equal(calls,1);
  }
 } finally {globalThis.fetch=previous;}
});
test('send only to fixed studio inbox, set reply-to, ignore recipient injection',async()=>{
 const previous=globalThis.fetch; let outgoing;
 globalThis.fetch=async(url,options)=>{
  if(url.includes('siteverify'))return Response.json({success:true,hostname:'www.embellishedstudios.com',action:'inquiry'});
  outgoing=JSON.parse(options.body); return Response.json({id:'test-email'});
 };
 try{
  assert.equal((await worker.fetch(req({...data,to:'attacker@example.com'}),env)).status,200);
  assert.deepEqual(outgoing.to,['embellished.studios.stg@gmail.com']);assert.equal(outgoing.reply_to,data.email);
  assert.equal(outgoing.html,undefined);
 }finally{globalThis.fetch=previous;}
});
test('surface delivery failure and upstream timeout without claiming success',async()=>{
 const previous=globalThis.fetch;
 try{
  globalThis.fetch=async(url)=>url.includes('siteverify')?Response.json({success:true,hostname:'embellishedstudios.com',action:'inquiry'}):Response.json({}, {status:429});
  assert.equal((await worker.fetch(req(),env)).status,502);
  globalThis.fetch=async()=>{throw new Error('timeout');};
  assert.equal((await worker.fetch(req(),env)).status,503);
 }finally{globalThis.fetch=previous;}
});
