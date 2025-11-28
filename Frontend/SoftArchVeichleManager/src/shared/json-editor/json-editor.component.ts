import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface JsonEntry {
  key: string;
  value: string;
}

@Component({
  selector: 'app-json-editor',
  imports: [FormsModule, CommonModule],
  templateUrl: './json-editor.component.html',
  styleUrl: './json-editor.component.css'
})
export class JsonEditorComponent implements OnInit, OnChanges{
  ngOnChanges(changes: SimpleChanges): void {
    this.loadEntries();
  }
  ngOnInit(): void {
    this.loadEntries();
  }
@Input() json!: string;
@Output() save = new EventEmitter<string>();

entries: JsonEntry[] = [
    { key: 'name', value: 'Demo' },
    { key: 'version', value: '1.0' }
  ];

  addEntry(): void {
    this.entries.push({ key: '', value: '' });
    this.save.emit(JSON.stringify(this.jsonObject));
  }

  removeEntry(index: number): void {
    this.entries.splice(index, 1);
    this.save.emit(JSON.stringify(this.jsonObject));
  }

  loadEntries(): void {
    try {
      const obj = JSON.parse(this.json as string);
      this.entries = Object.entries(obj).map(([key, value]) => ({ key, value: String(value) }));
    } catch (e) {
      this.entries = [];
    }
  }

  get jsonObject(): Record<string, string> {
    const obj: Record<string, string> = {};
    for (const e of this.entries) {
      if (e.key?.trim()) {
        obj[e.key.trim()] = e.value;
      }
    }
    return obj;
  }

  trackByIndex(index: number): number {
    return index;
  }

  saveJson(): void {
    this.save.emit(JSON.stringify(this.jsonObject));
  }
}