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
```html
<p v-show="isShowMessage"> {{ message }} </p>
```

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
