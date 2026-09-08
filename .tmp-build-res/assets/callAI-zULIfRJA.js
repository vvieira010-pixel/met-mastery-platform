async function y(s,{max_tokens:i=2048,system:l,temperature:u=.3,preferredProvider:p=null,skills:r}={}){let a=l||"You are a helpful MET English teaching assistant.";if(r&&r.length>0){const e=r.filter(t=>t&&t.prompt).map(t=>`
--- ${t.name} ---
${t.prompt}`);e.length>0&&(a+=`

━━━ EDUCATION SKILL AUGMENTATIONS ━━━
${e.join(`
`)}
━━━ END AUGMENTATIONS ━━━
`)}let n;const h=/(?:return|respond|output)\s+(?:only\s+)?(?:valid\s+)?json\b/i.test(s);try{n=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:s,system:a,max_tokens:i,temperature:u,preferredProvider:p,...h?{response_format:{type:"json_object"}}:{}})})}catch(e){throw new Error(`Network connection error: ${e.message}`,{cause:e})}const o=n.headers.get("content-type")||"";if(!n.ok){let e=`AI request failed (${n.status})`;if(o.includes("application/json"))try{e=(await n.json())?.error?.message||e}catch(t){console.warn("[callAI] could not parse AI error body",{status:n.status,message:t?.message})}else{const t=await n.text().catch(()=>"");t.includes("<!doctype")||t.includes("<html")?e=`AI service timeout or gateway error (${n.status})`:t&&(e=t.slice(0,200))}throw new Error(e)}if(o.includes("application/json"))try{return await n.json()}catch{return{content:[{text:await n.text().catch(()=>"")}]}}const c=await n.text().catch(()=>"");try{return JSON.parse(c)}catch{return{content:[{text:c}]}}}export{y as c};
