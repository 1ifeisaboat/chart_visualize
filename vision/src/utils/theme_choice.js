const theme = {
    chalk: {
        backgroundColor: '#161522',
        color: '#fff',
        logoSrc: 'logo_dark.png',
        switchSrc: 'switch_dark.png',
        headerBorderSrc: 'header_border_dark.png'
    },
    vintage: {
        backgroundColor: '#eee',
        color: '#000',
        logoSrc: 'logo_light.png',
        switchSrc: 'switch_light.png',
        headerBorderSrc: 'header_border_light.png'
    }
}
export default function getTheme(themeName) {
    return theme[themeName]
}