---
outline: deep
---

# 手写element表格组件

## 表格组件功能分析

- Table 接收并展示数据
  - 持有表格数据 data属性
  - 解析内部column获取表头，表体
- TableColumn 定义列头，列数据
  - prop定义数据列的key
  - label定义表头的标题

## 基本用法实现

先搭架子

```vue
<template>
  <div>
    <h1>Playground</h1>
    <sf-table :data="tableData" style="width: 100%">
      <sf-table-column prop="date" label="日期" width="180"> </sf-table-column>
      <sf-table-column prop="name" label="姓名" width="180"> </sf-table-column>
      <sf-table-column prop="address" label="地址"> </sf-table-column>
    </sf-table>
  </div>
</template>

<script>
import SfTable from '../../components/SfTable.vue'
import SfTableColumn from '../../components/SfTableColumn.vue'
export default {
  components: {
    SfTable,
    SfTableColumn
  },
  data () {
    return {
      tableData: [
        {
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1517 弄'
        },
        {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1519 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1516 弄'
        }
      ]
    }
  }
}
</script>

<style>
</style>

```

SfTable

```vue
<template>
  <table>
    <thead>
        <tr>
            <th></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td></td>
        </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'SfTable'
}
</script>

<style>

</style>

```

SfTableColumn

```vue
<template>
  <div></div>
</template>

<script>
export default {
  name: 'SfTableColumn'
}
</script>

<style>

</style>

```

SfTable，搭架子，父传子 打印下data

```vue
<template>
  <table>
    <thead>
      <tr>
        <!-- 表头有几列，处理计算属性columns，表头的展示中文用的是label -->
        <th v-for="column in columns" :key="column.label">
          {{ column.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <!-- 有一行数据就有一个tr，处理计算属性rows -->
      <tr v-for="(row, index) in rows" :key="index">
        <!-- 每个row是个对象，遍历对象的键值对 -->
        <td v-for="(value, key) in row" :key="key">
          {{ value }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'SfTable',
  props: {
    data: {
      type: Array,
      required: true
    }
  },
  mounted () {
    console.log(this.data)
  }
}
</script>

<style>
</style>


```

计算属性columns处理，可以通过插槽来获取

```js
computed: {
  columns () {
  //   console.log(this.$slots.default)
    const res = this.$slots.default.map(({ data: { attrs } }) => ({ prop: attrs.prop, label: attrs.label }))
    return res
  }
}
```

计算属性处理rows

```js
rows () {
  return this.data.map(item => {
    // 每个row都是个对象
    const row = {}
    this.columns.forEach(({ prop }) => {
      row[prop] = item[prop]
    })
    return row
  })
},
```

这样基本的table实现就搞定了，基本实现完整代码如下

```vue
<template>
  <table>
    <thead>
      <tr>
        <td v-for="column in columns" :key="column.label">
          {{ column.label }}
        </td>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, index) in rows" :key="index">
        <td v-for="(value, key) in row" :key="key">
            {{ value }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'SfTable',
  props: {
    data: {
      type: Array,
      required: true
    }
  },
  mounted () {
    // console.log(this.data)
  },
  computed: {
    rows () {
      return this.data.map(item => {
        // 每个row都是个对象
        const row = {}
        this.columns.forEach(({ prop }) => {
          row[prop] = item[prop]
        })
        return row
      })
    },
    columns () {
    //   console.log(this.$slots.default)
      const res = this.$slots.default.map(({ data: { attrs } }) => ({ prop: attrs.prop, label: attrs.label }))
      return res
    }
  }
}
</script>

<style>
</style>

```

## 自定义列模板

操作列，修改删除按钮，自定义列的时候不需要传入prop

```jsx
<sf-table-column label="操作">
  <template #default="scope">
    <button @click="handleEdit(scope.$index, scope.row)">修改</button>
    <button @click="handleDel(scope.$index,scope.row)">删除</button>
  </template>
</sf-table-column>
```

```js
methods: {
  handleEdit (idx, row) {
    console.log(idx, row)
  },
  handleDel (idx, row) {
    console.log(idx, row)
  }
}
```

通过打印，可以知道如何获取作用域插槽中的button

