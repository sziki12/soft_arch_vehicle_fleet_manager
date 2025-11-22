import { Component, OnInit } from '@angular/core';
import { MainLayoutComponent } from "../../../layout/main-layout/main-layout.component";
import { CardComponent } from "../../../../shared/card/card.component";
import { InterfaceFormComponent } from "../interface-form/interface-form.component";
import { Interface } from '../../../models/interface.model';
import { InterfaceService } from '../../../services/interface.serice';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-interface-manager-page',
  imports: [MainLayoutComponent, CardComponent, InterfaceFormComponent, CommonModule],
  templateUrl: './interface-manager-page.component.html',
  styleUrl: './interface-manager-page.component.css',
  standalone: true,
})
export class InterfaceManagerPageComponent implements OnInit {
  interfaces: Interface[] = [];
  selectedInterface: Interface | null = null;
  loading = false;

  constructor(private interfaceService: InterfaceService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.interfaceService.getInterfaces().subscribe(data => {
      this.interfaces = data;
      this.loading = false;
    });
  }

  selectInterface(i: Interface) {

    this.selectedInterface = { ...i };
  }

  createNew() {

    this.selectedInterface = {
      interfaceId: 0,
      interfaceName: "",
      interfaceJson: "",
      manufacturerId: 0
    };
  }

  onDelete(id: number, event: Event) {
    event.stopPropagation();
    if (confirm('Biztos törlöd?')) {

      this.interfaceService.deleteInterface(id).subscribe(() => this.loadData());
    }
  }

  onSave(interfaceModel: Interface) {
    this.loading = true;
    this.interfaceService.saveInterface(interfaceModel).subscribe(() => {
      this.selectedInterface = null;
      this.loadData();
    });
  }
}