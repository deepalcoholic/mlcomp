import {Component, OnInit, ViewChild, EventEmitter} from '@angular/core';
import {Dag} from '../models';
import {NameCount} from '../models';
import {DagService} from '../dag.service';
import {MatSort, MatTableDataSource, MatPaginator} from '@angular/material';
import {Observable, of as observableOf, merge} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {map} from 'rxjs/operators';
import {startWith} from 'rxjs/operators';
import {switchMap} from 'rxjs/operators';

@Component({
    selector: 'app-dag',
    templateUrl: './dag.component.html',
    styleUrls: ['./dag.component.css']
})
export class DagComponent implements OnInit {
    dataSource: MatTableDataSource<Dag> = new MatTableDataSource();

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    change: EventEmitter<any> = new EventEmitter();

    displayed_columns: string[] = ['id', 'name', 'task_count', 'created', 'last_activity', 'task_status'];
    isLoading_results = false;
    status_colors = {'not_ran':'gray', 'queued': 'lightblue', 'in_progress': 'lime',
        'failed': 'red', 'stopped': 'purple', 'skipped': 'orange', 'success': 'green'
    };
    constructor(private dag_service: DagService) {
    }

    ngOnInit() {
        // If the user changes the sort order, reset back to the first page.
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

        merge(this.sort.sortChange, this.paginator.page, this.change)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.isLoading_results = true;
                    return this.dag_service.getDags(
                        this.sort.active ? this.sort.active : '',
                        this.sort.direction?this.sort.direction == 'desc':true,
                        this.paginator.pageIndex,
                        this.paginator.pageSize?this.paginator.pageSize: 10,
                        this.dataSource.filter,
                        null
                    );
                }),
                map(data => {
                    // Flip flag to show that loading has finished.
                    this.isLoading_results = false;

                    return data;
                }),
                catchError(() => {
                    this.isLoading_results = false;
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

    colorForTaskStatus(name: string, count: number) {
        return count>0?this.status_colors[name]:'gainsboro'
    }

    status_click(status: NameCount) {
        alert(status.name);
    }
}