```js
mounted () {
  // console.log(this.data)
  console.log(this.$slots.default[3].data.scopedSlots.default())
},
```

虚拟dom不能直接在template使用，要用到render，把template删掉直接用jsx

```js
render () {
  return (
    <table>
      <thead>
        <tr>
          {this.columns.map(col => (
            <td key={col.label}>{col.label}</td>
          ))}
        </tr>
      </thead>
      <tbody>
        {this.rows.map((row, index) => {
          const tds = Object.keys(row).map(key => (
            <td key={key}>
              {row[key]}
            </td>
          ))
          return (
            <tr key={index}>
              {tds}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
```

这样最基本的jsx改造就好了

column的数据不应该无脑返回prop和label，自定义列模板是不用写prop的

因为column的变化，rows返回的结果也是不一样的，我们可以统一标准，返回的都是vnode

首先先改造下column现有的代码，完整写法，因为要处理复杂的逻辑

```js
columns () {
  return this.$slots.default.map(({ data: { attrs } }) => {
    const column = { ...attrs }
    return column
  })
}
```

接着data中还可以解构出作用域插槽，根据scopedSlots做判断，统一处理renderCell

```js
columns () {
  return this.$slots.default.map(({ data: { attrs, scopedSlots } }) => {
    const column = { ...attrs }
    if (scopedSlots) {
      column.renderCell = (row, i) => <div>{scopedSlots.default({ row, $index: i })}</div>
    } else {
      column.renderCell = (row) => <div>{row[column.prop]}</div>
    }
    return column
  })
}
```

计算属性rows不需要了，我们有独立的渲染逻辑了，删除rows，在对模板进行改造

```js
render () {
  return (
    <table>
      <thead>
        <tr>
          {this.columns.map((col) => (
            <td key={col.label}>{col.label}</td>
          ))}
        </tr>
      </thead>
      <tbody>
        {this.data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {this.columns.map((column, columnIndex) => (
              <td key={columnIndex}>{column.renderCell(row, rowIndex)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

## 排序

sf-table-column上加sortable属性

```jsx
<sf-table :data="tableData" style="width: 100%">
  <sf-table-column sortable prop="date" label="日期" width="180"> </sf-table-column>
  <sf-table-column sortable prop="name" label="姓名" width="180"> </sf-table-column>
  <sf-table-column prop="address" label="地址"></sf-table-column>
  <sf-table-column label="操作">
    <template #default="scope">
      <button @click="handleEdit(scope.$index, scope.row)">修改</button>
      <button @click="handleDel(scope.$index,scope.row)">删除</button>
    </template>
  </sf-table-column>
</sf-table>
```

我们需求简单点，就一个列参与排序，可以升序，可以降序（默认），需要在table组件里定义状态

```js
data () {
  return {
    orderField: '',
    orderBy: 'desc' // desc降序 asc升序
  }
},
```

在created声明周期处理排序逻辑，用户第一个加sortable的列参与排序，设置orderField字段

```js
created () {
  this.columns.forEach(col => {
    // eslint-disable-next-line
    if (col.hasOwnProperty('sortable')) {
      // 直接获取col.sortable是空字符串 所以要用hasOwnProperty
      // console.log(col)
      if (col.prop && !this.orderField) {
        // 要有prop属性并且没有设置过orderField才设置orderField
        this.orderField = col.prop
      }
    }
  })
},
```

处理显示箭头逻辑

```jsx
<thead>
  <tr>
    {this.columns.map((col) => {
      // eslint-disable-next-line
      if (col.hasOwnProperty("sortable") && col.prop) {
        let orderArrow = '↑↓'
        if (col.prop === this.orderField) {
          // console.log(orderArrow)
          orderArrow = this.orderBy === 'desc' ? '↓' : '↑'
        }
        return (
          <td key={col.label}>
            {col.label} <span>{orderArrow}</span>
          </td>
        )
      } else {
        return <td key={col.label}>{col.label}</td>
      }
    })}
  </tr>
