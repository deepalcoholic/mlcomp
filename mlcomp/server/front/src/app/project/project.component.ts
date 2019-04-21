import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { Project } from '../models';
import { ProjectService } from '../project.service';
import {MatSort, MatTableDataSource, MatPaginator} from '@angular/material';
import {Observable, of as observableOf, merge} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {map} from 'rxjs/operators';
import {startWith} from 'rxjs/operators';
import {switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: [ './project.component.css' ]
})
export class ProjectComponent implements OnInit {
  dataSource: MatTableDataSource<Project> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  change: EventEmitter<any> = new EventEmitter();

  displayedColumns: string[] = ['name', 'taskCount', 'lastActivity'];
  isLoadingResults = false;

  constructor(private projectService: ProjectService) { }

  ngOnInit() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.change)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.projectService.getProjects(
            this.sort.active?this.sort.active:'',
            this.sort.direction,
            this.paginator.pageIndex,
            this.dataSource.filter
          );
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;

          return data;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return observableOf([]);
        })
      ).subscribe(data => this.dataSource.data = data);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    this.change.emit();
  }
}