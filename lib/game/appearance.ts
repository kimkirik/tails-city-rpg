export type Appearance={head:number;outfit:number;color:number};
export const HEADS=['씩씩한 얼굴 · 짧은 머리','밝은 얼굴 · 포니테일','웃는 얼굴 · 웨이브','차분한 얼굴 · 단발'];
export const OUTFITS=['여행 재킷','편안한 후드','스포티 야구 점퍼'];
export const CLOTH_COLORS=[{name:'청록',hex:'#389eb5'},{name:'장미',hex:'#ce677e'},{name:'보라',hex:'#9273c6'},{name:'노랑',hex:'#d7aa4b'},{name:'초록',hex:'#62996c'}];
export const defaultAppearance=():Appearance=>({head:0,outfit:0,color:0});
export function validAppearance(value:unknown):value is Appearance{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const v=value as Appearance;
 return Number.isInteger(v.head)&&v.head>=0&&v.head<HEADS.length&&Number.isInteger(v.outfit)&&v.outfit>=0&&v.outfit<OUTFITS.length&&Number.isInteger(v.color)&&v.color>=0&&v.color<CLOTH_COLORS.length;
}
