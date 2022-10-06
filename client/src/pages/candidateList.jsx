import React from 'react';
import { useState, useEffect } from 'react';
import { Route, Routes, NavLink, useParams } from 'react-router-dom';
import { displayMeetingFields } from '../consts/candidatemeeting.const.js';
import { CANDIDATES_INTERVIEW_LIST_PATH, CANDIDATES_DELETE_INTERVIEWS_PATH, DELETE_CANDIDATES_PATH, CANDIDATES_CHANGE_NAME_PATH } from '../consts/api.const';
import { useAuthState } from '../authentication/authcontext.jsx';

function ChangeNameModal(props) {
    const updateValue = props.updateValue;
    const [AuthState, setAuthState] = useAuthState();
    const [newName, setNewName] = useState();
    const candidateID = useParams().itemID;
    const handleChange = (e) => {
        setNewName(e.target.value);
    }
    const changeName = (e) => {
        fetch(CANDIDATES_CHANGE_NAME_PATH, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user: JSON.stringify(AuthState),
                candidate: {
                    candidateID: candidateID,
                    candidateNewName: newName
                }
            })
        })
            .then(res => {
                if (res.ok) {
                    return (res.json())
                }
            })
            .then(
                json => {
                    alert(json.status + "\n" + json.message);
                    updateValue();
                }
            )
            .catch(
                error => {
                    alert(error);
                }
            )
    }

    return (
        <div className='modal fade' tabIndex="-1" id="changeName" aria-labelledby='modalTitle' aria-hidden="true">
            <div className="modal-dialog">
                <div className='modal-content'>
                    <div className='modal-header'>
                        <div className='modal-title text-dark' id="modalTitle">新名字</div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className='modal-body text-dark'>
                        <input className="w-100" onChange={handleChange} />
                    </div>
                    <div className='modal-footer'>
                        <button type="button" className="btn btn-dark" data-bs-toggle="modal" onClick={changeName} >確定</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Item(props) {

    const [editData, setEditData] = useState(false);
    const handleClick = () => {
        setEditData(!editData);
    }

    const updateValue = props.updateValue;

    const data = props.data;

    let itemID = useParams();

    const item = !!data && data.find(p => p.candidateID === itemID.itemID);

    //sort
    if (item.interviews.length > 0) {


        item.interviews.sort((a, b) => new Date(a.currentDate) <= new Date(b.currentDate) ? 1 : -1)

    }

    const deleteInterview = async (e) => {
        if (window.confirm("確定刪除已選取的項目嗎？")) {
            const targetInterview = {
                candidateID: item.candidateID,
                target: e.target.name
            };
            await fetch(CANDIDATES_DELETE_INTERVIEWS_PATH, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(targetInterview)
            })
                .then(
                    (response) => {
                        if (response.ok) {
                            return (response.json());
                        }
                    }
                )
                .then(
                    json => {
                        if (json.status === "success") {
                            window.alert(json.message);
                            updateValue();
                        }
                    }
                )
                .catch(
                    error => {
                        window.alert(error);
                    }
                );
        } else {
            return;
        }

    }

    return (
        <div className='bounceInAnimation d-flex flex-column align-items-center'>
            <ChangeNameModal updateValue={updateValue} />
            <div className="w-90 my-3 rounded border">
                <div className="w-100 px-3 py-2 bg-gray">
                    <small>招募者名稱</small><br />
                    <span style={{ fontSize: "20px" }}>
                        {item.candidateName + " "}
                        <button className="btn btn-dark" style={{ fontSize: "10px" }} type="button" data-bs-toggle="modal" data-bs-target="#changeName">更改名稱</button>
                    </span>
                </div>
            </div>
            <div className='w-90 overflow-auto'>
                <div className='my-1'>相關記錄</div>
                <table className="table bg-white" style={{ minWidth: "700px" }}>
                    <thead>
                        <tr>
                            {!!item.interviews &&
                                displayMeetingFields.map((field, index) => {
                                    return (
                                        <th scope="col">{field.label}</th>
                                    );
                                })
                            }
                            <th scope="row">
                                <div className='col d-inline-flex justify-content-end'>
                                    <button className={!!editData ? 'btn btn-dark rounded bi bi-unlock-fill' : 'btn btn-dark rounded bi bi-lock-fill'} onClick={handleClick}></button>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {!!item.interviews &&
                            item.interviews.map((interview, index) => {
                                interview.currentDate = new Date(interview.date).toLocaleDateString();
                                interview.next = new Date(interview.nextDate).toLocaleDateString();

                                return (
                                    <tr style={{ height: "60px" }}>
                                        <th scope="row">{interview.currentDate}</th>
                                        <td>{interview.item.join("，")}</td>
                                        <td>{interview.categories.join("，")}</td>
                                        <td>{interview.next}</td>
                                        <td>{interview.note}</td>
                                        <td>{interview.score}</td>
                                        {!!editData && <td>
                                            <button className="btn btn-light bi bi-trash-fill" type="button" name={interview._id} onClick={deleteInterview} />
                                        </td>}
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
                <div className="w-100 text-end text-white">總分：{item.mark}</div>
            </div>
        </div>
    );
}

function InterviewList(props) {
    const updateValue = props.updateValue;
    const [editData, setEditData] = useState(false);
    const [deleteList, setDeleteList] = useState([]);

    const handleClick = () => {
        setEditData(!editData);
    }

    async function deleteData() {
        const _data = deleteList;
        await fetch(DELETE_CANDIDATES_PATH, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(_data)
        })
            .then(
                (response) => {
                    if (response.ok) {
                        return (response.json());
                    }
                }
            )
            .then(
                json => {
                    window.alert(json.status + " ", json.deleteCount + " candidates have been deleted.");
                }
            )
            .catch(
                error => {
                    window.alert(error);
                }
            ).finally(updateValue())

    }

    async function deleteItem(e) {
        if (window.confirm("確定刪除已選取的項目嗎？")) {
            const _data = [e.target.name];
            await fetch(DELETE_CANDIDATES_PATH, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(_data)
            })
                .then(
                    (response) => {
                        if (response.ok) {
                            return (response.json());
                        }
                    }
                )
                .then(
                    json => {
                        window.alert(json.status + " ", json.deleteCount + " candidates have been deleted.");
                    }
                )
                .catch(
                    error => {
                        window.alert(error);
                    }
                ).finally(updateValue())
        } else {
            return;
        }
    }

    const handleChange = (e) => {
        if (!!!deleteList.includes(e.target.name)) {
            setDeleteList((prevDeleteList) => [...prevDeleteList, e.target.name]);

        } else {
            setDeleteList((prevDeleteList) => prevDeleteList.filter(value => value !== e.target.name));
        }
    }

    useEffect(() => {
        setDeleteList(deleteList);
    }, [deleteList])

    // Search Bar

    const rawData = props.data;
    const [searchBarText, setSearchBarText] = useState("");
    const [filteredData, setFilteredData] = useState(rawData);
    const handleSearchBarChange = (e) => {
        setSearchBarText(e.target.value);
    }

    useEffect(() => {
        setFilteredData(rawData.filter(datum => datum.candidateName.includes(searchBarText)));
    }, [searchBarText]);

    //sort
	const defaultToggle = {
        nextDate: false,
        mark: false,
        count: false,
        candidateName: false
    }

    const [sortToggle, setSortToggle] = useState(defaultToggle);
	const [parameter, setParameter] = useState();

    const setSort = (param => (event) => {
        let updateToggle = JSON.parse(JSON.stringify(defaultToggle));
        if (sortToggle[param]) {
            updateToggle[param] = -1 * sortToggle[param]
        } else {
            updateToggle[param] = 1;
        }
		setParameter(param);
        /**/

        setSortToggle(updateToggle);
    })
	useEffect(() => {
		let sortedData=JSON.parse(JSON.stringify(filteredData));
		if (parameter === 'nextDate') {
            setFilteredData(sortedData.sort((a, b) => (a.interviews.length === 0 ? new Date('3033-03-03') : new Date(a.interviews[0].nextDate)) > (b.interviews.length === 0 ? new Date('3033-03-03') : new Date(b.interviews[0].nextDate)) ? sortToggle[parameter] : -sortToggle[parameter]))
        }
        if (parameter === 'count') {
            setFilteredData(sortedData.sort((a, b) => (a.interviews.length > b.interviews.length) ? sortToggle[parameter] : -sortToggle[parameter]))
        }
        if (parameter === 'mark') {
            setFilteredData(sortedData.sort((a, b) => (a.mark > b.mark) ? sortToggle[parameter] : -sortToggle[parameter]))
        }
        if (parameter === 'candidateName') {
            setFilteredData(sortedData.sort((a, b) => (a.candidateName > b.candidateName) ? sortToggle[parameter] : -sortToggle[parameter]))
        }
	},[sortToggle])
	
    useEffect(() => {
		setTimeout(function(){
			setSort('nextDate')();
		});
    }, [])
	
	
    



    // Handle Pages 

    const [currentPage, setCurrentPage] = useState(1);
    const [numPages, setNumPages] = useState(Math.ceil(filteredData.length / 10) || 1);
    const [pageNumList, setPageNumList] = useState([...Array(numPages).keys()].map(item => item + 1))
    const [data, setData] = useState();

    useEffect(() => {
        setData(filteredData.slice((currentPage - 1) * 10, currentPage * 10));
        setNumPages(Math.ceil(filteredData.length / 10) || 1);
    }, [currentPage, filteredData]);

    useEffect(() => {
        if (currentPage > numPages) {
            setCurrentPage(numPages);
        }
    }, [numPages]);

    const pageLimit = 6;

    useEffect(() => {
        let originalPages = [...Array(numPages).keys()].map(item => item + 1);
        let startPage = 1;
        let endPage = originalPages.length;
        if (originalPages.length <= pageLimit) {
            setPageNumList(originalPages);
        }
        else {
            if (currentPage < Math.ceil(pageLimit / 2)) {
                endPage = startPage + pageLimit - 1;
            } else {
                if (currentPage > originalPages.length - Math.ceil(pageLimit / 2)) {
                    startPage = endPage - pageLimit + 1;
                } else {
                    startPage = currentPage - Math.ceil(pageLimit / 2) + 1;
                    endPage = currentPage + Math.ceil(pageLimit / 2);
                }
            }
            let limitedPages = [];
            for (let i = startPage; i <= endPage; i++) {
                limitedPages.push(i);
            }
            setPageNumList(limitedPages);
        }
    }, [currentPage, numPages]);

    return (
        <div className='bounceInAnimation mt-3'>
            <div className="d-flex flex-column align-items-center">
                <div className="row w-90 m-3">
                    <input className="border border-dark rounded w-100" type="text" onChange={handleSearchBarChange} placeholder="搜尋..." />
                </div>
                <div className="row">
                    <ul className="pagination">
                        <li className="page-item">
                            <button className="page-link" type="button" onClick={() => { if (currentPage !== 1) setCurrentPage(Number(currentPage) - 1) }} aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                            </button>
                        </li>
                        {
                            pageNumList.map((num, index) => {
                                return (
                                    <li className={"page-item " + (currentPage === num ? "active" : "")}>
                                        <button
                                            className="page-link"
                                            style={{ width: "50px" }}
                                            type="button"
                                            onClick={() => { setCurrentPage(Number(num)) }}
                                        >
                                            {num}
                                        </button>
                                    </li>
                                );
                            })
                        }
                        <li className="page-item">
                            <button className="page-link" type="button" onClick={() => { if (currentPage !== numPages) setCurrentPage(Number(currentPage) + 1) }} aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            <div className='modal fade' tabIndex="-1" id="confirmDelete" aria-labelledby='modalTitle' aria-hidden="true">
                <div className="modal-dialog">
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <div className='modal-title text-dark' id="modalTitle">刪除項目</div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className='modal-body text-dark'>
                            確定刪除已選取的項目嗎？
                        </div>
                        <div className='modal-footer'>
                            <button type="button" className="btn btn-dark" data-bs-toggle="modal" onClick={deleteData}>確定</button>
                        </div>
                    </div>
                </div>
            </div>


            <div className='d-flex flex-column w-100 align-items-center'>
                <div className="w-90 overflow-auto">
                    <ul className='list-group' style={{ minWidth: "800px" }}>
                        <li className='list-group-item active container bg-light text-black border-gray'>

                            <div className='row align-items-center'>
                                {!!editData &&
                                    <div className='col-1' />
                                }
                                <div className='col-2 position-sticky bg-light' style={{ left: 0 }}>
                                    <button className={!!sortToggle.candidateName ? ('sort-order sort-order-' + sortToggle.candidateName) : 'sort-order'} onClick={setSort('candidateName')}>招募者名稱</button>

                                </div>
                                <div className='col-2'>
                                    <button className={!!sortToggle.count ? ('sort-order sort-order-' + sortToggle.count) : 'sort-order'} onClick={setSort('count')}>相關記錄</button>
                                </div>
                                <div className='col-2'>
                                    <button className={!!sortToggle.mark ? ('sort-order sort-order-' + sortToggle.mark) : 'sort-order'} onClick={setSort('mark')}>分數</button>

                                </div>
                                <div className='col-2'>
                                    <button className={!!sortToggle.nextDate ? ('sort-order sort-order-' + sortToggle.nextDate) : 'sort-order'} onClick={setSort('nextDate')}>下次見面</button>
                                </div>
                                <div className='col d-inline-flex justify-content-end'>
                                    {
                                        !!editData &&
                                        <button
                                            className='me-2 btn btn-light border border-dark rounded bi bi-trash-fill'
                                            type="button"
                                            data-bs-toggle="modal"
                                            data-bs-target="#confirmDelete"
                                        />
                                    }

                                    <button className={!!editData ? 'btn btn-dark rounded bi bi-unlock-fill' : 'btn btn-dark rounded bi bi-lock-fill'} onClick={handleClick}></button>
                                </div>
                            </div>
                        </li>

                        {!!data &&
                            data.map(
                                (datum, index) => {
                                    return (
                                        <li key={index} className='list-group-item container' style={{ height: "60px" }}>

                                            <div className='row text-black'>
                                                {!!editData &&
                                                    <input className='col-1 align-self-center' type='checkbox' name={datum.candidateID} onClick={handleChange} />
                                                }
                                                <div className='col-2 position-sticky bg-white' style={{ left: 0 }}>
                                                    {datum.candidateName}
                                                </div>
                                                <div className='col-2'>
                                                    {datum.interviews === undefined ? "0" : datum.interviews.length}
                                                </div>
                                                <div className='col-2'>{datum.mark}</div>
                                                <div className='col-2'>
                                                    {datum.interviews.length === 0 ?
                                                        "沒有記錄" :
                                                        new Date(datum.interviews[0].nextDate).toLocaleDateString()}
                                                </div>
                                                <NavLink
                                                    className='col-2'
                                                    style={{ textDecoration: "none" }}
                                                    to={datum.candidateID}>
                                                    詳細
                                                </NavLink>
                                                {!!editData &&
                                                    <button
                                                        className="col-1 btn btn-light bi bi-trash-fill"
                                                        type="button"
                                                        name={datum.candidateID}
                                                        onClick={deleteItem}
                                                    />
                                                }
                                            </div>

                                        </li>
                                    );
                                }
                            )
                        }
                    </ul>
                </div>
            </div>
        </div>
    );
}
export default function InterviewListPage() {

    const [data, setData] = useState();

    const [AuthState, setAuthState] = useAuthState();
    const [updated, setUpdated] = useState(0);
    const [loading, setLoading] = useState(true);

    const updateValue = () => {
        setUpdated(updated + 1);
    }

    async function fetchData() {
        setLoading(true)
        await fetch(CANDIDATES_INTERVIEW_LIST_PATH, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(AuthState)
        })
            .then(response => {
                if (response.ok) {
                    return (response.json());
                }
                throw response;
            })
            .then(data => {
                setData(data);
                setLoading(false);
            }
            )
            .catch((error) => {
                window.alert(error);
                return;
            }
            );
    }

    useEffect(function effectFunction() {
        fetchData();
    }, [updated]);

    return (
        <div>
            {
                !loading
                    ?
                    <Routes>
                        <Route path="" element={<InterviewList data={data ? data : ""} updateValue={updateValue} />} />
                        <Route path=":itemID" element={<Item data={data ? data : ""} updateValue={updateValue} />} />
                    </Routes>
                    : ""
            }
        </div>
    );
}
