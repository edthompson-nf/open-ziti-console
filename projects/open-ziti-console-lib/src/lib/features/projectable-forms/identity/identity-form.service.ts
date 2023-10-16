import {Injectable} from "@angular/core";
import moment from 'moment';

import {isEmpty, unset, keys} from 'lodash';
import {ZitiDataService} from "../../../services/ziti-data.service";
import {GrowlerService} from "../../messaging/growler.service";
import {GrowlerModel} from "../../messaging/growler.model";
import {Identity} from "../../../models/identity";
import {SettingsService} from "../../../services/settings.service";

@Injectable({
    providedIn: 'root'
})
export class IdentityFormService {

    constructor(
        public settingsService: SettingsService,
        private zitiService: ZitiDataService,
        private growlerService: GrowlerService
    ) {}
 
    save(formData) {
        const isUpdate = !isEmpty(formData.id);
        const data: any = this.getIdentityDataModel(formData, isUpdate);
        const svc = isUpdate ? this.zitiService.patch.bind(this.zitiService) : this.zitiService.post.bind(this.zitiService);
        return svc('identities', data, formData.id).then((result) => {
            const growlerData = new GrowlerModel(
                'success',
                'Success',
                `Identity ${isUpdate ? 'Updated' : 'Created'}`,
                `Successfully ${isUpdate ? 'updated' : 'created'} Identity: ${formData.name}`,
            );
            this.growlerService.show(growlerData);
        }).catch((resp) => {
            let errorMessage;
            if (resp?.error?.error?.cause?.message) {
                errorMessage = resp?.error?.error?.cause?.message;
            } else if (resp?.error?.error?.cause?.reason) {
                errorMessage = resp?.error?.error?.cause?.reason;
            }else if (resp?.error?.message) {
                errorMessage = resp?.error?.message;
            } else {
                errorMessage = 'An unknown error occurred';
            }
            const growlerData = new GrowlerModel(
                'error',
                'Error',
                `Error Creating Identity`,
                errorMessage,
            );
            this.growlerService.show(growlerData);
            throw resp;
        })
    }

    getIdentityDataModel(formData, isUpdate) {
        const saveModel = new Identity();
        const modelProperties = keys(saveModel);
        modelProperties.forEach((prop) => {
            switch(prop) {
                case 'type':
                    if(isUpdate) {
                        saveModel[prop] = formData[prop].id;
                    } else {
                        saveModel[prop] = formData[prop];
                    }
                    break;
                case 'enrollment':
                    if(isUpdate) {
                        unset(saveModel, 'enrollment');
                    } else {
                        saveModel[prop] = formData[prop];
                    }
                    break;
                default:
                    saveModel[prop] = formData[prop];
            }
        });
        return saveModel;
    }

}