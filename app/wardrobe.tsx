'use client';
import {useState} from 'react';
import {Check,RotateCw,Footprints} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {HEADS,OUTFITS,CLOTH_COLORS,type Appearance} from '@/lib/game/appearance';
import TravelerPreview from './traveler-preview';
export default function Wardrobe({name,appearance,onApply,onCancel}:{name:string;appearance:Appearance;onApply:(name:string,appearance:Appearance)=>void;onCancel:()=>void}){
 const [draft,setDraft]=useState({...appearance}),[draftName,setDraftName]=useState(name),[tab,setTab]=useState('head'),[facing,setFacing]=useState<0|1|2|3>(0),[walking,setWalking]=useState(true);
 const cleanName=draftName.trim(),validName=cleanName.length>0&&cleanName.length<=12&&!Array.from(cleanName).some(char=>char.charCodeAt(0)<32||char.charCodeAt(0)===127);
 return <form className="wardrobe" data-game-input onSubmit={e=>{e.preventDefault();if(validName)onApply(cleanName,draft);}}>
  <div className="wardrobe-preview"><span className="eyebrow">MY TRAVELER</span><TravelerPreview appearance={draft} facing={facing} walking={walking} size={190}/><strong>{cleanName||'여행자'}</strong><div className="wardrobe-preview-tools"><button type="button" onClick={()=>setFacing(old=>({0:1,1:3,3:2,2:0} as const)[old])}><RotateCw size={15}/>돌려 보기</button><button type="button" aria-pressed={walking} onClick={()=>setWalking(v=>!v)}><Footprints size={15}/>{walking?'멈추기':'걸어 보기'}</button></div></div>
  <div className="wardrobe-options"><label className="wardrobe-name" htmlFor="wardrobe-name">여행자 이름<Input id="wardrobe-name" value={draftName} maxLength={12} placeholder="이름을 지어 주세요" onChange={e=>setDraftName(e.target.value)}/></label>
   <Tabs value={tab} onValueChange={setTab}><TabsList><TabsTrigger value="head">얼굴·머리</TabsTrigger><TabsTrigger value="outfit">옷</TabsTrigger><TabsTrigger value="color">색상</TabsTrigger></TabsList></Tabs>
   {tab==='head'&&<div className="wardrobe-choices" aria-label="얼굴과 머리 선택">{HEADS.map((head,i)=><button type="button" key={head} aria-pressed={draft.head===i} onClick={()=>setDraft(v=>({...v,head:i}))}><TravelerPreview appearance={{...draft,head:i}} size={82}/><span>{head.split(' · ')[0]}<small>{head.split(' · ')[1]}</small></span>{draft.head===i&&<Check size={16}/>}</button>)}</div>}
   {tab==='outfit'&&<div className="wardrobe-choices outfits" aria-label="옷 선택">{OUTFITS.map((outfit,i)=><button type="button" key={outfit} aria-pressed={draft.outfit===i} onClick={()=>setDraft(v=>({...v,outfit:i}))}><TravelerPreview appearance={{...draft,outfit:i}} size={82}/><span>{outfit}</span>{draft.outfit===i&&<Check size={16}/>}</button>)}</div>}
   {tab==='color'&&<div className="wardrobe-colors" aria-label="옷 색상 선택">{CLOTH_COLORS.map((color,i)=><button type="button" key={color.name} aria-pressed={draft.color===i} onClick={()=>setDraft(v=>({...v,color:i}))}><i style={{background:color.hex}}>{draft.color===i&&<Check size={22}/>}</i>{color.name}</button>)}</div>}
   <p className="wardrobe-note">고른 모습으로 함께 걷고 싸워요. 꾸미기는 무료이며 모험과 함께 저장됩니다.</p>
  </div><div className="wardrobe-actions"><button type="button" onClick={onCancel}>취소</button><button type="submit" className="primary-button" disabled={!validName}><Check size={16}/>이 모습으로 모험하기</button></div>
 </form>;
}
