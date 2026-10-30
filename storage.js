/* When We Meet — dependency-free IndexedDB store, safe local CRUD. */
(() => {
  'use strict';
  const NAME = 'when-we-meet-journal-v1', KEY = 'primary';
  let dbPromise;
  const now = () => new Date().toISOString();
  const uuid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const clone = x => structuredClone(x);
  const blank = () => ({people:[],branches:[],thoughts:[]});
  const db = () => dbPromise ||= new Promise((resolve,reject)=>{
    if(!('indexedDB' in window)) return reject(new Error('This browser does not support local saving. Open the app in recent Chrome or Edge.'));
    const request = indexedDB.open(NAME, 1);
    request.onupgradeneeded = () => { const d=request.result; if(!d.objectStoreNames.contains('state')) d.createObjectStore('state'); };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(new Error('Local saving is blocked. Check your browser settings; avoid private/incognito mode.'));
    request.onblocked=()=>reject(new Error('Close other open copies of this journal and try again.'));
  });
  const read = async () => {
    const d=await db();
    return new Promise((resolve,reject)=>{const t=d.transaction('state','readonly');const q=t.objectStore('state').get(KEY);q.onsuccess=()=>resolve(q.result ? clone(q.result) : blank());q.onerror=()=>reject(new Error('Unable to read journal data.'));});
  };
  const write = async value => {
    const d=await db();
    return new Promise((resolve,reject)=>{ const t=d.transaction('state','readwrite');t.objectStore('state').put(value,KEY);t.oncomplete=()=>resolve();t.onerror=()=>reject(new Error('Unable to save. Your device may be out of storage.'));t.onabort=()=>reject(new Error('Local database save was cancelled.')); });
  };
  // Serialize modifications to prevent concurrent read-modify-write data loss.
  let pending = Promise.resolve();
  const transaction = operation => {
    const job = pending.catch(()=>{}).then(async()=>{const state=await read();const result=operation(state);await write(state);return result;});
    pending=job.catch(()=>{});return job;
  };
  const requireText=(v,label,max)=>{if(typeof v!=='string'||!v.trim()||v.trim().length>max)throw Error(`${label} must be between 1 and ${max} characters.`);return v.trim();};
  const byId=(state,kind,id)=>{const found=state[kind].find(x=>x.id===id);if(!found)throw Error('This item no longer exists.');return found;};
  const pid=(state,id)=>{if(id!=null && id!=='')byId(state,'people',id);return id||null;};
  const branchCheck=(state,bid,personId)=>{if(!bid)return null;const b=byId(state,'branches',bid);if(b.person_id!==personId)throw Error('The branch must belong to the selected person.');return bid;};
  const parentCheck=(state,id,pId,excluded)=>{
    const seen=new Set(excluded?[excluded]:[]);let current=id,depth=0;
    while(current){if(seen.has(current))throw Error('A topic cannot be nested inside itself.');seen.add(current);const p=byId(state,'branches',current);if(p.person_id!==pId)throw Error('Parent topic belongs to another person.');current=p.parent_id;if(++depth>15)throw Error('Maximum topic depth exceeded.');}
    return id||null;
  };
  const validImport = raw => {
    if(!raw||typeof raw!=='object'||!['people','branches','thoughts'].every(k=>Array.isArray(raw[k])))throw Error('Not a valid When We Meet journal backup.');
    const s={people:raw.people,branches:raw.branches,thoughts:raw.thoughts};
    if(s.people.length>10000||s.branches.length>50000||s.thoughts.length>100000)throw Error('Backup is too large.');
    for(const kind of ['people','branches','thoughts'])if(s[kind].some(x=>!x||typeof x!=='object'||typeof x.id!=='string'||x.id.length<1||x.id.length>120))throw Error('Backup contains invalid record IDs.');
    const ids=[...s.people,...s.branches,...s.thoughts].map(x=>x.id);if(new Set(ids).size!==ids.length)throw Error('Backup has duplicate IDs.');
    const people=new Set(s.people.map(p=>p.id));const branches=new Map(s.branches.map(b=>[b.id,b]));
    for(const p of s.people)requireText(p.name,'Person name',80);
    for(const b of s.branches){requireText(b.name,'Branch name',80);if(!people.has(b.person_id))throw Error('A topic refers to a missing person.');if(b.parent_id){const pp=branches.get(b.parent_id);if(!pp||pp.person_id!==b.person_id)throw Error('A topic has an invalid parent.');}let cur=b,seen=new Set();while(cur){if(seen.has(cur.id)||seen.size>16)throw Error('Circular or overly nested topics in backup.');seen.add(cur.id);cur=branches.get(cur.parent_id);}}
    for(const t of s.thoughts){requireText(t.content,'Thought',10000);if(t.person_id&&!people.has(t.person_id))throw Error('A thought has a missing person.');if(t.branch_id&&(!branches.has(t.branch_id)||branches.get(t.branch_id).person_id!==t.person_id))throw Error('A thought has an invalid topic.');if(!['pending','discussed'].includes(t.status||'pending'))throw Error('A thought has an invalid status.');}
    return clone(s);
  };
  const create=(s,k,p)=>{
    const date=now(),v={id:uuid(),created_at:date,updated_at:date};
    if(k==='people'){v.name=requireText(p.name,'Name',80);v.icon=typeof p.icon==='string'?p.icon.slice(0,8):'✳';}
    else if(k==='branches'){v.person_id=pid(s,p.person_id);if(!v.person_id)throw Error('Choose a person first.');v.parent_id=parentCheck(s,p.parent_id||null,v.person_id);v.name=requireText(p.name,'Topic name',80);}
    else{v.person_id=pid(s,p.person_id);v.branch_id=branchCheck(s,p.branch_id,v.person_id);v.content=requireText(p.content,'Thought',10000);v.status='pending';v.starred=false;v.discussed_at=null;}
    s[k].push(v);return clone(v);
  };
  const patch=(s,k,id,p)=>{
    const v=byId(s,k,id);if(k==='people') {if('name'in p)v.name=requireText(p.name,'Name',80);if('icon'in p)v.icon=typeof p.icon==='string'?p.icon.slice(0,8):'✳';}
    else if(k==='branches'){if('name'in p)v.name=requireText(p.name,'Topic name',80);if('parent_id'in p)v.parent_id=parentCheck(s,p.parent_id||null,v.person_id,v.id);}
    else{
      if('content'in p)v.content=requireText(p.content,'Thought',10000);
      const proposedPerson='person_id'in p?pid(s,p.person_id):v.person_id;
      const proposedBranch='branch_id'in p?p.branch_id:v.branch_id;
      v.branch_id=branchCheck(s,proposedBranch,proposedPerson);v.person_id=proposedPerson;
      if('status'in p){if(!['pending','discussed'].includes(p.status))throw Error('Invalid discussion status.');if(p.status!==v.status)v.discussed_at=p.status==='discussed'?now():null;v.status=p.status;}
      if('starred'in p){if(typeof p.starred!=='boolean')throw Error('Invalid starred value.');v.starred=p.starred;}
    }
    v.updated_at=now();return clone(v);
  };
  const remove=(s,k,id)=>{
    byId(s,k,id);
    if(k==='branches'){
      const descendants=new Set([id]);let changed=true;while(changed){changed=false;for(const b of s.branches)if(b.parent_id&&descendants.has(b.parent_id)&&!descendants.has(b.id)){descendants.add(b.id);changed=true;}}
      for(const t of s.thoughts)if(descendants.has(t.branch_id)){t.branch_id=null;t.updated_at=now();}
      s.branches=s.branches.filter(b=>!descendants.has(b.id));
    } else if(k==='people'){
      for(const t of s.thoughts)if(t.person_id===id){t.person_id=null;t.branch_id=null;t.updated_at=now();}
      s.branches=s.branches.filter(b=>b.person_id!==id);s.people=s.people.filter(p=>p.id!==id);
    } else s.thoughts=s.thoughts.filter(t=>t.id!==id);
    return {ok:true};
  };
  async function request(method,path,payload){
    if(path==='/api/state'&&method==='GET')return read();
    if(path==='/api/export'&&method==='GET')return read();
    if(path==='/api/import'&&method==='POST'){const imported=validImport(payload);return transaction(s=>{s.people=imported.people;s.branches=imported.branches;s.thoughts=imported.thoughts;return {ok:true};});}
    const m=/^\/api\/(people|branches|thoughts)(?:\/([^/?]+))?$/.exec(path);
    if(!m)throw Error('Unknown operation.');
    const kind=m[1],id=m[2]?decodeURIComponent(m[2]):null;
    if(method==='POST'&&!id)return transaction(s=>create(s,kind,payload||{}));
    if(method==='PATCH'&&id)return transaction(s=>patch(s,kind,id,payload||{}));
    if(method==='DELETE'&&id)return transaction(s=>remove(s,kind,id));
    throw Error('Unsupported operation.');
  }
  const download = async () => {
    const state=await read();
    const body=JSON.stringify({...state,version:1,exported_at:now(),storage:'browser-indexeddb'},null,2);
    const blob=new Blob([body],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`when-we-meet-backup-${new Date().toISOString().slice(0,10)}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  };
  // Folder-linked snapshots are additional copies; IndexedDB stays the primary local store.
  // The directory handle is persisted in a separate object store so it survives tab closure.
  let folderHandle = null;
  const handleDB = () => new Promise((resolve,reject)=>{
    const req=indexedDB.open('wwm-folder-permission-v1',1);
    req.onupgradeneeded=()=>req.result.createObjectStore('handles');
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
  });
  async function saveHandle(handle){const d=await handleDB();return new Promise((resolve,reject)=>{const tx=d.transaction('handles','readwrite');tx.objectStore('handles').put(handle,'journal-folder');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
  async function restoreHandle(){try{const d=await handleDB();folderHandle=await new Promise((resolve,reject)=>{const tx=d.transaction('handles','readonly');const r=tx.objectStore('handles').get('journal-folder');r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error);});}catch{folderHandle=null;}return Boolean(folderHandle);}
  const folderStatus=async()=>{
    if(!folderHandle)return 'not-connected';
    try{return await folderHandle.queryPermission({mode:'readwrite'});}catch{return 'unsupported';}
  };
  async function writeFolderSnapshot(){
    if(!folderHandle)return false;
    if(await folderStatus()!=='granted')return false;
    const data=await read();
    const peopleById=new Map(data.people.map(p=>[p.id,p]));
    const branchById=new Map(data.branches.map(b=>[b.id,b]));
    const nameOf=b=>{const a=[];let node=b;let safety=0;while(node&&safety++<20){a.unshift(node.name);node=branchById.get(node.parent_id);}return a.join(' / ');};
    const lines=['WHEN WE MEET — MY CONVERSATION JOURNAL','=====================================','This is a readable copy of your journal. Edit thoughts inside index.html, not this file.','Saved: '+new Date().toLocaleString(),''];
    const appendThoughts=(personId)=>{const ts=data.thoughts.filter(t=>t.person_id===personId).sort((a,b)=>a.created_at.localeCompare(b.created_at));if(!ts.length)lines.push('  (No thoughts yet)');for(const t of ts){lines.push('  '+(t.status==='discussed'?'[Discussed]':'[To share]')+(t.starred?' ★':'')+(t.branch_id?'  '+nameOf(branchById.get(t.branch_id)):'  General'));lines.push('  '+t.content.split('\n').join('\n  '));lines.push('  Added: '+(t.created_at||'')+(t.discussed_at?' | Discussed: '+t.discussed_at:''),'');}};
    for(const p of data.people){lines.push('----------------------------------------------------','PERSON: '+p.name,'----------------------------------------------------');appendThoughts(p.id);lines.push('');}
    lines.push('----------------------------------------------------','MY UNASSIGNED THOUGHTS','----------------------------------------------------');appendThoughts(null);
    const files=[['journal.txt',lines.join('\n')],['journal-backup.json',JSON.stringify({...data,version:1,exported_at:now()},null,2)]];
    // Saving is serialized; any write failure keeps the browser database intact.
    for(const [filename,content] of files){const fh=await folderHandle.getFileHandle(filename,{create:true});const writable=await fh.createWritable();try{await writable.write(content);await writable.close();}catch(e){try{await writable.abort()}catch{}throw e;}}
    return true;
  }
  let folderWriteQueue=Promise.resolve();
  function enqueueFolderWrite(){const job=folderWriteQueue.catch(()=>{}).then(writeFolderSnapshot);folderWriteQueue=job.catch(e=>{console.warn('Folder snapshot could not be saved:',e);window.dispatchEvent(new CustomEvent('wwm-folder-error',{detail:e.message}));});return job;}
  async function chooseFolder(){
    if(typeof window.showDirectoryPicker!=='function')throw Error('Folder saving requires a supported Chrome or Edge browser. Use Settings → Save a backup instead.');
    const handle=await window.showDirectoryPicker({id:'wwm-journal',mode:'readwrite',startIn:'documents'});
    // The user MUST choose the extracted website folder in the browser prompt.
    if(await handle.requestPermission({mode:'readwrite'})!=='granted')throw Error('Folder write permission was not granted.');
    folderHandle=handle;await saveHandle(handle);await enqueueFolderWrite();return handle.name;
  }
  async function reconnectFolder(){
    if(!folderHandle)throw Error('Choose a folder first.');
    if(await folderHandle.requestPermission({mode:'readwrite'})!=='granted')throw Error('Folder permission was not granted.');
    await enqueueFolderWrite();return folderHandle.name;
  }
  const oldRequest=request;
  async function syncedRequest(method,path,payload){const result=await oldRequest(method,path,payload);if(method!=='GET'&&folderHandle)await enqueueFolderWrite().catch(e=>console.warn('Folder sync failed',e));return result;}
  const available = async () => {await db();await read();await restoreHandle();};
  window.WWMStore={request:syncedRequest,download,available,chooseFolder,reconnectFolder,folderStatus};
})();
