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