import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-editor',
  imports: [FormsModule, CommonModule],
  templateUrl: './list-editor.component.html',
  styleUrl: './list-editor.component.css'
})
export class ListEditorComponent implements OnInit, OnChanges{
  ngOnChanges(changes: SimpleChanges): void {
    this.loadEntries();
  }
  ngOnInit(): void {
    this.loadEntries();
  }
@Input() list!: string[];
@Output() save = new EventEmitter<string[]>();

entries: string[] = [];

  addEntry(): void {
    this.entries.push("");
    this.save.emit(this.entries);
  }

  removeEntry(index: number): void {
    this.entries.splice(index, 1);
    this.save.emit(this.entries);
  }

  loadEntries(): void {
    try {
      this.entries = [...(this.list || [])];
    } catch (e) {
      this.entries = [];
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  saveList(): void {
    this.save.emit(this.entries);
  }
}