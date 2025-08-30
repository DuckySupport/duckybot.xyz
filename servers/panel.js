tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#F5FF82',
                secondary: '#111111',
                dark: '#0a0a0a'
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif']
            },
            maxHeight: {
                '100': '100px'
            }
        }
    }
}

fetch("/servers/panel.lua")
    .then(res => res.text())
    .then(lua => {
        fengari.load(lua)();
    });
