App.controller.define('CMain', {

	views: [
		"VMain",
        "VDemandeRepro"
	],
	
	models: [
	],
	
	init: function()
	{

		this.control({
			"menu>menuitem": {
				click: "Menu_onClick"
			},
            "mainform button#demande_repro": {
                click: "demanderepro_onclick"
            },
			"mainform grid": {
				itemdblclick: "grid_dblclick"	
			},
            "VDemandeRepro": {
                show: "VDemandeRepro_onshow"
            },
            "VDemandeRepro button#btnOK": {
                click: "OK_onclick"
            }
		});
		
		App.init('VMain',this.onLoad);
		
	},
	grid_dblclick: function(me,store) {
		if (store.data.type=="Reprographie") App.view.create("VDemandeRepro",{modal: true,status:store.data.status,ItemID:store.data.id}).show();
	},
    VDemandeRepro_onshow: function(me) {
		if (me.ItemID) {
			if (me.status*1>1) App.get(me,'button#btnOK').hide();
			App.DB.get('formulaires://demandes?id='+me.ItemID,me,function(response){
				App.get(me,"uploadfilemanager").setFiles(JSON.parse(response.data[0].files);
			});
			
			if (me.status*1==1) {
				if (Auth.User.profiles.indexOf('REPRO')>-1) {
					App.DB.post('formulaires://demandes',{
						id: me.ItemID,
						status: 2,
						Date2: new Date()
					});
					me.status=2;
					App.get(me,'button#closeme').show();
				};
			}
		};	
    },
	doJobs: function(JOBS,id,cb)
	{
		var _p=this;
		App.MyService.import(JOBS[id],function() {
			if (JOBS[id+1]) _p.doJobs(JOBS,id+1,cb); else cb();
		});
	},    
    OK_onclick: function(me)
    {
        var JOBS=App.get('VDemandeRepro uploadfilemanager').getFiles();
        this.doJobs(JOBS,0,function(){
            App.DB.post('formulaires://demandes',{
                Name: Auth.User.firstname+' '+Auth.User.lastname,
                UserID: Auth.User.uid,
                subject: App.get('textfield#objet').getValue(),
                object: App.get('htmleditor#demande').getValue(),
                Date1: new Date(),
                status: 1,
                files: JSON.stringify(JOBS)
            },function(e,r){
                App.notify('Votre demande a bien été enregistrée');
                me.up('window').close();
            });             
        });
    },
    demanderepro_onclick: function(me)
    {
        App.view.create("VDemandeRepro",{modal: true}).show();
    },
	Menu_onClick: function(p)
	{
		if (p.itemId) {
			
		};			
	},

	onLoad: function()
	{
	   Auth.login(function(){
			if (Auth.User.profiles.indexOf('REPRO')>-1) {
				App.get('mainform grid').columns[0].show();
				var store=App.store.create("formulaires://demandes?type=Reprographie");
				App.get('mainform grid').bindStore(store);
				App.get('mainform grid').store.load();
			};
			if (Auth.User.profiles.length==0) {
				var store=App.store.create("formulaires://demandes?UserID="+Auth.User.uid);
				App.get('mainform grid').bindStore(store);
				App.get('mainform grid').store.load();                        
			};           
       });
	}
	
	
});
