**Prompt for page recovery between chats:**
```
<code>

This is was your last output.
We continue our work.
I forbid you changing the style of code and page.
Understood?
```

```js
setInterval(() => {
    let chlds = document.querySelectorAll(".ds-button.ds-button--outlinedNeutral ")
    chlds.forEach(e => {
        if (e?.children[2]?.innerHTML === "Continue") 
    })
}, 1000);
```