</thead>
```

处理排序方法 sort方法，传入2个参数，一个是排序的字段，一个是如何排序

```js
created () {
  this.columns.forEach((col) => {
    // eslint-disable-next-line
    if (col.hasOwnProperty("sortable")) {
      // 直接获取col.sortable是空字符串 所以要用hasOwnProperty
      // console.log(col)
      if (col.prop && !this.orderField) {
        // 要有prop属性并且没有设置过orderField才设置orderField
        // this.orderField = col.prop
        // 重构
        this.sort(col.prop, this.orderBy)
      }
    }
  })
},
methods: {
  sort (field, by) {
    this.orderField = field
    this.orderBy = by
  }
},
```

处理排序方法，就是返回-1，0，1，这里简单粗暴点，就判断是数字和字符串，然后处理比较逻辑

```js
sort (field, by) {
  this.orderField = field
  this.orderBy = by
  this.data.sort((a, b) => {
    // console.log(a[this.orderField], b[this.orderField])
    const v1 = a[this.orderField]
    const v2 = b[this.orderField]
    console.log(v1, v2)
    if (typeof v1 === 'number') {
      return this.orderBy === 'desc' ? v2 - v1 : v1 - v2
    } else {
      return this.orderBy === 'desc' ? v2.localeCompare(v1) : v1.localeCompare(v2)
    }
  })
}
```

点击表头进行排序

```jsx
return (
  <td key={col.label} onClick={() => this.toggleSort(col.prop)}>
    {col.label} <span>{orderArrow}</span>
  </td>
)
```

```js
toggleSort (field) {
  const by = this.orderBy === 'desc' ? 'asc' : 'desc'
  this.sort(field, by)
},
```

## 测试

### 测试分类

常见的开发流程里，都有测试人员，他们不管内部实现机制，只看最外层的输入输出，这种我们称为**黑盒测试**。比如你写一个加法的页面，会设计N个用例，测试加法的正确性，这种测试我们称之为**E2E测试**

还有一种测试叫做**白盒测试**，我们针对一些内部核心实现逻辑编写测试代码，称之为**单元测试**

更负责一些的我们称之为**集成测试**，就是集合多个测试过的单元一起测试

### 测试的好处

- 提供描述组件行为的文档
- 节省手动测试的事件
- 减少研发新特性时产生的bug
- 改进设计
- 促进重构

### 准备工作

vue-cli中，预置了Mocha+Chai和Jest两套单测方案，我们演示代码用jest，他们语法基本一致

如果是vue-cli新建项目，可以勾选Unit Testing，E2E Testing可以不勾选有兴趣自行了解，单元测试方案选择Jest

如果是已有项目，在已存在项目中集成，可以这么做

- 集成jest `vue add @vue/unit-jest`
- 集成cypress `vue add @vue/e2e-cypress`

### 编写单元测试

单元测试(unit testing)，是指对软件中的最小可测试单元进行检查和验证

`src/unit/xxx.spec.js`，`*.spec.js`是命名规范

可以看下`example.spec.js`，先说明一些概念

```js
import { shallowMount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'

// 套件(一个套件里有若干单元测试)
describe('HelloWorld.vue', () => {
  // 单元测试
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      propsData: { msg }
    })
    expect(wrapper.text()).toMatch(msg)
  })
})

```

我们尝试写个测试加法函数的例子试试

```js
function add (a, b) {
  return a + b
}

describe('测试add函数', () => {
  it('传入2个数字', () => {
    expect(add(1, 2)).toBe(3)
  })
  it('传入2个字符串', () => {
    expect(add('1', '2')).toBe('12')
  })
})

```

执行`yarn test:unit`，看结果

### 测试Vue组件

官方提供了用于单元测试的使用工具库`@vue/test-units`

检查mounted之后预期结果

比如前面案例中的example，我们还可以更精确的判断h1中有没有我们想要的文案

```js
const h1 = wrapper.find('h1')
expect(h1.text()).toBe(msg)
```

比如测试点击事件
`<p @click="foo = 'bar'" class="test-p">{{ foo }}</p>`

```js
it('click testP', async () => {
  const wrapper = shallowMount(HelloWorld)
  const testP = wrapper.find('.test-p')
  await testP.trigger('click')
  expect(testP.text()).toBe('bar')
})
```

比如获取自定义组件

```js
components: {
  comp: {
    name: 'comp',
    render (h) {
      return h('div', 'comp')
    }
  }
}
```

```js
it('find component', () => {
  const wrapper = shallowMount(HelloWorld)
  const comp = wrapper.findComponent({ name: 'comp' })
  expect(comp.exists()).toBe(true)
})
```

### 测试覆盖率

Jest自带覆盖率，很容易统计我们测试代码是否全面

修改jest.config.js

```js
module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,vue}']
}
```

- stmts是语句覆盖率(statement coverage) 是不是每个语句都执行
- branch是分支覆盖率(branch coverage) 是不是每个if代码块都执行了
- funcs是函数覆盖率(function coverage) 是不是每个函数都调用了
- lines是行覆盖率(line coverage) 是不是每一行都执行了

此外还会生成覆盖率报告，可以看项目多出来个文件夹

### 测试Table组件

```js
import { mount } from '@vue/test-utils'
import SfTable from '@/components/SfTable.vue'
import SfTableColumn from '@/components/SfTableColumn.vue'

