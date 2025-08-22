import React, { useState, useEffect, useRef } from "react";
import TaskList from "./TaskList";
import * as monaco from "monaco-editor";

const TEMPLATES = {
  "Todo App": {
    "App.jsx": `import React,{useState} from 'react';
import TaskList from './TaskList';
export default function App(){
  const [todos,setTodos]=useState([{id:1,title:'Sample Task'}]);
  const [newTask,setNewTask]=useState('');
  const handleAddTask=()=>{if(!newTask.trim())return;setTodos([...todos,{id:Date.now(),title:newTask}]);setNewTask('');};
  return (
    <div style={{padding:20}}>
      <h2>Todo App</h2>
      <input value={newTask} onChange={e=>setNewTask(e.target.value)} placeholder='New Task'/>
      <button onClick={handleAddTask}>Add Task</button>
      <TaskList tasks={todos}/>
    </div>
  )
}`
  },
  "Calculator": {
    "App.jsx": `import React,{useState} from 'react';
export default function App(){
  const [value,setValue]=useState('');
  const handleClick=v=>setValue(value+v);
  const handleClear=()=>setValue('');
  const handleResult=()=>setValue(eval(value)||'');
  return (
    <div style={{padding:20}}>
      <h2>Calculator</h2>
      <input value={value} readOnly/>
      <div>{['1','2','3','4','5','6','7','8','9','0','+','-','*','/'].map(v=>(<button key={v} onClick={()=>handleClick(v)}>{v}</button>))}
      <button onClick={handleClear}>C</button>
      <button onClick={handleResult}>=</button>
      </div>
    </div>
  )
}`
  },
  "Notes App": {
    "App.jsx": `import React,{useState} from 'react';
export default function App(){
  const [notes,setNotes]=useState([]);
  const [newNote,setNewNote]=useState('');
  const addNote=()=>{if(!newNote.trim())return;setNotes([...notes,newNote]);setNewNote('');};
  return (
    <div style={{padding:20}}>
      <h2>Notes App</h2>
      <input value={newNote} onChange={e=>setNewNote(e.target.value)} placeholder='New Note'/>
      <button onClick={addNote}>Add Note</button>
      <ul>{notes.map((note,i)=><li key={i}>{note}</li>)}</ul>
    </div>
  )
}`
  },
  "Weather App": {
    "App.jsx": `import React,{useState} from 'react';
export default function App(){
  const [city,setCity]=useState('');
  const [weather,setWeather]=useState('');
  const fetchWeather=()=>{setWeather(\`\${city}:25°C, Sunny\`);};
  return (
    <div style={{padding:20}}>
      <h2>Weather App</h2>
      <input value={city} onChange={e=>setCity(e.target.value)} placeholder='City'/>
      <button onClick={fetchWeather}>Get Weather</button>
      <div>{weather}</div>
    </div>
  )
}`
  },
  "Counter App": {
    "App.jsx": `import React,{useState} from 'react';
export default function App(){
  const [count,setCount]=useState(0);
  return (
    <div style={{padding:20}}>
      <h2>Counter App</h2>
      <div>{count}</div>
      <button onClick={()=>setCount(count+1)}>+</button>
      <button onClick={()=>setCount(count-1)}>-</button>
    </div>
  )
}`
  },
  "Clock App": {
    "App.jsx": `import React,{useState,useEffect} from 'react';
export default function App(){
  const [time,setTime]=useState(new Date().toLocaleTimeString());
  useEffect(()=>{const i=setInterval(()=>setTime(new Date().toLocaleTimeString()),1000);return()=>clearInterval(i);},[]);
  return (<div style={{padding:20}}><h2>Clock App</h2><div>{time}</div></div>);
}`
  },
  "Random Quote": {
    "App.jsx": `import React,{useState} from 'react';
const quotes=["Life is short","Carpe Diem","Stay positive","Dream big"];
export default function App(){
  const [quote,setQuote]=useState(quotes[0]);
  const generate=()=>setQuote(quotes[Math.floor(Math.random()*quotes.length)]);
  return (<div style={{padding:20}}><h2>Random Quote</h2><div>{quote}</div><button onClick={generate}>New Quote</button></div>);
}`
  }
};

export default function App() {
  const [fullName,setFullName]=useState("YK");
  const [template,setTemplate]=useState("Todo App");
  const [scaffold,setScaffold]=useState(TEMPLATES[template]);
  const [selectedFile,setSelectedFile]=useState(Object.keys(scaffold)[0]);
  const editorRef=useRef(null);
  const monacoRef=useRef(null);
  const iframeRef=useRef(null);

  useEffect(()=>{
    setScaffold(TEMPLATES[template]);
    setSelectedFile(Object.keys(TEMPLATES[template])[0]);
  },[template]);

  useEffect(()=>{
    if(!editorRef.current){
      monacoRef.current = monaco.editor.create(document.getElementById("editor"),{
        value:scaffold[selectedFile],
        language:"javascript",
        theme:"vs-dark",
        automaticLayout:true
      });
      monacoRef.current.onDidChangeModelContent(()=>{
        const value=monacoRef.current.getValue();
        setScaffold({...scaffold,[selectedFile]:value});
      });
      editorRef.current=true;
    }else{
      const model=monaco.editor.getModels()[0];
      model.setValue(scaffold[selectedFile]);
    }
  },[selectedFile,scaffold]);

  useEffect(()=>{
    const iframe=iframeRef.current;
    if(!iframe) return;
    const timeout=setTimeout(()=>{
      const html=`
      <html>
      <head>
        <title>${template}</title>
        <style>
          body{font-family:Arial,sans-serif;padding:20px;}
          button{margin:2px;}
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="module">
          ${scaffold[selectedFile]}
          import React from 'https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js';
          import ReactDOM from 'https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js';
          const root=document.getElementById('root');
          ReactDOM.render(React.createElement(App),root);
        </script>
      </body>
      </html>`;
      iframe.srcdoc=html;
    },100);
    return()=>clearTimeout(timeout);
  },[scaffold,selectedFile,template]);

  const exportZip=async()=>{
    const JSZip=await import("https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js").then(m=>m.default||m);
    const zip=new JSZip();
    Object.entries(scaffold).forEach(([path,content])=>zip.file(path,content));
    const blob=await zip.generateAsync({type:"blob"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`${template}.zip`;
    a.click();
  };

  return (
    <div style={{padding:20,fontFamily:"Arial, sans-serif"}}>
      <h1 style={{textAlign:"center"}}>AI App Builder - {fullName}</h1>
      <div style={{marginBottom:10}}>
        <label>Choose Template: </label>
        <select value={template} onChange={e=>setTemplate(e.target.value)}>
          {Object.keys(TEMPLATES).map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={exportZip} style={{marginLeft:10}}>Export ZIP</button>
      </div>
      <div style={{display:"flex",gap:"10px"}}>
        <div style={{flex:1}}>
          <div id="editor" style={{height:"400px",border:"1px solid #ccc"}}></div>
        </div>
        <div style={{flex:1}}>
          <iframe ref={iframeRef} title="Live Preview" style={{width:"100%",height:"400px",border:"1px solid #ccc"}} />
        </div>
      </div>
    </div>
  );
}
