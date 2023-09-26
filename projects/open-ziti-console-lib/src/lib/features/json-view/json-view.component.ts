import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input, OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import _ from 'lodash';
import {createAjvValidator, JSONEditor, Mode} from "vanilla-jsoneditor";

@Component({
  selector: 'lib-json-view',
  templateUrl: './json-view.component.html',
  styleUrls: ['./json-view.component.scss'],
})
export class JsonViewComponent implements AfterViewInit, OnChanges {

  @Input() data: any = {};
  @Input() schema: any = {};
  @Input() readOnly: boolean = false;
  @Input() jsonInvalid: boolean = false;
  @Output() dataChange: EventEmitter<any> = new EventEmitter();
  @Output() jsonChange: EventEmitter<any> = new EventEmitter();
  @Output() jsonInvalidChange: EventEmitter<any> = new EventEmitter();
  onChangeDebounced;
  schemaRefs: any;
  content: any;
  @ViewChild('editor', {static: false}) editorDiv!: ElementRef;
  validator: any;
  private editor: JSONEditor;
  private schemaDefinitions: any;

  constructor() {
    this.onChangeDebounced = _.debounce(this.onChange.bind(this), 400);
  }

  ngAfterViewInit() {
    if (this.schema) {
      this.validator = createAjvValidator({
        schema: this.schema,
        schemaDefinitions: this.schemaDefinitions,
        ajvOptions: {}
      });
    }
    this.content = {
      json: this.data
    };
    this.editor = new JSONEditor({
      target: this.editorDiv.nativeElement,
      props: {
        mode: Mode.text,
        validator: this.validator,
        content: this.content,
        onChange: (updatedContent, previousContent, {contentErrors, patchResult}) => {
          this.content = updatedContent
          if (this.content?.json) this.dataChange.emit(this.content.json);
        }
      }
    });
  }

  async onChange() {
    let newData;
    try {
      newData = this.editor.get();
    } catch (e) {
      console.log(e);
    }

    if (newData) {
      this.dataChange.emit(newData);
    }

    const errors = await this.validate(newData);
    if (!errors) {
      if (newData) {
        this.jsonChange.emit(newData);
      }
      this.jsonInvalidChange.emit(false);
    } else {
      this.jsonInvalidChange.emit(true);
      console.log(errors);
    }
  }

  public getData() {
    return this.editor.get();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['schema']) {
      this.schema = changes['schema'].currentValue;

      if(this.schema) {
        if (this.validator) {
          this.validator.schema = this.schema;
        } else {
          this.validator = createAjvValidator({
            schema: changes['schema'].currentValue,
            schemaDefinitions: this.schemaDefinitions,
            ajvOptions: {}
          });
        }
      }
    }
  }

  public validate(newData: any = undefined) {
    return this.editor.validate();
  }
}
