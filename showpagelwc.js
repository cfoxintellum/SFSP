import { LightningElement, wire, track } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import {CurrentPageReference} from 'lightning/navigation';
import jsonData from '@salesforce/resourceUrl/showpagejson';

const FIELDS = ["Case.AccountId"];
 
export default class LoadContact extends LightningElement {
  case;
  accountID;
  @track recidd;
  jsonToShow;
  showPageData;

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
      }
  }


  @wire(getRecord, { recordId: "$recidd", fields: FIELDS })
  wiredRecord({ error, data }) {
    if (error) {
      let message = "Unknown error";
      this.showPageData = [];
    } else if (data) {
      this.case = data;
      this.accountID = this.case.fields.AccountId.value;

      let arry = [];
      for(var item of this.jsonToShow) {
        if (item.sfID == this.accountID) {
            let obj = {};
            obj.showPageID = item.showPageID;
            obj.name = item.name;
            obj.showURL = buildURL(item.showPageID,item.cluster);
            arry.push(obj);
        }
    }
    this.showPageData = arry;
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