describe('SfTable.vue', () => {
  it('basic table', () => {
    const template = `
      <sf-table :data="tableData" style="width: 100%">
        <sf-table-column prop="date" label="日期" width="180"> </sf-table-column>
        <sf-table-column prop="name" label="姓名" width="180"> </sf-table-column>
        <sf-table-column prop="address" label="地址"></sf-table-column>
      </sf-table>
    `
    const tableData = [
      {
        date: '2016-05-02',
        name: '王小虎2',
        address: '上海市普陀区金沙江路 1518 弄'
      },
      {
        date: '2016-05-04',
        name: '王小虎3',
        address: '上海市普陀区金沙江路 1517 弄'
      },
      {
        date: '2016-05-01',
        name: '王小虎1',
        address: '上海市普陀区金沙江路 1519 弄'
      },
      {
        date: '2016-05-03',
        name: '王小虎4',
        address: '上海市普陀区金沙江路 1516 弄'
      }
    ]
    const comp = {
      template,
      components: {
        SfTable,
        SfTableColumn
      },
      data () {
        return {
          tableData
        }
      }
    }
    const wrapper = mount(comp)
    expect(wrapper.find('table').exists()).toBe(true)
  })
})

```

跑测试发现attrs报错，原因是因为测试的编译会把空格也处理，空格是没有attrs的

```js
columns () {
return this.$slots.default
  .filter(vnode => vnode.tag)
  .map(({ data: { attrs, scopedSlots } }) => {
    const column = { ...attrs }
    if (scopedSlots) {
      column.renderCell = (row, i) => (
        <div>{scopedSlots.default({ row, $index: i })}</div>
      )
    } else {
      column.renderCell = (row) => <div>{row[column.prop]}</div>
    }
    return column
  })
}
```

在追加些其他用例，完整代码如下

```js
import { mount } from '@vue/test-utils'
import SfTable from '@/components/SfTable.vue'
import SfTableColumn from '@/components/SfTableColumn.vue'

describe('SfTable.vue', () => {
  it('basic table', () => {
    const template = `
      <sf-table :data="tableData" style="width: 100%">
        <sf-table-column prop="date" label="日期" width="180"> </sf-table-column>
        <sf-table-column prop="name" label="姓名" width="180"> </sf-table-column>
        <sf-table-column prop="address" label="地址"></sf-table-column>
      </sf-table>
    `
    const tableData = [
      {
        date: '2016-05-02',
        name: '王小虎2',
        address: '上海市普陀区金沙江路 1518 弄'
      },
      {
        date: '2016-05-04',
        name: '王小虎3',
        address: '上海市普陀区金沙江路 1517 弄'
      },
      {
        date: '2016-05-01',
        name: '王小虎1',
        address: '上海市普陀区金沙江路 1519 弄'
      },
      {
        date: '2016-05-03',
        name: '王小虎4',
        address: '上海市普陀区金沙江路 1516 弄'
      }
    ]
    const comp = {
      template,
      components: {
        SfTable,
        SfTableColumn
      },
      data () {
        return {
          tableData
        }
      }
    }
    const wrapper = mount(comp)
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.findAll('thead tr td').length).toBe(3)
    expect(wrapper.findAll('tbody tr').length).toBe(4)
    expect(wrapper.find('tbody tr').text()).toMatch('1518 弄')
  })
})

```
