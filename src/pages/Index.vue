<template>
  <main class="container q-py-lg">
    <section
      class="row q-px-xl q-py-md q-gutter-lg">
      <q-select class="col" bg-color="white"
        filled label="配送時間" v-model="selectDate"
        no-option multiple dense>
        <q-popup-proxy cover>
          <q-date mask="YYYY-MM-DD"
            v-model="selectDate">
            <div
              class="row items-center justify-end q-gutter-sm">
              <q-btn label="Cancel"
                color="primary" flat
                v-close-popup />
              <q-btn label="OK" color="primary"
                @click="onDateChange"
                v-close-popup />
              <q-btn label="Clear" color="primary"
                flat @click="clearDateProxy"
                v-close-popup />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-select>
      <q-select class="col" bg-color="white"
        filled label="配送縣市" dense
        v-model="filterCheckBox['model']"
        @update:model-value="getOrder"
        :options="filterCheckBox.options"
        multiple>
        <template
          v-slot:option="{ itemProps, opt, selected ,toggleOption}">
          <q-item v-bind="itemProps">
            <q-item-section>
              <q-item-label v-html="opt" />
            </q-item-section>
            <q-item-section side>
              <q-checkbox :model-value="selected"
                @update:model-value="toggleOption(opt)" />
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <q-select class="col" dense bg-color="white"
        filled
        v-for="(select,idx) in filterSelects"
        :key="`select-${idx}`"
        v-model="filter[select.model]"
        @update:model-value="getOrder"
        :option-label="select.optionLabel"
        :options="select.options"
        :label="select.label">
        <template v-if="select.iconName"
          v-slot:prepend>
          <q-icon :name="select.iconName" />
        </template>
      </q-select>
      <q-btn style="margin-right:auto;"
        color="primary" label="重置"
        @click="clearFilter" />
    </section>

    <q-table @request="getOrder"
      rows-per-page-label="每頁面單數"
      table-class="order-table"
      class="q-mx-xl q-mt-md"
      style="flex:1;height: 1px;"
      :rows="table.rows" :columns="table.columns"
      :rows-per-page-options="perPageArray"
      :loading="table.loading"
      v-model:pagination="pagination">
      <template v-slot:loading>
        <q-inner-loading showing>
          <q-spinner-gears size="50px"
            color="primary" />
        </q-inner-loading>
      </template>
      <template v-slot:top>
        <Pagination :sizeArry="perPageArray"
          :totalSize="rowsNumber"
          :currentSize="rowsPerPage"
          :currentPage="page"
          @onPageChange="onPageChange"
          @onPageSizeChange="onPageSizeChange" />
        <div
          class="flex flex-center col-4 descendingBtns"
          style="margin-left:auto;">
          <div class=" q-mx-md">
            <q-btn
              :class="filter['is_descending']? 'inactive': 'active'"
              push size="sm"
              @click="setDescending(false)"
              label="升序" />
            <q-btn push
              :class="filter['is_descending']? 'active': 'inactive'"
              size="sm" label="降序"
              @click="setDescending(true)" />
          </div>
          <q-select label="排序:"
            v-model="filter['sort_by']"
            @update:model-value="getOrder"
            style="max-width: 150px;" outlined
            dense options-dense emit-value
            :options="sortByOptions.list"
            :option-label="sortByOptions.optionLabel"
            options-cover />
        </div>
      </template>
      <template
        v-slot:body-cell-orderStatus="props">
        <td class="items-center flex">
          <p class="text-no-wrap no-margin">
            {{props.row.orderStatus }}</p>
          <p>{{props.row.shippingStatus}}</p>
        </td>
      </template>
      <template v-slot:bottom>
        <Pagination :sizeArry="perPageArray"
          :totalSize="rowsNumber"
          :currentSize="rowsPerPage"
          :currentPage="page"
          @onPageChange="onPageChange"
          @onPageSizeChange="onPageSizeChange" />

      </template>
    </q-table>
  </main>

