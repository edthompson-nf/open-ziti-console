import {Component, ComponentRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ConfigurationService} from "./configuration.service";
import {Subscription} from "rxjs";
import {SchemaService} from "../../../services/schema.service";
import {ProjectableForm} from "../projectable-form.class";

@Component({
    selector: 'lib-configuration',
    templateUrl: './configuration-form.component.html',
    styleUrls: ['./configuration-form.component.scss']
})
export class ConfigurationFormComponent extends ProjectableForm implements OnInit, OnDestroy {
    @ViewChild("dynamicform", {read: ViewContainerRef}) dynamicForm!: ViewContainerRef;
    @Input() override formData: any = {};
    @Input() override errors: { name: string, msg: string }[] = [];

    options: string[] = [];

    lColorArray = [
        'black',
        'white',
        'white',
    ]

    bColorArray = [
        '#33aaff',
        '#fafafa',
        '#33aaff',
    ]

    configType: string = '';
    editMode = false;
    items: any = [];
    subscription = new Subscription()

    constructor(private svc: ConfigurationService,
                private schemaSvc: SchemaService) {
        super();
    }

    async createForm() {
        this.clearForm();
        if (this.configType && this.dynamicForm) {
            const currentSchema = await this.svc.getSchema(this.configType);
            if (currentSchema) {
                this.render(currentSchema);
            }
        }
    }

    ngOnDestroy(): void {
        this.clearForm();
    }

     override clear() {
        this.configType = '';
        this.clearForm();
    }

    clearForm() {
        this.items.forEach((item: any) => {
            if (item?.component) item.component.destroy();
        });
        this.items = [];
        this.formData = {};
        if (this.subscription) this.subscription.unsubscribe();
    }

    render(schema: any) {
        if (schema.properties) {
            this.items = this.schemaSvc.render(schema, this.dynamicForm, this.lColorArray, this.bColorArray);
            for (let obj of this.items) {
                const cRef = obj.component;
                if (cRef?.instance.valueChange) {
                    const pName = cRef.instance.parentage;
                    if (pName && !this.formData[pName]) this.formData[pName] = {};
                    this.subscription.add(
                        cRef.instance.valueChange.subscribe((val: any) => {
                            this.setFormValue(cRef, val);
                        }));
                }
            }
        }
    }

    ngOnInit(): void {
        this.svc.getConfigTypes()
            .then(recs => {
                this.options = recs.map(r => r.name).sort();
            })
    }

    private setFormValue(cRef: ComponentRef<any>, val: any) {
        const pName = cRef.instance.parentage;
        const fName = cRef.instance.fieldName;
        if (pName && !this.formData[pName]) this.formData[pName] = {};
        if(fName === 'pap') {
            this.setSpecialFormValue(cRef, val, pName);
        } else {
            if (pName && !this.formData[pName]) this.formData[pName][fName] = val;
            else this.formData[fName] = val;
        }
    }

    private setSpecialFormValue(cRef: ComponentRef<any>, val: any, pName) {
        const lPrefix = cRef.instance.labelPrefix
        if (val.protocol) {
            const fieldName = lPrefix ? lPrefix.trim().toLowerCase() + 'protocol' : 'protocol'
            if (pName && !this.formData[pName]) this.formData[pName][fieldName] = val;
            else this.formData[fieldName] = val;
        }
        if (val.address) {
            const fieldName = lPrefix ? lPrefix.trim().toLowerCase() + 'address' : 'address'
            if (pName && !this.formData[pName]) this.formData[pName][fieldName] = val;
            else this.formData[fieldName] = val;
        }
        if (val.port) {
            const fieldName = lPrefix ? lPrefix.trim().toLowerCase() + 'port' : 'port'
            if (pName && !this.formData[pName]) this.formData[pName][fieldName] = val;
            else this.formData[fieldName] = val;
        }
    }
}
