const { autoUpdater } = require('electron-updater');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('./database/database');

let mainWindow, db, currentUser = null, dbFile = '';
const doctorOnly = new Set(['finance','reports','settings','backup','users','audit']);
function ok(){ return {ok:true}; }
function deny(){ return {ok:false,message:'ليس لديك صلاحية لتنفيذ هذا الإجراء'}; }
function requireRole(role){ return currentUser && currentUser.role === role; }

function createWindow(){
  mainWindow = new BrowserWindow({width:1400,height:900,minWidth:1100,minHeight:700,
    webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false},
    backgroundColor:'#f5f7fb',title:'Physio Center'});
  mainWindow.loadFile(path.join(__dirname,'pages','login.html'));
}
function register(channel, fn){ ipcMain.removeHandler(channel); ipcMain.handle(channel, fn); }

app.whenReady().then(()=>{
  const dataDir=path.join(app.getPath('userData'),'data'); fs.mkdirSync(dataDir,{recursive:true});
  dbFile=path.join(dataDir,'physio-center.db'); db=new Database(dbFile);

  register('login', async (_,c)=>{ const r=await db.login(c.username,c.password); if(r.ok) currentUser=r.user; return r; });
  register('logout',()=>{currentUser=null;return ok();});
  register('session:user',()=>({ok:true,user:currentUser}));
  register('dashboard',()=>currentUser?db.dashboard(currentUser.role):deny());
  register('patients:list',(_,q)=>currentUser?db.listPatients(q||''):deny());
  register('patients:add',(_,p)=>currentUser?db.addPatient(p,currentUser.id):deny());
  register('patients:get',(_,id)=>currentUser?db.getPatient(id):deny());
  register('patients:update',(_,id,p)=>currentUser?db.updatePatient(id,p,currentUser.id):deny());
  register('appointments:list',(_,date)=>currentUser?db.listAppointments(date):deny());
  register('appointments:add',(_,d)=>currentUser?db.addAppointment(d,currentUser.id):deny());
  register('appointments:update-status',(_,id,status)=>currentUser?db.updateAppointmentStatus(id,status,currentUser.id):deny());
  register('plans:list',(_,id)=>currentUser?db.getTreatmentPlans(id):deny());
  register('plans:add',(_,d)=>currentUser?db.addTreatmentPlan(d,currentUser.id):deny());
  register('sessions:list',(_,id)=>currentUser?db.getSessions(id):deny());
  register('sessions:add',(_,d)=>currentUser?db.addSession(d,currentUser.id):deny());
  register('exercises:list',(_,id)=>currentUser?db.getHomeExercises(id):deny());
  register('exercises:add',(_,d)=>currentUser?db.addHomeExercise(d,currentUser.id):deny());
  register('feedback:add',(_,d)=>currentUser?db.addFeedback(d,currentUser.id):deny());
  register('feedback:list',()=>currentUser?db.getFeedback():deny());

  register('finance:summary',()=>requireRole('doctor')?db.getFinancialSummary():deny());
  register('finance:payments',(_,d)=>requireRole('doctor')?db.addPayment(d,currentUser.id):deny());
  register('finance:expenses',(_,d)=>requireRole('doctor')?db.addExpense(d,currentUser.id):deny());
  register('reports:get',(_,range)=>requireRole('doctor')?db.getReports(range||{}):deny());
  register('feedback:summary',()=>currentUser?db.getFeedbackSummary():deny());
  register('settings:get',()=>requireRole('doctor')?db.getSettings():deny());
  register('settings:save',(_,d)=>requireRole('doctor')?db.saveSettings(d,currentUser.id):deny());
  register('users:list',()=>requireRole('doctor')?db.listUsers():deny());
  register('users:add',(_,d)=>requireRole('doctor')?db.addUser(d,currentUser.id):deny());
  register('users:toggle',(_,id)=>requireRole('doctor')?db.toggleUser(id,currentUser.id):deny());
  register('users:change-password',(_,id,pw)=>requireRole('doctor')?db.changePassword(id,pw,currentUser.id):deny());
  register('audit:list',()=>requireRole('doctor')?db.getAuditLogs():deny());

  register('backup:create',async()=>{
    if(!requireRole('doctor')) return deny();
    const r=await dialog.showSaveDialog(mainWindow,{title:'حفظ نسخة احتياطية',defaultPath:`PhysioCenter-backup-${new Date().toISOString().slice(0,10)}.db`,filters:[{name:'SQLite Database',extensions:['db']}]});
    if(r.canceled||!r.filePath) return {ok:false,canceled:true};
    try{ fs.copyFileSync(dbFile,r.filePath); await db.audit(currentUser.id,'backup_create','database',null); return {ok:true,message:'تم حفظ النسخة الاحتياطية'}; }
    catch(e){return {ok:false,message:e.message};}
  });
  register('backup:restore',async()=>{
    if(!requireRole('doctor')) return deny();
    const r=await dialog.showOpenDialog(mainWindow,{title:'اختيار نسخة احتياطية',properties:['openFile'],filters:[{name:'SQLite Database',extensions:['db']}]});
    if(r.canceled||!r.filePaths[0]) return {ok:false,canceled:true};
    try{
      await db.close(); fs.copyFileSync(r.filePaths[0],dbFile); db=new Database(dbFile); await db.audit(currentUser.id,'backup_restore','database',null);
      return {ok:true,message:'تمت الاستعادة. أغلق البرنامج وافتحه مرة أخرى.'};
    }catch(e){return {ok:false,message:e.message};}
  });

  createWindow();
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});


// =====================
// PhysioCenter Auto Update
// =====================
function setupAutoUpdater() {
  // Do not update when running from source/dev.
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win && !win.isDestroyed()) {
      win.webContents.send('app:update-available', {
        version: info.version,
        releaseDate: info.releaseDate || null
      });
    }
  });

  autoUpdater.on('update-downloaded', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win && !win.isDestroyed()) {
      win.webContents.send('app:update-downloaded');
    }
  });

  autoUpdater.on('error', (err) => {
    console.error('Auto update error:', err?.message || err);
  });

  // Checking never changes the local SQLite database.
  setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 5000);
}

app.whenReady().then(() => {
  setupAutoUpdater();
});
