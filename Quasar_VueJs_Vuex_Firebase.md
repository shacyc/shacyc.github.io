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
