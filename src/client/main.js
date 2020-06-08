// define dependencies..
const electron = require('electron')
const { app } = require('electron')
const { BrowserWindow } = require('electron')
const fs = require('fs')

// const root = fs.readdirSync('/')
// console.log(root)

// load app configurations.
const configFile = './src/client/configuration.json'
const mainHTMLFile = './src/client/main_index.html'
var appConfig

// synchronous loading.
let jsonData = fs.readFileSync(configFile);
appConfig = JSON.parse(jsonData)

// asynchronous loading.
// Will not error, but will not load in time to be useful.
// fs.readFile(configFile, (err, data) => {
//     if (err) throw err
//     appConfig = JSON.parse(data)
//     // console.log(appConfig)
// });

// using require to load configs.
// Will not parse JSON correctly as defined.
// let jsonData = require('./configuration.json');
// appConfig = JSON.parse(jsonData)

// verify config data.
console.log("appConfig: ", appConfig)

// define main window for app.
function createWindow() {
    const win = new BrowserWindow(appConfig)        // Create the browser window.
    win.loadFile(mainHTMLFile)                                  // Load the index.html of the app.
    win.webContents.openDevTools()                         // Open the DevTools.
}

// This method will be called when initialization has finished.
// Electron is now ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar to stay active.
    // Unless the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the dock icon is clicked
    // and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process code.
// You can also put them in separate files and require them here.


// Using Electron APIS.
// This will work in the main process, but be `undefined` in renderer:
// const { BrowserWindow } = require('electron')
//This will work in a renderer process, but be `undefined` in main:
// const { remote } = require('electron')
// const { BrowserWindow } = remote
// const win = new BrowserWindow()
