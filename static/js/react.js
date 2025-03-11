const { useState, useEffect, useRef} = React;

function App({dataFromFlask,db_config}) {
    const [trades, setTrades] = useState([]);
    const [dbConfig, setDbConfig] = useState(db_config);
    const [showMore, setShowMore] = useState(10);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [editkey, setEditKey] = useState('');
    const [editValue, setEditValue] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [isAddNew, setIsAddNew] = useState(false);
    const [isSortByNew, setIsSortByNew] = useState(false);
    
    const inputRef = useRef([]);
    
    const makeSort = ()=>{
        setIsSortByNew(prev=>!prev);
        setTrades(prev=>[...prev].reverse());
    }

    useEffect(() => {
        if (dataFromFlask && dataFromFlask!=='') {
            setTrades(dataFromFlask);
        }
    }, []);

    useEffect(() => {
        if (isAddNew && inputRef.current[0]) {
            flatpickr(inputRef.current[0], {  // Attaching Flatpickr to the input
                dateFormat: "Y-m-d",
                onChange: function(selectedDates) {
                    const date = new Date(selectedDates[0].toISOString());

                    // Get year, month, and day
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
                    const day = String(date.getDate()).padStart(2, '0'); // Pad single-digit days with leading 0

                    // Format as YYYY-MM-DD
                    const formattedDate = `${year}-${month}-${day}`;                    
                    setSelectedDate(formattedDate);
                                        
                }
            });
        }
    }, [isAddNew]);
    

    const editElement = (index,type,value)=>{
        setEditKey(type+'_'+index);
        setEditValue(value);
    }

    const saveToDB = async(id,type,value,index)=>{
        try {
            const response = await fetch('http://127.0.0.1:5000/update-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, type: type, value: value}),
            });
    
            const result = await response.json();
            if (type=='trade_code') {
                setTrades(prev=>([...prev,prev[index].trade_code=editValue]));
                setEditKey('');
                setEditValue(null);
            }
            if (type=='high') {
                setTrades(prev=>([...prev,prev[index].high=editValue]));
                setEditKey('');
                setEditValue(null);
            }
            if (type=='volume') {
                setTrades(prev=>([...prev,prev[index].volume=editValue]));
                setEditKey('');
                setEditValue(null);
            }
            if (type=='low') {
                setTrades(prev=>([...prev,prev[index].low=editValue]));
                setEditKey('');
                setEditValue(null);
            }
            if (type=='open') {
                setTrades(prev=>([...prev,prev[index].open=editValue]));
                setEditKey('');
                setEditValue(null);
            }
            if (type=='close') {
                setTrades(prev=>([...prev,prev[index].close=editValue]));
                setEditKey('');
                setEditValue(null);
            }
        } catch (error) {
            console.error("Error updating trade:", error);
        }
    }
    const updateData = (index,type,id)=>{
        if(type=='trade_code')
        {
            saveToDB(id,'trade_code',editValue,index)
        }
        if(type=='high')
        {
            saveToDB(id,'high',editValue,index)
        }
        if(type=='low')
        {
            saveToDB(id,'low',editValue,index)
        }
        if(type=='open')
        {
            saveToDB(id,'open',editValue,index)
        }
        if(type=='close')
        {
            saveToDB(id,'close',editValue,index)
        }
        if(type=='volume')
        {
            saveToDB(id,'volume',editValue,index)
        }
        
        // else{
        //     if (type=='trade_code') {
        //         setTrades(prev=>([...prev,prev[index].trade_code=editValue]));
        //         setEditKey('');
        //         setEditValue(null);
        //     }
        //     if (type=='high') {
        //         setTrades(prev=>([...prev,prev[index].high=editValue]));
        //         setEditKey('');
        //         setEditValue(null);
        //     }
        //     if (type=='volume') {
        //         setTrades(prev=>([...prev,prev[index].volume=editValue]));
        //         setEditKey('');
        //         setEditValue(null);
        //     }
        //     if (type=='low') {
        //         setTrades(prev=>([...prev,prev[index].low=editValue]));
        //         setEditKey('');
        //         setEditValue(null);
        //     }
        //     if (type=='open') {
        //         setTrades(prev=>([...prev,prev[index].open=editValue]));
        //         setEditKey('');
        //         setEditValue(null);
        //     }
        //     if (type=='close') {
        //         setTrades(prev=>([...prev,prev[index].close=editValue]));
        //         setEditKey('');
        //         setEditValue(null);
        //     }
        // }
    }
    const cancelUpdate = ()=>{
        setEditKey('');
        setEditValue(null);
    }

    const deleteItem = async(id)=>{
        try {
            const response = await fetch('http://127.0.0.1:5000/delete-data', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });
            const result = await response.json();
            // if (result.success=='true') {
            //     setTrades((prevTrades) => prevTrades.filter(trade => trade.id !== id));
            // }
            // else{
                
            // }
            setTrades((prevTrades) => prevTrades.filter(trade => trade.id !== id));
            } catch (error) {
            console.error('Error deleting item:', error);
            }
        

    }


    const insertData = async()=>{
        let newTrade = {
            trade_code: inputRef.current[1].value,
            date: selectedDate,
            high: inputRef.current[2].value,
            low: inputRef.current[3].value,
            open: inputRef.current[4].value,
            close: inputRef.current[5].value,
            volume: inputRef.current[6].value,
        };
        if (dbConfig==false) {
            newTrade.id = trades.length;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/insert-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTrade),
            });
        
            const result = await response.json();
        
            if (result.success=='true') {
                setIsAddNew(prev=>!prev);
                setTrades(prev=>[{...newTrade,id:result.trade_id}, ...prev]);
            }
            else{
                setIsAddNew(prev=>!prev);
                setTrades(prev=>[newTrade, ...prev]);
            }
        } catch (error) {
            console.error('Error during data insertion:', error);
        }

    }

    console.log(trades[0])
    return (
        <div className="p-4 mt-2">
            <div className="mt-2 d-flex justify-content-between">
                <div className="my-2">
                    <button className={`btn rounded mx-auto ${isAddNew ? 'btn-danger' : 'btn-outline-primary'}`}  onClick={()=>setIsAddNew(prev=>!prev)}>{!isAddNew ? <span>Enter New Data</span> : <span>Cancel</span>}</button>
                </div>
                <div className="my-2">
                    <button className='btn rounded mx-auto btn-outline-primary'  onClick={()=>makeSort()}>{isSortByNew ? <span>Show Oldest</span> : <span>Show Newest</span>}</button>
                </div>
            </div>
            
            <table border="1" className="table table-hover">
                <thead>
                    <tr className="">
                        <th>Date</th>
                        <th>Trade Code</th>
                        <th>High</th>
                        <th>Low</th>
                        <th>Open</th>
                        <th>Close</th>
                        <th>Volume</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {isAddNew ? 
                        <tr>
                            <td>
                                <input ref={(el) => (inputRef.current[0] = el)} type="text" placeholder="Pick a date" />
                            </td>
                            <td>
                                <input ref={(el) => (inputRef.current[1] = el)} type="text" placeholder="Trade Code" />
                            </td>
                            <td>
                                <input ref={(el) => (inputRef.current[2] = el)} type="text" placeholder="High" />
                            </td>
                            <td>
                                <input ref={(el) => (inputRef.current[3] = el)} type="text" placeholder="Low" />
                            </td>
                            <td>
                                <input ref={(el) => (inputRef.current[4] = el)} type="text" placeholder="Open" />
                            </td>
                            <td>
                                <input ref={(el) => (inputRef.current[5] = el)} type="text" placeholder="Close" />
                            </td>
                            <td>
                                <input ref={(el) => (inputRef.current[6] = el)} type="text" placeholder="Volume" />
                            </td>
                            <td>
                                <button className="btn btn-primary rounded" onClick={()=>insertData()}>Submit</button>
                            </td>
                        </tr>
                    : null
                    }
                    {trades && trades.length>0 ? trades.map((item, index) => index+1 < showMore ?
                        <tr key={index} onMouseEnter={() => setHoveredRow(index+1)} onMouseLeave={() => setHoveredRow(0)}>
                            <td >{item.date}</td>
                            <td>
                                {editkey!=='trade_code_'+index ? 
                                <span>{item.trade_code}</span>
                                :
                                <span><input type="text" placeholder="press ENTER to save" value={editValue } onChange={(e)=>setEditValue(e.target.value)} onKeyDown={(e)=>{if(e.key=='Enter')updateData(index,'trade_code',item.id)}}/> <button className="btn btn-danger rounded btn-sm" onClick={()=>cancelUpdate()}>Cancel</button></span>}
                                
                                {hoveredRow==index+1 ? 
                                (editkey!=='trade_code_'+index ? <i class="fa-solid fa-pen mx-2" element_type='trade_code' style={{ cursor: "pointer" }} onClick={(e)=>editElement(index,e.target.getAttribute('element_type'),item.trade_code)}></i> : null)
                                :null}
                            </td>
                            <td>
                                {editkey!=='high_'+index ? 
                                <span>{item.high}</span>
                                :
                                <span><input type="text" value={editValue } placeholder="press ENTER to save" onChange={(e)=>setEditValue(e.target.value)} onKeyDown={(e)=>{if(e.key=='Enter')updateData(index,'high',item.id)}}/> <button className="btn btn-danger rounded btn-sm" onClick={()=>cancelUpdate()}>Cancel</button></span>}
                                
                                {hoveredRow==index+1 ? 
                                (editkey!=='high_'+index ? <i class="fa-solid fa-pen mx-2" element_type='high' style={{ cursor: "pointer" }} onClick={(e)=>editElement(index,e.target.getAttribute('element_type'),item.high)}></i> : null)
                                :null}
                            </td>
                            {/* <td>{item.high}{hoveredRow==index+1 ? <i class="fa-solid fa-pen mx-2" style={{ cursor: "pointer" }}></i>:null}</td> */}
                            <td>
                                {editkey!=='low_'+index ? 
                                <span>{item.low}</span>
                                :
                                <span><input type="text" value={editValue } placeholder="press ENTER to save" onChange={(e)=>setEditValue(e.target.value)} onKeyDown={(e)=>{if(e.key=='Enter')updateData(index,'low',item.id)}}/> <button className="btn btn-danger rounded btn-sm" onClick={()=>cancelUpdate()}>Cancel</button></span>}
                                
                                {hoveredRow==index+1 ? 
                                (editkey!=='low_'+index ? <i class="fa-solid fa-pen mx-2" element_type='low' style={{ cursor: "pointer" }} onClick={(e)=>editElement(index,e.target.getAttribute('element_type'),item.low)}></i> : null)
                                :null}
                            </td>
                            {/* <td>{item.low}{hoveredRow==index+1 ? <i class="fa-solid fa-pen mx-2" style={{ cursor: "pointer" }}></i>:null}</td> */}
                            <td>
                                {editkey!=='open_'+index ? 
                                <span>{item.open}</span>
                                :
                                <span><input type="text" value={editValue } placeholder="press ENTER to save" onChange={(e)=>setEditValue(e.target.value)} onKeyDown={(e)=>{if(e.key=='Enter')updateData(index,'open',item.id)}}/> <button className="btn btn-danger rounded btn-sm" onClick={()=>cancelUpdate()}>Cancel</button></span>}
                                
                                {hoveredRow==index+1 ? 
                                (editkey!=='open_'+index ? <i class="fa-solid fa-pen mx-2" element_type='open' style={{ cursor: "pointer" }} onClick={(e)=>editElement(index,e.target.getAttribute('element_type'),item.open)}></i> : null)
                                :null}
                            </td>
                            {/* <td>{item.open}{hoveredRow==index+1 ? <i class="fa-solid fa-pen mx-2" style={{ cursor: "pointer" }}></i>:null}</td> */}
                            <td>
                                {editkey!=='close_'+index ? 
                                <span>{item.close}</span>
                                :
                                <span><input type="text" value={editValue } placeholder="press ENTER to save" onChange={(e)=>setEditValue(e.target.value)} onKeyDown={(e)=>{if(e.key=='Enter')updateData(index,'close',item.id)}}/> <button className="btn btn-danger rounded btn-sm" onClick={()=>cancelUpdate()}>Cancel</button></span>}
                                
                                {hoveredRow==index+1 ? 
                                (editkey!=='close_'+index ? <i class="fa-solid fa-pen mx-2" element_type='close' style={{ cursor: "pointer" }} onClick={(e)=>editElement(index,e.target.getAttribute('element_type'),item.close)}></i> : null)
                                :null}
                            </td>
                            {/* <td>{item.close}{hoveredRow==index+1 ? <i class="fa-solid fa-pen mx-2" style={{ cursor: "pointer" }}></i>:null}</td> */}
                            <td>
                                {editkey!=='volume_'+index ? 
                                <span>{item.volume}</span>
                                :
                                <span><input type="text" value={editValue } placeholder="press ENTER to save" onChange={(e)=>setEditValue(e.target.value)} onKeyDown={(e)=>{if(e.key=='Enter')updateData(index,'volume',item.id)}}/> <button className="btn btn-danger rounded btn-sm" onClick={()=>cancelUpdate()}>Cancel</button></span>}
                                
                                {hoveredRow==index+1 ? 
                                (editkey!=='volume_'+index ? <i class="fa-solid fa-pen mx-2" element_type='volume' style={{ cursor: "pointer" }} onClick={(e)=>editElement(index,e.target.getAttribute('element_type'),item.volume)}></i> : null)
                                :null}
                            </td>
                            {/* <td>{item.volume}{hoveredRow==index+1 ? <i class="fa-solid fa-pen mx-2" style={{ cursor: "pointer" }}></i>:null}</td> */}
                            <td><button className="btn btn-outline-danger" onClick={() => deleteItem(item.id)}>Delete</button></td>
                        </tr>:null

                    ): <p>No data</p>}
                </tbody>
            </table>
            <div className="mt-2 d-flex justify-content-between">
                {trades && trades.length>10 ? <button className="btn btn-outline-primary rounded mx-auto" onClick={()=>setShowMore(prev=>prev+10)}>Show +10</button>:null}
            </div>
        </div>
    );
}

if (document.getElementById("root")) {
    ReactDOM.render(<App dataFromFlask={data} db_config={db_config}/>, document.getElementById("root"));
}
