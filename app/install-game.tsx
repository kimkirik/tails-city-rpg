'use client';
import {useRef,useState} from 'react';
import {Download,Copy,Check,Save,Share2} from 'lucide-react';
import type {useGameInstall} from './use-game-install';
const GAME_URL='https://tails-city-rpg.kimkirik.chatgpt.site/';
const STEPS={
 ios:['Safari에서 이 게임을 열어 주세요.','공유 버튼을 누르고 ‘홈 화면에 추가’를 선택하세요.','‘웹 앱으로 열기’가 보이면 켠 뒤 ‘추가’를 누르세요.'],
 android:['Chrome에서 이 게임을 열어 주세요.','오른쪽 위 ⋮ 메뉴에서 ‘앱 설치’ 또는 ‘홈 화면에 추가’를 선택하세요.','설치를 완료하면 홈 화면의 리치 아이콘으로 실행할 수 있어요.'],
 'mac-safari':['Safari의 위쪽 메뉴에서 ‘파일’을 선택하세요.','‘Dock에 추가’를 누른 뒤 추가를 완료하세요.'],
 desktop:['Chrome 또는 Edge에서 이 게임을 열어 주세요.','주소창의 설치 아이콘이나 브라우저 메뉴의 ‘앱 설치’를 선택하세요.','추가된 테일즈 시티 아이콘으로 게임을 실행하세요.'],
 embedded:['아래에서 게임 주소를 복사하세요.','휴대폰은 Safari나 Chrome, PC는 Chrome·Edge·Safari에서 주소를 여세요.','열린 게임에서 설치 버튼을 다시 누르세요.']
};
export default function InstallGame({install,onExport}:{install:ReturnType<typeof useGameInstall>;onExport:()=>void}){
 const [message,setMessage]=useState(''),[copied,setCopied]=useState(false),input=useRef<HTMLInputElement>(null);
 const request=async()=>{const result=await install.request();setMessage(result==='accepted'?'설치를 요청했어요. 브라우저의 설치 절차를 완료해 주세요.':result==='dismissed'?'설치를 취소했어요. 아래 방법으로 나중에 다시 설치할 수 있어요.':result==='failed'?'설치 창을 열지 못했어요. 아래 안내를 따라 설치해 주세요.':result==='unavailable'?'이 브라우저에서는 아래 안내를 따라 설치해 주세요.':'설치 창에서 선택해 주세요.');};
 const copy=async()=>{try{await navigator.clipboard.writeText(GAME_URL);setCopied(true);}catch{input.current?.focus();input.current?.select();setMessage('주소를 길게 누르거나 복사 단축키로 복사해 주세요.');}};
 return <div className="install-content" data-game-input>
  <div className="install-identity"><img src="/icons/game-192.png" width={84} height={84} alt="갈색 푸들 리치 게임 아이콘"/><div><strong>테일즈 시티</strong><p>리치와 함께 떠나는 모험</p></div></div>
  {install.installed?<p className="install-success" role="status"><Check size={20}/>설치된 게임이에요. 리치 아이콘으로 다시 만나요!</p>:<>
   {install.available&&<button className="primary-button install-primary" disabled={install.pending} onClick={()=>void request()}><Download size={20}/>게임 설치</button>}
   {install.pending&&<p role="status" className="install-note">브라우저의 설치 창에서 선택해 주세요.</p>}
   {message&&<p role="status" className="install-note">{message}</p>}
   <div className="install-guide"><h3>{install.available?'메뉴에서 직접 설치하기':install.platform==='embedded'?'브라우저에서 설치하기':'홈 화면에 추가하기'}</h3><ol>{STEPS[install.platform].map(step=><li key={step}>{step}</li>)}</ol>{install.platform==='ios'&&<span className="install-share-hint"><Share2 size={17}/>공유 메뉴에서 홈 화면에 추가</span>}</div>
   <div className="install-copy"><label htmlFor="install-game-url">게임 주소</label><div><input id="install-game-url" ref={input} value={GAME_URL} readOnly onFocus={e=>e.currentTarget.select()}/><button onClick={()=>void copy()} aria-label="게임 주소 복사">{copied?<Check size={18}/>:<Copy size={18}/>}<span>{copied?'복사됨':'복사'}</span></button></div></div>
  </>}
  <div className="install-save"><button onClick={onExport}><Save size={17}/>모험 파일 저장</button><p>설치한 게임에서 이어 하려면 저장 파일을 열 수 있어요.</p></div>
  <p className="install-note">게임을 실행할 때는 인터넷 연결이 필요해요.</p>
 </div>;
}
