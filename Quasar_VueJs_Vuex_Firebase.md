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

#### script
```javascript
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
