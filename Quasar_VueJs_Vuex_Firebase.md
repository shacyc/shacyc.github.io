# Vue.js
## Syntax

#### template

###### Dom transform - {{ }}
```html
<p> {{ message }} </p>
```

###### Visibility - v-show
```html
<p v-show="isShowMessage"> {{ message }} </p>
```

###### Binding model - v-model
```html
<input type="text" v-model="message">
```

###### Click event - @click
```html
<button @click="changeMessage">Click me!</button>
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

## Project structure

#### src/App.vue
- main component of project
- **<route-view/>**: where the layout will be loaded

#### src/layouts
- layout of pages
- contain everything around pages

###### MyLayout.vue
- **<route-view/>**: where the page will be loaded

#### src/pages
- invidual page
- contain content of page

#### src/assets
- images, icons, ...

#### src/boot
- everything you want to do before app start

#### src/components
- where vue components will be stored
