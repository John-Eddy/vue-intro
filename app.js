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

    methods: {
        selectContact: function (contact) {
            this.selectedContact = this.selectedContact == contact ? null : contact;
            this.contactAdding = false;
            this.contactAction = 'view';
        },
        persist: function () {
            Cookies.set('contactsList', JSON.stringify(this.contactsList), { expires: 9999 })
            console.log('Cookie saved')
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
            this.persist();
            this.selectedContact = null;
        },
        saveContact: function () {
            console.log(this.contactAction);
            if (this.selectedContact.firstname && this.selectedContact.lastname && this.selectedContact.phone) {
                if (this.contactAction == "add") {
                    this.selectedContact.id = this.generateNewIndex();
                    this.contactsList.push(this.selectedContact);
                }
                else {
                    for (index in this.contactsList) {
                        if (this.contactsList[index].id == this.selectedContact.id) {
                            this.contactsList[index] = this.selectedContact;
                        }
                    }
                }
                this.persist();
                this.contactAction = 'view';
            }
        },
        exportCSV: function () {

            var csvContent = "";            
            var row = Object.keys(this.contactsList[0]).join(",");
            csvContent += row + "\r\n";
            for (contact of this.contactsList) {
                var row = "";
                for (key in contact) {
                    if (key != 'id') {
                        row += contact[key] + ',';
                    }
                }
                csvContent += row + "\r\n";
            }

            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";

            var file = new Blob([csvContent], { type:  "data:text/csv;charset=utf-8," });
            url = window.URL.createObjectURL(file);
            a.href = url;
            a.download = 'export_contacts.csv';
            a.click();
            window.URL.revokeObjectURL(url);

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
                    if (confirm(newContactsList.length + ' lignes vont être ajouté, valider ?')) {
                        for (newContact of newContactsList) {
                            newContact.id = self.generateNewIndex();
                            self.contactsList.push(newContact);
                            self.persist();
                            self.newImport = false;
                            self.contactAction = 'view';

                        }
                    }
                };
            })(file);
            r.readAsText(file);
        }
    }
});