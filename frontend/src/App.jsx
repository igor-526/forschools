import React from 'react';
import AppRoutes from "./Routes/routes.jsx";
import {ConfigProvider} from "antd";
import ru_RU from 'antd/lib/locale/ru_RU';
import { Provider } from 'react-redux';
import store from './store';

const App = () => {
    return (
        <Provider store={store}>
            <ConfigProvider locale={ru_RU}>
                <AppRoutes />
            </ConfigProvider>
        </Provider>
    );
};
export default App;