import{r as B,j as I,l as E,m as P,B as R,n as T}from"./Loader-KPMfHIyW.js";import{j as _,r as g}from"./index-CDLRPKiO.js";const H=["h1","h2","h3","h4","h5","h6"],D=["xs","sm","md","lg","xl"];function F(t,e){const i=e!==void 0?e:`h${t}`;return H.includes(i)?{fontSize:`var(--mantine-${i}-font-size)`,fontWeight:`var(--mantine-${i}-font-weight)`,lineHeight:`var(--mantine-${i}-line-height)`}:D.includes(i)?{fontSize:`var(--mantine-font-size-${i})`,fontWeight:`var(--mantine-h${t}-font-weight)`,lineHeight:`var(--mantine-h${t}-line-height)`}:{fontSize:B(i),fontWeight:`var(--mantine-h${t}-font-weight)`,lineHeight:`var(--mantine-h${t}-line-height)`}}var N={root:"m_8a5d1357"};const O={order:1},W=T((t,{order:e,size:i,lineClamp:o,textWrap:r})=>{const s=F(e||1,i);return{root:{"--title-fw":s.fontWeight,"--title-lh":s.lineHeight,"--title-fz":s.fontSize,"--title-line-clamp":typeof o=="number"?o.toString():void 0,"--title-text-wrap":r}}}),S=I(t=>{const e=E("Title",O,t),{classNames:i,className:o,style:r,styles:s,unstyled:u,order:l,vars:c,size:m,variant:w,lineClamp:k,textWrap:b,mod:d,attributes:n,...a}=e,h=P({name:"Title",props:e,classes:N,className:o,style:r,classNames:i,styles:s,unstyled:u,attributes:n,vars:c,varsResolver:W});return[1,2,3,4,5,6].includes(l)?_.jsx(R,{...h("root"),component:`h${l}`,variant:w,mod:[{order:l,lineClamp:typeof k=="number"},d],size:m,...a}):null});S.classes=N;S.varsResolver=W;S.displayName="@mantine/core/Title";/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=t=>t==null?void 0:t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function V(t,e,i=[]){if(e==null)throw new Error("[lucide]: iconNode is required when icon name is used");return{name:U(t),size:24,node:e,...i.length>0?{aliases:i}:{}}}/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=t=>{let e="",i=!1;for(const o of t){if(o==="-"||o==="_"||o<=" "){i=e.length>0;continue}e.length===0?e+=o.toLowerCase():e+=i?o.toUpperCase():o,i=!1}return e};/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=t=>{const e=q(t);return e.charAt(0).toUpperCase()+e.slice(1)};/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=(...t)=>t.filter((e,i,o)=>!!e&&e.trim()!==""&&o.indexOf(e)===i).join(" ").trim();/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function C(t){return t!=null}function M(t,e={}){var b,d;const i=e.attributeNames??{},o=n=>i[n]??n,r=t.size??t.width??f.width,s=t.size??t.height??f.height,u=((b=t.aliases)==null?void 0:b.filter(n=>typeof n=="string"&&n.trim()!=="").map(n=>`lucide-${n}`))??[],l=[...t.name?[`lucide-${t.name}`]:[],...u],c=((d=e.className)==null?void 0:d.split(" ").filter(Boolean))??[],m=e.includeDefaultClasses===!1?z(...c):z("lucide",...l,...c),w=e.absoluteStrokeWidth?Number(e.strokeWidth??f["stroke-width"])*Number(t.size??t.width??f.width)/Number(e.size??e.width??f.width):e.strokeWidth??f["stroke-width"];return["svg",{...Object.entries(f).reduce((n,[a,h])=>(n[o(a)]=h,n),{}),..."color"in e&&e.color&&{[o("stroke")]:e.color},..."size"in e&&C(e.size)&&{[o("width")]:e.size,[o("height")]:e.size},..."width"in e&&C(e.width)&&{[o("width")]:e.width},..."height"in e&&C(e.height)&&{[o("height")]:e.height},[o("stroke-width")]:w,...m&&{[o("class")]:m},[o("viewBox")]:`0 0 ${r} ${s}`,...e.hasA11yProp===!1?{[o("aria-hidden")]:"true"}:{},..."attributes"in e&&e.attributes},t.node.map(n=>{const[a,h,v]=n,x=e.nonScalingStroke?{[o("vector-effect")]:"non-scaling-stroke",...h}:h;return v?[a,x,v]:[a,x]})]}/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function Z(t,e={}){return M(t,{...e,attributeNames:{...e.attributeNames,class:"className","stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","vector-effect":"vectorEffect"}})}/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1},J=g.createContext({}),Q=()=>g.useContext(J),X=g.forwardRef(({color:t,size:e,width:i,height:o,strokeWidth:r,absoluteStrokeWidth:s,nonScalingStroke:u,className:l="",children:c,iconNode:m=[],icon:w={node:m,aliases:[],size:24},...k},b)=>{const{size:d=24,strokeWidth:n=2,absoluteStrokeWidth:a=!1,nonScalingStroke:h=!1,color:v="currentColor",className:x=""}=Q()??{},p=!!c||G(k),[y,$,A=[]]=Z(w,{color:t??v,width:i??e??d,height:o??e??d,strokeWidth:r??n,absoluteStrokeWidth:s??a,nonScalingStroke:u??h,className:z(x,l),hasA11yProp:p,attributes:k});return g.createElement(y,{ref:b,...$},[...A.map(([L,j])=>g.createElement(L,j)),...Array.isArray(c)?c:[c]])});/**
 * @license lucide-react v1.73.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function te(t,e=[],i=[]){const o=typeof t=="string"?V(t,e,i):t,r=g.forwardRef(({className:s,...u},l)=>g.createElement(X,{ref:l,icon:o,className:s,...u}));return o.name&&(r.displayName=K(o.name)),r}const oe={size:16,strokeWidth:1.5,"aria-hidden":!0},ie={size:14,strokeWidth:1.5,"aria-hidden":!0};export{oe as I,S as T,ie as a,te as c};
