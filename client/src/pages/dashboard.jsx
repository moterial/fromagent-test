import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from '../authentication/authcontext';
import { DASHBOARD_RECRUITMENT_SUBMANAGERS, DASHBOARD_RECRUITMENT_2_SUBSUBMANAGERS, GET_SECURITY, CLIENT_SAVEREAD, DASHBOARD_BARCHART, DASHBOARD_PROFIT_2_SUBSUBMANAGERS, DASHBOARD_TODAYTASKS, DASHBOARD_PROFIT, DASHBOARD_RECRUITMENT, DASHBOARD_PROFIT_SUBMANAGERS} from '../consts/api.const';
import { PieChart } from 'react-minimal-pie-chart';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';



function TodayTasks(props) {
    const AuthState = props.AuthState;  
    const [clients, setClients] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [subManager, setSubManager] = useState([]);
    const [isRead, setIsRead] = useState(false);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [subManagerReminder, setSubManagerReminder] = useState([]);
    const [hasSecurity, setHasSecurity] = useState(false);


        


    useEffect(() => {
        async function fetchData() {
            await fetch(DASHBOARD_TODAYTASKS, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(AuthState)
            })
                .then(
                    response => {
                        if (response.ok) {
                            return response.json();
                        }
                        throw new Error(response);
                    }
                )
                .then(
                    data => {
                        setClients(data.clients);
                        setCandidates(data.candidates);
                        setSubManagerReminder(data.subManagerReminder);
                    }
                )
                .catch(
                    error => {
                        alert("系統繁忙，請稍後重新載入網頁。")
                    }
                )
            

        }
        fetchData();
    }, []);

    useEffect(() => {
        fetch(GET_SECURITY, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ AuthState})
        })
         .then( (res) => {
            if (res.ok) {
                return (res.json());
            }
        })
         .then( (data) => {
            if(data.status === "success"){
                const foundUser = data.body.foundUser;
                console.log(foundUser);
                if(foundUser.securityQuestion1 != null && foundUser.securityQuestion2 != null ){
                    console.log("has security");
                    setHasSecurity(true);
                }
            }
            
        })


    }, []);


    function handleChange(e){
        console.log(e.target.value);
        //an alert box to ensure the user wants to delete the item
        if (window.confirm("確定已經查閱此筆資料嗎？")) {
            setClients(clients.map((item) => {
                if (item._id === e.target.value) {
                    saveRead(item._id,item.caseID);
                    return {
                        ...item,
                        read: "yes"
                    };
                }
                
                return item;
            }));
            

        }else{
            //if the user clicks cancel, unchecked the checkbox
            document.getElementById(e.target.value).checked = false;
        }
    };

    function handleCheck(e){
        console.log(e.target.value);
        //an alert box to ensure the user wants to delete the item
        if (window.confirm("確定已經查閱此筆資料嗎？")) {
            setSubManagerReminder(subManagerReminder.map((item) => {
                if (item._id === e.target.value) {
                    saveRead(item._id,item.caseID);
                    return {
                        ...item,
                        read: "yes"
                    };
                }
                
                return item;
            }));
            

        }else{
            //if the user clicks cancel, unchecked the checkbox
            document.getElementById(e.target.value).checked = false;
        }

        
    }

    async function saveRead(docId,meetingID){
        console.log(docId);
        await fetch(CLIENT_SAVEREAD, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({id:docId,meetingID:meetingID})
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                    throw new Error(response);
            })
            .then(data => {
                    console.log(data);
            })
            .catch(
                error => {
                    alert("系統繁忙，請稍後重新載入網頁。")
            })
    }


    return (
        
        <div className='bounceInAnimation d-flex flex-column align-items-center justify-content-center '>

            

            <Modal show={show} onHide={handleClose} style="">
                <Modal.Header closeButton>
                <Modal.Title>22123</Modal.Title>
                </Modal.Header>
                <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleClose}>
                    Save Changes
                </Button>
                </Modal.Footer>
            </Modal>
            <div className='w-90 align-items-center'>
                {
                    hasSecurity==false ?
                    <div class="alert alert-danger" role="alert">
                        請先設定安全問題，以便於忘記密碼時，能夠透過安全問題找回密碼。
                    </div>
                    :null
                }
                <h2 className='text-center my-2'>今天事項</h2>
                <div className="w-100">
                    <h3>客人</h3>
                    <div className="overflow-auto">
                        <table className="table table_style" style={{ minWidth: "700px" }}>
                            <thead>
                                <th scope="col">姓名</th>
                                <th scope="col">項目</th>
                                <th scope="col">生意額</th>
                                <th scope="col">生意類別</th>
                                <th scope="col">備註</th>
                                <th scope="col">查閱</th>
                            </thead>
                            <tbody>
                                {!!(clients !== undefined) &&
                                    clients.map((client, index) => {
                                        if(client.read == "no"){
                                        return (
                                            <tr key={index}>
                                                <th scope="row">{client.clientName}</th>
                                                <td>{client.meeting.item.join("，")}</td>
                                                <td>{(client.meeting.profit !== undefined) && client.meeting.profit}</td>
                                                <td>{client.meeting.businessCategories.join("，")}</td>
                                                <td>{client.meeting.note !== undefined ?
                                                    client.meeting.note.split("\n").map(
                                                        line => <div>{line}</div>)
                                                    : ""}
                                                </td>
                                                <td><input type="checkbox"  id={client._id} value={client._id} onChange={handleChange}/></td>
                                            </tr>
                                        );
                                        }
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                    <h3>招募者</h3>
                    <div className="overflow-auto">
                        <table className="table table_style" style={{ minWidth: "700px" }}>
                            <thead>
                                <th scope="col">姓名</th>
                                <th scope="col">項目</th>
                                <th scope="col">類別</th>
                                <th scope="col">備註</th>
                                <th scope="col">查閱</th>
                            </thead>
                            <tbody>
                                {!!(candidates !== undefined) &&
                                    candidates.map((candidate, index) => {
                                        
                                            return (
                                                <tr>
                                                    <th scope="row">{candidate.candidateName}</th>
                                                    <td>{candidate.interview.item.join("，")}</td>
                                                    <td>{candidate.interview.categories.join("，")}</td>
                                                    <td>{candidate.interview.note !== undefined ?
                                                        candidate.interview.note.split("\n").map(
                                                            line => <div>{line}</div>)
                                                        : ""}
                                                    </td>
                                                    <td><input type="checkbox"/></td>
                                                </tr>
                                            );
                                        
                                        
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                    <h3>下線</h3>
                    <div className="overflow-auto">
                        <table className="table table_style" style={{ minWidth: "700px" }}>
                            <thead>
                                <th scope="col">姓名</th>
                                <th scope="col">項目</th>
                                <th scope="col">類別</th>
                                <th scope="col">備註</th>
                                <th scope="col">查閱</th>
                            </thead>
                            <tbody>

                                    {   
                                        subManagerReminder.length > 0 &&
                                        subManagerReminder.map((item, index) => {
                                            if(item.read == "no"){
                                                return (
                                                    <tr>
                                                        <th scope="row">{item.name}</th>
                                                        <td>{item.item}</td>
                                                        <td>{item.categories}</td>
                                                        <td>{item.note}</td>
                                                        <td><input type="checkbox" onChange={handleCheck} value={item._id} id={item.name}/></td>
                                                    </tr>
                                                );
                                            }
                                        })
                                       
                                    }

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Profit(props) {
    const AuthState = props.AuthState;
    const [profitData, setProfitData] = useState([]);
    const [subManagersData, setSubManagersData] = useState(['']);
    const [fetchingData, setFetchingData] = useState(true);
    const [showSubManagers, setShowSubManagers] = useState(false);
    const [showSubManagersTeam, setShowSubManagersTeam] = useState(false);
    const [fetchBtnStatus, setFetchBtnStatus] = useState(true);
    const [subManagersTeamProfit, setSubManagersTeamProfit] = useState([]);
    const [FetchRounds, setFetchRounds] = useState(20);
    const [chartPeriod, setChartPeriod] = useState('month');
    const [currentName, setCurrentName] = useState('Self');
    const [barChartData, setBarChartData] = useState([]);
    const [subManagerList, setSubManagerList] = useState([]);
    const [salesCycle, setSalesCycle] = useState('');



    function handleChange(event) {
        setBarChartData([]);
        setChartPeriod(event.target.value);
        setSalesCycle('');
        console.log(chartPeriod);
        console.log(subManagerList);
        fetchBarChart();

    };

    function handleName(e){
        setBarChartData([]);
        setSalesCycle('');
        console.log(e.target.value);
        fetchSubManagerBarChart(e.target.value);
        setCurrentName(e.target.value);
    }

    
    async function fetchBarChart(){
        let name = currentName;
        if(currentName == 'Self'){
            name = AuthState.username;
        }
        //handle fetch data when change period
        await fetch(DASHBOARD_BARCHART, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ AuthState:{username:name}, period: chartPeriod })
        })
            .then((response) => {
                if (response.ok) {
                    return (response.json());
                }
                throw new Error(response)
            }
            )
            .then((data) => {
                setBarChartData(data.body.barChart);
                console.log(data.body.barChart);
                setSalesCycle(data.body.salesCycle);
                console.log(data.body.salesCycle);
        })
    }

    async function fetchSubManagerBarChart(name){
        //handle fetch data when change name
        await fetch(DASHBOARD_BARCHART, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ AuthState:{username:name}, period: chartPeriod })
        })
            .then((response) => {
                if (response.ok) {
                    return (response.json());
                }
                throw new Error(response)
            }
            )
            .then((data) => {
                // setShowSubManagersBarChart(true);
                // setSubManagerBarChartData(subManagerBarChartData => [...subManagerBarChartData, data.body.barChart]);
                setBarChartData(data.body.barChart);
                setSalesCycle(data.body.salesCycle);
                console.log(data.body.salesCycle);
                // console.log(data.body.barChart);
        })
    }

    useEffect(() => {
        fetchBarChart();
    }, [chartPeriod]);
    
    async function fetchSubManagers(){
         await fetch(DASHBOARD_PROFIT_SUBMANAGERS, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(AuthState)
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error(response);
            })
            .then(data => {
                setSubManagersData(data.body);
                console.log(data.body);
                console.log(subManagersData);
                setShowSubManagers(true);
            })
            .catch(err => {
                alert("系統錯誤，請重新載入網頁。")
            });
    }

    async function fetchsubSubManagers(){
        console.log(subManagersData);
        let subSubManagers = [];
        for(let i = 0; i < 20; i++){
            if(subManagersData.subManagers[i].name !== undefined){
                subSubManagers.push(subManagersData.subManagers[i].name);
            }else{
                break;
            }
        }
        console.log(subSubManagers);
        
        document.getElementById("showMore").style.display = "none";
        await fetch(DASHBOARD_PROFIT_2_SUBSUBMANAGERS, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({AuthState, subSubManagers})
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error(response);
            })
            .then(data => {
                console.log(data.body);                   
                //append to the end of the array of subManagersTeamProfit
                setSubManagersTeamProfit(data.body.subManagers);
                setShowSubManagersTeam(true);

                
            })
            .catch(err => {
                alert("系統錯誤，請重新載入網頁。")
            });
    }


    useEffect(() => {
        setProfitData([]);
        fetch(DASHBOARD_PROFIT, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ AuthState:AuthState, period: chartPeriod })
        })
            .then((response) => {
                if (response.ok) {
                    return (response.json());
                }
                throw new Error(response)
            })
            .then((data) => {
                setProfitData(data.body);
                setFetchingData(false);
                setBarChartData(data.body.barChart);
                
                setSubManagerList(data.body.subManagerlist);
                console.log(data.body.salesCycle);
             
            })
            .catch((error) => {
                alert("系統繁忙，請稍後重新載入網頁。")
            }
            )    
    }, []);



    useEffect(() => {
        console.log('useEffect');
        let length = 0;
        if(subManagersData != 0){
            length = subManagersData.subManagers.length;
        }
        if( FetchRounds < length){
            console.log("fetching");
            let subSubManagers = [];
            for(let i = FetchRounds; i < FetchRounds+20; i++){
                subSubManagers.push(subManagersData.subManagers[i].name);
            }
             
            fetch(DASHBOARD_PROFIT_2_SUBSUBMANAGERS, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({AuthState, subSubManagers})
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error(response);
            })
            .then(data => {
                console.log(data.body); 
                console.log(subManagersTeamProfit);                  
                //append to the end of the array of the object of subManagersTeamProfit.subManagers
                for(let i = 0; i < 20; i++){
                    if(data.body.subManagers[i] !== undefined){
                        setSubManagersTeamProfit(subManagersTeamProfit => [...subManagersTeamProfit, data.body.subManagers[i]]);
                    }else{
                        break;
                    }
                }
                // setSubManagersTeamProfit(subManagersTeamProfit => [...subManagersTeamProfit, data.body.subManagers[0]], data.body.subManagers[1]);
                console.log(subManagersTeamProfit);    
            })
            .catch(err => {
                alert("系統錯誤，請重新載入網頁。")
            });
            setFetchRounds(FetchRounds + 20);
        }
    }, [subManagersTeamProfit]);



    

    return (
        <div className='bounceInAnimation d-flex flex-column align-items-center justify-content-center '>
            <div className='w-90 align-items-center'>
                <h2 className='text-center my-2'>營業額</h2>
                <div className='text-center'>年度目標</div>
                <div className="w-100 text-center">
                    <div className='mt-5'>現營業額：{!!(profitData.profit !== undefined) ? profitData.profit : ""}</div>
                    <div className='mb-3'>目標營業額：{!!(AuthState.profitTarget !== undefined) ? AuthState.profitTarget : ""}</div>
                </div>
                <PieChart
                    style={{ height: "500px" }}
                    label={(props) => { return props.dataEntry.title; }}
                    labelStyle={{ fontSize: "3px" }}
                    labelPosition={80}
                    data={
                        !fetchingData ?
                            [
                                { title: "首次見面", value: profitData.self.items[0] * 100, color: "#4E7E8F" },
                                { title: "Fact Finding", value: profitData.self.items[1] * 100, color: "#7FC7D0" },
                                { title: "睇 Proposal", value: profitData.self.items[2] * 100, color: "#7C7A9B" },
                                { title: "Try Closing", value: profitData.self.items[3] * 100, color: "#B7888A" },
                                { title: "Networking", value: profitData.self.items[4] * 100, color: "#EEAE6A" },
                                { title: "Done Deal", value: profitData.self.items[5] * 100, color: "#D46443" }
                            ].filter((item) => (item.value > 0))
                            : {}
                    } />
            </div>
            <div style={{ height: "50px" }} />
            <div className='w-90 overflow-scroll'>
                <table className="table table_style">
                    <thead>
                        <th scope="col">類別</th>
                        <th scope="col">首次見面</th>
                        <th scope="col">Fact Finding</th>
                        <th scope="col">睇 Proposal</th>
                        <th scope="col">Try Closing</th>
                        <th scope="col">Networking</th>
                        <th scope="col">Done Deal</th>
                        <th scope="col">MPF總數</th>
                        <th scope="col">保險總數</th>
                        <th scope="col">投資總數</th>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">自已</th>
                            {!fetchingData &&
                                profitData.self.items.map((item, index) => {
                                    return (<td>{(item * 100).toFixed(1)}%</td>)
                                })
                            }
                            <td>{!fetchingData && profitData.self.MPF}</td>
                            <td>{!fetchingData && profitData.self.insurance}</td>
                            <td>{!fetchingData && profitData.self.investment}</td>
                        </tr>
                        <tr>
                            <th scope="row">自已及以下所有員工</th>
                            {!fetchingData &&
                                profitData.selfA.items.map((item, index) => {
                                    return (<td>{(item * 100).toFixed(1)}%</td>)
                                })
                            }
                            <td>{!fetchingData && profitData.selfA.MPF}</td>
                            <td>{!fetchingData && profitData.selfA.insurance}</td>
                            <td>{!fetchingData && profitData.selfA.investment}</td>
                        </tr>
                        <tr>
                            <th scope="row">自已及以下所有直屬員工</th>
                            {!fetchingData &&
                                profitData.selfB.items.map((item, index) => {
                                    return (<td>{(item * 100).toFixed(1)}%</td>)
                                })
                            }
                            <td>{!fetchingData && profitData.selfB.MPF}</td>
                            <td>{!fetchingData && profitData.selfB.insurance}</td>
                            <td>{!fetchingData && profitData.selfB.investment}</td>
                        </tr>
                        {
                            !!showSubManagers &&
                            subManagersData.subManagers.map((submanager, index) => {

                                if(index === subManagersData.subManagers.length - 1){
                                    return(
                                       <button className='btn btn-primary text-center' id='showMore' onClick={fetchsubSubManagers}>顯示更多</button>
                                    )
                                }
                                return (
                                    <tr>
                                        <th scope="row">{submanager.name} (Self)</th>
                                        {
                                            submanager.self.items.map((item, index) => {
                                                return (
                                                    <td>{(item * 100).toFixed(1)}%</td>
                                                );
                                            })
                                        }
                                        <td>{submanager.self.MPF}</td>
                                        <td>{submanager.self.insurance}</td>
                                        <td>{submanager.self.investment}</td>
                                    </tr>
                                );
                                
                            })
                        }
                        {
                            !!showSubManagersTeam &&
                            subManagersTeamProfit.map((submanager, index) => {
                                return (
                                    <tr>
                                        <th scope="row">{submanager.name} (Team)</th>
                                        {
                                            submanager.team.items.map((item, index) => {
                                                return (
                                                    <td>{(item * 100).toFixed(1)}%</td>
                                                );
                                            })
                                        }
                                        <td>{submanager.team.MPF}</td>
                                        <td>{submanager.team.insurance}</td>
                                        <td>{submanager.team.investment}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
            <div className='d-flex w-100 justify-content-center'>
                {
                    !showSubManagers &&
                    <button className='btn btn-light' type="button" onClick={fetchSubManagers} disabled={!fetchBtnStatus}>
                        顯示屬下員工
                    </button>
                }

            </div>
            <div className='barchart mt-5 mb-3'>
                <h3 className='text-center pt-3'>分數統計圖</h3>
                <div className='period'>
                    <h4>圖表</h4>
                    <select className='period-selection ms-3' onChange={handleChange}>
                        <option value='week' >按星期</option>
                        <option value='month' selected="selected" >按月</option>
                        <option value='season'>按季</option>
                        <option value='year'>按年</option>
                    </select>

                    <h4 class="ps-5">名單</h4>
                    <select className='period-selection ms-3' onChange={handleName}>
                        <option value={AuthState.username} >Self</option>
                        {
                            
                            subManagerList.map((submanager, index) => {
                                return (
                                    <option value={submanager}>{submanager} (self)</option>
                                );
                            })
                        }      
                    </select>
                </div>
                <div className='barchart-section'>
                    <div className='title'><h4 className='barchart-title2' >Sales Cycle Average Time Range:{salesCycle}</h4></div>
                    <h3 className='barchart-title'>{currentName}</h3>
                    <BarChart
                        width={1100}
                        height={chartPeriod == 'week' ? 1500 : chartPeriod == 'season'? 600 : chartPeriod == 'year' ? 400 : 800}
                        data={barChartData}
                        margin={{
                            top: 30,
                            right: 30,
                            left: 200,
                            bottom: 5,
                        }}
                        layout="vertical"
                        >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey='name'type="category"  />
                        <Tooltip />
                        <Legend verticalAlign="top" height={36} />
                        <Bar barSize={100} dataKey="首次見面" fill="#fd7f6f" />
                        <Bar barSize={100} dataKey="FactFinding" fill="#7eb0d5" />
                        <Bar barSize={100} dataKey="睇Proposal" fill="#b2e061" />
                        <Bar barSize={100} dataKey="TryClosing" fill="#bd7ebe" />
                        <Bar barSize={100} dataKey="Networking" fill="#ffb55a" />
                        <Bar barSize={100} dataKey="DoneDeal" fill="#8bd3c7" />
                    </BarChart>
                    
                    
                </div>

                
        </div>
            <div className='w-90 mt-2 mb-3'>

                <h3>分數排行榜</h3>
                <div className="d-flex flex-sm-row flex-column">
                    <div className="col">
                        <table border="0">
                            <tbody>
                                <tr>
                                    <td colspan="2">本月</td>
                                </tr>
                                {
                                    !fetchingData &&
                                    !!(profitData.chart !== undefined) &&
                                    profitData.chart.month.map((item, index) => {
                                        return (
                                            <tr>
                                                <td className='pe-2'>{index + 1}. {item._id}</td>
                                                <td>{item.score}</td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className="col">
                        <table border="0">
                            <tbody>
                                <tr>
                                    <td colspan="2">本年</td>
                                </tr>
                                {
                                    !fetchingData &&
                                    !!(profitData.chart !== undefined) &&
                                    profitData.chart.year.map((item, index) => {
                                        return (
                                            <tr>
                                                <td className='pe-2'>{index + 1}. {item._id}</td>
                                                <td>{item.score}</td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}

function Recruitment(props) {
    const AuthState = props.AuthState;
    const [recruitmentData, setRecruitmentData] = useState([]);
    const [subManagersData, setSubManagersData] = useState([]);
    const [fetchingData, setFetchingData] = useState(true);
    const [showSubManagers, setShowSubManagers] = useState(false);
    const [fetchBtnStatus, setFetchBtnStatus] = useState(true);
    const [showSubManagersTeam, setShowSubManagersTeam] = useState(false);
    const [subManagersTeamProfit, setSubManagersTeamProfit] = useState([]);
    const [subManagerList, setSubManagerList] = useState([]);

    async function fetchSubManagers(e) {
        setFetchBtnStatus(false);
        await fetch(DASHBOARD_RECRUITMENT_SUBMANAGERS, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(AuthState)
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error(response)
            })
            .then(data => {
                setSubManagersData(data.body);
                setShowSubManagers(true);
            })
            .catch(err => {
                alert("系統繁忙，請稍後重新載入網頁。")
            });
    }

    async function fetchsubSubManagers(){
        console.log(subManagersData);
        let subSubManagers = [];
        for(let i = 0; i < 20; i++){
            if(subManagersData.subManagers[i].name !== undefined){
                subSubManagers.push(subManagersData.subManagers[i].name);
            }else{
                break;
            }
        }
        console.log(subSubManagers);
        
        document.getElementById("showMore").style.display = "none";
        await fetch(DASHBOARD_RECRUITMENT_2_SUBSUBMANAGERS, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({AuthState, subSubManagers})
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error(response);
            })
            .then(data => {
                console.log(data.body);                   
                //append to the end of the array of subManagersTeamProfit
                setSubManagersTeamProfit(data.body.subManagers);
                setShowSubManagersTeam(true);

                
            })
            .catch(err => {
                alert("系統錯誤，請重新載入網頁。")
            });
    }
    


    useEffect(() => {
        setRecruitmentData([])
        fetch(DASHBOARD_RECRUITMENT, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(AuthState)
        })
            .then((response) => {
                if (response.ok) {
                    return (response.json());
                }
                throw new Error(response);
            })
            .then((data) => {
                setRecruitmentData(data.body);
                setSubManagerList(data.body.subManagerlist);
                setFetchingData(false)
            })
            .catch((error) => {
                alert("系統繁忙，請稍後重新載入網頁。")
            }
            )
    }, []);

    return (
        <div className='bounceInAnimation d-flex flex-column align-items-center justify-content-center '>
            <div className='w-90 align-items-center'>
                <h2 className='text-center my-2'>招募者</h2>
                <div className='text-center'>年度目標</div>
                <div className="w-100 text-center">
                    <div className='mt-5'>現招募者數目：{!!(recruitmentData.recruitment !== undefined) ? recruitmentData.recruitment : ""}</div>
                    <div className='mb-3'>目標招募者數目：{!!(AuthState.recruitmentTarget !== undefined) ? AuthState.recruitmentTarget : ""}</div>
                </div>
                <PieChart
                    style={{ height: "500px" }}
                    label={(props) => { return props.dataEntry.title; }}
                    labelStyle={{ fontSize: "3px" }}
                    labelPosition={80}
                    data={
                        !fetchingData ?
                            [
                                { title: "首次見面", value: recruitmentData.self.items[0] * 100, color: "#4E7E8F" },
                                { title: "Networking", value: recruitmentData.self.items[1] * 100, color: "#7FC7D0" },
                                { title: "已報名考試", value: recruitmentData.self.items[2] * 100, color: "#7C7A9B" },
                                { title: "上掛牌堂", value: recruitmentData.self.items[3] * 100, color: "#B7888A" },
                                { title: "已經有牌", value: recruitmentData.self.items[4] * 100, color: "#EEAE6A" },
                                { title: "完成", value: recruitmentData.self.items[5] * 100, color: "#D46443" }
                            ].filter((item) => (item.value > 0))
                            : []
                    } />
            </div>
            <div style={{ height: "50px" }} />
            <div className='w-90 overflow-scroll'>
                <table className="table table_style">
                    <thead>
                        <th scope="col">類別</th>
                        <th scope="col">首次見面</th>
                        <th scope="col">Networking</th>
                        <th scope="col">已報名考試</th>
                        <th scope="col">上掛牌堂</th>
                        <th scope="col">已經有牌</th>
                        <th scope="col">完成</th>
                        <th scope="col">IR總數</th>
                        <th scope="col">NIR總數</th>
                        <th scope="col">BGA總數</th>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">自已</th>
                            {!fetchingData &&
                                recruitmentData.self.items.map((item, index) => {
                                    return (<td>{(item * 100).toFixed(1)}%</td>)
                                })
                            }
                            <td>{!fetchingData && recruitmentData.self.IR}</td>
                            <td>{!fetchingData && recruitmentData.self.NIR}</td>
                            <td>{!fetchingData && recruitmentData.self.BGA}</td>
                        </tr>
                        <tr>
                            <th scope="row">自已及以下所有員工</th>
                            {!fetchingData &&
                                recruitmentData.selfA.items.map((item, index) => {
                                    return (<td>{(item * 100).toFixed(1)}%</td>)
                                })
                            }
                            <td>{!fetchingData && recruitmentData.selfA.IR}</td>
                            <td>{!fetchingData && recruitmentData.selfA.NIR}</td>
                            <td>{!fetchingData && recruitmentData.selfA.BGA}</td>
                        </tr>
                        <tr>
                            <th scope="row">自已及以下所有直屬員工</th>
                            {!fetchingData &&
                                recruitmentData.selfB.items.map((item, index) => {
                                    return (<td>{(item * 100).toFixed(1)}%</td>)
                                })
                            }
                            <td>{!fetchingData && recruitmentData.selfB.IR}</td>
                            <td>{!fetchingData && recruitmentData.selfB.NIR}</td>
                            <td>{!fetchingData && recruitmentData.selfB.BGA}</td>
                        </tr>
                        {
                            !!showSubManagers &&
                            subManagersData.subManagers.map((submanager, index) => {

                                if(index === subManagersData.subManagers.length - 1){
                                    return(
                                       <button className='btn btn-primary text-center' id='showMore' onClick={fetchsubSubManagers}>顯示更多</button>
                                    )
                                }
                                return (
                                    <tr>
                                        <th scope="row">{submanager.name} (Self)</th>
                                        {
                                            submanager.self.items.map((item, index) => {
                                                return (
                                                    <td>{(item * 100).toFixed(1)}%</td>
                                                );
                                            })
                                        }
                                        <td>{submanager.self.IR}</td>
                                        <td>{submanager.self.NIR}</td>
                                        <td>{submanager.self.BGA}</td>
                                    </tr>
                                );
                                
                            })
                        }
                        {
                            !!showSubManagersTeam &&
                            subManagersTeamProfit.map((submanager, index) => {
                                return (
                                    <tr>
                                        <th scope="row">{submanager.name} (Team)</th>
                                        {
                                            submanager.team.items.map((item, index) => {
                                                return (
                                                    <td>{(item * 100).toFixed(1)}%</td>
                                                );
                                            })
                                        }
                                        <td>{submanager.team.IR}</td>
                                        <td>{submanager.team.NIR}</td>
                                        <td>{submanager.team.BGA}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
                <div className='d-flex w-100 justify-content-center'>
                    {
                        !showSubManagers &&
                        <button className='btn btn-light' type="button" onClick={fetchSubManagers} disabled={!fetchBtnStatus}>
                            顯示屬下員工
                        </button>
                    }

                </div>
            </div>

            <div className='w-90 mt-2 mb-3'>
                <h3>分數排行榜</h3>
                <div className="d-flex flex-sm-row flex-column">
                    <div className="col">
                        <table border="0">
                            <tbody>
                                <tr>
                                    <td colspan="2">本月</td>
                                </tr>
                                {
                                    !fetchingData &&
                                    !!(recruitmentData.chart !== undefined) &&
                                    recruitmentData.chart.month.map((item, index) => {
                                        return (
                                            <tr>
                                                <td className='pe-2'>{index + 1}. {item._id}</td>
                                                <td className='pe-2'>{item.score}</td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    </div>

                    <div className="col">
                        <table border="0">
                            <tbody>
                                <tr>
                                    <td colspan="2">本年</td>
                                </tr>
                                {
                                    !fetchingData &&
                                    !!(recruitmentData.chart !== undefined) &&
                                    recruitmentData.chart.year.map((item, index) => {
                                        return (
                                            <tr>
                                                <td className='pe-2'>{index + 1}. {item._id}</td>
                                                <td className='pe-2'>{item.score}</td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default function Dashboard(props) {
    const [AuthState, setAuthState] = useAuthState();
    const location = useLocation();

    return (
        <div>
            <ul className="nav nav-tabs justify-content-center">
                <li className="nav-item mx-2">
                    <NavLink className="nav-link" to="todaytasks">今日事項</NavLink>
                </li>
                <li className="nav-item mx-2">
                    <NavLink className="nav-link" to="profit">營業額</NavLink>
                </li>
                <li className="nav-item mx-2">
                    <NavLink className="nav-link" to="recruitment">招募者</NavLink>
                </li>
            </ul>
            <Routes>
                <Route path="/todaytasks" element={<TodayTasks AuthState={AuthState} />} />
                <Route path="/profit" element={<Profit AuthState={AuthState} />} />
                <Route path="/recruitment" element={<Recruitment AuthState={AuthState} />} />
                <Route path="/*" element={<Navigate to={location.pathname + "/todaytasks"} />} />
            </Routes>
        </div>
    );
}
