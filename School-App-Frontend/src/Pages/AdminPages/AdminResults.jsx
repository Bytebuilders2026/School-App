import { useState, useEffect, useRef } from "react";
import AdminSidebar from "../../Layouts/AdminSidebar";
import axios from "axios";
import { API_BASE_URL } from "../../apiConfig";

const CLASSES = ["Pre-Nursery","Nursery","KG","1st","2nd","3rd","4th","5th","6th","7th","8th","9th","10th","11th","12th"];
const EXAM_TYPES = ["All","Midterm","Final","Unit Test","Quiz"];
const SECTIONS = ["All","A","B","C","D"];

function gradeOf(p){if(p>=90)return"A+";if(p>=80)return"A";if(p>=70)return"B+";if(p>=60)return"B";if(p>=50)return"C";if(p>=40)return"D";return"F";}
function gColor(g){if(g==="A+"||g==="A")return"#22c55e";if(g==="B+"||g==="B")return"#3b82f6";if(g==="C")return"#f59e0b";if(g==="D")return"#f97316";return"#ef4444";}
function Bar({v,max=100,h=8,color}){
  const p=Math.min(((v||0)/(max||1))*100,100);
  const c=color||(p>=80?"#22c55e":p>=60?"#3b82f6":p>=40?"#f59e0b":"#ef4444");
  return(<div style={{background:"#f1f5f9",borderRadius:8,height:h}}><div style={{width:p+"%",background:c,height:h,borderRadius:8,transition:"width .6s"}}/></div>);
}

