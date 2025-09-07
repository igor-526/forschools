import React, { useState } from 'react';
import {MenuFoldOutlined, MenuUnfoldOutlined} from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import {Outlet, useNavigate} from "react-router";
import { useSelector } from "react-redux";

const { Header, Sider, Content } = Layout;

const BaseLayout = () => {
    const [collapsed, setCollapsed] = useState(true)
    const navigate = useNavigate()
    const items = [
        {
            key: 'main',
            icon: <span style={{ fontSize: 18 }} className="material-icons-outlined">home</span>,
            label: 'Главная',
            onClick: () => {navigate('/dashboard')}
        },
        {
            key: 'profile',
            icon: <span style={{ fontSize: 18 }} className="material-icons-outlined">person</span>,
            label: 'Профиль',
            onClick: () => {navigate('/profile')}
        },
        {
            key: 'messages',
            icon: <span style={{ fontSize: 18 }} className="material-icons-outlined">chat</span>,
            label: 'Сообщения',
            children: [
                {
                    key: 'messages_mail',
                    label: 'Сообщения',
                    onClick: () => {navigate('/messages')}
                },
                {
                    key: 'messages_admin',
                    label: 'Сообщения администратору'
                },
            ],

        },
        {
            key: 'materials',
            icon: <span style={{ fontSize: 18 }} className="material-icons-outlined">insert_drive_file</span>,
            label: 'Материалы',
            onClick: () => {navigate('/materials')}
        },
        {
            key: 'learning_programs',
            icon: <span style={{ fontSize: 18 }} className="material-icons-outlined">document_scanner</span>,
            label: 'Шаблоны уроков',
            onClick: () => {navigate('/learning_programs')}
        },
        {
            key: 'learning_plans',
            icon: <span style={{ fontSize: 18 }} className="material-icons-outlined">list</span>,
            label: 'Планы обучения',
            onClick: () => {navigate('/learning_plans')}
        },
        {
            key: 'lessons',
            icon: <span style={{ fontSize: 18 }} className="material-icons-outlined">duo</span>,
            label: 'Занятия',
            onClick: () => {navigate('/lessons')}
        },
        {
            key: 'homeworks',
            icon: <span style={{ fontSize: 18 }} className="material-icons-outlined">chrome_reader_mode</span>,
            label: 'Домашние задания',
            onClick: () => {navigate('/homeworks')}
        },
        {
            key: 'administrating',
            icon: <span style={{ fontSize: 18 }} className="material-icons-outlined">settings</span>,
            label: 'Администрирование',
            children: [
                {
                    key: 'admin_users',
                    label: 'Управление пользователями',
                    onClick: () => {navigate('/adm/users')}
                },
                {
                    key: 'admin_collections',
                    label: 'Коллекции данных',
                    onClick: () => {navigate('/adm/collections')}
                },
                {
                    key: 'admin_mailing',
                    label: 'Рассылки',
                    onClick: () => {navigate('/adm/mailing')}
                },
            ],
        },
        {
            key: 'journals',
            icon: <span style={{ fontSize: 18 }} className="material-icons-outlined">menu_book</span>,
            label: 'Журналы',
            children: [
                {
                    key: 'journals_downloading',
                    label: 'Выгрузка данных'
                },
                {
                    key: 'journals_telegram',
                    label: 'Журнал Telegram'
                },
                {
                    key: 'journals_user_events',
                    label: 'События пользователей'
                },
                {
                    key: 'journals_plan_events',
                    label: 'События планов обучения'
                },
            ],
        },
        {
            key: 'support',
            icon: <span style={{ fontSize: 18 }} className="material-icons-outlined">support_agent</span>,
            label: 'Поддержка',
            children: [
                {
                    key: 'support_tickets',
                    label: 'Мои обращения'
                },
                {
                    key: 'support_new',
                    label: 'Новое обращение'
                },
            ],
        },
        {
            key: 'logout',
            icon: <span style={{ fontSize: 18 }} className="material-icons-outlined">logout</span>,
            label: 'Выйти'
        },
    ]
    const pageTitle = useSelector(state => state.layout.pageTitle)

    return (
        <Layout className="h-screen">
            <Sider
                collapsedWidth="50"
                trigger={null}
                collapsible
                collapsed={collapsed}
            >
                <Menu
                    theme="dark"
                    mode="vertical"
                    defaultSelectedKeys={['1']}
                    items={items}
                />
            </Sider>
            <Layout className="flex flex-col h-screen overflow-y-hidden">
                <Header style={{ padding: 0, background: "#FFFFFF" }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                    <span style={{color: "grey", fontSize: 18, fontWeight: 600}}>{pageTitle}</span>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: "#FFFFFF",
                        borderRadius: 8,
                    }}
                >
                    <div className="h-full overflow-y-auto overflow-x-auto">
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};
export default BaseLayout;