</template>

<script>
import { ref, computed, onMounted, reactive, toRefs, nextTick } from 'vue'
import { RequestOrder } from '../api'
import Pagination from '../components/Pagination'

const translatePaymentStatus = {
  paid: '已付款',
  pending: '待處理',
  refunded: '已退款ˇ'
}
const translateShippingStatus = {
  received: '已收貨',
  preparing: '準備中'
}
const translateOrderStatus = {
  open: '已開啟',
  cancelled: '已取消',
  closed: '已關閉'
}
const translateSortOptions = {
  'created_at': '訂單建立時間',
  'order_name': '訂單編號',
  'order_status': '訂單狀態',
  'financial_status': '付款狀態',
  'fulfillment_status': '運送狀態',
  'receiver_address': '客戶地址',
  'delivery_data': '運送日期',
  'total_price': '總消費金額'
}

export default {
  components: { Pagination },
  setup () {
    onMounted(() => {
      getOrder()
    })
    const getOrder = () => {
      table.loading = true
      const selectOptions = filterEmptySelect()
      RequestOrder({
        ...selectOptions,
        city: filterCheckBox.model,
        page: pagination.page - 1,
        size: pagination.rowsPerPage
      }).then(res => {
        table.loading = false
        if (res.status !== 200) return
        const { content, total_elements } = res.data
        mapList(content)
        pagination.rowsNumber = total_elements
        console.log('-----------------')
        console.log('done', res.data)
      }).catch(err => {
        table.loading = false
        console.log(err)
      })
    }
    const table = reactive({
      loading: false,
      rows: [],
      columns: [{
        name: 'orderId',
        label: '訂單編號',
        align: 'center',
        field: 'orderId',
        sortable: true
      }, {
        name: 'customerName',
        align: 'center',
        label: '顧客',
        field: 'customerName',
        sortable: false
      }, {
        name: 'amount',
        align: 'center',
        label: '金額',
        field: 'amount',
        format: num => '$' + (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,'),
        sortable: true
      }, {
        name: 'orderDate',
        align: 'center',
        label: '訂單成立時間',
        field: 'orderDate',
        sortable: true
      }, {
        name: 'orderStatus',
        align: 'left',
        label: '訂單狀態',
        field: 'orderStatus',
        sortable: false
      }, {
        name: 'deliverDate',
        align: 'center',
        label: '配送日期與時段',
        field: 'deliverDate',
        sortable: true
      }, {
        name: 'address',
        align: 'left',
        label: '配送地址',
        field: 'address',
        sortable: true
      }, {
        name: 'note',
        align: 'left',
        label: '備註',
        field: 'note',
        sortable: false,
        // style: 'width: 400px;word-wrap: break-word;word-break: break-all;',
      }
      ]
    })
    const mapList = (data) => {
      const newArr = data.map((item) => {
        const {
          order_status,
          created_at,
          order_name,
          note,
          delivery_date,
          delivery_time,
          customer_name,
          total_price,
          financial_status,
          fulfillment_status,
          receiver_address
        } = item
        return {
          orderId: order_name,
          customerName: customer_name,
          amount: `${total_price}`,
          orderDate: created_at,
          orderStatus: `${translateOrderStatus[order_status]} / ${translatePaymentStatus[financial_status]}`,
          shippingStatus: `${translateShippingStatus[fulfillment_status]}`,
          deliverDate: `${delivery_date} ${delivery_time}`,
          address: receiver_address,
          note
        }
      })
      table.rows = newArr
    }
    const sortByOptions = reactive({
      optionLabel: (item) => translateSortOptions[item.trim()],
      list: [
        'created_at', 'order_name', 'order_status', 'financial_status',
        'fulfillment_status', ' receiver_address', 'delivery_data', 'total_price'
      ]
    })
    /* -- filter --  */
    const filter = reactive({
      delivery_date: '',
      financial_status: '',
      fulfillment_status: '',
      is_descending: false,
      order_status: '',
      sort_by: 'created_at'
    })
    const filterCheckBox = reactive({
      label: '配送縣市',
      options: ['台北市', '新北市', '台南市', '高雄市'],
      model: []
    })
    const filterSelects = reactive([
      {
        label: '訂單狀態',
        options: ['open', 'cancelled', 'closed'],
        optionLabel: (item) => translateOrderStatus[item],
        model: 'order_status'
      },
      {
        label: '付款狀態',
        options: ['paid', 'pending', 'refunded'],
        model: 'financial_status',
        optionLabel: (item) => translatePaymentStatus[item],
      },
      {
        label: '出貨狀態',
        options: ['received', 'preparing'],
        model: 'fulfillment_status',
        optionLabel: (item) => translateShippingStatus[item],
      }
    ])
    const filterEmptySelect = () => {
      const obj = {}
      Object.keys(filter).forEach(val => {
        if (filter[val].length !== 0) {
          obj[val] = filter[val]
        }
      })
      return obj
    }
    const onDateChange = () => {
      filter['delivery_date'] = selectDate.value
      getOrder()
    }
    const clearFilter = () => {
      filter['delivery_date'] = ''
      selectDate.value = ''
      filterCheckBox['model'] = []
      Object.keys(filter).map(item => {
        if (item === 'sort_by') {
          filter['sort_by'] = 'created_at'
          return
        }
        filter[item] = ''
      })
      getOrder()
    }

    const setDescending = (boolean) => {
      filter['is_descending'] = boolean
      getOrder()
    }

    /* --date  --  */
    const selectDate = ref('')
    const updateDateProxy = () => {
      selectDate.value = filter['delivery_date']
    }
    const clearDateProxy = () => {
      selectDate.value = ''
      filter['delivery_date'] = ''
    }
    /* --pagination--  */
    const pagination = reactive({
      rowsNumber: 0,
      sortBy: 'id',
      descending: false,
      page: 1,
      rowsPerPage: 10,
      perPageArray: [10, 20, 50]
    })
    const onPageChange = (page) => {
      pagination.page = page
      getOrder()
    }
    const onPageSizeChange = (size) => {
      pagination.rowsPerPage = size
      getOrder()
    }
    return {
      setDescending,
      onDateChange,
      clearFilter,
      sortByOptions,
      clearDateProxy,
      updateDateProxy,
      selectDate,
      getOrder,
      onPageChange,
      onPageSizeChange,
      pagination,
      ...toRefs(pagination),
      filterCheckBox,
      filter,
      filterSelects,
      table
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.container ::v-deep(.q-table thead tr th) {
  position: sticky;
  z-index: 2;
  top: 0;
}
.q-table__container ::v-deep(.q-table__top) {
  padding: 0 16px;
}
.container ::v-deep(.stcikyRow tbody tr td:first-child) {
  box-shadow: 0px 6px 6px 2px #bfbfbf;
}

.container ::v-deep(.order-table tbody tr td:first-child) {
  position: sticky;
  z-index: 1;
  left: 0;
}

.container ::v-deep(.q-field__control-container) {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.container {
  & ::v-deep(.q-table) {
    thead tr {
      background-color: #fff;
    }
    // td {
    //   word-break: break-all;
    //   white-space: normal;
    // }
  }
}

.container ::v-deep(.order-table tbody tr:nth-of-type(odd)) {
  background: #fff;
}
.container ::v-deep(.order-table tbody tr:nth-of-type(even)) {
  background: #ecf5f2;
}

.descendingBtns {
  .active {
    background: $primary;
    color: #fff;
  }
  .inactive {
    background: #fff;
    color: $primary;
  }
  button:first-child {
    border-radius: 5px 0 0 5px;
  }
  button:last-child {
    border-radius: 0 5px 5px 0;
  }
}
</style>