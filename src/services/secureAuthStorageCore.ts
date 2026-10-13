type Index={id:string;count:number};
type Store={getItemAsync:(key:string)=>Promise<string|null>;setItemAsync:(key:string,value:string)=>Promise<void>;deleteItemAsync:(key:string)=>Promise<void>};
function parse(raw:string):Index{const value=JSON.parse(raw) as Index;if(!/^[a-f0-9-]+$/.test(value.id)||!Number.isInteger(value.count)||value.count<1||value.count>128)throw new Error('Invalid secure session index');return value;}
export function createSecureAuthStorage(store:Store,keyFor:(key:string)=>Promise<string>,newId:()=>string,removeLegacy:(key:string)=>Promise<void>){
 const discard=async(base:string,index:Index)=>{await Promise.all(Array.from({length:index.count},(_,i)=>store.deleteItemAsync(`${base}.${index.id}.${i}`).catch(()=>{})));};
 return {
  async getItem(key:string):Promise<string|null>{
   await removeLegacy(key);const base=await keyFor(key),raw=await store.getItemAsync(base);if(!raw)return null;const index=parse(raw);
   const chunks=await Promise.all(Array.from({length:index.count},(_,i)=>store.getItemAsync(`${base}.${index.id}.${i}`)));
   if(chunks.some(chunk=>chunk===null))throw new Error('Secure session is incomplete');return chunks.join('');
  },
  async setItem(key:string,value:string){
   const base=await keyFor(key),raw=await store.getItemAsync(base),old=raw?parse(raw):null,id=newId();
   // 450 Unicode code points fit below 2 KB even when each uses four UTF-8 bytes.
   const points=Array.from(value),count=Math.ceil(points.length/450)||1;if(count>128)throw new Error('Secure session is too large');
   const next={id,count};
   try{for(let i=0;i<count;i++)await store.setItemAsync(`${base}.${id}.${i}`,points.slice(i*450,(i+1)*450).join(''));
    await store.setItemAsync(base,JSON.stringify(next));
   }catch(error){await discard(base,next);throw error;}
   await removeLegacy(key);if(old)await discard(base,old);
  },
  async removeItem(key:string){const base=await keyFor(key),raw=await store.getItemAsync(base);await store.deleteItemAsync(base);await removeLegacy(key);if(raw)await discard(base,parse(raw));}
 };
}
