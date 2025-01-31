const keys = {
    ArrowUp: false,
    ArrowDown: false,
};

// Track key presses
window.addEventListener("keydown", (e) => {
    if (e.key in keys) keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    if (e.key in keys) keys[e.key] = false;
});