export default function AdminResults(){
  const [cls,setCls]=useState("9th");
  const [sec,setSec]=useState("All");
  const [exam,setExam]=useState("All");
  const [search,setSearch]=useState("");
  const [marks,setMarks]=useState([]);
  const [top,setTop]=useState([]);
  const [rt,setRt]=useState(null);
  const [loading,setLoading]=useState(false);
  const [modal,setModal]=useState(null);
  const timer=useRef(null);
  const hdr=()=>({Authorization:"Bearer "+localStorage.getItem("token")});

  const loadTop=async()=>{try{const r=await axios.get(API_BASE_URL+"/marks/top-students?limit=10",{headers:hdr()});setTop(r.data||[]);}catch(e){}};
  const loadRt=async()=>{try{const r=await axios.get(API_BASE_URL+"/marks/realtime-analysis",{headers:hdr()});setRt(r.data);}catch(e){}};
  const loadMarks=async()=>{
    setLoading(true);
    try{
      const s=sec==="All"?"A":sec;
      const p=exam!=="All"?{examType:exam}:{};
      const r=await axios.get(API_BASE_URL+"/marks/class/"+encodeURIComponent(cls)+"/section/"+s,{headers:hdr(),params:p});
      setMarks(r.data||[]);
    }catch(e){}finally{setLoading(false);}
  };

  useEffect(()=>{loadTop();loadRt();loadMarks();},[]);
  useEffect(()=>{loadMarks();},[cls,sec,exam]);
  useEffect(()=>{
    timer.current=setInterval(()=>{loadRt();loadTop();},30000);
    return()=>clearInterval(timer.current);
  },[]);

  const sMap={};
  marks.forEach(m=>{
    const id=m.student?._id;if(!id)return;
    if(!sMap[id])sMap[id]={id,name:m.student.name,roll:m.student.rollNumber,subs:[]};
    const pct=+((m.marksObtained/m.totalMarks)*100).toFixed(1);
    sMap[id].subs.push({sub:m.subject,exam:m.examType,got:m.marksObtained,tot:m.totalMarks,pct,gr:m.grade||gradeOf(pct)});
  });
  let students=Object.values(sMap).map(s=>{
    const avg=s.subs.length?+(s.subs.reduce((a,b)=>a+b.pct,0)/s.subs.length).toFixed(1):0;
    return{...s,avg};
  }).sort((a,b)=>b.avg-a.avg);
  const filtered=students.filter(s=>
    s.name.toLowerCase().includes(search.toLowerCase())||
    (s.roll||"").toLowerCase().includes(search.toLowerCase())
  );
  const passCount=filtered.filter(s=>s.avg>=40).length;
  const sel={appearance:"none",padding:"8px 28px 8px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,fontWeight:600,background:"#f8fafc",cursor:"pointer"};

  return(
    <AdminSidebar>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <div style={{fontFamily:"Inter,sans-serif",maxWidth:1200}}>

        {/* HEADER */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:10}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:800,color:"#1e293b",margin:0}}>📊 Results Management</h1>
            <p style={{color:"#64748b",fontSize:13,margin:0}}>Top performers · Class results · Live analytics</p>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:6,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:20,padding:"5px 12px"}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",display:"inline-block",animation:"pulse 2s infinite"}}/>
              <span style={{fontSize:12,color:"#16a34a",fontWeight:700}}>LIVE</span>
            </div>
            <button onClick={()=>{loadTop();loadRt();loadMarks();}} style={{padding:"8px 18px",borderRadius:10,border:"none",background:"#6366f1",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>↻ Refresh</button>
          </div>
        </div>

        {/* REAL-TIME KPI CARDS */}
        {rt&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:14,marginBottom:24}}>
            {[
              {label:"Total Entries",val:rt.totalEntries||0,color:"#6366f1",bg:"#eef2ff"},
              {label:"Overall Avg",val:(rt.overallAvg||0)+"%",color:"#0ea5e9",bg:"#f0f9ff"},
              {label:"Pass Rate",val:(rt.passRate||0)+"%",color:"#22c55e",bg:"#f0fdf4"},
              {label:"Fail Rate",val:(rt.failRate||0)+"%",color:"#ef4444",bg:"#fef2f2"},
              {label:"Total Passed",val:rt.passCount||0,color:"#16a34a",bg:"#f0fdf4"},
              {label:"Total Failed",val:rt.failCount||0,color:"#dc2626",bg:"#fef2f2"},
            ].map((c,i)=>(
              <div key={i} style={{background:"#fff",borderRadius:14,padding:"14px 16px",boxShadow:"0 1px 6px rgba(0,0,0,.06)",borderLeft:"3px solid "+c.color}}>
                <div style={{fontSize:24,fontWeight:900,color:c.color}}>{c.val}</div>
                <div style={{fontSize:11,color:"#64748b",fontWeight:600,marginTop:2}}>{c.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* TOP STUDENTS PODIUM */}
        <div style={{background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#4c1d95 100%)",borderRadius:20,padding:"24px 24px 20px",marginBottom:24,color:"#fff"}}>
          <div style={{fontWeight:800,fontSize:16,marginBottom:20}}>🏆 Top Performers — All Classes</div>
          {top.length===0?(
            <p style={{color:"rgba(255,255,255,.5)",fontSize:13}}>No marks data yet. Teachers must enter marks first.</p>
          ):(
            <>
              {/* Podium */}
              <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:12,marginBottom:24}}>
                {[top[1],top[0],top[2]].map((s,i)=>{
                  if(!s)return<div key={i} style={{width:130}}/>;
                  const h=[110,148,90][i],medals=["🥈","🥇","🥉"],ranks=[1,0,2];
                  return(
                    <div key={i} onClick={()=>setModal({...s,subs:s.subjects,avg:s.avgPct,class:s.class,section:s.section,roll:s.rollNumber})} style={{cursor:"pointer",textAlign:"center",width:130}}>
                      <div style={{fontSize:30,marginBottom:6}}>{medals[i]}</div>
                      <div style={{background:"rgba(255,255,255,.12)",backdropFilter:"blur(10px)",borderRadius:16,padding:"12px 10px",height:h,display:"flex",flexDirection:"column",justifyContent:"center",border:"1px solid rgba(255,255,255,.2)",transition:"transform .2s"}}
                        onMouseEnter={e=>e.currentTarget.style.transform="translateY(-5px)"}
                        onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                        <div style={{fontWeight:800,fontSize:13,lineHeight:1.3}}>{s.name}</div>
                        <div style={{fontSize:11,opacity:.65,margin:"4px 0"}}>Class {s.class}{s.section?" — "+s.section:""}</div>
                        <div style={{fontSize:26,fontWeight:900,color:"#fbbf24"}}>{s.avgPct}%</div>
                        <div style={{fontSize:10,opacity:.55}}>Roll #{s.rollNumber}</div>
                      </div>
                      <div style={{marginTop:8,fontSize:12,fontWeight:700,opacity:.7}}>Rank #{ranks[i]+1}</div>
                    </div>
                  );
                })}
              </div>
              {/* Ranks 4-10 list */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>
                {top.slice(3).map((s,i)=>(
                  <div key={i} onClick={()=>setModal({...s,subs:s.subjects,avg:s.avgPct,roll:s.rollNumber})}
                    style={{background:"rgba(255,255,255,.08)",borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",border:"1px solid rgba(255,255,255,.1)",transition:"background .2s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.16)"}
                    onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.08)"}>
                    <div style={{fontWeight:800,fontSize:14,color:"rgba(255,255,255,.45)",minWidth:24}}>#{i+4}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13}}>{s.name}</div>
                      <div style={{fontSize:11,opacity:.6}}>Class {s.class} · Roll #{s.rollNumber}</div>
                    </div>
                    <div style={{fontWeight:900,fontSize:17,color:"#fbbf24"}}>{s.avgPct}%</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* REAL-TIME ANALYSIS PANELS */}
        {rt&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:24}}>
            <div style={{background:"#fff",borderRadius:16,padding:"20px 22px",boxShadow:"0 1px 8px rgba(0,0,0,.06)"}}>
              <div style={{fontWeight:800,fontSize:14,color:"#1e293b",marginBottom:16}}>📚 Subject Average (School-wide)</div>
              {(rt.subjectAvg||[]).slice(0,7).map((s,i)=>(
                <div key={i} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:600,color:"#374151",marginBottom:3}}>
                    <span>{s._id}</span>
                    <span style={{color:s.avg>=60?"#22c55e":s.avg>=40?"#f59e0b":"#ef4444"}}>{(s.avg||0).toFixed(1)}%</span>
                  </div>
                  <Bar v={s.avg||0}/>
                </div>
              ))}
              {!rt.subjectAvg?.length&&<p style={{color:"#94a3b8",fontSize:13,textAlign:"center",padding:"20px 0"}}>No data yet</p>}
            </div>
            <div style={{background:"#fff",borderRadius:16,padding:"20px 22px",boxShadow:"0 1px 8px rgba(0,0,0,.06)"}}>
              <div style={{fontWeight:800,fontSize:14,color:"#1e293b",marginBottom:16}}>🏫 Class Performance Ranking</div>
              {(rt.classAvg||[]).map((c,i)=>{
                const mx=Math.max(...(rt.classAvg||[]).map(x=>x.avg||0),1);
                return(
                  <div key={i} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:600,color:"#374151",marginBottom:3}}>
                      <span>Class {c._id}</span>
                      <span style={{color:"#6366f1"}}>{(c.avg||0).toFixed(1)}% · {c.studentCount} students</span>
                    </div>
                    <Bar v={c.avg||0} max={mx} color="#6366f1"/>
                  </div>
                );
              })}
              {!rt.classAvg?.length&&<p style={{color:"#94a3b8",fontSize:13,textAlign:"center",padding:"20px 0"}}>No data yet</p>}
            </div>
          </div>
        )}

        {/* CLASS FILTER BAR */}
        <div style={{background:"#fff",borderRadius:16,padding:"14px 18px",marginBottom:14,boxShadow:"0 1px 8px rgba(0,0,0,.06)",display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative"}}><select style={sel} value={cls} onChange={e=>setCls(e.target.value)}>{CLASSES.map(c=><option key={c}>{c}</option>)}</select><span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:"#94a3b8",fontSize:10}}>▼</span></div>
          <div style={{position:"relative"}}><select style={sel} value={sec} onChange={e=>setSec(e.target.value)}>{SECTIONS.map(s=><option key={s}>{s}</option>)}</select><span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:"#94a3b8",fontSize:10}}>▼</span></div>
          <div style={{position:"relative"}}><select style={sel} value={exam} onChange={e=>setExam(e.target.value)}>{EXAM_TYPES.map(e=><option key={e}>{e}</option>)}</select><span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:"#94a3b8",fontSize:10}}>▼</span></div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name / roll no..." style={{flex:1,minWidth:180,padding:"8px 14px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc"}}/>
          <div style={{fontSize:13,color:"#64748b",fontWeight:600}}>
            <span style={{color:"#6366f1",fontWeight:800}}>{filtered.length}</span> students · <span style={{color:"#22c55e",fontWeight:800}}>{passCount}</span> pass · <span style={{color:"#ef4444",fontWeight:800}}>{filtered.length-passCount}</span> fail
          </div>
        </div>

        {/* RESULTS TABLE */}
        {loading?(
          <div style={{textAlign:"center",padding:60,background:"#fff",borderRadius:16}}>
            <div style={{width:36,height:36,border:"3px solid #e0e7ff",borderTop:"3px solid #6366f1",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 10px"}}/>
            <p style={{color:"#6366f1",fontSize:13,fontWeight:600}}>Loading results...</p>
          </div>
        ):(
          <div style={{background:"#fff",borderRadius:16,boxShadow:"0 1px 8px rgba(0,0,0,.06)",overflow:"hidden"}}>
            {filtered.length===0?(
              <div style={{textAlign:"center",padding:60,color:"#94a3b8"}}>
                <div style={{fontSize:40,marginBottom:10}}>📭</div>
                <p style={{fontSize:14}}>No results found for Class {cls}{sec!=="All"?" — Section "+sec:""}</p>
                <p style={{fontSize:12,color:"#cbd5e1"}}>Teachers must enter marks first</p>
              </div>
            ):(
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#f8fafc",borderBottom:"2px solid #e2e8f0"}}>
                    {["Rank","Name","Class","Roll No","Subjects","Average","Grade","Status","Details"].map(h=>(
                      <th key={h} style={{padding:"13px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".05em"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s,i)=>{
                    const g=gradeOf(s.avg),pass=s.avg>=40;
                    return(
                      <tr key={s.id} style={{borderBottom:"1px solid #f1f5f9",transition:"background .15s",cursor:"pointer"}}
                        onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{padding:"12px 14px",fontWeight:800,color:i<3?"#f59e0b":"#94a3b8",fontSize:16}}>
                          {i===0?"🥇":i===1?"🥈":i===2?"🥉":"#"+(i+1)}
                        </td>
                        <td style={{padding:"12px 14px",fontWeight:700,color:"#1e293b",fontSize:14}}>{s.name}</td>
                        <td style={{padding:"12px 14px"}}>
                          <span style={{background:"#eef2ff",color:"#6366f1",fontWeight:700,fontSize:11,padding:"3px 10px",borderRadius:20}}>
                            {cls}{sec!=="All"?" - "+sec:""}
                          </span>
                        </td>
                        <td style={{padding:"12px 14px",color:"#64748b",fontSize:13}}>{s.roll||"—"}</td>
                        <td style={{padding:"12px 14px",color:"#64748b",fontSize:13}}>{s.subs.length}</td>
                        <td style={{padding:"12px 14px",minWidth:130}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontWeight:800,fontSize:14,color:"#1e293b",minWidth:38}}>{s.avg}%</span>
                            <div style={{flex:1}}><Bar v={s.avg}/></div>
                          </div>
                        </td>
                        <td style={{padding:"12px 14px"}}>
                          <span style={{background:gColor(g)+"22",color:gColor(g),fontWeight:800,fontSize:12,padding:"3px 10px",borderRadius:20}}>{g}</span>
                        </td>
                        <td style={{padding:"12px 14px"}}>
                          <span style={{background:pass?"#f0fdf4":"#fef2f2",color:pass?"#16a34a":"#dc2626",fontWeight:700,fontSize:12,padding:"3px 10px",borderRadius:20}}>
                            {pass?"✓ Pass":"✗ Fail"}
                          </span>
                        </td>
                        <td style={{padding:"12px 14px"}}>
                          <button onClick={()=>setModal({...s,class:cls,section:sec})}
                            style={{background:"#eef2ff",border:"none",borderRadius:8,padding:"5px 14px",fontSize:12,fontWeight:600,cursor:"pointer",color:"#6366f1"}}>
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* STUDENT DETAIL MODAL */}
        {modal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setModal(null)}>
            <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:580,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
              {/* Modal Header */}
              <div style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",padding:"22px 24px",borderRadius:"20px 20px 0 0",color:"#fff"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontWeight:800,fontSize:20}}>{modal.name}</div>
                    <div style={{fontSize:13,opacity:.8,marginTop:4}}>
                      Class {modal.class}{modal.section&&modal.section!=="All"?" — Section "+modal.section:""} · Roll #{modal.roll||modal.rollNumber||"—"}
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:32,fontWeight:900,color:"#fbbf24"}}>{modal.avg??modal.avgPct}%</div>
                    <div style={{fontSize:11,opacity:.7}}>Overall Average</div>
                  </div>
                </div>
              </div>
              <div style={{padding:24}}>
                {/* Quick stats */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
                  {[
                    {label:"Grade",val:gradeOf(+(modal.avg??modal.avgPct))},
                    {label:"Status",val:(+(modal.avg??modal.avgPct))>=40?"✓ Pass":"✗ Fail"},
                    {label:"Subjects",val:(modal.subs||modal.subjects||[]).length},
                  ].map((c,i)=>(
                    <div key={i} style={{background:"#f8fafc",borderRadius:12,padding:"12px",textAlign:"center",border:"1px solid #e2e8f0"}}>
                      <div style={{fontWeight:800,fontSize:20,color:"#1e293b"}}>{c.val}</div>
                      <div style={{fontSize:11,color:"#64748b"}}>{c.label}</div>
                    </div>
                  ))}
                </div>
                {/* Subject breakdown */}
                <div style={{fontWeight:700,fontSize:14,color:"#374151",marginBottom:12}}>📚 Subject-wise Breakdown</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {(modal.subs||modal.subjects||[]).map((sub,i)=>{
                    const subName=sub.sub||sub.subject;
                    const pct=sub.pct!=null?sub.pct:+((( sub.marksObtained/sub.totalMarks)*100).toFixed(1));
                    const g=sub.gr||sub.grade||gradeOf(pct);
                    const got=sub.got??sub.marksObtained;
                    const tot=sub.tot??sub.totalMarks;
                    return(
                      <div key={i} style={{background:"#f8fafc",borderRadius:12,padding:"12px 14px",border:"1px solid #e2e8f0"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                          <span style={{fontWeight:700,fontSize:13,color:"#1e293b"}}>{subName}</span>
                          <div style={{display:"flex",gap:8,alignItems:"center"}}>
                            <span style={{background:gColor(g)+"22",color:gColor(g),fontWeight:800,fontSize:11,padding:"2px 8px",borderRadius:12}}>{g}</span>
                            <span style={{fontSize:12,color:"#64748b"}}>{got}/{tot}</span>
                          </div>
                        </div>
                        <Bar v={pct}/>
                        <div style={{fontSize:12,fontWeight:700,color:"#374151",marginTop:4}}>
                          {pct}%{sub.exam||sub.examType?" · "+(sub.exam||sub.examType):""}
                        </div>
                      </div>
                    );
                  })}
                  {!(modal.subs||modal.subjects||[]).length&&<p style={{color:"#94a3b8",textAlign:"center"}}>No subject data</p>}
                </div>
                <button onClick={()=>setModal(null)} style={{marginTop:20,width:"100%",padding:"12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
}
