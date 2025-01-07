import React, { useEffect, useState } from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined, DoubleRightOutlined, LogoutOutlined, CheckSquareFilled, CalendarOutlined, UnorderedListOutlined, DeleteOutlined, MoreOutlined, EditOutlined, WalletOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, ColorPicker, DatePicker, Divider, Dropdown, Form, Input, Layout, Menu, Modal, Row, Select, message } from 'antd';
import Title from 'antd/es/typography/Title';
import { collection, doc,  getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { useAuthContext } from '../../../contexts/AuthContext';
import { auth, firestore } from '../../../config/firebase';
import { signOut } from 'firebase/auth';
import dayjs from 'dayjs';
let newList = {}
const { Content, Sider } = Layout;
const initValue = { title: "", backgroundColor: "#1677FF", date: "", description: "", list: "Personal" }
export default function TodoBoard() {
    const [allTodo, setAllTodo] = useState([])
    const [showTodo, setShowTodo] = useState([])
    const [listArray, setListArray] = useState([])
    const { user, dispatch } = useAuthContext()
    const [collapsed, setCollapsed] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isModalOpenForUpdate, setIsModalOpenForUpdate] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [listInput, setListInput] = useState(false);
    const openModalForAddTodo = () => { setIsModalOpen(true) }
    const [state, setState] = useState(initValue)
    const handleChange = e => setState(s => ({ ...s, [e.target.name]: e.target.value }))
    const handleDate = (_, date) => setState(s => ({ ...s, date }))
    const handleColorChange = color => setState({ ...state, backgroundColor: color.toHexString() })
    const handleSubmit = async () => {
        setIsProcessing(true)
        const { title, backgroundColor, date, description, list } = state
        if (!title || !backgroundColor || !date || !description || !list) {
            setIsProcessing(false)
            return message.error("Fill all Inputs")
        }
        const todoID = Math.random().toString(36).slice(2)
        const todo = {
            title, backgroundColor, date, description, list,
            dateCreated: serverTimestamp(), createdBy: user.uid, todoID: todoID, status: "active"
        }
        try {
            await setDoc(doc(firestore, "todos", todoID), todo);
            setAllTodo([...allTodo, todo]);
            setShowTodo([...allTodo, todo])
            message.success("Added successfully")
        } catch (e) {
            console.error(e)
            message.error(" some Error In adding Todo")
        }
        setIsProcessing(false)
        setIsModalOpen(false)
        setState(initValue)
    }
    const getTodos = async () => {
        const q = query(collection(firestore, "todos"), where("createdBy", "==", user.uid), where("status", "==", "active"))
        const querySnapshot = await getDocs(q);
        const array = []
        querySnapshot.forEach((doc) => {
            let data = doc.data()
            array.push(data)
        });
        setAllTodo(array)
        setShowTodo(array)
    }
    const getLists = async () => {
        const q = query(collection(firestore, "lists"), where("createdBy", "==", user.uid))
        const querySnapshot = await getDocs(q);
        const array = [{ label: "Personal", iconColor: "red" }, { label: "Work", iconColor: "blue" }]
        querySnapshot.forEach((doc) => {
            let data = doc.data()
            array.push(data)
        });
        setListArray(array)
    }
    const lightOrDark = (color) => {
        var r, g, b, hsp;
        color = +("0x" + color.slice(1).replace(
            color.length < 5 && /./g, '$&$&'));
        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
        hsp = Math.sqrt(
            0.299 * (r * r) +
            0.587 * (g * g) +
            0.114 * (b * b)
        );
        if (hsp > 160) {
            return 'light';
        }
        else {
            return 'dark';
        }
    }
    useEffect(() => {
        getTodos()
        getLists()
        window.innerWidth < 600 ? setCollapsed(true) : setCollapsed(false)
    }, [])
    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                message.success("Signout successful")
                dispatch({ type: "SET_LOGGED_OUT" })
            })
            .catch(err => {
                message.error("Signout not successful")
            })
    }
    const handleUpdate = async () => {
        setIsProcessing(true)
        const { title, backgroundColor, date, description, list, todoID } = state
        if (!title || !backgroundColor || !date || !description || !list) {
            setIsProcessing(false)
            return message.error("Fill all Inputs")
        }
        const todo = {
            title, backgroundColor, date, description, list, todoID,
            dateCreated: serverTimestamp(), createdBy: user.uid, status: "active"
        }
        try {
            await setDoc(doc(firestore, "todos", todoID), todo);
            const updatedAllTodo = showTodo.filter(item => item.todoID !== todo.todoID);
            updatedAllTodo.unshift(todo)
            setShowTodo(updatedAllTodo);
            setAllTodo([...allTodo, todo]);
            message.success("Updtaed successfully")
        } catch (e) {
            console.error(e)
            message.error(" some Error In Updating Todo")
        }
        setIsProcessing(false)
        setIsModalOpenForUpdate(false)
        setState(initValue)
    }
    return (
        <>
            <div className="container-xxl">
                <div className="row">
                    <div className="col ">
                        <Layout style={{
                            background: 'transparent'
                        }} >
                            <Sider
                                trigger={null}
                                collapsible
                                collapsed={collapsed}
                                width={250}
                                style={{
                                    overflow: 'auto',
                                    height: '95vh',
                                    position: 'fixed',
                                    left: 17,
                                    top: 18,
                                    bottom: 0,
                                    borderRadius: '15px',
                                    backgroundColor: "#F4F4F4",
                                }}
                            >
                                <div className="demo-logo-vertical" />
                                <div className="d-flex">
                                    {collapsed ? "" : <h4 className='fw-bold pt-3 px-3 mt-1'>Menu</h4>}
                                    <Button
                                        type="text"
                                        icon={collapsed ? <MenuUnfoldOutlined style={{ color: "black" }} /> : <MenuFoldOutlined style={{ color: "black" }} />}
                                        onClick={() => setCollapsed(!collapsed)}
                                        className='px-0 w-100 mx-0 text-light'
                                        style={{ height: 70, color: "black" }}
                                    />
                                </div>
                                <Menu
                                    style={{ background: "transparent" }}
                                    mode="vertical"
                                >
                                    <Menu.Item key="1" icon={<DoubleRightOutlined />} onClick={() => {
                                        let Today = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
                                        try {
                                            const filteredTodos = allTodo.filter(todo => new Date(todo.date) > new Date(Today));
                                            setShowTodo(filteredTodos);
                                        } catch (error) {
                                            console.error(error);
                                        }
                                    }}>
                                        Upcoming
                                    </Menu.Item>
                                    <Menu.Item key="2" icon={<UnorderedListOutlined />} onClick={() => {
                                        let Today = `${new Date().getFullYear()}-${(new Date().getMonth() + 1) < 10 ? 0 : ""}${new Date().getMonth() + 1}-${new Date().getDate()}`;
                                        try {
                                            let filteredTodos = allTodo.filter(todo => todo.date === Today);
                                            setShowTodo(filteredTodos);
                                        } catch (error) {
                                            console.error(error);
                                        }
                                    }}>
                                        Today
                                    </Menu.Item>
                                    <Menu.Item key="3" icon={<CalendarOutlined />} onClick={() => setShowDatePicker(!showDatePicker)}>
                                        Calendar
                                    </Menu.Item>
                                    {showDatePicker && (
                                        <Menu.Item>
                                            <DatePicker
                                                className='mx-3'
                                                onChange={(_, dateString) => {
                                                    try {
                                                        let filteredTodos = allTodo.filter(todo => todo.date === dateString);
                                                        setShowTodo(filteredTodos);
                                                    } catch (error) {
                                                        console.error(error);
                                                    }
                                                    setShowDatePicker(false);
                                                }}
                                            />
                                        </Menu.Item>
                                    )}
                                    <Divider />
                                    <Menu.Item key="4" icon={<WalletOutlined />} onClick={() => {
                                        setShowTodo(allTodo)
                                    }}>
                                        Sticky Wall
                                    </Menu.Item>
                                    <Divider />
                                    <h5 className="px-2 mt-1">Lists</h5>
                                    {listArray.map((allLists, i) => (
                                        <Menu.Item
                                            key={i+5}
                                            icon={<CheckSquareFilled style={{ color: allLists.iconColor }} />}
                                            onClick={() => {
                                                try {
                                                    let filteredTodos = allTodo.filter(todo => todo.list === allLists.label);
                                                    setShowTodo(filteredTodos);
                                                } catch (error) {
                                                    console.error(error);
                                                }
                                            }}
                                        >
                                            {allLists.label}
                                        </Menu.Item>
                                    ))}
                                    {listInput && (
                                        <Form> <Form.Item >
                                            <Input placeholder="Label here" onChange={(e) => { newList = { label: e.target.value, createdBy: user.uid } }} />
                                        </Form.Item>
                                            <Form.Item >
                                                <Input placeholder="Logo Color" onChange={(e) => { newList = { ...newList, iconColor: e.target.value } }} />
                                            </Form.Item>
                                            <Form.Item >
                                                <Button type="primary " className='ms-5 px-5' onClick={
                                                    async () => {
                                                        try {
                                                            await setDoc(doc(firestore, "lists", Math.random().toString(36).slice(2)), newList);
                                                            setListArray(prevListArray => [...prevListArray, newList]);
                                                            message.success("created new list succesfully")
                                                        } catch (e) {
                                                            console.error(e)
                                                            message.error(" some Error In adding list")
                                                        }
                                                        setListInput(false)
                                                    }
                                                }>add</Button>
                                            </Form.Item>
                                        </Form>
                                    )}
                                    <Menu.Item key="15" icon={<PlusOutlined />} onClick={() => setListInput(!listInput)}>
                                        Add New List
                                    </Menu.Item>
                                    <Menu.Item key="14" icon={<LogoutOutlined />} onClick={handleLogout}>
                                        Log Out
                                    </Menu.Item>
                                </Menu>
                            </Sider>

                            <Layout
                                className="site-layout"
                                style={{
                                    marginLeft: collapsed ? 80 : 250,
                                    background: 'white',
                                }}
                            >
                                <div className="container-xxl">
                                    <div className="row">
                                        <div className="col w-100">
                                            <Content
                                                style={{
                                                    // margin: '24px 16px 0',
                                                    overflow: 'initial',
                                                    // width:"100%",
                                                    background: 'transparent',
                                                    // overflow: 'auto',
                                                    height: `97vh`,
                                                    position: 'relative',
                                                    left: 3,
                                                    top: 18,
                                                }}
                                            >
                                                <div className='container-xxl mt-5' >
                                                    <div className="row">
                                                        <div className="col ms-3 d-flex justify-content-between">
                                                            <h1 className='fw-bold'>Sticky Wall</h1>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Divider />
                                                <div className="conatiner-xxl">
                                                    <div className="row">
                                                        <div className="col mx-3">
                                                            <div className="row row-cols-1 row row-cols-sm-2 row-cols-md-3 g-4">
                                                                {showTodo.map(
                                                                    (todo, i) => {
                                                                        return (
                                                                            < div className="col" key={todo.todoID} >
                                                                                <div className="card  square-card" style={{ width: '100%', height: '100%', backgroundColor: todo.backgroundColor, color: lightOrDark(todo.backgroundColor) === 'light' ? 'black' : "white" }}>
                                                                                    <div className="card-body">
                                                                                        <div className='d-flex justify-content-between'>
                                                                                            <h5 className="card-title">
                                                                                                {todo.title}  </h5>
                                                                                            <div><Dropdown
                                                                                                overlay={
                                                                                                    <Menu>
                                                                                                        <Menu.Item key="1">
                                                                                                            <Button icon={<EditOutlined />} onClick={() => {
                                                                                                                setIsModalOpenForUpdate(true)
                                                                                                                setState(todo)
                                                                                                            }} >Update Todo</Button>
                                                                                                        </Menu.Item>
                                                                                                        <Menu.Item key="2">
                                                                                                            <Button danger icon={<DeleteOutlined />} onClick={async () => {
                                                                                                                let deletedTodo = { ...todo, status: 'deleted' };
                                                                                                                try {
                                                                                                                    await setDoc(doc(firestore, "todos", todo.todoID), deletedTodo);
                                                                                                                    message.success("Deleted Todo successfully");
                                                                                                                    const updatedAllTodo = showTodo.filter(item => item.todoID !== todo.todoID);
                                                                                                                    setShowTodo(updatedAllTodo);
                                                                                                                } catch (e) {
                                                                                                                    console.error(e);
                                                                                                                    message.error("Some Error In Deleting Todo");
                                                                                                                }
                                                                                                            }}>Delete Todo</Button>

                                                                                                        </Menu.Item>
                                                                                                    </Menu>
                                                                                                }
                                                                                            >
                                                                                                <a onClick={(e) => e.preventDefault()}>
                                                                                                    <MoreOutlined size={50} style={{ color: 'white' }} />
                                                                                                </a>
                                                                                            </Dropdown>
                                                                                            </div>
                                                                                        </div>
                                                                                        <p className="card-text">{todo.description}</p>
                                                                                        <p> <span className="fw-bold">Date:</span>{todo.date}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    }
                                                                )
                                                                }
                                                                <div className="col">
                                                                    <div className="card " style={{ width: '100%', height: '100%', backgroundColor: "#F4F4F4" }}>
                                                                        <div className="card-body d-flex justify-content-center align-items-center" onClick={openModalForAddTodo}>
                                                                            <PlusOutlined style={{ fontSize: '70px' }} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Content>
                                        </div>
                                    </div>
                                </div>
                            </Layout>
                        </Layout>
                    </div >
                </div >
            </div >
            <Modal
                title="Add Todo"
                centered
                open={isModalOpen}
                onOk={handleSubmit}
                okText="Confirm"
                cancelText="Close"
                onCancel={() => setIsModalOpen(false)}
                style={{ width: 1000, maxWidth: 1000 }}
            >
                <Title level={2} className='m-0 text-center'>Add Todo</Title>
                <Divider />
                <Form layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} lg={12}>
                            <Form.Item label="Title">
                                <Input placeholder='Input your title' name='title'
                                    onChange={handleChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Form.Item label="Background Color">
                                <ColorPicker name='backgroundColor' onChange={handleColorChange} showText={(color) => <span>Background Color ({color.toHexString()})</span>} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Form.Item label="Date">
                                <DatePicker className='w-100'
                                    onChange={handleDate}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Form.Item label="List">
                                <Select
                                    defaultValue="Personal"
                                    name='list'
                                    onChange={(value) => { setState({ ...state, list: value }) }}
                                    options={listArray.map((list) => ({
                                        value: list.label,
                                        label: list.label,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Description">
                                <Input.TextArea placeholder='Input your description' name='description'
                                    onChange={handleChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={{ span: 12, offset: 6 }} lg={{ span: 8, offset: 8 }} >
                            <Button type='primary' htmlType='submit' className='w-100' loading={isProcessing}
                                onClick={handleSubmit}
                            >Add Todo</Button>
                        </Col>
                    </Row>
                </Form>
            </Modal>
            <Modal
                title="Update Todo"
                centered
                open={isModalOpenForUpdate}
                onOk={handleUpdate}
                okText="Confirm"
                cancelText="Close"
                onCancel={() => setIsModalOpenForUpdate(false)}
                style={{ width: 1000, maxWidth: 1000 }}
            >
                <Title level={2} className='m-0 text-center'>Update Todo</Title>
                <Divider />
                <Form layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} lg={12}>
                            <Form.Item label="Title">
                                <Input placeholder='Input your title' name='title' value={state.title}
                                    onChange={handleChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Form.Item label="Background Color">
                                <ColorPicker name='backgroundColor' value={state.backgroundColor} onChange={handleColorChange} showText={(color) => <span>Background Color ({color.toHexString()})</span>} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Form.Item label="Date">
                                <DatePicker className='w-100' value={state.date ? dayjs(state.date) : ""}
                                    onChange={handleDate}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Form.Item label="List">
                                <Select
                                    defaultValue="Personal"
                                    name="list"
                                    value={state.list}
                                    onChange={(value) => {
                                        setState({ ...state, list: value });
                                    }}
                                    options={listArray.map((list) => ({
                                        value: list.label,
                                        label: list.label,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Description">
                                <Input.TextArea placeholder='Input your description' name='description' value={state.description}
                                    onChange={handleChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={{ span: 12, offset: 6 }} lg={{ span: 8, offset: 8 }} >
                            <Button type='primary' htmlType='submit' className='w-100' loading={isProcessing}
                                onClick={handleUpdate}
                            >Update Todo</Button>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
};