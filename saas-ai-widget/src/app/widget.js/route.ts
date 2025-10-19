import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const script = (publicId: string, primaryColor: string) => `(()=>{
  const sid='aiw-'+Date.now();
  const style=document.createElement('style');
  style.textContent=` + "`" + `
  .aiw-bubble{position:fixed;right:20px;bottom:20px;width:56px;height:56px;border-radius:9999px;background:${primaryColor};color:white;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 10px 20px rgba(0,0,0,.25);z-index:999999}
  .aiw-panel{position:fixed;right:20px;bottom:90px;width:360px;max-width:calc(100vw - 40px);height:520px;background:white;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 10px 20px rgba(0,0,0,.15);overflow:hidden;display:none;flex-direction:column;z-index:999999}
  .aiw-header{padding:12px 16px;border-bottom:1px solid #e5e7eb;font-weight:600}
  .aiw-messages{flex:1;overflow:auto;padding:12px}
  .aiw-input{display:flex;border-top:1px solid #e5e7eb}
  .aiw-input input{flex:1;padding:10px;border:0;outline:none}
  .aiw-input button{padding:0 12px;border:0;background:${primaryColor};color:white}
  ` + "`" + `;document.head.appendChild(style);
  const bubble=document.createElement('div');bubble.className='aiw-bubble';bubble.innerHTML='💬';document.body.appendChild(bubble);
  const panel=document.createElement('div');panel.className='aiw-panel';
  panel.innerHTML=` + "`" + `
    <div class="aiw-header">AI Assistant</div>
    <div class="aiw-messages"></div>
    <div class="aiw-input"><input placeholder="Напишите сообщение..."/><button>Отправить</button></div>
  ` + "`" + `;document.body.appendChild(panel);
  const messages=panel.querySelector('.aiw-messages');
  const input=panel.querySelector('input');
  const sendBtn=panel.querySelector('button');
  const add=(role,content)=>{const d=document.createElement('div');d.style.margin='6px 0';d.textContent=(role==='user'?'Вы: ':'ИИ: ')+content;messages.appendChild(d);messages.scrollTop=messages.scrollHeight;}
  const send=async()=>{const v=input.value.trim();if(!v) return; add('user',v);input.value='';
    const r=await fetch((window.__AIW_ORIGIN__||location.origin)+` + "'" + `/api/widget/chat` + "'" + `,{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ id:` + "'" + "${publicId}" + "'" + `, message:v })
    });
    const j=await r.json(); add('assistant', j.reply || '…');
  };
  bubble.onclick=()=>{panel.style.display=panel.style.display==='none'||!panel.style.display?'flex':'none'};
  sendBtn.onclick=send; input.onkeypress=e=>{if(e.key==='Enter') send();};
})();`;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return new NextResponse('Missing id', { status: 400 });
  const widget = await prisma.widget.findUnique({ where: { publicId: id }, include: { company: true } });
  if (!widget?.company) return new NextResponse('Not found', { status: 404 });
  const js = script(id, widget.company.primaryColor);
  return new NextResponse(js, { headers: { 'Content-Type': 'application/javascript', 'Cache-Control': 'public, max-age=300' } });
}
