import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/css/global.css'
import axios from 'axios'
import SocketService from './utils/socket_service'

import 'element-ui/lib/theme-chalk/index.css'
import {
  Container, Header, Main, Row, Col,
  Dropdown, DropdownMenu, DropdownItem
} from 'element-ui'

Vue.use(Container)
Vue.use(Header)
Vue.use(Main)
Vue.use(Row)
Vue.use(Col)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
SocketService.Instance.connect()
Vue.prototype.$socket = SocketService.Instance
Vue.prototype.$http = axios
Vue.prototype.$echarts = window.echarts
Vue.config.productionTip = false



new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
