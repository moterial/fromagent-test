import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import Select from 'react-select';
import { useAuthState } from '../authentication/authcontext';

function OptionSelect(props) {
    const options = props.Options;
    const [activeOptions, setActiveOptions] = useState([]);
    const fieldValues = props.fieldValues;
    const setFieldValues = props.setFieldValues;
    const multiSelect = props.multiSelect;
    const required = props.required;

    const handleClick = (e) => {
        if (!!multiSelect) {
            if (!!!activeOptions.includes(e.target.name)) {
                setActiveOptions((prevActiveOptions) => [...prevActiveOptions, e.target.name]);

            } else {
                setActiveOptions((prevActiveOptions) => prevActiveOptions.filter(value => value !== e.target.name));
            }
        } else {
            setActiveOptions(e.target.name);
        }
    }


    useEffect(() => {
        // Due to the nature of setState of react, the update function has to be called here
        setFieldValues({ ...fieldValues, [props.name]: activeOptions })
        console.log(activeOptions);
    }, [activeOptions]);

    return (
        <div className="container">
            <div className="row">
                {
                    !!options &&
                    options.map((option, index) => {
                        return (
                            <button key={index}
                                className={
                                    "btn btn-outline-primary col border rounded my-2 mx-1 text-center"
                                }

                                ref={(e) => {
                                    if (e) {
                                        if (multiSelect ? activeOptions.includes(option.label) : activeOptions == option.label) {
                                            e.style.setProperty("color", "white", "important");
                                            e.style.setProperty("background-color", "black", "important");
                                        } else {
                                            e.style.setProperty("color", "", "");
                                            e.style.setProperty("background-color", "", "");
                                        }
                                    }
                                }}
                                type="button"
                                onClick={handleClick}
                                name={option.label}
                            >
                                {option.label}
                            </button>
                        );
                    })
                }
            </div>
        </div>
    )
}

function DropdownSelect(props) {
    const [currentOption, setCurrentOption] = useState([]);

    const fieldValues = props.fieldValues;
    const setFieldValues = props.setFieldValues;

    const handleSelect = (e) => {
        if (!!!currentOption.includes(e.target.name)) {
            setCurrentOption((prevActiveOptions) => [...prevActiveOptions, e.target.name]);

        } else {
            setCurrentOption((prevActiveOptions) => prevActiveOptions.filter(value => value !== e.target.name));
        }
    }
    let options;
    if (!!props.Options) {
        options = props.Options;
    }
    useEffect(() => {
        setFieldValues({ ...fieldValues, [props.name]: currentOption });
    }, [currentOption]);

    return (
        <div className='dropdown'>
            <button className="btn btn-light w-100 dropdown-toggle shadow-sm" type="button" id={props.key} data-bs-toggle="dropdown" aria-expanded="false">
                {currentOption + " "}
            </button>
            <ul className="dropdown-menu w-50" aria-labelledby={props.key}>
                {
                    !!options &&
                    options.map((option, index) => {
                        return (
                            <li key={index}>
                                <div className="w-100 d-flex">
                                    <input className="dropdown-item w-25" type="checkbox" name={option.label} onClick={handleSelect} />
                                    <span className="">{option.label}</span>
                                </div>
                            </li>
                        );
                    })
                }
            </ul>
        </div>
    );
}

