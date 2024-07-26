import { LightningElement, wire, track } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import {CurrentPageReference} from 'lightning/navigation';
import jsonData from '@salesforce/resourceUrl/showpagejson';
import findIsValid from '@salesforce/apex/ShowPageController.findContact';
//import getNotes from '@salesforce/apex/ShowPageController.findNotes';

const FIELDS = ["Case.AccountId", "Case.ContactEmail"];
 
export default class LoadShow extends LightningElement {
  case;
  validEmail = false;
  //accountNotes = "";
  accountID;
  @track recidd;
  jsonToShow;
  showPageData;


  dataLoaded = false;

  connectedCallback() {
    let request = new XMLHttpRequest();
    request.open("GET", jsonData, false);
    request.send(null);
    this.jsonToShow = JSON.parse(request.responseText);
}
  

  @wire(CurrentPageReference)
  getStateParameters(currentPageReference) {
      if (currentPageReference) {
          this.recidd = currentPageReference.attributes.recordId;
      } else {
        this.recidd = 0;
      }
  }


  @wire(getRecord, { recordId: "$recidd", fields: FIELDS })
  wiredRecord({ error, data }) {
    if (error) {
      this.showPageData = [];
    } else if (data) {
      this.case = data;
      this.accountID = this.case.fields.AccountId.value;
      this.email = this.case.fields.ContactEmail.value;
      console.log(this.email);
      
      let arry = [];
      for(var item of this.jsonToShow) {
        if (item.sfID == this.accountID) {
            let obj = {};
            obj.showPageID = item.showPageID;
            obj.name = item.name;
            obj.cluster = item.cluster;
            obj.showURL = buildURL(item.showPageID,item.cluster);
            arry.push(obj);
        }
    }
    this.showPageData = arry;
    this.dataLoaded = true;

    if (this.email != null) {
      findIsValid({ searchKey: this.email })
      .then((result) => {
        if (result.length == 1) {
          this.validEmail = result[0].Support_Contact__c;
        }
      })
      .catch((error) => {
          console.log('erro status -' + error);
      });
    }
    /*
    getNotes({ searchKey: this.accountID })
    .then((result) => {
      if (result.length == 1) {
        this.accountNotes = result[0].Notes__c;
      }
    })
    .catch((error) => {
        console.log('erro status -' + error);
    });*/



    }
  }



  toggleSection(event) {
    let currentsection = this.template.querySelector('[data-id="dropdown"]');
    if (currentsection.className.search('slds-is-open') == -1) {
      currentsection.className = 'slds-section slds-is-open';
    } else {
      currentsection.className = 'slds-section slds-is-close';
    }
  }
}

function buildURL(ID,cluster) {

    let url = "";
    switch(cluster) {
        case "Primary":
          url = "https://intellum.exceedlms.com/accounts/show/";
        break;
        case "EU":
          url = "https://admin.exceedlms.eu/accounts/show/";
        break;
        case "InternalGoogle":
          url = "https://google-admin.exceedlms.com/accounts/show/";
        break;
        case "InternalGoogle":
          url = "https://google-admin.exceedlms.com/accounts/show/";
        break;
        case "ExternalGoogle":
          url = "https://google-external-admin.exceedlms.com/accounts/show/";
        break;
        case "Facebook":
            url = "https://facebook-admin.exceedlms.com/accounts/show/";
        break;
        case "WM":
            url = "https://wm-admin.exceedlms.com/accounts/show/";
        break;
        case "Xero":
            url = "https://xero-admin.exceedlms.com/accounts/show/";
        break;
        case "Amazon":
            url = "https://amazon-admin.exceedlms.com/accounts/show/12";
        break;

        default:
            url = "URL NOT FOUND";
      }
      return url + ID;
}
