var vm = new Vue({
    el: '#app',
    data: {
        selectedContact: null,
        newImport: false,
        contactAction: "view",
    },
    created: function () {
        var contactsList = Cookies.get('contactsList');
        if (contactsList) {
            this.contactsList = JSON.parse(contactsList);
        } else {
            this.contactsList = [];
        }
    },
    watch: {
        contactsList: {
            handeler: function(val) {
                Cookies.set('contactsList', JSON.stringify(this.contactsList), { expires: 9999 } )
                console.log('Cookie saved')
                return val;
            },
            deep: true
        }
    },
    methods: {
        selectContact: function (contact) {
            this.selectedContact = this.selectedContact == contact ? null : contact;
            this.contactAdding = false;
        },
        generateNewIndex: function () {
            var newIndex = this.contactsList.length;
            do {
                var trouve = true;
                for (index in this.contactsList) {
                    if (this.contactsList[index].id == newIndex) {
                        trouve == false;
                        newIndex += 1;
                    }
                }
            } while (trouve == false)
            return newIndex;
        },
        deleteContact: function (contactId) {
            for (index in this.contactsList) {
                if (this.contactsList[index].id == contactId) {
                    this.contactsList.splice(index, 1)
                }
            }
            this.selectedContact = null;
        },
        saveContact: function () {
            if (this.selectedContact.firstname && this.selectedContact.lastname && this.selectedContact.phone) {
                if (this.contactAction == "add") {
                    this.selectContact.id = this.generateNewIndex();
                }
                else {
                    for (index in this.contactsList) {
                        if (this.contactsList[index].id == this.selectedContact.id) {
                            this.contactsList[index] = this.selectedContact;
                        }
                    }
                } 
                this.contactsList.push(this.selectedContact);
                this.contactAction = 'view';
            }
        },
        exportCSV: function () {

            var csvContent = "data:text/csv;charset=utf-8,";
            var row = Object.keys(this.contactsList[0]).join(",");
            csvContent += row + "\r\n";
            for (contact of this.contactsList) {
                var row = "";
                for (key in contact) {
                    row += contact[key] + ',';
                }
                csvContent += row + "\r\n";
            }

            var encodedUri = encodeURI(csvContent);
            window.open(encodedUri);

        },
        importCSV: function (event) {
            var file = event.target.files[0];
            var r = new FileReader();
            let self = this;
            var newContactsList = [];

            r.onload = (function (file) {
                return function (e) {
                    var contents = e.target.result;
                    var rows = contents.split('\r\n');

                    var columns = [];

                    for (i in rows) {
                        if (i == 0) {//première ligne
                            columns = rows[i].split(',');
                            continue;
                        }

                        if (rows[i].length > 0) {
                            var arrayRow = rows[i].split(',')
                            var newContact = {}; 
                            for (j in columns) {
                                newContact[columns[j]] = arrayRow[j];
                            }
                            newContactsList.push(newContact);
                        }
                       
                    }
                    if(confirm(newContactsList.length + ' lignes vont être ajouté, valider ?')) {
                        for (newContact of newContactsList) {
                            newContact.id = self.generateNewIndex();
                            self.contactsList.push(newContact);
                            self.newImport = false;
                        }
                    }
                };
            })(file);
            r.readAsText(file, function() {
                
                console.log(newContactsList);
                if(confirm(newContactsList.length + ' lignes vont être ajouté, valider ?')) {
                    for (newContact of newContactsList) {
                        newContact.id = this.generateNewIndex();
                        this.contactsList.push(newContact);
                        this.newImport = false;
                    }
                }
            });
            
        }
    }
});