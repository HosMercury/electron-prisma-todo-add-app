const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let mainWin, todoWin;
const todos = [];

const createMainWindow = () => {
  mainWin = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWin.loadFile('index.html');
  mainWin.on('closed', () => app.quit());
};

const createTodoWin = () => {
  todoWin = new BrowserWindow({
    // width: 700,
    // height: 600,
    parent: mainWin,
    // modal: true,
    frame: true,
    center: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  todoWin.on('closed', () => {
    todoWin = null;
  });

  todoWin.loadFile('todos.html');
};

ipcMain.on('todo:open', () => createTodoWin());

ipcMain.on('todo:save', async (e, v) => {
  console.log('save');
  try {
    await prisma.todo.create({
      data: { name: v }
    });

    const todos = await prisma.todo.findMany();
    mainWin.webContents.send('todos:show', todos);
  } catch (er) {
    console.log(er);
  }
});

// Menu
const isMac = process.platform === 'darwin';

const template = [
  ...(isMac
    ? [
        {
          label: 'Demo',
          submenu: [{ role: 'about' }]
        }
      ]
    : []),

  {
    label: 'File',
    submenu: [isMac ? { role: 'close' } : { role: 'quit' }]
  }
];
const menu = Menu.buildFromTemplate(template);
// Menu.setApplicationMenu(menu);

app.whenReady().then(() => {
  createMainWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
