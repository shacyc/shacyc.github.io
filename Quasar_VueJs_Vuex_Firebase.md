# Vue.js
## Syntax

#### template

###### Dom transform - {{ }}
```html
<p> {{ message }} </p>
```

###### 2-way binding - v-model
```html
<input type="text" v-model="message">
```

###### Visibility - v-show
Use data
```html
<p v-show="isShowMessage"> {{ message }} </p>
```
Or using direct condition
```html
<p v-show="message.length"> {{ message }} </p>
```
If v-show = false, it'll add **display: none;** style

###### Click event - @click
```html
<button @click="changeMessage">Click me!</button>
```
###### Key up event - @keyup
```html
<input @keyup="handleKeyUp" />
```

```javascript
method: {
  handleKeyUp(e) {
    console.log(e.keyCode, e.key);
  }
}
```

Or using [Keycode](https://vuejs.org/v2/guide/events.html#Key-Codes)
```html
<input @keyup.esc="handleKeyUp" 
       @keyup.enter="handleKeyUp" 
       @keyup.tab="handleKeyUp" 
       @keyup.delete="handleKeyUp" 
       @keyup.esc="handleKeyUp" 
       @keyup.space="handleKeyUp" 
       @keyup.up="handleKeyUp" 
       @keyup.down="handleKeyUp" 
       @keyup.left="handleKeyUp" 
       @keyup.right="handleKeyUp" 
 />
```
###### Mouse event - @mouseenter, @mouseleave
```html
<input @mouseenter="handleMouse"
       @mouseleave="handleMouse"
/>
```
###### Condition - @v-if, @v-else
```html
<h5 v-if="message.length">If condition</h5>
<h5 v-else>Else condition</h5
```
If false, it'll **remove dom element**

###### Binding to attributes or css - v-bind: (or :)
Use can use both **v-bind:** and **:**  
1. binding directly
```html
<input :class="{'input-error-class': messange.length > 255}">
```
2. using computed
```html
<input :style="inputErrorStyle">
```
```javascript
computed: {
  inputErrorStyle(): {
    if (this.message.length > 255)
      return {
        'border': '1px solid red',
        'color': 'red'
      }
  }
}
```

###### List - v-for
```html
<ul>
  <li v-for="(task, index) in tasks"> 
    <div>{{ task.name }}</div>
    <small>{{ task.dueDate }} @ {{ task.dueTime }}</small>
    <button @click="deleteTask(index)">X</button>
  </li>
</ul>
```
```javascript
data() {
  return {
    tasks: [
      { name: 'task 1', dueDate: '27/04/2019', dueTime: '10:00' },
      { name: 'task 2', dueDate: '27/04/2019', dueTime: '11:00' },
      { name: 'task 3', dueDate: '27/04/2019', dueTime: '12:00' }
  }
},
methods: {
  deleteTask(index) {
    this.tasks.splice(index, 1);
  }
}
```

#### script
```javascript
export default {
  data() { 
    return {
      message: "This is a message",
      isShowMessage: true
    }
  },
  methods: {
    changeMessage() {
      this.message = "This method will change message content";
    }
  },
  computed: {
    revesedMessage() {
      return this.message.split('').reverse().join('');
    }
  },
  filters: {
    dateFormat(value) {
      return `${value.getDate()}/${value.getMonth() + 1}/${value.getFullYear()}`;
    }
  },
  directives: {
    autofocus: {
      inserted(el) {
        el.focus;
      }
    }
  },
  beforeCreate() {
    console.log("before create")
  },
  created() {
    console.log("created")
  },
  beforeMount() {
    console.log("before mount")
  },
  mounted() {
    console.log("mounted")
  },
  beforeUpdate() {
    console.log("before update")
  },
  updated() {
    console.log("updated")
  },
  beforeDestroy() {
    console.log("before update")
  },
  destroyed() {
    console.log("updated")
  },
}
```

###### data
Return an object contains component's data

###### methos
An object contains component's methods

###### computed
- Any **complex logic**, you should use a computed property
- Computed properties are **cached based on their reactive dependencies**, so, it has better performance than binding with methods

```html
<p v-model="revesedMessage"></p>
```
```javascript
computed: {
  revesedMessage() {
    return this.message.split('').reverse().join('');
  }
```
###### filters
Apply common **text formatting**
```html
<p v-model="birthday | dateFormat"></p>
```
```javascript
filters: {
    dateFormat(value) {
      return `${value.getDate()}/${value.getMonth() + 1}/${value.getFullYear()}`;
    }
  }
```
###### directives
Everything start with **v-** is called directives  
We can add self-defined directives by adding directives object
```html
<input v-autofocus>
```
```javascript
directives: {
  autofocus: {
    inserted(el) {
      el.focus();
    }
  }
}
```

## Components
Componets will be stored in src/components

#### Import components
1. Using import
```html
<script>
  import Task from 'components/Task.vue'
  export default {
    components: {
      'task': Task
    }
  }
</script>
```

2. The shorten way
```html
<script>
  export default {
    components: {
      'task': require('components/Task.vue').default
    }
  }
</script>
```

#### Passing data to child component
1. Props
    - component
    ```html
    <template>
      <li>
        <div>{{ task.name }}</div>
        <small>{{ task.dueDate }} @ {{ task.dueTime }}</small>
        <button @click="deleteTask(index)">X</button>
      </li>
    </template>
    <script>
      export default {
        props: ['task', 'index']
      }
    </script>
    ```
    - page
    ```html
    <ul>
      <task v-for="(task, index) in tasks"
            :task="task"
            :index="index"
      ></task>
    </ul>
    ```

2. Slots
Slot pass content from parent component to child component
The &lt;slot&gt; tag will be replaced by the content between child component tag
    - component
    ```html
    <template>
      <li>
        <div>{{ task.name }} <slot></slot></div>
        <small>{{ task.dueDate }} @ {{ task.dueTime }}</small>
        <button @click="deleteTask(index)">X</button>
      </li>
    </template>
    <script>
      export default {
        props: ['task', 'index']
      }
    </script>
    ```
    - page
    ```html
    <ul>
      <task v-for="(task, index) in tasks"
            :task="task"
            :index="index"
      >This content will be replaced into slot tag</task>
    </ul>
    ```
The result will be **task 1 This content will be replaced into slot tag**

#### Keys
When using v-for, items should be contain their key (id) to help vue to track items
```html
<ul>
  <task v-for="(task, index) in tasks"
        :key="task.id"
        :task="task"
        :index="index"
  ></task>
</ul>
```

## Lifecycle hook
#### create component
![Vue.js lifecycle hook](img/vuejslifecycle.png "Vue.js lifecycle hook")
```javascript
beforeCreate() {
  console.log("before create")
},
created() {
  console.log("created")
},
beforeMount() {
  console.log("before mount")
},
mounted() {
  console.log("mounted")
},
beforeUpdate() {
  console.log("before update")
},
updated() {
  console.log("updated")
},
beforeDestroy() {
  console.log("before update")
},
destroyed() {
  console.log("updated")
},
```

## Refs (Id)
Use ref in component's items to define their's id
```html
<input ref="txtUserName">
```
```javascript
mounted(): {
  this.$refs.txtUserName.className = 'input-class';
}
```

# Quasar

[1. Install Quasar CLI and create Quasar project](https://quasar.dev/quasar-cli/installation)

## Layout
#### Layout style class
- **padding**

## Project structure

#### src/App.vue
- main component of project
- **route-view**: where the layout will be loaded

#### src/layouts
- layout of pages
- contain everything around pages

###### MyLayout.vue
- **route-view**: where the page will be loaded

#### src/pages
- invidual page
- contain content of page

#### src/assets
- images, icons, ...
- file will be processed by webpack

#### src/store
- process by **Vuex**

#### src/boot
- everything you want to do before app start

#### src/components
- where vue components will be stored

## Routes And Pages
- Pages will be stored in src/pages
- Routes will be configured in src/router/routes.js