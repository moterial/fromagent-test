import React, { useState, useEffect } from 'react';
import Form from '../components/form';
import { CHANGE_OTHERS_PASSWORD, USER_MANAGEMENT_PATH } from '../consts/api.const';
import { ADD_USER_PATH } from '../consts/api.const';
import { DELETE_USER_PATH } from '../consts/api.const';
import { useAuthState } from '../authentication/authcontext.jsx';

function ChangeUserPasswordModal(props) {
    const updateValue = props.updateValue;
    const [AuthState, setAuthState] = useAuthState();
    const [password, setNewPassword] = useState();
    const [confirm, setConfirm] = useState();
    const userID = props.userID;
    console.log('the index is: '+props.index+' and the userID is: '+userID);
    const handleChange = (e) => {
        setNewPassword(e.target.value);
    }
    const handleChange_ = (e) => {
        setConfirm(e.target.value);
    }
    const changePassword = (e) => {
        if (password !== confirm) {
            alert("Confirm Password does not match");
            return;
        } else {
            fetch(CHANGE_OTHERS_PASSWORD, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user: AuthState,
                    editUser: {
                        userID: userID,
                        userNewPassword: password
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
    }

    return (
        <div className='modal fade' tabIndex="-1" id={"changePassword"+userID} aria-labelledby='modalTitle' aria-hidden="true">
            <div className="modal-dialog">
                <div className='modal-content'>
                    <div className='modal-header'>
                        <div className='modal-title text-dark' id="modalTitle">新密碼</div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className='modal-body text-dark'>
                        <input className="w-90 m-2 border-dark rounded" type="password" placeholder="新密碼" onChange={handleChange} />
                        <input className='w-90 m-2 border-dark rounded' type="password" placeholder="確認新密碼" onChange={handleChange_} />
                    </div>
                    <div className='modal-footer'>
                        <button type="button" className="btn btn-dark" data-bs-dismiss="modal" onClick={changePassword} >確定</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function NewUserModal(props) {
    const updateValue = props.updateValue;
    const _userList = props.userList;
    const userList = _userList.map((item) => { return { ...item, value: item.username, label: item.username } })
    const Fields = [
        {
            key: "username",
            label: "用戶名",
            type: "text",
            required: true
        }, {
            key: "password",
            label: "密碼",
            type: "password",
            required: true
        }, {
            key: "parentUser",
            label: "上司",
            type: "dropdownSelect",
            Options: userList,
            multiSelect: false
        }, {
            key: "permissionLevel",
            label: "權限(1/2)",
            type: "optionSelect",
            multiSelect: false,
            Options: [{ key: 1, label: 1 }, { key: 2, label: 2 }],
            required: true
        }
    ];

    return (
        <div className='modal fade' tabindex="1" id="NewUserModal" aria-labelledby='modalTitle' aria-hidden="true">
            <div className="modal-dialog">
                <div className='modal-content'>
                    <div className='modal-header'>
                        <div className='modal-title text-dark' id="modalTitle">新增用戶</div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className='modal-body text-dark'>
                        <Form
                            fieldsArray={Fields}
                            API={ADD_USER_PATH}
                            dismissModal={true}
                            afterSubmit={updateValue}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DeleteDataModal(props) {

    const data = props.deleteData;
    const updateValue = props.updateValue;

    async function deleteData() {
        const _data = data;
        await fetch(DELETE_USER_PATH, {
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
                    window.alert(json.status, " ", json.deleteCount, " users have been deleted.");
                    updateValue();
                }
            )
            .catch(
                error => {
                    window.alert(error);
                }
            )
    }

    return (
        <div className='modal fade text-black' tabIndex="-1" id="confirmDelete" aria-labelledby='modalTitle' aria-hidden="true">
            <div className="modal-dialog">
                <div className='modal-content'>
                    <div className='modal-header'>
                        <div className='modal-title' id="modalTitle">刪除項目</div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className='modal-body'>
                        確定刪除已選取的項目嗎？
                    </div>
                    <div className='modal-footer'>
                        <button type="button" className="btn btn-primary" data-bs-toggle="modal" onClick={deleteData}>確定</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function UserManagementPage(props) {

    const [userList, setUserList] = useState([]);

    const [loading, setLoading] = useState(true);

    const [editData, setEditData] = useState(false);

    const [deleteData, setDeleteData] = useState([]);

    const [updated, setUpdated] = useState(0);

    const [AuthState, setAuthState] = useAuthState();

    const updateValue = () => {
        setUpdated(updated + 1);
    }

    const handleClick = () => {
        setEditData(!editData);
    }

    const handleChange = (e) => {
        if (!!!deleteData.includes(e.target.name)) {
            setDeleteData((prevDeleteData) => [...prevDeleteData, e.target.name]);

        } else {
            setDeleteData((prevDeleteData) => prevDeleteData.filter(value => value != e.target.name));
        }
    }

    useEffect(() => {
        setDeleteData(deleteData);
    }, [deleteData]);

    async function fetchData() {
        setLoading(true);
        await fetch(USER_MANAGEMENT_PATH, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(AuthState)
        })
            .then(response => {
                console.log(response)
                if (response.ok) {
                    return (response.json());
                }
                throw response;
            })
            .then(
                data => {
                    setUserList(data);
                    setLoading(false);
                }
            )
            .catch(
                error => {
                    window.alert(error);
                    return;
                }
            )
    }

    useEffect(
        function effectFunction() {
            fetchData();
        }, [updated]);

    // Search Bar

    const [searchBarText, setSearchBarText] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const handleSearchBarChange = (e) => {
        setSearchBarText(e.target.value);
    }

    useEffect(() => {
        setFilteredData(userList);
    }, [userList]);

    useEffect(() => {
        setFilteredData(userList.filter(datum => datum.username.includes(searchBarText)));
    }, [searchBarText]);

    // Handle Pages 

    const [currentPage, setCurrentPage] = useState(1);
    const [numPages, setNumPages] = useState(Math.floor(filteredData.length / 10) + 1);
    const [pageNumList, setPageNumList] = useState([...Array(numPages).keys()].map(item => item + 1))
    const [data, setData] = useState();

    useEffect(() => {
        setData(filteredData.slice((currentPage - 1) * 10, currentPage * 10));
        setNumPages(Math.floor(filteredData.length / 10) + 1);
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
        <div className='bounceInAnimation'>
            {!loading && <NewUserModal userList={userList} updateValue={updateValue} />}
            <DeleteDataModal deleteData={deleteData} updateValue={updateValue} />
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
                        {!loading &&
                            pageNumList.map((num, index) => {
                                return (
                                    <li className={"page-item " + (currentPage === num ? "active" : "")}>
                                        <button className="page-link" style={{ width: "50px" }} type="button" onClick={() => { setCurrentPage(Number(num)) }}>{num}</button>
                                    </li>
                                );
                            })
                        }
                        <li className="page-item">
                            <button class="page-link" type="button" onClick={() => { if (currentPage !== numPages) setCurrentPage(Number(currentPage) + 1) }} aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            <button
                className='btn btn-primary btn-floating border bi bi-plus-lg'
                type="button"
                style={{ position: "fixed", bottom: "100px", right: "25px", borderRadius: "50%", fontSize: "30px" }}
                data-bs-toggle="modal"
                data-bs-target="#NewUserModal"
            ></button>
            <div className="overflow-auto">
                <table className='table' style={{ minWidth: "800px" }}>
                    <thead>
                        <tr>
                            {!!editData &&
                                <th>
                                    <div className='col-1 align-self-center' />
                                </th>
                            }
                            <th scope="col"></th>
                            <th className="position-sticky" style={{ left: 0 }} scope="col">用戶名稱</th>
                            <th scope="col">密碼</th>
                            <th scope="col">上司</th>
                            <th scope="col">權限級別</th>

                            <th scope="col-auto d-inline-flex justify-content-end">
                                {
                                    !!editData &&
                                    <button
                                        className='me-2 btn btn-light border border-dark rounded bi bi-trash-fill'
                                        type="button"
                                        data-bs-toggle="modal"
                                        data-bs-target="#confirmDelete"
                                    />
                                }
                                <button className={!!editData ? 'btn btn-dark rounded bi bi-unlock' : 'btn btn-dark rounded bi bi-lock'} type="button" onClick={handleClick}></button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading &&
                            userList.length > 0 ?
                            data.map((user, index) => {
                                return (
                                    <tr className='bg-white'>
                                        {!!editData &&
                                            <td>
                                                <input className='align-self-center' type='checkbox' name={user.username} onChange={handleChange} />
                                            </td>}
                                        <th scope="row">{index + 1}</th>
                                        <td className="position-sticky bg-white" style={{ left: 0 }}>{user.username}</td>
                                        <td>Encrypted</td>
                                        <td>{user.parentUser}</td>
                                        <td>{user.permissionLevel}</td>
                                        <td>
                                            <button className="btn btn-light" type="button" data-bs-toggle="modal" data-bs-target={"#changePassword"+user._id}>更改蜜碼</button>
                                            <ChangeUserPasswordModal userID={user._id} index={index} updateValue={updateValue} />
                                        </td>
                                    </tr>);
                            }) : ""
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}
