const {contextBridge,ipcRenderer}=require('electron');
const invoke=(c,...a)=>ipcRenderer.invoke(c,...a);
contextBridge.exposeInMainWorld('physio',{
 login:c=>invoke('login',c), logout:()=>invoke('logout'), user:()=>invoke('session:user'), dashboard:()=>invoke('dashboard'),
 patients:{list:q=>invoke('patients:list',q),add:p=>invoke('patients:add',p),get:id=>invoke('patients:get',id),update:(id,p)=>invoke('patients:update',id,p)},
 appointments:{list:d=>invoke('appointments:list',d),add:d=>invoke('appointments:add',d),status:(id,s)=>invoke('appointments:update-status',id,s)},
 plans:{list:id=>invoke('plans:list',id),add:d=>invoke('plans:add',d)},
 sessions:{list:id=>invoke('sessions:list',id),add:d=>invoke('sessions:add',d)},
 exercises:{list:id=>invoke('exercises:list',id),add:d=>invoke('exercises:add',d)},
 feedback:{list:()=>invoke('feedback:list'),add:d=>invoke('feedback:add',d),summary:()=>invoke('feedback:summary')},
 finance:{summary:()=>invoke('finance:summary'),addPayment:d=>invoke('finance:payments',d),addExpense:d=>invoke('finance:expenses',d)},
 reports:{get:(range)=>invoke('reports:get',range||{})},settings:{get:()=>invoke('settings:get'),save:d=>invoke('settings:save',d)},
 users:{list:()=>invoke('users:list'),add:d=>invoke('users:add',d),toggle:id=>invoke('users:toggle',id),changePassword:(id,pw)=>invoke('users:change-password',id,pw)},
 audit:{list:()=>invoke('audit:list')},backup:{create:()=>invoke('backup:create'),restore:()=>invoke('backup:restore')}

  appUpdater: {
    onUpdateAvailable: (callback) => ipcRenderer.on('app:update-available', (_event, info) => callback(info)),
    onUpdateDownloaded: (callback) => ipcRenderer.on('app:update-downloaded', () => callback()),
    download: () => ipcRenderer.invoke('app:update-download'),
    install: () => ipcRenderer.invoke('app:update-install')
  },

});