function PopupSelect(props) {

    const [currentOption, setCurrentOption] = useState("");
    const [clients, setClients] = useState([]);
    const API = props.API;
    const fieldValues = props.fieldValues;
    const setFieldValues = props.setFieldValues;
    const [AuthState, setAuthState] = useAuthState();
    const required = props.required;

    const handleClick = (e) => {
        setCurrentOption(e.target.name);
    }

    const handleAddNew = (e) => {
        if (searchBarText !== undefined && !!(searchBarText.replaceAll(' ', '').length > 0))
            setCurrentOption(searchBarText);
    }

    useEffect(() => {
        setFieldValues({ ...fieldValues, [props.name]: currentOption });
    }, [currentOption]);

    useEffect(() => {
        if (!!API) {
            fetch(API, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(AuthState)
            })
                .then(
                    (res) => {
                        if (res.ok) {
                            return (res.json());
                        }
                    }
                )
                .then(
                    (data) => {
                        setClients(data);
                    }
                )
                .catch(
                    (error) => {
                        console.log(error);
                        throw new Error(error);
                    }
                )
        }
    }, []);

    // Search Bar

    const [rawData, setRawData] = useState([]);
    useEffect(() => {
        setRawData(clients);
    }, [clients]);
    const [searchBarText, setSearchBarText] = useState();
    const [filteredData, setFilteredData] = useState();
    useEffect(() => { setFilteredData(rawData) }, [rawData]);
    const handleSearchBarChange = (e) => {
        setSearchBarText(e.target.value);
    }

    useEffect(() => {
        setFilteredData(rawData.filter(datum => datum.includes(searchBarText)));
    }, [searchBarText]);

    return (
        <div>
            <button
                className='w-100 bg-light form-control shadow-sm border rounded'
                type="button"
                data-bs-toggle="modal"
                data-bs-target={"#" + props.name}
            >
                {currentOption === "" ? "選擇" : currentOption}
            </button>
            <div className='modal fade position-absolute' tabIndex="-1" id={props.name} aria-labelledby='modalTitle' aria-hidden="true">
                <div className="modal-dialog">
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <div className='modal-title text-dark' id="modalTitle">{props.label}</div>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className='modal-body container overflow-auto' style={{ maxHeight: "300px" }}>
                            {!!(filteredData !== undefined) &&
                                filteredData.map((client, index) => {
                                    return (
                                        <div className='row' key={index}>
                                            <button
                                                className="col border btn btn-outline-primary my-2"
                                                onClick={handleClick}
                                                type="button"
                                                name={client}
                                                data-bs-dismiss="modal"
                                            >
                                                {client}
                                            </button>
                                        </div>
                                    );
                                })
                            }
                        </div>
                        <div className="modal-footer">
                            <input className="form-control shadow-sm border rounded" onChange={handleSearchBarChange} />
                            <button className="btn btn-dark" type="button" onClick={handleAddNew} data-bs-dismiss="modal">新增</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Form(props) {
    const dismissModal = props.dismissModal;
    const fieldsArray = props.fieldsArray;
    const API = props.API;
    const defaultValues = props.defaultValues || {};
    const navigate = useNavigate();
    const location = useLocation();
    const [fieldValues, setFieldValues] = useState(defaultValues);
    const [submitting, setSubmitting] = useState(false);
    const afterSubmit = props.afterSubmit;
    const redirectAfterSubmit = props.redirectAfterSubmit;
    async function handleSubmit(event) {
        event.preventDefault();
        for (let field of fieldsArray) {
            if (field.required !== undefined) {
                if (field.required === true) {
                    let found = false;
                    Object.keys(fieldValues).map(function (key, item) {
                        if (key === field.key &&
                            fieldValues[key].length > 0)
                            found = true;
                    })
                    if (!found) {
                        alert("請輸入 " + field.label)
                        return;
                    }
                }
            }
        }
        setSubmitting(true);
        const newData = { ...fieldValues };
        await fetch(API, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newData),
        })
            .then(
                response => {
                    if (response.ok) {
                        return response.json()
                    }
                }
            )
            .then(
                res => {
                    if (res.status === "success") {
                        alert(res.message);
                    } else {
                        alert(res.message);
                    }
                    if (afterSubmit !== undefined) { afterSubmit(); }
                    if (redirectAfterSubmit !== undefined) {
                        if (redirectAfterSubmit === true) {
                            navigate("/dashboard");
                        }
                    }
                }
            )
            .catch(
                error => {
                    window.alert(error);
                    return;
                }
            )

        // Todos post item to backend server
    }

    function handleChange(event) {
        setFieldValues({ ...fieldValues, [event.target.name]: event.target.value });
    }

    return (
        <div className="w-100 d-flex justify-content-center">
            <form className='w-100 d-inline-flex justify-content-center flex-column flex-direction-column align-items-center'
                onSubmit={handleSubmit}
            >
                <div className="border px-3 pb-3 pb-4 mt-3 rounded w-90">
                    <div className='w-100 form-group d-inline-flex flex-column justify-content-center'>
                        {
                            (!!fieldsArray) &&
                            fieldsArray.map(
                                (field, index) => {

                                    return (
                                        <div className='d-flex flex-column justify-content-center' key={index}>
                                            <label className="mt-3">{field.label}</label>

                                            {
                                                {
                                                    // Special cases
                                                    "profit":
                                                        <input
                                                            className={"form-control shadow-sm border rounded"}
                                                            name={field.key}
                                                            type={field.type}
                                                            onChange={handleChange}
                                                            readOnly={fieldValues.item === undefined ? true : !(fieldValues.item.includes("Done Deal"))}
                                                            required={true}
                                                            min={0}
                                                        />
                                                }
                                                [field.key] || {
                                                    // Todos other input options 
                                                    "popupSelect":
                                                        <PopupSelect
                                                            name={field.key}
                                                            fieldValues={fieldValues}
                                                            setFieldValues={setFieldValues}
                                                            API={field.API}
                                                            {...field} />,
                                                    "dropdownSelect":
                                                        <Select
                                                            className='text-black'
                                                            options={field.Options}
                                                            name={field.key}
                                                            fieldValues={fieldValues}
                                                            onChange={(e) => {
                                                                // Reverse engineer react-select to fit our codes
                                                                const parseValue = { target: {} };
                                                                parseValue.target.name = field.key;

                                                                if (field.multiSelect) {
                                                                    parseValue.target.value = [];
                                                                    for (let option of e) {
                                                                        parseValue.target.value = [...parseValue.target.value, option.value];
                                                                    }
                                                                } else {
                                                                    parseValue.target.value = e.value;
                                                                }

                                                                handleChange(parseValue)
                                                            }}
                                                            isMulti={field.multiSelect}
                                                            {...field} />,
                                                    "optionSelect":
                                                        <OptionSelect
                                                            name={field.key}
                                                            fieldValues={fieldValues}
                                                            setFieldValues={setFieldValues}
                                                            multiSelect={field.multiSelect}
                                                            {...field} />,
                                                    "textarea":
                                                        <textarea className="form-control shadow-sm border rounded"
                                                            name={field.key}
                                                            type={field.type}
                                                            onChange={handleChange}
                                                            required={field.required}
                                                        />
                                                }[field.type] ||
                                                <input className="form-control shadow-sm border rounded"
                                                    name={field.key}
                                                    type={field.type}
                                                    onChange={handleChange}
                                                    required={field.required}
                                                />
                                            }
                                        </div>
                                    );
                                }
                            )
                        }

                    </div>
                </div>

                <div className='w-90 container mt-3'>
                    <div className='row'>
                        <button className='col btn btn-outline-light me-1' type="button" onClick={() => { navigate("/dashboard") }}>取消</button>
                        <input className='col btn btn-light ms-1' type='submit' value="遞交" disabled={submitting} data-bs-dismiss={dismissModal !== undefined ? "modal" : ""} />
                    </div>
                </div>

            </form>
        </div>
    );
}
